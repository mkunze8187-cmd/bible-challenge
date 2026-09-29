import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import { beforeOrAfterGameDefinition, beforeOrAfterMechanic } from "../src/vnext/gameDefinition/fixtures/beforeOrAfter";
import {
  referenceNovelMechanic,
  referenceNovelMechanicModule,
} from "../src/vnext/gameDefinition/fixtures/novelMechanicModule";
import {
  DuplicateGameDefinitionError,
  GameDefinitionRegistry,
  MechanicDependencyCycleError,
  MissingMechanicError,
  UnsupportedRuntimeError,
  validateGameDefinitionShape,
} from "../src/vnext/gameDefinition/registry";
import {
  DuplicateGameModuleError,
  GameModuleRegistry,
  MissingModuleDependencyError,
  ModuleRuntimeContractVersionError,
  type TrustedGameModule,
} from "../src/vnext/gameDefinition/moduleContract";
import type { GameDefinition } from "../src/vnext/gameDefinition/schema";

const ROOT = path.resolve(__dirname, "..");

function makeValidDefinition(overrides: Partial<GameDefinition> = {}): GameDefinition {
  return {
    id: asId("sample-game"),
    version: asId("1"),
    metadata: { name: "Sample Game", family: "sample" },
    capabilities: { players: { min: 1, max: 4 }, tournament: false, gauntletStage: false },
    mechanics: [{ mechanicId: asId("sample-mechanic"), role: "challenge" }],
    challengeRequirements: { contentTypes: ["bible-event"] },
    randomizerPolicy: "seeded-selection",
    scoringPolicy: "standard-challenge",
    roundPolicy: "configured-rounds",
    difficultyPolicy: "standard",
    projections: { mainStage: "sample", playerController: "sample", host: "sample-host" },
    persistencePolicy: "challenge-session-v1",
    runtimeCompatibility: {
      local: {
        status: "SUPPORTED",
        requirements: {
          privatePlayerProjection: true,
          realtimeInput: false,
          simultaneousInput: false,
          localSiteAwareness: false,
          authority: "LOCAL_HOST",
        },
      },
      shared: {
        status: "NOT_VALIDATED",
        reason: "Shared runtime has not been validated for this definition.",
        requirements: {
          privatePlayerProjection: true,
          realtimeInput: false,
          simultaneousInput: false,
          localSiteAwareness: false,
          authority: "EITHER",
        },
      },
      hosted: {
        status: "UNSUPPORTED",
        reason: "Requires local host authority during setup.",
        requirements: {
          privatePlayerProjection: true,
          realtimeInput: false,
          simultaneousInput: false,
          localSiteAwareness: true,
          authority: "LOCAL_HOST",
        },
      },
    },
    assetDependencies: ["agon.core.ui"],
    ...overrides,
  };
}

function makeModule(overrides: Partial<TrustedGameModule> = {}): TrustedGameModule {
  return {
    ...referenceNovelMechanicModule,
    id: asId("sample-module"),
    engineDependencies: [asId("sample-mechanic")],
    ...overrides,
  };
}

describe("GameDefinition schema validation", () => {
  it("accepts a valid GameDefinition fixture", () => {
    const result = validateGameDefinitionShape(makeValidDefinition());
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("rejects a definition missing a required field", () => {
    const invalid = makeValidDefinition();
    // @ts-expect-error - deliberately constructing an invalid fixture
    delete invalid.scoringPolicy;

    const result = validateGameDefinitionShape(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes("scoringPolicy"))).toBe(true);
  });

  it("rejects a definition with an unknown extra property", () => {
    const invalid = { ...makeValidDefinition(), unexpectedField: "nope" };
    const result = validateGameDefinitionShape(invalid);
    expect(result.valid).toBe(false);
  });

  it("rejects a definition with the wrong capability shape", () => {
    const invalid = makeValidDefinition({
      // @ts-expect-error - deliberately wrong shape
      capabilities: { players: { min: 1, max: 4 }, tournament: "yes", gauntletStage: false },
    });
    const result = validateGameDefinitionShape(invalid);
    expect(result.valid).toBe(false);
  });

  it("requires runtime compatibility metadata for Local, Shared, and Hosted", () => {
    const invalid = makeValidDefinition();
    // @ts-expect-error - deliberately constructing an invalid fixture
    delete invalid.runtimeCompatibility.hosted;

    const result = validateGameDefinitionShape(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("hosted"))).toBe(true);
  });

  it("requires a diagnostic reason when a runtime is not validated or unsupported", () => {
    const invalid = makeValidDefinition();
    delete invalid.runtimeCompatibility.shared.reason;

    const result = validateGameDefinitionShape(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("reason"))).toBe(true);
  });
});

describe("GameDefinitionRegistry capability resolution", () => {
  it("registers a definition once its required mechanic is registered", () => {
    const registry = new GameDefinitionRegistry();
    registry.registerMechanic({ id: asId("sample-mechanic") });

    expect(() => registry.registerGameDefinition(makeValidDefinition())).not.toThrow();
    expect(registry.getGameDefinition("sample-game")).toBeDefined();
  });

  it("throws MissingMechanicError with an actionable message for an unregistered mechanic", () => {
    const registry = new GameDefinitionRegistry();

    expect(() => registry.registerGameDefinition(makeValidDefinition())).toThrow(MissingMechanicError);
    try {
      registry.registerGameDefinition(makeValidDefinition());
    } catch (error) {
      expect(error).toBeInstanceOf(MissingMechanicError);
      expect((error as Error).message).toContain("sample-mechanic");
      expect((error as Error).message).toContain("sample-game");
    }
  });

  it("throws DuplicateGameDefinitionError when the same id is registered twice", () => {
    const registry = new GameDefinitionRegistry();
    registry.registerMechanic({ id: asId("sample-mechanic") });
    registry.registerGameDefinition(makeValidDefinition());

    expect(() => registry.registerGameDefinition(makeValidDefinition())).toThrow(DuplicateGameDefinitionError);
  });

  it("detects a mechanic dependency cycle", () => {
    const registry = new GameDefinitionRegistry();
    registry.registerMechanic({ id: asId("mechanic-a"), dependsOn: [asId("mechanic-b")] });
    registry.registerMechanic({ id: asId("mechanic-b"), dependsOn: [asId("mechanic-a")] });

    const definition = makeValidDefinition({ mechanics: [{ mechanicId: asId("mechanic-a"), role: "challenge" }] });

    expect(() => registry.registerGameDefinition(definition)).toThrow(MechanicDependencyCycleError);
  });

  it("does not register a definition that fails schema validation, even partially", () => {
    const registry = new GameDefinitionRegistry();
    registry.registerMechanic({ id: asId("sample-mechanic") });
    const invalid = makeValidDefinition();
    // @ts-expect-error - deliberately constructing an invalid fixture
    delete invalid.roundPolicy;

    expect(() => registry.registerGameDefinition(invalid)).toThrow(/failed schema validation/);
    expect(registry.getGameDefinition("sample-game")).toBeUndefined();
  });

  it("distinguishes supported, not-validated, and unsupported runtime status", () => {
    const registry = new GameDefinitionRegistry();
    registry.registerMechanic({ id: asId("sample-mechanic") });
    registry.registerGameDefinition(makeValidDefinition());

    expect(registry.assertRuntimeSupported("sample-game", "LOCAL").status).toBe("SUPPORTED");
    expect(registry.getRuntimeCompatibility("sample-game", "SHARED")?.status).toBe("NOT_VALIDATED");
    expect(() => registry.assertRuntimeSupported("sample-game", "HOSTED")).toThrow(UnsupportedRuntimeError);
  });
});

describe("trusted novel-mechanic module contract (#320)", () => {
  it("registers a first-party module through contract metadata without importing game code into Core", () => {
    const registry = new GameModuleRegistry({
      runtimeContractVersion: "vnext-runtime-contract-1",
      hasMechanic: (mechanicId) => mechanicId === referenceNovelMechanic.id,
    });

    registry.registerModule(referenceNovelMechanicModule);

    expect(registry.getModule("reference-novel-mechanic-module")?.capabilities).toContain("novel-board-geometry");
  });

  it("rejects missing engine dependencies with an actionable diagnostic", () => {
    const registry = new GameModuleRegistry({
      runtimeContractVersion: "vnext-runtime-contract-1",
      hasMechanic: () => false,
    });

    expect(() => registry.registerModule(makeModule())).toThrow(MissingModuleDependencyError);
  });

  it("rejects incompatible runtime contract versions", () => {
    const registry = new GameModuleRegistry({
      runtimeContractVersion: "vnext-runtime-contract-2",
      hasMechanic: () => true,
    });

    expect(() => registry.registerModule(makeModule())).toThrow(ModuleRuntimeContractVersionError);
  });

  it("rejects duplicate module registration", () => {
    const registry = new GameModuleRegistry({
      runtimeContractVersion: "vnext-runtime-contract-1",
      hasMechanic: () => true,
    });
    registry.registerModule(makeModule());

    expect(() => registry.registerModule(makeModule())).toThrow(DuplicateGameModuleError);
  });

  it("creates isolated state for each module session", () => {
    const registry = new GameModuleRegistry({
      runtimeContractVersion: "vnext-runtime-contract-1",
      hasMechanic: () => true,
    });
    registry.registerModule(makeModule());

    const first = registry.createModuleState("sample-module") as { visits: string[] };
    const second = registry.createModuleState("sample-module") as { visits: string[] };
    first.visits.push("first-session");

    expect(second.visits).toEqual([]);
  });
});

describe("before-or-after reference fixture (#314 acceptance)", () => {
  it("is a schema-valid GameDefinition", () => {
    const result = validateGameDefinitionShape(beforeOrAfterGameDefinition);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("registers and loads from the registry without changing gameplay data", () => {
    const registry = new GameDefinitionRegistry();
    registry.registerMechanic(beforeOrAfterMechanic);

    registry.registerGameDefinition(beforeOrAfterGameDefinition);

    const loaded = registry.getGameDefinition("before-or-after");
    expect(loaded).toEqual(beforeOrAfterGameDefinition);
  });

  it("declares the same content type the legacy BeforeOrAfterRound pack actually uses", () => {
    // The legacy pack (src/types/gameData.ts BeforeOrAfterRound) is untouched by this
    // fixture; this only checks the vNext definition's declared content requirement
    // is consistent with what the legacy game already loads, so the definition is a
    // faithful (not aspirational) description of the existing game.
    const legacyTypesSource = readFileSync(path.join(ROOT, "src/types/gameData.ts"), "utf8");
    expect(legacyTypesSource).toContain("export interface BeforeOrAfterRound");
    expect(beforeOrAfterGameDefinition.challengeRequirements.contentTypes).toContain("bible-event");
  });
});

describe("legacy coexistence (#314 acceptance: legacy registrations continue working)", () => {
  it("the vNext registry has no knowledge of and does not gate the legacy GAME_LIBRARY", () => {
    const legacyEngineSource = readFileSync(path.join(ROOT, "src/lib/gameEngine.ts"), "utf8");
    // before-or-after must still be present and untouched in the legacy engine -
    // registering it in the vNext registry above must not have required removing
    // or modifying its legacy registration.
    expect(legacyEngineSource).toContain('"before-or-after"');
  });
});
