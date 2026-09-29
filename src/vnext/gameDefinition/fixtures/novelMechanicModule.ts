/**
 * Reference trusted module fixture for #320. It proves the contract can load
 * a novel-mechanic module through the registry without Core importing a real
 * game implementation.
 */

import { asId } from "../../domain/ids";
import type { TrustedGameModule } from "../moduleContract";

export const referenceNovelMechanic = {
  id: asId<"MechanicId">("reference-novel-mechanic"),
};

export const referenceNovelMechanicModule: TrustedGameModule = {
  id: asId("reference-novel-mechanic-module"),
  version: "1",
  runtimeContractVersion: "vnext-runtime-contract-1",
  capabilities: ["novel-board-geometry"],
  projections: {
    mainStage: "reference-novel-stage",
    host: "reference-novel-host",
  },
  engineDependencies: [referenceNovelMechanic.id],
  persistenceHooks: ["challenge-session-v1"],
  assetDependencies: ["agon.core.ui"],
  contentDependencies: ["bible-event"],
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
      reason: "Reference module has not been exercised through Shared transport.",
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
      reason: "Reference module has not been exercised through Hosted transport.",
      requirements: {
        privatePlayerProjection: true,
        realtimeInput: false,
        simultaneousInput: false,
        localSiteAwareness: false,
        authority: "SERVER",
      },
    },
  },
  createInitialState: () => ({ visits: [] as string[] }),
};
