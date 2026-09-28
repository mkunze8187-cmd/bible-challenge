# Scripture Relationship Engine Developer Guide

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../../../specs/agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed STABLE target
**Game spec:** `specs/games/scripture-chain.md`

The Scripture Relationship Engine models reviewed relationships between canonical Bible passages and provides graph validation/generation services reusable by Scripture Chain and future study/game mechanics.

## Boundary
The engine owns passage nodes, relationship edges, topology validation, allowed relationship filters, solution validation and deterministic puzzle graph generation. It does not own Bible text retrieval, UI, scoring, timers, licensing or content approval.

Bible text comes from BibleTextService. Published relationship records come from the content/provenance system. Random generation uses Agon's RNG service.

## Core model
A node is a canonical verse or passage range. An edge records source/target, relationship type, traversal semantics, roles when directional, reviewed explanation, difficulty, optional translation scope, provenance and review status.

Relationship types initially include theme/concept, person, place, event, quotation/allusion, prophecy/fulfillment, promise/fulfillment, parallel account, shared wording, cause/result and chronology.

## Validation
Do not compare player chains to one stored sequence. Validate each required adjacency against eligible approved graph edges. Multiple complete solutions are valid.

For circular puzzles normalize rotations. Reverse ordering is equivalent only when directional constraints do not distinguish it.

## Translation rule
Canonical relationships should be translation-neutral where possible. Wording-dependent edges explicitly declare translation scope and are filtered before puzzle generation. Never embed copyrighted translation text into relationship records as a workaround for translation licensing.

## Content rule
Runtime-generated theological relationships are not authoritative content. AI/automation may suggest authoring candidates, but ordinary game play uses reviewed/approved relationship records with provenance.

## Generator rule
Puzzle generation is deterministic under injected RNG and persists enough definition/relationship revision identity for replay/resume. Generators verify solvability and constrain ambiguity according to mode/difficulty rather than assuming one solution.

## Consumers
Initial consumer is Scripture Chain with Next Link, Ordered Chain, Missing Link, Circular Chain, Broken Chain, Destination and Relationship modes. Future consumers may use the engine without depending on Scripture Chain UI or scoring.

## Testing
Contract/property tests should cover traversal direction, filters, alternate solutions, topology normalization, translation eligibility, deterministic generation, impossible graphs, ambiguity thresholds and pinned relationship revisions.