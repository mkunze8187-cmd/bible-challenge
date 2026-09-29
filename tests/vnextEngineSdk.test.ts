import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import {
  DuplicateCapabilityProviderError,
  DuplicateEngineError,
  EngineRegistry,
  InvalidEngineDescriptorError,
  UnknownCapabilityError,
  type ActorContext,
  type EngineContext,
  type EngineFactory,
  type EngineInstance,
  type EngineSnapshot,
  type EngineTransition,
  type ProjectionViewer,
} from "../src/vnext/engineSdk";

interface ReferenceState {
  count: number;
  createdAt: string;
  seedSample: number;
  disposed: boolean;
}

type ReferenceCommand = { type: "increment"; by: number };
type ReferenceEvent = { type: "incremented"; count: number; actorRole: ActorContext["role"] };
type ReferenceProjection = { count: number; viewerRole: ProjectionViewer["role"]; seedSampleVisible: boolean };

function createContext(registry: EngineRegistry, events: unknown[] = []): EngineContext {
  return {
    sessionId: asId("session-1"),
    rng: () => 0.42,
    now: () => new Date("2026-09-29T00:00:00.000Z"),
    resolveCapability: (requirement) => registry.resolveCapability(requirement),
    publishEvent: (event) => events.push(event),
    diagnostics: {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
  };
}

function makeReferenceFactory(
  version = "1.2.0",
): EngineFactory<Record<string, never>, ReferenceState, ReferenceCommand, ReferenceEvent, ReferenceProjection> {
  const makeInstance = (
    state: ReferenceState,
  ): EngineInstance<ReferenceState, ReferenceCommand, ReferenceEvent, ReferenceProjection> => ({
    handleCommand(command, actor): EngineTransition<ReferenceState, ReferenceEvent> {
      const next = { ...state, count: state.count + command.by };
      state.count = next.count;
      return {
        state: next,
        events: [{ type: "incremented", count: next.count, actorRole: actor.role }],
      };
    },
    getProjection(viewer) {
      return {
        count: state.count,
        viewerRole: viewer.role,
        seedSampleVisible: viewer.role === "host",
      };
    },
    snapshot(): EngineSnapshot<ReferenceState> {
      return {
        engineId: "reference.counter",
        engineVersion: version,
        stateSchemaVersion: 1,
        state: { ...state },
      };
    },
    dispose() {
      state.disposed = true;
    },
  });

  return {
    descriptor: {
      engineId: "reference.counter",
      version,
      provides: [{ capability: "reference.counter", version }],
      requires: [{ capability: "reference.clock", versionRange: "^1", optional: true }],
      traits: ["DETERMINISTIC", "SERIALIZABLE"],
      stateSchemaVersion: 1,
    },
    create(_config, context) {
      return makeInstance({
        count: 0,
        createdAt: context.now().toISOString(),
        seedSample: context.rng(),
        disposed: false,
      });
    },
    restore(snapshot) {
      return makeInstance({ ...snapshot.state });
    },
  };
}

describe("EngineRegistry capability resolution (#447)", () => {
  it("registers and resolves the highest matching capability version", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(makeReferenceFactory("1.0.0"));
    registry.registerFactory(makeReferenceFactory("1.2.0"));
    registry.registerFactory(makeReferenceFactory("2.0.0"));

    const resolved = registry.requireCapability({ capability: "reference.counter", versionRange: "^1" });

    expect(resolved.capability.version).toBe("1.2.0");
  });

  it("throws a stable unknown-capability error for missing required dependencies", () => {
    const registry = new EngineRegistry();

    expect(() => registry.requireCapability({ capability: "missing.capability", versionRange: "^1" })).toThrow(
      UnknownCapabilityError,
    );
  });

  it("separates required, optional, and missing optional dependency behavior", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(makeReferenceFactory("1.0.0"));

    const result = registry.resolveRequirements([
      { capability: "reference.counter", versionRange: "^1" },
      { capability: "missing.optional", versionRange: "^1", optional: true },
    ]);

    expect(result.required).toHaveLength(1);
    expect(result.optional).toHaveLength(0);
    expect(result.missingOptional).toEqual([{ capability: "missing.optional", versionRange: "^1", optional: true }]);
  });

  it("rejects duplicate engine id/version registrations", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(makeReferenceFactory("1.0.0"));

    expect(() => registry.registerFactory(makeReferenceFactory("1.0.0"))).toThrow(DuplicateEngineError);
  });

  it("rejects conflicting capability providers for the same capability version", () => {
    const registry = new EngineRegistry();
    registry.registerFactory(makeReferenceFactory("1.0.0"));

    expect(() =>
      registry.registerFactory({
        ...makeReferenceFactory("1.0.0"),
        descriptor: {
          ...makeReferenceFactory("1.0.0").descriptor,
          engineId: "reference.counter.alternate",
        },
      }),
    ).toThrow(DuplicateCapabilityProviderError);
  });

  it("rejects invalid descriptor dependency version ranges", () => {
    const registry = new EngineRegistry();
    const factory = makeReferenceFactory("1.0.0");

    expect(() =>
      registry.registerFactory({
        ...factory,
        descriptor: {
          ...factory.descriptor,
          requires: [{ capability: "reference.clock", versionRange: "not semver" }],
        },
      }),
    ).toThrow(InvalidEngineDescriptorError);
  });
});

describe("Engine SDK lifecycle and injected context (#447)", () => {
  it("creates, transitions, projects, snapshots, restores, and disposes through the standard lifecycle", () => {
    const registry = new EngineRegistry();
    const factory = makeReferenceFactory("1.0.0");
    registry.registerFactory(factory);

    const instance = factory.create({}, createContext(registry));
    const transition = instance.handleCommand({ type: "increment", by: 2 }, { actorId: "host", role: "host" });

    expect(transition).toEqual({
      state: expect.objectContaining({ count: 2 }),
      events: [{ type: "incremented", count: 2, actorRole: "host" }],
    });
    expect(instance.getProjection({ role: "host" })).toEqual({ count: 2, viewerRole: "host", seedSampleVisible: true });
    expect(instance.getProjection({ role: "stage" })).toEqual({ count: 2, viewerRole: "stage", seedSampleVisible: false });

    const snapshot = instance.snapshot();
    expect(snapshot.state).toEqual({
      count: 2,
      createdAt: "2026-09-29T00:00:00.000Z",
      seedSample: 0.42,
      disposed: false,
    });

    const restored = factory.restore(snapshot, createContext(registry));
    expect(restored.getProjection({ role: "host" }).count).toBe(2);

    instance.dispose();
    expect(instance.snapshot().state.disposed).toBe(true);
  });
});
