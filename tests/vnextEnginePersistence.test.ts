import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import {
  EngineRegistry,
  EngineSnapshotMigrationRegistry,
  IncompatibleEngineSnapshotError,
  MissingEngineSnapshotMigrationError,
  createEngineSessionPin,
  evaluatePrepareEventEngineReadiness,
  negotiateSharedEngineCapabilities,
  persistEngineSnapshot,
  toSharedCapabilityMetadata,
  type EngineContext,
  type EngineFactory,
  type EngineInstance,
  type EngineSnapshot,
  type EngineTransition,
  type PersistedEngineSnapshot,
} from "../src/vnext/engineSdk";

interface CounterStateV1 {
  count: number;
}

interface CounterStateV2 {
  count: number;
  bonus: number;
}

type CounterCommand = { type: "add"; value: number };
type CounterEvent = { type: "added"; value: number; total: number };
type CounterProjection = { total: number };

function createContext(registry = new EngineRegistry()): EngineContext {
  return {
    sessionId: asId("session-449"),
    rng: () => 0,
    now: () => new Date("2026-09-29T12:00:00.000Z"),
    resolveCapability: (requirement) => registry.resolveCapability(requirement),
    publishEvent: () => undefined,
    diagnostics: { info: () => undefined, warn: () => undefined, error: () => undefined },
  };
}

function makeCounterFactory(
  engineVersion = "1.1.0",
  stateSchemaVersion = 2,
): EngineFactory<Record<string, never>, CounterStateV2, CounterCommand, CounterEvent, CounterProjection> {
  const makeInstance = (state: CounterStateV2): EngineInstance<CounterStateV2, CounterCommand, CounterEvent, CounterProjection> => ({
    handleCommand(command): EngineTransition<CounterStateV2, CounterEvent> {
      const next = { ...state, count: state.count + command.value };
      state.count = next.count;
      return { state: next, events: [{ type: "added", value: command.value, total: next.count + next.bonus }] };
    },
    getProjection: () => ({ total: state.count + state.bonus }),
    snapshot: (): EngineSnapshot<CounterStateV2> => ({
      engineId: "reference.persisted-counter",
      engineVersion,
      stateSchemaVersion,
      state: { ...state },
    }),
    dispose: () => undefined,
  });

  return {
    descriptor: {
      engineId: "reference.persisted-counter",
      version: engineVersion,
      provides: [{ capability: "reference.persisted-counter", version: engineVersion }],
      traits: ["SERIALIZABLE", "REPLAYABLE"],
      stateSchemaVersion,
    },
    create: () => makeInstance({ count: 0, bonus: 1 }),
    restore: (snapshot) => makeInstance({ ...snapshot.state }),
  };
}

describe("Engine SDK persistence and replay contracts (#449)", () => {
  it("pins effective engine capability versions with persisted snapshots", () => {
    const factory = makeCounterFactory("1.1.0", 2);
    const instance = factory.create({}, createContext());
    instance.handleCommand({ type: "add", value: 2 }, { actorId: "system", role: "system" });

    const persisted = persistEngineSnapshot(factory, instance.snapshot());

    expect(persisted).toEqual({
      snapshotVersion: "engine-snapshot.v1",
      pin: {
        engineId: "reference.persisted-counter",
        engineVersion: "1.1.0",
        stateSchemaVersion: 2,
        capabilities: [{ capability: "reference.persisted-counter", version: "1.1.0" }],
      },
      state: { count: 2, bonus: 1 },
    });
    expect(createEngineSessionPin(factory).capabilities).toEqual([
      { capability: "reference.persisted-counter", version: "1.1.0" },
    ]);
  });

  it("restores a compatible snapshot through the registered factory", () => {
    const factory = makeCounterFactory("1.1.0", 2);
    const persisted = persistEngineSnapshot(factory, {
      engineId: "reference.persisted-counter",
      engineVersion: "1.1.0",
      stateSchemaVersion: 2,
      state: { count: 4, bonus: 3 },
    });

    const restored = new EngineSnapshotMigrationRegistry().restore(factory, persisted, createContext());

    expect(restored.getProjection({ role: "host" })).toEqual({ total: 7 });
  });

  it("applies explicit schema migrations before restore", () => {
    const factory = makeCounterFactory("1.1.0", 2);
    const migrationRegistry = new EngineSnapshotMigrationRegistry();
    migrationRegistry.registerMigration({
      engineId: "reference.persisted-counter",
      fromSchemaVersion: 1,
      toSchemaVersion: 2,
      migrate: (state: CounterStateV1): CounterStateV2 => ({ count: state.count, bonus: 0 }),
    });
    const persisted: PersistedEngineSnapshot<CounterStateV1> = {
      snapshotVersion: "engine-snapshot.v1",
      pin: {
        engineId: "reference.persisted-counter",
        engineVersion: "1.0.0",
        stateSchemaVersion: 1,
        capabilities: [{ capability: "reference.persisted-counter", version: "1.0.0" }],
      },
      state: { count: 5 },
    };

    const restored = migrationRegistry.restore(factory, persisted, createContext());

    expect(restored.getProjection({ role: "host" })).toEqual({ total: 5 });
  });

  it("rejects incompatible future engine and schema versions unless an explicit migration exists", () => {
    const factory = makeCounterFactory("1.1.0", 2);
    const futureVersion: PersistedEngineSnapshot<CounterStateV2> = {
      snapshotVersion: "engine-snapshot.v1",
      pin: {
        engineId: "reference.persisted-counter",
        engineVersion: "2.0.0",
        stateSchemaVersion: 2,
        capabilities: [{ capability: "reference.persisted-counter", version: "2.0.0" }],
      },
      state: { count: 1, bonus: 1 },
    };
    const futureSchema: PersistedEngineSnapshot<CounterStateV2> = {
      ...futureVersion,
      pin: { ...futureVersion.pin, engineVersion: "1.1.0", stateSchemaVersion: 3 },
    };
    const missingMigration: PersistedEngineSnapshot<CounterStateV1> = {
      snapshotVersion: "engine-snapshot.v1",
      pin: {
        engineId: "reference.persisted-counter",
        engineVersion: "1.0.0",
        stateSchemaVersion: 1,
        capabilities: [{ capability: "reference.persisted-counter", version: "1.0.0" }],
      },
      state: { count: 1 },
    };
    const registry = new EngineSnapshotMigrationRegistry();

    expect(() => registry.restore(factory, futureVersion, createContext())).toThrow(IncompatibleEngineSnapshotError);
    expect(() => registry.restore(factory, futureSchema, createContext())).toThrow(IncompatibleEngineSnapshotError);
    expect(() => registry.restore(factory, missingMigration, createContext())).toThrow(
      MissingEngineSnapshotMigrationError,
    );
  });

  it("exports capability metadata for Shared negotiation without implementation objects", () => {
    const metadata = toSharedCapabilityMetadata(createEngineSessionPin(makeCounterFactory("1.1.0", 2)));

    expect(metadata).toEqual([{ capability: "reference.persisted-counter", version: "1.1.0" }]);
  });
});

describe("Engine SDK package readiness and Shared negotiation (#449)", () => {
  it("reports Prepare Event missing and incompatible engine capability requirements", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(makeCounterFactory("1.1.0", 2));

    const missing = evaluatePrepareEventEngineReadiness(
      {
        manifestVersion: "engine-package-manifest.v1",
        packageId: "missing-package",
        engineRequirements: [{ capability: "missing.engine", versionRange: "^1" }],
      },
      registry,
    );
    const incompatible = evaluatePrepareEventEngineReadiness(
      {
        manifestVersion: "engine-package-manifest.v1",
        packageId: "future-package",
        engineRequirements: [{ capability: "reference.persisted-counter", versionRange: "^2" }],
      },
      registry,
    );

    expect(missing.ready).toBe(false);
    expect(missing.issues[0].code).toBe("MISSING_ENGINE_CAPABILITY");
    expect(incompatible.ready).toBe(false);
    expect(incompatible.issues[0]).toEqual({
      code: "INCOMPATIBLE_ENGINE_CAPABILITY",
      capability: "reference.persisted-counter",
      versionRange: "^2",
      availableVersions: ["1.1.0"],
      message: 'Engine capability "reference.persisted-counter" is installed, but no version satisfies "^2".',
    });
  });

  it("accepts package requirements when installed engine capabilities satisfy the manifest", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(makeCounterFactory("1.1.0", 2));

    const readiness = evaluatePrepareEventEngineReadiness(
      {
        manifestVersion: "engine-package-manifest.v1",
        packageId: "counter-package",
        engineRequirements: [{ capability: "reference.persisted-counter", versionRange: "^1" }],
      },
      registry,
    );

    expect(readiness.ready).toBe(true);
    expect(readiness.resolved[0].capability.version).toBe("1.1.0");
    expect(readiness.issues).toEqual([]);
  });

  it("negotiates Shared capability metadata by capability and version range", () => {
    const result = negotiateSharedEngineCapabilities(
      [
        { capability: "reference.persisted-counter", versionRange: "^1" },
        { capability: "missing.shared", versionRange: "^1" },
      ],
      [{ capability: "reference.persisted-counter", version: "1.1.0" }],
    );

    expect(result.compatible).toBe(false);
    expect(result.accepted).toEqual([{ capability: "reference.persisted-counter", version: "1.1.0" }]);
    expect(result.issues[0].code).toBe("MISSING_ENGINE_CAPABILITY");
  });
});
