import type {
  ActorContext,
  EngineContext,
  EngineFactory,
  EngineInstance,
  EngineSnapshot,
  EngineTransition,
  ProjectionViewer,
  SemanticEngineCommand,
} from "../index";
import { InvalidEngineCommandError, UnauthorizedEngineCommandError } from "../index";

export interface ReferenceEngineState {
  secretAnswer: string;
  submissionsByParticipant: Record<string, number>;
  processedKeys: string[];
}

export type ReferenceEngineCommand = SemanticEngineCommand<{
  participantId: string;
  value: number;
  idempotencyKey: string;
}>;

export interface ReferenceEngineEvent {
  type: "reference.submitted";
  participantId: string;
  value: number;
  total: number;
  idempotencyKey: string;
}

export type ReferenceEngineProjection =
  | { viewer: "host"; secretAnswer: string; totals: Record<string, number> }
  | { viewer: "stage"; totals: Record<string, number> }
  | { viewer: "player"; ownTotal: number };

export function createReferenceEngineFactory(): EngineFactory<
  Record<string, never>,
  ReferenceEngineState,
  ReferenceEngineCommand,
  ReferenceEngineEvent,
  ReferenceEngineProjection
> {
  return {
    descriptor: {
      engineId: "reference.conformance",
      version: "1.0.0",
      provides: [{ capability: "reference.conformance", version: "1.0.0" }],
      traits: [
        "DETERMINISTIC",
        "SERIALIZABLE",
        "REPLAYABLE",
        "MULTIPLAYER",
        "STAGE_RENDERABLE",
        "CONTROLLER_INTERACTIVE",
      ],
      stateSchemaVersion: 1,
    },
    create: () =>
      makeInstance({
        secretAnswer: "hidden-reference-answer",
        submissionsByParticipant: {},
        processedKeys: [],
      }),
    restore: (snapshot) =>
      makeInstance({
        secretAnswer: snapshot.state.secretAnswer,
        submissionsByParticipant: { ...snapshot.state.submissionsByParticipant },
        processedKeys: [...snapshot.state.processedKeys],
      }),
    replay: (events) => {
      const state: ReferenceEngineState = {
        secretAnswer: "hidden-reference-answer",
        submissionsByParticipant: {},
        processedKeys: [],
      };
      for (const event of events) {
        state.submissionsByParticipant[event.participantId] = event.total;
        state.processedKeys.push(event.idempotencyKey);
      }
      return makeInstance(state);
    },
  };
}

function makeInstance(
  state: ReferenceEngineState,
): EngineInstance<ReferenceEngineState, ReferenceEngineCommand, ReferenceEngineEvent, ReferenceEngineProjection> {
  return {
    handleCommand(command, actor): EngineTransition<ReferenceEngineState, ReferenceEngineEvent> {
      if (actor.role !== "player") {
        throw new UnauthorizedEngineCommandError("Only players may submit reference engine commands.");
      }
      if (command.type !== "reference.submit") {
        throw new InvalidEngineCommandError(`Invalid reference engine command "${command.type}".`);
      }
      if (actor.actorId !== command.payload.participantId) {
        throw new UnauthorizedEngineCommandError("Players may only submit commands for their own participant.");
      }
      if (state.processedKeys.includes(command.payload.idempotencyKey)) {
        return { state: cloneState(state), events: [] };
      }

      const current = state.submissionsByParticipant[command.payload.participantId] ?? 0;
      const total = current + command.payload.value;
      state.submissionsByParticipant[command.payload.participantId] = total;
      state.processedKeys.push(command.payload.idempotencyKey);

      return {
        state: cloneState(state),
        events: [
          {
            type: "reference.submitted",
            participantId: command.payload.participantId,
            value: command.payload.value,
            total,
            idempotencyKey: command.payload.idempotencyKey,
          },
        ],
      };
    },
    getProjection(viewer: ProjectionViewer): ReferenceEngineProjection {
      if (viewer.role === "host") {
        return {
          viewer: "host",
          secretAnswer: state.secretAnswer,
          totals: { ...state.submissionsByParticipant },
        };
      }
      if (viewer.role === "stage") {
        return { viewer: "stage", totals: { ...state.submissionsByParticipant } };
      }

      return {
        viewer: "player",
        ownTotal: viewer.viewerId ? state.submissionsByParticipant[viewer.viewerId] ?? 0 : 0,
      };
    },
    snapshot(): EngineSnapshot<ReferenceEngineState> {
      return {
        engineId: "reference.conformance",
        engineVersion: "1.0.0",
        stateSchemaVersion: 1,
        state: cloneState(state),
      };
    },
    dispose: () => undefined,
  };
}

function cloneState(state: ReferenceEngineState): ReferenceEngineState {
  return {
    secretAnswer: state.secretAnswer,
    submissionsByParticipant: { ...state.submissionsByParticipant },
    processedKeys: [...state.processedKeys],
  };
}
