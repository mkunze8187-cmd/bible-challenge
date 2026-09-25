# Pairs of Faith — Game Specification

## Purpose
**Pairs of Faith** is an Agon matching/memory game inspired by the classic face-down-card memory mechanic. Players/teams reveal two cards at a time and try to discover valid biblical relationships. The game supports traditional identical pairs as well as semantic relationships such as Person ↔ Event, Person ↔ Book, Person ↔ Place, Event ↔ Location, Verse Beginning ↔ Verse Ending, Prophecy ↔ Fulfillment, Symbol ↔ Meaning, and Image ↔ Text.

The defining rule is: **the content database may contain many-to-many relationships, but every generated Pairs of Faith board must be an unambiguous one-to-one matching puzzle.**

## Core gameplay
1. Generate a board containing N selected relationships (2N cards), then shuffle card positions.
2. All cards begin face-down on the shared game board/projector.
3. Active player/team selects a first card; reveal it to the room.
4. Active player/team selects a second card; reveal it to the room.
5. If the two cards form the board's valid relationship, mark/capture the pair, award configured points, and by default let that player/team continue.
6. If they do not match, leave both visible for a configurable short reveal period, then turn them face-down and advance the turn.
7. Game ends when all pairs are captured. Highest score wins; existing Agon tie handling should be used where applicable.

Optional rule: `keepTurnOnMatch=false` rotates turns after every attempt for younger/simpler play.

## Board sizes / difficulty
Initial supported board presets:
- 3x4 = 6 pairs
- 4x4 = 8 pairs
- 4x5 = 10 pairs
- 4x6 = 12 pairs

Board layout must adapt to available dimensions/aspect ratio using the Agon Game Presentation System. Difficulty may influence both board size and relationship/content difficulty.

## Relationship content model
Do not model all content as permanently fixed Pair A ↔ Pair B records. Model reusable entities/cards plus typed relationships so one entity may legitimately have multiple possible matches.

Conceptual model:

```ts
type MatchEntity = {
  id: string;
  kind: 'person' | 'book' | 'event' | 'place' | 'verse-fragment' | 'prophecy' | 'fulfillment' | 'symbol' | 'meaning' | 'image' | 'text' | string;
  displayText?: string;
  imageAssetId?: string;
  reference?: string;
  tags?: string[];
};

type MatchRelationship = {
  id: string;
  relationshipType: string;
  leftEntityId: string;
  rightEntityId: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  explanation?: string;
  scriptureReferences?: string[];
  certainty?: 'explicit' | 'traditional' | 'disputed';
  enabled?: boolean;
};
```

Exact schema should follow repository conventions, but preserve these concepts.

### Example: one source, multiple possible matches
Paul can have multiple `WROTE` relationships:
- Paul → Romans
- Paul → 1 Corinthians
- Paul → Galatians
- Paul → Philippians
- etc.

A generated board may randomly choose `Paul ↔ Romans` on one play and `Paul ↔ Philippians` on another, subject to board-wide ambiguity validation.

### Relationship specificity
Prefer specific, teachable relationship types over vague `ASSOCIATED_WITH` relationships. Example:
- `Peter PREACHED_AT_EVENT Pentecost` is suitable and can include Acts 2:14–41.
- `Peter PRESENT_AT_EVENT Pentecost` is broader and may create many legitimate matches.

Relationships may include an explanation and Scripture references shown after a successful match or in an educational review state.

For disputed/traditional claims (for example disputed authorship), content must record certainty and must not silently present a disputed relationship as explicit biblical fact. Initial curated content should normally prefer `explicit` relationships unless a game/content pack deliberately includes another certainty level with appropriate wording.

## Board-generation invariant: one-to-one matching
The selected board is a **matching**, not merely a random subset of relationship edges.

For selected board relationship set R and card/entity set V:
- each selected card/entity appears in exactly one intended pair;
- for every left/right card combination visible on the board under the active relationship rule, exactly the selected pairings are valid;
- no displayed card may be a legitimate alternative match for another displayed card under the relationship type/rule being tested.

### Example: Paul/books
If the board selects `Paul ↔ Romans`, another author/book combination may be selected only if it does not create an alternative valid author/book match among displayed cards. The generator must evaluate all displayed candidates, not just check duplicate IDs.

### Example: Pentecost/persons
If the rule is broad `PRESENT_AT_EVENT`, a board containing `Peter`, `John`, and `Pentecost` is ambiguous if both Peter and John are valid matches for Pentecost. Reject/regenerate that board.

If the relationship is specifically `PREACHED_AT_EVENT`, `Peter ↔ Pentecost` can be valid if no other displayed person has that valid relationship.

## Constrained-random board generator
Generation pipeline:
1. Select game mode/category/relationship type(s) allowed by the chosen configuration.
2. Build eligible relationship candidates after category/difficulty/certainty/content filters.
3. Randomize/seed candidate order.
4. Incrementally choose relationships while maintaining entity uniqueness and board-wide semantic uniqueness.
5. After reaching requested pair count, run a complete cross-product ambiguity validation over all displayed cards using the active matching rules.
6. If invalid, backtrack/reselect rather than silently accepting ambiguity.
7. If no valid board of requested size can be produced, gracefully reduce to an allowed smaller preset or report insufficient compatible content before gameplay; never start an ambiguous board.
8. Shuffle final card positions using the session RNG/seed conventions so tests can reproduce boards.

Implementation may use backtracking/constraint solving; correctness and deterministic testability matter more than a specific algorithm.

## Match evaluation
The engine must distinguish:
- **database-valid relationship**: relationship exists in content;
- **board-intended pair**: relationship selected for this generated board;
- **ambiguous alternative**: another relationship among displayed cards that would make the puzzle unfair.

Board generation must prevent ambiguous alternatives. During gameplay, a pair is a match when it corresponds to the board's selected valid relationship; players should never encounter two displayed cards that are also legitimately interchangeable under the active rule.

## Game modes / categories
Initial architecture should allow, without requiring all content in v1:
- Identical Pair
- Person ↔ Event
- Person ↔ Book / Author ↔ Book
- Person ↔ Place
- Event ↔ Location
- Person ↔ Relationship/Companion
- Verse Beginning ↔ Verse Ending
- Prophecy ↔ Fulfillment
- Symbol ↔ Meaning
- Image ↔ Text

Future games may reuse the relationship dataset for multi-match/grouping mechanics. **Pairs of Faith itself remains strictly one-to-one.** Do not weaken its board invariant to support a future many-to-many game.

## Scoring / turns
Default:
- successful match: configurable points, suggested base 100
- successful match: same player/team continues
- miss: next player/team
- captured pair remains visible in a completed/captured treatment or leaves a clearly marked captured space according to responsive layout

Optional future difficulty/scoring modifiers may reward streaks or difficult relationships, but v1 should keep scoring understandable.

## Challenge / projector UX
Follow `specs/agon-ui-ux-design-system-spec.md` and the approved Agon visual references.

Visual direction:
- navy/gold embossed card backs using the simplified Agon A emblem
- parchment/light high-readability card faces
- restrained 3D card flip where motion is enabled
- selected card has clear non-color-only selected state
- successful pair receives gold/success capture treatment
- miss remains visible briefly, then flips back
- reduced/off motion substitutes immediate state transitions

Projector is the shared memory surface. Card faces are revealed to the room together; Player Controllers must not privately reveal a face before the projector/game state reveals it.

## Player Controller
Pairs of Faith uses the Player Controller board-selection interaction.
- Only the active player/team may select when turn-based mode is active.
- Phone: compact grid with stable row/column labels or card numbers; large touch targets; selected first card clearly indicated.
- Tablet: richer board can mirror the public board more closely.
- Controller submits card IDs/positions through canonical prompt/state validation; it does not own the board.
- A player's device must not receive hidden card-face data for face-down cards.
- Mixed-device play is supported: some teams may use controllers while the host selects for a team without a device.

If existing Stage 3 tile/board interaction infrastructure can safely support this, extend/reuse it rather than creating an unrelated transport.

## Host Remote
Host Remote must be able to select cards on behalf of the active player/team and operate the game without laptop interaction when the relevant Host Remote/game-board control infrastructure exists.
- Phone: focused board-selection view/drawer with large targets.
- Tablet: board plus player/score/turn context where space permits.
- Host action uses shared HostCommand/dispatcher architecture; no remote-owned game state.
- Hidden card values must be handled according to Host privacy requirements; do not expose more hidden information than the host workflow actually requires.

## Admin/content authoring
Add a reusable matching-relationship editor/library rather than a Pairs-of-Faith-only fixed-pair editor.

Admin should support:
- create/edit entities/card faces
- create/edit typed relationships
- left/right text and/or image
- explanation and Scripture references
- category, tags, difficulty, certainty, enabled state
- search/filter relationships
- preview card faces
- validation of missing entities/assets/references
- ambiguity analysis

### Ambiguity validation UX
Admin should identify relationship combinations that cannot safely coexist for a selected Pairs of Faith relationship rule. Example:

> Potential ambiguous match: Peter and John both match “Pentecost” under `PRESENT_AT_EVENT`. They cannot appear together on a Pairs of Faith board using this rule.

This is primarily a warning/analysis tool; valid many-to-many biblical data should not be deleted merely because Pairs of Faith cannot put all of it on one board.

Provide a “Generate test board” preview using a fixed/visible seed so authors can inspect representative boards and validation failures.

## Accessibility
- card positions have accessible names independent of color/art
- keyboard operation on desktop/host: focus card, reveal/select with keyboard
- controller targets >=44 CSS px; primary card targets larger where possible
- selected/matched/face-down states have icon/text/ARIA/state distinctions in addition to color
- drag is not required for this game
- card flip respects reduced motion
- screen-reader labels must not reveal hidden card-face content before reveal

## Persistence / compatibility
- Additive content schema migration only; preserve existing content/settings.
- Relationship/entity data should be reusable by future games.
- Existing exports/imports/backups must either include the new data or version/migrate it explicitly according to current repository conventions.
- Do not rename existing game IDs/content types as part of this feature.

## Testing requirements
Unit tests:
- deterministic seeded generation
- one entity with multiple possible matches can generate different valid boards
- reverse many-to-one ambiguity is rejected (Pentecost example)
- forward one-to-many ambiguity is rejected when displayed alternatives make the board ambiguous
- full cross-product board validation
- insufficient-compatible-content behavior
- match/miss/keep-turn/rotate-turn/scoring/endgame
- no hidden card data in PlayerView

Property/fuzz tests strongly recommended:
- generate many boards across seeds and assert the one-to-one invariant for every board
- no entity appears twice unless an explicit future mode allows it (not v1)

E2E:
- desktop two-card match and miss
- multiplayer turn retention/rotation
- projector reveal/flip-back/capture
- Player Controller selects two cards without hidden-data leak
- Host Remote selects cards for a no-device team
- phone/tablet responsive board
- Admin creates relationships and sees ambiguity warning/test-board behavior

## Out of scope for v1
- intentional many-to-many/group-all-matches gameplay (should be a separate game/mechanic)
- AI-generated theological relationships at runtime
- Internet-required content lookup
- automatic acceptance of disputed relationships without content metadata/review

## Definition of done
- Pairs of Faith is selectable/playable in Challenge with Agon presentation.
- At least several relationship categories are supported by the engine/content model; initial curated content quantity is defined by its implementation/content issue.
- Generator never knowingly starts an ambiguous board.
- Paul-style one-to-many data can provide randomized replayable pair selection.
- Pentecost-style many-to-one data is retained in the database but constrained so a board remains one-to-one.
- Player Controller and Host Remote integration work where their prerequisite infrastructure is available.
- Admin can author/validate reusable relationships.
- Hidden-card privacy, accessibility, adaptive layouts, tests, import/export/persistence, and existing game behavior remain intact.
