import type { CommandId, DomainEventId, EndpointId, ParticipantId, SessionId, SiteId, TeamId } from "../domain/ids";

export type SessionRuntimeProtocolVersion = "1.0";
export type SessionPhase = "setup" | "active" | "paused" | "completed";
export type SessionActorRole = "player" | "team" | "host" | "admin" | "system";
export type CommandResultStatus = "ACCEPTED" | "REJECTED" | "DUPLICATE";

export interface SessionActorRef {
  role: SessionActorRole;
  actorId: ParticipantId | TeamId | "host" | "admin" | "system";
  participantId?: ParticipantId;
  teamId?: TeamId;
  siteId?: SiteId;
}

export interface SessionCommandEnvelope<Payload = unknown> {
  contractVersion: "session-runtime-command.v1";
  protocolVersion: SessionRuntimeProtocolVersion;
  commandId: CommandId;
  sessionId: SessionId;
  actor: SessionActorRef;
  endpointId?: EndpointId;
  siteId?: SiteId;
  correlationId: string;
  idempotencyKey: string;
  commandType: string;
  payload: Payload;
  expectedStateVersion?: number;
  clientObservedAt?: string;
}

export interface SessionEventEnvelope<Payload = unknown> {
  contractVersion: "session-runtime-event.v1";
  protocolVersion: SessionRuntimeProtocolVersion;
  eventId: DomainEventId;
  sessionId: SessionId;
  commandId: CommandId;
  correlationId: string;
  actor: SessionActorRef;
  eventType: string;
  payload: Payload;
  stateVersion: number;
  occurredAt: string;
}

export interface SessionCommandResult {
  commandId: CommandId;
  status: CommandResultStatus;
  stateVersion: number;
  events: SessionEventEnvelope[];
  reasonCode?: SessionCommandRejectionCode;
}

export type SessionCommandRejectionCode =
  | "INVALID_ENVELOPE"
  | "UNSUPPORTED_PROTOCOL_VERSION"
  | "WRONG_SESSION"
  | "UNKNOWN_COMMAND"
  | "NON_SEMANTIC_COMMAND"
  | "UNAUTHORIZED_ACTOR"
  | "INVALID_PHASE"
  | "STALE_STATE";

export interface SessionCommandPolicy {
  commandType: string;
  allowedRoles: SessionActorRole[];
  allowedPhases: SessionPhase[];
}

export interface SessionRuntimeDescriptor {
  sessionId: SessionId;
  protocolVersion: SessionRuntimeProtocolVersion;
  stateVersion: number;
  phase: SessionPhase;
  commandPolicies: SessionCommandPolicy[];
}

export interface SessionRuntime {
  readonly sessionId: SessionId;
  getDescriptor(): SessionRuntimeDescriptor;
  submit(command: SessionCommandEnvelope): SessionCommandResult;
}

export const semanticCommandExamples = {
  submitAnswer: {
    commandType: "challenge.submitAnswer",
    payload: { answer: "Moses" },
  },
  buzz: {
    commandType: "buzzer.buzz",
    payload: { promptId: "prompt-1" },
  },
  choose: {
    commandType: "choice.choose",
    payload: { optionId: "option-a" },
  },
  draw: {
    commandType: "cards.draw",
    payload: { deckId: "main" },
  },
  roll: {
    commandType: "dice.roll",
    payload: { dice: 2, sides: 6 },
  },
  reveal: {
    commandType: "clue.reveal",
    payload: { clueId: "clue-1" },
  },
} as const;
