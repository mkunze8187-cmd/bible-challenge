/**
 * Trusted first-party novel-mechanic module contract (#320).
 *
 * Modules are for mechanics that cannot reasonably be expressed as a purely
 * declarative GameDefinition plus existing mechanics. They depend only on
 * vNext contracts/shared systems; Core registers them by contract and never
 * imports a particular game implementation.
 */

import type { GameModuleId, MechanicId } from "../domain/ids";
import type { RuntimeCompatibilityMatrix } from "./schema";

export interface ModuleProjections {
  mainStage?: string;
  playerController?: string;
  host?: string;
}

export interface TrustedGameModule {
  id: GameModuleId;
  version: string;
  runtimeContractVersion: string;
  capabilities: string[];
  projections: ModuleProjections;
  engineDependencies: MechanicId[];
  persistenceHooks: string[];
  assetDependencies: string[];
  contentDependencies: string[];
  runtimeCompatibility: RuntimeCompatibilityMatrix;
  adapters?: {
    tournament?: string;
    gauntlet?: string;
  };
  createInitialState?: () => unknown;
}

export interface ModuleCompatibilityDiagnostic {
  moduleId: string;
  compatible: boolean;
  message: string;
}

export class DuplicateGameModuleError extends Error {
  constructor(public readonly moduleId: string) {
    super(`Trusted game module "${moduleId}" is already registered.`);
    this.name = "DuplicateGameModuleError";
  }
}

export class MissingModuleDependencyError extends Error {
  constructor(
    public readonly moduleId: string,
    public readonly mechanicId: string,
  ) {
    super(`Trusted game module "${moduleId}" requires mechanic "${mechanicId}", which is not registered.`);
    this.name = "MissingModuleDependencyError";
  }
}

export class ModuleRuntimeContractVersionError extends Error {
  constructor(
    public readonly moduleId: string,
    public readonly expectedVersion: string,
    public readonly actualVersion: string,
  ) {
    super(
      `Trusted game module "${moduleId}" targets runtime contract "${actualVersion}", expected "${expectedVersion}".`,
    );
    this.name = "ModuleRuntimeContractVersionError";
  }
}

export class GameModuleRegistry {
  private readonly modules = new Map<string, TrustedGameModule>();

  constructor(
    private readonly options: {
      runtimeContractVersion: string;
      hasMechanic: (mechanicId: string) => boolean;
    },
  ) {}

  registerModule(module: TrustedGameModule): void {
    if (this.modules.has(module.id)) {
      throw new DuplicateGameModuleError(module.id);
    }

    if (module.runtimeContractVersion !== this.options.runtimeContractVersion) {
      throw new ModuleRuntimeContractVersionError(
        module.id,
        this.options.runtimeContractVersion,
        module.runtimeContractVersion,
      );
    }

    for (const dependency of module.engineDependencies) {
      if (!this.options.hasMechanic(dependency)) {
        throw new MissingModuleDependencyError(module.id, dependency);
      }
    }

    this.modules.set(module.id, module);
  }

  getModule(id: string): TrustedGameModule | undefined {
    return this.modules.get(id);
  }

  listCompatibilityDiagnostics(): ModuleCompatibilityDiagnostic[] {
    return [...this.modules.values()].map((module) => ({
      moduleId: module.id,
      compatible: module.runtimeContractVersion === this.options.runtimeContractVersion,
      message:
        module.runtimeContractVersion === this.options.runtimeContractVersion
          ? "Compatible with current vNext runtime contract."
          : `Requires runtime contract ${module.runtimeContractVersion}; current is ${this.options.runtimeContractVersion}.`,
    }));
  }

  createModuleState(id: string): unknown {
    const module = this.modules.get(id);
    if (!module) {
      throw new Error(`Trusted game module "${id}" is not registered.`);
    }

    return module.createInitialState?.() ?? {};
  }
}
