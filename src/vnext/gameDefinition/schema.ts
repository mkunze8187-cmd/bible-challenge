/**
 * Versioned GameDefinition schema (#314; design source:
 * specs/architecture/modular-game-platform-distribution.md section 4).
 *
 * A GameDefinition declares rather than owns: capability/engine registration
 * and resolution live in registry.ts, not here.
 */

import type { GameDefinitionId, GameVersion, MechanicId } from "../domain/ids";

export interface PlayerCapabilities {
  min: number;
  max: number;
}

export interface GameCapabilities {
  players: PlayerCapabilities;
  tournament: boolean;
  gauntletStage: boolean;
}

export type RuntimeMode = "LOCAL" | "SHARED" | "HOSTED";
export type RuntimeSupportStatus = "SUPPORTED" | "NOT_VALIDATED" | "UNSUPPORTED";
export type RuntimeAuthorityRequirement = "LOCAL_HOST" | "SERVER" | "EITHER";

export interface RuntimeRequirements {
  privatePlayerProjection: boolean;
  realtimeInput: boolean;
  simultaneousInput: boolean;
  localSiteAwareness: boolean;
  authority: RuntimeAuthorityRequirement;
}

export interface RuntimeCompatibility {
  status: RuntimeSupportStatus;
  reason?: string;
  requirements: RuntimeRequirements;
}

export interface RuntimeCompatibilityMatrix {
  local: RuntimeCompatibility;
  shared: RuntimeCompatibility;
  hosted: RuntimeCompatibility;
}

/** A mechanic/engine dependency, by capability ID, that this definition requires at runtime. */
export interface MechanicDependency {
  mechanicId: MechanicId;
  /** Human-readable role this mechanic plays for this game, e.g. "challenge", "response". */
  role: string;
}

export interface ChallengeRequirements {
  contentTypes: string[];
}

export interface Projections {
  mainStage: string;
  playerController: string;
  host: string;
}

export interface GameDefinitionMetadata {
  name: string;
  family: string;
}

/**
 * A versioned, declarative description of a playable game. Interpreted by the
 * Game Runtime (#447-450) rather than owning behavior itself.
 */
export interface GameDefinition {
  id: GameDefinitionId;
  version: GameVersion;
  metadata: GameDefinitionMetadata;
  capabilities: GameCapabilities;
  mechanics: MechanicDependency[];
  challengeRequirements: ChallengeRequirements;
  randomizerPolicy: string;
  scoringPolicy: string;
  roundPolicy: string;
  difficultyPolicy: string;
  projections: Projections;
  persistencePolicy: string;
  runtimeCompatibility: RuntimeCompatibilityMatrix;
  assetDependencies: string[];
}

/**
 * JSON Schema (draft 2020-12) for GameDefinition, validated at build/install
 * registration time and defensively at runtime (registry.ts) per #314's scope.
 * IDs are validated as non-empty strings here - the branded Id<Brand> type
 * exists only at the TypeScript level and has no runtime representation.
 */
export const gameDefinitionJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "metadata",
    "capabilities",
    "mechanics",
    "challengeRequirements",
    "randomizerPolicy",
    "scoringPolicy",
    "roundPolicy",
    "difficultyPolicy",
    "projections",
    "persistencePolicy",
    "runtimeCompatibility",
    "assetDependencies",
  ],
  properties: {
    id: { type: "string", minLength: 1 },
    version: { type: "string", minLength: 1 },
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["name", "family"],
      properties: {
        name: { type: "string", minLength: 1 },
        family: { type: "string", minLength: 1 },
      },
    },
    capabilities: {
      type: "object",
      additionalProperties: false,
      required: ["players", "tournament", "gauntletStage"],
      properties: {
        players: {
          type: "object",
          additionalProperties: false,
          required: ["min", "max"],
          properties: {
            min: { type: "integer", minimum: 1 },
            max: { type: "integer", minimum: 1 },
          },
        },
        tournament: { type: "boolean" },
        gauntletStage: { type: "boolean" },
      },
    },
    mechanics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["mechanicId", "role"],
        properties: {
          mechanicId: { type: "string", minLength: 1 },
          role: { type: "string", minLength: 1 },
        },
      },
    },
    challengeRequirements: {
      type: "object",
      additionalProperties: false,
      required: ["contentTypes"],
      properties: {
        contentTypes: { type: "array", items: { type: "string", minLength: 1 } },
      },
    },
    randomizerPolicy: { type: "string", minLength: 1 },
    scoringPolicy: { type: "string", minLength: 1 },
    roundPolicy: { type: "string", minLength: 1 },
    difficultyPolicy: { type: "string", minLength: 1 },
    projections: {
      type: "object",
      additionalProperties: false,
      required: ["mainStage", "playerController", "host"],
      properties: {
        mainStage: { type: "string", minLength: 1 },
        playerController: { type: "string", minLength: 1 },
        host: { type: "string", minLength: 1 },
      },
    },
    persistencePolicy: { type: "string", minLength: 1 },
    runtimeCompatibility: {
      type: "object",
      additionalProperties: false,
      required: ["local", "shared", "hosted"],
      properties: {
        local: { $ref: "#/$defs/runtimeCompatibility" },
        shared: { $ref: "#/$defs/runtimeCompatibility" },
        hosted: { $ref: "#/$defs/runtimeCompatibility" },
      },
    },
    assetDependencies: { type: "array", items: { type: "string", minLength: 1 } },
  },
  $defs: {
    runtimeCompatibility: {
      type: "object",
      additionalProperties: false,
      required: ["status", "requirements"],
      properties: {
        status: { enum: ["SUPPORTED", "NOT_VALIDATED", "UNSUPPORTED"] },
        reason: { type: "string", minLength: 1 },
        requirements: { $ref: "#/$defs/runtimeRequirements" },
      },
      allOf: [
        {
          if: { properties: { status: { enum: ["NOT_VALIDATED", "UNSUPPORTED"] } } },
          then: { required: ["reason"] },
        },
      ],
    },
    runtimeRequirements: {
      type: "object",
      additionalProperties: false,
      required: [
        "privatePlayerProjection",
        "realtimeInput",
        "simultaneousInput",
        "localSiteAwareness",
        "authority",
      ],
      properties: {
        privatePlayerProjection: { type: "boolean" },
        realtimeInput: { type: "boolean" },
        simultaneousInput: { type: "boolean" },
        localSiteAwareness: { type: "boolean" },
        authority: { enum: ["LOCAL_HOST", "SERVER", "EITHER"] },
      },
    },
  },
} as const;
