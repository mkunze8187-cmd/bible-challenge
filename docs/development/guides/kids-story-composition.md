# Kids Story Composition Guide

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../../../specs/agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

## Goal
Create rich kids Scripture experiences without turning every Bible story or classroom activity into a separate engine or duplicate GameId.

## Decision order
Before creating a Kids GameDefinition:
1. Search the catalog/issues/specs for the same story and the same primary play mechanic.
2. Check the definitive migration/catalog audit (#304/#331).
3. Determine whether the idea is best represented as existing-game content, a variant/overlay, an activity profile, a story/activity composition, or a genuinely distinct game.
4. Reuse shared activities/capabilities before proposing executable code.
5. Create a new GameId only when the player-facing rules/learning objective are meaningfully distinct and cannot be represented clearly as a profile/variant/composition.

## Story is not GameId
A Bible story can appear in many reusable challenge/content pools without becoming its own game. Conversely, a story may justify a named Kids Scripture Experience when it composes several activities into a coherent learning flow. The named experience should still be primarily declarative.

## Recommended composition
`Scripture scene -> reusable activity -> Scripture/story scene -> reusable activity -> review/memory -> Dig Deeper`

Candidate reusable activities include Challenge, Matching/Memory Matching, Ordering, Classification, Image Board/Search, Perspective Scenario, Board/Journey path, Target Challenge and Distribution Puzzle.

## Duplicate examples
- Zacchaeus search already belongs in `Who's in the Story?`; a larger Zacchaeus experience embeds that round instead of copying it.
- David/Goliath Five Stones already has #473; kids target/toss behavior extends that definition/profile rather than creating another Five Stones game.
- Creation already has `Let There Be…`, `Who Did God Make?` and Creation ordering content; a panorama/stations idea composes those rather than becoming another Creation GameId.
- Jonah ordering belongs in `What Happened Next?`; a Jonah story profile may compose it with route/map and story scenes but must not copy the ordering implementation.

## New capability threshold
Do not extract a new capability simply because one game can use it. First audit existing capabilities. Prefer extension when the abstraction remains coherent. For a novel small mechanic, prove reuse with a generic fixture and ideally more than one plausible consumer.

`Restoration/Make It Right` should initially be composition of existing primitives unless repeated consumers justify extraction. `Target Challenge` and `Distribution Puzzle` require explicit gap audits before implementation.

## Canonical-event boundary
Player success never determines whether a recorded biblical event occurs. Reenactment, puzzles and application can affect presentation/score only. Clearly label Scripture, Explanation and Application.

## Kids theological/scoring boundary
Score objective gameplay only. Do not quantify repentance, compassion, generosity, faith, humility, forgiveness, prayer quality, obedience worth, God's favor or salvation.

## Packaging
Prefer content packs containing GameDefinition/profile, activity sequence, Scripture references, artwork/audio, application scenarios, help/Dig Deeper and dependency manifest. Do not duplicate shared engine code or Bible text licensed through BibleTextService.

## Review checklist
- catalog/issue duplicate search completed;
- #304/#331 checked;
- existing GameIds/profiles reused where appropriate;
- capability dependencies declared;
- no unnecessary engine introduced;
- canonical event preserved;
- Scripture vs application clearly labeled;
- age profiles/accessibility reviewed;
- parent/host help included;
- package footprint primarily content/assets rather than executable duplication.