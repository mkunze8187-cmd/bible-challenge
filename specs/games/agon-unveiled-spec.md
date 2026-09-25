# Agon: Unveiled — Game Specification

## Concept
**Unveiled** is a turn-based reveal-board Bible challenge and deduction game. Players/teams alternate selecting covered board cells. Each cover card contains a Bible challenge. A correct challenge removes that cover and exposes the portion of a hidden clue beneath it; an incorrect challenge permanently seals that portion of the clue. As information becomes visible, eligible players/teams can buzz to solve the master puzzle for a bonus that is larger when fewer cover cards have been resolved.

The core tension is that every resolved challenge changes the information available for the master puzzle: success reveals information, failure permanently destroys access to part of it, and speculative master-puzzle guesses create multi-turn solve lockouts.

## Goals
- Combine Bible knowledge, deduction, risk/reward, visual discovery, turn strategy and buzzer play.
- Make clue revelation spatial and progressive rather than a simple numbered clue list.
- Support individual and team play.
- Scale materially from Easy through Expert.
- Use Agon's Projector, Player Controller/Buzzer, Host Remote, Timer and generalized Card & Deck infrastructure.
- Remain suitable for computer participants once the Computer Player Framework is available.

## Terminology
- **Master Puzzle**: the hidden answer players are trying to identify.
- **Cover Card / Cell**: selectable board card containing a challenge.
- **Clue Region**: one underlying clue occupying one or more adjacent board cells.
- **Clue Portion**: the part of a clue geometrically beneath one cover cell.
- **Revealed Portion**: cover challenge answered correctly; underlying portion is visible.
- **Sealed Portion**: cover challenge answered incorrectly; underlying portion is permanently obscured for that puzzle.
- **Resolved Cell**: a cell that is either revealed or sealed.
- **Solve Window**: configured period/state during which eligible participants may buzz to attempt the Master Puzzle.
- **Solve Lockout**: number of subsequent resolved-cell turns during which a participant/team cannot buzz to solve after an incorrect master answer.

## Master Puzzle content
A puzzle answer may be a Bible:
- person
- place
- event
- book
- object
- group
- parable
- miracle
- concept/theme
- other Admin-approved content type

Puzzles should have one canonical answer plus configured accepted aliases/spellings where appropriate. Host adjudication remains available for spoken/free-form answers.

## Board and difficulty
Difficulty changes board size, clue topology, challenge mix, clue subtlety and solve consequences. Defaults are authoring guidance and may be tuned after playtesting.

### Easy
- default board: approximately 3×3 / 9 cover cards
- clue geometry: **1×1 only**; every successful challenge reveals a complete clue
- generally more direct clues
- easier challenge distribution
- wrong master-solve lockout default: 1 resolved-cell turn

### Medium
- default board: approximately 3×4 / 12 cover cards
- clue geometry: mix of **1×1 and 1×2 / 2×1 rectangular regions**
- a multi-card clue may therefore be horizontal or vertical
- moderate clue subtlety and mixed challenge difficulty
- wrong master-solve lockout default: 2 resolved-cell turns

### Hard
- default board: approximately 4×4 / 16 cover cards
- clue geometry: mix of **1×1 and contiguous rectangular regions of varying dimensions and orientation**
- examples include 1×2, 2×1, 1×3, 3×1, 2×2, and larger rectangles where board/readability permits
- rectangular multi-card clues may be horizontal or vertical
- **irregular/non-rectangular clue shapes are not allowed at Hard**
- subtler clues and harder challenge distribution
- wrong master-solve lockout default: 3 resolved-cell turns

### Expert
- default board: approximately 4×5 / 20 cover cards or another validated larger layout
- supports everything in Hard
- additionally supports **irregular/random contiguous clue-region shapes**
- irregular shapes are an Expert-only mechanic
- irregular regions should remain edge-contiguous by default; disconnected regions require a future explicit special rule and are not part of normal Unveiled
- highest clue subtlety/challenge difficulty
- wrong master-solve lockout default: 4 resolved-cell turns

### Authoring constraints
The above board sizes are defaults, not hard-coded engine limits. Admin may author other validated row/column dimensions. Difficulty must validate allowed clue geometry. A puzzle cannot label itself Medium/Hard while using Expert-only irregular regions.

## Clue-region geometry
A clue is modeled independently from its cover cards:
```ts
type UnveiledClueRegion = {
  id: string;
  content: UnveiledClueContent;
  cells: string[];
  strength?: 'subtle'|'moderate'|'strong';
};
```

Every board cell belongs to exactly one clue region unless a future explicitly defined overlay mechanic is added. Multi-card regions are spatial portions of **one clue**, not duplicate copies of the clue under each card.

Examples:
- a horizontal 1×3 image clue exposes approximately one third of the image as each cover is removed
- a vertical 3×1 text/image clue exposes corresponding vertical portions
- a 2×2 clue is rendered across the entire 2×2 underlying region
- Expert irregular clue content is clipped/masked according to the region's cells

Clue-region boundaries are not shown while covered unless a future accessibility mode requires a non-spoiling alternative. Board geometry should not reveal which covered cells belong to the same clue.

## Partial reveals and permanent sealing
Each cell independently transitions:
```text
COVERED
  ├─ challenge correct   → REVEALED
  └─ challenge incorrect → SEALED
```

For multi-card clues:
- a correct cell exposes only its portion
- unresolved portions remain covered
- incorrect portions become permanently sealed
- other portions of the same clue can still be revealed later
- a clue may therefore be fully revealed, partially revealed, partially sealed, or effectively unreadable
- sealing one portion does not automatically seal the entire clue

The visual treatment must make COVERED, REVEALED and permanently SEALED states unmistakable without relying on color alone.

## Clue content types
Initial supported clue content:
- short text/word/phrase
- image/illustration
- map/map fragment
- Scripture reference or partially exposed reference
- icon/object/symbol
- person silhouette/portrait fragment where content policy permits
- combined image + text

The generalized card/content renderer should permit future clue types without changing game-state rules.

## Challenge covers
Each cover cell references a Challenge Engine challenge and point value/difficulty. The cover front may display cell ID/value/difficulty/category according to game configuration, but must not leak the underlying clue.

On the active participant/team's turn:
1. choose an unresolved cover cell
2. authoritative state selects/opens that cover's challenge
3. present challenge
4. active participant/team answers under configured challenge/timer rules
5. correct: award challenge points and transition cell to REVEALED
6. incorrect: award no challenge points (unless a future scoring profile explicitly says otherwise) and transition cell to SEALED
7. update master-solve value and solve-lockout counters
8. enter configured Solve Window
9. after solve window/no successful solve, advance turn

Challenges cannot be retried after the cell resolves.

## Turn order
Players/teams alternate turns using normal Agon participant/turn infrastructure. A participant under a **solve lockout still takes normal board turns and answers cover challenges**; only the ability to buzz for the Master Puzzle is disabled.

If a game has more than two participants, turn order cycles through configured seats/teams.

## Solve Window and buzzers
After a cell resolves, the game opens a Master Puzzle solve opportunity according to configuration.

Recommended default flow:
1. newly revealed/sealed board state is displayed
2. optional protected **Think Period** gives everyone time to inspect the changed board while solve buzzers are disabled
3. solve buzzers open for `X` seconds or until an eligible participant buzzes
4. authoritative Buzzer Engine determines first accepted buzz
5. other solve buzzers lock while that attempt is adjudicated
6. solver gives typed or spoken answer according to configuration
7. correct answer ends the puzzle/round
8. incorrect answer applies solve lockout and play continues

The Think Period and open-buzzer duration are configurable independently. Difficulty may supply defaults. Network/client timing never determines the winner; existing authoritative buzzer ordering applies.

## Solve response modes
Configurable per game/session/puzzle:
- **Spoken / Host judged**
- **Typed / Host or normalized-answer validation**
- **Multiple choice** where explicitly desired

For typed private solve attempts, other players should not receive the submitted wrong answer. Projector may show only that the attempt was incorrect. This prevents an incorrect guess from becoming an unintended clue.

## Incorrect solve lockout
An incorrect Master Puzzle attempt disables only that participant/team's **solve buzzer** for a configured number of subsequent resolved-cell turns.

Default difficulty values:
- Easy: 1
- Medium: 2
- Hard: 3
- Expert: 4

Lockout is counted in authoritative resolved-cell turns, not wall-clock seconds. UI displays remaining lockout clearly, e.g. `Solve locked — 2 turns remaining`.

Lockout must not prevent normal challenge turns. Lockout decrements exactly once per qualifying resolved cell according to documented timing and survives reconnect/session recovery.

## Scoring
### Challenge points
Correct cover challenges earn configured points based on challenge difficulty/value.

### Master Puzzle bonus
Correctly solving the Master Puzzle awards a separate bonus that is **larger when fewer cover cards have been resolved**.

The bonus decreases based on **resolved cells**, not only successfully revealed clues. Both REVEALED and SEALED cells reduce the remaining solve bonus. This prevents deliberate challenge failure from preserving a high master-puzzle value.

Use a configurable scoring curve rather than hard-coded values. Conceptually:
```ts
masterBonus = scoringProfile.valueForResolvedCellCount(resolvedCount, totalCells);
```

Projector should show current Master Puzzle value unless a game configuration intentionally hides it.

Optional clue-completion bonuses are outside the initial required rules; the central scoring model is challenge points + early master-solve bonus.

## Puzzle completion / exhaustion
A puzzle ends when:
- an eligible participant/team correctly solves the Master Puzzle; or
- all cover cells are resolved and game configuration permits a final solve phase; or
- host invokes an authorized recovery/end action.

If all cells resolve without a correct solve, run a configured final solve opportunity among eligible participants. If nobody solves, reveal the canonical answer and record no Master Puzzle bonus.

## Board generation vs authored layout
Initial production puzzles should support authored clue content and validated region layout. The game may randomize:
- assignment/order of challenge covers to valid cells
- challenge selection within configured pools
- optionally clue-region placement only when authoring metadata declares it safe

Do not arbitrarily rotate/crop semantic text/image clues into invalid layouts. Expert `random` geometry means validated irregular region generation/selection, not uncontrolled visual corruption.

Any procedural region layout must be authoritative, seeded and reproducible.

## Projector UX
Projector is the primary reveal-board experience.

Display:
- responsive grid of ornate Agon cover cards
- active player/team and scores
- current Master Puzzle bonus
- COVERED / REVEALED / SEALED board state
- revealed clue fragments in their correct spatial positions
- challenge overlay/detail when a card is flipped
- Think Period / solve-buzzer countdown/status
- solve lockout indicators for participants/teams
- winner/master answer reveal

Animations:
- selected card lifts/flips to challenge
- correct challenge removes/dissolves cover to expose underlying clue portion
- incorrect challenge transforms into a permanent Agon `SEALED` treatment rather than exposing content
- multi-card clue remains spatially continuous beneath remaining covers
- Full/Reduced/Off motion support

The renderer must adapt to Easy–Expert board sizes at 4:3, 16:10 and 16:9 without making clue content unreadable.

## Player Controller / Buzzer UX
On active turn:
- selectable unresolved board cells when game permits player selection from controller
- challenge response controls appropriate to challenge type
- clear turn/timer/status

During Solve Window:
- prominent `SOLVE` buzzer when eligible
- disabled lockout state with turns remaining when ineligible
- authoritative first-buzz acknowledgement
- typed answer field only for the accepted solver when typed mode is used

Controller must not receive unrevealed clue content. For spatial board selection it may receive safe cell IDs/state only.

## Host Controls / Host Remote
Host Remote/desktop Host supports authorized operations:
- start/pause/resume puzzle
- select cell on behalf of active participant when needed
- challenge adjudication/override according to existing Challenge Engine conventions
- reveal vs seal only through authoritative challenge/recovery command
- open/close solve window
- adjudicate spoken/typed master answer
- inspect submitted solve answer privately where role permits
- undo/recovery under audited game-state rules
- timer controls
- end/reveal puzzle

Host view must not casually expose unrevealed clues. If recovery/admin inspection requires hidden content, make it an explicit privileged diagnostic action rather than normal Host Remote projection.

## Admin authoring
Provide an Unveiled puzzle editor/validator.

Author can configure:
- title/internal ID
- canonical Master Puzzle answer + accepted aliases
- answer type/category
- difficulty
- board rows/columns
- clue regions and their covered cells
- clue content/assets
- clue strength metadata
- challenge pool/individual challenge mapping and values
- Think Period and solve-window duration
- response mode
- solve-lockout turns
- master-bonus scoring curve/profile
- optional challenge/clue randomization rules

Editor should provide a visual board designer/preview.

Validation must enforce:
- every cell maps to exactly one clue region
- no overlapping regions
- all region cells exist
- Medium multi-card regions only permitted 1×2/2×1 rectangles
- Hard multi-card regions are contiguous rectangles, horizontal or vertical orientation allowed, with validated dimensions
- irregular shapes rejected below Expert
- Expert irregular shapes are contiguous by default
- clue assets/layout can render across assigned geometry
- canonical answer exists
- challenge coverage is complete
- scoring/lockout/timers valid

Preview modes should include fully covered, selected challenge, partial reveal, partial seal, complete reveal, phone/controller, projector aspect ratios, and Reduced/Off motion.

## Computer Player support
When Agon Computer Player Framework is available, Unveiled may opt in through a game-specific strategy adapter.

Computer strategy must receive only information legitimately visible to its seat:
- public revealed clue portions
- public sealed/covered cell state
- legal selectable cells
- public scores/turn state
- its own lockout state

It must never receive unrevealed clue content or master answer through `ComputerPlayerView` merely because authoritative state contains it.

Strategy may model:
- card/challenge selection
- whether to attempt master solve based on legitimate evidence and difficulty
- simulated Bible-answer accuracy through the approved trivia knowledge model where needed

Difficulty cannot grant hidden clue access.

## Privacy/security
Unrevealed and sealed clue content is secret game state.
- projector/player serialized views do not contain it
- CSS masking is insufficient
- SEALED content remains absent permanently from normal participant projections
- typed incorrect master guesses are not projected to opponents
- HostRemoteView receives only normal host-authorized data
- reconnect/reassignment clears stale private solve-answer data
- computer strategy context excludes hidden clues/master answer except through an explicitly designed simulated-answer interface that cannot expose it to decision heuristics

## Accessibility
- board cells have stable accessible labels and states
- challenge card selection has keyboard/non-drag path
- revealed text/image clues have meaningful accessible representation for authorized/public users
- sealed cells announce `sealed` without hidden clue content
- board state is not communicated by color alone
- exact timer/solve-window state available textually
- buzzer lockout state and remaining turns announced
- Full/Reduced/Off motion
- irregular Expert geometry has a logical reading order independent of visual shape

## Persistence/recovery
Persist authoritative:
- puzzle/content version
- board/region layout
- challenge assignments
- each cell state
- scores
- turn/participant state
- solve lockouts
- current master bonus/resolved count
- timer/solve-window state
- accepted/current solve attempt as appropriate
- seeded RNG state for procedural assignments

Reconnect/recovery must not reshuffle challenges, regenerate Expert regions, reveal hidden clues, decrement lockout incorrectly, or reopen an already adjudicated solve attempt.

## Dependencies
Unveiled should reuse rather than duplicate:
- Agon Card & Deck Engine / generic CardRenderer and card-zone primitives (#130, #132, #167 and related card privacy work)
- Challenge Engine/current challenge infrastructure
- authoritative Buzzer/Player Controller infrastructure
- Agon Timer System (#156–#159) for Think Period/solve windows where available
- Host Remote shared HostCommand/dispatcher (#94–#96 and Agon Host work as applicable)
- Agon UI/UX foundations (#101–#113 as applicable)
- Computer Player Framework (#160–#166) only for optional computer opponents; it is not required for initial human multiplayer release

Unveiled does **not** require the canonical 52-card Bible Playing Deck or its character mapping; it uses generic cover-card/render primitives.

## Test plan
### Rules/unit
- correct challenge → REVEALED + challenge points
- incorrect challenge → SEALED permanently
- multi-card clue partial reveal/seal combinations
- master bonus declines for both reveal and seal resolution
- incorrect solve applies exact lockout count
- lockout participant still takes normal turns
- lockout decrements exactly once per qualifying turn
- correct solve ends puzzle and awards current bonus
- final solve/exhaustion behavior

### Geometry
- Easy rejects multi-card region
- Medium accepts horizontal 1×2 and vertical 2×1; rejects larger/irregular
- Hard accepts horizontal/vertical rectangular 1×N/N×1 and multi-row rectangles such as 2×2/2×3/3×2 within limits; rejects irregular
- Expert accepts validated contiguous irregular shapes
- no overlaps/gaps
- spatial clue clipping aligns after partial reveals

### Buzzer/timer
- protected Think Period blocks early buzz
- authoritative first buzz wins
- locked participant cannot submit solve buzz
- typed answer visible only to solver/authorized host until adjudication
- timer expiry transitions correctly

### Privacy
- covered clue absent from Player/Projector serialized state and DOM/ARIA
- sealed clue remains absent
- partial clue projection contains only revealed portions
- incorrect typed guess absent from opponents
- ComputerPlayerView contains no hidden clue/master-answer leakage

### Responsive/E2E
- Easy 3×3, Medium 3×4, Hard 4×4, Expert 4×5 representative puzzles
- horizontal and vertical multi-card clues
- Hard rectangular multi-row clue
- Expert irregular clue
- phone portrait/landscape controller
- tablet Host Remote
- 4:3/16:10/16:9 projector
- reconnect during challenge, Think Period, solve window and lockout
- Full/Reduced/Off motion

## Initial release boundary
Initial release should include:
- Easy/Medium/Hard/Expert board validation and layouts
- text/image/reference/map-capable clue rendering
- horizontal/vertical rectangular multi-card clues
- Expert irregular contiguous regions
- challenge scoring
- reveal/seal behavior
- early-solve bonus
- Think Period + authoritative solve buzzer
- spoken and typed master-answer modes
- multi-turn wrong-solve lockout
- Projector, Player Controller and Host support
- Admin authoring/preview

Computer opponents may follow after the human multiplayer game is stable.

## Definition of done
- Unveiled can run a complete multi-round/session puzzle with 2+ players/teams
- difficulty materially changes board/clue topology
- Easy uses only single-card clues
- Medium supports single + horizontal/vertical two-card clues
- Hard supports single + rectangular multi-card clues in horizontal/vertical/larger rectangle forms, but no irregular shapes
- Expert uniquely supports irregular/random contiguous clue shapes
- multi-card clues reveal spatial portions independently and wrong portions remain permanently sealed
- players alternate cover selection/challenges
- solve buzzer opens according to configured timing
- incorrect master solve creates difficulty/configuration-based multi-turn solve lockout without removing normal turns
- master bonus rewards solving with fewer resolved cover cards
- unrevealed/sealed clue content and wrong typed guesses do not leak
- adaptive Projector/Player/Host/Admin UX passes accessibility/responsive/recovery tests
