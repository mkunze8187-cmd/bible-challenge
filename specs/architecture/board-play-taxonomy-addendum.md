# Board Play Taxonomy Addendum

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

## Catalog-analysis columns
Future catalog/refactoring analysis should record:
- `boardRole`: NONE | BOARD_OWNER | BOARD_PRIMITIVE_CONSUMER;
- `topology`: LINEAR | CIRCULAR | BRANCHING | GRAPH | TRACK | N/A;
- `movementSources`: FIXED | DICE | SPINNER | CARD | CHALLENGE | CUSTOM;
- `spaceActions`: challenge/card/randomizer/movement/score/custom capability list;
- `standingsBasis`: BOARD_FINISH | SCORE | OBJECTIVE | MIXED;
- `boardPackCandidate`: boolean.

## Consolidation impact
A board theme is not automatically a distinct implementation. If two games differ mainly in board artwork, Scripture content, challenge profile, deck content or randomizer configuration, prefer separate GameDefinitions/content packs over separate Board engines.

A distinct GameId remains appropriate when the user-facing rules/learning objective are meaningfully different, even when both are declarative Board Play consumers.

## Pack architecture
Board packs depend on capabilities rather than bundling them. Installation/readiness must validate Board Play plus referenced Challenge/Card/Randomizer/etc. versions before the game is selectable/playable.

This supports small themed downloadable packs and entitlement boundaries without multiplying executable code.