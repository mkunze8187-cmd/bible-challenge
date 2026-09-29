/**
 * Reference fixture proving a simple existing legacy game (before-or-after)
 * can be described as a declarative GameDefinition without changing its
 * gameplay (#314 acceptance: "at least one simple existing game can
 * register/load from a definition without changing gameplay").
 *
 * This does not migrate before-or-after's actual rendering/gameplay - the
 * legacy implementation in src/lib/gameEngine.ts is untouched and keeps
 * running unmodified. This fixture only proves the schema/registry can
 * faithfully represent that game's shape, per the spec's own conceptual
 * example in specs/architecture/modular-game-platform-distribution.md
 * section 4.
 */

import { asId } from "../../domain/ids";
import type { GameDefinition } from "../schema";

export const beforeOrAfterMechanic = {
  id: asId<"MechanicId">("chronology-challenge"),
};

export const beforeOrAfterGameDefinition: GameDefinition = {
  id: asId("before-or-after"),
  version: asId("1"),
  metadata: {
    name: "Before or After",
    family: "chronology",
  },
  capabilities: {
    players: { min: 1, max: 4 },
    tournament: false,
    gauntletStage: true,
  },
  mechanics: [{ mechanicId: beforeOrAfterMechanic.id, role: "challenge" }],
  challengeRequirements: {
    contentTypes: ["bible-event"],
  },
  randomizerPolicy: "seeded-selection",
  scoringPolicy: "standard-challenge",
  roundPolicy: "configured-rounds",
  difficultyPolicy: "standard",
  projections: {
    mainStage: "before-after",
    playerController: "binary-choice",
    host: "standard-challenge-host",
  },
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
      reason: "Legacy-compatible definition has not been exercised through Shared transport.",
      requirements: {
        privatePlayerProjection: true,
        realtimeInput: false,
        simultaneousInput: false,
        localSiteAwareness: false,
        authority: "EITHER",
      },
    },
    hosted: {
      status: "NOT_VALIDATED",
      reason: "Legacy-compatible definition has not been exercised through Hosted transport.",
      requirements: {
        privatePlayerProjection: true,
        realtimeInput: false,
        simultaneousInput: false,
        localSiteAwareness: false,
        authority: "SERVER",
      },
    },
  },
  assetDependencies: ["agon.core.ui"],
};
