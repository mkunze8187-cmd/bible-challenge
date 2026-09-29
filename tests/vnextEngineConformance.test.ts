import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import {
  InvalidEngineCommandError,
  UnauthorizedEngineCommandError,
  createReferenceEngineFactory,
  type EngineContext,
  type EngineFactory,
  type ReferenceEngineCommand,
  type ReferenceEngineEvent,
  type ReferenceEngineProjection,
  type ReferenceEngineState,
} from "../src/vnext/engineSdk";
import { describeEngineConformanceSuite, runEngineConformanceChecks } from "./helpers/engineConformance";

function createContext(): EngineContext {
  return {
    sessionId: asId("conformance-session"),
    rng: () => 0,
    now: () => new Date("2026-09-29T12:00:00.000Z"),
    resolveCapability: () => undefined,
    publishEvent: () => undefined,
    diagnostics: { info: () => undefined, warn: () => undefined, error: () => undefined },
  };
}

function createHarness(factory: EngineFactory<Record<string, never>, ReferenceEngineState, ReferenceEngineCommand, ReferenceEngineEvent, ReferenceEngineProjection>) {
  return {
    factory,
    config: {},
    createContext,
    validCommand: {
      type: "reference.submit",
      payload: { participantId: "participant-1", value: 2, idempotencyKey: "valid-1" },
    },
    duplicateCommand: {
      type: "reference.submit",
      payload: { participantId: "participant-1", value: 2, idempotencyKey: "duplicate-1" },
    },
    invalidCommand: {
      type: "reference.invalid",
      payload: { participantId: "participant-1", value: 2, idempotencyKey: "invalid-1" },
    },
    authorizedActor: { actorId: asId<"ParticipantId">("participant-1"), role: "player" as const },
    unauthorizedActor: { actorId: "host" as const, role: "host" as const },
    hostViewer: { role: "host" as const },
    stageViewer: { role: "stage" as const },
    playerViewer: { role: "player" as const, viewerId: asId<"ParticipantId">("participant-1") },
    otherPlayerViewer: { role: "player" as const, viewerId: asId<"ParticipantId">("participant-2") },
    hiddenStateToken: "hidden-reference-answer",
    inputAction: {
      actionId: "reference.submit",
      capability: "reference.conformance",
      commandType: "reference.submit",
      allowedRoles: ["player" as const],
    },
    rendererContribution: {
      contributionId: "reference.conformance.stage",
      capability: "reference.conformance",
      surface: "stage" as const,
      projectionType: "reference.conformance.stage",
      rendererId: "ReferenceConformanceStage",
      version: "1.0.0",
    },
    packageManifest: {
      manifestVersion: "engine-package-manifest.v1" as const,
      packageId: "reference-conformance-package",
      engineRequirements: [{ capability: "reference.conformance", versionRange: "^1" }],
    },
  };
}

describeEngineConformanceSuite("reference engine conformance (#450)", createHarness(createReferenceEngineFactory()));

describe("deliberately broken engine fixtures (#450)", () => {
  it("reports projection privacy and authorization failures", () => {
    const goodFactory = createReferenceEngineFactory();
    const brokenFactory: typeof goodFactory = {
      ...goodFactory,
      create: (config, context) => {
        const instance = goodFactory.create(config, context);
        return {
          ...instance,
          handleCommand: (command, actor) => {
            if (command.type !== "reference.submit") {
              throw new InvalidEngineCommandError("invalid");
            }
            // Deliberately omit the authorization check.
            return instance.handleCommand(command, {
              ...actor,
              actorId: asId<"ParticipantId">(command.payload.participantId),
              role: "player",
            });
          },
          getProjection: (viewer) => ({
            ...instance.getProjection(viewer),
            leaked: "hidden-reference-answer",
          }) as unknown as ReferenceEngineProjection,
        };
      },
    };

    const failures = runEngineConformanceChecks(createHarness(brokenFactory));

    expect(failures.some((failure) => failure.includes("command authorization"))).toBe(true);
    expect(failures.some((failure) => failure.includes("projection privacy"))).toBe(true);
  });

  it("reports missing replay support for replayable engines", () => {
    const goodFactory = createReferenceEngineFactory();
    const brokenFactory: typeof goodFactory = {
      ...goodFactory,
      replay: undefined,
    };

    const failures = runEngineConformanceChecks(createHarness(brokenFactory));

    expect(failures.some((failure) => failure.includes("replay equivalence"))).toBe(true);
  });

  it("keeps unauthorized command errors available to engine authors", () => {
    const instance = createReferenceEngineFactory().create({}, createContext());

    expect(() =>
      instance.handleCommand(
        {
          type: "reference.submit",
          payload: { participantId: "participant-1", value: 1, idempotencyKey: "blocked" },
        },
        { actorId: "host", role: "host" },
      ),
    ).toThrow(UnauthorizedEngineCommandError);
  });
});
