# Agon: Multitude — Game Specification

## Concept
**Multitude** is a simultaneous private-list Bible knowledge game. Each round presents a category, person, event, place, passage/theme, or other bounded biblical prompt. Competing players/teams privately enter as many related answers as they can before the authoritative timer expires. When time expires, all lists freeze and are revealed together. Invalid answers are crossed out; answers submitted by more than one competing participant/team are also crossed out. Each remaining valid unique answer scores points.

The game rewards breadth of Bible knowledge, recall under time pressure, and strategic selection of less-obvious valid answers. It does not reward typing the same popular answer as everyone else.

## Core round flow
1. Present round/category prompt and rules.
2. Start authoritative entry timer.
3. Players/teams privately enter answers on Player Controllers.
4. Each participant/team can see only its own current list; projector does not receive hidden answers.
5. At timer expiry, server atomically freezes all lists. Late submissions are rejected.
6. Projector reveals all competing lists together.
7. Normalize entries to canonical answer/entity identities where possible.
8. Resolve invalid/ambiguous entries, including Host Review when required.
9. Cross out invalid answers.
10. Detect canonical duplicates across competing players/teams and cross them out for every participant/team that submitted them.
11. Score remaining valid unique answers.
12. Display round totals and advance to the next round.

A game consists of multiple configured rounds; cumulative score determines the winner unless another scoring profile is explicitly configured.

## Participants
Support:
- individual players
- teams
- 2+ competing participants/teams within practical projector/controller limits

### Team input modes
**Captain Entry**
- one designated/active controller enters the team's list
- other team controllers may see team status according to configuration but do not independently submit

**Shared Team Entry**
- multiple paired controllers on the same team can submit simultaneously into one authoritative private team list
- server merges team submissions in real time
- duplicate entries within the same team collapse to one canonical/list item and never create a penalty
- UI may show who added an item on that team's private controllers if useful, but contributor identity is not part of scoring

## Prompt/category types
Initial content should support categories such as:
- people associated with a person/event/place/book
- places associated with a person/event/book
- objects/things associated with an event/location/practice
- members of a bounded biblical group
- books matching a criterion
- events matching a criterion
- miracles/parables matching a criterion
- named people satisfying a relationship/role criterion
- other curated finite or defensibly enumerable biblical lists

Examples:
- People associated with David and Goliath
- Places associated with Paul's missionary journeys
- Things associated with the Tabernacle
- People involved in events surrounding Jesus' crucifixion
- Women named in the Old Testament
- People who saw an angel
- Kings of Israel or Judah
- Miracles involving food

Content authoring must define scope carefully enough that validation and disputes are manageable.

## Round modes
### Open List
Players may submit as many answers as they can within the timer, subject to practical configured limits.

### Limited List
Round sets a maximum number of accepted list slots (for example 5, 8, or 10). This creates additional strategy: players must choose answers they believe are valid and less likely to be duplicated by opponents.

### Exact/Bounded List
The content has a known finite canonical answer set. Players try to identify as many as possible; uniqueness against opponents still determines scoring unless a future explicitly configured scoring variant says otherwise.

Initial release should support Open List and Limited List; Exact/Bounded uses the same validation model and may be enabled when content metadata marks the set complete.

## Difficulty
Difficulty should influence content and time pressure rather than merely shortening the clock.

Suggested defaults:
- **Easy**: broad/familiar categories, more direct scope, ~60 seconds, forgiving common aliases/spelling normalization
- **Medium**: moderately specific categories, ~45–60 seconds
- **Hard**: narrower categories/relationships, ~35–45 seconds
- **Expert**: highly specific/bounded relationships or details, ~30–45 seconds

Timers are configurable per round/game. Difficulty may also influence category breadth and expected answer-set depth. Do not make Expert a pure typing-speed contest.

## Answer model
Each curated accepted answer should have a stable canonical identity where practical:
```ts
type MultitudeAcceptedAnswer = {
  id: string;
  canonical: string;
  aliases?: string[];
  entityId?: string;
  scriptureReferences?: string[];
  explanation?: string;
  tags?: string[];
};
```

A round definition conceptually contains:
```ts
type MultitudeRound = {
  id: string;
  prompt: string;
  instructions?: string;
  difficulty: 'easy'|'medium'|'hard'|'expert';
  timeLimitSeconds: number;
  mode: 'open'|'limited'|'bounded';
  maxAnswers?: number;
  acceptedAnswers: MultitudeAcceptedAnswer[];
  answerSetCompleteness: 'curated'|'complete';
  scoringProfileId: string;
};
```

Exact repository types follow existing conventions.

## Normalization and validation
Raw string equality is insufficient. Normalize answers before duplicate comparison.

Examples that should normally resolve to one identity when context makes them unambiguous:
- `Paul` / `Apostle Paul` / `the Apostle Paul`
- `Peter` / `Simon Peter`
- common accepted spelling variants

Normalization pipeline may include:
- trim/case/punctuation normalization
- configured aliases
- safe spelling/fuzzy suggestions within conservative thresholds
- canonical entity mapping
- round-context disambiguation

Every submission resolves to one of:
- **VALID** — confidently mapped to an accepted canonical answer
- **INVALID** — confidently outside the accepted scope
- **NEEDS_HOST_REVIEW** — plausible/ambiguous/not safely auto-resolvable

Do not silently accept aggressive fuzzy matches that could map one biblical person/place to another.

## Duplicate rules
Duplicate cancellation is based on canonical identity, not displayed spelling.

### Within the same participant/team
- repeated submissions of the same canonical answer collapse to one item
- no penalty
- in Shared Team Entry, simultaneous duplicate submissions are idempotently merged

### Across competing participants/teams
If two or more competitors submitted the same canonical answer, that answer scores **zero for every competitor who submitted it**.

Example:
```text
Team A: Peter
Team B: Simon Peter
Team C: Andrew
```
`Peter` and `Simon Peter` resolve to the same canonical identity and are crossed out for A and B. Andrew remains eligible to score for C.

This rule applies regardless of whether 2, 3, 4, or more competitors share the answer.

## Scoring
Initial default:
- valid unique answer: **100 points**
- invalid answer: 0
- cross-team duplicate: 0
- within-team duplicate: collapsed, no penalty

Use a scoring profile so point value can be configured without changing core rules. Initial release should avoid rarity multipliers; uniqueness already rewards less-obvious answers.

Round score is computed only after validation/review and cross-team duplicate cancellation are finalized.

## Host Review / challenges
Ambiguous submissions enter a Host Review queue before duplicate resolution/final scoring.

Host Remote/Desktop displays:
- round prompt/scope
- submitted text
- suggested canonical match if any
- accepted-answer metadata/reference/explanation where available
- Accept as suggested / choose accepted identity / Reject

Host decision becomes authoritative and auditable for that round.

Optional participant **challenge** flow may allow a limited number of requests to review a rejected answer (recommended default: at most one per team per round or configurable per game). Challenges must not reveal another team's still-private list during collection.

Initial implementation may ship Host Review before participant challenge UX if necessary, but the state model should not preclude challenges.

## Timer and submission authority
Use the shared Agon Timer System. The server/authoritative game state determines when collection closes.

Requirements:
- entry timer visible on projector and controllers
- submissions accepted only while round state is COLLECTING and before authoritative expiry
- expiry atomically freezes all competitor lists
- background/reconnect does not extend time
- late/stale submissions rejected
- optional warning thresholds via shared Timer presentations

Do not create a browser-owned independent countdown.

## Round state machine
Conceptually:
```text
READY
  -> COLLECTING
  -> FROZEN
  -> REVEAL
  -> VALIDATING
  -> HOST_REVIEW (only if needed)
  -> DUPLICATE_RESOLUTION
  -> SCORING
  -> ROUND_COMPLETE
```

Host pause/recovery states follow shared game/session conventions.

Lists become public only at the authoritative REVEAL transition. Validation may be computed server-side earlier/later as an implementation detail, but no result may leak before reveal.

## Player Controller UX
During COLLECTING:
- prompt/category visible
- authoritative remaining time
- private answer-entry field
- fast keyboard-first submission
- current private list
- remove/edit a not-yet-frozen entry where configured
- remaining slots in Limited List mode
- team/shared-entry updates
- duplicate-within-own-team feedback such as `Already on your team's list`

Optimize for phone portrait first; tablet gets more list space. Input should remain focused/fast after adding an answer. Do not require reopening a modal for every answer.

At FROZEN:
- input immediately disables
- show `Answers locked`
- own list remains visible

During reveal/scoring:
- controller can mirror public result status and team score
- no opponent list is sent early merely because controller has entered reveal UI

## Projector UX
### Collection phase
Show:
- round number
- category/prompt
- timer
- participant/team names/status (`Entering…`, `8 answers`, etc.) only if configured
- **never show answer text during collection**

Consider hiding answer counts by default if counts would influence competitors; make count visibility configurable.

### Reveal sequence
Use an Agon theatrical but readable sequence:
1. **Reveal Lists** — all frozen lists appear in participant/team columns/cards.
2. **Validate** — invalid answers cross out with a clear X/state.
3. **Review** — if Host Review is needed, pause scoring without exposing unnecessary adjudication details.
4. **Find Matches** — canonical cross-team duplicates highlight together, then cross out.
5. **Score Unique Answers** — surviving answers receive positive Agon treatment and points tally.
6. **Round Score** — animate/add round totals to cumulative scores.

Do not rely on red/green alone; use icons, strike-through/state text and accessible semantics.

Large lists must adapt through pagination/scroll/staged reveal rather than unreadably shrinking text. Support 4:3, 16:10 and 16:9 projector layouts.

## Host Controls / Host Remote
Host can:
- start/pause/resume collection using shared Timer/HostCommand paths
- force close collection in authorized recovery situations
- review ambiguous answers
- adjudicate participant challenges if enabled
- inspect validation explanations/references
- advance reveal phases if presentation is manual
- undo/recover adjudication before final scoring under shared audited recovery rules
- advance round/end game

Normal Host Remote should not expose opponents' live private lists during COLLECTING. If a privileged moderation/safety view is ever required, it must be an explicit role/action and not default Host projection.

Phone Host Remote prioritizes review actions; tablet may show side-by-side lists and reference detail.

## Privacy/security
Private collection is a hard security boundary, not a CSS effect.

Before REVEAL:
- projector payload contains no submitted answer strings
- Player A payload contains no Player/Team B answer strings
- ordinary Host Remote payload contains no live competitor answer strings except where explicitly required by an authorized moderation/recovery action
- DOM/ARIA must not contain hidden opponents' answers
- shared-team members may receive their own team's merged list according to team mode

At REVEAL, the authoritative public projection may contain all frozen lists.

Reconnect/reassignment must not leak another participant/team's private list. Logs/telemetry should avoid unnecessary raw answer capture.

## Admin authoring
Create a Multitude round/category authoring experience.

Author can configure:
- prompt/title/instructions
- category/content type
- difficulty
- time limit
- Open/Limited/Bounded mode
- max answers for Limited mode
- scoring profile
- accepted canonical answers
- aliases
- entity links where available
- Scripture references/explanations
- answer-set completeness (`curated` vs `complete`)
- optional host-review guidance
- optional challenge allowance/limit

Validation should detect:
- duplicate canonical IDs
- alias collisions within a round
- ambiguous aliases mapping to multiple accepted answers
- empty accepted-answer sets
- Limited mode without valid max count
- unreasonable timer/list configuration
- likely duplicate display entries

Admin preview should demonstrate phone entry, team shared entry, projector hidden collection, reveal, invalid crossing, duplicate crossing and scoring.

## Content reuse / answer-set service
Implement Multitude answer normalization/accepted-set logic so it can be reused by future list/category games rather than embedding all matching logic directly in projector UI.

Where existing Bible content/entity metadata can safely supply a canonical identity, reuse it. Do not automatically generate a supposedly complete theological/biblical answer set from tags unless content metadata explicitly guarantees completeness and scope.

## Computer Player support
Optional follow-on using the Agon Computer Player Framework.

A computer participant may generate a private list through a Multitude strategy adapter using only allowed round information. For curated answer-list games, the framework must avoid simply handing the strategy the full accepted-answer key and allowing Expert to dump it.

Use the approved simulated trivia/knowledge model to determine which answers the computer can plausibly produce at each difficulty, then choose from that simulated known subset. Difficulty may affect breadth/obscurity/pace but cannot provide unfair hidden opponent lists.

Computer list must be committed privately during COLLECTING and revealed/scored identically to human lists.

Initial human multiplayer release is not blocked on computer support.

## Accessibility
- prompt/timer available textually
- answer entry labeled and keyboard/mobile-keyboard efficient
- list item status announced as valid/invalid/duplicate/unique during public resolution
- cross-outs use text/icon semantics, not color alone
- reveal animation supports Full/Reduced/Off motion
- projector columns have logical reading order
- large text/zoom does not hide score/status
- Host Review controls have clear labels and non-drag interaction

## Persistence/recovery
Persist authoritative:
- game/round/content version
- participant/team mode
- raw submissions and canonical resolution state as appropriate
- frozen timestamp/state
- validation/review decisions
- duplicate-resolution result
- round/cumulative scores
- timer state
- challenge/review state if enabled

Recovery must not reopen a frozen list, accept late answers, reveal private lists early, duplicate a score, or lose Host Review decisions.

## Dependencies
Reuse rather than duplicate:
- Agon Timer System #156–#159
- Player Controller/private participant projection infrastructure
- Host Remote shared command/projection architecture
- Agon responsive UI/UX foundations
- existing participant/team/session/scoring conventions
- Computer Player Framework #160–#166 only for optional computer opponents

Multitude does **not** require the 52-card Bible Playing Deck or Unveiled. Its canonical answer/entity normalization service should be reusable by other games.

## Test plan
### Rules/unit
- freeze rejects late submission
- same-team duplicate collapses once
- cross-team alias variants resolve to same canonical answer and cancel for all matching competitors
- invalid answer scores zero
- unique valid answer scores configured value
- 3+ team duplicate cancellation
- Limited List enforces slot maximum atomically
- Shared Team Entry handles simultaneous duplicate submissions idempotently
- scoring cannot run before review resolution

### Normalization
- case/punctuation/common alias normalization
- Peter vs Simon Peter canonical collision
- conservative spelling tolerance
- ambiguous alias → NEEDS_HOST_REVIEW
- Host decision changes canonical resolution before duplicate pass

### Privacy
- opponent raw answers absent from serialized PlayerView/projector/DOM/ARIA during COLLECTING/FROZEN
- team members see only own merged team list
- ordinary Host Remote does not receive live private lists
- public answers appear only at REVEAL
- reconnect/reassignment does not leak prior team's list

### Timer/recovery
- expiry atomically freezes all lists
- stale client submission rejected after expiry
- pause/resume/background/reconnect cannot gain extra entry time
- recovery from FROZEN/REVEAL/HOST_REVIEW does not alter submissions or double score

### Responsive/E2E
- 2, 3 and 4 competing columns/teams
- phone portrait/landscape Player Controller
- shared-team simultaneous entry
- tablet Host Review
- 4:3/16:10/16:9 projector
- long lists paginate/stage readably
- Full/Reduced/Off motion

## Initial release boundary
Required:
- multi-round games
- individual + team play
- Captain Entry and Shared Team Entry
- Open and Limited List modes
- authoritative timed private collection
- canonical accepted-answer/alias model
- VALID/INVALID/NEEDS_HOST_REVIEW resolution
- synchronized reveal
- cross-team duplicate cancellation
- unique-answer scoring
- Host Review
- Projector/Player Controller/Host/Admin UX
- privacy/accessibility/recovery tests

Optional follow-on:
- participant challenge tokens/limits if not included initially
- computer participants
- more advanced generated category sets

## Definition of done
- 2+ players/teams can complete a multi-round Multitude game end-to-end
- all competitors enter simultaneously and privately
- timer freezes all lists authoritatively
- invalid answers are visibly crossed out
- canonical duplicates across competitors are crossed out for everyone who submitted them
- valid unique answers alone score
- aliases/spelling/context normalization prevents trivial duplicate evasion
- ambiguous answers have efficient Host Review
- shared team input works without double entries
- hidden answer lists cannot be extracted from unauthorized projector/player/host projections before reveal
- responsive projector/controller/host/admin experiences pass accessibility and recovery tests
