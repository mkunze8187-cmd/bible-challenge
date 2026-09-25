# Agon Tournament, Event Championship & Persistent Session Specification

## 1. Purpose
Agon supports family/church competition that may run in one sitting or across multiple gatherings. This specification defines:

- platform-wide maximum of **4 competing teams**
- per-game participant capability declarations
- automatic tournament orchestration for games that support fewer simultaneous teams than are participating in an Event/session
- five tournament formats
- normal game/challenge scoring throughout tournaments plus configurable final placement bonuses
- optional Event Championship format with one or more Round-Robin qualifying tournaments feeding a final seeded Knockout Championship
- durable Game Session and Event persistence so competition can be closed and resumed days/weeks later
- authoritative recovery/idempotency rules

Tournament/event orchestration is shared platform infrastructure. Individual games declare capabilities; they do not implement their own bracket engines.

---

## 2. Team limit and participant capabilities

### Platform invariant
Agon supports a maximum of **4 competing teams** in an Event/session.

- `1..4` teams may exist according to selected game/event mode.
- individual games may declare a lower maximum
- no game may increase the platform maximum above 4
- team membership may contain multiple human controllers/players according to existing team/controller rules

Conceptual capability declaration:
```ts
type GameCompetitionCapabilities = {
  minTeams: number;
  maxSimultaneousTeams: 1 | 2 | 3 | 4;
  supportsSolo: boolean;
  supportsTournament: boolean;
  supportsTies: boolean;
  tournamentEligibleFormats?: TournamentFormat[];
  resultAdapter: GameTournamentResultAdapter;
};
```

Examples:
- Wayfinder: solo supported; max simultaneous competitors = 2; tournament eligible
- a four-team game may run all teams simultaneously and need no pairwise tournament merely because 4 teams are present

When an Event/session contains 3–4 teams and a selected game allows only 2 simultaneous teams, Agon offers/uses Tournament Mode according to configuration rather than attempting an invalid 3/4-team match.

With exactly 2 teams, a two-team game normally runs as a direct match; tournament mode may still be explicitly chosen where meaningful.

---

## 3. Competition hierarchy

```text
Persistent Event
  ├─ Teams / Event scoring ledger
  ├─ ordinary games/challenges (optional)
  ├─ Tournaments (optional)
  │    └─ Matches
  │         └─ Game Session
  └─ Event Championship (optional)
       ├─ Round-Robin Qualifier 1
       ├─ Round-Robin Qualifier 2 ... N
       ├─ Combined Qualifier Standings / Seeds
       └─ Knockout Championship
            ├─ semifinal/play-in round
            ├─ final
            └─ optional placement match
```

A Tournament organizes game results. A Game remains responsible for its normal rules and challenge points. An Event Championship organizes multiple tournament stages.

---

## 4. Tournament formats

Supported formats:

1. **Knockout / Single-Elimination**
2. **Double-Elimination**
3. **Round-Robin**
4. **Swiss-System**
5. **Round-Robin + Knockout**

Tournament generator must support 2–4 teams where the format is mathematically meaningful and validate unsupported combinations before start.

### 4.1 Knockout / Single-Elimination
One match loss eliminates a team from championship contention.

For 4 teams:
- semifinal A
- semifinal B
- championship
- optional third-place match

For 3 teams, support deterministic bye/seeding policy, e.g. seed #1 receives semifinal bye while #2/#3 play, or configured/randomized initial seeding when no prior seed exists.

For 2 teams, championship match directly.

Bracket is generated once and persisted. Resume/recovery must never rerandomize seeds/byes.

### 4.2 Double-Elimination
A team is eliminated after its second tournament loss.

Requirements:
- winners bracket
- lower/losers bracket
- authoritative loss count
- advancement mapping
- grand final behavior explicitly configured/documented
- support reset-final semantics if chosen (lower-bracket finalist defeating undefeated finalist may require a second final), or single championship final if Admin selects that rule before tournament start
- bracket visualization and persistence

Do not regenerate lower-bracket assignments after tournament begins.

### 4.3 Round-Robin
Every team plays every other team once by default.

Match counts:
- 2 teams: 1
- 3 teams: 3
- 4 teams: 6

Optional future configuration may allow multiple round-robin cycles, but initial release requires one cycle per tournament.

Standings track:
- matches played
- wins
- losses
- ties where game supports them
- points for/against or normalized point differential where valid
- configured tiebreak metadata

### 4.4 Swiss-System
No elimination during scheduled Swiss rounds. Teams are paired against teams with similar tournament records while avoiding repeat matchups where possible.

Because Agon caps teams at 4, Swiss is intentionally small-field but remains useful when fewer matches than full repeated round-robin behavior are desired or when an Event designer wants score-based re-pairing.

Requirements:
- configurable number of Swiss rounds within validated limits
- pair teams by current score/record
- avoid rematches when a valid non-rematch pairing exists
- deterministic bye handling for odd team count
- bye cannot be repeatedly assigned to the same team when an alternative exists
- persist pairing history
- standings/tiebreak rules declared before tournament begins

If constraints make a rematch unavoidable, choose deterministically and record the reason.

### 4.5 Round-Robin + Knockout
Two-stage tournament:

1. all teams complete Round-Robin stage
2. standings establish Knockout seeds
3. seeded Knockout determines tournament placement/champion

For 4 teams:
- 6 RR matches
- #1 vs #4 semifinal
- #2 vs #3 semifinal
- final
- optional third-place match

For 3 teams:
- 3 RR matches
- recommended default: #2 vs #3 play-in/semifinal; winner faces #1 in final

For 2 teams, configuration should normally use a direct series/Knockout rather than a redundant RR+Knockout unless explicitly allowed.

RR standings/seeding are frozen before knockout bracket generation. Knockout bracket is then persisted.

---

## 5. Seeding
Tournament seed sources may include:
- explicit Host/Admin seed
- prior Event Championship qualifier seed
- prior standings
- random draw when configured
- deterministic default ordering when no competitive seed exists

Random seeding uses persisted seed/RNG state so resume cannot reroll it.

Seed source and final initial seeds are auditable.

---

## 6. Tournament scoring model
Tournament play does **not replace normal Agon scoring**.

### 6.1 Normal Game/Challenge Points
Every underlying game awards points exactly according to its normal scoring rules. Those points are committed to the team's Event/session Agon score ledger even if the team loses the tournament match.

Example: Team A earns 700 Wayfinder/game points and Team B earns 500. Those normal points remain earned regardless of tournament advancement.

### 6.2 Match Result
Each completed tournament match produces a tournament result independent of raw Agon points:
- winner/loser, or tie when permitted
- game-specific tournament result metrics
- point differential or normalized metric where the tournament's configured tiebreaker uses it

A game's `resultAdapter` defines how its outcome maps to tournament result. Tournament engine must not infer winner merely from raw score unless that game declares raw score as its win condition.

### 6.3 Tournament Placement Bonus
When final tournament placement is authoritative, optionally award configured Agon bonus points exactly once.

Conceptual configuration:
```ts
placementBonus = {
  first: 1000,
  second: 600,
  third: 300,
  fourth: 100
}
```

Values are configurable; defaults may be supplied by Agon.

Overall Event Agon score includes normal game/challenge points plus any configured committed tournament/event bonuses.

### 6.4 Seeding points are not Agon points
Qualifier seeding points/standing scores used solely to seed a later championship are a separate ledger and do **not** automatically add to normal Agon score.

---

## 7. Tiebreakers
Tournament/Event configuration declares ordered tiebreakers before competition begins.

Supported inputs where meaningful:
- head-to-head result
- tournament wins/losses/ties
- normalized point differential
- points for/against
- strength-of-schedule/opponent record for Swiss
- qualifier finishes/seeding points
- configured tiebreak challenge/match

Do not use arbitrary hidden ordering to resolve a competitive tie. If all automatic tiebreakers remain tied, create/require the configured tiebreak match/challenge or permit co-placement where the format supports it.

Raw point differential should only compare games with compatible scoring scales; cross-game Event seeding should use normalized/placement-based values rather than blindly summing incompatible raw scores.

---

## 8. Event Championship
An Event may optionally enable `ChampionshipFormat`.

### 8.1 Qualifying stage
An Event Championship supports **one or more Round-Robin qualifying tournaments**.

Each qualifier independently configures:
- game/challenge
- participating Event teams (normally all)
- game configuration/difficulty
- RR match order
- standings/tiebreakers
- seeding-point schedule
- optional tournament placement Agon bonus (independent of seeding points)

Example:
```text
Qualifier 1: Wayfinder
Qualifier 2: Multitude
Qualifier 3: Unveiled
        ↓
combined qualifier seeding
        ↓
Knockout Championship
```

### 8.2 Combined qualifier seeding
Each qualifier produces placement-based **seeding points** or configured normalized seeding value.

Example for 4 teams:
- qualifier 1st = 4 seed pts
- 2nd = 3
- 3rd = 2
- 4th = 1

Across qualifiers, sum seeding points and apply configured Event Championship tiebreakers to produce seeds #1–#4.

Do not use raw game points across heterogeneous games as the default seeding method.

The combined qualifier standings are frozen before the championship bracket is generated.

### 8.3 Knockout Championship
Final championship is seeded from qualifiers.

For 4 teams default:
- #1 vs #4 semifinal
- #2 vs #3 semifinal
- winners → championship
- optional losers → third-place match

For 3 teams default:
- #1 receives championship-stage advantage/bye
- #2 vs #3 play-in/semifinal
- winner faces #1

### 8.4 Championship game assignment
Support both:

**Single-game championship**
- one selected game/challenge used for every knockout match/round

**Per-round game assignment**
- semifinal round game/challenge
- final round game/challenge
- optional third-place round game/challenge

Architecture should permit match-level override later, but initial Admin UX requires at least whole-championship and per-round selection.

Before championship begins, validate each selected game's competition capabilities against required match participant count.

### 8.5 Event Championship placement bonus
After final Event Championship placement, optionally award an additional configurable 1st–4th Agon bonus exactly once.

This is separate from:
- normal game points
- individual qualifier/tournament placement bonuses
- qualifier seeding points

The Event can therefore identify both an Event Champion and the cumulative Agon points leader if they differ.

---

## 9. Event model and persistence
Events are durable objects, not ephemeral browser sessions.

Conceptual lifecycle:
```text
DRAFT → ACTIVE ↔ PAUSED → COMPLETED → ARCHIVED
```

An Event may be saved/closed at any safe point and resumed at a later family/church gathering.

Persist at minimum:
- Event ID/name/schema version
- lifecycle state
- created/updated/last-played timestamps
- teams and stable team IDs
- team membership metadata as appropriate
- Event configuration
- cumulative Agon score ledger
- every score transaction/bonus transaction with idempotency key
- tournament definitions and immutable-start configuration snapshot
- brackets/pairings/byes/seeds
- standings/records/tiebreak data
- qualifier results and seeding ledger
- championship configuration/bracket
- completed/in-progress/upcoming match references
- match/game session history
- current/next actionable match
- audit/recovery metadata

### Multiple saved Events
Support multiple DRAFT/ACTIVE/PAUSED/COMPLETED/ARCHIVED Events. Completed historical Events remain reviewable and cannot accidentally resume competitive mutation without explicit reopen/clone policy.

### Team continuity
The competitive identity is the stable Event Team. Human attendance may change between gatherings without losing the team's score/record, subject to existing roster/controller rules.

---

## 10. Game Session persistence
Game Session persistence handles live/in-progress game recovery and is distinct from Event persistence.

A game participating in an Event/Tournament has a stable `GameSessionId`/`MatchId` and persistence contract.

Persist common envelope:
- session ID
- Event/tournament/match references
- game type/version/config snapshot
- team assignments
- lifecycle state
- score transactions committed so far
- game-specific serialized authoritative state/version
- timers/deadlines as required
- controller/host role mappings as appropriate
- recovery checkpoint/event log metadata

Each game supplies its game-specific state serializer/migrator sufficient to resume from supported recovery points.

### Recovery levels
At minimum support:
1. **between games/matches** — close Agon completely and later resume Event at next match
2. **between tournament stages** — resume qualifier/championship exactly
3. **in-progress game recovery** — after crash/restart restore supported authoritative game state without double scoring or rerolling random outcomes

A Host intentionally ending a gathering normally pauses the Event between matches; crash recovery may restore an in-progress Game Session.

---

## 11. Resume Event UX
Opening Agon should provide Saved Events / Resume Event flow.

Resume dashboard should show:
- Event name
- last played
- lifecycle/progress
- participating teams
- cumulative Agon scores
- qualifier/tournament progress
- current standings/seeds
- championship state
- completed/recent matches
- next scheduled/actionable match

Actions:
- Resume Event
- View Standings
- View Bracket
- Match History
- View Scores
- Pause Event
- Complete Event where valid

Resume must not automatically start the next match before Host confirmation.

---

## 12. Match scheduling and progression
Tournament engine creates authoritative Match records with:
- stable ID
- stage/round
- participants/seeds
- game assignment/config snapshot
- state: SCHEDULED/READY/IN_PROGRESS/COMPLETED/VOID/REPLAY_REQUIRED as applicable
- result
- score transaction references
- next-match advancement links

Completion transaction should atomically/idempotently:
1. finalize game result
2. commit any uncommitted normal game points
3. record tournament match result
4. update standings/loss counts
5. advance/populate downstream bracket/pairing when applicable
6. create next Swiss pairing only when prior round complete
7. persist Event checkpoint

Do not award final placement bonus until placement is authoritative.

---

## 13. Idempotency and audit ledger
Long-lived Events require transactional safety.

Every score-affecting operation uses stable idempotency keys, e.g.:
- game challenge award
- game final score commit
- tournament placement bonus
- Event Championship placement bonus

Persist append-only/auditable score transactions where practical rather than only a mutable total.

Requirements:
- reopening/resuming never double-awards game points
- retrying match-finalization never advances bracket twice
- placement bonus exactly once
- correcting/voiding a match creates explicit reversal/correction transaction rather than silently corrupting totals
- seeded random decisions (draws/byes/displacement/etc.) remain reproducible where game/tournament requires them

---

## 14. Versioning and migrations
Because Events may span weeks/months and Agon may update between gatherings:
- persisted Event has schema version
- tournament configuration snapshot has version
- Game Session state has game/state version
- load path runs explicit migrations
- migration failure does not partially mutate persisted Event
- retain backup/checkpoint before destructive migration
- unsupported future/unknown versions fail safely with actionable Host message

Automated tests must load representative older persisted fixtures after schema evolution.

---

## 15. Host/Admin configuration

### Event setup
- Event name
- 1–4 teams
- team names/rosters
- ordinary vs championship Event
- score/bonus policy
- saved/resumable by default

### Tournament setup
- game/challenge
- format (5 types)
- teams
- seeds/source
- tiebreakers
- placement bonuses
- third-place match where applicable
- double-elimination grand-final rule
- Swiss round count/pairing options

### Event Championship setup
- 1..N Round-Robin qualifiers
- game/challenge/config for each qualifier
- qualifier seeding-point schedule
- combined-seeding tiebreakers
- final Knockout configuration
- single championship game or per-round game assignments
- Event Championship placement bonuses

Validate complete structure before Event starts, while allowing future stages' content/game selection to remain editable only if no competitive dependency has yet been established and audit rules permit it.

---

## 16. Projector UX
Tournament/Event presentation should reuse Agon visual language.

Support:
- bracket view
- standings table
- current matchup
- next matchup
- Round-Robin schedule/progress
- Swiss current round/pairings
- qualifier standings
- transition animation: QUALIFIERS → FINAL SEEDING → CHAMPIONSHIP
- Event score leaderboard distinct from tournament standings
- final podium/placement + placement bonus presentation

Responsive for 4:3, 16:10, 16:9. Do not shrink dense brackets/standings below readability; stage/paginate when necessary.

---

## 17. Host Remote UX
Phone/tablet Host Remote supports:
- start next match
- confirm matchup/game
- view tournament/event progress
- standings/bracket
- pause/resume Event
- resolve configured tiebreak workflow
- authorized void/replay/correct result workflow
- complete tournament/Event when valid

Dangerous corrections require confirmation and must preserve audit history.

---

## 18. Privacy/security
- team/player private game data remains governed by each game's projection rules
- Tournament/Event projections receive results/standings, not hidden game answers/hands
- persisted Event/Game state stored using existing application security model
- do not expose hidden controller/session secrets in history/export
- role authorization applies to result correction, Event completion/reopen, bracket changes and migrations

---

## 19. Offline/local-family use
Agon must not require a cloud connection merely to resume a locally saved family Event unless existing architecture already mandates server hosting. Persistence should use the application's authoritative data store and survive app/browser/server restart according to deployment model.

If future cloud sync/export is added, stable IDs/versioning/idempotency from this spec must support it without redefining tournament semantics.

---

## 20. Dependencies
Reuse existing/shared:
- team/session/score infrastructure
- Game/Challenge engines
- Player Controller/Host Remote architecture
- Agon Timer System where individual games require it
- responsive UI foundations
- per-game persistence/recovery contracts

Tournament infrastructure should be available to Wayfinder and future max-2-team games but must not be embedded inside Wayfinder.

Existing/new game specs should declare `GameCompetitionCapabilities` and tournament result mapping.

---

## 21. Test plan

### Team/capabilities
- reject Event with >4 teams
- lower per-game max enforced
- 3/4-team Event selecting max-2 game routes through configured Tournament Mode
- 4-team-capable game can run without forced pairwise tournament

### Knockout
- 2/3/4 teams
- deterministic bye
- 4-team #1/#4 and #2/#3 seeded semifinal behavior where seeded
- third-place optional

### Double elimination
- winners/lower bracket progression
- second loss eliminates
- grand final/reset option
- resume at every bracket transition

### Round robin
- exact unique pair counts 1/3/6
- standings/ties/tiebreak
- no duplicate matchup

### Swiss
- similar-record pairing
- rematch avoidance
- odd-team bye fairness
- unavoidable rematch deterministic/audited
- resume retains pairing history

### RR + Knockout
- RR freezes standings
- correct seeded bracket
- 3-team #2/#3 play-in then #1 final
- placement bonus once

### Scoring
- losing match retains all normal earned game points
- match result independent from raw points when game declares different win condition
- placement bonus once
- seeding points never leak into Agon score
- correction uses reversal/audit transaction

### Event Championship
- 1 qualifier + championship
- multiple qualifiers with different games
- combined placement-based seeding
- qualifier tie resolution
- single-game championship
- per-round championship games
- selected game capability validation
- final Event bonus once

### Persistence
- save/close/restart/resume between RR matches
- resume between qualifiers
- resume after qualifier seeding but before bracket
- resume mid-knockout
- in-progress Game Session crash recovery
- multiple saved Events
- completed/archived Event review
- changing human attendees does not reset stable team

### Idempotency
- repeated completion command
- process crash during match finalization
- process crash during bonus award
- retry bracket advancement
- no duplicate score or downstream match

### Migration
- load old Event fixture after schema version change
- rollback/safe failure on migration error

### Responsive/E2E
- Host desktop/tablet/phone
- projector 4:3/16:10/16:9
- complete multi-gathering Event simulation across process restarts

---

## 22. Initial release boundary
Required:
- global max 4 teams
- per-game competition capability declaration
- all 5 tournament formats
- normal game points retained throughout tournament
- configurable tournament placement bonuses
- Event Championship with 1..N RR qualifiers and final seeded Knockout
- qualifier seeding points separate from Agon points
- single-game or per-round championship game selection
- Event Championship placement bonus
- durable Event and Game Session persistence/recovery
- Saved Events/Resume dashboard
- score/bracket idempotency/audit
- schema version/migrations
- Projector + Host Remote tournament/event views

Optional future:
- multi-cycle RR
- cloud synchronization/export
- tournaments with >4 teams (requires explicit future platform-limit change)

---

## 23. Definition of done
- Agon refuses >4 competing teams
- games declare and enforce simultaneous team limits
- a 3/4-team Event can automatically orchestrate a 2-team game through selected tournament format
- all five formats produce correct, persisted progression
- normal game/challenge points continue to accumulate regardless of tournament win/loss
- tournament placement adds configured bonus exactly once
- Event may contain multiple RR qualifiers using different games and seed a final Knockout Championship
- championship supports one game throughout or game by knockout round
- Event can be closed for days/weeks and later resume with exact teams, scores, standings, brackets, seeds, next match and history
- in-progress supported Game Sessions recover without double scoring/rerolling
- Event survives compatible application/schema upgrades through tested migrations
- Host/projector/controller views remain responsive and do not leak game-private data
