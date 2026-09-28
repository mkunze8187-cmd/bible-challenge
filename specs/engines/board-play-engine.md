# Board Play Engine Specification

**Status:** Proposed
**Capability:** `board.play` v1
**Role:** Higher-order gameplay orchestrator

## Purpose
Provide reusable board-game structure, turns, tokens, movement, spaces/nodes, path topology, action resolution and finish conditions while delegating specialized mechanics to existing Agon capabilities.

`board.play` MUST NOT reimplement Dice/Spinner/Casting Lots, Card/Deck, Challenge, Score, Timer, Buzzer, Input or Persistence capabilities.

## Architectural boundary

```text
GameDefinition / Board Pack
          |
      board.play
   /      |       \
Board   Turn     Movement
Graph   Flow      Rules
   \      |       /
     Space Actions
          |
  +-------+--------+---------+---------+
  |       |        |         |         |
Challenge Card  Randomizer  Score   Game-specific
 Engine   Deck  Dice/Spinner Ledger   adapters
```

Board Play owns orchestration and logical board state. Child capabilities own their domain state and authoritative operations.

## Board topology
Support these v1 topology profiles:
- `LINEAR` — ordered start-to-finish path;
- `CIRCULAR` — repeating path/laps;
- `BRANCHING` — player chooses among valid outgoing edges;
- `GRAPH` — arbitrary node/edge network or map;
- `TRACK` — lane/position-oriented topology suitable for race-like presentation.

The logical model uses stable node and edge IDs; visual geometry is renderer/presentation data and must not be required for rules.

```ts
interface BoardDefinition {
  boardId: string;
  topology: BoardTopology;
  nodes: BoardNodeDefinition[];
  edges: BoardEdgeDefinition[];
  startNodeIds: string[];
  turnPolicyId: string;
  movementPolicyId: string;
  finishPolicyId: string;
}

interface BoardNodeDefinition {
  nodeId: string;
  tags?: string[];
  actions?: BoardActionBinding[];
  presentation?: BoardNodePresentation;
}

interface BoardEdgeDefinition {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  cost?: number;
  conditions?: ConditionExpression[];
}
```

## Pieces / tokens
A board session may have participant/team tokens and game-owned tokens/markers.

```ts
interface BoardTokenState {
  tokenId: string;
  ownerId?: string;
  nodeId: string;
  lap?: number;
  status: 'ACTIVE' | 'FINISHED' | 'INACTIVE';
}
```

Token movement is authoritative session state. Animation follows logical movement and cannot become the source of truth.

## Turn / phase flow
Turn order and turn phases are declarative. `ROLL -> MOVE -> RESOLVE -> END` is one profile, not a hard-coded assumption.

Examples:
- roll/spin -> move -> resolve node -> end;
- challenge -> if successful roll/spin -> move -> resolve;
- draw card -> resolve -> move;
- simultaneous challenge -> movement awards -> resolve landings;
- choose path -> move -> resolve.

```ts
interface BoardTurnPolicy {
  phases: BoardTurnPhase[];
  orderPolicy: 'ROUND_ROBIN' | 'SIMULTANEOUS' | 'CUSTOM';
}
```

Game definitions may add bounded custom phases through Engine SDK adapters; they must not fork Board Play.

## Movement
Movement is expressed as semantic operations, for example:
- advance N movement units;
- move to node;
- follow selected valid edge;
- move backward where topology permits;
- move to tagged next/previous node;
- swap positions where game policy permits;
- remain in place;
- finish/lap transition.

Movement source is independent from movement resolution. Sources may include Dice, Spinner, Card, Challenge result, fixed rule or game-specific adapter.

Board Play validates the resulting move against topology/rules.

## Space/node actions
Nodes do not hard-code every game behavior. A node contains ordered action bindings invoking registered capabilities/actions.

Standard bindings include:
- `START_CHALLENGE`
- `DRAW_CARD`
- `RUN_RANDOMIZER`
- `MOVE`
- `AWARD_SCORE`
- `SKIP_NEXT_TURN`
- `GRANT_EXTRA_TURN`
- `CHOOSE_BRANCH`
- `CHECKPOINT`
- `FINISH_CHECK`
- bounded game-defined action adapter.

Example:
```yaml
nodeId: challenge-17
actions:
  - action: START_CHALLENGE
    profileId: mixed-scripture-medium
  - action: MOVE
    when: challenge.correct
    delta: 2
```

## Challenge spaces
Challenge nodes request a compatible challenge profile/provider rather than embedding a question implementation. A profile can allow Missing Word, Who Said It?, Verse Scramble, Reference Rush, Progressive Clue, Timeline, Classification, Match, etc.

Board Play receives normalized challenge outcome events and applies configured board consequences. It never evaluates Scripture answers itself.

## Cards / decks
Board actions reference Card/Deck capability by deck ID and semantic operations such as DRAW, DISCARD, PLAY or RESOLVE_CARD_ACTION. Deck ownership/privacy remains Card Engine responsibility.

Cards may trigger bounded Board actions but must use the same authoritative command/action pipeline as normal board rules.

## Randomizers
Movement/event randomization references the generic Randomizer capability. Supported configured sources may include dice, spinner/wheel, casting lots or custom-faced randomizers. Board Play stores the authoritative result reference required for replay but does not implement RNG.

## Branches and choices
When more than one legal outgoing path exists, Board Play emits a semantic `CHOOSE_PATH`/selection request to the appropriate participant/controller. Stage may display public choices; private choices remain controller-scoped until policy reveals them.

## Occupancy / interaction
V1 supports configurable occupancy policy:
- multiple tokens may share a node;
- exclusive occupancy;
- landing interaction callback;
- pass-through allowed/blocked.

Capture, blocking, stealing or trading are not universal Board rules; they are optional bounded game adapters or specialized capabilities.

## Finish / win conditions
Board completion and game winner are separate concepts. Finish policies may include:
- first token reaches finish;
- all participants reach finish;
- N laps completed;
- target node/checkpoint reached;
- board ends after round/turn count;
- external game condition.

Winner/standings can be based on finish order, Score Ledger points, objectives, or a game-specific policy. This permits Agon games where board position is presentation/progression while cumulative points determine final standings.

## Multiplayer
Support 1–4 participants/teams. Turn-based and compatible simultaneous phases are supported. Shared/Hosted authority owns turn, movement and node-resolution state. Clients submit semantic InputActions only.

## Persistence / deterministic replay
Persist:
- board definition/version;
- topology/content revision;
- token positions/status/laps;
- current turn/phase/participant;
- pending action resolution;
- child capability references/results needed for recovery;
- turn modifiers (skip/extra turn etc.);
- selected branches;
- finish state.

Randomizer results must be reproducible/auditable under the existing deterministic RNG policy. Resume must never redraw/re-roll a committed action.

## Stage / controller contract
Stage receives a public board projection: topology presentation reference, token positions, current turn/phase, public card/randomizer/challenge results, and legal public state.

Controllers receive participant-authorized actions: roll/spin request, choose branch, answer challenge, card choices, end/confirm turn, etc. Board definitions do not address UI elements directly.

## Accessibility
- logical board state must be understandable without relying solely on geometry/color;
- expose node names/types and token positions semantically;
- reduced-motion mode jumps/shortens movement animation while preserving state;
- randomizer animation is presentation only;
- keyboard/controller equivalents for drag/drop/path selection;
- no gameplay rule may require perception of color alone.

## Packaging
A board-game pack should normally contain:
- BoardDefinition and GameDefinition;
- board artwork/layout/presentation metadata;
- content profiles;
- card definitions/content where applicable;
- rules/help;
- capability dependency manifest;
- only genuinely novel game adapter code.

It must not package duplicate Challenge/Card/Randomizer/Score implementations.

## Candidate consumers
- future traditional Bible board games;
- The Pilgrim's Way where a literal board/path presentation is selected;
- Running the Race for shared movement primitives where compatible (without forcing Race Engine into Board Play);
- Wayfinder for graph/path primitives where compatible (maze/fog rules remain Wayfinder-specific);
- Walls of Jerusalem/Blockbusters for selected graph/occupancy primitives where compatible;
- kids path/collection games;
- downloadable themed board packs.

Reuse should be by capability/interface; existing specialized games are not required to become generic board games if doing so harms their rules.

## Conformance tests
- all v1 topology profiles;
- roll/spin/card/challenge/fixed movement sources;
- turn policy variations;
- node action ordering;
- branch validation;
- occupancy policies;
- extra/skip turn lifecycle;
- challenge outcome -> movement without answer evaluation in Board Play;
- card action -> Board command without authority bypass;
- 1–4 participant/team turn authority;
- save/resume mid-turn and mid-action;
- no reroll/redraw after resume;
- Local/Shared adapter parity;
- accessible semantic board projection;
- pack dependency validation and missing-capability readiness failure.