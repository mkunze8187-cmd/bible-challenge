# Agon Card & Deck Engine + Bible Playing Deck Specification

## Purpose
The **Agon Card & Deck Engine** is reusable card infrastructure for Agon: The Bible Challenge. It supports arbitrary deck sizes, card types, card dimensions/presentations, multiple decks in one game, ordered or shuffled decks, dynamically generated/subset decks, private player/team hands, public table/pile state, responsive controllers, shared card actions, and Host Remote support.

The canonical **52-card Agon Bible Playing Deck** (Scrolls, Crowns, Trumpets, Fish × A–K) is one specialized deck built on this engine; it is not the engine's data model.

This specification defines infrastructure, not a single game.

## Core architectural rule: generic card first, specialized cards second
The base engine must not assume that every card has a suit, rank, character, traditional playing-card aspect ratio, belongs in a private hand, or even belongs to a shuffled deck.

Conceptually:
```ts
type AgonCard = {
  id: string;
  deckId: string;
  type: string;
  content: Record<string, unknown>;
  presentation?: CardPresentation;
  metadata?: Record<string, unknown>;
  tags?: string[];
};

type CardPresentation = {
  format?: 'playing'|'portrait'|'landscape'|'square'|'mini'|'custom';
  aspectRatio?: number;
  renderer?: string;
  frontAssetId?: string;
  backAssetId?: string;
};
```
Exact types follow repository conventions. Specialized schemas validate their own content rather than weakening everything to unchecked data.

Examples of specialized card types:
- Bible Playing Card: suit + rank + character/educational metadata
- Event Card: title + description + artwork + effect/reference ID
- Challenge Card: prompt/category/difficulty/timer or challenge reference
- Character Card: person/role/artwork/metadata
- Location Card: place/map/artwork/metadata
- Resource Card: resource type/value/icon/metadata
- Objective/Mission Card: goal/requirements/progress metadata
- Clue Card: clue/reveal order/visibility
- Story Card: narrative content/next-state references
- Modifier/Action Card: game-defined effect reference
- Reference Card: retained informational content

The engine stores/transitions cards; the consuming game interprets semantic effects. Do not create an unrestricted card-script language that can mutate arbitrary game state.

## Deck definitions
A deck is an ordered collection/pool of card identities plus rules/configuration describing how that collection is initialized and used.

Conceptually:
```ts
type AgonDeckDefinition = {
  id: string;
  version: number;
  name: string;
  cardType?: string;
  source: DeckSource;
  initialOrder?: 'defined'|'shuffle'|'game';
  defaultPresentation?: CardPresentation;
  tags?: string[];
};
```

### Arbitrary deck size
There is no engine-level 52-card assumption. A deck may contain 2, 8, 12, 24, 40, 52, 66, 100+, or another practical count. Games/content validation may impose their own min/max.

Examples:
- 52-card Agon Bible Playing Deck
- 66-card Books of the Bible deck
- 27-card New Testament subset
- 24-card Event deck
- 12-card Mission deck
- dynamically constructed set of all characters matching game-defined tags

### Static, subset, query/dynamic, and generated decks
Support deck creation from:
- explicit static card IDs in defined order
- a named canonical deck plus filter/subset
- content query/filter (e.g. testament/category/tag) using stable repository content services
- game-generated cards where explicitly supported and deterministically reproducible

Dynamic deck construction must produce a committed authoritative card list before gameplay. Clients must not independently query/build hidden decks.

### Ordered vs shuffled decks
A deck may be:
- shuffled using authoritative seeded RNG
- kept in defined order
- partially shuffled/group shuffled where a game explicitly defines it
- inserted/reordered through explicit authoritative game actions

Do not automatically shuffle every deck. Story/chapter/event decks may intentionally be ordered.

## Multiple decks in one game
Multiple independent decks are first-class:
```text
Game Session
  Character Deck
  Event Deck
  Location Deck
  Challenge Deck
  Resource Deck
```
Each deck has a stable deck-instance ID and independent draw/order/pile state. A card belongs to one authoritative location at a time unless a game explicitly creates/copies a distinct card instance.

Games may move cards between compatible piles/decks only through explicit validated actions. Deck identity and card-instance identity must remain unambiguous for persistence/replay.

## Card zones / piles
Use a generic zone model rather than hard-coding only `deck/hand/discard`.

Common zone semantics:
- draw/source pile
- player/team hand
- public table
- discard
- completed/resolved
- removed/exiled
- reserve/resource area
- game-defined named zone

A zone defines owner/visibility/order semantics. Game rules define which transitions are legal.

Shared primitives include:
- create/instantiate deck
- seeded shuffle
- draw one/many
- deal/distribute
- move/transfer/pass
- reveal/hide
- play to public/private zone
- discard/resolve/remove
- return/insert top/bottom/specific validated position
- reshuffle when game permits
- inspect count/top public card where permitted
- sort/reorder private presentation vs authoritative order

## Card size, shape, and renderer
Card mechanics are independent of visual aspect ratio.

First-class presentation formats:
- `playing` — traditional playing-card-like proportion
- `portrait` — taller character/art cards
- `landscape` — event/instruction/story cards
- `square` — tile-like cards
- `mini` — compact resource/status cards
- `custom` — game-defined constrained aspect ratio

Games may use several formats simultaneously. UI must not assume all cards fit a fan of playing cards.

### Renderer architecture
Use a generic `CardRenderer`/registry that selects an appropriate specialized renderer, e.g.:
- `BiblePlayingCard`
- `EventCard`
- `CharacterCard`
- `ChallengeCard`
- `LocationCard`
- `ResourceCard`
- `GenericCard`

Shared shell behavior includes card back, selection/focus, reveal/flip, accessibility, motion, privacy, and responsive sizing. Specialized renderer owns face layout/content.

## Canonical Agon Bible Playing Deck
The canonical playing deck has **52 unique cards: 4 Agon suits × 13 standard ranks**.

Ranks: `A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K`.

Rank is a game property, not a theological/spiritual ranking.

### Agon suits
1. **Scrolls** — stylized biblical scroll
2. **Crowns** — stylized crown
3. **Trumpets** — stylized biblical trumpet/shofar
4. **Fish** — stylized ichthys/fish

Traditional ♠♥♦♣ symbols are not the player-facing suit identity. Suit marks must have strongly differentiated silhouettes, remain recognizable at small sizes, work in monochrome, and belong to the Agon design system.

### Bible Playing Card specialization
```ts
type AgonBiblePlayingCard = AgonCard & {
  type: 'bible-playing-card';
  content: {
    suit: 'scrolls'|'crowns'|'trumpets'|'fish';
    rank: 'A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K';
    characterId?: string;
    displayName: string;
    artworkAssetId?: string;
    testament?: 'OT'|'NT';
    era?: string;
    books?: string[];
    categories?: string[];
    scriptureReferences?: string[];
    facts?: string[];
  };
};
```

Character mapping guidelines remain: distribute women naturally across suits; balance OT/NT and recognizable/less-obvious figures; make court-card choices intentional; avoid duplicate character identities in the base 52; rank never implies spiritual importance; Jesus and God are not ordinary competitive cards; disputed/traditional facts are marked appropriately.

Optional wild cards are outside the canonical 52 and must be explicitly enabled by a game.

## Event / Chance-like decks
The engine explicitly supports event-style decks in which drawing a card causes or offers a game event. These cards need no suit/rank/private hand.

Example structure:
```ts
type EventCardContent = {
  title: string;
  description: string;
  artworkAssetId?: string;
  effectId?: string;
  parameters?: Record<string, unknown>;
};
```

`effectId` references a game-owned, allow-listed effect/command handler. The generic card engine does not execute arbitrary scripts from card content.

Event decks may be shuffled, ordered, cyclical, exhaustible, discard-and-reshuffle, or chapter-specific according to game rules.

## Challenge, clue, objective, mission, story, and resource decks
These are supported as ordinary specialized deck definitions. A game may draw directly to public table, private hand, retained objective area, completed area, etc. A card does not have to enter a player's hand merely because it was drawn.

## Non-negotiable product rule: no betting or gambling
Agon must not implement or enable betting/wagering, ante/blinds/pots, gambling chips/currency/bankrolls, odds-based wagers, casino/poker betting rounds, or APIs intended to facilitate wagering.

Ordinary non-gambling card actions such as draw, play, discard, pass, exchange, hold, reveal, select, skip, withdraw, sort, reorder, meld/group, ask, give/transfer and resolve are allowed when game rules require them.

Event/resource/reward cards may award normal game points/resources/advantages directly under game rules, but never settle a wager.

## Privacy model
Visibility belongs to zones/card state, not to visual hiding.

Authoritative state may contain all cards. A Player Controller receives only cards/content authorized for its participant/team plus explicitly public information. Never serialize opponents' private cards, hidden deck order, hidden pile contents, unrevealed objectives/clues, or host-only cards to unauthorized clients.

Card backs/counts may be projected instead of identities. Reconnect/reassignment must reproject the current authorized state and clear stale private card content.

## Player Controller: hands and retained card areas
`PlayerCardHand` remains optimized for roughly 1–25 playing/hand cards, including compact/fan/scroll/two-row layouts, sorting, manual private arrangement, single/multi/ordered/group/target selection.

Additionally provide generic private/public `CardCollection`/`CardZoneView` layouts for cards that do not fit a playing-card hand:
- horizontal/vertical scroll
- grid
- stacked pile
- one-card focus/detail
- compact mini-card strip

Landscape Event/Story/Objective cards should not be forced into a narrow playing-card fan.

Persistent legal-action controls remain separate from card collection size.

## Card game/action area
Shared legal-action infrastructure is game-driven. Common non-gambling actions include play, draw, discard, pass, exchange, hold, reveal, skip, withdraw, resolve, choose, inspect-public, meld, ask, give, confirm, cancel.

The game engine determines legality and selection requirements. Controller renders the authorized actions; card content cannot bypass game validation.

## Public/projector UI
Reusable primitives should include:
- `CardRenderer`
- `CardBack`
- `BiblePlayingCard`
- generic/specialized card renderers
- `CardFan` / `PlayerCardHand`
- `CardCollection` / `CardZoneView`
- `CardPile`
- `DiscardPile`
- `PublicCardTable`
- `SelectedCardPreview` / `CardDetail`
- `OpponentHandSummary`
- `CardGameActionBar`

Projector can theatrically draw/reveal an Event/Challenge/Story card at large size while controller/host surfaces show a compact representation of the same authoritative card.

## Host Remote
Host Remote can perform only game-authorized deck/zone commands through shared dispatcher. It must not own/shuffle/generate hidden deck order locally. Phone remains action-first; tablet may show richer public deck/zone state. Normal host view does not automatically expose private hands/objectives/clues.

## Player/team model
Support individual and team-owned private hands/zones. Do not assume one device per human. Games requiring hidden private cards declare the private-display/controller requirement.

## Dynamic content safety and determinism
For query/generated decks:
- commit resolved card IDs/instances to authoritative session state before hidden play begins
- seed randomized ordering using authoritative RNG
- save sufficient deck-definition/version/source metadata for recovery/debugging
- content updates during an active saved session must not silently replace already-instantiated cards

## Accessibility
- all card types have concise accessible labels appropriate to authorized content
- hidden cards announce only hidden/back/count/position as appropriate
- color is never sole semantic cue
- keyboard/touch selection and non-drag alternatives
- >=44 CSS px interactive touch targets where practical
- Reduced/Off motion for flips/deals/transitions
- specialized image cards have meaningful accessible labels
- private content never leaks through DOM/ARIA on unauthorized surfaces

## Adaptive/responsive requirements
Test playing cards plus portrait, landscape, square, and mini formats across phone portrait/landscape, tablet, laptop, and 4:3/16:10/16:9 projector.

Large collections scroll/compact independently from persistent action controls. A game with several simultaneous decks/zones must prioritize current actionable/public information rather than attempting to show every card at once.

## Persistence/versioning
Deck definitions and card definitions have stable IDs/versions. Session state stores deck instances, card instances/locations, authoritative order where required, reveal/visibility state, and game-specific references.

The 52-card Bible Playing Deck has its own stable content version independent of generic engine version.

## Relationship to Pairs of Faith
Pairs of Faith may reuse the generic CardRenderer/CardBack/selection/flip/zone primitives, but its relationship cards are not forced into the 52-card Bible Playing Deck's rank/suit model.

## Security/testing requirements
Unit tests:
- arbitrary deck sizes including 2/24/52/66/100+
- empty/invalid deck definition validation where applicable
- deterministic seeded shuffle and defined-order deck behavior
- multiple independent decks in one session
- draw/deal/move/transfer/discard/resolve/remove/return transitions
- zone ownership/order invariants
- dynamic subset/query resolution determinism
- canonical Bible deck remains exactly 4×13 unique cards

Privacy/security:
- hidden hands/objectives/clues/deck order absent from unauthorized serialized projections and DOM/ARIA
- deck A cannot expose deck B private state through renderer/zone confusion
- stale/reassigned controller cannot retain prior private cards
- HostRemoteView receives only authorized card data

Responsive/E2E:
- playing-card hands at 1/10/15/25
- portrait/landscape/square/mini card collections
- multiple decks/zones
- Event card draw → large public reveal → resolved/discard zone
- ordered story deck does not shuffle
- 66-card/subset dynamic deck
- reconnect preserves authoritative order/private state

Policy/product:
- no wagering actions/fields/examples
- generic event/reward effects cannot create a wagering settlement path

## Development harness
The foundation harness should demonstrate without becoming a shipped game:
1. canonical 52-card Bible Playing Deck with private hand/public play
2. 24-card landscape Event Deck with public draw/resolve/discard
3. 66-card Books deck plus deterministic NT subset
4. portrait Character deck and square/mini Resource deck
5. two or more independent decks active simultaneously
6. ordered Story deck
7. privacy/reconnect across private Objective/Clue cards

Do not use poker/casino/betting as a demo.

## Definition of done
- generic engine has no 52-card/suit/rank/aspect-ratio assumption
- arbitrary static/dynamic/subset deck sizes work
- multiple independent decks work in one game
- shuffled and deliberately ordered decks work
- generic zones and validated card transitions work
- playing/portrait/landscape/square/mini/custom card presentation is supported
- specialized renderer architecture exists
- event/challenge/character/location/resource/objective/clue/story-style cards can use the same engine
- canonical Scroll/Crown/Trumpet/Fish 52-card Bible Playing Deck exists as a specialization
- secure private hands/zones and public projector/Host projections pass leak tests
- responsive Player Controller and persistent legal actions work
- accessibility and deterministic recovery tests pass
- betting/gambling mechanics and enabling infrastructure remain explicitly absent
