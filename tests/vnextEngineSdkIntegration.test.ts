import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import {
  createEngineAdapterFixture,
  createEngineCommandEnvelope,
  dispatchEngineCommand,
  DuplicateInputActionError,
  DuplicateRendererContributionError,
  InputActionRegistry,
  InvalidEngineCommandError,
  RendererContributionRegistry,
  UnauthorizedEngineCommandError,
  type ActorContext,
  type EngineFactory,
  type EngineInstance,
  type EngineSnapshot,
  type EngineTransition,
  type ProjectionViewer,
  type SemanticEngineCommand,
} from "../src/vnext/engineSdk";

interface SecretState {
  secretAnswer: string;
  publicClue: string;
  guesses: string[];
}

type SecretCommand = SemanticEngineCommand<{ guess: string }>;
type SecretEvent = { type: "guessAccepted"; guess: string; correct: boolean };
type SecretProjection =
  | { viewer: "host"; publicClue: string; secretAnswer: string; guesses: string[] }
  | { viewer: "stage" | "player"; publicClue: string; guesses: string[] };

function makeEnvelopeContext() {
  let commandIndex = 0;
  let eventIndex = 0;
  return {
    sessionId: asId<"SessionId">("session-448"),
    engineId: "reference.secret-question",
    capability: "reference.secret-question",
    now: () => new Date("2026-09-29T12:00:00.000Z"),
    createCommandId: () => asId<"CommandId">(`command-${++commandIndex}`),
    createEventId: () => asId<"DomainEventId">(`event-${++eventIndex}`),
  };
}

function makeSecretQuestionFactory(): EngineFactory<Record<string, never>, SecretState, SecretCommand, SecretEvent, SecretProjection> {
  const makeInstance = (state: SecretState): EngineInstance<SecretState, SecretCommand, SecretEvent, SecretProjection> => ({
    handleCommand(command, actor): EngineTransition<SecretState, SecretEvent> {
      if (actor.role !== "player") {
        throw new UnauthorizedEngineCommandError("Only players may submit guesses.");
      }
      if (command.type !== "secretQuestion.submitGuess" || typeof command.payload.guess !== "string") {
        throw new InvalidEngineCommandError(`Invalid command type "${command.type}".`);
      }

      const guess = command.payload.guess.trim();
      const next = { ...state, guesses: [...state.guesses, guess] };
      state.guesses = next.guesses;
      return {
        state: next,
        events: [{ type: "guessAccepted", guess, correct: guess.toLowerCase() === state.secretAnswer.toLowerCase() }],
      };
    },
    getProjection(viewer: ProjectionViewer): SecretProjection {
      if (viewer.role === "host") {
        return { viewer: "host", publicClue: state.publicClue, secretAnswer: state.secretAnswer, guesses: state.guesses };
      }

      return { viewer: viewer.role === "stage" ? "stage" : "player", publicClue: state.publicClue, guesses: state.guesses };
    },
    snapshot(): EngineSnapshot<SecretState> {
      return {
        engineId: "reference.secret-question",
        engineVersion: "1.0.0",
        stateSchemaVersion: 1,
        state: { ...state, guesses: [...state.guesses] },
      };
    },
    dispose: () => undefined,
  });

  return {
    descriptor: {
      engineId: "reference.secret-question",
      version: "1.0.0",
      provides: [{ capability: "reference.secret-question", version: "1.0.0" }],
      traits: ["DETERMINISTIC", "STAGE_RENDERABLE", "CONTROLLER_INTERACTIVE"],
      stateSchemaVersion: 1,
    },
    create: () => makeInstance({ secretAnswer: "Moses", publicClue: "Led Israel out of Egypt", guesses: [] }),
    restore: (snapshot) => makeInstance({ ...snapshot.state, guesses: [...snapshot.state.guesses] }),
  };
}

describe("Engine SDK integration envelopes and privacy (#448)", () => {
  it("dispatches command envelopes into event envelopes and viewer-aware projections without exposing state", () => {
    const factory = makeSecretQuestionFactory();
    const instance = factory.create({}, {
      sessionId: asId("session-448"),
      rng: () => 0,
      now: () => new Date("2026-09-29T12:00:00.000Z"),
      resolveCapability: () => undefined,
      publishEvent: () => undefined,
      diagnostics: { info: () => undefined, warn: () => undefined, error: () => undefined },
    });
    const context = makeEnvelopeContext();
    const command = createEngineCommandEnvelope(
      context,
      { actorId: asId("participant-1"), role: "player" },
      { type: "secretQuestion.submitGuess", payload: { guess: "Aaron" } },
    );

    const events = dispatchEngineCommand(instance, command, context);

    expect(events).toEqual([
      {
        envelopeVersion: "engine-event.v1",
        eventId: "event-1",
        commandId: "command-1",
        sessionId: "session-448",
        engineId: "reference.secret-question",
        capability: "reference.secret-question",
        event: { type: "guessAccepted", guess: "Aaron", correct: false },
        occurredAt: "2026-09-29T12:00:00.000Z",
      },
    ]);

    const stageProjection = instance.getProjection({ role: "stage" });
    const playerProjection = instance.getProjection({ role: "player", viewerId: asId("participant-1") });
    const hostProjection = instance.getProjection({ role: "host" });

    expect(JSON.stringify(stageProjection)).not.toContain("Moses");
    expect(JSON.stringify(playerProjection)).not.toContain("secretAnswer");
    expect(hostProjection).toEqual({
      viewer: "host",
      publicClue: "Led Israel out of Egypt",
      secretAnswer: "Moses",
      guesses: ["Aaron"],
    });
  });

  it("rejects invalid and unauthorized commands before hidden state can leak", () => {
    const instance = makeSecretQuestionFactory().create({}, {
      sessionId: asId("session-448"),
      rng: () => 0,
      now: () => new Date("2026-09-29T12:00:00.000Z"),
      resolveCapability: () => undefined,
      publishEvent: () => undefined,
      diagnostics: { info: () => undefined, warn: () => undefined, error: () => undefined },
    });
    const context = makeEnvelopeContext();

    const hostEnvelope = createEngineCommandEnvelope(
      context,
      { actorId: "host", role: "host" },
      { type: "secretQuestion.submitGuess", payload: { guess: "Moses" } },
    );
    expect(() => dispatchEngineCommand(instance, hostEnvelope, context)).toThrow(UnauthorizedEngineCommandError);

    const invalidEnvelope = createEngineCommandEnvelope(
      context,
      { actorId: asId("participant-1"), role: "player" },
      { type: "secretQuestion.revealAnswer", payload: { guess: "Moses" } },
    );
    expect(() => dispatchEngineCommand(instance, invalidEnvelope, context)).toThrow(InvalidEngineCommandError);
  });
});

describe("InputAction and renderer contribution registries (#448)", () => {
  it("maps semantic input actions to commands and enforces actor roles", () => {
    const registry = new InputActionRegistry();
    registry.registerAction({
      actionId: "secretQuestion.submitGuess",
      capability: "reference.secret-question",
      commandType: "secretQuestion.submitGuess",
      allowedRoles: ["player"],
    });

    const command = registry.createCommand(
      "secretQuestion.submitGuess",
      { actorId: asId("participant-1"), role: "player" },
      { guess: "Moses" },
    );

    expect(command).toEqual({ type: "secretQuestion.submitGuess", payload: { guess: "Moses" } });
    expect(() =>
      registry.createCommand("secretQuestion.submitGuess", { actorId: "host", role: "host" }, { guess: "Moses" }),
    ).toThrow(UnauthorizedEngineCommandError);
    expect(() =>
      registry.registerAction({
        actionId: "secretQuestion.submitGuess",
        capability: "reference.secret-question",
        commandType: "secretQuestion.submitGuess",
        allowedRoles: ["player"],
      }),
    ).toThrow(DuplicateInputActionError);
  });

  it("looks up renderer contributions by capability and surface without game-specific branches", () => {
    const registry = new RendererContributionRegistry();
    registry.registerContribution({
      contributionId: "secret-question.stage",
      capability: "reference.secret-question",
      surface: "stage",
      projectionType: "secretQuestion.public",
      rendererId: "ReferenceSecretQuestionStage",
      version: "1.0.0",
    });
    registry.registerContribution({
      contributionId: "secret-question.controller",
      capability: "reference.secret-question",
      surface: "controller",
      projectionType: "secretQuestion.player",
      rendererId: "ReferenceSecretQuestionController",
      version: "1.0.0",
    });

    expect(registry.findContribution({ capability: "reference.secret-question", surface: "stage" })?.rendererId).toBe(
      "ReferenceSecretQuestionStage",
    );
    expect(
      registry.findContribution({
        capability: "reference.secret-question",
        surface: "controller",
        contributionId: "secret-question.controller",
      })?.projectionType,
    ).toBe("secretQuestion.player");
    expect(() =>
      registry.registerContribution({
        contributionId: "secret-question.stage",
        capability: "reference.secret-question",
        surface: "stage",
        projectionType: "secretQuestion.public",
        rendererId: "OtherRenderer",
        version: "1.0.0",
      }),
    ).toThrow(DuplicateRendererContributionError);
  });
});

describe("Local and Shared adapter fixtures (#448)", () => {
  it("use the same command/event/projection envelopes across transport modes", () => {
    const factory = makeSecretQuestionFactory();
    const context = makeEnvelopeContext();
    const local = createEngineAdapterFixture(
      "LOCAL",
      factory.create({}, {
        sessionId: asId("session-448"),
        rng: () => 0,
        now: () => new Date("2026-09-29T12:00:00.000Z"),
        resolveCapability: () => undefined,
        publishEvent: () => undefined,
        diagnostics: { info: () => undefined, warn: () => undefined, error: () => undefined },
      }),
      context,
    );
    const shared = createEngineAdapterFixture(
      "SHARED",
      factory.create({}, {
        sessionId: asId("session-448"),
        rng: () => 0,
        now: () => new Date("2026-09-29T12:00:00.000Z"),
        resolveCapability: () => undefined,
        publishEvent: () => undefined,
        diagnostics: { info: () => undefined, warn: () => undefined, error: () => undefined },
      }),
      context,
    );
    const actor: ActorContext = { actorId: asId("participant-1"), role: "player" };

    const localEvents = local.submitCommand(
      createEngineCommandEnvelope(context, actor, { type: "secretQuestion.submitGuess", payload: { guess: "Aaron" } }),
    );
    const sharedEvents = shared.submitCommand(
      createEngineCommandEnvelope(context, actor, { type: "secretQuestion.submitGuess", payload: { guess: "Aaron" } }),
    );

    expect(local.mode).toBe("LOCAL");
    expect(shared.mode).toBe("SHARED");
    expect(localEvents[0].event).toEqual(sharedEvents[0].event);
    expect(local.project({ role: "stage" })).toEqual(shared.project({ role: "stage" }));
  });
});
