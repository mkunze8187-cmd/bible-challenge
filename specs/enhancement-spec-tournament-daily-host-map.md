# Bible Challenge Enhancement Spec: Tournament, Daily Challenge, Host Mode, and Bible Map Challenge

## Purpose

This spec defines four additions to Bible Challenge and the Bible Challenge Admin Console:

1. Tournament / Season Mode
2. Daily Challenge Pack
3. Host Mode / Game Master Controls
4. Bible Map Challenge

The designs intentionally reuse the current app architecture: typed game IDs, schema-validated content, custom content packs, event scoring, timers, projector mode, stats, ratings, and admin-managed settings.

## Shared Product Goals

- Make the app easier to run in live group settings.
- Give players reasons to return outside formal events.
- Let hosts curate structured experiences without hand-managing scores or round order.
- Keep projector display clean while giving hosts richer controls privately.
- Preserve the existing JSON-content-pack model and admin validation workflow.

## Shared Non-Goals

- No cloud account system is required for the first implementation.
- No online multiplayer dependency is required for these four features.
- No licensed Bible text expansion is required beyond current content rules.
- No rewrite of existing game engines is required. Host Mode does refactor each game's submit function into grade and apply-outcome parts, without changing game rules.

---

# 1. Tournament / Season Mode

## Summary

Tournament / Season Mode lets a host define a multi-game competition that spans several challenges, sessions, or weeks. It builds on existing event scoring but adds structure: scheduled rounds, standings, stage progress, champion determination, and recap screens.

## Target Users

- Sunday school teachers
- Youth group leaders
- Family game-night hosts
- Bible study facilitators
- Event hosts using projector mode

## User Stories

- As a host, I can create a tournament with a name, player/team roster, selected games, scoring rules, and optional schedule.
- As a host, I can start the next scheduled match without reconfiguring players each time.
- As a host, I can pause a tournament and resume it later.
- As a player, I can see current standings after each game.
- As a host, I can export or reset tournament results from the admin console.

## Core Concepts

### Tournament

A saved competition container.

Suggested fields:

```ts
interface TournamentDefinition {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  participantMode: "individual" | "teams";
  participants: TournamentParticipant[];
  stages: TournamentStage[];
  scoringProfile: TournamentScoringProfile;
  status: "draft" | "active" | "completed" | "archived";
}
```

### Tournament Stage

A unit of play, usually one selected game/session.

```ts
interface TournamentStage {
  id: string;
  title: string;
  gameId: GameId;
  sessionId?: string;
  contentSource?: "built-in" | "custom" | "all";
  difficulty?: DifficultyFilter;
  timerPreset?: TimerPreset;
  status: "pending" | "active" | "completed" | "skipped";
  completedAt?: string;
}
```

### Tournament Result

Persistent result history for each stage.

```ts
interface TournamentStageResult {
  tournamentId: string;
  stageId: string;
  completedAt: string;
  standings: Array<{
    participantId: string;
    score: number;
    rank: number;
    roundWins: number;
    incorrectAttempts: number;
  }>;
}
```

## UX Flow

### Main App

1. Home screen adds a tournament entry point near Event Mode.
2. Host chooses existing tournament or creates a quick tournament.
3. Tournament lobby shows:
   - Tournament name
   - Participants/teams
   - Stage list
   - Current standings
   - Start Next Stage button
4. When a stage starts, it launches the existing game session flow with tournament context attached.
5. After each stage, the result screen posts standings back to the tournament.
6. Tournament recap shows champion, final standings, stage winners, and highlights.

### Admin Console

Add a Tournaments tab or an Event subtab:

- Create/edit tournament definitions
- Reorder stages
- Duplicate tournament templates
- Export results JSON/CSV
- Clear/archive completed tournaments
- View per-stage breakdowns

## Scoring Options

MVP scoring should support:

- Raw score accumulation
- Placement points, e.g. 1st = 10, 2nd = 7, 3rd = 5
- Hybrid: raw score plus stage win bonus
- Tie handling by existing tie-breakers: total score, round wins, fewer incorrect attempts

Suggested profile:

```ts
interface TournamentScoringProfile {
  mode: "raw-total" | "placement-points" | "hybrid";
  stageWinBonus: number;
  placementPoints: number[];
  dropLowestStageCount: number;
}
```

For MVP, implement `raw-total` and optional `stageWinBonus` first.

## Data Persistence

Store tournament definitions and results alongside app settings in Electron userData, likely as separate files:

- `tournaments.json`
- `tournament-results.json`

This avoids inflating `app-settings.json` and makes export/import simpler.

## Integration Points

- Reuse `GameId`, `ParticipantMode`, `TeamSetup`, `DifficultyFilter`, `SessionConfig`, and standings logic.
- Reuse existing event score display where possible.
- Projector mode should show tournament context only when useful: tournament name, current stage, standings after stage completion.

## Acceptance Criteria

- Host can create a tournament with at least two stages.
- Host can start the next pending stage.
- Stage completion updates cumulative standings.
- Tournament can be closed and reopened without losing progress.
- Admin console can view and export tournament results.
- Existing non-tournament gameplay remains unchanged.

## Suggested Implementation Phases

### Phase 1

- Add tournament data types and persistence IPC.
- Add simple tournament lobby.
- Support sequential stages and raw score accumulation.

### Phase 2

- Add admin editor and result export.
- Add stage reordering, duplicate tournament, and archive.

### Phase 3

- Add placement scoring, stage win bonuses, and richer recap screens.

---

# 2. Daily Challenge Pack

## Summary

Daily Challenge gives players a short curated set of rounds each day. It should feel lightweight: open the app, play a quick mix, compare score, and come back tomorrow.

## Target Users

- Solo players
- Families
- Teachers who want warm-up activities
- Returning casual users

## User Stories

- As a player, I can play today’s challenge without configuring a full event.
- As a host, I can use Daily Challenge as a quick class opener.
- As a player, I can see whether I completed today’s challenge.
- As a player, I can revisit recent previous daily challenges.
- As an admin, I can configure which game types are eligible.

## Challenge Generation

The daily pack should be deterministic by date so every device gets the same selection from the same installed content.

Seed format:

```txt
YYYY-MM-DD + appVersion + optionalDailySalt
```

Suggested MVP generation:

- Pick 3 games from an eligible pool.
- Pick 1 session or 1-3 rounds per game depending on game type.
- Prefer short games for default daily packs.
- Exclude games that require heavy setup unless configured.

Suggested default eligible games:

- Complete the Verse
- Who Said It?
- Before Or After
- Missing Word
- Psalm Theme
- Wisdom Match
- Bible Anagrams
- Reference Rush
- Two Truths and a Lie

## Data Types

```ts
interface DailyChallengeDefinition {
  date: string;
  seed: string;
  title: string;
  entries: DailyChallengeEntry[];
}

interface DailyChallengeEntry {
  id: string;
  gameId: GameId;
  sessionId?: string;
  roundIds?: string[];
  difficulty?: DifficultyFilter;
}

interface DailyChallengeResult {
  date: string;
  participantMode: ParticipantMode;
  participantResults: Array<{
    participantName: string;
    totalScore: number;
    completedEntries: number;
    completedAt: string;
  }>;
}
```

## UX Flow

### Main App

1. Home screen adds Today’s Challenge button.
2. Daily Challenge lobby shows:
   - Date
   - Selected games
   - Estimated time
   - Best score for today, if any
3. Player starts the challenge.
4. App runs entries sequentially.
5. Final recap shows score, accuracy, missed prompts, and previous best.

### Admin Console

Settings area adds Daily Challenge controls:

- Enable/disable Daily Challenge
- Eligible games
- Difficulty mix
- Number of entries
- Include custom content: off/custom-only/all
- Daily salt field for churches/classes that want a distinct local daily rotation

## Persistence

Store daily results in app userData:

- `daily-challenge-results.json`

Only store generated definitions if needed for audit/debug. Since generation is deterministic, results can store the date and seed.

## Stats Integration

Daily plays should increment existing game stats, plus daily-specific stats:

- Daily completions
- Best daily score
- Current streak
- Longest streak
- Last completed date

## Acceptance Criteria

- Today’s Challenge can be started from the main app.
- The same date produces the same generated challenge for the same installed content/settings.
- Completing the challenge saves a result.
- User can see today’s result and current streak.
- Admin can configure eligible game types.

## Suggested Implementation Phases

### Phase 1

- Deterministic generator.
- Main-app daily lobby.
- Sequential play through 3 entries.
- Save completion result.

### Phase 2

- Streaks, history, admin configuration.
- Include/exclude custom content.

### Phase 3

- Themed daily rotations: Prophecy Monday, Wisdom Wednesday, Gospel Friday, etc.

---

# 3. Host Mode / Game Master Controls

## Summary

Host Mode gives the facilitator private controls while the projector stays focused on the players. It should make live sessions smoother by adding override tools, timer tools, reveal controls, scoring adjustments, and an undo safety net.

It also lets the host decide **who answers** and **judge spoken answers**, independent of turn order. That supports verbal buzz-in play (the host picks whoever raised a hand first) and is a prerequisite for `phone-buzzer-spec.md`.

## Target Users

- Event hosts
- Teachers
- Church volunteers
- Family game-night facilitators

## User Stories

- As a host, I can run the game from my laptop while the projector shows only the player-facing board.
- As a host, I can pause, add time, subtract time, or disable the timer mid-round.
- As a host, I can reveal the answer when discussion has run its course.
- As a host, I can correct a score if I clicked the wrong button.
- As a host, I can undo the last action.
- As a host, I can privately see answer keys and teaching notes.
- As a host, I can pick which player or team answers the current prompt, regardless of whose turn it is.
- As a host, I can mark a spoken answer correct or incorrect, and the right participant gets the right points.
- As a host, I can add or remove points for a specific participant, not only the one whose turn it is.

## Current Code Findings

Line numbers are as of this writing.

- **Partial Host Controls exist.** A Host Controls modal (`src/renderer/App.tsx`, around line 4591) already has Pause Timer, Add/Subtract Point, Undo Last Score, Reveal Answer, Skip / Pass, Restart, End Game, and Set Score.
- **No host judging action.** Reveal Answer and Skip both call `forceResolveForHost` (`App.tsx:1326`) and award no points. `mark-correct` and `set-current-actor` do not exist in `src`.
- **Score buttons target the turn holder.** `updateCurrentScore` (`App.tsx:2753`) credits `getCurrentParticipantId()` (`App.tsx:603`), which is derived from turn order.
- **Accepting an answer re-grades it.** Engine submit functions (for example `submitNameThatBookGuess`) grade guesses themselves with `isCorrectGuess` (`src/lib/gameEngine.ts:1031`). Pushing a host-accepted misspelling through them marks it wrong.
- **Timer keys include turn state.** `getActiveGuessKey` (`App.tsx:414`) includes `turnIndex` and, for board games, `stealCursor`. Changing who answers restarts the timer, a problem already noted in the word-ladder comment at `App.tsx:457`.
- **No stable prompt identity.** Nothing identifies "this question" independently of whose turn it is, and restarting a challenge reuses the same `roundIndex` values.
- **Single-level undo.** `lastUndoState` (`App.tsx:1826`) holds one previous state.

## UI Model

The app currently has a main window and projector window. Host Mode should treat the main window as the host console when projector mode is active.

### Host Console Regions

- Session overview
- Current prompt metadata
- Private answer/teaching note panel
- Timer controls
- Answering participant controls: Select Answering Participant, Mark Correct (showing points), Mark Incorrect
- Override actions
- Scoreboard editor with a participant selector
- Activity log with undo

### Projector Window

Should not display host-only information, including:

- Correct answer before reveal
- Teaching notes unless explicitly revealed
- Admin controls
- Manual score-edit UI
- Debug/status messages

## Host Actions

MVP actions:

```ts
type HostAction =
  | { type: "pause-timer" }
  | { type: "resume-timer" }
  | { type: "add-time"; seconds: number }
  | { type: "subtract-time"; seconds: number }
  | { type: "reveal-answer" }
  | { type: "set-current-actor"; participantId: string }
  | { type: "mark-correct"; participantId: string; points?: number; answerText?: string }
  | { type: "mark-incorrect"; participantId: string; answerText?: string }
  | { type: "skip-round" }
  | { type: "undo-last-action" }
  | { type: "adjust-score"; participantId: string; delta: number; reason: string };
```

## Prompt Identity

### Session Instance ID

Add `sessionInstanceId: string` to `SessionBase`, generated when a session starts or restarts. Restarting a challenge produces a new ID.

### `getPromptId`

Add a pure function to `src/lib/gameEngine.ts`:

```ts
function getPromptId(state: SessionState): string | null;
```

Rules:

- Returns `null` when no question is active (board selection screen, resolved prompt, completed session).
- Includes `sessionInstanceId` and the question identity: `roundIndex` for round-based games, `cardId` for `five-guesses` and `initials`, and `matchedPairIds.length` for `prophecy-match` and `parable-match`.
- Does **not** include `turnIndex`, `stealCursor`, phase changes within the same question, or revealed clue counts. Changing who answers does not change the prompt.

Used by undo history, and by Phone Mode to reject stale phone actions.

## Answering Participant and Judging

Add pure engine functions that return `ActionResult`, like existing actions:

```ts
function setCurrentActor(state: SessionState, participantId: string): ActionResult;

function markCorrectForHost(
  state: SessionState,
  participantId: string,
  options?: { points?: number; answerText?: string }
): ActionResult;

function markIncorrectForHost(
  state: SessionState,
  participantId: string,
  options?: { answerText?: string }
): ActionResult;

function getHostAwardPoints(state: SessionState, participantId: string): number | null;
```

### `setCurrentActor`

- Makes `participantId` the participant whose answer the host is judging.
- For turn-based games, sets `turnIndex` to that participant.
- For primary/steal games, behavior follows the game's buzz turn policy.
- Adds an activity log entry, for example "Host selected Team Red to answer."
- Does not consume a turn or change scores.

### `markCorrectForHost`

- Awards the points the game would award for a correct answer in the current prompt state, using existing scoring functions (for example `scoreInitials(revealedClues)` for `initials`). `getHostAwardPoints` returns that value so the host UI can show it before confirming.
- `options.points` overrides the value when the host chooses a different amount.
- Updates the same stats as a correct engine submission for that game (`roundWins`, game-specific counters).
- Resolves the prompt the same way a correct submission does, including `winnerParticipantId` and the resolved message.
- Logs the action, including `answerText` when provided, with reason `host-marked-correct` (see Reveal Behavior).

### `markIncorrectForHost`

- Applies the same consequences as an incorrect engine submission for that game: `incorrectAttempts`, adding to `attemptedParticipantIds` where the prompt has it, revealing the next clue where the game does that, moving to steal where the game does that.
- Resolves the prompt unsolved only when the game's own rules would (for example, no participants left to attempt).
- Logs the action.

### Implementation Approach

Refactor each game's submit function into two parts:

1. **Grade:** decide whether the answer is correct.
2. **Apply outcome:** apply correct or incorrect consequences for a given actor.

Existing submit functions become grade + apply outcome. Host actions call apply outcome directly. This guarantees host-judged and engine-graded answers score identically. The grade half is also reused by Phone Mode for answer suggestions.

## Buzz Turn Policy

Each game declares how an out-of-turn answerer (from verbal buzz-in or phone buzzers) maps onto its turn model. Stored alongside `GAME_LIBRARY`.

```ts
type BuzzTurnPolicy =
  | "buzz-replaces-turn"
  | "buzz-orders-steals"
  | "buzz-to-solve"
  | "turn-based-only"
  | "not-supported";
```

- `buzz-replaces-turn`: whoever buzzes answers the prompt. Turn rotation is ignored while buzzing is in use. An incorrect answer excludes that participant from buzzing again on this prompt.
- `buzz-orders-steals`: the primary attempt stays turn-based. When the prompt moves to steal, buzz order replaces the fixed steal order.
- `buzz-to-solve`: turn-based incremental play continues (for example, letter guesses). A buzz lets a participant attempt a full solve out of turn.
- `turn-based-only`: the game's rotation is the game. Buzzing is off by default; the host can enable it.
- `not-supported`: buzzing is not offered.

Proposed mapping (verify each game's rules during implementation):

| Policy | Games |
|---|---|
| `buzz-orders-steals` | `five-guesses`, `initials`, `name-that-book` |
| `buzz-replaces-turn` | `before-or-after`, `reference-rush`, `chapter-finder`, `who-said-it`, `missing-word`, `odd-one-out`, `messiah-prophecy`, `fulfillment-finder`, `complete-the-verse`, `wisdom-match`, `psalm-theme`, `psalm-reference-finder`, `two-truths-and-a-lie`, `prophecy-clue-ladder`, `bible-anagrams`, `bible-timeline`, `verse-scramble`, `bible-books-relay`, `bible-connections`, `prophecy-match`, `parable-match`, `prophecy-categories`, `proverb-categories` |
| `buzz-to-solve` | `scripture-puzzles`, `bible-cryptogram` |
| `turn-based-only` | `word-ladder`, `genealogy`, `relay-verse-build` |
| `not-supported` | `verse-typing-race` |

For board-manipulation games in the `buzz-replaces-turn` row (timeline, scramble, relay, connections, match, categories), the answerer tells the host their answer and the host operates the board.

`verse-typing-race` scores words per minute from the host keyboard, so out-of-turn answering has no meaning there.

## Timer Behavior When the Answerer Changes

- Add an answerer-aware timer key so `setCurrentActor` does **not** restart the main prompt timer.
- Setting `answererTimerBehavior`:
  - `pause`: the prompt timer pauses when an answerer is selected out of turn, and resumes when answering reopens.
  - `answer-clock`: the prompt timer pauses and a short answer clock (`answerClockSeconds`) runs for the answerer.
  - `continue`: the prompt timer keeps running.

## Engine Support

Replace the single `lastUndoState` with a bounded history stack in the main app state:

```ts
interface SessionHistoryEntry {
  id: string;
  createdAt: string;
  label: string;
  promptId: string | null;
  state: SessionState;
  buzzerSnapshot?: unknown; // opaque, supplied by Phone Mode when active
}
```

Before mutating actions, push the previous state. Keep the last 10-25 entries. Exclude transient UI-only changes if desired.

When Phone Mode is active, undoing a host action also restores the buzzer state for that prompt. For example, undoing a mistaken Mark Correct for Team Red returns to the locked state with Red as the buzz winner.

## Reveal Behavior

Each game type needs a standard `revealAnswer` behavior. Some already have pass/all-missed resolution. Host reveal should:

- Resolve the current prompt.
- Mark the prompt as host-revealed.
- Award no points by default.
- Preserve the correct answer/explanation display.
- Log the action.

Suggested generic field:

```ts
interface HostResolutionMeta {
  resolvedByHost: boolean;
  hostResolutionReason?: "manual-reveal" | "skip" | "score-override" | "host-marked-correct";
}
```

If changing every state shape is too invasive, store host-resolution metadata in an app-level map keyed by `promptId`.

## Score Adjustment

Score adjustment should be explicit and auditable.

```ts
interface ScoreAdjustment {
  id: string;
  createdAt: string;
  participantId: string;
  delta: number;
  reason: string;
}
```

- Add Point, Subtract Point, and Set Score get a participant selector.
- The selector defaults to the current answerer (the buzz winner, when Phone Mode is active) instead of always using `getCurrentParticipantId()`.
- The activity log shows score changes.

## Admin Settings

Admin console settings:

- Enable host mode controls
- Require admin PIN for score adjustment
- Allow answer reveal from host console
- Default timer override increments, e.g. 15 seconds / 30 seconds / 60 seconds
- Keep undo depth
- Default `answererTimerBehavior` and `answerClockSeconds`

## Acceptance Criteria

- Projector mode remains clean and player-facing.
- Host can pause/resume/add/subtract timer time.
- Host can reveal/skip the current prompt.
- Host can adjust scores for a chosen participant with an activity log entry.
- Host can undo the last meaningful gameplay action, including Mark Correct and Mark Incorrect.
- Host can select any participant to answer the current prompt in every game except `turn-based-only` and `not-supported` games.
- Mark Correct awards the same points and stats a correct engine submission would in the same prompt state.
- Mark Incorrect applies the same consequences an incorrect engine submission would.
- `getPromptId` is stable across answerer changes and incorrect attempts, and changes when the prompt resolves or the session restarts.
- Changing the answerer does not restart the prompt timer.
- Existing single-window use remains simple and not cluttered.
- Existing turn-based play is unchanged when the new actions are not used.

## Tests

- Per game: `markCorrectForHost` and a correct engine submission produce equal scores and stats from the same starting state.
- Per game: `markIncorrectForHost` and an incorrect engine submission produce equal state.
- `getPromptId` stays stable after set-current-actor, mark-incorrect, or revealing a clue, and changes after resolving and continuing.
- `buzz-orders-steals`: steal order follows the provided buzz order.

## Suggested Implementation Phases

### Phase 1

- Add host-control panel when projector mode is active.
- Add timer controls and answer reveal.
- Add `sessionInstanceId` and `getPromptId`.
- Grade / apply-outcome refactor for `buzz-replaces-turn` choice and text games.
- Add Select Answering Participant, Mark Correct, and Mark Incorrect for those games.
- Add participant selector to score buttons.

### Phase 2

- Add undo stack with `promptId`.
- Add score adjustment with audit log.
- Extend host judging to remaining games, including `buzz-orders-steals` and `buzz-to-solve`.
- Add `BuzzTurnPolicy` metadata.
- Add answerer-aware timer key and `answererTimerBehavior`.

### Phase 3

- Add per-game host hints, private teaching notes, and admin permission settings.

---

# 4. Bible Map Challenge

## Summary

Bible Map Challenge asks players to identify, place, connect, or sequence biblical locations and journeys. It adds a spatial learning mode distinct from the current word, verse, category, and timeline games.

## Game Types

Bible Map Challenge can support multiple round mechanics under one game ID.

### Locate

Prompt gives a person/event/clue. Player clicks the correct place on a map.

Example: “Where did Jonah try to flee?” Answer: Tarshish.

### Route

Player orders or connects locations in a journey.

Example: Paul’s first missionary journey.

### Region Sort

Player sorts places into regions.

Example: Galilee, Judea, Samaria, Egypt, Mesopotamia.

### Before / After Map

Player selects which mapped event happened first, with geographic display.

MVP should implement Locate first.

## Data Type

```ts
export type BibleMapRoundMode = "locate" | "route" | "region-sort";

export interface BibleMapLocation {
  id: string;
  name: string;
  aliases: string[];
  region: string;
  x: number;
  y: number;
  scriptureReference?: string;
}

export interface BibleMapRound {
  id: string;
  mode: BibleMapRoundMode;
  title: string;
  prompt: string;
  answerLocationIds: string[];
  distractorLocationIds: string[];
  routeLocationIds?: string[];
  regionCategories?: string[];
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  teachingNote: string;
}

export type BibleMapPack = SessionPackBase<BibleMapRound>;
```

## Map Asset Strategy

MVP should use a local static map asset with normalized coordinates.

- Store map image under `src/renderer/assets/maps/`.
- Store locations as normalized `x`/`y` percentages, not pixels.
- Render pins over the image using absolute positioning.
- This keeps the app offline-friendly and simple to package.

Suggested map layers:

- Ancient Near East
- Israel / Judah / Galilee detail map
- Mediterranean journeys map

MVP can ship one general map first.

## Gameplay Flow: Locate Mode

1. App displays prompt and map.
2. Candidate pins are visible, or hidden depending on difficulty.
3. Player clicks a location/pin.
4. Correct answer scores points.
5. Incorrect answer either passes turn or allows another participant.
6. Resolve screen shows correct location, reference, and teaching note.

## Difficulty Rules

- Easy: show named candidate pins.
- Medium: show unlabeled candidate pins.
- Hard: player clicks map area without candidate labels, with distance tolerance.

MVP should implement Easy and Medium only.

## Scoring

Suggested scoring:

- Easy correct: 3 points
- Medium correct: 5 points
- Hard correct: 7 points
- Optional speed bonus if timer is enabled

## Admin Console Support

- Add Bible Map Challenge to `games.json`.
- Add schema form fields for locations/rounds.
- Add a map-coordinate picker later: admin clicks on a map to set `x`/`y`.

For MVP, authored JSON coordinates are acceptable.

## Acceptance Criteria

- Bible Map Challenge appears in the game library.
- Built-in map content validates through schema checks.
- Player can complete Locate rounds by selecting a map pin.
- Projector mode renders the map and result clearly.
- Admin console can create/edit Bible Map custom rounds using schema forms.

## Suggested Implementation Phases

### Phase 1

- Add `bible-map-challenge` GameId, schema, content pack, loader entry, engine state, renderer branch, and tests.
- Implement Locate mode with named/unlabeled pins.

### Phase 2

- Add route mode for journeys.
- Add map-coordinate picker in admin.

### Phase 3

- Add multiple map layers and zoom/pan.
- Add region-sort mode.

---

# Cross-Feature Notes

## Suggested Build Order

1. Host Mode / Game Master Controls
2. Tournament / Season Mode
3. Daily Challenge Pack
4. Bible Map Challenge

Host Mode has the highest live-event value and supports the other modes. It is also a prerequisite for Phone Mode (`phone-buzzer-spec.md`): phone buzzers need Select Answering Participant, Mark Correct, Mark Incorrect, `getPromptId`, and the buzz turn policy. Tournament Mode builds naturally on event scoring. Daily Challenge is smaller but needs careful session orchestration. Bible Map Challenge is the largest new game engine surface.

## Testing Strategy

- Unit tests for tournament scoring and daily challenge deterministic generation.
- Engine tests for host reveal/skip/score adjustment.
- Engine parity tests: host Mark Correct / Mark Incorrect match engine-graded submissions for every game.
- Renderer smoke tests for tournament lobby, daily lobby, and host controls.
- Data validation tests for Bible Map Challenge schema/content.
- Manual projector test for host/private information separation.

## Risks

- Tournament state can become confusing if a session is abandoned mid-stage.
- Host score overrides need a clear audit trail.
- Daily Challenge deterministic generation must handle missing/custom content gracefully.
- Map challenge accuracy depends on good visual assets and coordinate QA.

## MVP Recommendation

The highest-value MVP bundle is:

- Host timer controls
- Host reveal/skip
- Tournament lobby with raw cumulative scoring
- Daily Challenge with 3 deterministic entries
- Bible Map Locate mode with one map asset and 20-30 starter rounds
