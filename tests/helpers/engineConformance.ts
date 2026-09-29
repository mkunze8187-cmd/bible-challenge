import { describe, expect, it } from "vitest";
import {
  EngineRegistry,
  EngineSnapshotMigrationRegistry,
  InputActionRegistry,
  InvalidEngineCommandError,
  RendererContributionRegistry,
  UnauthorizedEngineCommandError,
  createEngineAdapterFixture,
  createEngineCommandEnvelope,
  evaluatePrepareEventEngineReadiness,
  persistEngineSnapshot,
  type ActorContext,
  type EngineContext,
  type EngineFactory,
  type EnginePackageManifest,
  type InputActionDescriptor,
  type ProjectionViewer,
  type RendererContribution,
} from "../../src/vnext/engineSdk";
import { asId } from "../../src/vnext/domain/ids";

export interface EngineConformanceHarness<Config, State, Command, Event, Projection> {
  factory: EngineFactory<Config, State, Command, Event, Projection>;
  config: Config;
  createContext: () => EngineContext;
  validCommand: Command;
  duplicateCommand: Command;
  invalidCommand: Command;
  authorizedActor: ActorContext;
  unauthorizedActor: ActorContext;
  hostViewer: ProjectionViewer;
  stageViewer: ProjectionViewer;
  playerViewer: ProjectionViewer;
  otherPlayerViewer: ProjectionViewer;
  hiddenStateToken: string;
  inputAction: InputActionDescriptor;
  rendererContribution: RendererContribution;
  packageManifest: EnginePackageManifest;
}

export function runEngineConformanceChecks<Config, State, Command, Event, Projection>(
  harness: EngineConformanceHarness<Config, State, Command, Event, Projection>,
): string[] {
  const failures: string[] = [];
  const record = (name: string, check: () => void) => {
    try {
      check();
    } catch (error) {
      failures.push(`${name}: ${(error as Error).message}`);
    }
  };

  record("descriptor/version resolution", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(harness.factory);
    const provided = harness.factory.descriptor.provides[0];
    expect(registry.requireCapability({ capability: provided.capability, versionRange: provided.version })).toBeDefined();
  });

  if (harness.factory.descriptor.traits.includes("DETERMINISTIC")) {
    record("deterministic same-input behavior", () => {
      const first = harness.factory.create(harness.config, harness.createContext());
      const second = harness.factory.create(harness.config, harness.createContext());
      first.handleCommand(harness.validCommand, harness.authorizedActor);
      second.handleCommand(harness.validCommand, harness.authorizedActor);
      expect(second.snapshot()).toEqual(first.snapshot());
    });
  }

  record("command authorization and invalid command rejection", () => {
    const instance = harness.factory.create(harness.config, harness.createContext());
    expect(() => instance.handleCommand(harness.validCommand, harness.unauthorizedActor)).toThrow(
      UnauthorizedEngineCommandError,
    );
    expect(() => instance.handleCommand(harness.invalidCommand, harness.authorizedActor)).toThrow(
      InvalidEngineCommandError,
    );
  });

  record("command idempotency", () => {
    const instance = harness.factory.create(harness.config, harness.createContext());
    instance.handleCommand(harness.duplicateCommand, harness.authorizedActor);
    expect(instance.handleCommand(harness.duplicateCommand, harness.authorizedActor).events).toEqual([]);
  });

  if (harness.factory.descriptor.traits.includes("SERIALIZABLE")) {
    record("snapshot/restore and future schema rejection", () => {
      const instance = harness.factory.create(harness.config, harness.createContext());
      instance.handleCommand(harness.validCommand, harness.authorizedActor);
      const persisted = persistEngineSnapshot(harness.factory, instance.snapshot());
      const restored = new EngineSnapshotMigrationRegistry().restore(
        harness.factory,
        persisted,
        harness.createContext(),
      );
      expect(restored.getProjection(harness.hostViewer)).toEqual(instance.getProjection(harness.hostViewer));

      const future = {
        ...persisted,
        pin: { ...persisted.pin, stateSchemaVersion: (persisted.pin.stateSchemaVersion ?? 0) + 1 },
      };
      expect(() =>
        new EngineSnapshotMigrationRegistry().restore(harness.factory, future, harness.createContext()),
      ).toThrow();
    });
  }

  if (harness.factory.descriptor.traits.includes("REPLAYABLE")) {
    record("replay equivalence", () => {
      expect(harness.factory.replay).toBeDefined();
      const instance = harness.factory.create(harness.config, harness.createContext());
      const transition = instance.handleCommand(harness.validCommand, harness.authorizedActor);
      const replayed = harness.factory.replay?.(transition.events, harness.config, harness.createContext());
      expect(replayed?.getProjection(harness.stageViewer)).toEqual(instance.getProjection(harness.stageViewer));
    });
  }

  record("projection privacy", () => {
    const instance = harness.factory.create(harness.config, harness.createContext());
    instance.handleCommand(harness.validCommand, harness.authorizedActor);
    expect(JSON.stringify(instance.getProjection(harness.hostViewer))).toContain(harness.hiddenStateToken);
    expect(JSON.stringify(instance.getProjection(harness.stageViewer))).not.toContain(harness.hiddenStateToken);
    expect(JSON.stringify(instance.getProjection(harness.playerViewer))).not.toContain(harness.hiddenStateToken);
  });

  if (harness.factory.descriptor.traits.includes("MULTIPLAYER")) {
    record("multiplayer actor isolation", () => {
      const instance = harness.factory.create(harness.config, harness.createContext());
      instance.handleCommand(harness.validCommand, harness.authorizedActor);
      expect(instance.getProjection(harness.otherPlayerViewer)).not.toEqual(instance.getProjection(harness.playerViewer));
    });
  }

  record("renderer/action registration", () => {
    const actions = new InputActionRegistry();
    actions.registerAction(harness.inputAction);
    expect(actions.getAction(harness.inputAction.actionId)).toEqual(harness.inputAction);

    const renderers = new RendererContributionRegistry();
    renderers.registerContribution(harness.rendererContribution);
    expect(
      renderers.findContribution({
        capability: harness.rendererContribution.capability,
        surface: harness.rendererContribution.surface,
      }),
    ).toEqual(harness.rendererContribution);
  });

  record("package readiness reporting", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(harness.factory);
    const readiness = evaluatePrepareEventEngineReadiness(harness.packageManifest, registry);
    expect(readiness.ready).toBe(true);
  });

  record("Local/Shared adapter compatibility", () => {
    const context = {
      sessionId: asId<"SessionId">("conformance-session"),
      engineId: harness.factory.descriptor.engineId,
      capability: harness.factory.descriptor.provides[0].capability,
      now: () => new Date("2026-09-29T12:00:00.000Z"),
      createCommandId: () => asId<"CommandId">("conformance-command"),
      createEventId: () => asId<"DomainEventId">("conformance-event"),
    };
    const local = createEngineAdapterFixture(
      "LOCAL",
      harness.factory.create(harness.config, harness.createContext()),
      context,
    );
    const shared = createEngineAdapterFixture(
      "SHARED",
      harness.factory.create(harness.config, harness.createContext()),
      context,
    );
    const localEvents = local.submitCommand(
      createEngineCommandEnvelope(context, harness.authorizedActor, harness.validCommand),
    );
    const sharedEvents = shared.submitCommand(
      createEngineCommandEnvelope(context, harness.authorizedActor, harness.validCommand),
    );
    expect(sharedEvents.map((event) => event.event)).toEqual(localEvents.map((event) => event.event));
    expect(shared.project(harness.stageViewer)).toEqual(local.project(harness.stageViewer));
  });

  return failures;
}

export function describeEngineConformanceSuite<Config, State, Command, Event, Projection>(
  name: string,
  harness: EngineConformanceHarness<Config, State, Command, Event, Projection>,
): void {
  describe(name, () => {
    it("passes the shared Engine SDK conformance suite", () => {
      expect(runEngineConformanceChecks(harness)).toEqual([]);
    });
  });
}
