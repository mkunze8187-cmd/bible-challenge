/**
 * Canonical, opaque, version-safe identifiers for the Agon vNext domain model
 * (#362; design source: specs/architecture/core-foundations-and-stage-orchestration.md
 * section 1). IDs are branded string types so they are never accidentally
 * interchangeable and never accidentally derived from a display name.
 *
 * Identity IDs (Player/Team) and session-participant IDs (Participant) are
 * kept as distinct branded types even though both wrap a UUID string.
 */

declare const brand: unique symbol;

/** A branded string type: structurally a string, nominally distinct per Brand. */
export type Id<Brand extends string> = string & { readonly [brand]: Brand };

export type GameDefinitionId = Id<"GameDefinitionId">;
export type GameVersion = Id<"GameVersion">;
export type VariantId = Id<"VariantId">;
export type MechanicId = Id<"MechanicId">;
export type GameModuleId = Id<"GameModuleId">;

export type ContentId = Id<"ContentId">;
export type ChallengeId = Id<"ChallengeId">;
export type ChallengeVersion = Id<"ChallengeVersion">;

export type PlayerId = Id<"PlayerId">;
export type TeamId = Id<"TeamId">;
export type ParticipantId = Id<"ParticipantId">;

export type SiteId = Id<"SiteId">;
export type EndpointId = Id<"EndpointId">;
export type DisplayEndpointId = Id<"DisplayEndpointId">;

export type SessionId = Id<"SessionId">;
export type RoundId = Id<"RoundId">;
export type AttemptId = Id<"AttemptId">;

export type EventId = Id<"EventId">;
export type TournamentId = Id<"TournamentId">;
export type MatchId = Id<"MatchId">;

export type TranslationId = Id<"TranslationId">;
export type ProviderId = Id<"ProviderId">;

export type AssetId = Id<"AssetId">;
export type PackId = Id<"PackId">;

export type ScoreEntryId = Id<"ScoreEntryId">;
export type DomainEventId = Id<"DomainEventId">;
export type CommandId = Id<"CommandId">;

/**
 * Creates a new opaque ID of the given brand from a fresh UUID. Never pass a
 * display name or other human-authored string here - IDs must be able to
 * outlive a rename.
 */
export function createId<Brand extends string>(): Id<Brand> {
  return crypto.randomUUID() as Id<Brand>;
}

/**
 * Wraps an already-known string (e.g. one read back from persistence) as an
 * opaque ID of the given brand, without generating a new UUID. Use this only
 * for values that are already known to be valid IDs of that kind.
 */
export function asId<Brand extends string>(value: string): Id<Brand> {
  return value as Id<Brand>;
}
