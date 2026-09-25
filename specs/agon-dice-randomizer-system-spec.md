# Agon Dice & Randomizer System Specification

## Purpose
The **Agon Dice & Randomizer System** is reusable randomized-game infrastructure for Agon: The Bible Challenge. It supports conventional polyhedral dice and game-specific custom randomizers whose faces may contain numbers, words, colors, icons, pictures, Bible characters, categories, actions, or combinations of those values.

This specification defines shared infrastructure, not a single game. Individual games compose these primitives and remain authoritative for game rules, scoring, turns, and legal actions.

## Non-negotiable product rule: no betting or gambling
Agon dice/randomizers must not implement, enable, simulate, normalize, or provide reusable infrastructure specifically for betting or gambling.

Forbidden mechanics/terminology include:
- betting or wagering on roll outcomes
- stakes, pots, antes, gambling chips/currency, bankrolls
- craps/casino-style wagering tables or casino presentation
- odds-based wagers, side bets, proposition bets
- risking points, money, prizes, virtual currency, or other value on uncertain roll outcomes
- APIs/components whose intended purpose is to make future wagering mechanics easy to add

Allowed uses include movement, turn order, category selection, difficulty selection, question selection, actions, resources, scoring determined directly by a game's rules, challenges, characters, locations, educational prompts, and other non-wagering randomized gameplay.

Code, UI copy, sample/demo games, tests, documentation, and AI implementation instructions must not use casino/craps/betting examples as generic demonstrations.

## Core model: a die is a configurable randomizer
Do not model dice only as `random integer 1..6`. A die/randomizer has a stable identity and a list of faces. Each face has a machine-readable value plus optional presentation/educational metadata.

Conceptual model:
```ts
type AgonRandomizer = {
  id: string;
  name: string;
  kind: 'die' | 'spinner' | 'tumbler' | 'custom';
  faces: AgonRandomizerFace[];
  presentation?: {
    preferredShape?: 'd4'|'d6'|'d8'|'d10'|'d12'|'d20'|'auto'|'custom';
    artworkAssetId?: string;
    theme?: string;
  };
  enabled?: boolean;
  tags?: string[];
};

type AgonRandomizerFace = {
  id: string;
  value: string | number;
  label?: string;
  number?: number;
  colorToken?: string;
  iconAssetId?: string;
  imageAssetId?: string;
  text?: string;
  metadata?: Record<string, unknown>;
};
```

Exact schema should follow repository conventions while preserving these concepts.

## Supported sizes
The engine must support arbitrary face counts >=2 within practical configured limits. First-class presentation support should include conventional virtual polyhedral dice:
- d4
- d6
- d8
- d10
- d12
- d20

The engine must also support custom counts such as d5, d7, d9, etc. A custom count does **not** require pretending a convenient physical polyhedron exists.

### Physical die vs. generic randomizer presentation
- When a conventional die shape is appropriate, Agon may render a recognizable 3D/2D polyhedral die.
- When the face count/content does not map cleanly to a physical die, render an Agon spinner/tumbler/randomizer presentation instead.
- The authoritative result model is the same regardless of presentation.
- Presentation must never change outcome probability.

## Face content
A face may contain one or several compatible display properties. Examples:
- number: `1`, `7`, `20`
- category: `Person`, `Place`, `Event`, `Book`, `Verse`, `Object`
- difficulty: `Easy`, `Medium`, `Hard`, `Challenge`
- word/action: `Move`, `Draw`, `Choose`, `Pass`, `Bonus Question`
- color + accessible label
- icon or image
- Bible character/location/object image + text

Color can reinforce identity but cannot be the sole semantic signal. Image-only faces require accessible names/labels.

## Weighted faces / probability
Default randomizers are fair: each configured face has equal probability.

Architecture may support explicit **game-defined weighted outcomes** only when a legitimate non-gambling game mechanic requires them. Weighting must be:
- explicit in configuration
- deterministic under the seeded RNG
- testable
- not represented misleadingly as a fair physical die
- never used for wagering/gambling

Do not infer weights from duplicate-looking faces unless the game intentionally configures distinct face entries.

## Multiple dice/randomizers
A roll may contain one or more randomizers, and they need not be identical.

Examples:
- two d6 numbered dice
- Category + Difficulty
- Character + Location + Object
- Number + Book category

Conceptual roll request/result:
```ts
type RandomizerRollRequest = {
  randomizerIds: string[];
  visibility: 'public'|'private-player'|'private-team'|'host-only'|'delayed-public';
  requestedBy: string;
  contextId?: string;
};

type RandomizerRollResult = {
  rollId: string;
  results: Array<{
    randomizerId: string;
    faceId: string;
    value: string | number;
  }>;
  visibility: RandomizerRollRequest['visibility'];
  rngSequence?: number;
  createdAt: string;
};
```

## Deterministic authoritative RNG
All gameplay-affecting results are generated by the authoritative host/game engine, never by a Player Controller or Host Remote browser.

Requirements:
- use repository/session RNG conventions where available
- support deterministic seeded rolls for automated tests and reproducible sessions/debugging
- client sends a roll intent/command, not a claimed result
- server/host generates result, commits it to authoritative game state, then projects authorized result views
- animation is presentation only and must resolve to the already-authoritative result
- prevent accidental duplicate roll commands through command/turn/state-version protections appropriate to the calling surface

Do not use animation physics as the source of truth for the result.

## Visibility and privacy
Randomizer results may be:

### Public
Result is visible to projector, authorized Player Controllers, Host Controls/Remote as appropriate.

### Private player
Only the authorized individual player and necessary authoritative host/game state receive the result. Other players/projector receive only permitted public metadata, such as `roll completed`, if the game requires it.

### Private team
Authorized team controller(s) receive the result; opponents/projector do not.

### Host-only
Normal player/projector projections do not receive the result.

### Delayed public
Result is initially private to the authorized role and later transitions to public through an explicit authoritative reveal action.

Never send a private result to all clients and hide it with CSS/UI logic.

## Roll lifecycle
Recommended reusable lifecycle:
1. game determines whether roll is legal and which randomizer set applies
2. authorized player/team/host invokes `ROLL`
3. request enters authoritative game/command path
4. engine generates and records result using seeded RNG
5. authorized views receive result according to visibility
6. presentation animates and lands on committed result
7. game consumes result and exposes next legal actions
8. optional history entry is recorded according to game rules/privacy

Games may automatically roll without a button when their rules require it, but result generation remains authoritative.

## Roll history
Provide reusable roll-history data with configurable retention/visibility.

History entries may include:
- roll ID/order
- roller/player/team
- randomizer names
- public result(s)
- timestamp/turn/round context

Private/host-only historical results remain private under the same projection rules unless explicitly revealed later. Do not let a public history component leak earlier private rolls.

## Player Controller
Create reusable Player Controller randomizer UI.

### Action state
- clear `ROLL` primary action when the game says rolling is legal
- controller must not locally choose/generate the outcome
- disabled/locked/non-active states explain status where useful
- prevent rapid duplicate submissions while a roll is pending/acknowledging

### Result state
- show authorized result with accessible text in addition to color/image
- support one or multiple simultaneous results
- phone portrait: action-first, large roll control, compact prior/public context
- landscape/tablet: richer randomizer/result/history/game context when useful
- orientation change does not re-roll or lose committed result

### Custom faces
Player Controller supports text, number, icon/image, and color+label faces without assuming every randomizer is numeric.

## Projector / audience presentation
Create reusable `RandomizerPresentation` / `DiceTray` / equivalent components.

Requirements:
- public rolls can animate prominently and resolve to committed results
- multiple dice/randomizers can be displayed together
- custom faces remain readable at distance
- public history/last roll may be displayed when game rules require it
- private rolls never reveal face/result on projector
- for a private roll, projector may show neutral status such as `Michael is rolling…` or `Roll complete` only if the game permits that metadata
- responsive at Agon 4:3/16:10/16:9 projector targets

## Visual design
Follow `specs/agon-ui-ux-design-system-spec.md` and approved Agon references.

Conventional dice should feel like Agon game objects rather than casino dice: navy/gold/material styling, clear high-contrast faces, restrained effects, no casino table/chip aesthetic.

Custom randomizers may use:
- polyhedral presentation
- spinner/wheel
- tumbler/token carousel
- card-like result tiles

Choose presentation based on readability and face count/content, not novelty.

## Motion, audio, haptics
Optional shared feedback:
- roll/tumble animation
- result settle/reveal
- subtle roll/result sound
- optional Player Controller haptic on roll/result where supported

Requirements:
- Full / Reduced / Off motion compatibility
- animation duration must not unnecessarily delay gameplay
- Reduced/Off modes reveal the same result clearly without animation
- sound/haptics are optional and not required to understand outcome

## Host Controls / Host Remote
Host can invoke a roll only when the game exposes an authorized host roll command or fallback action.

Requirements:
- shared HostCommand/dispatcher path; no remote-generated result
- phone: large roll/action control + concise status/result as authorized
- tablet: may show randomizers, public context/history and result together
- host may roll on behalf of a player/team only when the game rules explicitly permit fallback
- private player/team results should not automatically become visible to normal Host Remote unless the host role genuinely requires them
- stale/double command protection follows Host Remote architecture

## Admin / content authoring
Provide reusable randomizer definition authoring when game/content workflows require custom dice.

Admin capabilities:
- create/edit randomizer name/type/face count
- create/edit/reorder faces
- face value + label + number/text/color/icon/image
- accessible label validation
- preview conventional/custom presentation
- configure equal probability by default
- configure explicit weights only when enabled by a legitimate game/content type
- validate duplicate IDs, missing assets, empty faces, invalid weights
- test-roll preview with visible/fixed seed for reproducibility
- show probability summary when weights are used

Admin must not provide betting/payout/odds-for-wager configuration.

## Game integration API
Individual games should consume a reusable adapter/service rather than directly calling random-number APIs.

Conceptually:
```ts
interface AgonRandomizerService {
  roll(request: RandomizerRollRequest, rngContext: RngContext): RandomizerRollResult;
  validateDefinition(definition: AgonRandomizer): ValidationResult;
  getPublicProjection(result: RandomizerRollResult): unknown;
  getPlayerProjection(result: RandomizerRollResult, playerId: string): unknown;
}
```

Exact API follows repository conventions. Games own legality, scoring, movement, question selection, etc.; the randomizer service owns configured random outcome generation and projection helpers.

## Composability with other Agon systems
The randomizer system should be usable with:
- Challenge/question engine
- Agon Bible Deck/Card System
- board/movement games
- Player Controller interactions
- Host Remote

Examples of valid composition:
- character card + category die → ask a question in that category about the character
- Category + Difficulty dice → select a challenge
- Number die → number of spaces/actions/questions according to game rules

Composition must preserve each subsystem's privacy rules.

## Accessibility
- every face has an accessible semantic label
- color is never the only identifier
- image faces have meaningful alt/accessible labels
- result announced to authorized screen reader users
- roll button >=44 CSS px and generally much larger on touch devices
- keyboard activation supported on desktop/host
- Reduced/Off motion supported
- dice shape/animation is not required to understand the result
- private result labels must not leak into unauthorized DOM/ARIA trees

## Performance / offline
- no Internet/CDN dependency for essential randomizer assets
- local/bundled artwork/icons
- animations should run acceptably on older Windows/lower-end mobile devices
- large image-face assets lazy-load where safe without delaying authoritative result generation
- result remains usable if animation/audio/haptic capability is unavailable

## Security/testing requirements
Unit tests:
- fair face selection across deterministic seeds at algorithmic level
- d4/d6/d8/d10/d12/d20 definitions
- arbitrary custom face counts
- multi-randomizer rolls
- deterministic seeded reproduction
- weighted configuration validation/result selection if weighting is implemented
- roll history retention/privacy

Security/privacy tests:
- Player A cannot receive Player B/team private roll result
- projector cannot receive private/host-only result
- delayed-public result is absent until explicit reveal
- HostRemoteView contains only role-authorized result information
- stale/replayed roll command cannot generate unintended extra authoritative rolls

E2E/responsive:
- public d6 roll from Player Controller → projector reveal
- custom category die with text/icon/image faces
- two different randomizers rolled together
- private team roll
- delayed reveal
- Host Remote fallback roll
- phone portrait/landscape, tablet, laptop/projector
- reconnect after committed roll does not reroll
- Reduced/Off motion

Statistical testing must not use flaky assertions based on small random samples. Prefer deterministic seeds and algorithm/property tests; use broad distribution sanity tests only with robust tolerances if useful.

## No-gambling release gate
Before randomizer infrastructure is considered complete:
- search shared engine, action types, Admin fields, UI, fixtures, docs and demos for wagering/betting/casino-specific infrastructure
- no bet/wager/ante/pot/blind/bankroll/chip/stake/payout APIs or UI
- no craps/casino betting demo or visual theme
- dice may award/direct points/resources only as explicit game rules, never as settlement of a wager
- add automated assertions/lint/schema checks where practical to prevent forbidden generic fields/actions from entering shared randomizer infrastructure

## Relationship to card system
Dice/randomizers are independent of the Agon Bible Deck. Games may combine them, but neither system owns the other. A card game may request a roll; a dice game may display/use a card; privacy projections remain explicit and role-specific.

## Initial implementation boundary
Provide reusable model/engine/projections, conventional + custom presentation, Player Controller/Projector/Host integration, Admin definition support, and a development harness. Do not ship an individual dice game merely to test the infrastructure.

The development harness should exercise numbered dice, custom text/image/category faces, multiple randomizers, public/private/delayed visibility, history, and legal roll commands without casino/betting examples.

## Definition of done
- arbitrary configurable randomizers plus first-class d4/d6/d8/d10/d12/d20 support exist
- faces support number/text/color+label/icon/image/custom metadata
- multiple heterogeneous randomizers can roll together
- authoritative seeded RNG generates outcomes; clients never claim results
- public/private-team/private-player/host-only/delayed-public projection works without leaks
- Player Controller, projector and Host Remote provide adaptive role-appropriate roll UX
- Admin can author/validate/test custom randomizers
- motion/accessibility/offline requirements pass
- reusable APIs can compose with Challenge and Agon Card systems
- betting/gambling mechanics and enabling infrastructure are explicitly absent/prohibited
- deterministic, privacy, responsive and E2E validation passes
