import type { DomainEventId, SessionId } from "../domain/ids";
import { validateSessionCommandEnvelopeShape } from "./schema";
import type {
  SessionCommandEnvelope,
  SessionCommandPolicy,
  SessionCommandRejectionCode,
  SessionCommandResult,
  SessionEventEnvelope,
  SessionPhase,
  SessionRuntime,
  SessionRuntimeDescriptor,
} from "./types";

export interface InMemorySessionRuntimeOptions {
  sessionId: SessionId;
  initialPhase: SessionPhase;
  commandPolicies: SessionCommandPolicy[];
  now: () => Date;
  createEventId: () => DomainEventId;
}

export class InMemorySessionRuntime implements SessionRuntime {
  readonly sessionId: SessionId;
  private phase: SessionPhase;
  private stateVersion = 0;
  private readonly idempotencyResults = new Map<string, SessionCommandResult>();
  private readonly commandPolicies: SessionCommandPolicy[];

  constructor(private readonly options: InMemorySessionRuntimeOptions) {
    this.sessionId = options.sessionId;
    this.phase = options.initialPhase;
    this.commandPolicies = options.commandPolicies;
  }

  getDescriptor(): SessionRuntimeDescriptor {
    return {
      sessionId: this.sessionId,
      protocolVersion: "1.0",
      stateVersion: this.stateVersion,
      phase: this.phase,
      commandPolicies: [...this.commandPolicies],
    };
  }

  setPhase(phase: SessionPhase): void {
    this.phase = phase;
  }

  submit(command: SessionCommandEnvelope): SessionCommandResult {
    const shapeResult = validateSessionCommandEnvelopeShape(command);
    if (!shapeResult.valid) {
      return this.reject(command, "INVALID_ENVELOPE");
    }
    if (command.protocolVersion !== "1.0") {
      return this.reject(command, "UNSUPPORTED_PROTOCOL_VERSION");
    }
    if (command.sessionId !== this.sessionId) {
      return this.reject(command, "WRONG_SESSION");
    }
    if (this.idempotencyResults.has(command.idempotencyKey)) {
      const prior = this.idempotencyResults.get(command.idempotencyKey);
      return { ...prior!, status: "DUPLICATE", events: prior!.events.map((event) => ({ ...event })) };
    }
    if (command.expectedStateVersion !== undefined && command.expectedStateVersion < this.stateVersion) {
      return this.reject(command, "STALE_STATE");
    }

    const policy = this.commandPolicies.find((candidate) => candidate.commandType === command.commandType);
    if (!policy) {
      return this.reject(command, "UNKNOWN_COMMAND");
    }
    if (this.isNonSemanticCommand(command.commandType, command.payload)) {
      return this.reject(command, "NON_SEMANTIC_COMMAND");
    }
    if (!policy.allowedRoles.includes(command.actor.role)) {
      return this.reject(command, "UNAUTHORIZED_ACTOR");
    }
    if (!policy.allowedPhases.includes(this.phase)) {
      return this.reject(command, "INVALID_PHASE");
    }

    this.stateVersion += 1;
    const event: SessionEventEnvelope = {
      contractVersion: "session-runtime-event.v1",
      protocolVersion: "1.0",
      eventId: this.options.createEventId(),
      sessionId: this.sessionId,
      commandId: command.commandId,
      correlationId: command.correlationId,
      actor: command.actor,
      eventType: `${command.commandType}.accepted`,
      payload: command.payload,
      stateVersion: this.stateVersion,
      occurredAt: this.options.now().toISOString(),
    };
    const result: SessionCommandResult = {
      commandId: command.commandId,
      status: "ACCEPTED",
      stateVersion: this.stateVersion,
      events: [event],
    };
    this.idempotencyResults.set(command.idempotencyKey, result);
    return result;
  }

  private reject(command: Pick<SessionCommandEnvelope, "commandId">, reasonCode: SessionCommandRejectionCode): SessionCommandResult {
    return {
      commandId: command.commandId,
      status: "REJECTED",
      stateVersion: this.stateVersion,
      reasonCode,
      events: [],
    };
  }

  private isNonSemanticCommand(commandType: string, payload: unknown): boolean {
    if (commandType.startsWith("ui.") || commandType.startsWith("transport.") || commandType.startsWith("database.")) {
      return true;
    }
    if (!payload || typeof payload !== "object") return false;
    const keys = Object.keys(payload);
    return keys.some((key) => ["x", "y", "clientX", "clientY", "screenX", "screenY"].includes(key));
  }
}
