# Exodus: The Journey — Game Specification

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

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

## Reusability-first architecture rule
Exodus is a **consumer and composition layer**, not the owner of generally useful gameplay mechanics.

For every checkpoint mechanic, ask whether the behavior could plausibly serve another Agon game, Journey, Event, Content Pack or future experience. If yes, implement/expose it as a **reusable capability/contract** with generic semantics and configuration; the Exodus checkpoint composes that capability with Scripture-specific content, presentation and rules.

Do not wait for a second implemented consumer before separating a clearly reusable mechanic. A second consumer is useful validation, not a prerequisite for reusable architecture.

Keep checkpoint-specific only what is genuinely specific to the biblical event or authored experience: Scripture/narrative, themed assets/names, event-specific tuning/presets, canonical sequencing and combinations of capabilities.

Examples from the design-approved checkpoints include:
- Red Sea: deformable formation simulation, persistent/propagating commands, synchronized shared-camera control, authoritative multi-controller real-time input, condition/state simulation and congestion/escalation are reusable capabilities; Red Sea Scripture, twelve-tribe identity, sea presentation and its two bonuses are Exodus composition/content.
- Marah: intentionally withheld information + decisive one-step assistance and reusable semantic Challenge actions such as Give Up/File Complaint belong in Challenge capabilities where applicable; Marah's three-Challenge composition and Exodus 15 narrative remain checkpoint-specific.
- Manna: shared atomic claim/reservation, concurrent shared collection, hidden-value collection, replenishing/scattered selectable field, advisory group polling, private/final participant stopping, randomized intermittent shared measurement, count-based collection visualization, and dynamically scaled value distribution should be reusable capabilities/policies where they have plausible consumers; manna theming, tribe need, Exodus 16 content tags and Scripture framing remain checkpoint-specific.

Capability interfaces should avoid Exodus nouns when the behavior is generic. Content packs should configure/compose capabilities rather than fork engines.

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

Checkpoint participation is content-defined. Most checkpoints may select among compatible formats, but a design-approved checkpoint may require one format. **Red Sea Crossing is fixed SHARED_COOPERATIVE** per its checkpoint specification; it is not converted to ALL_PLAY, HEAD_TO_HEAD, or TOURNAMENT.

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
- **Red Sea:** dedicated **SHARED_COOPERATIVE real-time mass-movement/logistics checkpoint**; no Bible-question challenge, head-to-head, or tournament inside the crossing. Players continuously command the twelve tribes through the opened sea and assemble them on the far shore while canonical deliverance remains God's action. See [Red Sea Crossing checkpoint specification](./exodus-red-sea-crossing.md) and #602.
- **Manna:** dedicated shared-cooperative gathering checkpoint: teams concurrently gather for one chosen tribe, manage uncertainty around one shared need, and collectively decide when enough has been gathered. See the design-approved Manna section below and #462.
- **Amalek/Rephidim:** HEAD_TO_HEAD, TOURNAMENT, multi-round TEAM_PLAY or BUZZER challenge.
- **Sinai:** individual-per-team private ordering/matching/trivia/Scripture/reference challenges.
- **Tabernacle:** TEAM_PLAY or HEAD_TO_HEAD build/placement activity using reusable board/build capabilities.

## Gather Manna
The previous 60-second independent-team Gather Manna / Challenge-Aid example is **superseded**.

The authoritative Exodus 16 checkpoint is the design-approved shared-cooperative Manna experience below and implementation issue #462. Manna is not survival inventory and cannot control canonical progression.

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
- design-approved shared-cooperative Manna gathering checkpoint;
- Challenge Aid integration, initially EXTRA_TIME + HINT/ELIMINATE_DISTRACTOR where supported;
- Score Ledger standings/final ranking;
- save/resume;
- checkpoint review/Journey Journal.

## Testing
Test canonical invariance under wins/losses/RNG/aids; exactly one shared JourneyProgress; no competitor can advance ahead/behind another on the canonical map; separate team/player scoring; final standings from cumulative points; ALL_PLAY/private answers; HEAD_TO_HEAD/TOURNAMENT where losers still advance with everyone; different challenge sets on repeated runs; Manna scoring/aid thresholds; aid use affects only challenge state; 1–4 team privacy; translation/content readiness; save/resume; checkpoint references; and no implication that Exodus proper concludes with entry into Canaan.

## Design-approved checkpoint override — Red Sea Crossing

Red Sea Crossing is fully specified in [`exodus-red-sea-crossing.md`](./exodus-red-sea-crossing.md) and tracked by #602.

This checkpoint supersedes earlier generic examples that treated Red Sea as a timed Bible Challenge, head-to-head, tournament, or ordinary scored checkpoint. It is a shared cooperative real-time mass-movement/logistics experience with no Bible-question Challenges inside the crossing.

The checkpoint's only cooperative bonuses are **Before Dawn** and **Progression Order**. There is no loss condition and no individual/team winner. The Scripture-driven opening follows Exodus 14 in order; after all tribes are across and assembled, canonical narrative resumes through the Song of Moses and the biblical experience ends with **Miriam (Exodus 15:20–21)** before results.


## Design-approved minor checkpoint — Marah (Exodus 15:22–27)

Implementation is tracked by **#604**.

Marah is a short **trust/provision** checkpoint immediately after the Red Sea, targeted at roughly 3–6 minutes. It uses **three Challenges per team**. Each team owns independent Challenge state and its players take turns answering; this checkpoint does not require cooperative solving.

### Challenge-type contract
Marah selects adaptable **Challenge types/families, not named games**. A compatible type can intentionally withhold enough necessary information that the initial answer is virtually impossible or highly uncertain, then expose one-step assistance that supplies the missing information and makes the answer clear/readily solvable.

The Bible content itself remains Player-Profile-appropriate. **Game/activity difficulty has no impact on Marah.** The difficulty comes from intentionally missing information, never from assigning a harder Bible-question tier.

Compatible patterns include Identification/Five-Clues-style, Multiple Choice, Sequence/Ordering, Matching, Fill-in/Completion, Relationship, Location/Context and Before/After. For example, a Five-Clues-style Identification Challenge may initially expose only one or two difficult/non-decisive clues; assistance reveals the remaining clues including a decisive clue.

### Player responses
While a Challenge is unresolved, the answering player may submit an answer, continue trying, **Give Up**, or **File Complaint**.

Wrong answers are not punitive.

**Give Up** immediately reveals the one-step assistance. There is no confirmation asking whether assistance is wanted.

**File Complaint** opens a quick multiple-choice complaint selector, initially:
- “This is too hard.”
- “We don't have enough information.”
- “This isn't fair.”
- “This is impossible!”

Complaint choice is not judged or scored and has no mechanical consequence. After the choice, the same one-step assistance is immediately revealed; there is no additional assistance prompt.

Neither Give Up nor File Complaint ends the player's turn. The same player completes the now-clear answer. Assistance never auto-completes the Challenge.

There is **no penalty whatsoever** for receiving assistance and **no bonus** for solving without it. Assistance is a gameplay analogue for receiving what was lacking; the UI must not imply that pressing a button commands God or mechanically produces divine revelation.

Teams may progress independently through their three Challenges. When all teams finish, the canonical Journey reconverges for the closing narrative.

### Scripture-driven close
After Challenge play, present Exodus 15:22–27: three days without water, bitter water at Marah, the people's complaint, Moses crying to the LORD, and the LORD showing Moses what is needed so the water is made drinkable. Include the testing/statute material with reviewed translation-aware presentation.

The close should allow the gameplay parallel to land naturally: players repeatedly lacked what they needed and received what made completion possible; Israel faced a need they could not resolve, and God provided. Do **not** convert this into punishment or an attitude score for complaining.

End at **Elim**, with twelve springs/wells and seventy palm trees, as the restful narrative image of provision/abundance. Elim is not another gameplay checkpoint.


## Design-approved checkpoint — Manna (Exodus 16)

Implementation is tracked by **#462**. This section supersedes the earlier generic timed-trivia Gather Manna placeholder.

Manna is a short **shared-cooperative gathering** checkpoint, targeted at roughly five minutes without a hard game clock. The experience is: **God has provided; gather enough for the tribe without gathering substantially more than it needs.** It represents an ordinary weekday gathering; Sabbath/double-portion gameplay, spoilage inventory, survival gating and a separate hoarding round are out of scope. Scripture framing explains the ordinary-weekday instruction concerning unused manna and ties it to the gameplay goal.

### Tribe choice and need
The group cooperatively chooses one of the twelve tribes to represent. An optional advisory vote may start discussion, but vote results never auto-select the tribe; the group still decides.

The game assigns a randomized hidden tribe population/size. The population itself is never displayed and tribe identity must not expose a predictable size advantage. The hidden size determines the playthrough's manna requirement, and the **calculated required amount is shown at the start**.

### One shared collection
There is exactly **one authoritative tribal manna total**. Do not maintain or display team manna totals.

All teams gather concurrently and independently at their own pace into the same tribal collection. Team communication is allowed and expected. Players on a team alternate as gatherers/answerers, but there is **no fixed round-robin order**. Bible Challenge difficulty always comes from the answering player's Player Profile.

### Shared manna field
Present manna as an attractive, naturally scattered field rather than a grid. Maintain at least **3× active team count** available/selectable portions at all times, with higher visual density allowed.

Portion appearance, size and location must not reveal its hidden value. First claim wins: a claimed portion immediately **grays out** for other teams while its Challenge is active.

On a correct answer, gather the portion, reveal that portion's value to the answering team/controller, add it to the one tribal total and remove/replenish the portion. On an incorrect answer, add nothing and return/reactivate the manna on the field.

For a rare truly simultaneous claim, all tied teams may receive the Challenge without being told the claim was simultaneous. If at least one tied team succeeds, the portion contributes its value **once** to the tribal total; if none succeeds, it returns to the field.

### Value distribution and pacing
Manna values derive from desired gameplay length rather than a fixed percentage of tribal need.

Baseline tuning targets approximately **8–12 successful Challenges per team**, with about 10/team as the normal statistical center. If `N` is target successes per team and `T` is active team count, the baseline mean portion value is approximately:

`tribalNeed / (N × T)`

Individual portion values follow a bell-curve-like distribution around that derived mean.

Game difficulty may increase target Challenge count and/or shift the distribution toward lower-value portions. Exact curve, variance/bounds and difficulty targets remain prototype tuning. Game difficulty never changes Bible-question difficulty; Player Profile remains authoritative.

### Challenge content
Every successful Challenge gathers manna; an incorrect answer simply returns that portion to the field. Challenges should normally be quick enough to support the gathering pace. Favor concise compatible Challenge Families such as MCQ, identify, true/false, brief matching/fill-in and before/after; avoid long typing and multi-stage puzzles.

Primary thematic pools/tags are:
- **God's Provision**;
- **Trust / Dependence on God**;
- **Thanksgiving / Contentment**;
- **God's Faithfulness**.

Reuse Challenge Resolver and existing adaptable Challenge Families rather than creating a Manna-specific trivia engine.

### Shared tribal basket
The main/stage display includes a large shallow woven **shared tribal basket**. Successful portions visibly accumulate there.

Basket fullness is driven by the **number of portions collected**, never their manna values or percentage of need. It has no numeric total, percentage, tick marks, capacity line or value-scaled fill and may become visually heaped. It is atmosphere/feedback, not a measurement instrument.

### Periodic measurement
The live total is not continuously displayed.

At a nominal cadence of **120 seconds ± 10 seconds**, briefly show the actual combined tribal measurement against the known need on the main/stage display. Each next interval is independently randomized to **110–130 seconds**. There is no countdown or advance indication. The update disappears after a brief display and gameplay does not pause.

When all teams have stopped, skip future periodic updates and proceed to final measurement.

### Stopping
A team stops either by explicitly selecting **Stop Gathering** or by remaining eligible to select manna but inactive for the configured timeout.

Prototype/default inactivity timeout is **15 seconds**. It runs only while the team is free to select manna, is suspended while a Challenge is active, and restarts after Challenge resolution. Private controller feedback may become more prominent near timeout.

Other teams are not notified when a team stops. **Stopping is final**; the team cannot resume after a later measurement. The randomized measurement cadence intentionally prevents reliably waiting for the next measurement without risking inactivity stop.

Gathering ends when all teams have stopped.

### Final measurement and shared points
After all teams stop, reveal the final tribal amount.

- **100–110% of need:** full shared checkpoint point award.
- **Below 100% or above 110%:** progressive deduction based on distance from the acceptable band.
- Under/over gathering alone must never reduce the checkpoint award below **75%**.
- Exact deduction curve remains tuning data.

There is no individual/team manna score, winner, failure gate or replay requirement. Canonical Journey progression continues regardless of the gathering result.

### Scripture framing
Opening presentation uses reviewed translation-aware Scripture through the material establishing God's provision, how much Israel is to gather, and the ordinary-weekday instruction concerning unused manna. Then gameplay begins.

After final measurement/shared scoring, remind players of God's instruction and explain the unused/kept-manna consequence as part of the biblical account rather than another mechanic, then continue with the reviewed translation-aware ending Scripture for the passage.

Players do not cause manna to appear, and God's canonical provision is never conditional on performance.

### Architecture / acceptance
Classify as **COMPOSE_EXISTING + reusable capabilities**. Reuse Challenge Resolver, Player Profile difficulty, controller semantic actions, shared stage state and Score Ledger. Generic behaviors must be capabilities/policies rather than Manna-only code, including where applicable: atomic shared claim/reservation with tie handling; concurrent shared collection; replenishing/scattered selectable fields; hidden-value item collection; advisory group polling; private/final participant stopping with inactivity policy; randomized intermittent shared measurement; count-based collection visualization; and need/team-count-derived value distributions. Do not create a separate Manna GameId/engine merely for this checkpoint.

Acceptance requires: chosen tribe with optional advisory vote; hidden randomized tribe size but displayed calculated need; exactly one tribal total; concurrent gathering; alternating players without forced round-robin; profile-based Challenge difficulty; scattered replenished field with at least 3× teams selectable; atomic/grayed claims and non-double-counted simultaneous claims; dynamically scaled bell-curve-like values; the four approved thematic Challenge pools; basket fill by portion count only; brief randomized 110–130-second measurements; private/final Stop or 15-second eligible inactivity stop; 100–110% full shared points with progressive deductions and 75% floor; no failure/progression gate; and Scripture-driven canonical opening/close.
