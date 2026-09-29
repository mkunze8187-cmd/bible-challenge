import type { CommandId, DomainEventId, SessionId } from "../domain/ids";
import type {
  ActorContext,
  EngineCommandEnvelope,
  EngineEventEnvelope,
  EngineInstance,
  ProjectionViewer,
} from "./types";

export interface EngineEnvelopeContext {
  sessionId: SessionId;
  engineId: string;
  capability: string;
  now: () => Date;
  createCommandId: () => CommandId;
  createEventId: () => DomainEventId;
}

export function createEngineCommandEnvelope<Command>(
  context: EngineEnvelopeContext,
  actor: ActorContext,
  command: Command,
): EngineCommandEnvelope<Command> {
  return {
    envelopeVersion: "engine-command.v1",
    commandId: context.createCommandId(),
    sessionId: context.sessionId,
    engineId: context.engineId,
    capability: context.capability,
    actor,
    command,
    issuedAt: context.now().toISOString(),
  };
}

export function dispatchEngineCommand<State, Command, Event, Projection>(
  instance: EngineInstance<State, Command, Event, Projection>,
  envelope: EngineCommandEnvelope<Command>,
  context: Pick<EngineEnvelopeContext, "now" | "createEventId">,
): EngineEventEnvelope<Event>[] {
  const transition = instance.handleCommand(envelope.command, envelope.actor);
  return transition.events.map((event) => ({
    envelopeVersion: "engine-event.v1",
    eventId: context.createEventId(),
    commandId: envelope.commandId,
    sessionId: envelope.sessionId,
    engineId: envelope.engineId,
    capability: envelope.capability,
    event,
    occurredAt: context.now().toISOString(),
  }));
}

export function getViewerProjection<Projection>(
  instance: EngineInstance<unknown, unknown, unknown, Projection>,
  viewer: ProjectionViewer,
): Projection {
  return instance.getProjection(viewer);
}
