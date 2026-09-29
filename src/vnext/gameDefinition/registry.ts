/**
 * GameDefinition runtime registry and capability/engine resolution (#314).
 *
 * Core/runtime depends on contracts (GameDefinition, Mechanic); individual
 * games/modules must not be imported back into Core. This module never
 * imports src/lib/gameEngine.ts or src/renderer/App.tsx (enforced by the
 * architecture-boundary guard, #515) - legacy registrations continue
 * working during the transition, untouched by this registry.
 */

import Ajv2020 from "ajv/dist/2020.js";
import type { MechanicId } from "../domain/ids";
import { gameDefinitionJsonSchema, type GameDefinition } from "./schema";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateGameDefinitionSchema = ajv.compile(gameDefinitionJsonSchema);

export interface SchemaValidationError {
  path: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

/** Validates a GameDefinition against the JSON Schema, at build/install time or defensively at runtime. */
export function validateGameDefinitionShape(candidate: unknown): SchemaValidationResult {
  const valid = validateGameDefinitionSchema(candidate);
  if (valid) return { valid: true, errors: [] };

  const errors = (validateGameDefinitionSchema.errors ?? []).map((error) => ({
    path: error.instancePath || "/",
    message: error.message ?? "invalid value",
  }));
  return { valid: false, errors };
}

export class MissingMechanicError extends Error {
  constructor(public readonly gameDefinitionId: string, public readonly mechanicId: string) {
    super(`GameDefinition "${gameDefinitionId}" requires mechanic "${mechanicId}", which is not registered.`);
    this.name = "MissingMechanicError";
  }
}

export class DuplicateGameDefinitionError extends Error {
  constructor(public readonly gameDefinitionId: string) {
    super(`GameDefinition "${gameDefinitionId}" is already registered.`);
    this.name = "DuplicateGameDefinitionError";
  }
}

export class MechanicDependencyCycleError extends Error {
  constructor(public readonly cycle: string[]) {
    super(`Mechanic dependency cycle detected: ${cycle.join(" -> ")}.`);
    this.name = "MechanicDependencyCycleError";
  }
}

export interface RegisteredMechanic {
  id: MechanicId;
  /** Other mechanics this one composes/depends on, for cycle detection. */
  dependsOn?: MechanicId[];
}

/**
 * In-memory capability/engine registry and GameDefinition registration.
 * A fresh instance is created per test/session; there is no global singleton
 * so tests remain isolated (ADR-001 guardrail: deterministic, testable).
 */
export class GameDefinitionRegistry {
  private readonly mechanics = new Map<string, RegisteredMechanic>();
  private readonly definitions = new Map<string, GameDefinition>();

  registerMechanic(mechanic: RegisteredMechanic): void {
    this.mechanics.set(mechanic.id, mechanic);
  }

  hasMechanic(id: string): boolean {
    return this.mechanics.has(id);
  }

  /**
   * Registers a GameDefinition after schema validation and mechanic-dependency
   * resolution. Throws MissingMechanicError / DuplicateGameDefinitionError /
   * MechanicDependencyCycleError with an actionable message on failure - it
   * never registers a partially-valid definition.
   */
  registerGameDefinition(definition: GameDefinition): void {
    const shapeResult = validateGameDefinitionShape(definition);
    if (!shapeResult.valid) {
      const details = shapeResult.errors.map((e) => `${e.path}: ${e.message}`).join("; ");
      throw new Error(`GameDefinition "${String(definition.id)}" failed schema validation: ${details}`);
    }

    if (this.definitions.has(definition.id)) {
      throw new DuplicateGameDefinitionError(definition.id);
    }

    for (const dependency of definition.mechanics) {
      if (!this.hasMechanic(dependency.mechanicId)) {
        throw new MissingMechanicError(definition.id, dependency.mechanicId);
      }
    }

    this.assertNoMechanicCycles(definition.mechanics.map((m) => m.mechanicId));

    this.definitions.set(definition.id, definition);
  }

  getGameDefinition(id: string): GameDefinition | undefined {
    return this.definitions.get(id);
  }

  listGameDefinitions(): GameDefinition[] {
    return [...this.definitions.values()];
  }

  private assertNoMechanicCycles(requestedMechanicIds: string[]): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (mechanicId: string, path: string[]): void => {
      if (visited.has(mechanicId)) return;
      if (visiting.has(mechanicId)) {
        throw new MechanicDependencyCycleError([...path, mechanicId]);
      }

      visiting.add(mechanicId);
      const mechanic = this.mechanics.get(mechanicId);
      for (const dependencyId of mechanic?.dependsOn ?? []) {
        visit(dependencyId, [...path, mechanicId]);
      }
      visiting.delete(mechanicId);
      visited.add(mechanicId);
    };

    for (const mechanicId of requestedMechanicIds) {
      visit(mechanicId, []);
    }
  }
}
