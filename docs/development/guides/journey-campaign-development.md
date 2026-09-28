# Journey / Campaign Development Guide

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../../../specs/agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed STABLE developer guidance
**Architecture:** `specs/engines/journey-campaign-engine.md`

## Canonical Scripture campaigns
Use `narrativePolicy: CANONICAL` for campaigns reenacting recorded biblical history. Treat canonical checkpoints/outcomes as immutable authored content. Player performance may change score, challenge presentation and Challenge Aids, but never Scripture.

A code review should reject any canonical-campaign rule equivalent to `if score < X then biblicalEventDoesNotHappen`.

## Separate five concerns
1. **Journey progression:** reviewed canonical checkpoints/references and the session's shared position.
2. **Participation format:** ALL_PLAY, TEAM_PLAY, BUZZER, HEAD_TO_HEAD, TOURNAMENT, RELAY, SHARED_COOPERATIVE or SOLO.
3. **Activity mechanic:** capability/template used at a checkpoint.
4. **Challenge content:** query/pool supplying questions; normally configurable independently of checkpoint subject.
5. **Scoring/outcome:** participant Score Ledger points plus optional gameplay-only aid grants/placement bonuses.

This separation creates replayability and competitive variety without alternate history.

## Shared progression vs participant state
A shared canonical multiplayer campaign has exactly one session-owned `JourneyProgress`. Do not store canonical map/checkpoint position on each team/player. All participants advance checkpoints together.

Store competitive state separately per participant/team: Score Ledger reference, Challenge Aids, statistics and activity results. Final standings are calculated from cumulative points, not canonical journey position.

A head-to-head or tournament activity is a competition **inside the current shared checkpoint**. Losing a matchup never leaves that team at an earlier biblical location. When the checkpoint resolves, all participants advance together.

## Participation modes
Checkpoint definitions should declare allowed participation modes and a default rather than hard-code one global multiplayer style. Reuse Agon's tournament, relay, buzzer and private simultaneous-answer capabilities where applicable. Ordinary challenge points remain available in head-to-head/tournament activities; configured placement bonuses are additive through Score Ledger.

## Activity templates
Prefer Engine SDK capability composition over campaign-specific mini-game implementations. A checkpoint declares the capability/template it needs. Prepare Event/readiness verifies all required capabilities/content before play.

## Challenge content independence
The checkpoint's biblical theme does not automatically constrain its question pool. Unless a template explicitly requires story-specific content, use the Host/session content query. This allows the same checkpoint to remain fresh across playthroughs while the canonical narrative remains unchanged.

## Challenge Aids
Use `challenge.aid` for earned modifiers such as extra time, hints, distractor elimination or extra submissions. Themes may call an aid manna/provision/etc., but persistence/authority uses generic grants. Aids never mutate canonical progression. Accessibility accommodations are not aids.

## Stage guidance
Shared canonical campaigns render one journey position/map progression. Temporary activity presentation may show separate competitors, race lanes, brackets or boards, but those visuals must not imply that competitors occupy different canonical narrative locations.

## Content review
Canonical summaries, Scripture-event mappings and story-specific explanations require reviewed provenance. General challenge pools can reuse existing approved Agon content. Bible text remains provided through BibleTextService under translation licensing policy.

## Persistence
Pin campaign/content revisions needed to resume. Persist one shared logical JourneyProgress plus separate participant competitive state; do not persist animation state. Canonical checkpoint history is append-only from the gameplay perspective; corrections to source content use content revision/migration processes.

## Reuse
Before adding a new biblical journey, determine whether it is content over `journey.campaign` rather than a new engine. Paths of Paul and similar geographic/chronological journeys should normally reuse this capability.