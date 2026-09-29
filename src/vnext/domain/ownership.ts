/**
 * Ownership hierarchy for the Agon vNext domain model (#362; design source:
 * specs/architecture/core-foundations-and-stage-orchestration.md section 13).
 *
 * Mechanic -> Game -> Variant -> Match -> Tournament -> Event.
 * Round/Turn/Attempt are session/game execution concepts, not Tournament rounds -
 * they are modeled separately in session.ts and must not be confused with
 * TournamentId/MatchId here.
 *
 * These types formalize *ownership*, not runtime behavior: a Mechanic must never
 * own Event score, a Game must never own transport, and a Variant must never
 * duplicate an entire GameDefinition rather than overlaying one.
 */

import type {
  ChallengeVersion,
  EventId,
  GameDefinitionId,
  GameVersion,
  MatchId,
  MechanicId,
  TournamentId,
  VariantId,
} from "./ids";

/** A reusable rule primitive (cards, buzzer, ordering, dice, ...). Owns no score or transport. */
export interface Mechanic {
  id: MechanicId;
  name: string;
}

/** A named playable ruleset/composition of one or more Mechanics. */
export interface GameDefinition {
  id: GameDefinitionId;
  version: GameVersion;
  name: string;
  mechanicIds: MechanicId[];
}

/** A constrained overlay on a GameDefinition. Must not duplicate the full definition. */
export interface Variant {
  id: VariantId;
  gameDefinitionId: GameDefinitionId;
  gameVersion: GameVersion;
  name: string;
}

/** One competitive instance of a Game/Variant between participants or teams. */
export interface Match {
  id: MatchId;
  gameDefinitionId: GameDefinitionId;
  gameVersion: GameVersion;
  variantId?: VariantId;
  tournamentId?: TournamentId;
}

/** A structure composed of Matches. */
export interface Tournament {
  id: TournamentId;
  eventId?: EventId;
  matchIds: MatchId[];
}

/** A broader multi-game/multi-session gathering structure. */
export interface Event {
  id: EventId;
  tournamentIds: TournamentId[];
}

/**
 * A persisted reference to a versioned/content-bearing entity. Includes
 * version/dependency metadata whenever behavior or content matters, per
 * core-foundations-and-stage-orchestration.md section 1's serialization rules.
 */
export interface VersionedReference {
  gameDefinitionId: GameDefinitionId;
  gameVersion: GameVersion;
  challengeVersion?: ChallengeVersion;
}
