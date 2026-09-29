import type { EngineCommandEnvelope, EngineEventEnvelope, EngineInstance, ProjectionViewer } from "./types";
import { dispatchEngineCommand } from "./integration";

export type EngineAdapterMode = "LOCAL" | "SHARED";

export interface EngineAdapterFixture<State, Command, Event, Projection> {
  mode: EngineAdapterMode;
  submitCommand(envelope: EngineCommandEnvelope<Command>): EngineEventEnvelope<Event>[];
  project(viewer: ProjectionViewer): Projection;
}

/**
 * Local and Shared adapters intentionally exchange the same logical command,
 * event and projection envelopes. Transport details stay outside engine code.
 */
export function createEngineAdapterFixture<State, Command, Event, Projection>(
  mode: EngineAdapterMode,
  instance: EngineInstance<State, Command, Event, Projection>,
  eventContext: Parameters<typeof dispatchEngineCommand<State, Command, Event, Projection>>[2],
): EngineAdapterFixture<State, Command, Event, Projection> {
  return {
    mode,
    submitCommand: (envelope) => dispatchEngineCommand(instance, envelope, eventContext),
    project: (viewer) => instance.getProjection(viewer),
  };
}
