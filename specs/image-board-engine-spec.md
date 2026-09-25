# Agon Image Board Engine Spec

## 1. Purpose

Agon has no way to use an image as a game board today. The only image-board design is Bible Map Challenge (`enhancement-spec-tournament-daily-host-map.md` §4, #23), which places point pins over one static map with normalized `x`/`y` coordinates.

Many planned games need more than pins on a map:

- tappable **areas** of an illustration (a person in a crowd, an animal in a herd)
- **hidden items** revealed by searching (flashlight, sweeping)
- **drop zones** that items are dragged into (baskets, tabernacle placement, soil types)
- **paths and routes** through a scene or map (journeys, a way home)
- **layers** that appear as the game progresses (creation days, a scroll opening)

The Image Board engine is one reusable, game-agnostic surface for all of these: an authored image plus authored regions, each region given a role, rendered on projector, Host Remote, and Player Controller, with answer privacy enforced by the existing `toPhoneView()` projection. Bible Map Challenge becomes its first consumer instead of carrying its own pin renderer.

Agon's goals apply: every board exists to teach scripture. Regions carry Scripture references and teaching notes, so the reveal step always points back to the text.

## 2. Consumers

| Consumer | Issue | Image Board features used |
|---|---|---|
| Bible Map Challenge | #23 | point/area targets (Locate), path (Route), drop zones (Region Sort), multiple maps, zoom/pan |
| Paths of Paul | #226 | map, route nodes, progress marker |
| Exodus | #229 | map/journey board, route nodes, layers |
| Crossroads | #215 | shared map with branching path nodes |
| Open the Scroll | #231 | layered reveal masks |
| Build the Temple | #224 | drop zones / placement (optional) |
| Kids: Let There Be… | #236 | layers revealed per day |
| Kids: Lost & Found | #239 | hidden items, search mask, path |
| Kids: Share the Lunch | #240 | draggable items, drop zones, counters |
| Kids: Two by Two | #243 | area targets in a scene |
| Kids: Tabernacle Blueprint | #249 | drop zones with placement tolerance, private blueprint |
| Kids: Sower's Field | #250 | drop zones (soil types), per-region state |
| Kids: Gideon's 300 | #253 | timed area targets |
| Kids: Who's in the Story? | #254 | area targets in a crowd scene |

Unveiled (#172) keeps its card-grid model; it may use the Image Board asset pipeline (§6) for image clues but does not need regions.

Wayfinder (#181–#186) stays a generated graph maze and is out of scope.

## 3. Non-goals

- No freehand drawing by players, and no scoring from pixel-perfect tracing.
- No physics engine or continuous-motion gameplay. Motion is presentation only.
- No arbitrary HTML/SVG from content. Region shapes are data, rendered by Agon code.
- No network image loading. All images are local (built-in pack or imported custom pack).
- No betting/gambling presentation.

## 4. Concepts

- **Board:** one image (the base layer) plus optional overlay layers, a set of regions, and optional paths. Authored once, reused across rounds.
- **Region:** an authored shape on the board, in normalized coordinates, with a role.
- **Role:** what a region does in play: `target`, `drop-zone`, `hidden`, `path-node`, `label`, or `decor`.
- **Piece:** a movable item (image or token) that players drag or place into drop zones.
- **Layer:** an image that can be shown, hidden, or faded over the base (e.g., "Day 3: land and plants").
- **Mask:** a board-wide overlay that hides the scene except where revealed (flashlight, sweep, scroll).
- **Board round:** a game's round references a board plus round-specific answers (which regions are correct, which pieces exist, which layers start visible).

The board describes *what exists on the image*. The round describes *what the question is*. This split keeps one authored board reusable across many rounds and games.

## 5. Data model

All coordinates are normalized to the board image: `0..1` in both axes, origin at top-left. Circle radii use the image's shorter side as the unit so circles stay round at any aspect ratio.

```ts
export type NormPoint = { x: number; y: number };         // 0..1

export type RegionShape =
  | { kind: "point"; at: NormPoint; hitRadius: number }    // hitRadius: fraction of shorter side
  | { kind: "circle"; center: NormPoint; radius: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number }
  | { kind: "polygon"; points: NormPoint[] };              // 3..64 points, simple (non-self-intersecting)

export type RegionRole = "target" | "drop-zone" | "hidden" | "path-node" | "label" | "decor";

export interface BoardRegion {
  id: string;                    // stable, unique within the board
  name: string;                  // "Zacchaeus", "Tarshish", "Good soil"
  aliases?: string[];
  role: RegionRole;
  shape: RegionShape;
  tags?: string[];               // "region:galilee", "soil:rocky", "day:3"
  scriptureReference?: string;   // shown on reveal
  teachingNote?: string;         // shown on reveal, never before
  labelAnchor?: NormPoint;       // where the name/label renders; defaults to shape centroid
  capacity?: number;             // drop-zone only: max pieces
}

export interface BoardLayer {
  id: string;
  name: string;
  asset: AssetRef;
  initiallyVisible: boolean;
}

export interface BoardPath {
  id: string;
  name: string;                  // "Paul's first missionary journey"
  nodeRegionIds: string[];       // ordered; each must be a path-node region
  branches?: Array<{ fromRegionId: string; toRegionIds: string[] }>; // for Crossroads-style choice
  scriptureReference?: string;
}

export interface BoardPiece {
  id: string;
  name: string;
  asset: AssetRef;
  size: number;                  // fraction of shorter side
}

export interface ImageBoard {
  boardId: string;
  title: string;
  base: AssetRef;
  aspectRatio: number;           // width / height of base; validated against the asset
  altText: string;               // accessibility description of the whole scene
  layers?: BoardLayer[];
  regions: BoardRegion[];
  paths?: BoardPath[];
  pieces?: BoardPiece[];
  credit?: string;               // artist / source / license note
  gentleness?: "all-ages" | "ages-6-plus" | "older";   // ties to Kids Mode #234 age tagging
}

export type AssetRef = { packId: string; path: string };  // resolved by the pack loader, never a URL
```

A game's round type references a board by `boardId` and adds round-specific fields. Example (Bible Map Challenge, replacing `BibleMapLocation` `x`/`y`):

```ts
export interface BibleMapRound {
  id: string;
  mode: "locate" | "route" | "region-sort";
  boardId: string;
  title: string;
  prompt: string;
  answerRegionIds: string[];
  distractorRegionIds: string[];
  routePathId?: string;
  regionSortTags?: string[];     // drop-zone tags players sort into
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  teachingNote: string;
}
```

### 5.1 Validation (`npm run check:data` and Admin)

- Every coordinate is within `0..1`; polygons have 3–64 points and do not self-intersect.
- Region ids are unique within a board; every id referenced by a round, path, or branch exists and has the right role.
- `aspectRatio` matches the decoded asset within 1%.
- `target` regions used as answers in the same round do not overlap each other unless the round explicitly allows multiple correct regions.
- `hit-test ambiguity`: warn when a point/area can hit two different answer/distractor regions in the same round.
- Minimum touch size: each tappable region must be at least 44 CSS px on the smallest supported controller layout at default zoom; otherwise warn and require zoom for that round.
- Drop-zone `capacity` ≥ the number of pieces the round expects to land there.
- Hidden regions have a `teachingNote` or `scriptureReference` (the reveal must teach something).
- Assets exist, are PNG/JPEG/WebP, and are within size limits (§6).

## 6. Assets

- **Built-in packs:** images live in the pack folder (`src/data/packs/<packId>/boards/<boardId>/...`) alongside a `board.json`, and the pack manifest lists them in `supportingFiles` (`themed-content-spec.md` §19.4). Until the pack split (#24) lands, built-in boards live under `src/renderer/assets/boards/`.
- **Custom packs:** today a custom pack is a single JSON file. Image boards need binary assets, so custom packs gain an optional archive form (`.agonpack`, a zip containing `pack.json` plus `boards/`). The single-file JSON form stays valid for packs without boards. Import copies assets into the app's user-data folder under the pack id; boards reference them by `AssetRef` only.
- **Licensed packs** load assets through the main process like their content (`content-licensing-spec.md`).
- **Limits:** base image ≤ 4096 px on the long side and ≤ 5 MB; layer/piece images ≤ 2 MB. The admin warns above 2048 px, since controllers download it.
- **Controller delivery:** the LAN server serves board images from a fixed allow-list keyed by asset id (security rule S3: never build a file path from a request URL). Phones receive a downscaled copy (long side ≤ 1600 px) generated once at import or build time.
- **Content safety:** images are reviewed like text content. Admin shows the `gentleness` tag and credit/license fields; imports without a credit are flagged.

## 7. Engine (pure, `src/lib/imageBoard/`)

All board logic is pure TypeScript, deterministic, and `structuredClone`-safe, consistent with `gameEngine.ts`.

```ts
export interface BoardState {
  boardId: string;
  visibleLayerIds: string[];
  revealedRegionIds: string[];            // hidden → revealed
  mask?: { kind: "flashlight" | "sweep" | "scroll"; revealed: NormPoint[][] | number };
  pieceLocations: Record<string, string | null>;  // pieceId → dropZoneRegionId | null (tray)
  markers: Record<string, NormPoint>;     // participant/team markers, e.g. progress on a route
  pathProgress: Record<string, number>;   // pathId → index of current node per team
  selections: Record<string, BoardSelection>; // participantId → pending selection (private until resolved)
}

export type BoardSelection =
  | { kind: "region"; regionId: string }
  | { kind: "point"; at: NormPoint }       // tap-anywhere (Hard Locate)
  | { kind: "placement"; pieceId: string; at: NormPoint };
```

Functions:

- `hitTest(board, point, { roles, tolerance })` → region id or null. Polygon uses point-in-polygon; points use `hitRadius`; ties resolve to the smallest region.
- `distance(board, point, regionId)` → normalized distance to region edge, for Hard Locate tolerance and partial credit.
- `placePiece(state, board, pieceId, point)` → snaps into the drop zone under the point (respecting `capacity`) or returns to tray.
- `revealRegion`, `revealMaskAt(point, radius)`, `setLayerVisible`, `advancePath(teamId, toRegionId)` (validated against path order/branches).
- `gradeSelection(round, board, selection)` → `{ correct, regionId, distance }`, used by each game's grade step so Host Mode's grade/apply-outcome split (#8–#9) is preserved.

The engine never decides scoring. Games translate grade results into points using their own rules.

## 8. Rendering

A single `ImageBoardView` React component renders a board for any surface:

- **Layout:** the image is letterboxed inside the available area at its aspect ratio; regions render in an absolutely positioned SVG overlay using `viewBox="0 0 1 aspectRatio⁻¹"`-style normalized units, so shapes scale exactly with the image.
- **Surfaces:** `projector` (large labels, no hover affordances, safe-area aware per #106), `host` (desktop and Host Remote, shows answers and region outlines when the host enables "show answers"), `controller` (touch-first, per #113), `admin-preview`.
- **Zoom/pan:** pinch and drag on controllers, wheel/drag on desktop, with a "fit" button. Projector zoom is host-driven and mirrored.
- **Motion:** reveals, snaps, and path movement animate using Agon UI motion tokens, with Reduced/Off motion alternatives (#114).
- **Accessibility:** every tappable region is in the tab order with its `name` as its accessible label (only when names aren't the answer; otherwise "Area 1…n"). Keyboard arrows move between regions. `altText` describes the scene. Color is never the only indicator of state.
- **Labels:** difficulty controls whether region names show (Easy), show as unlabeled markers (Medium), or are hidden (Hard).

## 9. Controller interaction and privacy

Extend the `PhoneInteraction` union: the existing `map-select` becomes an alias of a general **`board-select`** interaction with modes:

- `tap-region`: select one region, then **Lock In** (existing Choice Select pattern).
- `tap-point`: tap anywhere; a visible marker shows the pending point; Lock In.
- `drag-piece`: drag pieces from a tray into drop zones; Submit.
- `search`: drag a flashlight/sweep over the scene (Kids Lost & Found).
- `path-step`: choose the next node from the currently legal branches.

Privacy (`toPhoneView()` allow-list):

- Controllers receive the board image, `altText`, and only the regions needed for the interaction, stripped of `teachingNote`, `aliases`, `tags`, and `scriptureReference` until resolution.
- `hidden` regions are **never** sent before they are revealed, not even their shapes; `search` mode sends only a coarse "found" signal from the server after each reveal, and the hit test runs on the desktop.
- When a round's answer is a region, the controller receives all candidate regions (answers and distractors) with identical fields, in shuffled order, with opaque per-round ids so the answer cannot be inferred from ordering or id.
- For Hard Locate (`tap-point`), no region shapes are sent at all.
- Private-board rounds (Tabernacle Blueprint) use `privateOverride` (#49–#51): only the designated player's controller receives the blueprint layer.
- The leak test (#51) is extended: for every board-using game and interaction, serialized controller output contains no answer id, hidden region shape, alias, or teaching note.

Fallback: if a controller can't render the board (capabilities too small, failed load), that participant falls back to Buzz Only and the host operates the board, per `phone-buzzer-spec.md` Fallback.

## 10. Host controls

- Host Remote shows the board with answer outlines (toggle), the current selections from each team as they lock in, and actions: reveal region, reveal all, show/hide layer, undo last placement, move a team marker, accept/override a grade (`Mark Correct`/`Mark Incorrect` from Host Mode).
- The host can zoom the projector to a region and back to fit.
- Every host action goes through the host command dispatcher (#94) and the undo stack (#9).

## 11. Admin: board editor

- Import a base image (and layers/pieces); the editor reads its aspect ratio.
- Draw regions: click for points, drag for circles/rectangles, click-by-click for polygons with vertex drag/insert/delete; snap-to-edge off by default.
- Region inspector: id, name, aliases, role, tags, reference, teaching note, capacity.
- Paths: select path-node regions in order; add branches.
- **Preview modes:** play-test as projector, controller (phone and tablet sizes), and host; heat-map overlay of region overlap; "tap test" that reports which region a tap would hit.
- Validation panel shows every §5.1 error and warning inline with a "jump to region" link.
- Boards are saved in the pack; rounds pick a board from a dropdown and pick answer regions by clicking on the board rather than typing ids. This replaces #23's planned "map-coordinate picker."
- Vendored schemas refresh via `sync-schemas` as usual.

## 12. Persistence and recovery

`BoardState` is part of the game's session state and persists through the Event/Game Session foundation (#190). On reconnect, a controller receives a fresh projection of the current state, never a replay of past messages. Hidden regions already revealed stay revealed; unrevealed stay absent from the payload.

## 13. Performance

- Up to 300 regions per board and 40 pieces per round without dropped frames on the projector at 60 fps.
- Hit testing: bounding-box prefilter, then exact shape test. No per-frame allocation during drag.
- Board images are decoded once and cached per session; controllers cache by asset hash.

## 14. Testing

- **Unit (Vitest):** hit testing for every shape (edges, holes-free polygons, ties), normalization at multiple aspect ratios, placement capacity, path/branch validation, mask reveal, grading distances.
- **Schema/data:** `check:data` runs §5.1 on every built-in board; fixture boards cover each warning.
- **Privacy:** leak test per §9 for every board interaction.
- **E2E (Playwright):** Bible Map Locate round end-to-end on projector + simulated controller; drag-piece round; reconnect mid-round.
- **Visual regression:** fixture board at projector, laptop, tablet, and phone sizes, light and dark.
- **Accessibility:** keyboard-only region selection; screen-reader labels.

## 15. Implementation phases (issues)

1. **Board model, schema, validation, and asset pipeline:** types, JSON schema, `check:data` rules, built-in asset location, custom-pack `.agonpack` archive import, LAN asset allow-list and downscaled controller copies.
2. **Pure engine:** hit testing, distance, placement, reveal/mask, layers, paths/branches, grading, `BoardState` persistence.
3. **`ImageBoardView` renderer:** projector/host/controller/admin surfaces, zoom/pan, labels by difficulty, motion and accessibility.
4. **Controller `board-select` interaction and privacy:** interaction modes, `toPhoneView()` projection, opaque ids, leak test, fallback.
5. **Host controls and Host Remote integration:** reveal/layer/undo/marker/override actions via dispatcher and undo stack.
6. **Admin board editor:** drawing, inspector, paths, preview/tap test, validation panel, round answer picking on the board.
7. **Release gate and Bible Map migration:** port Bible Map Challenge (#23) Locate onto Image Board as the reference consumer; E2E, visual, accessibility, and performance validation.

Phases 1–4 unblock the first consumer. Phases 5–6 can proceed in parallel after phase 3.

## 16. Changes to existing specs and issues

- **Bible Map Challenge (#23, §4 of `enhancement-spec-tournament-daily-host-map.md`):** replace `BibleMapLocation.x/y` and the pin renderer with Image Board regions and `ImageBoardView`; Locate uses `tap-region` (Easy/Medium) and `tap-point` with `distance` tolerance (Hard); Route uses `BoardPath`; Region Sort uses drop zones. The "map-coordinate picker" becomes the Admin board editor.
- **Phone Mode `map-select` (#19, `phone-buzzer-spec.md`):** becomes `board-select` with mode `tap-region`/`tap-point`.
- **Agon UI #107 and #113:** "map surfaces" and "maps" refer to `ImageBoardView` surfaces.
- **Candidate games #215, #224, #226, #229, #231 and kids games #236, #239, #240, #243, #249, #250, #253, #254:** add an Image Board dependency.

## 17. Open decisions

- Whether custom packs adopt the `.agonpack` archive now or only when the first custom board is imported.
- Whether to support animated (sprite) pieces or only static images in phase 1 (recommended: static only).
- Source and license for the first built-in maps and illustrations (commissioned art vs. public-domain maps). Every image needs a recorded credit before release.
