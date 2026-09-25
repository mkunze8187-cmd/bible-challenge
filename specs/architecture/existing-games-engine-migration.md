# Existing Games — Shared Engine & Randomizer Migration Specification

## Purpose
Audit and incrementally refactor the games already implemented in Agon so they consume the reusable engines now being introduced instead of retaining parallel game-specific implementations for common mechanics.

This is a **behavior-preserving architecture migration first**. Do not redesign a working game merely because a new engine exists. New randomizers are adopted only where they improve the mechanic or presentation rather than adding ceremony.

## Goals
- reduce duplicated shuffle/random-selection, card/tile, ordering, challenge, timer, scoring, persistence, controller and Host logic
- make existing games compatible with future Gauntlet/Event/Tournament integrations through explicit capability adapters
- centralize deterministic RNG and recovery behavior
- preserve existing game identity, content schemas and scoring unless a separate approved issue changes them
- make randomizer use intentional and semantically meaningful
- keep migrations small enough for Codex to implement/test one issue at a time

## Non-goals
- no wholesale rewrite of all games
- no forced Dice/Spinner/Wheel/Casting Lots integration
- no changing game rules simply to demonstrate an engine
- no combining distinct games just because they share mechanics
- no new gambling/betting semantics

---

## Migration decision matrix
Every implemented game should be evaluated against:
- Challenge Engine
- Card/Tile/Deck Engine
- Ordering/Sequence Engine
- Reveal Engine
- Progressive Clue Engine
- Bible Navigation/Find-It Engine
- deterministic RNG/randomizer service
- Dice Engine
- Spinner/Wheel Engine
- Casting Lots Engine
- Timer
- Buzzer/lockout
- scoring ledger
- persistent Game Session
- Player Controller
- Host Remote
- GauntletStageAdapter
- Tournament capability

Each cell is classified `REQUIRED`, `RECOMMENDED`, `OPTIONAL`, or `N/A`, with a short reason. The audit is a maintained architecture artifact and should be updated as new engines/games appear.

---

## Migration groups

### A. Card/tile + deterministic shuffle — high priority
These games already model shuffled cards/tiles or matching/grouping and should reuse the generalized Card/Tile/Deck Engine rather than own shuffle/deal/state primitives:
- Prophecy Match
- Wisdom Match
- Bible Connections
- Prophecy Categories
- Proverb Categories

Requirements:
- preserve current visible rules and content schema
- map existing logical items to generic card/tile entities
- use authoritative seeded shuffle/deal/order state
- persist deck/tile identity and order before presentation
- reconnect never reshuffles
- scoring remains through shared ledger
- game-specific matching/category validation remains in game adapter/domain logic

### B. Ordering/sequence + tile shuffle — high priority
- Bible Timeline
- Bible Books Relay
- Verse Scramble

Requirements:
- shared ordered-source -> deterministic shuffle -> player arrangement -> authoritative validation pipeline
- generic drag/reorder controller primitives where appropriate
- preserve each game's distinct correctness/scoring rules
- do not turn all three into the same visual game
- expose compact single-attempt Gauntlet adapters where practical

### C. Progressive clue family — high priority
- Five Clues
- Name That Book
- Prophecy Clue Ladder

Create/reuse a shared progressive-clue abstraction for ordered clues, reveal state, attempt windows, clue-value/score effects, steal/buzzer integration where applicable, deterministic clue/challenge selection, review and recovery.

Game-specific board shape, clue semantics and scoring stay in adapters/configuration.

Five Clues may use the Card/Deck Engine for seeded challenge-board/deck construction if that cleanly models its existing board; do not force physical-card presentation if it harms the established game UI.

### D. Shared Challenge Engine — broad migration
Strong candidates include:
- Before Or After
- Who Said It?
- Two Truths and a Lie
- Missing Word
- Complete the Verse
- Messiah Prophecy
- Psalm Theme
- Fulfillment Finder
- Psalm Reference Finder
- Reference Rush
- Chapter Finder
- Bible Anagrams where challenge lifecycle fits

Move common lifecycle to Challenge Engine: select/generate -> private/public projection -> answer -> evaluate/adjudicate -> score -> review/reference -> persist.

Game-specific response evaluators remain pluggable.

### E. Bible navigation/reference family
- Chapter Finder
- Reference Rush
- Psalm Reference Finder
- Find-It style future games

Share Scripture-reference parsing, canonical book normalization, reference display, navigation timing/profile rules and challenge contracts where applicable. Do not erase differences between identifying a reference and physically locating Scripture.

### F. Reveal engine
- Verse Reveal / Scripture Puzzles
- future Unveiled mechanics where reusable primitives overlap

Extract only genuinely reusable reveal primitives: hidden units/regions, reveal transactions, solved state, deterministic puzzle selection, projector transitions and persistence. Do not make Verse Reveal depend on Unveiled's multi-card clue rules.

---

## Randomizer policy
Randomizers are gameplay/presentation tools, not decorations.

### Deterministic random selection is the default
All games that randomly choose questions, tiles, clues, categories, etc. should ultimately consume the shared seeded RNG/random-selection service so sessions are recoverable and testable.

### Card/deck randomizer — recommended conversions
Use generalized Card/Deck shuffle/deal where the domain already behaves like a deck:
- Prophecy Match
- Wisdom Match
- Bible Connections
- Prophecy Categories
- Proverb Categories
- Verse Scramble / Bible Books Relay / Bible Timeline may consume the underlying tile/deck shuffle primitive without adopting playing-card visuals
- Five Clues board generation if cleanly represented as a challenge deck

### Spinner/Wheel — optional variants, not replacements
Potential meaningful optional variant:
- Before Or After: Spinner/Wheel selects chronology domain/category (Patriarchs, Kings, Prophets, Life of Jesus, Acts, Paul's journeys, Whole Bible), then Challenge Engine selects an eligible event pair.

The wheel result must constrain gameplay. It must not merely animate a category that was already randomly selected invisibly.

Potential future category-selection variants may be added only when they create a real player-visible rule.

### Scroll/card draw presentation — optional
Who Said It? and similar quotation/clue games may optionally present the selected challenge as an Agon scroll/card draw using shared deck primitives. This is presentation plus deterministic draw, not a rule change.

### Dice / Casting Lots
Do **not** retrofit these into existing games by default. Add only under a separately approved variant where the roll/lot meaningfully changes challenge type, difficulty, movement, resources or another actual rule.

### No randomizer conversion recommended initially
Keep primary mechanics challenge-driven for:
- Verse Typing Race
- Relay Verse Build
- Word Ladder
- Bible Anagrams
- Bible Cryptogram
- Missing Word
- Complete the Verse
- Chapter Finder
- Reference Rush
- Messiah Prophecy
- Psalm Theme

They still migrate to shared RNG for challenge selection where applicable.

---

## Gauntlet compatibility audit
Do not make every game a Gauntlet stage. Add `GauntletStageAdapter` only when one bounded attempt can resolve inside one synchronized Gauntlet Round.

Strong initial candidates:
- Before Or After
- Who Said It?
- Missing Word
- Complete the Verse
- Chapter Finder
- Reference Rush
- Two Truths and a Lie
- compact Bible Timeline ordering attempt
- compact Bible Books Relay ordering attempt
- compact Prophecy Match attempt
- Psalm Reference Finder
- Fulfillment Finder

Possible after adapter design:
- Verse Scramble
- Wisdom Match
- category sorting games
- Bible Anagrams

Not automatically suitable:
- full Verse Reveal puzzle
- full Five Clues board
- long clue ladders
- Verse Typing Race if it would make Gauntlet round duration unfair
- any multi-round/full-game mechanic

Each adapter must declare duration expectations, controller requirements, supported difficulty profiles, score behavior, success condition, and whether it can serve Final Gate.

---

## Tournament capability audit
Do not mark a game tournament-capable solely because it supports multiple teams. Explicitly declare competition capabilities:
- min/max simultaneous teams
- head-to-head requirement
- deterministic winner/tie output
- tournament suitability
- compatible tournament formats
- supported tiebreak metrics

Existing games remain Event challenges even if not tournament games.

---

## Migration safety rules
1. Behavior-preserving migration before optional variants.
2. Existing content files/schema remain readable; migrations/versioning must be explicit if schema changes are unavoidable.
3. Persist engine/version/config snapshots needed for session recovery.
4. Shared engine state is server-authoritative.
5. RNG seed/state is persisted before randomized output is exposed.
6. Score operations are idempotent transaction/ledger operations.
7. Reconnect cannot reshuffle, redraw, regenerate, reveal early, duplicate score or alter result.
8. Host correction/void/replay uses audited shared flows.
9. Private controller data never leaks to projector payload.
10. Full/Reduced/Off motion affects presentation only.

---

## Implementation sequence
1. Complete and publish the migration matrix against current implemented game registry.
2. Ensure foundational shared engines/contracts exist and are stable enough for migration.
3. Migrate Card/Tile family.
4. Migrate Ordering family.
5. Migrate Progressive Clue family.
6. Migrate broad Challenge Engine family and Bible-navigation common services.
7. Migrate Reveal primitives.
8. Add Gauntlet adapters after each underlying game is stable on shared engines.
9. Add optional meaningful randomizer variants after behavior-preserving migrations.
10. Run cross-game regression/recovery suite and remove obsolete duplicated utilities only when no consumers remain.

Do not block unrelated game development on completing the entire migration; migrate in coherent vertical slices.

---

## Test requirements
For every migrated game:
- snapshot/regression tests prove existing content still loads
- deterministic RNG test with known seed
- reconnect at every meaningful phase
- no duplicate scoring after replay/reconnect
- existing scoring/correctness fixtures remain valid
- controller/projector privacy tests where applicable
- Host correction/void/replay regression
- responsive UI regression where shared components replace local components
- adapter contract tests
- optional randomizer variant tested separately from default rules

Cross-engine tests should prove two different games can use the same engine without leaking game-specific state/configuration.

---

## Definition of done
- migration matrix covers every currently registered implemented game
- high-priority families use shared engines rather than duplicate primitives
- shared seeded RNG used for recoverable random selection
- meaningful optional randomizer variants are isolated/configurable and defaults remain stable
- eligible games expose tested Gauntlet adapters
- competition/tournament capabilities are explicit
- duplicate legacy utilities are removed only after verified unused
- docs identify which engine owns each reusable mechanic
- existing games retain recognizable gameplay, content and scoring unless separately approved