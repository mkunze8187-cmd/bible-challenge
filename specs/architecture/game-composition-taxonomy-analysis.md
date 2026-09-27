# Agon Game / Challenge Composition & Consolidation Analysis

**Status:** Architecture analysis — input to refactoring, not a deletion decision
**Purpose:** Classify implemented and planned Agon experiences by architectural role, identify reusable challenge/play-style families, show which higher-order games consume those families, and provide a basis for refactoring, pack design, and duplicate-game review.

## 1. Why this taxonomy exists

Agon's catalog currently mixes several different things under the word "game":

1. a **single challenge type** that can be played alone;
2. a **standalone game structure** built around one primary mechanic;
3. a **composite/signature game** that consumes challenge types or other engine capabilities;
4. an **orchestrator/campaign** that sequences multiple activities/games;
5. a **variant/content skin** that may not justify another implementation;
6. an **Activity Event** or learning experience that is intentionally not a conventional competitive game.

Treating all of these as independent implementations increases executable size, duplicates lifecycle/scoring/controller/Stage code, makes content packs heavier, and hides near-duplicate play styles.

The target model is:

```text
Reusable content
      ↓
Challenge primitives / mechanic engines
      ↓
Standalone challenge games / game definitions
      ↓
Composite games
      ↓
Orchestrators / journeys / events
```

A named game may remain a distinct catalog experience while sharing nearly all implementation with another game.

## 2. Classification axes

Every GameDefinition should eventually record these independently.

### Catalog role
- **CHALLENGE** — one bounded challenge mechanic; strongest candidate for embedding.
- **STANDARD_GAME** — a standalone game with meaningful multi-round/board rules beyond one challenge.
- **COMPOSITE_GAME** — combines several reusable mechanics/challenge providers.
- **ORCHESTRATOR** — runs other challenge/game adapters as stages/encounters.
- **CAMPAIGN** — persistent authored progression containing activities.
- **ACTIVITY_EVENT** — guided learning/making experience rather than ordinary competitive game.

### Implementation shape
- **DECLARATIVE** — GameDefinition + shared engines + content.
- **VARIANT** — overlay/content skin over an existing definition/family.
- **COMPOSITE** — coordinates multiple capabilities.
- **NOVEL_MODULE** — genuinely unique mechanic module, still using shared platform services.

### Reuse direction
- **EMBEDDABLE_CHALLENGE** — exposes a bounded attempt adapter usable by Gauntlet/Journey/Race/etc.
- **EMBEDDABLE_COMPACT** — only a purpose-built compact mode is safe to embed.
- **CONSUMER** — consumes challenge providers.
- **ORCHESTRATOR_CONSUMER** — can consume games/adapters as authored stages.
- **STANDALONE_ONLY** — should not be embedded without a new explicit adapter.

### Product stature (separate from architecture)
- **SIGNATURE** — demonstrates a distinctive Agon experience.
- **MAJOR** — substantial standalone experience.
- **QUICK/CORE** — short reusable play.
- **CANDIDATE** — backlog/independently droppable.

Product stature MUST NOT determine whether code is shared.

## 3. Implemented catalog baseline

The current Admin catalog contains 29 implemented entries. This analysis also incorporates implemented games referenced by current Host/engine issues that are not visible in the older `admin/src/data/games.json` snapshot (for example Odd One Out, Parable Match and Genealogy). The migration manifest from #304/#331 remains the definitive implementation inventory when the two sources differ.

### 3.1 Implemented games — target composition

| Game | Architectural role | Primary family | Reuse target | Embeddable? | Consolidation note |
|---|---|---|---|---|---|
| Five Clues | Standard game | Progressive clue + category/value board | Progressive Clue Engine | Compact | Keep identity; share clue engine with Name That Book/Prophecy Clue Ladder |
| Bible Initials | Standard game | Progressive clue/board + steals | Progressive Clue/Challenge + board definition | Compact | Similar lifecycle to clue family but board identity may justify distinct definition |
| Verse Reveal / Scripture Puzzles | Standard game | Letter reveal / solve | Reveal Engine | Compact possible | Keep as reveal-family game; reusable reveal mechanic |
| Bible Timeline | Challenge/standard | Ordering | Ordering Engine | Yes | Modes such as Which Came First?/Insert Event should be variants, not GameIds |
| Verse Scramble | Challenge | Ordering/assembly | Ordering Engine | Yes | Strong embedded challenge candidate |
| Bible Connections | Standard game | Grouping/classification | Card/Tile + Classification | Compact | Distinct board experience; shared grouping mechanics |
| Name That Book | Challenge/standard | Progressive clue | Progressive Clue Engine | Yes | Same family as clue ladder; content/scoring adapter determines whether separate catalog identity remains |
| Before Or After | Challenge | Pairwise chronology choice | Challenge/Chronology | Yes | Timeline-family compact challenge; candidate mode of chronology family, but existing identity can remain |
| Reference Rush | Challenge | Reference identification | Challenge + Bible Navigation | Yes | Same interaction family as reference/navigation challenges |
| Chapter Finder | Challenge | Book/chapter identification | Challenge + Bible Navigation | Yes | Content/answer-policy variant of navigation family |
| Who Said It? | Challenge | Identification | Challenge Engine | Yes | Excellent generic challenge provider |
| Bible Books Relay | Standard/compact game | Ordering + relay | Ordering Engine + team rotation | Compact | Ordering primitive with relay rules; retain game identity |
| Missing Word | Challenge | Exact-word fill | Challenge + BibleTextService | Yes | Core exact-word challenge provider |
| Prophecy Match | Challenge/standard | Matching | Card/Tile/Deck + Match | Yes/compact | Share matching engine; content is prophecy relationship |
| Messiah Prophecy | Challenge | Identification/choice | Challenge Engine | Yes | Content-profile-driven challenge |
| Prophecy Clue Ladder | Challenge/standard | Progressive clue | Progressive Clue Engine | Yes | Same engine family as Five Clues/Name That Book |
| Fulfillment Finder | Challenge | Relationship identification/choice | Challenge + Scripture Relationship | Yes | Strong reusable challenge provider |
| Prophecy Categories | Challenge/standard | Classification | Card/Tile + Classification | Yes/compact | Same mechanic family as Proverb Categories |
| Complete the Verse | Challenge | Exact-word/choice completion | Challenge + BibleTextService | Yes | Core exact-word challenge provider |
| Wisdom Match | Challenge | Matching | Card/Tile + Match | Yes | Candidate generic matching definition + content profile |
| Psalm Theme | Challenge | Classification/identification | Challenge Engine | Yes | Content-profile-driven challenge |
| Proverb Categories | Challenge/standard | Classification | Card/Tile + Classification | Yes/compact | Mechanically near Prophecy Categories; likely one family/definition with content profile |
| Psalm Reference Finder | Challenge | Reference identification/choice | Challenge + Bible Navigation | Yes | Navigation/reference family |
| Two Truths and a Lie | Challenge | Decoy/error identification | Challenge Engine | Yes | Director's Cut belongs as presentation/content variant |
| Relay Verse Build | Standard/compact game | Cooperative sequential text assembly | Ordering/Text + team rotation | Compact | Distinct relay rules; underlying assembly primitive reusable |
| Verse Typing Race | Standard game | Accuracy/speed text entry | Challenge + timing | Limited | Standalone speed format; can supply a special station only with bounded adapter |
| Word Ladder | Standard/novel | Word transformation path | Novel module / path validation | Limited | Not a generic Bible challenge; retain distinct module |
| Bible Anagrams | Challenge | Unscramble/decode | Challenge + Tile/Text adapter | Yes | Decode family; can be embedded |
| Bible Cryptogram | Standard/challenge | Progressive letter decode | Reveal/Decode | Compact | Reusable decode/reveal family; full puzzle may be too long for some composites |
| Odd One Out | Challenge | Classification/decoy | Challenge Engine | Yes | Do not add Dodge the Decoy as separate game |
| Parable Match | Challenge | Matching | Card/Tile + Match | Yes | Same match family; content profile distinguishes it |
| Genealogy | Standard game | Relationship/path/order | Relationship/Ordering | Compact TBD | Audit after Scripture Relationship engine stabilizes |

## 4. Core challenge/play-style families

These families are the primary optimization boundary. A pack should normally depend on these shared capabilities rather than ship another implementation.

### A. Identification / choice
Examples: Who Said It?, Messiah Prophecy, Psalm Theme, Complete the Verse choice mode, Fulfillment Finder, Chapter Finder, Reference Rush, Psalm Reference Finder, Before Or After, Two Truths and a Lie, Odd One Out.

Shared lifecycle: select content → present prompt/choices/text target → collect response → evaluate/adjudicate → score → reveal/review.

**Recommendation:** one shared Challenge Engine with response/evaluator adapters. Do not create one engine per named game.

### B. Progressive clue / reveal-to-solve
Examples: Five Clues, Name That Book, Prophecy Clue Ladder; planned Clue Ladder, Who Am I?, Name That Story, Quick Bible Mystery, Movie Trailer, Investigator, Archaeologist, Lost in Translation; Secret Identity consumes this family plus bidding.

**Recommendation:** Progressive Clue Engine owns ordered reveal/attempt windows/persistence. Most planned skins should be definitions/content profiles, not new mechanic code. Secret Identity remains distinct because bidding/contract/open-buzzer orchestration materially changes play.

### C. Ordering / sequence / assembly
Examples: Bible Timeline, Verse Scramble, Bible Books Relay, Relay Verse Build; planned Open the Scroll/Scribe's Table or other sequence concepts where rules match.

**Recommendation:** Ordering Engine owns deterministic shuffle, arrangement, validation and recovery. Relay is a rule overlay/adapter. Timeline's pairwise/insert modes are variants.

### D. Matching / pairing
Examples: Prophecy Match, Wisdom Match, Parable Match, Pairs of Faith.

Pairs of Faith is **not merely another Match round**: its face-down memory board and constrained ambiguity-safe generator justify a distinct game/module, but its relationship/content data should reuse common relationship/card infrastructure.

**Recommendation:** simple match games should converge on shared Card/Tile + Match semantics and differ mainly by content profile. Pairs of Faith consumes shared data/cards but retains distinct memory-board rules.

### E. Classification / grouping
Examples: Bible Connections, Prophecy Categories, Proverb Categories, Odd One Out (single-decoy variant).

**Recommendation:** shared Classification/Grouping capability. Prophecy Categories and Proverb Categories are especially strong candidates for one declarative game family with different content profiles/catalog presentation.

### F. Exact Scripture wording
Examples: Missing Word, Complete the Verse, Verse Scramble, Verse Typing Race, Relay Verse Build.

This is primarily a **content-generation/evaluation dependency**, not one mechanic. All should resolve selected translation through BibleTextService once, while using Challenge/Ordering/Typing mechanics as appropriate.

### G. Bible navigation/reference
Examples: Reference Rush, Chapter Finder, Psalm Reference Finder, future Find It/Open Bible challenges.

**Recommendation:** shared reference parsing/normalization/navigation services under Challenge Engine. Catalog entries may remain distinct learning tasks without separate engine implementations.

### H. Decode / word puzzle
Examples: Bible Anagrams, Bible Cryptogram, Scripture Stumpers, Word Ladder.

Anagrams and Stumpers can share standard Challenge lifecycle. Cryptogram uses richer reveal state. Word Ladder is genuinely different path/transformation logic and should not be forced into a universal decode engine.

### I. Buzzer / first-response
Not itself a game. Used by many identification games and by composite games. It belongs below the catalog as a participation/competition mechanic.

### J. Simultaneous private response / collect-all
Not itself a game. Important for Joust, Multitude, classroom challenges and future composites.

### K. Cards / tiles / decks
Infrastructure, not a catalog game. Used by match/classification/ordering games, Gauntlet stations and future card games.

### L. Randomizers
Dice, Spinner/Wheel, Casting Lots are **capabilities**. A named experience such as Wheel Within a Wheel may be a game only if it adds rules/objective/scoring beyond "spin and answer." Otherwise it should be a challenge-selection variant/provider.

## 5. Higher-order consumers

### Agon Gauntlet — ORCHESTRATOR / signature
Consumes bounded `GauntletStageAdapter`s. Strong existing candidates already identified in #310: Before Or After, Who Said It?, Missing Word, Complete the Verse, Chapter Finder, Reference Rush, Two Truths and a Lie, Psalm Reference Finder, Fulfillment Finder, plus compact Timeline, Books Relay and Prophecy Match.

Gauntlet must not package copies of these games. It depends on their adapter/capability and content packs.

### Exodus: The Journey — CAMPAIGN / signature
Consumes checkpoint activity slots. A checkpoint can use standard Challenge, Ordering, Progressive Clue, Matching, Cards/Dice/Spinner, Image Board, Gauntlet-like compact activity, or a specialized activity. Journey owns canonical progression; embedded activity owns its mechanic/scoring attempt.

### Running the Race — COMPOSITE / signature
Consumes challenge outcomes to drive race movement/pace/stamina and can later host cross-engine stations. Missing Word, Who Said It?, reference, ordering, progressive clue, relationship and similar bounded challenges can become race stations without Race reimplementing them.

### Agon Joust — COMPOSITE / signature
Consumes independently generated challenge instances selected through a Challenge Rack. Joust owns simultaneous challenge exchange and Impact; the underlying challenge providers own prompt/evaluation. Do not make "Joust trivia," "Joust ordering," etc. separate implementations.

### Unveiled — COMPOSITE / signature
Consumes a challenge attempt, then maps outcome to Reveal Engine/board geometry and solve state. The challenge should be swappable/configurable.

### Secret Identity — COMPOSITE / major/signature candidate
Consumes Bid & Contract + Progressive Clue + Buzzer + Challenge adjudication. It is not duplicate of Clue Ladder because bidding and contract/open-buzzer phases materially change the game.

### Wayfinder — COMPOSITE / major
Consumes challenge outcomes to drive maze/navigation state. The maze is the game; question providers are replaceable.

### Walls of Jerusalem / Bible Blockbusters — STRATEGY GAME
Consumes challenge outcomes to claim/place/control board regions. Territory/path board state is distinct; underlying challenge provider should be shared.

### Bible Baseball — SPORTS COMPOSITE
Consumes challenge responses under pitch difficulty/resource rules; baseball state is distinct. Challenge content should remain reusable.

### Multitude — STANDARD/COMPOSITE
Its list-generation + uniqueness evaluation is a distinctive mechanic and may itself become an embeddable challenge provider once bounded.

## 6. Planned-game consolidation review

This is a **review queue**, not an instruction to delete names immediately.

### Strong variant/content-skin candidates
These should default to a shared definition/family unless playtesting identifies materially different rules:
- Who Am I? / Name That Story / Quick Bible Mystery → Progressive Clue profiles.
- Movie Trailer / Investigator / Archaeologist → Progressive Clue presentation/content skins.
- Casting Call → Choice/Identification profile.
- Director's Cut → Two Truths and a Lie presentation variant (already planned this way).
- Which Came First? → Bible Timeline pairwise mode (already planned this way).
- Insert Event → Bible Timeline mode.
- Prophecy Categories / Proverb Categories → likely one Classification game definition + content profile while retaining catalog aliases if desired.
- Wisdom Match / Parable Match / simple Prophecy Match → likely one Match family definition + relationship/content profiles, unless scoring/board rules materially differ.
- Psalm Reference Finder / Reference Rush / Chapter Finder → shared Navigation Challenge implementation; whether all remain separate catalog entries is a product/learning-objective decision, not an engine decision.

### Keep distinct game identity despite shared primitive
- Secret Identity — bidding materially changes Progressive Clue.
- Bible Books Relay / Relay Verse Build — relay/team rotation materially changes ordering/assembly.
- Bible Connections — grouping board creates distinct multi-set puzzle.
- Pairs of Faith — memory board + ambiguity-safe relationship generation.
- Bible Cryptogram — persistent decode board differs from one-shot text challenge.
- Word Ladder — path/transformation state.
- Baseball, Joust, Wayfinder, Walls/Blockbusters, Unveiled, Running the Race — higher-order game state is the experience.

### Candidate concepts requiring review before a GameId
The backlog names such as Wheel Within a Wheel, The Lot Falls To…, Urn of Questions, While the Sand Falls, Three Witnesses, Facets, Open the Scroll, The Scribe's Table, One Is Missing, Gather the Twelve and similar concepts should first be mapped to this taxonomy. If the concept is only `existing challenge + randomizer/presentation/content`, prefer a variant/GameDefinition/content pack over a new implementation. A new GameId is justified when the rules/objective/player decisions create a meaningfully distinct experience even if engines are shared.

## 7. Packaging implications

Separate **mechanic code**, **game definitions**, **content**, and **media**.

Recommended conceptual package graph:

```text
Agon Core
  ├─ Challenge Engine
  ├─ Ordering Engine
  ├─ Progressive Clue Engine
  ├─ Match/Classification adapters
  ├─ Buzzer/Timer/Input/Score/Persistence
  └─ shared renderers

Core Challenge Definitions (small)
  ├─ Missing Word
  ├─ Who Said It?
  ├─ Before Or After
  ├─ Reference Rush
  └─ ...

Content Packs
  ├─ General Bible
  ├─ Prophecy
  ├─ Psalms & Proverbs
  ├─ seasonal/kids/etc.
  └─ translation-dependent content

Signature Game Packs
  ├─ Running the Race definition/module + race assets
  ├─ Joust definition/module + joust assets
  ├─ Unveiled definition/module + reveal assets
  └─ Gauntlet definition/module + course assets

Journey Packs
  └─ Exodus campaign definition + map/art/content
       └─ depends on installed shared challenge capabilities/content
```

A content pack should not contain duplicate executable implementations of Missing Word, Who Said It?, etc. A signature game pack should declare capability dependencies and only add its novel orchestration/assets/content.

This permits a pack to be small when it is mostly definitions/content and makes locked/unlocked `.agonpack` entitlements more granular.

## 8. Proposed GameDefinition metadata additions

Add/derive metadata approximately equivalent to:

```ts
type CatalogRole =
  | 'CHALLENGE'
  | 'STANDARD_GAME'
  | 'COMPOSITE_GAME'
  | 'ORCHESTRATOR'
  | 'CAMPAIGN'
  | 'ACTIVITY_EVENT';

type ImplementationShape =
  | 'DECLARATIVE'
  | 'VARIANT'
  | 'COMPOSITE'
  | 'NOVEL_MODULE';

interface CompositionMetadata {
  catalogRole: CatalogRole;
  implementationShape: ImplementationShape;
  primaryMechanic: string;
  mechanicCapabilities: string[];
  consumesChallengeCapabilities?: string[];
  embeddable?: 'NO' | 'CHALLENGE' | 'COMPACT_ADAPTER';
  gauntletAdapterId?: string;
  variantFamilyId?: string;
  productStature?: 'SIGNATURE' | 'MAJOR' | 'QUICK_CORE' | 'CANDIDATE';
}
```

Names should align with #314/#362 rather than creating competing domain terminology.

## 9. Refactoring priorities produced by this analysis

### P0 — before catalog-wide migration
1. Treat #304 + this taxonomy as one migration/composition manifest.
2. Stabilize GameDefinition/Engine SDK/Challenge lifecycle and Score/Persistence boundaries.
3. Add `catalogRole`, mechanic capability, embedding/adapter and variant-family metadata to the migration manifest (schema changes only after #314 terminology review).
4. Establish one reusable Challenge attempt contract that composite games can consume without launching a whole standalone game session.

### P1 — consolidate implemented families
1. Migrate identification/choice games to Challenge Engine (#308).
2. Migrate ordering family (#306).
3. Migrate Progressive Clue family (#307).
4. Migrate match/classification family (#305).
5. Extract Bible Navigation/reference service (#308).
6. Make exact-wording generation/evaluation translation-aware (#342).
7. Add Gauntlet adapters only after the underlying family migration (#310).

### P1 — change planned-game implementation assumptions
Before implementing any candidate game, classify it as definition/variant/composite/novel module and list existing mechanics it consumes. Do not create a new engine simply because a game has a new title/theme.

### P2 — catalog/product consolidation
After migrated implementations can prove equivalence, review whether near-duplicate catalog entries should:
- remain separately named for educational discoverability;
- become modes under one game card;
- become content profiles in a pack;
- be hidden/deprecated in favor of a stronger game;
- remain only as embeddable challenge types.

Do not make this decision solely from code similarity. Learning objective, player decision pattern, Stage experience and discoverability matter.

## 10. Decision test: new game, variant, or challenge?

Use this sequence for every new concept:

1. **Does it change only Bible topic/content?** → content profile/pack.
2. **Does it change only presentation/theme?** → presentation variant/skin.
3. **Does it change only one supported rule/configuration of an existing mechanic?** → GameDefinition variant overlay.
4. **Is it one bounded response/evaluation interaction?** → challenge type, optionally standalone.
5. **Does it add meaningful multi-round/board/player-decision state?** → standalone game definition/module.
6. **Does it primarily consume other challenge types to drive a larger metaphor/state machine?** → composite game.
7. **Does it sequence other games/activities over persistent progression?** → orchestrator/campaign.

A new title does not imply new engine code. A shared engine does not imply two catalog experiences must be merged.

## 11. Key conclusions

- The existing catalog should not be thought of as ~30 independent engines. Most implemented games fall into a small number of mechanic families.
- The **Challenge Engine** is the largest consolidation opportunity: many existing games differ chiefly in content/evaluator/presentation.
- Ordering, Progressive Clue, Matching/Classification and Bible Navigation are the next strongest consolidation families.
- Gauntlet, Exodus, Running the Race, Joust, Unveiled and Wayfinder should consume bounded challenge capabilities rather than copies of standalone games.
- Product/catalog consolidation and code consolidation are separate decisions. Agon may keep two differently named learning experiences while shipping one implementation family.
- Packaging should be capability/dependency-driven: shared engine code once; lightweight definitions/content/assets in packs; novel orchestration only where genuinely required.
- This taxonomy should be applied to every candidate/backlog game before implementation and should become an input to #304/#331 rather than creating a parallel migration program.
