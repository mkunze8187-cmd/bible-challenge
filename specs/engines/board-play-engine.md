# Board Play Engine Specification

**Status:** Proposed
**Capability:** `board.play` v1
**Role:** Higher-order gameplay orchestrator

## Purpose
Provide reusable board-game structure, turns, tokens, movement, spaces/nodes, path topology, spatial geometry, action resolution and finish conditions while delegating specialized mechanics to existing Agon capabilities.

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
- `TRACK` — lane/position-oriented topology suitable for race-like presentation;
- `SPATIAL` — geometry-aware board where adjacency/direction/distance may be derived from a lattice or coordinate model.

Spatial subtypes:
- `SQUARE_GRID`;
- `HEX_GRID`;
- `TRIANGULAR_GRID`;
- `CUSTOM_LATTICE`;
- `FREEFORM_COORDINATE`.

The logical model always uses stable node and edge IDs. Most visual geometry is presentation metadata, but SPATIAL boards may explicitly opt into rule-relevant geometry for adjacency, direction, distance, lines, jumps, regions or territories.

The overall board outline is unrestricted: rectangle, circle, star/Chinese-checkers-style, cross, map silhouette, winding illustrated path, irregular polygon or other artwork/layout. Board outline never implies rules unless a spatial rule explicitly references geometry/regions.

```ts
interface BoardDefinition {
  boardId: string;
  topology: BoardTopology;
  spatialModel?: BoardSpatialModel;
  outline?: BoardOutlinePresentation;
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
  geometry?: BoardNodeGeometry;
  presentation?: BoardNodePresentation;
}

interface BoardNodeGeometry {
  coordinate?: BoardCoordinate;
  shape?: 'CIRCLE' | 'SQUARE' | 'RECTANGLE' | 'TRIANGLE' | 'HEXAGON' | 'POLYGON' | 'IMAGE_REGION' | 'CUSTOM';
  polygonPoints?: BoardPoint[];
  orientationDegrees?: number;
  size?: BoardSize;
  regionId?: string;
}

interface BoardEdgeDefinition {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  cost?: number;
  direction?: string;
  conditions?: ConditionExpression[];
}
```

### Spatial geometry rules
For non-SPATIAL boards, geometry MUST NOT be required to determine legal moves. For SPATIAL boards, a definition may use geometry/lattice rules to generate or validate edges and relations.

Supported spatial concepts should include:
- neighbor/adjacency queries;
- direction/ray queries;
- distance where the selected lattice defines it;
- line/alignment detection;
- jump-over-node to landing-node queries;
- region/territory membership;
- coordinate-to-node lookup;
- generated edges from a lattice with optional explicit overrides.

A Chinese-checkers-style star board is represented as nodes arranged on an appropriate custom/triangular lattice or explicit graph. The star outline is presentation; legal adjacency and jumps come from the graph/lattice. The engine does not hard-code Chinese checkers rules.

Space shapes may vary within one board. A single board can mix circles, triangles, hexagons, polygons and image regions. Shape does not determine behavior unless a game explicitly binds shape/tag/region to a rule.

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
- move to adjacent spatial node;
- move/jump along a legal spatial direction;
- swap positions where game policy permits;
- remain in place;
- finish/lap transition.

Movement source is independent from movement resolution. Sources may include Dice, Spinner, Card, Challenge result, fixed rule or game-specific adapter.

Board Play validates the resulting move against topology/spatial rules.

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

Spatial boards may additionally query neighboring occupancy, intervening occupancy for jumps, regions and lines. Capture, blocking, stealing, trading, jump chains or territory scoring are not universal Board rules; they are optional bounded game adapters or specialized capabilities built on Board Play spatial queries.

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
- topology/spatial/content revision;
- token positions/status/laps;
- current turn/phase/participant;
- pending action resolution;
- child capability references/results needed for recovery;
- turn modifiers (skip/extra turn etc.);
- selected branches;
- finish state.

Randomizer results must be reproducible/auditable under the existing deterministic RNG policy. Resume must never redraw/re-roll a committed action.

## Stage / controller contract
Stage receives a public board projection: topology/presentation reference, spatial layout when relevant, token positions, current turn/phase, public card/randomizer/challenge results, and legal public state.

Controllers receive participant-authorized actions: roll/spin request, choose branch/node/direction, answer challenge, card choices, end/confirm turn, etc. Board definitions do not address UI elements directly.

Renderers must support arbitrary board outlines and mixed node shapes without changing game logic. Hit testing/accessibility must use stable semantic node identity rather than relying on pixel color or artwork alone.

## Accessibility
- logical board state must be understandable without relying solely on geometry/color/shape;
- expose node names/types, coordinates/regions where meaningful, neighbors/legal moves and token positions semantically;
- reduced-motion mode jumps/shortens movement animation while preserving state;
- randomizer animation is presentation only;
- keyboard/controller equivalents for drag/drop/path/node selection;
- no gameplay rule may require perception of color or shape alone; if shape is rule-relevant, provide a semantic/text equivalent.

## Packaging
A board-game pack should normally contain:
- BoardDefinition and GameDefinition;
- board artwork/layout/presentation metadata;
- spatial/lattice definition where required;
- content profiles;
- card definitions/content where applicable;
- rules/help;
- capability dependency manifest;
- only genuinely novel game adapter code.

It must not package duplicate Challenge/Card/Randomizer/Score implementations.

## Candidate consumers
- future traditional Bible board games;
- star, hex, triangular, map, territory and other spatial board games;
- The Pilgrim's Way where a literal board/path presentation is selected;
- Running the Race for shared movement primitives where compatible (without forcing Race Engine into Board Play);
- Wayfinder for graph/path/spatial primitives where compatible (maze/fog rules remain Wayfinder-specific);
- Walls of Jerusalem/Blockbusters for selected graph/spatial/occupancy primitives where compatible;
- kids path/collection games;
- downloadable themed board packs.

Reuse should be by capability/interface; existing specialized games are not required to become generic board games if doing so harms their rules.

## Conformance tests
- all v1 topology profiles including SPATIAL;
- square, hexagonal, triangular and custom lattice fixtures;
- arbitrary/star-shaped overall board layout;
- mixed circle/triangle/hexagon/polygon/image-region spaces;
- spatial adjacency/direction/distance/line queries;
- jump query with occupied intervening node and valid landing;
- explicit graph versus lattice-generated edge equivalence;
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