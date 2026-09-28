# Board Game Composition Guide

## Purpose
Use `board.play` when a game needs reusable logical board topology, token movement, turn/phase flow, node/space resolution and finish rules. Do not use it merely because a Stage screen visually resembles a board.

## Composition rule
Board Play is an orchestrator. Delegate domain mechanics:

- questions/answers -> Challenge Engine;
- dice/spinner/lots -> Randomizer capability;
- decks/hands/draw/discard -> Card & Deck capability;
- score -> Score Ledger;
- timer -> Timer capability;
- buzzer -> Buzzer/participation capability;
- persistence -> Session/Persistence infrastructure.

A board definition connects these capabilities through semantic actions.

## Board shape and space geometry
Board Play does not assume a rectangular board or square spaces.

A board may visually be a rectangle, circle, star/Chinese-checkers-style board, cross, map silhouette, winding path or arbitrary illustrated shape. Individual spaces may be circles, squares, rectangles, triangles, hexagons, arbitrary polygons, image-defined regions or custom renderer shapes, and shapes may be mixed on the same board.

For ordinary LINEAR/CIRCULAR/BRANCHING/GRAPH/TRACK games, geometry is presentation and rules use stable node/edge IDs. For games where geometry itself matters, use the SPATIAL topology profile with SQUARE_GRID, HEX_GRID, TRIANGULAR_GRID, CUSTOM_LATTICE or FREEFORM_COORDINATE spatial models.

SPATIAL boards may use reusable queries for adjacency, direction, distance, alignment/lines, jumps and region/territory membership. For example, a Chinese-checkers-style star can be represented by nodes arranged on a custom/triangular lattice or explicit graph; the star artwork does not determine legal moves. A game's jump-chain or capture rules remain game-specific rules built on generic spatial queries.

Do not infer gameplay solely from shape. A hexagon is just a rendered node unless the game definition explicitly uses its coordinate/lattice/region semantics.

## When to use Board Play
Good fits:
- roll/spin-and-move games;
- challenge-space games;
- card-draw board games;
- linear/circular/branching path games;
- map/node games where turns move tokens among stable nodes;
- hex/triangular/spatial lattice games;
- territory or alignment games that can reuse generic spatial queries;
- downloadable board packs that should be mostly definitions/content/assets.

Do not force these into Board Play when their primary mechanic is better owned elsewhere:
- Gauntlet: stage orchestrator;
- Exodus: Journey/Campaign progression;
- Joust: simultaneous exchange/impact;
- Unveiled: reveal board;
- Race: specialized pace/stamina/race semantics;
- Wayfinder: specialized fog/maze semantics.

Those games may reuse Board Graph/Movement/Spatial interfaces where helpful without changing architectural ownership.

## GameDefinition metadata
Board-based games should declare:
- `catalogRole`;
- `implementationShape: BOARD_COMPOSITE` or equivalent;
- `boardCapability: board.play@1`;
- required child capabilities;
- topology profile;
- spatial subtype where applicable;
- board outline/presentation reference;
- node geometry/shape metadata where applicable;
- participation/turn modes;
- challenge profiles;
- card/deck dependencies;
- randomizer dependencies;
- finish and standings policy;
- pack/content dependencies.

## Space design
Prefer capability/action bindings over unique space subclasses. A themed `Well of Provision` space may simply be a DRAW_CARD action plus artwork/text. A `Scripture Trial` space may invoke a Challenge profile. Create new executable behavior only when it cannot be expressed safely through existing semantic actions.

Space shape is independent of action. A triangle, hexagon and circle can all invoke the same Challenge profile; conversely two identical-looking spaces can have different actions when the definition says so.

## Movement source versus movement rule
Keep these separate. Dice, spinner, cards and challenge performance can all produce movement values/events. Board Play decides how that result maps onto the legal board topology. This prevents every board game from writing its own dice-and-move implementation.

For SPATIAL games, movement rules may additionally ask Board Play for legal neighbors, rays/directions, distances, jump landings or region relationships. The specialized game still decides what those queries mean to its rules.

## Board position versus score
Do not assume the first token to the end is always the winner. Game definitions explicitly choose standings policy. Agon can support a shared/progression board where final standings come from cumulative Score Ledger points.

## Pack optimization
A board pack should be primarily:
`definition + board layout/art + optional spatial/lattice data + content + card definitions + rules/help + dependency manifest`.

Shared executable capability code belongs in Core/capability modules. This allows many board games/themes to ship without duplicating Dice, Spinner, Card, Challenge, movement or spatial infrastructure.

## Refactoring existing/planned games
During migration, evaluate each game separately for:
1. Board Play ownership;
2. reuse of Board Graph/Movement/Spatial only;
3. no Board Play dependency.

Do not refactor solely to maximize reuse. Preserve specialized semantics where they materially define the game.

## Testing checklist
Every board-game definition should test topology validity, reachable finish/required nodes, legal branch paths, action dependency readiness, movement boundaries, turn lifecycle, save/resume, deterministic randomizer references, 1–4 participant authority, controller projections, reduced-motion presentation and missing-pack/capability failures.

SPATIAL definitions additionally test lattice validity, adjacency, legal directions, distance semantics, jumps/landing queries, region membership, mixed space shapes, arbitrary board outline rendering and accessible semantic equivalents for any rule-relevant geometry.