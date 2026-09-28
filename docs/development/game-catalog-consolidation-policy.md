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
Purpose-designed child experiences, normally with explicit age/profile expectations and Hear it -> Play it -> Say it -> Take it Home or Story -> Make/Play -> Remember -> Take Home learning structure. Kids experiences may be cooperative, narrative, low-pressure, Activity Events, Journeys or objective-challenge based.

Kids age profiles may share one Kids GameDefinition when they are intentional profiles of the same child experience. Do not automatically split age profiles into separate games.

## Consolidation layers
1. **Engine/capability** — reusable mechanics with no game identity: Randomizer, Card/Deck, Ordering, Scripture Relationship, Board Play, Race, Journey, Progressive Clue, Bidding, Perspective Scenario, Memory Matching, etc.
2. **Activity/challenge** — bounded reusable interaction embeddable in a game/Journey/Gauntlet/Activity Event.
3. **Variant/profile** — configuration of the same dominant player loop for the same audience family.
4. **Journey/composite** — authored sequence of shared activities with persistent progression.
5. **Game** — player-facing identity with a distinctive repeatable decision/interaction loop.
6. **Audience-specific game/experience** — a separate GameDefinition, Journey or Activity Event is allowed even when another family uses the same lower-level mechanics/theme.

## Duplicate test
Only consider merging two player-facing definitions when ALL are substantially true:
- same audience family;
- same dominant player decision/learning loop;
- same participation pattern;
- same scoring/completion objective;
- same session shape/pacing;
- differences are primarily content/theme/presentation rather than rules;
- merging does not make How to Play materially more complicated.

Shared engine use, shared Scripture, or shared artwork alone is never evidence that two games are duplicates.

## Catalog review dispositions
- `KEEP_GAME` — distinct player-facing general game.
- `KEEP_GAME_PENDING_REDESIGN` — general game identity retained but same-family mechanic differentiation still required.
- `KEEP_KIDS_GAME` — distinct Kids player-facing game/experience.
- `MERGE_SAME_FAMILY` — merge only within the same audience family.
- `VARIANT_PROFILE` — same-family mode/profile of an existing game.
- `EMBEDDED_ACTIVITY` — reusable activity rather than top-level GameId.
- `JOURNEY_COMPOSITE` — authored journey/composite over shared activities.
- `SHARE_INFRASTRUCTURE` — cross-family similarity exists but both player-facing experiences remain separate.
- `SUPERSEDED` — later same-family definition fully replaces the earlier definition after requirements are migrated.

## Review process
For every proposed consolidation:
1. identify audience family before comparing mechanics;
2. compare against implemented experiences in that family;
3. compare against planned experiences in that family;
4. compare against the other audience family only for reusable infrastructure/content opportunities, never automatic player-facing merging;
5. compare dominant player loop, not just Scripture/theme;
6. identify shared engines/activities/data/assets;
7. migrate every unique requirement before marking an issue superseded;
8. preserve backlinks from superseded issues to destination issues;
9. rerun catalog audit when new architecture substantially changes reuse options.

## New proposal checklist
Every new Game, Kids Game, Journey, Activity Event or composed player-facing proposal should state:
- `Audience family: AGON_GENERAL | AGON_KIDS`;
- target age/profile where relevant;
- dominant player loop;
- participation model;
- scoring/completion objective;
- expected session shape/pacing;
- engines/capabilities reused;
- same-family duplicate/variant candidates reviewed;
- cross-family similarities classified as infrastructure/content reuse rather than merge candidates.

A proposal should not say that it is "merged into" an experience from the other audience family. Instead identify the shared capability/content relationship and retain separate player-facing definitions unless the audience classification itself was wrong.

## Mixed-profile rule
A general GameDefinition should not gain a Kids profile merely because the same Bible story can be simplified. Before adding a Kids profile to a general game, verify that the dominant loop, participation, completion/scoring, pacing and How-to-Play remain substantially the same. If the Kids experience adds a child learning loop, gentleness rules, narrated reenactment, materially simplified interaction, different scoring/completion, or different session structure, create a separate AGON_KIDS definition and share lower-level infrastructure.

Likewise, a Kids definition should not become the destination for a general competitive/strategic game simply because the Kids experience already has the same Scripture/theme.

## Examples
- General strategic `Build the Temple` #224 and Kids Bible Builders #326/#334 share Board/Construction/Image Board primitives and content metadata but remain separate player-facing experiences.
- General `Road to Damascus` #227 and Kids `Saul: Turned Around` #506 share Acts 9 metadata, Journey/map/reveal capabilities and suitable assets, but neither GameDefinition absorbs the other.
- A general Joseph strategy/deduction game and a Kids Joseph Story Journey remain separate even though both use Joseph content; Scripture/content metadata may be shared.
- `David and Goliath: Five Stones` #473 is general first. A proposed Kids sling/Target experience must pass the mixed-profile test; if its learning flow/pacing/scoring differs materially, it becomes a separate Kids definition sharing Gauntlet/Target/Scripture infrastructure.
- `Before & After` vs existing `Before Or After` can be merged/variant-reviewed because both are general-family chronology experiences; this is a legitimate same-family consolidation candidate.

## Packaging consequence
Shared engines/assets/content should be packaged once and referenced by both families where licensing and age/content suitability permit. Separate player-facing definitions do not require duplicated executable code or Scripture corpora.

## Tracking
Catalog-wide application of this policy is tracked by #507. The #200–#233 audience-safe review is documented in `docs/development/candidate-games-200-233-consolidation-review.md`.