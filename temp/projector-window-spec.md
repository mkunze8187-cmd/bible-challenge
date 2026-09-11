# Projector Mode as a Separate Display Window — Spec

## Status

Not started. This is a planning artifact only — captured so the feature can be picked
up with `EnterPlanMode` later, informed by the facts below rather than re-derived from
scratch. Do not implement directly from this document; it names open questions that
still need answers, not a finished design.

## Origin / what's being replaced

Today, "Projector" is a `DisplayMode` (`"normal" | "projector"`, `src/renderer/App.tsx:152`)
toggled from Settings (`DISPLAY_MODES`, `App.tsx:312-315`) or a header button
(`App.tsx:3126-3127`). It applies a single CSS class, `app-display-projector`, to the
existing single window (`src/renderer/styles.css:2439-2495` and following) — it enlarges
text, cards, and score rows, but it is the *same window* the host uses to run the game,
just restyled. There is no second window, no external-display targeting, and no
separation between what the host sees and what the audience sees.

The user wants: a genuinely separate, full-screen window that mirrors only the "stage"
(game board/play area, scoreboard, and study notes) to a chosen external display/TV/
projector, while the main window keeps showing everything it shows today — including
host controls — exactly as now. This is a real architecture change (a second Electron
`BrowserWindow`, likely its own renderer process, plus a way to pick which physical
display it opens on and keep it in sync with live game state) not a bigger version of
the existing CSS toggle.

## What "the stage" is, concretely (from the current codebase)

These are today's three pieces the user named, with their current implementation:

1. **Game board / play area**: one `<section className="panel panel-stage">` per game,
   rendered by a per-game `<...View>` component (e.g. `MissingWordView`, `VerseScrambleView`,
   `BibleAnagramsView` — 28 such components in `App.tsx`, each taking `state` +
   timer props + callback props). This is the biggest and most state-heavy piece: it needs
   the full `sessionState` (typed as the `SessionState` union from `src/lib/gameEngine.ts`)
   plus timer state (`timerEnabled`, `timeRemaining`, `activeTimerSeconds`) to render.
2. **Scoreboard**: `<section className="panel score-panel">` (`App.tsx:4193` and following)
   — renders standings from `getStandings(sessionState)` (`src/lib/gameEngine.ts`).
3. **Study notes**: a modal (`App.tsx:4305-4335`) shown when `shouldShowStudyNote` is
   true, driven by `getStudyNoteContent(sessionState)` (`App.tsx:882`) and the
   `showStudyNotes`/`dismissedStudyNoteKey` state.

Explicitly NOT in scope for the projector window, based on the user's own framing
("while the main window still displays everything as it does now"):
- Host Controls modal (`App.tsx:4244-4252` and following) — undo, manual scoring, etc.
- Settings (all tabs)
- The top bar / setup screens (game picker, player/team setup) — presumably the
  projector window only matters once a session is `"in-progress"`, though this needs
  confirming: should the projector window show anything before a game starts (e.g. an
  idle/waiting screen), or only appear once `sessionState.status === "in-progress"`?

## Confirmed absence of existing infrastructure

- `electron/main.js` has exactly one `createWindow()` call site and no `require("electron").screen`
  usage anywhere — there is no multi-display code today, and no display-picker UI anywhere
  in the renderer.
- All game/scoreboard/study-note state lives in one big component's closure in
  `App.tsx` (a single `function App()` with ~100 `useState` calls) — there is no existing
  cross-window or cross-process state-sharing mechanism in this codebase to reuse. The
  closest analog is the admin-console project's approach to sharing `app-settings.json`
  on disk between two *separate Electron apps* — not applicable here, since this is one
  app needing two windows of the *same* live, fast-changing session state, not
  occasional shared settings.
- Contrast with the existing single-window CSS toggle: that approach requires zero
  state-sharing design because it's the same DOM tree. A second window fundamentally
  cannot avoid this problem — the two windows need to see the same `sessionState` in
  sync, and Electron `BrowserWindow`s are separate renderer processes by default.

## Design questions to resolve before implementation (not yet answered)

1. **Display selection.** How does the host pick which physical display/TV/projector the
   stage window opens on?
   - Electron's `screen` module (`screen.getAllDisplays()`) is the natural mechanism —
     needs a small picker UI (e.g. in Settings or Host Controls) listing available
     displays by resolution/position, with a "Send to Display" action.
   - What happens if only one display is connected (laptop-only use)? Should the
     feature be hidden/disabled, or allow opening a second window on the same display
     (e.g. for testing, or a second monitor arrangement electron-screen doesn't cleanly
     distinguish)?
   - Should the app remember the chosen display across sessions (persisted in
     `PersistedAppSettings`), and what should happen if that display is no longer
     connected next launch?

2. **State synchronization between the two windows.** The main candidates, with
   tradeoffs to weigh when this is designed for real:
   - **IPC broadcast from main process**: main window's renderer sends state updates to
     the main process (`ipcRenderer.send`), which relays to the stage window
     (`stageWindow.webContents.send`). Explicit, debuggable, matches this app's existing
     IPC-heavy patterns (`electron/preload.js`'s `contextBridge` usage) — but requires a
     new IPC channel and hooking every state-changing action to also push an update.
   - **Shared renderer state via a second `<App>`-like tree reading the same React
     state**: not straightforward in Electron — separate `BrowserWindow`s are separate
     renderer processes with separate JS heaps; this isn't like opening a second browser
     tab against the same page. Would likely still need IPC or some serialization layer
     underneath, so this isn't really a distinct option from the one above — flag this
     if it comes up as a suggestion during design, since it's a common but mistaken
     assumption about how multi-window Electron apps share state.
   - **`BroadcastChannel` / `localStorage` events**: these work between same-origin
     documents but Electron `BrowserWindow`s loading the same origin (e.g. both loading
     `dist/index.html` with different query params/hash routes) *can* share
     `localStorage`/`BroadcastChannel` in the same way same-origin browser tabs do —
     worth evaluating as a lighter-weight alternative to hand-rolled IPC relaying, since
     it avoids threading new preload/IPC surface through `electron/main.js` for every
     state change. Needs verification this actually works reliably across Electron
     `BrowserWindow`s in this Electron version (44.x) before relying on it.
   - Whichever mechanism: does the stage window get the *entire* `sessionState` (simplest,
     some redundant data crossing the wire) or a deliberately reduced projection (only
     the fields the three stage pieces actually read)? A reduced projection is more work
     to define and keep in sync as games are added, but avoids ever leaking host-only
     data (e.g. anything from Host Controls) to the audience-facing window.

3. **Rendering approach for the stage window**: does it load the *same* `index.html`/
   `App.tsx` bundle in a special "stage-only" mode (e.g. a query param like
   `?mode=stage` that renders only the three stage pieces, reusing the exact same
   per-game `<...View>` components so game-board rendering never has to be
   duplicated/reimplemented), or a separate, smaller renderer entry point/bundle
   dedicated to the stage view? Reusing the same `<...View>` components via a mode flag
   is almost certainly right, given there are 28 of them and they're the single largest
   piece of `App.tsx` — a parallel implementation would be a maintenance trap.

4. **Window lifecycle**: When does the stage window open/close?
   - On demand via a button (matching how the current projector toggle is a manual
     action), or automatically once a display is configured and a session starts?
   - What happens if the host closes the stage window mid-session — does the main
     window offer to reopen it, or is it a manual re-trigger?
   - What happens on app quit — does closing the main window also close the stage
     window (probably yes, to avoid an orphaned window), and vice versa?

5. **Full-screen behavior**: `BrowserWindow` supports `fullscreen: true` and
   `kiosk: true` — which fits a "TV/projector output" use case better? Kiosk mode
   suppresses OS chrome/alt-tab more aggressively, which may or may not be wanted for a
   home/family game night (accidentally trapping the display in kiosk mode with no
   visible way out is a real usability risk to design around, e.g. always give the main
   window an explicit "Close Stage Display" control rather than relying on the audience
   or a stray keypress to escape kiosk mode).

6. **Relationship to the existing CSS projector mode.** Does the new separate-window
   feature *replace* the current `DisplayMode`/`app-display-projector` CSS toggle
   entirely, or do both coexist (e.g. the main window can still be manually set to the
   enlarged "projector" CSS style *independent* of whether a second stage window is
   open, for the case where there's genuinely only one display and the host wants the
   single window enlarged)? This needs an explicit decision — recommend resolving it as
   one of the first questions in the actual planning pass, since it changes whether this
   is purely additive or also a deprecation of existing UI/settings surface
   (`DISPLAY_MODES`, the Settings appearance tab's display-mode toggle, `cleanDisplayMode`).

## Suggested shape of the eventual plan (once the above is answered)

- `electron/main.js`: a `createStageWindow(displayId)` function (mirroring the existing
  `createWindow()`), Electron `screen` module usage for display enumeration, IPC
  handlers for "list displays" / "open stage window on display X" / "close stage window".
- `electron/preload.js`: expose the above via `window.desktopHost`, plus whatever
  state-relay channel is chosen in question 2.
- `src/renderer/`: a stage-only render mode (question 3) reusing the existing per-game
  `<...View>` components, `<section className="panel score-panel">`, and the study-note
  modal's content (not necessarily its exact modal chrome, since a projector display has
  no "dismiss" affordance the way a host-operated modal does — this needs its own small
  design decision about how study notes should present with no click-to-dismiss).
- Settings/Host Controls: a display picker UI, an open/close stage window control,
  and (per question 6) a decision about the existing `DisplayMode` toggle's fate.

## Explicitly out of scope for this spec

- Any actual code changes — this document is discovery only.
- A final answer to any of the six numbered questions above — those are exactly what
  the future planning pass should resolve, ideally by asking the user directly via
  `AskUserQuestion` the way the admin-console and 5-games work in this project's history
  did for comparably-sized architecture decisions.
