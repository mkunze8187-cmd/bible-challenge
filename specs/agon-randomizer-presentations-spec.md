# Agon Randomizer Presentations Specification

## Purpose
This specification strengthens the Agon Dice & Randomizer System by making **Die, Spinner, Wheel, Casting Lots, Tumbler, and Result Tiles** first-class interchangeable presentations over the same authoritative seeded randomizer engine.

The selected outcome and its presentation are separate concepts. A game defines what can be selected and any probabilities; the presentation defines how Agon theatrically communicates the already-committed result.

## First-class presentation types
### Die
Best for small conventional numeric/icon face sets. First-class d4/d6/d8/d10/d12/d20; custom counts may use another presentation rather than fake geometry.

### Spinner
A fixed segmented field with a moving pointer. Good for compact category/action sets, typically when labels remain readable. Supports text, icon, image, number and color+label segments.

### Wheel
A rotating segmented wheel with a fixed pointer. Appropriate for larger choice sets such as Bible books, characters, players, categories or challenges. Wheel is distinct from Spinner in visual behavior even though both use the same authoritative randomizer.

Wheel requirements:
- dynamically sized segment count within practical readability limits
- text/icon/image segments
- long-label truncation/wrapping plus accessible full label
- prior-result highlighting when requested by the game
- optional game-defined removal/disable-after-selection behavior
- repeat allowed/forbidden according to game rules
- if an item is removed, the authoritative candidate pool changes before the next selection; animation never simulates removal without state change
- phone/tablet/projector layouts

### Casting Lots
A distinctly biblical presentation using marked stones/tokens/lots and a vessel or casting surface. It must not simply look like rounded dice.

Supported modes:
- Draw One Lot
- Draw Multiple Lots (with or without replacement according to game rules)
- Cast/Reveal Multiple Lots where the combination is meaningful
- Elimination Lots, where selected lots are removed until reset

Lot faces may represent names, players/teams, categories, Bible books/characters, numbers, colors+labels, symbols, icons or images.

Educational/context rule: Casting Lots is presented as a historical/biblical random-selection motif. Agon must not imply that software randomness provides divine guidance, prophecy, divination, or spiritual discernment.

### Tumbler
A container/carousel/tumbling-token presentation suitable for image-heavy, token-like or irregular custom choices. Useful when neither a segmented wheel nor polyhedral die reads well.

### Result Tiles
Low-motion/direct presentation for accessibility, compact UI, rapid gameplay, or games where theatrical animation is unnecessary. May reveal one or multiple result tiles.

## Presentation selection
Randomizer definition/game configuration may specify:
- `preferredPresentation`
- allowed presentations
- presentation-specific options

Agon may choose `auto` based on face count/content/device, but changing presentation must not change candidate values or probabilities.

Conceptual extension:
```ts
type RandomizerPresentationKind =
  | 'die'
  | 'spinner'
  | 'wheel'
  | 'lots'
  | 'tumbler'
  | 'tiles';
```

## Authoritative outcome rule
For every presentation:
1. game validates roll/select action
2. authoritative randomizer engine commits result
3. authorized projection receives result/state
4. presentation animates toward committed result
5. presentation completes/reveals result

Pointer physics, wheel rotation, die physics, token collision, lot drawing animation, or client timing never determines the result.

## Selection pools and replacement
Randomizers may define a candidate pool for a session/round. Games may request:
- with replacement: selected item remains eligible
- without replacement: selected item is removed/disabled until reset
- explicit reset/repopulate
- weighted candidate pool where allowed by the base randomizer spec

Pool mutation is authoritative and deterministic. UI visually reflects unavailable/removed choices.

## Multiple selections
A single authoritative selection may return one or multiple outcomes. This supports multiple dice, multiple lots, wheel multi-pick, or custom game mechanics. Duplicate outcomes are allowed only when candidate/replacement rules permit them.

## Player Controller
Phone/tablet may initiate an authorized selection and see a compact version of the appropriate presentation/result. Projector can provide the theatrical shared presentation. The controller never generates the outcome.

For private results, only authorized devices render the result/presentation. Public projector receives no private result data.

## Host Remote
Host can invoke/reveal/reset a randomizer only through game-authorized HostCommands. Pool state, removal/replacement and reveal state are authoritative. Host Remote does not own wheel/lot state.

## Admin authoring
Extend randomizer authoring to preview/select Die/Spinner/Wheel/Lots/Tumbler/Tiles and configure presentation-safe options such as:
- preferred/allowed presentations
- segment/lot labels and artwork
- replacement/removal behavior when the consuming content type allows it
- fixed-seed preview
- readability warnings for excessive wheel/spinner labels

Do not allow presentation settings to silently alter configured probability.

## Accessibility
- every segment/lot/token/result has an accessible semantic label
- color is supplementary only
- Reduced/Off motion can bypass spin/tumble/draw animation and directly reveal the committed result
- keyboard/touch activation supported
- screen readers receive only authorized result information
- lots/wheel state must be understandable without animation

## Visual design
All presentations follow Agon navy/gold/material language and approved design references. They should feel like components of the same game system while remaining visually distinct.

Casting Lots should use historically evocative marked stones/tokens/vessel imagery without claiming archaeological exactness unless a specific educational asset is sourced/reviewed.

## No betting/gambling
All presentation types inherit Agon's strict no-betting/no-gambling rule. No casino wheel, roulette, craps, betting table, wager, payout, stake, chip, bankroll or odds-for-wager presentation/configuration/examples.

## Testing
- same seed/candidate pool produces same authoritative result regardless of presentation
- switching Die/Spinner/Wheel/Lots/Tumbler/Tiles cannot change probabilities
- with/without replacement deterministic pool tests
- wheel removal/reset tests
- Draw One/Multiple/Elimination Lots tests
- private projection leak tests
- Reduced/Off motion tests
- phone/tablet/projector responsive tests
- long labels/image segments/accessibility tests
- no-gambling release checks

## Definition of done
- six presentation types are first-class and reusable
- Wheel and Spinner are visually/behaviorally distinct
- Casting Lots has dedicated biblical visual treatment and selection modes
- replacement/removal/multi-select pool behavior is authoritative
- presentation cannot influence outcome
- all surfaces honor privacy/accessibility/motion rules
- no betting/gambling infrastructure or visual language is introduced
