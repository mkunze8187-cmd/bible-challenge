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
Replayability comes from variable activities, challenge pools, difficulty, generated question selection, activity templates, scoring and aid strategy—not alternate biblical history.

Challenge content is independent from checkpoint subject unless an activity explicitly requests story-specific content. A Manna activity may draw questions from the Host's configured whole-Bible/current-study/etc. pool.

## Shared journey + competitive scoring
All teams experience one shared canonical journey on Stage. Teams/players compete for Agon points during checkpoint activities. Journey progression is shared; Score Ledger remains per configured player/team/event policy.

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
Each checkpoint can select one of several compatible activity templates so repeated campaigns need not play identically.

Examples:
- **Plagues:** sequence/order, matching, buzzer or general challenge round.
- **Passover:** sequence/identify instructions plus general challenge variants.
- **Red Sea:** timed/simultaneous challenge sequence; correct answers earn points and visually advance team markers through the challenge presentation, without changing the canonical crossing.
- **Manna:** timed `Gather Manna` challenge.
- **Amalek/Rephidim:** multi-round/team challenge.
- **Sinai:** ordering, matching, trivia, Scripture/reference challenges.
- **Tabernacle:** build/placement challenge using reusable board/build capabilities.

## Gather Manna
A flagship themed activity at Exodus 16.

Example default:
- 60-second round;
- answer as many configured Bible challenges as possible;
- each correct answer earns ordinary Agon points;
- visual manna count represents performance;
- thresholds can award Challenge Aids such as extra time for a later challenge;
- manna is **not** food inventory controlling Israel's survival/progression.

Example aid award policy:
- 4 correct: one small aid;
- 7 correct: additional/stronger configured aid;
- 10 correct: maximum configured award.

Thresholds/difficulty are content/game policy, not theological claims.

## Challenge Aids
The campaign may award `challenge.aid` grants, visually themed to the checkpoint. These provide strategic choices while affecting only gameplay.

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
Stage presents an ancient-world journey map with stable canonical locations/checkpoints. Progress reveals completed/upcoming authored locations according to presentation policy. Team scores/activity results can overlay the shared journey without depicting separate alternate Exodus histories.

## Controller
Controllers handle answers, ordering/build actions, aid selection/use, hints and activity-specific semantic InputActions. Stage never leaks private answers before reveal.

## Scoring
Every activity uses Score Ledger. The campaign can show cumulative standings. Canonical journey completion is not itself evidence that one team changed history; competition is measured through activity performance and configured campaign bonuses.

## Difficulty
Difficulty affects question pools, timers, distractors, sequencing complexity, build complexity, aid thresholds/availability and activity selection. It does not alter canonical narrative.

## Persistence
Campaigns are session-saveable across family/church gatherings. Persist checkpoint, activity definitions/results, cumulative scores, aids, content revisions and selected translation/content configuration. Resume returns to the same canonical journey state.

## Event integration
Exodus can run as a standalone saved campaign or as an Event component. Individual checkpoint activities may contribute normal Event points. It is not inherently a tournament, though compatible embedded challenge types may use tournament-capable mechanics when explicitly configured.

## Post-checkpoint/campaign review
Journey Journal records completed checkpoints with Scripture references, reviewed summaries, questions missed and Dig Deeper material. Players can revisit what happened without changing the saved canonical history.

## MVP
- shared Exodus campaign map;
- 1–4 teams/solo;
- canonical checkpoint progression;
- variable challenge pools/templates;
- Gather Manna timed activity;
- Challenge Aid integration, initially EXTRA_TIME + HINT/ELIMINATE_DISTRACTOR where supported;
- Score Ledger standings;
- save/resume;
- checkpoint review/Journey Journal.

## Testing
Test canonical invariance under wins/losses/RNG/aids; different challenge sets on repeated runs; Manna scoring/aid thresholds; aid use affects only challenge state; 1–4 team privacy/scoring; translation/content readiness; save/resume; checkpoint references; and no implication that Exodus proper concludes with entry into Canaan.