# Agon Bible Deck & Card System Specification

## Purpose
The **Agon Bible Deck** is reusable card-game infrastructure for Agon: The Bible Challenge. It provides a canonical Bible-themed 52-card deck, private player/team hands, public table/pile state, responsive Player Controller hand UI, shared card-game actions, Host Remote support, and reusable engine primitives so future games do not each implement their own deck/hand/privacy system.

This specification defines infrastructure, not a single game.

## Non-negotiable product rule: no betting or gambling
Agon must not implement, enable, simulate, normalize, or provide reusable infrastructure specifically for betting or gambling mechanics.

Forbidden mechanics/terminology include:
- betting or wagering
- ante/blinds/pots
- raise/call as wagering actions
- gambling chips/currency/bankrolls
- risking points, money, prizes, virtual currency, or other value on uncertain outcomes
- odds-based wagering or side bets
- casino/poker-style betting rounds
- APIs/components whose intended purpose is to make future wagering mechanics easy to add

Ordinary non-gambling card actions are allowed where a game's rules require them: draw, play, discard, pass, exchange, hold, reveal, select, skip, withdraw/fold (only when it means leave/concede/pass without wagering), sort, reorder, meld/group, ask, give/transfer, and similar actions.

Code, UI copy, sample/demo games, tests, documentation, and AI implementation instructions must not use betting examples as generic card-system demonstrations.

## Canonical deck
The base deck has **52 unique cards: 4 Agon suits × 13 standard ranks**.

Ranks remain mathematically compatible with ordinary card mechanics:
`A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K`.

Rank is a game property, not a theological/spiritual ranking of Bible characters.

### Agon suits
Traditional suit symbols are not displayed to players. Agon uses four original biblical suit identities:

1. **Scrolls** — symbol: stylized biblical scroll
2. **Crowns** — symbol: stylized crown
3. **Trumpets** — symbol: stylized biblical trumpet/shofar
4. **Fish** — symbol: stylized ichthys/fish

Suit marks must:
- be custom Agon artwork rather than Unicode emoji/traditional ♠♥♦♣ symbols
- have strongly differentiated silhouettes
- remain recognizable at small card-corner/icon sizes
- work in monochrome; color may reinforce but never be the only distinction
- have detailed and simplified/small-size variants where needed
- visually belong to the Agon logo/design system

Internal code may use stable identifiers such as `scrolls`, `crowns`, `trumpets`, `fish`; do not expose traditional suit names as the user-facing identity.

### Character mapping
Each of the 52 cards may map to a canonical Bible character/figure plus educational metadata. The complete 52-character assignment is a separate content/design issue and must be reviewed as a whole rather than filled arbitrarily.

Guidelines:
- distribute women naturally across appropriate suits rather than creating a sex-specific suit
- balance OT/NT and recognizable/less-obvious figures where suit semantics allow
- court-card assignments should feel intentional
- avoid duplicate character identities in the canonical 52 unless a later explicit variant deck defines otherwise
- do not make card rank imply spiritual importance
- Jesus and God are not ordinary competitive playing cards in the canonical deck
- disputed/traditional character facts must be marked/worded appropriately in metadata

Conceptual card metadata:
```ts
type AgonSuit = 'scrolls' | 'crowns' | 'trumpets' | 'fish';
type AgonRank = 'A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K';

type AgonBibleCard = {
  id: string;              // stable canonical id
  suit: AgonSuit;
  rank: AgonRank;
  characterId?: string;
  displayName: string;
  artworkAssetId?: string;
  testament?: 'OT'|'NT';
  era?: string;
  books?: string[];
  categories?: string[];
  scriptureReferences?: string[];
  facts?: string[];
  tags?: string[];
};
```

## Optional wild cards
Wild/Joker-like cards are not part of the canonical 52 and are disabled unless a specific non-gambling game requests them. If introduced, use Agon-themed identities such as Crown Wild/Scroll Wild rather than traditional joker imagery. Wild cards must not introduce wagering mechanics.

## Shared card engine
Create reusable deterministic/server-authoritative primitives for:
- create canonical deck / variant subset
- seeded shuffle
- deal
- draw
- private hand ownership
- public/private piles
- discard pile
- face-up / face-down state
- play to table
- transfer/pass cards
- return cards to deck/pile
- sort/group/meld validation hooks
- hand/card counts
- reshuffle when a specific game allows it
- reveal/hide transitions
- game-specific legal-action adapters

The shared engine should not encode one game's rules. Individual games compose these primitives and remain authoritative for legal moves/scoring/turns.

## Privacy model
Private hands are first-class projected state.

The authoritative host/game state may contain all hands. A Player Controller projection receives only:
- its authorized player/team's actual private cards
- public table/pile/discard information
- opponent/public participant card counts and other explicitly public metadata
- currently legal actions for that player/team

It must **not** receive opponents' private card identities, hidden deck order, hidden pile contents, or host-only information.

Example:
```ts
{
  myHand: [/* actual authorized cards */],
  opponents: [
    { id: 'p2', cardCount: 11 },
    { id: 'p3', cardCount: 8 }
  ],
  publicTable: {/* public cards/piles */},
  legalActions: [/* server/game-authorized actions */]
}
```

Do not send all hands to the browser and rely on CSS/React to hide them.

### Reconnect/rejoin
Private hands remain authoritative on the host/server. After an authenticated/authorized controller reconnects/rejoins, project that player/team's current private hand again. A device must not gain another participant's hand through reassignment/reconnect/stale-session bugs.

## Projector/public table
Projector/audience view may show:
- public table cards
- public discard/piles
- deck/pile counts when game rules make them public
- each participant/team's card count
- turn/current-player/status information

It must never show private hand identities unless a game action has made those cards public.

When a private card is legally played/revealed, animate/present it as transitioning into public table state where appropriate.

## Host privacy
Normal Host Remote gameplay should not automatically expose all private hands. Show card counts/public state and only private card information required by the specific host workflow/game rule.

Administrative/debug inspection, if ever needed, must be explicitly separate from normal gameplay, clearly labeled, access-controlled according to existing Host security architecture, and never projected to audience/player views.

## Player Controller: private hand UI
Create a reusable `PlayerCardHand` interaction designed for approximately **1–25 cards**, with 10+ cards treated as normal rather than exceptional.

### Phone portrait
- hand and game actions occupy separate regions
- overlapping/fanned or compact horizontally scrolling cards preserve visible rank + Agon suit mark
- tapping a card raises/highlights it and may open a larger preview without losing hand context
- selected count/state is obvious
- large hands may switch to denser/two-row/compact representation
- native safe areas/notches supported

### Phone landscape
- hand/table information may occupy left/center while persistent actions occupy a right-side action rail when space permits

### Tablet
- larger fan/grid/two-row hand
- more public table/player context may be shown simultaneously
- private hand remains visually distinct from public table

### Sorting and organization
Support presentation sorting by at least:
- rank
- suit
- character/name where useful

Allow manual arrangement when useful. Manual hand ordering is private presentation state unless a specific game declares hand order authoritative. Provide non-drag reordering/accessibility alternatives.

### Selection modes
Reusable hand supports:
- single-card selection
- multi-card selection
- ordered multi-card selection
- group/meld selection
- card + target selection
- pass/transfer selection

The game engine, not the controller UI, determines selection limits and whether the selection is legal.

## Card game action area
Create reusable `CardGameActionBar`/equivalent separate from `PlayerCardHand`.

The authoritative game supplies currently legal actions and any requirements. The controller renders only relevant permitted actions or intentionally disabled actions with a useful reason.

Examples of allowed actions: `play`, `draw`, `discard`, `pass`, `exchange`, `hold`, `reveal`, `select`, `skip`, `withdraw`, `sort`, `meld`, `ask`, `give`, `confirm`, `cancel`.

Do **not** create generic betting/wagering actions.

Action area requirements:
- persistent/reachable even with 10–25 cards
- >=44 CSS px targets; primary action generally larger
- selection-dependent actions enable only when legal
- invalid selection explains the correction needed where appropriate
- action labels may be game-specific while using shared button/action infrastructure
- phone keyboard/other overlays must not hide required confirmation actions

Conceptual legal-action projection:
```ts
type CardLegalAction = {
  id: string;
  kind: 'play'|'draw'|'discard'|'pass'|'exchange'|'hold'|'reveal'|'skip'|'withdraw'|'meld'|'ask'|'give'|'confirm'|'cancel'|string;
  label: string;
  enabled: boolean;
  disabledReason?: string;
  selection?: {
    minCards?: number;
    maxCards?: number;
    ordered?: boolean;
    targetRequired?: boolean;
  };
};
```
Game-specific extension strings are allowed only for non-gambling mechanics.

## Public card table UI
Create reusable Agon card presentation primitives:
- `AgonPlayingCard`
- `CardBack`
- `CardFan` / `PlayerCardHand`
- `CardPile`
- `DiscardPile`
- `PublicCardTable`
- `CardGameActionBar`
- `SelectedCardPreview`
- `OpponentHandSummary` (count only unless public)

Follow the Agon UI/UX spec and visual references. Card backs use the Agon identity; faces show rank, custom suit mark, character identity/artwork, and only as much educational metadata as remains readable for the current size.

## Player/team model
Support both:
- one private controller per individual player
- one shared private controller per team

A team hand is visible to the team's authorized controller(s) according to existing Player Controller identity/session rules. Do not assume one physical device per human.

Games requiring private hands must declare that a private display is required for each player/team participating with a hidden hand. Projector-only fallback cannot safely display a private hand. Host-assisted fallback may be game-specific but must not casually reveal private information.

## Host Remote card controls
Host Remote should support public game actions and card-table management defined by a game's HostCommand adapter without becoming a second game engine.

Potential allowed host operations, when the game supports them:
- start/deal
- advance/confirm turn
- resolve exceptional/recovery state
- manage public deck/discard/table state through explicit commands
- select/play for a participant only when the game's fallback rules allow it

Phone remains action-first; tablet may show a richer public table. Shared dispatcher, prompt/state versioning, command acknowledgements, reconnect, and audit/source semantics from Host Remote specs remain authoritative.

## Accessibility
- suit identity never depends on color; custom symbols have accessible names
- hidden cards are announced only as hidden/card position, never private identity
- keyboard operation for desktop/public table
- Player Controller card targets >=44 CSS px where interactive
- selected/disabled/legal/played states use non-color cues
- hand can be operated without drag
- sorting/reordering has keyboard/tap alternatives
- reduced-motion mode avoids required fan/flip animation
- screen readers receive concise rank/suit/character information only when that card is authorized/revealed

## Adaptive/responsive requirements
Validate at representative Agon controller/projector sizes. Hand/action layout must remain usable with 1, 5, 10, 15, 20, and 25 cards. Test long character names and large text settings.

Actions must never be pushed off-screen solely because hand size grows. Hand region scrolls/compacts independently from the persistent action area.

## Security/testing requirements
Unit tests:
- canonical 52-card uniqueness
- 4 suits × 13 ranks
- deterministic seeded shuffle/deal
- ownership transfer/draw/discard/public transitions
- legal-action validation hooks
- reconnect/reprojection of authorized hand

Privacy/security tests:
- Player A projection never contains Player B private cards
- projector never contains private hand cards
- hidden deck order is absent from PlayerView
- stale/reassigned device cannot retain prior participant's private hand
- public reveal/play transitions only the intended card to public state
- HostRemoteView contains only role-authorized private information

Responsive/E2E:
- 1/10/15/25-card hands on phone portrait/landscape and tablet
- sort/select/multi-select/reorder without drag
- persistent action area with varying legal actions
- reconnect restores hand safely
- shared-team controller path
- public projector card transition

Policy/product tests:
- shared action enum/default components contain no betting/wagering actions
- docs/demo fixtures do not introduce ante/pot/bet/raise/call-as-wager mechanics
- future game reviews should verify the no-gambling requirement

## Persistence/versioning
Canonical deck identity/version should be stable so saved games/content can reference card IDs safely. Character/art metadata can evolve through explicit deck-content versions without silently changing rank/suit identity in saved data.

Private hand state belongs to game/session state and follows existing session persistence/recovery conventions where applicable.

## Relationship to Pairs of Faith
Pairs of Faith may reuse visual card primitives where useful, but its relationship cards are not automatically the canonical 52-card Bible Deck. Do not force Pairs of Faith content into rank/suit semantics.

## Initial implementation boundary
The card system should provide the reusable deck/engine/privacy/UI foundation plus a development/demo harness sufficient to test dealing, private hands, public play/discard, sorting/selection, and legal non-gambling actions. Do not ship a fake betting/poker game as the test harness.

Individual playable card games should be specified separately after the foundation is stable.

## Definition of done
- Canonical Scrolls/Crowns/Trumpets/Fish 52-card model exists with stable rank/suit identities.
- Custom suit symbols exist and remain distinguishable without color.
- Reusable deterministic deck/hand/pile engine exists.
- Player Controller securely displays private hands of 1–25 cards with persistent game-action controls.
- Projector/public table never leaks private hands.
- Host Remote integrates through shared command/projection architecture without exposing all hands by default.
- Individual/team controller ownership and reconnect are secure.
- Shared UI supports single/multi/ordered/group/target card selection and common non-gambling actions.
- Betting/gambling mechanics and enabling infrastructure are explicitly absent/prohibited.
- Accessibility, responsive, privacy/security, and deterministic engine tests pass.
