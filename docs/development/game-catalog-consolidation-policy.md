# Agon Game Catalog Consolidation Policy

## Purpose
Prevent catalog growth from producing duplicate implementations while preserving genuinely different player experiences.

## Hard audience-boundary rule
**Agon/general games and Agon Kids games are separate player-facing product families. Do not merge a general/adult/family/teen Agon game into an Agon Kids game, or a Kids game into a general Agon game, merely because they share Scripture, theme, artwork, content, or mechanics.**

Cross-family consolidation happens below the GameDefinition layer: engines, capabilities, activity primitives, content metadata, Scripture relationships, BibleTextService, assets where suitable, Stage primitives, InputActions, scoring infrastructure, randomizers, persistence, and package dependencies.

A cross-family comparison may identify reuse, but its default disposition is `SHARE_INFRASTRUCTURE`, not `MERGE_GAME`.

## Audience families
### AGON_GENERAL
General/family/teen/adult competitive, strategic, party, tournament and learning games. A game may be family-friendly without becoming an Agon Kids game.

### AGON_KIDS
Purpose-designed child experiences, normally with explicit 3–5 and/or 6–10 profiles and Hear it -> Play it -> Say it -> Take it Home learning structure. Kids experiences may be cooperative, narrative, low-pressure or objective-challenge based.

Kids age profiles may share one Kids GameDefinition when they are intentional profiles of the same child experience. Do not automatically split 3–5 and 6–10 into separate games.

## Consolidation layers
1. **Engine/capability** — reusable mechanics with no game identity: Randomizer, Card/Deck, Ordering, Scripture Relationship, Board Play, Race, Journey, Progressive Clue, Bidding, Perspective Scenario, Memory Matching, etc.
2. **Activity/challenge** — bounded reusable interaction embeddable in a game/Journey/Gauntlet.
3. **Variant/profile** — configuration of the same dominant player loop for the same audience family.
4. **Journey/composite** — authored sequence of shared activities with persistent progression.
5. **Game** — player-facing identity with a distinctive repeatable decision/interaction loop.
6. **Audience-specific game** — a separate GameDefinition is allowed even when another family uses the same lower-level mechanics/theme.

## Duplicate test
Only consider merging two player-facing definitions when ALL are substantially true:
- same audience family;
- same dominant player decision loop;
- same participation pattern;
- same scoring/completion objective;
- same session shape/pacing;
- differences are primarily content/theme/presentation rather than rules;
- merging does not make How to Play materially more complicated.

Shared engine use alone is never evidence that two games are duplicates.

## Catalog review dispositions
- `KEEP_GAME` — distinct player-facing game.
- `KEEP_KIDS_GAME` — distinct Kids player-facing game.
- `MERGE_SAME_FAMILY` — merge only within the same audience family.
- `VARIANT_PROFILE` — same-family mode/profile of an existing game.
- `EMBEDDED_ACTIVITY` — reusable activity rather than top-level GameId.
- `JOURNEY_COMPOSITE` — authored journey/composite over shared activities.
- `SHARE_INFRASTRUCTURE` — cross-family similarity exists but both games remain separate.
- `SUPERSEDED` — later same-family definition fully replaces the earlier definition after requirements are migrated.

## Review process
For every proposed consolidation:
1. identify audience family before comparing mechanics;
2. compare against implemented games in that family;
3. compare against planned games in that family;
4. compare against Kids only for reusable infrastructure/content opportunities, never automatic GameId merging;
5. compare dominant player loop, not just Scripture/theme;
6. identify shared engines/activities/data/assets;
7. migrate every unique requirement before marking an issue superseded;
8. preserve backlinks from superseded issues to destination issues;
9. rerun catalog audit when new architecture substantially changes reuse options.

## Examples
- General strategic `Build the Temple` and a Kids temple-building activity may share Board/Construction primitives but remain separate games.
- A general Joseph strategy/deduction game and Kids `Joseph: From Pit to Palace` remain separate even though both use Joseph content; Scripture/content metadata may be shared.
- `David and Goliath: Five Stones` must be reviewed by audience intent. If a Kids profile becomes materially different from the general Gauntlet experience, it should be a separate Kids GameDefinition sharing Target/Gauntlet/Scripture infrastructure rather than being forced into one mixed-audience game.
- `Before & After` vs existing `Before Or After` can be merged/variant-reviewed because both are general-family chronology experiences; this is a legitimate same-family consolidation candidate.

## Packaging consequence
Shared engines/assets/content should be packaged once and referenced by both families where licensing and age/content suitability permit. Separate GameDefinitions do not require duplicated executable code or Scripture corpora.
