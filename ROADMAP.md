# Agon: The Bible Challenge — Roadmap

This roadmap summarizes the GitHub milestones and how they depend on each other. Detailed designs live in `specs/` (many still in open spec PRs). GitHub issues are the implementation tracker. Native `blockedBy` links on each issue are the source of truth for dependencies; milestones are implementation and release phases.

The product is being renamed from **Bible Challenge** to **Agon: The Bible Challenge** in 0.5.0 (see Agon 1).

## Current Baseline

- Current shipped version: `0.3.0` (Host Remote).
- Pre-1.0 feature work ships as minor releases; dev-only, content, polish, and test work can ship as patch releases.
- Both apps (Challenge and Admin Console) share one version number.

## Guiding Sequence

```txt
Architecture foundation ─> UI system ─> 3 reference games end to end ─> validate ─> migrate everything else ─> cleanup
                                                     │
                                                     └─> new games (all built on the proven pattern)
```

- Build the architecture contracts (GameDefinition, capabilities, asset and content registries) **before** the Agon UI, so the UI renders stable concepts instead of today's game-specific code.
- Build the UI system **before** migrating games, so each game moves to the new architecture and the new UI at the same time. Never migrate every game and then redo its UI.
- **#321 is the gate for new games.** Three reference games (strong candidates: Before or After, Who Said It?, Missing Word) must prove the whole path: GameDefinition → engine → content → Asset Registry → Player Controller → Main Stage → Host Remote → persistence. Every new game issue is blocked by #321 and follows those games as templates.
- Remove old components, CSS, assets, and bootstrap code only after nothing uses them. Then enforce the bundle architecture (#322/#323).

## Release Order at a Glance

| Version | Milestone | Issues | Needs |
|---|---|---|---|
| ~~0.1.x~~ | Automated Testing Foundations | #1–#3 (done) | — |
| ~~0.2.0~~ | Host Mode / Game Master Controls | #8–#10 (done) | 0.1.x |
| ~~0.3.0~~ | Host Remote (phone/tablet host controller) | #94–#96 (done) | 0.2.0 |
| **0.4.0** | Phone Mode Stage 1 (Buzz Only) | #11–#14 | 0.3.0 |
| **0.5.0** | Agon 1: Foundation | #117, #99–#102 | — |
| **0.6.0** | Platform Architecture Foundation | #304, #313, #314, #317, #318 | spec PRs #303, #312 |
| **0.7.0** | Agon 2: Core Apps + UI Platform | #316, #103–#104 | Agon 1, 0.6.0 |
| **0.8.0** | Agon 3: Game Presentation | #105–#107 | Agon 2, 0.6.0 |
| **0.9.0** | Agon 4: Host Experience | #108–#110 | Agon 3 |
| **1.0.0** | Stabilization | #15, #87 | 0.4.0–0.9.0 |
| 1.x | Engines, platform migration, new games, content | see below | varies |

Agon 1 and the Architecture Foundation can run in parallel with 0.4.0. Version numbers are assigned in the order releases actually ship.

```txt
0.3.0 Host Remote ──> 0.4.0 Phone Stage 1 ──────────────────────────────────────────────┐
                                                                                        │
0.5.0 Agon 1 ─────────────┬─> 0.7.0 Agon 2 + #316 ─> 0.8.0 Agon 3 ─> 0.9.0 Agon 4 ──────┴─> 1.0.0
0.6.0 Architecture ───────┘
```

## Near-Term Release Path

### 0.4.0 — Phone Mode Stage 1

Goal: player phones connect and buzz while the host app keeps gameplay authority.

- #11 Shared foundation: protocol, device registry, privacy projection (on the #95 server).
- #12 Step 1: connect and buzz.
- #13 Step 2: roster and room.
- #14 Step 3: event readiness.

### 0.5.0 — Agon 1: Foundation

Goal: rename to Agon without losing data or updates, and lay the design-system foundation.

- #117 Rename continuity: data folder, update assets, installer identity (blocks #99).
- #99 Brand assets and product naming.
- #100 Design tokens, typography, icons, theme bridge.
- #101 Shared UI primitives and accessibility foundation.
- #102 Adaptive layout utilities and viewport test harness.

### 0.6.0 — Platform Architecture Foundation

Goal: give the UI stable concepts to render. Specs: PRs #303 (existing-game migration) and #312 (modular platform).

- #313 Baseline installer, bundle, dependency, asset, and content footprint.
- #314 Versioned GameDefinition schema, capability registry, runtime composition.
- #304 Audit every existing game for shared-engine and randomizer migration.
- #317 Asset Registry: semantic assets, deduplication, reusable asset packs (needs #313).
- #318 Content Registry: reusable Bible content and versioned content packs (needs #314).

The game-competition contract (#189) and computer-player capabilities (#160) build on #314 rather than defining their own capability systems.

### 0.7.0 — Agon 2: Core Apps + UI Platform

- #316 Consolidated Agon component library across Main Stage, controllers, Host, and Admin (needs #314, #101).
- #103 Challenge home, navigation, setup, settings, dialogs (needs #316).
- #104 Admin console shell, navigation, forms, tables (needs #316; parallel with #103).

### 0.8.0 — Agon 3: Game Presentation

- #105 Game Presentation System and standard quiz-family presentation (needs #314, #316, #317).
- #106 Projector/audience adaptive layouts and safe areas.
- #107 Specialized boards: card ordering, tiles, maps, Bible Baseball presentation.

Presentations for games not built yet are finished in those games' own milestones.

### 0.9.0 — Agon 4: Host Experience

- #108 Shared Host Controls component system and desktop host redesign.
- #109 Responsive Host Remote producer console.
- #110 Host Remote board controls, ordering, text entry, specialized interactions.

### 1.0.0 — Stabilization

Goal: declare the app stable after Phone Mode Stage 1, the architecture foundation, and the Agon redesign through Agon 4 have survived real use.

- #15 Stabilization checklist.
- #87 Word Ladder: cap rungs by difficulty.

No new features in this milestone. 1.0.0 ships under the Agon name, so screenshot baselines cover the new design.

## 1.x — Shared Infrastructure

These tracks can run in parallel unless a dependency is listed. They supply the engines that game migration and new games need.

### Phone Mode Stages 2 and 3

- #16 Stage 2: buzz + typed answer.
- #17 Stage 3 Step 1: choice select.
- #18 Stage 3 Step 2: collect all.
- #19 Stage 3 Step 3: map and medium games (map needs #23).
- #20 Stage 3 Step 4: board games.

### Controller: Private Choice & Number Input

- Done: #49. Remaining: #50 `privateOverride`, #51 leak test coverage.

### Agon 5: Player Controller

- #111 Controller shell, join/room, connection states, responsive buzzer.
- #112 Typed-answer, choice, number, private-choice interactions (needs #16–#18, #49–#51).
- #113 Ordering, tiles, grouping, maps, specialized boards (needs #19, #20, #23).

### Agon 6: Polish & Validation

- #114 Motion, audio, haptics, game feedback polish.
- #115 Accessibility, responsive, visual-regression, and real-device validation gate.

### Agon Game Foundations: Cards, Randomizers, Timer

Specs: PRs #129, #140, #151. The three tracks run in parallel.

- Card & Deck Engine: #130–#137, #167–#169 (#169 is the generic-engine release gate).
- Dice/Randomizer: #141–#150. Spinner, Wheel, and Casting Lots: #152–#155.
- Shared Agon Timer: #156–#159.

### Tournaments, Event Championships & Persistent Events

Spec: PR #188. Persistence (#190) and the scoring ledger (#191) are also prerequisites for the engine migrations #305–#309.

- #189 Four-team limit and game competition capability contract.
- #190 Persistent Events and Game Sessions (save/resume across gatherings, recovery, migrations).
- #191 Shared match engine and scoring ledger.
- #192 Single and Double Elimination. #193 Round-Robin, Swiss, and Round-Robin + Knockout.
- #194 Event Championship: qualifiers, combined seeding, final knockout.
- #195 Admin setup. #196 Saved Events, Host Remote, and projector views.
- #197 Integration into existing games (per game, as each game is ready).
- #198 Release gate.
- #21 Original Tournament / Season Mode issue (narrower scope, predates PR #188).

Normal game points always count toward the Agon score. Match records drive progression, qualifier seeding points only set seeds, and placement bonuses are awarded once at completion.

### Team Play Styles

Spec: PR #297. Solo, Tag Team, and Random Tag rotation: #292–#296. Needs #189, the randomizer (#142, #144, #154), and the tournament work (#190–#198).

### Participant Emblems

Spec: PR #302. Emblem set, data model, picker, and ParticipantShield: #298–#301. Needs Agon brand and UI (#99–#107), roster #13, and tournaments #190–#196.

### Image Board Engine

Spec: PR #287. #280–#286, ending with the Bible Map Challenge migration (#286 needs #23). Many candidate and kids games use it for image and map boards.

### Computer Player Framework

- #160–#163, #165–#166 framework; #164 Pairs of Faith adapter is its proof (needs #121/#122).

Computer opponents are optional for every game. They do not block any game's human-multiplayer release.

## 1.x — Platform Migration

### Migration 1: Reference Games (the new-game gate)

- #321 Convert at least three simple existing games to GameDefinitions with shared content and assets (needs #304, #314, #316–#318).
- #315 GameDefinition variant overlays (may proceed alongside #321).

### Migration 2: Existing Game Families

Migrate by family, adopting the new UI components at the same time: Challenge games, Cards, Ordering, Progressive Clue, Navigation, Reveal, then custom games.

- #308 Question-style games → shared Challenge Engine and Bible-navigation services.
- #305 Matching/category games → Card/Tile/Deck Engine (needs #169).
- #306 Timeline, Books Relay, Verse Scramble → ordering engine.
- #307 Five Clues, Name That Book, Prophecy Clue Ladder → progressive-clue engine.
- #309 Verse Reveal → shared reveal primitives.
- #320 Trusted novel-mechanic module contract for custom games.
- #311 Optional randomizer variants for migrated games.
- #331 Umbrella: all remaining games (needs #321 and #305–#309, #315, #320).

#305–#309 need the seeded RNG (#142), persistence (#190), and scoring ledger (#191).

### Cleanup, Optimization, and Packs

- #322 Lazy loading, code splitting, dependency deduplication (after #331).
- #319 Local game/content/asset pack manifests (needs #314, #317, #318).
- #323 CI size budgets, duplicate detection, reuse-first checks (needs #319, #322).
- #324 Optional downloadable packs with offline use and integrity checks (needs #319, #320, #323).

## 1.x — New Games

All new game implementations are blocked by #321, then by their own engine dependencies. They are listed in priority order.

1. **Pairs of Faith** #120–#128 (spec PR #119).
2. **Unveiled** #172 (spec PR #171). Needs Card Engine #130/#132/#133/#167 and Timer #156.
3. **Multitude** #174–#179 (spec PR #173). Needs Timer #156.
4. **Wayfinder** #181–#186 (spec PR #180). Needs Timer #156–#159.
5. **Bible Playing Deck** #138, #139. Content work; the generic Card Engine does not wait for it.
6. Older game milestones: Progressive Reveal batch #52–#55, Timeline sub-modes #56–#57, Director's Cut #58, Bible Baseball #59–#64, Bible Blockbusters #65–#68, Forbidden Words #69–#71.

```txt
#321 reference games ─┬─> Pairs of Faith #120–#128 ──> Computer Players #164/#166
                      ├─> Unveiled #172        <── Card Engine #130–#169, Timer #156
                      ├─> Multitude #174–#179  <── Timer #156
                      ├─> Wayfinder #181–#186  <── Timer #156–#159
                      └─> candidate + kids games
```

## 1.x — Content

- #24–#30 Themed content groundwork.
- #31–#37 Content licensing (must ship before the first paid pack).
- #38–#45 Individual themed content packs (1.x.y patches). Christmas (#38) and Easter / Resurrection Day (#39) are the first-pack candidates.
- #22 Daily Challenge Pack. #23 Bible Map Challenge (prerequisite for phone and controller map interaction).

## Backlog

Candidate games are independently droppable and can be closed as `not planned`.

### Candidate Games

- Batch 1 (spec PR #199): #200–#233. Several need the randomizer (#150/#155), Card Engine (#169), Timer (#159), or Image Board (#286).
- Agon Joust #289 (spec PR #288). Needs the full tournament track #189–#198.
- Agon Gauntlet #291 (spec PR #290), plus Gauntlet adapters for existing games #310.

### Agon Kids

- Platform: #234 Kids Mode, #235 Dig Deeper / Memory Verse Wall / Story Passport, #257 learning-objective taxonomy (spec PR #256).
- Ages 3–5: #236–#244 (tracking #245); batch 2 #258–#265 (tracking #278).
- Ages 6–10: #246–#254 (tracking #255); batch 2 #266–#277 (tracking #279).

Every kids game needs #234 and #235; batch 2 also needs #257.

### Kids Activity Events

Spec: PR #332.

- Platform: #327 model and lifecycle, #328 segment runner, #329 Make engine (needs Image Board), #330 Admin editors, #333 Leader Guide.
- Series: Bible Baking #325 (3–5), #335 (6–10); Bible Builders #326 (3–5), #334 (6–10).

### Remaining Testing and CI

- #4 Challenge app feature tests.
- #5 Admin console and cross-app tests.
- #6 Visual regression baselines (best done after Agon 3 so baselines match the new design).
- #7 Optional CI pipeline.

Pull these forward when a feature touches the relevant app surface or before 1.0.0.

## Scheduling Notes

- Dependencies are native GitHub `blockedBy` links; prose "Depends on" lines in issue bodies are for reading only.
- Milestones are phases. An issue belongs to one milestone even if it depends on work in others.
- Milestone descriptions point to specs or spec PRs.
- Before each minor release, bump both app versions together, run the checks, and write release notes for host-facing setup or behavior changes.
