# Automated Testing Spec

## Contents

1. Overview
2. Current State
3. Test Layers
4. Test Mode: Required App Changes
5. Layer 1: Game Logic Play-Through (Vitest)
6. Layer 2: Feature Tests (Playwright + Electron)
7. Layer 3: Visual Regression
8. Scripts, Reporting, and CI
9. Directory Layout
10. Acceptance Criteria
11. Steps
12. Open Decisions

---

# 1. Overview

## Summary

Add automated tests that confirm the Bible Challenge app and the Admin Console still work and still look right after a change. The suite has three layers:

1. **Game logic:** every game plays from start to finish through the engine, with rule and scoring checks.
2. **Features:** Playwright drives the real Electron apps through menus, settings, games, Host Controls, the projector window, the admin console, and data shared between the two apps.
3. **Look and feel:** Playwright compares screenshots of key screens against approved baselines.

## Goals

- One command runs the full suite locally.
- Every game in `GameId` is covered, and a new game without tests fails the suite.
- Tests never touch the developer's real settings, stats, content packs, or the network.
- Tests are repeatable: the same code produces the same questions, order, and screenshots.
- A failure leaves enough evidence (screenshot, trace, logs) to diagnose without re-running.

## Non-Goals

- Testing the NSIS installers or the auto-update download and install flow end to end.
- Cross-platform testing. The apps are Windows-only.
- Load or performance testing.
- Replacing the existing Vitest engine tests. They stay and are extended.

---

# 2. Current State

Findings as of this writing.

- **Unit tests:** Vitest in both workspaces. Root has `tests/gameEngine.test.ts` (36 tests) and `tests/scoring.test.ts` (9 tests). Admin has `contentPipeline`, `dedupe`, and `formRenderer` tests.
- **Data checks:** `npm run check:data` validates content JSON against schemas. Admin has `verify-schemas-fresh`.
- **No UI or end-to-end tests** for either app.
- **Manual cross-app check:** `admin/scripts/smoke-test-user-data.mjs` documents a manual sentinel test proving both apps share one userData folder. The admin exposes `dev:write-sentinel` / `dev:read-sentinel` IPC for it.
- **Randomness:** round selection and shuffles call `Math.random` directly (`src/lib/gameEngine.ts:1063`, `:1529`, `src/lib/games/fiveGuesses.ts:86`). Each run shows different questions.
- **Time:** `Date.now()` / `new Date()` drive verse typing WPM (`src/renderer/App.tsx:7824`, `:7830`), `lastPlayedAt`, generated IDs, and the audio throttle (`src/renderer/audio.ts:126`). Admin uses `Date.now()` in generated round IDs (`admin/src/renderer/App.tsx:337`, `:395`).
- **Session size:** round counts per game are fixed inside `createSessionState` (`gameEngine.ts:2008`). `SessionConfig` has no way to request a shorter session.
- **Shared userData:** the admin calls `app.setName("Bible Challenge")` so both apps read and write the same `app-settings.json` and `custom-content/` folder.
- **External calls:**
  - Admin update check calls the GitHub Releases API over `https` and can download and launch installers.
  - Challenge app posts feedback with `fetch` (`App.tsx:3130`).
  - Both apps use `dialog.showOpenDialog` / `showSaveDialog` and `shell.openExternal`.
- **Selectors:** no `data-testid` attributes; about 39 `aria-label`s in `App.tsx`.
- **Window size:** the main window is fixed at 1500 × 980 and not resizable.
- **Themes:** 7 app themes (`classic`, `forest`, `ocean`, `plum`, `dawn`, `meadow`, `ruby`).
- **Challenge app areas:** setup, settings (tabs: appearance, players, timers, audio, feedback, content, event, about), Host Controls, game help, app help, projector controls, rating modal, study notes.
- **Admin tabs:** content, library, study-notes, settings, stats, updates, plus PIN lock.
- **Environment gotcha:** Claude Code sessions set `ELECTRON_RUN_AS_NODE=1`, which stops Electron from opening windows. The admin smoke-test script already notes this.

---

# 3. Test Layers

| Layer | Tool | Runs against | Catches | Target runtime |
|---|---|---|---|---|
| 1. Game logic | Vitest | Engine functions directly | Broken rules, scoring, turn order, game completion | Under 30 s |
| 2. Features | Playwright `_electron` | Built apps launched with `electron .` | Broken screens, buttons, settings, persistence, IPC, projector, admin flows, cross-app data | Under 10 min |
| 3. Look and feel | Playwright `toHaveScreenshot` | Same launched apps | Layout, CSS, and theme regressions | Included in Layer 2 time |

Layer 1 is the fastest and should catch most logic regressions, so Layer 2 does not need to test every game rule through the UI. Layer 2 checks that each game is wired up and playable.

---

# 4. Test Mode: Required App Changes

These changes make the apps testable. None change normal behavior.

## 4.1 Activation

- Test mode is on only when **both** are true:
  - Environment variable `BIBLE_CHALLENGE_E2E=1`
  - `app.isPackaged === false`
- Installed builds can never enter test mode.
- Main passes test-mode values to renderer windows through the existing `loadAppWindow(window, query)` query string, for example `?e2e=1&seed=42`. The projector window receives the same flags.

## 4.2 Seeded Randomness

Add `src/lib/random.ts`:

```ts
export function random(): number;              // Math.random unless seeded
export function setRandomSeed(seed: number): void;
export function shuffle<T>(values: T[]): T[];  // uses random()
```

- Seeded generator: a small deterministic PRNG such as mulberry32.
- Replace the direct `Math.random` calls in `gameEngine.ts` and `games/fiveGuesses.ts` with `random()`, and remove the duplicate shuffle implementations.
- The renderer calls `setRandomSeed` at startup when `seed` is in the query string.
- ID generation in `App.tsx` (`Date.now()` + `Math.random()`) may stay as is. Tests must not depend on generated IDs.
- Vitest play-through tests call `setRandomSeed` directly.

## 4.3 Isolated User Data

- Environment variable `BIBLE_CHALLENGE_USER_DATA_DIR`. When set in test mode, main calls `app.setPath("userData", dir)` before anything reads the path.
  - Challenge app: first lines of `electron/main.js`.
  - Admin: immediately after `app.setName("Bible Challenge")`.
- Cross-app tests point both apps at the **same** temp folder.
- Because the override bypasses name-based folder resolution, add a Vitest check that the admin's `app.setName(...)` value equals the root `package.json` `build.productName`. That keeps the guarantee the manual sentinel test was protecting.

## 4.4 Session Size Cap

- Add optional `maxPrompts?: number` to `SessionConfig`. When set, `createSessionState` picks at most that many rounds or board cards.
- In test mode, the renderer reads `maxPrompts` from the query string and applies it to every new session.
- Default for E2E: 2 prompts per game, so a full play-through stays short.
- Verify `pickGameRounds` handles counts smaller than its default without throwing.

## 4.5 Renderer Test Hook

- In test mode only, the renderer attaches a read-only object to `window`:

```ts
interface BibleChallengeTestHook {
  getSessionState(): SessionState | null;
  getScreen(): string;          // e.g. "menu", "setup", "game", "complete"
  getSettings(): unknown;       // current in-memory settings
}

declare global {
  interface Window {
    __bibleChallengeTest?: BibleChallengeTestHook;
  }
}
```

- Playwright's `page.evaluate` runs in the page's main world, so it can read this hook even with `contextIsolation`. No preload change is needed.
- The hook never mutates state. Tests act only through the UI.
- The admin gets an equivalent hook exposing its active tab and lock state.

## 4.6 Stubbed External Effects

| Effect | Stub approach |
|---|---|
| File open/save dialogs | Test fixture replaces `dialog.showOpenDialog` / `showSaveDialog` in the main process via `electronApp.evaluate`, returning fixture paths |
| `shell.openExternal` | Replaced via `electronApp.evaluate`; calls are recorded for assertions |
| Admin update check | In test mode, `GITHUB_API_BASE` is read from `BIBLE_CHALLENGE_UPDATES_URL`, pointed at a local fixture HTTP server |
| Update download and install | In test mode, the handler **always** throws before downloading or spawning anything. Hard guard, independent of other stubs. |
| Feedback POST | Seeded feedback endpoint points at the local fixture HTTP server, which records requests |
| Audio | Seeded `audio-settings.json` disables sound effects and background music |

## 4.7 Display Stability

- In test mode, main calls `app.commandLine.appendSwitch("force-device-scale-factor", "1")` so Windows display scaling does not change screenshot sizes.
- Projector tests run on whatever displays exist. With a single display, the projector window opens on the primary display, which the app already supports.

## 4.8 Selector Policy

- Prefer Playwright role and label selectors: `getByRole("button", { name: "Start" })`, `getByLabel("Set current score")`.
- Add `data-testid` only where role and name are ambiguous or unstable. Naming: `area-element`, for example `host-controls-reveal`, `theme-swatch-ocean`, `admin-tab-stats`.
- Known ambiguous spots to tag first:
  - Host Controls: Reveal Answer and Skip / Pass currently call the same function.
  - Per-game submit, pass, and continue buttons, which repeat across game components.
  - Theme swatches.
  - Admin tab buttons.
- Do not add `data-testid` broadly. Missing accessible names are fixed with `aria-label`, which also helps accessibility.

## 4.9 Launch Environment

The Playwright launch fixture builds the Electron environment explicitly:

- Removes `ELECTRON_RUN_AS_NODE`.
- Sets `BIBLE_CHALLENGE_E2E=1`, `BIBLE_CHALLENGE_USER_DATA_DIR`, and the fixture server URLs.
- Never sets `VITE_DEV_SERVER_URL`. Tests run against the built `dist/`.

---

# 5. Layer 1: Game Logic Play-Through (Vitest)

## 5.1 Game Players

`tests/helpers/gamePlayers.ts` defines a player for every game:

```ts
interface GamePlayer<TState extends SessionState = SessionState> {
  gameId: GameId;
  isAwaitingInput(state: TState): boolean;
  playCorrect(state: TState): ActionResult;
  playIncorrect(state: TState): ActionResult;
  pass(state: TState): ActionResult;
  advance(state: TState): ActionResult | null; // continue/select next card; null when nothing to do
  correctInputFor(state: TState): unknown;     // reused by Layer 2 to type or click the answer
}

export const GAME_PLAYERS: Record<GameId, GamePlayer>;
```

- Players call existing engine actions (for example `submitBoardGuess`, `answerBeforeOrAfter`, `reorderTimelineEvent` + `submitTimelineOrder`).
- `correctInputFor` derives the answer from state, so Layer 2 can reuse it through the renderer test hook.

## 5.2 Completeness Guard

A test asserts that the keys of `GAME_LIBRARY`, the `GameId` list, and `GAME_PLAYERS` are identical. Adding a game without a player fails the suite.

## 5.3 Scenarios

For every game, with a fixed seed and `maxPrompts` unset (full session):

| Scenario | Setup |
|---|---|
| All correct | Individual mode, 1 player |
| All pass | Individual mode, 1 player |
| Mixed | Individual mode, 3 players; rotate correct, incorrect, pass |
| Teams | Teams mode, 2 teams with 2 members each; mixed actions |
| Short session | `maxPrompts: 2` |
| Custom content only | `contentSource: "custom"` with a fixture pack |

Each scenario loops until `status === "completed"`, with a hard cap on iterations so a stuck game fails instead of hanging.

## 5.4 Invariants

Checked after every action:

- `resolvedPrompts` never decreases and never exceeds `totalPrompts`.
- Every participant's `totalScore` is a non-negative integer.
- `turnIndex` is a valid participant index.
- The action returns a non-empty activity message.
- The input state is not mutated (compare a `structuredClone` taken before the action).

Checked at the end:

- `status === "completed"` and `resolvedPrompts === totalPrompts`.
- All correct: total score is greater than 0.
- All pass: total score equals 0.
- Stats counters for incorrect attempts match the number of incorrect actions played.

## 5.5 Content Solvability

For every round in every built-in data file, the round's own answer (and each alias) is accepted by the game's grader. This catches data mistakes, such as an alias that normalizes to something different from the answer, that `check:data` schema validation cannot see.

## 5.6 Determinism

With the same seed, creating a session twice produces identical round selection and order.

## 5.7 Shared-Name Check

Assert that the admin's `app.setName(...)` string equals the root `package.json` `build.productName` (see 4.3).

---

# 6. Layer 2: Feature Tests (Playwright + Electron)

## 6.1 Tooling

- Add `@playwright/test` as a root devDependency.
- `playwright.config.ts` at the root with projects:
  - `challenge`: challenge app feature tests
  - `admin`: admin console feature tests
  - `cross-app`: tests that run both apps against one userData folder
  - `visual`: screenshot tests (Layer 3)
- `workers: 1` initially. Every test uses its own userData folder, so parallel workers are possible later.
- Before building on it, confirm the installed `@playwright/test` version launches Electron 44 with `_electron.launch()`. Playwright labels Electron support experimental.

## 6.2 Build Step

- `npm run test:e2e` builds both apps first (`npm run build`, `npm run build:admin`), then runs Playwright.
- A `--no-build` variant skips building for fast iteration.

## 6.3 Fixtures

`tests/e2e/fixtures/`:

| Fixture | Scope | Purpose |
|---|---|---|
| `userDataDir` | test | Creates a temp folder seeded from a named profile (see below); deleted after the test unless it failed |
| `fixtureServer` | worker | Local HTTP server for feedback POSTs and the fake GitHub Releases API; records requests |
| `challengeApp` | file | Launches the challenge app with test env; returns `ElectronApplication` + main window `Page` |
| `adminApp` | file | Same for the admin console |
| `dialogs` | test | Helpers to queue open/save dialog results in the main process |
| `gameDriver` | test | Starts a game through the UI and plays actions using `GAME_PLAYERS[gameId].correctInputFor` via the test hook |
| `consoleGuard` | test | Fails the test on renderer `console.error`, uncaught page errors, or main-process crashes |

Apps launch once per spec file. A `resetToMainMenu()` helper returns to the menu between tests. A spec file that changes persisted settings launches its own app with its own userData folder.

### Seed Profiles

`tests/e2e/fixtures/profiles/<name>/` holds files copied into userData:

| Profile | Contents |
|---|---|
| `clean` | Audio muted, timers off, `classic` theme, no custom content |
| `with-custom-pack` | `clean` + one small custom content pack covering several games |
| `with-stats` | `clean` + known `gameStats` and `challengeRatings` |
| `admin-locked` | `clean` + admin PIN set |
| `timers-on` | `clean` + timers on with short durations |

## 6.4 Challenge App Test Inventory

### Launch and Shell

- App launches, main window shows the menu, no console errors.
- App version from `getAppVersion` is displayed where expected.
- Exit closes the app cleanly.

### Settings

One test per tab:

- **Appearance:** each theme applies (root theme attribute or class changes); display mode normal/projector toggles.
- **Players:** add, rename, recolor, and remove players; switch to teams and edit team members.
- **Timers:** timer on/off, each preset applies expected durations, custom value is clamped to 5-1800.
- **Audio:** toggles and volume sliders update and persist.
- **Feedback:** submitting sends one request to the fixture server with the expected fields.
- **Content:** import a pack through a stubbed open dialog; pack is listed; remove it; invalid JSON shows an error.
- **Event:** create, save, and delete a saved event definition.
- **About:** version and links; external links call the stubbed `openExternal`.

### Persistence

- Change theme, timer preset, audio settings, and event definitions; relaunch with the same userData; changes are still applied.
- Player roster is **not** restored after relaunch (documented behavior in `PersistedAppSettings`).

### Games

Parameterized over every `GameId`, with `maxPrompts=2`, seed fixed, individual mode, one player:

1. Start the game from the menu through setup.
2. Play one prompt correctly using the UI. The expected score increase is read from the test hook before and after.
3. Play the next prompt incorrectly or pass, and check the activity message and unchanged score.
4. Continue until the completion screen shows.
5. Rating modal appears; submit a rating; it is saved to `app-settings.json`.
6. Return to the menu.
7. `gameStats` for that game in `app-settings.json` shows one more play.

Additional game coverage:

- **Teams mode:** `name-that-book`, `initials`, `five-guesses` (primary and steal flow), plus one choice game.
- **Difficulty filter:** start one game per difficulty and check the session is created.
- **Custom content:** with `with-custom-pack`, start a game with custom content only and see a round from the fixture pack.
- **Study notes:** appear after a resolved prompt when enabled; can be dismissed; hidden when disabled.
- **Game help and app help** modals open and close.

### Timers

Profile `timers-on`, using Playwright's clock (`page.clock.install`, then reload so the page picks it up):

- Timer counts down while a prompt is active.
- Expiry shows "Time is up" and applies the game's expiry behavior.
- Pause from Host Controls stops the countdown; resume continues it.

### Host Controls

- Pause/resume timer.
- Add Point, Subtract Point, and Set Score change the expected participant's score.
- Undo Last Score restores the previous score.
- Reveal Answer and Skip / Pass resolve the prompt without awarding points.
- Restart Challenge starts a fresh session of the same game.
- End Game shows completion; Main Menu returns to the menu.

When Host Mode (enhancement spec section 3) lands, add Select Answering Participant, Mark Correct, Mark Incorrect, and multi-level undo here.

### Projector

- Open projector window: a second window loads with `?projector=1`.
- Projector mirrors the current prompt and score after an action in the main window.
- Projector does not display the correct answer before reveal, and does display it after reveal.
- Closing the projector window updates projector status in the main window.
- Main window close also closes the projector window.

### Event Mode

- Create an event with two games; play both with `maxPrompts=2`; event scoreboard accumulates across both.

## 6.5 Admin Console Test Inventory

### Launch and Lock

- App launches to the content tab with no console errors.
- With `admin-locked`: lock screen shows; wrong PIN is rejected; correct PIN unlocks.
- Set PIN, relaunch, locked; clear PIN, relaunch, unlocked.

### Content Tab

- Select each game; the schema form renders.
- Add a round with valid fields; it appears in the pack.
- Invalid or missing required fields show validation errors and block save.
- Save pack writes `custom-content/<packId>.json` in userData with the expected content.

### Library Tab

- Seeded pack is listed; preview opens; remove deletes the file.

### Study Notes Tab

- Edit a study note and save; the change is written.

### Settings Tab

- Set feedback endpoint; value is written to `app-settings.json`.
- Export settings through a stubbed save dialog; exported file matches current settings.
- Import settings from a fixture file through a stubbed open dialog; values applied.
- Clear all settings; file reset as expected.

### Stats Tab

- With `with-stats`: stats and ratings display the seeded values.
- Clear stats and clear ratings update both the UI and the file.

### Updates Tab

Fixture server returns scripted GitHub Releases responses:

- Up to date: current version equals latest release.
- Update available: newer release with both installer assets.
- Missing asset: release without the admin installer.
- API error: 500 response shows an error state.
- Download and install: button path is exercised only far enough to confirm the test-mode hard guard blocks it.

## 6.6 Cross-App Tests

Both apps launch against one userData folder.

- **Pack round trip:** create and save a pack in the admin; the challenge app lists it in the content tab and can start a game using it.
- **Stats round trip:** play one game in the challenge app; the admin stats tab shows the play.
- **Ratings round trip:** rate a game in the challenge app; admin shows it; clearing in admin removes it in the challenge app after relaunch.
- **Feedback endpoint:** set in admin; challenge app sends feedback to it.
- **Sentinel:** admin writes a sentinel; challenge app reads it through `getAppSettings`. This automates the manual smoke test. The manual script can remain for checking real installed builds.

## 6.7 Failure Artifacts

On failure, Playwright keeps:

- Screenshot of each open window
- Trace (on first retry)
- Main-process stdout/stderr for both apps
- Renderer console log
- The test's userData folder

---

# 7. Layer 3: Visual Regression

## 7.1 Mechanism

- `await expect(page).toHaveScreenshot("name.png")`.
- Baselines stored under `tests/e2e/__screenshots__/` and committed to git.
- Playwright names baselines per platform; all baselines are `win32`.

## 7.2 Stabilization

Every visual test:

- Uses the `clean` profile, a fixed seed, and `maxPrompts=2`.
- Installs a fixed clock (`page.clock.setFixedTime`) before capturing.
- Keeps timers off, unless the screen under test is a timer state.
- Waits for `document.fonts.ready` and for the screen's key element to be visible.
- Uses `animations: "disabled"` and `caret: "hide"`.
- Masks dynamic regions: version string, timer badge (unless under test), dates, generated IDs.
- Runs at device scale factor 1 (see 4.7).

Starting threshold: `maxDiffPixelRatio: 0.01`. Tune after the first week of runs.

## 7.3 Screen Inventory

### Challenge App

| Screen | Variants | Count |
|---|---|---:|
| Main menu | 7 themes | 7 |
| Setup (individual and teams) | classic | 2 |
| Settings tabs | 8 tabs, classic | 8 |
| Active prompt | every game, classic | 32 |
| Resolved prompt | every game, classic | 32 |
| Completion screen + rating modal | classic | 2 |
| Host Controls modal | classic | 1 |
| Game help and app help | classic | 2 |
| Projector view | 3 representative games (text, choice, board) | 3 |
| Active prompt | 1 game in each non-classic theme | 6 |

### Admin Console

| Screen | Count |
|---|---:|
| Lock screen | 1 |
| Each tab with seeded data | 6 |
| Content tab validation errors | 1 |

About 105 screenshots in total.

## 7.4 Updating Baselines

- Intentional change: `npm run test:visual:update`, review the diff in the Playwright HTML report, then commit the new baselines with the change that caused them.
- Never update baselines to make an unexplained failure pass.
- Baselines must be created on the same machine or runner type that compares them (see Open Decisions).

## 7.5 Optional: Accessibility Scan

Add `@axe-core/playwright` on the main menu, setup, one game screen, settings, and each admin tab. Report violations as warnings at first, then promote serious ones to failures once fixed.

---

# 8. Scripts, Reporting, and CI

## 8.1 Scripts

Root `package.json`:

| Script | Runs |
|---|---|
| `test:run` | Existing Vitest suite, now including Layer 1 |
| `test:e2e` | Build both apps, then Playwright `challenge`, `admin`, `cross-app` projects |
| `test:e2e:fast` | Playwright without building |
| `test:visual` | Build, then Playwright `visual` project |
| `test:visual:update` | Same, with `--update-snapshots` |
| `test:all` | `check:data`, `typecheck`, `typecheck:admin`, `test:run`, `test:admin`, `test:e2e`, `test:visual` |

## 8.2 Reporting

- Playwright HTML report in `playwright-report/`; test output in `test-results/`. Both added to `.gitignore`.
- Retries: 0 locally, 1 in CI. A test that passes only on retry is reported as flaky.

## 8.3 Flakiness Rules

- No fixed sleeps. Use Playwright's auto-waiting assertions.
- Every test starts from a known userData profile and seed.
- A flaky test is fixed or tagged `@quarantine` within a week. Quarantined tests are excluded from `test:all` and listed in the report.

## 8.4 CI (Optional)

The repo is on GitHub (`mkunze8187-cmd/bible-challenge`). If CI is adopted:

- GitHub Actions workflow on `windows-latest`, triggered on pull requests and pushes to the main branch.
- Steps: install, `check:data`, typecheck both workspaces, Vitest both workspaces, Playwright E2E and visual.
- Upload `playwright-report/` and `test-results/` as artifacts on failure.
- A manually triggered workflow regenerates visual baselines on the runner and uploads them as an artifact to commit.

---

# 9. Directory Layout

```txt
playwright.config.ts
src/lib/random.ts
tests/
  gameEngine.test.ts            (existing)
  scoring.test.ts               (existing)
  playthrough.test.ts           Layer 1 scenarios and invariants
  contentSolvability.test.ts    Layer 1 content check
  determinism.test.ts           Layer 1 seed check
  appIdentity.test.ts           Shared-name check
  helpers/
    gamePlayers.ts
    invariants.ts
  fixtures/
    content-packs/              small custom packs used by Layers 1 and 2
  e2e/
    fixtures/
      apps.ts                   challengeApp, adminApp launch fixtures
      userData.ts
      fixtureServer.ts
      dialogs.ts
      gameDriver.ts
      consoleGuard.ts
      profiles/
        clean/
        with-custom-pack/
        with-stats/
        admin-locked/
        timers-on/
      github-releases/          scripted update API responses
    challenge/
      launch.spec.ts
      settings.spec.ts
      persistence.spec.ts
      games.spec.ts
      timers.spec.ts
      host-controls.spec.ts
      projector.spec.ts
      event-mode.spec.ts
    admin/
      lock.spec.ts
      content.spec.ts
      library.spec.ts
      study-notes.spec.ts
      settings.spec.ts
      stats.spec.ts
      updates.spec.ts
    cross-app/
      shared-data.spec.ts
    visual/
      challenge.visual.spec.ts
      admin.visual.spec.ts
    __screenshots__/
```

---

# 10. Acceptance Criteria

- `npm run test:all` runs every layer from a clean checkout after `npm install`.
- Adding a `GameId` without a game player fails the suite.
- Every game plays to completion in Layer 1 across all scenarios, and through the UI in Layer 2.
- No test reads or writes the developer's real userData folder, calls GitHub, or launches an installer.
- Running the suite twice in a row with no code changes produces identical results and no screenshot diffs.
- A deliberate CSS change to a shared component fails at least one visual test.
- A deliberate scoring bug in any game fails at least one Layer 1 test.
- Removing the admin's `app.setName` call fails the shared-name check.
- Failures produce screenshots, traces, logs, and the userData folder.
- Normal app behavior is unchanged when test mode is off, and installed builds cannot enable test mode.

---

# 11. Steps

### Step 1: Test Mode Foundations

- `src/lib/random.ts` and replacement of direct `Math.random` shuffles.
- `maxPrompts` in `SessionConfig`.
- Test mode activation, query flags, userData override, device scale factor.
- Renderer test hooks in both apps.
- Update-install hard guard and configurable updates URL.

### Step 2: Layer 1

- `GAME_PLAYERS` for all games and the completeness guard.
- Play-through scenarios and invariants.
- Determinism, content solvability, and shared-name tests.

### Step 3: Playwright Setup

- Install and configure Playwright; confirm Electron 44 compatibility.
- Launch, userData, profile, fixture server, dialog, and console guard fixtures.
- Launch smoke tests for both apps.

### Step 4: Challenge App Feature Tests

- Games (all `GameId`s), settings, persistence, Host Controls.
- Timers, projector, event mode.
- `data-testid` additions for ambiguous controls.

### Step 5: Admin and Cross-App Tests

- All admin tabs, lock, and scripted update states.
- Cross-app round trips, including the automated sentinel test.

### Step 6: Visual Regression

- Stabilization helpers and masks.
- Baselines for the screen inventory.
- Optional accessibility scan.

### Step 7 (Optional): CI

- GitHub Actions workflow, artifacts, and baseline regeneration workflow.

---

# 12. Open Decisions

1. **Local only or CI.** Local-only is simpler. CI catches regressions on every push but requires baselines generated on the CI runner.
2. **Where baselines come from.** Must match where they are compared: the development machine if local only, the CI runner if CI is adopted.
3. **Visual coverage depth.** The inventory captures active and resolved states for all 32 games (64 screenshots). A smaller start would be active state only (32).
4. **`maxPrompts` as a product feature.** It is needed for tests; it could also be exposed to hosts as a "short game" option.
5. **Accessibility scan.** Include from the start as warnings, or defer.
