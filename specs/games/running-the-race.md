# Running the Race — Game Specification

**Status:** Proposed
**Players/teams:** 1–4
**Primary engine:** `race.track` v1
**Theme:** biblical race/endurance imagery, especially Hebrews 12:1–2, 1 Corinthians 9:24–27, Philippians 3:13–14 and 2 Timothy 4:7.

## Vision
A true race-management game driven by Scripture knowledge, not a quiz with a race animation. Players manage pace, stamina and momentum while completing Bible challenges to clear obstacles and advance.

## Learning purpose
Use biblical race imagery to reinforce Scripture and Bible knowledge while drawing attention to the passages behind the mechanics. Featured-passage mode can intentionally teach/reinforce one passage during the race.

## Dependencies
Running the Race composes `race.track`, Challenge/Answer services, Score Ledger, Timer/Clock, RNG, BibleTextService, content, controllers/InputActions, persistence and Stage projections. Optional future challenge stations may use other engines such as `scripture.relationship` without changing Race Engine.

## Course
A course is composed of logical segments such as open track, hurdle, hill/endurance, weight, sprint, checkpoint/Cloud-of-Witnesses station and final stretch. Visual treatment should fit Agon's UI and can use an ancient-world footrace/stadium/course aesthetic rather than a modern oval track.

## Pace and stamina
Players choose a pace such as Recovery, Steady, Run or Sprint when allowed. Faster pace increases potential progress but consumes more stamina and can magnify consequences of failure according to visible rules. Stamina management makes race strategy meaningful.

No secret placement-based rubber-banding. Comeback opportunities use explicit symmetric mechanics such as optional harder `Press On` challenges with higher potential reward.

## Challenge resolution
Bible challenges come from reusable challenge/content sources. Challenge outcome becomes a game-rule effect applied to Race Engine. Existing question sets can be reused where appropriate rather than creating race-specific copies.

## Hurdles
Hurdle stations present an accuracy challenge. Correct answer clears the hurdle and may award momentum; incorrect answer causes a stumble/slow/recovery effect. Consecutive clean hurdles may earn a documented Clean Run bonus.

## Weights — Hebrews 12:1
Weights are explicit thematic challenge/effect mechanics, not a generic punishment automatically attached to every wrong answer. At a Weight station, a challenge tied to the featured content can let a player avoid/shed a weight. Failure may cause a temporary visible weight effect that increases stamina cost/reduces pace until cleared under defined rules.

## Press On — Philippians 3:13–14
An explicit risk/reward challenge can offer a harder question/challenge for greater progress/momentum. Rules are visible and symmetric; it is not hidden rubber-banding.

## Discipline/sprint — 1 Corinthians 9:24–27
Sprint segments emphasize pace discipline. Fast answers may help where configured, but guessing penalties/submission limits prevent button mashing. Accuracy remains meaningful.

## Finish the course — 2 Timothy 4:7
Final stretch emphasizes endurance. It may require a short correct-answer streak, sufficient stamina, or a final challenge sequence according to selected mode/difficulty. Failure delays rather than arbitrarily resetting the entire race.

## Cloud of Witnesses
Optional Hebrews 11 checkpoints present reviewed challenges about people/passages in Hebrews 11. Completing a station may award momentum or clear an effect. Biblical people are not modeled as collectible fantasy powers; the reward comes from successfully completing the challenge.

## Featured Passage
A race may designate a featured passage (e.g. Hebrews 12:1–2). Introduce/read it at the beginning, reinforce portions/concepts during play, and use it in post-race review/final challenge. A memory-verse finish is optional/configurable rather than mandatory for every race.

## Modes
- **Sprint:** short ~3–5 minute race with simplified stamina/course.
- **Race:** standard pace/stamina/obstacle experience.
- **Relay:** teammates run legs and pass control/baton at exchange zones; reuse existing relay/controller capabilities where possible.
- **Endurance:** longer, lower-pressure format emphasizing sustained accuracy/stamina rather than raw response speed.
- **Obstacle Course:** denser hurdles/hills/weights and challenge variety.
- **Featured Passage:** course/challenges intentionally reinforce one selected passage.

## Multiplayer and solo
Support solo and up to four teams/runners. Simultaneous phases should hide private answers/pace choices when knowledge would influence others. Stage reveals challenge outcomes/race movement together where appropriate.

## Scoring
Race placement and ordinary challenge scoring are separate concepts. Challenges continue to award points through Score Ledger under game policy. Race finish/placement may award configured bonus points. Tournament/event scoring remains governed by tournament architecture.

## Relay
Team roster/order is set before race or according to Host policy. Exchange zones transfer active runner/controller responsibility. A missed challenge can affect the leg but should not create cumbersome physical-controller handoff requirements; phone/team controller identity follows Agon's controller architecture.

## Host controls
Host can start/pause/resume, advance/recover from technical interruption and invoke configured course events. Host must not arbitrarily alter competitive conditions without visible/auditable game policy. Optional thematic course conditions (e.g. hill/headwind) are deterministic/configured events, not hidden manipulation.

## Difficulty/accessibility
Difficulty affects question difficulty, stamina margins, obstacle frequency, pace risk, streak length and time/submission policy. Accessibility accommodations can disable/reduce speed dependence, extend response time, reduce motion and provide non-timing scoring without treating accommodations as penalties.

## Stage
Shared Stage shows course, runner positions, public stamina/momentum/effects, current station/challenge state, timer when relevant and finish order. Visual runner progress advances between logical track stages. Ancient-world visual theme must remain consistent with Agon's overall design and readable on projector/TV.

## Controller
Semantic actions include select pace, answer/submit, optional Press On choice, hint where challenge permits and relay readiness. Controller never calculates authoritative movement.

## Persistence/replay
Persist Race Engine snapshot plus game mode/config, featured passage/content revisions, challenge sequence/outcomes, scores and controller/team/relay state needed to resume. Animations are reconstructed from logical state, not persisted frame state.

## Tournament/Event fit
Race modes can participate in ordinary Agon rounds and Events. Head-to-head/two-player configurations fit automatic tournaments; 3–4 competitor races can also award ordinary game scores/placement bonuses without forcing tournament semantics.

## Post-race review
Review featured passages and key challenge misses, explain thematic mechanics from the relevant Scripture, and provide optional Dig Deeper reading/questions. Do not imply that game mechanics exhaust the meaning/context of the passages.

## MVP
Standard Race + Sprint; 1–4 competitors; authored track templates; pace/stamina/momentum; hurdles; explicit weights; Press On; final stretch; reusable question content; Stage/controller projections; scoring; persistence; post-race review.

Later: Relay, Endurance, Obstacle Course, richer Featured Passage courses, deterministic generated tracks, optional cross-engine challenge stations.

## Testing
Test pace/stamina strategy, challenge-to-race effect mapping, weights, hurdles, Press On risk/reward, final stretch, simultaneous multiplayer privacy, ties, accessibility non-speed policy, pause/resume, saved race restore, tournament integration and projector/controller projections.