# Bible Challenge Roadmap

This roadmap summarizes the active GitHub milestones and issue relationships. The detailed specs remain under `specs/`; GitHub issues are the implementation tracker.

## Current Baseline

- Current shipped version: `0.1.11`
- Current planning rule: pre-1.0 feature work ships as minor releases; dev-only, content, polish, and test work can ship as patch releases.
- Release versions are shared by Bible Challenge and the Admin Console.

## Near-Term Release Path

### 0.1.x - Automated Testing Foundations

Goal: finish the test foundation needed before larger engine and UI changes.

- Done: #1 Test mode foundations.
- Done: #2 Layer 1 game logic play-through tests.
- Done: #3 Playwright + Electron setup.

The remaining testing work is intentionally split into the backlog milestone so Host Mode can move forward once the critical safety net is in place.

### 0.2.0 - Host Mode / Game Master Controls

Goal: add host-facing game controls and refactor gameplay actions so host-judged play scores the same way as normal engine-graded play.

- #8 Host Mode Phase 1: reveal, select answerer, mark correct/incorrect for `buzz-replaces-turn` games.
- #9 Host Mode Phase 2: undo stack, score adjustment audit log, remaining games, `BuzzTurnPolicy`.
- #10 Host Mode Phase 3: host hints, private teaching notes, admin permission settings.

This release is the main prerequisite for Phone Mode because it establishes prompt identity, host judging, answerer selection, and undo behavior.

### 0.3.0 - Phone Mode Stage 1

Goal: let player phones connect and buzz while keeping gameplay authority in the host app.

- #11 Shared foundation: server, protocol, privacy projection.
- #12 Stage 1 Step 1: connect and buzz.
- #13 Stage 1 Step 2: roster and room.
- #14 Stage 1 Step 3: event readiness.

This is the first release that opens a network port and will need release notes for firewall and venue-network setup.

### 1.0.0 - Stabilization

Goal: declare the app stable after Host Mode and Phone Mode Stage 1 have survived real use and the core test coverage is in place.

- #15 Stabilization checklist.
- Depends on the critical testing, Host Mode, and Phone Mode Stage 1 work: #2, #4, #6, and #8 through #14.

No new features should be added in this milestone.

## 1.x Feature Tracks

### Phone Mode Stages 2 and 3

Goal: expand phones from buzzers into answer and interaction controllers.

- #16 Stage 2: buzz + typed answer.
- #17 Stage 3 Step 1: choice select.
- #18 Stage 3 Step 2: collect all.
- #19 Stage 3 Step 3: map and medium games.
- #20 Stage 3 Step 4: board games.

Open decision: Stage 3 choice select may ship before or alongside typed answers.

### Tournament, Daily, and Map Modes

Goal: add larger play structures and a map-based game.

- #21 Tournament / Season Mode.
- #22 Daily Challenge Pack.
- #23 Bible Map Challenge.

Daily Challenge depends on seeded randomness from #1. Phone Mode map interaction depends on #23.

### Themed Content and Licensing

Goal: split content into seasonal packs, then add optional licensed pack support.

- #24-#30 Themed content groundwork.
- #31-#37 Content licensing.
- #38-#45 Individual themed content packs.

Christmas (#38) and Easter / Resurrection Day (#39) are the first-pack candidates for making themed content visible when the groundwork ships.

### Controller Extensions

Goal: add controller primitives needed by private-phone games.

- #49 Number-input and private-choice interaction types.
- #50 `privateOverride` in `PhonePromptModel` and `toPhoneView()`.
- #51 Leak test coverage for `privateOverride`.

These unblock Bible Baseball and Forbidden Words phone flows.

### New Games and Variants

Goal: add lower-risk games and variants that reuse existing engine patterns.

- #52-#55 Progressive reveal and related content-batch games.
- #56-#57 Bible Timeline sub-modes.
- #58 Two Truths and a Lie narrated-account presentation variant.
- #59-#64 Bible Baseball.
- #65-#68 Bible Blockbusters.
- #69-#71 Forbidden Words.

The preferred build order is to land shared/controller work first, then implement feature tracks whose dependencies are already satisfied.

## Backlog

### Remaining Testing and CI

- #4 Challenge app feature tests.
- #5 Admin console and cross-app tests.
- #6 Visual regression baselines.
- #7 Optional CI pipeline.

These can be pulled forward when a feature touches the relevant app surface or when release confidence needs to increase before 1.0.0.

## Scheduling Notes

- The order of most `1.x` milestones is intentionally flexible.
- Dependencies in issue bodies should stay explicit with issue numbers so GitHub creates navigable relationships.
- Milestone descriptions should point to `specs/...`, not stale working paths.
- Before each minor release, update both app versions together, run the available checks, and write release notes for host-facing setup or behavior changes.
