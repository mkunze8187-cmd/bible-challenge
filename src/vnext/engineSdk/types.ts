/**
 * Agon vNext Engine SDK foundational contracts (#447).
 *
 * Engines are reusable mechanics/capabilities. SessionRuntime hosts them
 * through this lifecycle instead of importing concrete engine implementations.
 */

import type { CommandId, DomainEventId, ParticipantId, SessionId } from "../domain/ids";

export type EngineTrait =
  | "DETERMINISTIC"
  | "SERIALIZABLE"
  | "REPLAYABLE"
  | "MULTIPLAYER"
  | "STAGE_RENDERABLE"
  | "CONTROLLER_INTERACTIVE"
  | "AI_PLAYABLE";

export interface EngineCapability {
  capability: string;
  version: string;
}

export interface CapabilityRequirement {
  capability: string;
  versionRange: string;
  optional?: boolean;
}

export interface EngineDescriptor {
  engineId: string;
  version: string;
  provides: EngineCapability[];
  requires?: CapabilityRequirement[];
  traits: EngineTrait[];
  stateSchemaVersion?: number;
}

export interface ActorContext {
  actorId: ParticipantId | "host" | "system";
  role: "player" | "host" | "system";
}

export interface ProjectionViewer {
  viewerId?: ParticipantId;
  role: "player" | "host" | "stage" | "system";
}

export interface EngineSnapshot<State = unknown> {
  engineId: string;
  engineVersion: string;
  stateSchemaVersion?: number;
  state: State;
}

export interface EngineTransition<State = unknown, Event = unknown> {
  state: State;
  events: Event[];
}

export interface EngineCommandEnvelope<Command = unknown> {
  envelopeVersion: "engine-command.v1";
  commandId: CommandId;
  sessionId: SessionId;
  engineId: string;
  capability: string;
  actor: ActorContext;
  command: Command;
  issuedAt: string;
}

export interface EngineEventEnvelope<Event = unknown> {
  envelopeVersion: "engine-event.v1";
  eventId: DomainEventId;
  commandId?: CommandId;
  sessionId: SessionId;
  engineId: string;
  capability: string;
  event: Event;
  occurredAt: string;
}

export interface EngineDiagnostics {
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
  error(message: string, details?: Record<string, unknown>): void;
}

export interface EngineContext {
  sessionId: SessionId;
  rng: () => number;
  now: () => Date;
  resolveCapability(requirement: CapabilityRequirement): ResolvedEngineCapability | undefined;
  publishEvent(event: unknown): void;
  diagnostics: EngineDiagnostics;
}

export interface EngineInstance<State = unknown, Command = unknown, Event = unknown, Projection = unknown> {
  handleCommand(command: Command, actor: ActorContext): EngineTransition<State, Event>;
  getProjection(viewer: ProjectionViewer): Projection;
  snapshot(): EngineSnapshot<State>;
  dispose(): void;
}

export interface EngineFactory<Config = unknown, State = unknown, Command = unknown, Event = unknown, Projection = unknown> {
  descriptor: EngineDescriptor;
  create(config: Config, context: EngineContext): EngineInstance<State, Command, Event, Projection>;
  restore(
    snapshot: EngineSnapshot<State>,
    context: EngineContext,
  ): EngineInstance<State, Command, Event, Projection>;
  replay?(
    events: Event[],
    config: Config,
    context: EngineContext,
  ): EngineInstance<State, Command, Event, Projection>;
}

export interface ResolvedEngineCapability {
  descriptor: EngineDescriptor;
  capability: EngineCapability;
  factory: EngineFactory;
}

export interface CapabilityResolution {
  required: ResolvedEngineCapability[];
  optional: ResolvedEngineCapability[];
  missingOptional: CapabilityRequirement[];
}

export class UnknownCapabilityError extends Error {
  constructor(public readonly requirement: CapabilityRequirement) {
    super(`No engine provides capability "${requirement.capability}" matching "${requirement.versionRange}".`);
    this.name = "UnknownCapabilityError";
  }
}

export class DuplicateEngineError extends Error {
  constructor(
    public readonly engineId: string,
    public readonly version: string,
  ) {
    super(`Engine "${engineId}" version "${version}" is already registered.`);
    this.name = "DuplicateEngineError";
  }
}

export class DuplicateCapabilityProviderError extends Error {
  constructor(
    public readonly capability: string,
    public readonly version: string,
  ) {
    super(`Capability "${capability}" version "${version}" is already provided by another engine.`);
    this.name = "DuplicateCapabilityProviderError";
  }
}

export class InvalidEngineDescriptorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidEngineDescriptorError";
  }
}

export class InvalidEngineCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidEngineCommandError";
  }
}

export class UnauthorizedEngineCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedEngineCommandError";
  }
}
