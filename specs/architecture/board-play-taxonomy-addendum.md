# Board Play Taxonomy Addendum

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed

## New implementation shape: Board Composite
Add `BOARD_COMPOSITE` / Board Orchestrator to the Agon game taxonomy.

A Board Composite owns logical board topology, turns, token movement, node/space action orchestration and board completion while consuming lower-level capabilities.

```text
CONTENT / DEFINITIONS
        |
CHALLENGE / MATCH / CLUE / ORDERING
        |
CARD + RANDOMIZER + TIMER + BUZZER
        |
     board.play
        |
BOARD COMPOSITE GAME
        |
(optional) Journey / Event composition
```

Board Play is parallel to—not a replacement for—Journey, Gauntlet, Race or other higher-order orchestrators.

## Spatial board model
Board Composite includes geometry-aware boards without assuming a rectangular grid. Overall board outlines may be rectangular, circular, star-shaped, map-shaped or arbitrary. Spaces may independently be circles, squares, rectangles, triangles, hexagons, polygons, image regions or custom shapes.

`SPATIAL` topology is used only when geometry/lattice relationships participate in rules. Spatial subtypes are `SQUARE_GRID`, `HEX_GRID`, `TRIANGULAR_GRID`, `CUSTOM_LATTICE` and `FREEFORM_COORDINATE`.

Generic Board Play spatial queries can expose adjacency, direction, distance, lines/alignment, jump candidates and regions/territories. Specialized game rules such as capture, multi-jump, blocking or territory scoring remain outside the generic engine unless separately generalized.

A Chinese-checkers-style star is therefore a valid Board Play layout: the star is presentation while node graph/lattice relationships provide legal adjacency/jump information.

## Catalog-analysis columns
Future catalog/refactoring analysis should record:
- `boardRole`: NONE | BOARD_OWNER | BOARD_PRIMITIVE_CONSUMER;
- `topology`: LINEAR | CIRCULAR | BRANCHING | GRAPH | TRACK | SPATIAL | N/A;
- `spatialSubtype`: SQUARE_GRID | HEX_GRID | TRIANGULAR_GRID | CUSTOM_LATTICE | FREEFORM_COORDINATE | N/A;
- `boardOutline`: RECTANGLE | CIRCLE | STAR | MAP | PATH | CUSTOM | N/A;
- `spaceShapes`: CIRCLE | SQUARE | RECTANGLE | TRIANGLE | HEXAGON | POLYGON | IMAGE_REGION | CUSTOM;
- `geometryRuleRelevant`: boolean;
- `movementSources`: FIXED | DICE | SPINNER | CARD | CHALLENGE | CUSTOM;
- `spaceActions`: challenge/card/randomizer/movement/score/custom capability list;
- `standingsBasis`: BOARD_FINISH | SCORE | OBJECTIVE | MIXED;
- `boardPackCandidate`: boolean.

## Consolidation impact
A board theme, shape or lattice is not automatically a distinct implementation. If two games differ mainly in board artwork/outline, space shapes, Scripture content, challenge profile, deck content or randomizer configuration, prefer separate GameDefinitions/content packs over separate Board engines.

A distinct GameId remains appropriate when the user-facing rules/learning objective are meaningfully different, even when both are declarative Board Play consumers.

## Pack architecture
Board packs depend on capabilities rather than bundling them. Installation/readiness must validate Board Play plus referenced Challenge/Card/Randomizer/etc. versions before the game is selectable/playable.

Spatial board packs may additionally contain declarative coordinate/lattice/region/layout data. This remains pack data unless genuinely novel executable rules are required.

This supports small themed downloadable packs and entitlement boundaries without multiplying executable code.