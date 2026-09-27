# Exodus: The Journey — Game Specification

**Status:** Proposed
**Working title:** Exodus: The Journey
**Players/teams:** 1–4
**Primary capability:** `journey.campaign` v1 with `CANONICAL` narrative policy

## Vision
Players/teams travel together through the recorded Exodus narrative while competing in varied Bible-knowledge activities for Agon points. Scripture determines what happens; gameplay determines how well players perform.

> Players influence their performance through the biblical journey. They do not influence the biblical events themselves.

## Scope
Campaign content may cover Exodus proper and, if configured as a larger Wilderness/Journey campaign, later canonical material from Leviticus/Numbers/Deuteronomy. Campaign boundaries and book references must be explicit; the game must not imply that the book of Exodus itself ends at entry into the Promised Land.

Initial Exodus-focused campaign chapters can include Egypt/plagues, Passover, departure/Red Sea, wilderness provision, Sinai/covenant and Tabernacle. Later wilderness-to-Jordan content should be separately identified even if presented as a continuation.

## Canonical invariance
The order/outcome of recorded events is authored and fixed. No score, wrong answer, RNG roll, aid, team decision or resource state may cause alternate Scripture.

Players do not decide whether the Red Sea parts, whether manna is provided, whether Sinai occurs, or whether a recorded event is avoided. Activities may visualize player/team performance within the theme while the canonical narrative continues as recorded.

## Replayability
Replayability comes from variable activities, challenge pools, participation formats, difficulty, generated question selection, scoring and aid strategy—not alternate biblical history.

Challenge content is independent from checkpoint subject unless an activity explicitly requests story-specific content. A Manna activity may draw questions from the Host's configured whole-Bible/current-study/etc. pool.

## Shared journey + competitive scoring
All teams/players experience **one shared canonical journey at the same narrative pace**. The session owns one JourneyProgress/current checkpoint. Competitors never occupy different canonical Exodus locations because of challenge performance.

Each player/team independently earns Agon points and may independently own Challenge Aids/statistics. At checkpoint completion, all participants advance together regardless of who won the activity.

**Final campaign standings are determined by cumulative Agon points**, including configured challenge points and any explicit checkpoint/tournament placement bonuses—not by journey/map position.

## Independent checkpoint dimensions
Every Exodus checkpoint keeps these independent:
1. shared canonical journey progression;
2. participation format;
3. activity mechanic;
4. challenge content/pool;
5. scoring policy.

Thus the same Red Sea checkpoint can use ALL_PLAY in one session and HEAD_TO_HEAD/TOURNAMENT in another without changing Exodus 14 or the next canonical checkpoint.

## Participation formats
Checkpoint activities may use:
- **ALL_PLAY:** all teams/players answer simultaneously, privately where appropriate;
- **TEAM_PLAY:** members collaborate on their team's response;
- **BUZZER:** all teams compete for answer priority;
- **HEAD_TO_HEAD:** two participants compete directly;
- **TOURNAMENT:** 3–4 participants use Agon's tournament capability, retaining normal challenge scoring plus configured finish bonuses;
- **RELAY:** team members perform legs/portions of an activity;
- **SHARED_COOPERATIVE:** all participants contribute to one objective while configured scoring can still track team/player contributions;
- **SOLO:** single-player campaign.

A checkpoint can declare multiple allowed formats and a default. Host/session configuration chooses among allowed formats. A head-to-head/tournament checkpoint never leaves losing teams behind on the journey; all teams continue together afterward.

## Example campaign flow
- Egypt / plagues
- Passover — Exodus 12
- Red Sea — Exodus 14
- Marah — Exodus 15:22–27
- Manna — Exodus 16
- Rephidim — Exodus 17
- Sinai / covenant — Exodus 19–24
- Golden Calf / covenant renewal — Exodus 32–34
- Tabernacle — Exodus 25–31, 35–40

Exact checkpoint granularity is content-authored and reviewed.

## Checkpoint activities
Each checkpoint can select one of several compatible activity templates and participation formats so repeated campaigns need not play identically.

Examples:
- **Plagues:** ALL_PLAY sequence/order, matching, BUZZER or general challenge round.
- **Passover:** TEAM_PLAY/ALL_PLAY sequence/identify-instructions plus general challenge variants.
- **Red Sea:** ALL_PLAY timed/simultaneous challenge, HEAD_TO_HEAD, or optional TOURNAMENT; points/results vary but all participants advance together through the canonical crossing.
- **Manna:** ALL_PLAY timed `Gather Manna` challenge.
- **Amalek/Rephidim:** HEAD_TO_HEAD, TOURNAMENT, multi-round TEAM_PLAY or BUZZER challenge.
- **Sinai:** individual-per-team private ordering/matching/trivia/Scripture/reference challenges.
- **Tabernacle:** TEAM_PLAY or HEAD_TO_HEAD build/placement activity using reusable board/build capabilities.

## Gather Manna
A flagship themed activity at Exodus 16.

Example default:
- 60-second round;
- all teams play simultaneously and independently;
- answer as many configured Bible challenges as possible;
- each team earns its own ordinary Agon points;
- visual manna count represents that team's challenge performance;
- thresholds can award that team Challenge Aids such as extra time for a later challenge;
- manna is **not** food inventory controlling Israel's survival/progression.

Example aid award policy:
- 4 correct: one small aid;
- 7 correct: additional/stronger configured aid;
- 10 correct: maximum configured award.

Thresholds/difficulty are content/game policy, not theological claims.

## Challenge Aids
The campaign may award `challenge.aid` grants, visually themed to the checkpoint. These provide strategic choices while affecting only gameplay. Aids are normally owned by the player/team that earned them unless an activity explicitly awards a shared aid.

Examples:
- +10 seconds on a future timed challenge;
- one additional submission;
- reveal a hint;
- eliminate one valid distractor;
- limited score protection where appropriate.

Host/game policy controls whether aids are automatic or player-selected and whether they expire by checkpoint/chapter/campaign.

Aids never skip/change a canonical event. Accessibility accommodations are separate and never require spending an aid.

## Scripture-specific teaching
Before/after canonical checkpoints, provide concise reviewed narrative and references through BibleTextService/content system. Activities can include story-specific questions, but are not limited to them.

Wrong story-specific answers can trigger a reviewed Scripture explanation/reveal. The purpose is `predict/answer -> reveal Scripture -> understand`, not to simulate an alternate consequence.

## Stage/map
Stage presents **one** ancient-world journey map with stable canonical locations/checkpoints and one shared journey marker/progress state. Do not depict teams as racing to different canonical locations. Team scores/activity results can overlay the shared journey. During a checkpoint, temporary activity-specific lanes/brackets/boards may show competitors separately without representing different narrative positions.

## Controller
Controllers handle answers, ordering/build actions, aid selection/use, hints and activity-specific semantic InputActions. Stage never leaks private answers before reveal.

## Scoring
Every activity uses Score Ledger and each player/team earns its own points. The campaign displays cumulative standings. Head-to-head/tournament activities retain normal per-challenge scoring and may add configured placement bonuses. Final standing/winner is based on cumulative campaign points; canonical journey completion/position is shared and is not a competitive tiebreaker unless a future noncanonical campaign explicitly defines otherwise.

## Difficulty
Difficulty affects question pools, timers, distractors, sequencing complexity, build complexity, aid thresholds/availability and activity selection. It does not alter canonical narrative.

## Persistence
Campaigns are session-saveable across family/church gatherings. Persist one shared canonical JourneyProgress plus separate participant score references, aids, statistics, checkpoint activity definitions/results, content revisions and selected translation/content configuration. Resume returns every participant to the same canonical checkpoint while preserving individual/team competitive state.

## Event integration
Exodus can run as a standalone saved campaign or as an Event component. Individual checkpoint activities may contribute normal Event points. It is not inherently a tournament, though compatible embedded challenge types may use tournament-capable mechanics when explicitly configured.

## Post-checkpoint/campaign review
Journey Journal records completed checkpoints with Scripture references, reviewed summaries, questions missed and Dig Deeper material. Players can revisit what happened without changing the saved canonical history.

## MVP
- one shared Exodus campaign map/progression;
- 1–4 teams/solo with separate cumulative scores;
- canonical checkpoint progression;
- mixed checkpoint participation formats including ALL_PLAY and at least one HEAD_TO_HEAD/TOURNAMENT-capable activity;
- variable challenge pools/templates;
- Gather Manna timed activity;
- Challenge Aid integration, initially EXTRA_TIME + HINT/ELIMINATE_DISTRACTOR where supported;
- Score Ledger standings/final ranking;
- save/resume;
- checkpoint review/Journey Journal.

## Testing
Test canonical invariance under wins/losses/RNG/aids; exactly one shared JourneyProgress; no competitor can advance ahead/behind another on the canonical map; separate team/player scoring; final standings from cumulative points; ALL_PLAY/private answers; HEAD_TO_HEAD/TOURNAMENT where losers still advance with everyone; different challenge sets on repeated runs; Manna scoring/aid thresholds; aid use affects only challenge state; 1–4 team privacy; translation/content readiness; save/resume; checkpoint references; and no implication that Exodus proper concludes with entry into Canaan.