# Agon: The Bible Challenge — Roadmap

This roadmap summarizes the GitHub milestones and how they depend on each other. Detailed designs live in `specs/`; GitHub issues are the implementation tracker, and native `blockedBy` links on each issue are the source of truth for dependencies.

The product is being renamed from **Bible Challenge** to **Agon: The Bible Challenge** in 0.5.0 (see Agon 1).

## Current Baseline

- Current shipped version: `0.2.0` (Host Mode).
- Pre-1.0 feature work ships as minor releases; dev-only, content, polish, and test work can ship as patch releases.
- Both apps (Challenge and Admin Console) share one version number.

## Release Order at a Glance

| Version | Milestone | Issues | Needs |
|---|---|---|---|
| ~~0.1.x~~ | Automated Testing Foundations | #1–#3 (done) | — |
| ~~0.2.0~~ | Host Mode / Game Master Controls | #8–#10 (done) | 0.1.x |
| **0.3.0** | Host Remote (phone/tablet host controller) | #94–#96 | 0.2.0 |
| **0.4.0** | Phone Mode Stage 1 (Buzz Only) | #11–#14 | 0.2.0, #95 |
| **0.5.0** | Agon 1: Foundation | #117, #99–#102 | — |
| **0.6.0** | Agon 2: Core Apps | #103–#104 | Agon 1 |
| **0.7.0** | Agon 3: Game Presentation | #105–#107 | Agon 2 |
| **0.8.0** | Agon 4: Host Experience | #108–#110 | Agon 3, 0.3.0 |
| **1.0.0** | Stabilization | #15, #87 | 0.3.0–0.8.0 |
| 1.x | Feature tracks, Agon 5–6, content | see below | varies |

Agon 1–3 do not depend on Host Remote or Phone Mode, so they can be worked in parallel with 0.3.0/0.4.0. Version numbers are assigned in the order releases actually ship.

```txt
0.2.0 Host Mode ──> 0.3.0 Host Remote ──┬──> 0.4.0 Phone Stage 1 ──────────┐
                                        │                                 │
0.5.0 Agon 1 ─> 0.6.0 Agon 2 ─> 0.7.0 Agon 3 ─┴─> 0.8.0 Agon 4 ───────────┴─> 1.0.0 Stabilization

1.x: Phone Stages 2–3 + Controller extensions ─> Agon 5 ─> Agon 6
```

## Near-Term Release Path

### 0.3.0 — Host Remote

Goal: run Host Controls from a phone or tablet in projector mode while the laptop runs the game and projector.

- #94 Host command dispatcher and remote view.
- #95 LAN server core and host pairing (shared with Phone Mode).
- #96 Phone/tablet controller UI and projector-mode integration (needs #94, #95).

First release that opens a network port: release notes need firewall, Private network profile, hotspot fallback, and the plain-HTTP caveat. Security requirements S1–S18 are in the Host Remote section of `enhancement-spec-tournament-daily-host-map.md`.

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

### 0.6.0 — Agon 2: Core Apps

- #103 Challenge home, navigation, setup, settings, dialogs.
- #104 Admin console shell, navigation, forms, tables (parallel with #103).

### 0.7.0 — Agon 3: Game Presentation

- #105 Game Presentation System and standard quiz-family migration.
- #106 Projector/audience adaptive layouts and safe areas.
- #107 Specialized boards: card ordering, tiles, maps, Bible Baseball presentation. Presentations for games not built yet are finished in those games' own milestones.

### 0.8.0 — Agon 4: Host Experience

- #108 Shared Host Controls component system and desktop host redesign (needs #94).
- #109 Responsive Host Remote producer console (needs #94–#96).
- #110 Host Remote board controls, ordering, text entry, specialized interactions.

### 1.0.0 — Stabilization

Goal: declare the app stable after Host Mode, Host Remote, Phone Mode Stage 1, and the Agon redesign through Agon 4 have survived real use.

- #15 Stabilization checklist (blocked by the 0.3.0–0.8.0 work and critical testing).
- #87 Word Ladder: cap rungs by difficulty.

No new features in this milestone. 1.0.0 ships under the Agon name, so screenshot baselines cover the new design.

## 1.x Feature Tracks

The order of 1.x milestones is flexible unless a dependency is listed.

### Phone Mode Stages 2 and 3

- #16 Stage 2: buzz + typed answer.
- #17 Stage 3 Step 1: choice select.
- #18 Stage 3 Step 2: collect all.
- #19 Stage 3 Step 3: map and medium games (map needs #23).
- #20 Stage 3 Step 4: board games.

Open decision: choice select may ship before or alongside typed answers.

### Controller: Private Choice & Number Input

- Done: #49 Number-input and private-choice interaction types.
- #50 `privateOverride` in `PhonePromptModel` and `toPhoneView()`.
- #51 Leak test coverage for `privateOverride`.

Unblocks Bible Baseball and Forbidden Words phone flows.

### Agon 5: Player Controller

- #111 Controller shell, join/room, connection states, responsive buzzer (needs Phone Stage 1).
- #112 Typed-answer, choice, number, private-choice interactions (needs #16–#18, #49–#51).
- #113 Ordering, tiles, grouping, maps, specialized boards (needs #19, #20, #23).

### Agon 6: Polish & Validation

- #114 Motion, audio, haptics, game feedback polish.
- #115 Accessibility, responsive, visual-regression, and real-device validation gate.

### Tournament, Daily, and Map Modes

- #21 Tournament / Season Mode.
- #22 Daily Challenge Pack (needs seeded randomness from #1).
- #23 Bible Map Challenge (prerequisite for phone and controller map interaction).

### New Games and Variants

Build after Agon 3 so new games and modes use the Game Presentation System (#105).

- #52–#55 Progressive reveal content-batch games.
- #56–#57 Bible Timeline sub-modes.
- #58 Two Truths and a Lie narrated-account variant.
- #59–#64 Bible Baseball.
- #65–#68 Bible Blockbusters.
- #69–#71 Forbidden Words.

### Themed Content and Licensing

- #24–#30 Themed content groundwork.
- #31–#37 Content licensing (must ship before the first paid pack).
- #38–#45 Individual themed content packs (1.x.y patches).

Christmas (#38) and Easter / Resurrection Day (#39) are the first-pack candidates.

## Backlog

### Remaining Testing and CI

- #4 Challenge app feature tests.
- #5 Admin console and cross-app tests.
- #6 Visual regression baselines (best done after Agon 3 so baselines match the new design).
- #7 Optional CI pipeline.

Pull these forward when a feature touches the relevant app surface or before 1.0.0.

## Scheduling Notes

- Dependencies are native GitHub `blockedBy` links; prose "Depends on" lines in issue bodies are for reading only.
- Milestone descriptions point to `specs/...`.
- Before each minor release, bump both app versions together, run the checks, and write release notes for host-facing setup or behavior changes.
