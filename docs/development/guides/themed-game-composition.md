# Themed Game Composition Guide

## Rule of thumb
A biblical theme is a content/product concept, not automatically an engine boundary. Before creating a new implementation, classify it as content profile, presentation skin, variant, embeddable challenge, standalone game, composite game, orchestrator, or campaign.

## Scripture-history safety
When a game depicts a recorded event, player performance must not create an alternate biblical outcome. Prefer challenges that teach, reveal, order, classify, navigate, or visually reenact a fixed event while score measures player performance.

## Theme versus mechanic examples
- `Exodus Adventure` -> checkpoint/activity ideas inside Exodus Journey.
- `David and Goliath: Five Stones` -> themed Gauntlet definition unless unique rules emerge.
- `Armor of God` -> composite game over multiple challenge families with unique Stage presentation.
- `To the Churches` -> distinct catalog game over Classification/Match/Relationship capabilities.
- `Tower of Babel` -> distinct game because it introduces reusable asymmetric/restricted communication mechanics.

## Packaging
Game packs should declare capability dependencies and contain definitions, content and specialized assets. Shared executable engines belong in Core or capability modules. Do not copy a Challenge/Match/Ordering/Clue implementation into a themed pack.

## Promotion test
Promote a theme/profile to its own GameId when at least one is true:
1. it owns meaningful state/rules beyond an existing definition;
2. it has a distinct player decision loop;
3. it composes multiple engines into a stable recognizable experience;
4. it has a durable educational objective and presentation that users reasonably select as a game.

Do not promote solely because the Scripture topic, artwork, title, or content pool differs.

## Documentation metadata
Every game spec should record: catalog role; implementation shape; primary mechanic; capabilities consumed; whether it can be embedded; whether it consumes challenges/games; Scripture/canonical policy; participant modes; typical duration; pack ownership; and variant/consolidation family.