# Agon: Wayfinder — Game Specification

## Concept
**Wayfinder** is a 1–2 player Bible knowledge maze/navigation game. Players travel through fog-covered, separately rendered mazes toward a destination. Every gameplay step is driven by a Bible question. In head-to-head play, both players receive the **same question at the same time**, answer privately, lock independently, and then both maze consequences resolve simultaneously. Correct answers generally preserve efficient progress; incorrect answers can cause detours, backtracking, loops, missed shortcuts, dead ends, or controlled displacement to a worse location.

Players are not required to answer every question correctly to finish. Every valid gameplay state must retain a route to the destination. Knowledge determines route efficiency.

After the round, **Path Review** lifts the fog, reveals the route logic, identifies wrong answers, gives correct answers and Scripture/explanations, and shows how each mistake affected the route.

## Modes
### Solo Journey
- 1 human player
- no opponent required
- timer optional/configurable
- goal is to reach the destination efficiently
- end-of-round comparison against optimal/par path

### Solo Challenge
- 1 human player
- optional target time, par question count, accuracy target, or configured combination
- same maze/question engine as Solo Journey

### Head-to-Head
- exactly 2 competing players/teams
- each has a distinct maze generated from equivalent difficulty/consequence budgets
- both receive the same question per synchronized step
- answers are private and cannot influence the opponent
- movement resolves simultaneously after both lock or authoritative timer expires
- first player to reach the destination wins, subject to configured finish-step rules below

Optional Player-vs-Computer may be added through the Computer Player Framework; human multiplayer/solo release does not depend on it.

## Synchronized head-to-head question model
Head-to-head is **not** two asynchronous trivia races.

For step N:
1. server selects one shared question
2. both players receive the same question simultaneously
3. each privately answers on their own controller
4. submission locks for that player
5. projector may show `Locked in` status but never the selected/typed answer
6. wait until both players lock or authoritative timer expires
7. evaluate each response independently
8. apply each player's current maze node's correct/incorrect transition
9. reveal/move both tokens simultaneously
10. update fog/discovered state
11. if no finish condition is met, begin the next shared question

Question identity belongs to the synchronized gameplay step, not to an individual maze node. Each player's current node supplies the consequences for correct/incorrect outcome.

## Finish-step fairness
If a player reaches the destination from a synchronized head-to-head question, the other player's answer from that same question must still resolve. The winner is determined after the step resolves for both players.

If both reach the destination on the same synchronized step, use configured deterministic tiebreakers rather than response speed by default. Recommended order:
1. fewer wrong answers in the round
2. lower accumulated route-cost penalty / fewer extra effective steps
3. if still tied, declare tied round or use a configured shared tiebreak question

Raw answer speed should not silently become the tiebreaker because Wayfinder is designed around knowledge/path efficiency, not buzzer speed.

## Question/answer formats by difficulty
Suggested defaults:
- **Easy:** multiple choice
- **Medium:** primarily/all multiple choice
- **Hard:** deliberate mix of multiple choice and typed/free-response
- **Expert:** primarily/all typed/free-response

Hard mix should be content/configuration driven so typed questions cannot be predicted merely from maze position.

Typed answers use canonical answer/alias normalization comparable to Multitude where reusable. Conservative spelling tolerance is allowed. Ambiguous answers may enter Host Review where game timing permits; do not aggressively fuzzy-match different biblical entities.

In head-to-head, one player's answer content is never shown to the other before resolution and should normally remain hidden during Medium+ race play even after movement. Full correctness is explained in Path Review.

## Correctness visibility
Suggested defaults:
- Easy may explicitly show correct/incorrect feedback after each step
- Medium/Hard/Expert hide correctness during the race; players see only resulting path/movement/fog changes

A consequence's visual appearance must not be a guaranteed correctness oracle. Especially at higher difficulty, different consequence types and maze geometry should keep outcomes plausible until Path Review.

## Maze architecture: graph first, renderer second
Wayfinder must not rely on an unconstrained graphical maze generator. Authoritative gameplay is a directed navigation graph rendered as a maze.

Conceptually:
```ts
type WayfinderNode = {
  id: string;
  position: MazePosition;
  correctTransition: WayfinderTransition;
  incorrectTransition: WayfinderTransition;
  distanceToGoal: number;
};

type WayfinderTransition = {
  type: 'direct'|'detour'|'backtrack'|'loop'|'missed-shortcut'|'dead-end'|'displacement';
  destinationNodeId: string;
  effectivePenalty?: number;
  metadata?: Record<string, unknown>;
};
```

Exact types follow repository conventions.

The graph engine owns solvability, transition legality, distance/cost calculations and fairness. Renderer owns walls/corridors, maze shape, fog, animation and visual orientation.

## Maze variability
Entrance, destination and maze presentation should vary between rounds.

Supported presentation/layout goals:
- square/rectangular
- wide/tall
- circular/radial where renderer supports it
- cross/irregular silhouettes
- future thematic shapes/landmarks

Entrance may occur on top/bottom/left/right/corner or a validated interior starting chamber. Exit/destination may likewise vary. Do not hard-code opposite corners.

The maze's visual Euclidean distance is never used as the authoritative measure of progress; graph shortest-path/effective cost is.

## Fog of war
At start, only the player's start area and configured immediate surroundings are visible. Undiscovered maze remains absent/obscured by Agon fog treatment.

After each resolved step:
- reveal the destination node/corridor and configured local visibility radius
- preserve previously discovered areas
- do not reveal future correct/incorrect branches unnecessarily
- in head-to-head projector, each player's discovered maze can be shown side-by-side while undiscovered portions remain hidden

Player Controller receives only its own authorized maze/question information. Projector receives only public discovered state.

## Path consequence types
### Direct / Efficient path
Typical correct-answer transition that preserves or improves expected route efficiency according to generated graph.

### Detour
Moves forward through a longer route than the efficient branch.

### Backtrack
Moves to a previously valid earlier/worse position.

### Loop
Routes through additional nodes before reconnecting to a useful path. Loops must not become infinite/unescapable.

### Missed Shortcut
Player continues on a valid route but fails to receive a shorter branch that a correct answer would have provided.

### Dead End
Player enters a branch requiring one or more additional questions/transitions to recover. Dead end must always have a validated escape.

### Displacement
An incorrect answer may transport the player to a different valid node elsewhere in their maze. Visually, token may disappear into fog and reappear in another revealed/local area.

**Hard invariant: wrong-answer Displacement must never move a player closer to the finish.**

Eligibility is calculated using authoritative graph cost, not visual distance.

If current node has shortest/effective remaining cost `C`, a wrong-answer displacement destination must satisfy:
```text
remainingCost(destination) > C
```
not `>= C`.

Additionally destination must:
- retain at least one valid route to goal
- not be the goal
- not bypass a required game-state gate
- not create an unintended shortcut with lower effective cost
- meet configured difficulty penalty bounds
- be selected from a server-validated candidate set

If no valid displacement candidate exists, fall back to another valid wrong-answer consequence; never violate the invariant.

Suggested use:
- Easy: none
- Medium: normally none or very rare only if explicitly configured
- Hard: occasional controlled displacement with modest penalty
- Expert: may use more frequently/larger penalty range

Random selection is authoritative and seeded/reproducible for persistence/replay.

## Consequence budget and head-to-head fairness
Players may have visually different mazes, but generated mazes must be comparable.

Generation/validation should measure at minimum:
- optimal question/step count
- expected remaining graph cost by stage
- count/severity distribution of wrong-answer consequences
- available recovery paths
- displacement penalty ranges
- loop/dead-end penalties
- question difficulty distribution (shared questions inherently equalize content)

For a shared question, Player A and Player B need not receive visually identical wrong consequences, but generated consequences should fall within equivalent configured penalty bands.

Do not accept a head-to-head maze pair merely because both are solvable. Pair validation must establish comparable optimal path and consequence budgets within configured tolerance.

## Guaranteed completion
From every reachable gameplay node:
- goal must remain reachable
- no transition may permanently trap a player
- loops have bounded escape
- dead ends have recovery
- displacement candidates are validated

A wrong answer can increase expected/shortest remaining cost but cannot make completion impossible.

Generation runs graph validation before a round becomes playable. Invalid generated mazes are discarded/regenerated rather than repaired client-side.

## Maze length profiles
Support configurable profiles independent of question difficulty, e.g.:
- **Compact:** ~8–10 optimal questions
- **Standard:** ~12–15 optimal questions
- **Long:** ~16–20 optimal questions

Exact ranges should be playtested/configurable. This allows an Easy Long maze or Hard Compact maze without conflating knowledge difficulty and game duration.

## Timer behavior
Use shared Agon Timer System.

Head-to-head:
- both players receive same authoritative question deadline
- early answer locks but does not grant movement/time advantage
- locked player waits for opponent or timeout
- timeout is evaluated according to configured rule, defaulting to incorrect outcome
- both paths resolve simultaneously

Solo:
- timer may be disabled
- if enabled, timeout follows configured rule

Do not use browser-local timers as authority.

## Projector UX
### Solo
- large maze view
- token/start/destination where destination visibility is configured
- discovered path + fog
- question presentation may be projector-visible if solo player is using controller to answer
- par/score/time indicators according to mode

### Head-to-head
- side-by-side or adaptive split maze presentation
- shared question shown centrally or in balanced layout
- Player 1/Player 2 maze status
- answer status only: `Thinking` / `Locked` / `Timed out`; never answer content
- after both resolve, simultaneous token/path animation
- common thematic destination may be visually centered/shared while mazes remain independent authoritative graphs

Support 4:3, 16:10, 16:9 projector and Full/Reduced/Off motion.

## Player Controller UX
For each player:
- shared question content
- own answer controls only
- multiple-choice buttons or typed field according to question
- authoritative timer
- lock/submit state
- no opponent answer content
- optional compact view of own discovered maze/progress where screen permits

Typed input should be phone-keyboard efficient. Submission cannot be changed after lock unless Host invokes an audited recovery action.

## Host / Host Remote
Host supports:
- choose mode, difficulty, maze length/theme/options
- start/pause/resume shared question timer
- authorized answer adjudication/review for typed ambiguity
- recover/replay a synchronized step when required
- inspect generation validation diagnostics where appropriate
- end round/reveal Path Review
- advance Path Review items

Normal Host Remote should not expose private answer content before needed adjudication. Tablet may show richer side-by-side state; phone remains action-first.

## Path Review — required end-of-round phase
Path Review is mandatory in Solo and Head-to-Head.

Sequence:
1. finish/result presentation
2. lift fog / reveal complete relevant maze graph
3. show actual traveled path versus efficient/optimal path
4. summarize route statistics
5. review wrong questions in journey order
6. for each wrong answer, show player's answer, correct answer, Scripture reference/explanation, and actual path consequence
7. optionally replay/highlight the branch not taken and where routes rejoined
8. final results/continue

Example review item:
```text
Question 8 — Incorrect
Who succeeded Moses as leader of Israel?
Your answer: Caleb
Correct answer: Joshua
Reference: Joshua 1:1–2
Consequence: Detour
Effect: +3 effective steps
```

Displacement review should explicitly show before/after graph cost, e.g. `7 minimum steps remaining → 10 minimum steps remaining (+3)`.

### Review statistics
Solo:
- optimal/par path question count
- actual questions answered
- correct/wrong/timeout counts
- extra effective steps/questions caused by wrong outcomes
- missed shortcuts
- detours/backtracks/loops/dead ends/displacements

Head-to-head:
- same per-player statistics side-by-side
- shared-question comparison may show P1/P2 correctness only after race
- explain major divergence points

Path Review should teach, not merely identify failure. Use existing question explanations/references where available.

## Scoring/results
Primary Head-to-Head result is destination finish outcome under synchronized-step fairness rules.

Solo should emphasize efficiency rather than requiring competition. Possible result metrics:
- par/optimal path vs actual path
- accuracy
- effective penalty steps
- time only when timed mode enabled

Do not require a numeric score for Solo Journey if existing Agon session UX can present completion/efficiency metrics instead.

## Question selection
Shared question sequence in head-to-head must:
- be identical for both players
- satisfy configured difficulty/input-mode distribution
- avoid repeats within session according to existing Challenge Engine conventions
- provide enough questions for detours/extended paths; dynamically draw additional shared questions as needed

Even when players are at different maze depths, both answer the next global shared question. This preserves synchronization and content fairness.

Solo uses the same question-selection service without the second participant.

## Typed answer validation
Reuse canonical answer/alias services where practical rather than inventing a Wayfinder-only fuzzy matcher.

States:
- VALID/CORRECT
- INVALID/INCORRECT
- NEEDS_HOST_REVIEW when ambiguity cannot safely resolve automatically

For head-to-head, Host Review must avoid leaking one player's typed answer to the other. If adjudication would stall live play, support a host action with private review surface. Persistence must remember adjudication so replay/reconnect cannot change the route result.

## Computer Player follow-on
Optional Player-vs-Computer mode uses Computer Player Framework.
- computer receives same shared question as human
- simulated knowledge determines answer correctness/response, not direct answer-key cheating
- computer gets its own equivalent maze
- computer cannot inspect human private answer
- synchronized step semantics remain

Solo mode means computer support is not required merely to make Wayfinder playable by one person.

## Accessibility
- maze has logical node/path representation independent of visual geometry
- discovered state and current position available textually
- multiple choice and typed controls keyboard/touch accessible
- fog/color not sole state cue
- movement animations support Full/Reduced/Off motion
- Path Review has textual consequence explanations
- screen readers are not flooded with undiscovered maze geometry
- timeout/lock state announced

## Persistence/recovery
Persist authoritative:
- maze seed/version/layout graph for each player
- entrance/goal
- current node
- discovered nodes/edges
- traveled route
- synchronized question index/IDs
- private submissions/adjudication
- transition outcomes
- RNG state for displacement/maze generation
- timer state
- finish state
- Path Review data or sufficient event log to reproduce it

Reconnect must not regenerate maze, reroll displacement, reveal opponent answer, change route, or grant extra timer time.

## Admin/configuration
Host/Admin configuration should support:
- Solo Journey / Solo Challenge / Head-to-Head availability
- difficulty
- maze length profile
- maze presentation/theme pool
- entrance/exit randomization rules
- timer profile
- question category/pool
- input-mode distribution by difficulty
- correctness-visibility policy
- wrong-consequence mix/weights by difficulty
- displacement enabled/weight/penalty bounds
- Path Review detail level

Developer/Admin validation should expose generation diagnostics: optimal path length, reachable-node validation, consequence distribution, displacement candidate validation and head-to-head fairness metrics.

## Dependencies
Reuse rather than duplicate:
- existing Challenge/question infrastructure
- Agon Timer System #156–#159
- Player Controller/private projection infrastructure
- Host Remote shared command/projection architecture
- Agon responsive UI/UX foundations
- participant/team/session conventions
- reusable canonical answer/alias normalization from Multitude when available
- Computer Player Framework #160–#166 only for optional Player-vs-Computer

Wayfinder does not require the Agon 52-card deck, Unveiled, or Multitude gameplay engine.

## Test plan
### Graph/generation
- every reachable node reaches goal
- Compact/Standard/Long optimal path ranges
- varied entrance/exit and presentation orientation
- loops bounded; dead ends recoverable
- correct/incorrect transition legality
- head-to-head pair fairness tolerance
- generated invalid graph rejected/regenerated

### Displacement invariant
For every incorrect displacement candidate:
- destination != goal
- goal reachable from destination
- `remainingCost(destination) > remainingCost(origin)`
- no hidden shortcut makes effective cost lower
- candidate within difficulty penalty bounds
- no candidate → deterministic valid fallback, never closer/equal displacement
- seeded replay chooses same destination

### Synchronized head-to-head
- same question delivered to both
- answers private
- early lock grants no movement advantage
- both resolve together
- timeout behavior
- both reaching goal same step invokes deterministic tie rule
- one player's detour does not desynchronize question identity

### Difficulty/input
- Easy multiple choice
- Medium multiple choice profile
- Hard configured MC/typed mix
- Expert typed profile
- typed aliases/spelling/Host Review

### Fog/privacy
- undiscovered maze absent/appropriately projected
- opponent private answer absent from Player/projector/DOM/ARIA
- only discovered maze state becomes public
- reconnect/reassignment no stale answer leakage

### Path Review
- every wrong/timeout outcome appears exactly once
- correct answer/reference/explanation matches source question
- actual consequence and effective penalty match event log
- displacement before/after cost correct
- optimal vs actual route reproducible
- head-to-head divergence comparison accurate

### Responsive/E2E
- Solo Journey untimed
- Solo Challenge timed
- Head-to-Head
- phone portrait/landscape controllers
- tablet Host Remote
- 4:3/16:10/16:9 projector
- Full/Reduced/Off motion
- reconnect during question, resolution, displacement, finish and Path Review

## Initial release boundary
Required:
- Solo Journey, Solo Challenge and Head-to-Head
- synchronized shared questions for head-to-head
- private answers
- Easy/Medium MC, Hard mixed, Expert typed profiles
- graph-first validated mazes with variable entrance/exit/presentation
- fog of war
- direct/detour/backtrack/loop/missed-shortcut/dead-end/displacement consequence support
- strict displacement-never-closer invariant
- fair paired maze validation
- shared Timer integration
- Projector, Player Controller and Host support
- required Path Review with Scripture/explanations and route consequence analysis
- persistence/privacy/accessibility/recovery tests

Optional follow-on:
- Player vs Computer
- advanced thematic maze silhouettes/landmarks
- additional maze renderers

## Definition of done
- a single player can complete Wayfinder without any opponent
- two players can play synchronized head-to-head using the same private question each step
- both players move only after shared-step resolution, not based on answer speed
- mazes differ visually but satisfy fairness/consequence-budget validation
- wrong answers alter route without preventing eventual completion
- incorrect Displacement can never move a player closer or equal to the goal by authoritative remaining-cost metric
- fog reveals only discovered navigation state
- difficulty controls answer format as specified
- race does not leak opponent answers
- Path Review explains every wrong answer and how it changed the journey
- responsive/accessibility/privacy/recovery test suites pass
