# Challenge Aid / Modifier Capability

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed
**Capability:** `challenge.aid` v1

## Purpose
Provide reusable, explicit, auditable gameplay modifiers earned by players/teams and consumed by challenge systems without coupling those modifiers to a particular game or narrative.

## Model
```ts
type ChallengeAidType =
  | 'EXTRA_TIME'
  | 'EXTRA_SUBMISSION'
  | 'HINT'
  | 'ELIMINATE_DISTRACTOR'
  | 'SCORE_PROTECTION';

interface ChallengeAidGrant {
  grantId: string;
  ownerId: string;
  type: ChallengeAidType;
  magnitude?: number;
  source: AidSource;
  scope: AidScope;
  expires?: AidExpiry;
  status: 'AVAILABLE' | 'RESERVED' | 'CONSUMED' | 'EXPIRED';
}
```

## Rules
- Aids modify gameplay/challenge parameters only.
- Consumption is authoritative and idempotent.
- Availability/eligibility is checked before consumption.
- Games may theme an aid visually (e.g. manna/provision), while the underlying capability remains generic.
- A campaign using CANONICAL narrative policy cannot bind an aid to narrative outcome/progression mutation.
- Accessibility accommodations are not represented as consumable aids and do not require earning/spending.

## Integration
Challenge engines/services expose supported modifier hooks. Example: `EXTRA_TIME` adds a configured number of seconds to the active challenge; `ELIMINATE_DISTRACTOR` requests a valid distractor-removal operation from a multiple-choice challenge.

Unsupported aid/challenge combinations are rejected before consumption. GameDefinition/activity templates declare which aid types are permitted.

## Multiplayer/fairness
Aid ownership can be player, team or shared according to game policy. Other teams can see only public information permitted by projection. Aids must not bypass answer authority or reveal another player's private answer.

## Persistence/replay
Persist grants, source, scope, state and consumption event. Restore cannot duplicate a consumed aid. Replay reproduces award/consume semantics.

## Testing
Cover award, reserve/consume, idempotency, expiry, unsupported modifier, simultaneous consumption, team ownership, privacy, persistence/replay, and canonical-campaign prohibition on narrative mutation.