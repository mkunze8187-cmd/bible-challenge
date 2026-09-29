import { describe, expect, it } from "vitest";
import {
  asId,
  createId,
  type AssetId,
  type AttemptId,
  type ChallengeId,
  type ChallengeVersion,
  type CommandId,
  type ContentId,
  type DisplayEndpointId,
  type DomainEventId,
  type EndpointId,
  type EventId,
  type GameDefinitionId,
  type GameVersion,
  type MatchId,
  type MechanicId,
  type PackId,
  type ParticipantId,
  type PlayerId,
  type ProviderId,
  type RoundId,
  type ScoreEntryId,
  type SessionId,
  type SiteId,
  type TeamId,
  type TournamentId,
  type TranslationId,
  type VariantId,
} from "../src/vnext/domain/ids";
import type { VersionedReference } from "../src/vnext/domain/ownership";

describe("vNext domain IDs", () => {
  it("createId produces a UUID-shaped opaque string for every domain ID brand", () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const ids: string[] = [
      createId<"GameDefinitionId">(),
      createId<"GameVersion">(),
      createId<"VariantId">(),
      createId<"MechanicId">(),
      createId<"ContentId">(),
      createId<"ChallengeId">(),
      createId<"ChallengeVersion">(),
      createId<"PlayerId">(),
      createId<"TeamId">(),
      createId<"ParticipantId">(),
      createId<"SiteId">(),
      createId<"EndpointId">(),
      createId<"DisplayEndpointId">(),
      createId<"SessionId">(),
      createId<"RoundId">(),
      createId<"AttemptId">(),
      createId<"EventId">(),
      createId<"TournamentId">(),
      createId<"MatchId">(),
      createId<"TranslationId">(),
      createId<"ProviderId">(),
      createId<"AssetId">(),
      createId<"PackId">(),
      createId<"ScoreEntryId">(),
      createId<"DomainEventId">(),
      createId<"CommandId">(),
    ];

    for (const id of ids) {
      expect(id).toMatch(uuidPattern);
    }
  });

  it("createId never derives an ID from a display name - two IDs for the same name differ", () => {
    const first = createId<"PlayerId">();
    const second = createId<"PlayerId">();
    expect(first).not.toBe(second);
  });

  it("IDs round-trip through JSON serialization as plain strings", () => {
    const playerId: PlayerId = createId<"PlayerId">();
    const teamId: TeamId = createId<"TeamId">();
    const participantId: ParticipantId = createId<"ParticipantId">();

    const payload = { playerId, teamId, participantId };
    const roundTripped = JSON.parse(JSON.stringify(payload));

    expect(roundTripped.playerId).toBe(playerId);
    expect(roundTripped.teamId).toBe(teamId);
    expect(roundTripped.participantId).toBe(participantId);
    // identity vs. session-participant IDs are distinct brands, never interchangeable
    expect(roundTripped.playerId).not.toBe(roundTripped.participantId);
  });

  it("asId re-wraps a known string without minting a new value", () => {
    const persistedValue = "11111111-1111-4111-8111-111111111111";
    const id = asId<"SessionId">(persistedValue);
    expect(id).toBe(persistedValue);
  });

  it("exposes every ID brand named in core-foundations-and-stage-orchestration.md section 1", () => {
    // Compile-time check: this only typechecks if every listed brand still exists.
    const _typeCheck: [
      GameDefinitionId,
      GameVersion,
      VariantId,
      MechanicId,
      ContentId,
      ChallengeId,
      ChallengeVersion,
      PlayerId,
      TeamId,
      ParticipantId,
      SiteId,
      EndpointId,
      DisplayEndpointId,
      SessionId,
      RoundId,
      AttemptId,
      EventId,
      TournamentId,
      MatchId,
      TranslationId,
      ProviderId,
      AssetId,
      PackId,
      ScoreEntryId,
      DomainEventId,
      CommandId
    ] = [
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
      createId(),
    ];
    expect(_typeCheck).toHaveLength(26);
  });
});

describe("VersionedReference serialization", () => {
  it("round-trips a pinned game/challenge version through JSON", () => {
    const reference: VersionedReference = {
      gameDefinitionId: createId<"GameDefinitionId">(),
      gameVersion: createId<"GameVersion">(),
      challengeVersion: createId<"ChallengeVersion">(),
    };

    const roundTripped: VersionedReference = JSON.parse(JSON.stringify(reference));

    expect(roundTripped).toEqual(reference);
  });

  it("omits challengeVersion when content versioning doesn't apply", () => {
    const reference: VersionedReference = {
      gameDefinitionId: createId<"GameDefinitionId">(),
      gameVersion: createId<"GameVersion">(),
    };

    const roundTripped: VersionedReference = JSON.parse(JSON.stringify(reference));

    expect(roundTripped.challengeVersion).toBeUndefined();
    expect(roundTripped).toEqual(reference);
  });
});
