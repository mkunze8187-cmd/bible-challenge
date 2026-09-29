import { compareVersions, parseVersion } from "./semver";
import {
  InvalidEngineDescriptorError,
  type EngineCapability,
  type EngineContext,
  type EngineFactory,
  type EngineSnapshot,
} from "./types";

export interface EngineCapabilityPin {
  capability: string;
  version: string;
}

export interface EngineSessionPin {
  engineId: string;
  engineVersion: string;
  stateSchemaVersion?: number;
  capabilities: EngineCapabilityPin[];
}

export interface PersistedEngineSnapshot<State = unknown> {
  snapshotVersion: "engine-snapshot.v1";
  pin: EngineSessionPin;
  state: State;
}

export interface EngineSnapshotMigration<FromState = unknown, ToState = unknown> {
  engineId: string;
  fromSchemaVersion: number;
  toSchemaVersion: number;
  migrate(state: FromState): ToState;
}

export class IncompatibleEngineSnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncompatibleEngineSnapshotError";
  }
}

export class MissingEngineSnapshotMigrationError extends Error {
  constructor(
    public readonly engineId: string,
    public readonly fromSchemaVersion: number,
    public readonly toSchemaVersion: number,
  ) {
    super(
      `No migration registered for engine "${engineId}" schema ${fromSchemaVersion} -> ${toSchemaVersion}.`,
    );
    this.name = "MissingEngineSnapshotMigrationError";
  }
}

export function createEngineSessionPin(factory: EngineFactory): EngineSessionPin {
  return {
    engineId: factory.descriptor.engineId,
    engineVersion: factory.descriptor.version,
    stateSchemaVersion: factory.descriptor.stateSchemaVersion,
    capabilities: factory.descriptor.provides.map((capability) => ({
      capability: capability.capability,
      version: capability.version,
    })),
  };
}

export function persistEngineSnapshot<State>(
  factory: EngineFactory<unknown, State>,
  snapshot: EngineSnapshot<State>,
): PersistedEngineSnapshot<State> {
  if (snapshot.engineId !== factory.descriptor.engineId) {
    throw new IncompatibleEngineSnapshotError(
      `Snapshot engine "${snapshot.engineId}" does not match factory "${factory.descriptor.engineId}".`,
    );
  }

  return {
    snapshotVersion: "engine-snapshot.v1",
    pin: createEngineSessionPin(factory),
    state: snapshot.state,
  };
}

export class EngineSnapshotMigrationRegistry {
  private readonly migrations = new Map<string, EngineSnapshotMigration>();

  registerMigration(migration: EngineSnapshotMigration): void {
    if (migration.toSchemaVersion <= migration.fromSchemaVersion) {
      throw new InvalidEngineDescriptorError("Engine snapshot migrations must move to a newer schema version.");
    }

    this.migrations.set(this.key(migration.engineId, migration.fromSchemaVersion, migration.toSchemaVersion), migration);
  }

  restore<State>(
    factory: EngineFactory<unknown, State>,
    persisted: PersistedEngineSnapshot,
    context: EngineContext,
  ) {
    this.assertCompatibleEngineVersion(factory, persisted);

    const targetSchemaVersion = factory.descriptor.stateSchemaVersion ?? 0;
    const sourceSchemaVersion = persisted.pin.stateSchemaVersion ?? 0;
    if (sourceSchemaVersion > targetSchemaVersion) {
      throw new IncompatibleEngineSnapshotError(
        `Snapshot schema ${sourceSchemaVersion} is newer than engine "${factory.descriptor.engineId}" supports (${targetSchemaVersion}).`,
      );
    }

    const state = this.migrateState(persisted.pin.engineId, sourceSchemaVersion, targetSchemaVersion, persisted.state);
    const snapshot: EngineSnapshot<State> = {
      engineId: persisted.pin.engineId,
      engineVersion: factory.descriptor.version,
      stateSchemaVersion: targetSchemaVersion,
      state: state as State,
    };
    return factory.restore(snapshot, context);
  }

  private migrateState(engineId: string, from: number, to: number, initialState: unknown): unknown {
    let currentSchema = from;
    let state = initialState;
    while (currentSchema < to) {
      const migration = this.migrations.get(this.key(engineId, currentSchema, currentSchema + 1));
      if (!migration) {
        throw new MissingEngineSnapshotMigrationError(engineId, currentSchema, currentSchema + 1);
      }
      state = migration.migrate(state);
      currentSchema = migration.toSchemaVersion;
    }

    return state;
  }

  private assertCompatibleEngineVersion(factory: EngineFactory, persisted: PersistedEngineSnapshot): void {
    if (persisted.pin.engineId !== factory.descriptor.engineId) {
      throw new IncompatibleEngineSnapshotError(
        `Snapshot engine "${persisted.pin.engineId}" does not match factory "${factory.descriptor.engineId}".`,
      );
    }

    const saved = parseVersion(persisted.pin.engineVersion);
    const current = parseVersion(factory.descriptor.version);
    if (saved.major > current.major || compareVersions(persisted.pin.engineVersion, factory.descriptor.version) > 0) {
      throw new IncompatibleEngineSnapshotError(
        `Snapshot engine version "${persisted.pin.engineVersion}" is newer than registered "${factory.descriptor.version}".`,
      );
    }
  }

  private key(engineId: string, from: number, to: number): string {
    return `${engineId}:${from}->${to}`;
  }
}

export function toSharedCapabilityMetadata(pin: EngineSessionPin): EngineCapability[] {
  return pin.capabilities.map((capability) => ({ ...capability }));
}
