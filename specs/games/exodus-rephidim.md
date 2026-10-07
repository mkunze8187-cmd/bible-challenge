# Exodus: Rephidim — Checkpoint Specification

**Status:** Design-approved
**Parent Journey:** #461 — Exodus Signature Journey
**Location:** Rephidim — Exodus 17
**Structure:** One Journey checkpoint containing two sequential experiences
**Architecture rule:** Reusability first; Exodus composes generic capabilities rather than owning generally useful mechanics.

## Checkpoint identity

Rephidim is one Journey location/checkpoint with two sequential experiences:

1. **Massah & Meribah / Water from the Rock** — Exodus 17:1–7; a minor Investigation/Testing challenge.
2. **Amalek Attacks Israel** — Exodus 17:8–16; a larger simultaneous endurance battle using linked Hill and Battlefield playing fields.

A Journey checkpoint may contain multiple sequential games, challenges, narrative events and transitions. Rephidim is the checkpoint name; the component experiences retain their own names.

After both experiences, the checkpoint closes with a combined reflection and transitions toward Sinai.

---

# Part I — Massah & Meribah / Water from the Rock

## Experience

Players investigate one hidden biblical subject while gathering public evidence. The gameplay deliberately uses testing/investigation language without revealing the full Exodus 17:7 interpretation up front. After play, the narrative reveals God's provision of water and the significance of Massah and Meribah: Israel tested the LORD, asking whether the LORD was among them.

The retrospective parallel is intentional: players tested an unknown subject by gathering evidence; Israel had already received evidence of God's provision yet tested whether He was among them.

## Hidden subject round

- One hidden subject equals one round; this is a minor game, not a multi-subject match.
- Category is announced: **Person, Place, Thing, or Event**.
- Every subject has at least **10 available question/evidence pairs**.
- Teams receive exactly **5 normal question opportunities** at every game difficulty.
- Turn order is determined by an existing randomizer capability such as dice or casting lots.
- Teams alternate selecting questions; answers become public evidence.
- After each answer, open a **5–10 second Solve window**.
- Pressing Solve commits the attempt and stops that team's solve timer while the answer is entered/selected; typing speed is not part of the challenge.
- Simultaneous Solve commitments are accepted and evaluated deterministically together.
- A correct solve immediately resolves the subject for everyone.
- A wrong solve does not eliminate the team or end the round.

## Shared scoring and wrong solves

- One shared point pool.
- Each wrong Solve deducts **5% of the original shared pool**.
- Wrong-Solve deductions are cumulative but capped at **50%**.
- Remaining points are divided evenly among teams.
- There is no early-solve bonus.

## Extra questions and Set Aside

After the five normal questions, if unresolved:
- the group may purchase up to **3 extra questions**;
- each extra question costs **5% of the original shared pool**;
- after each extra answer, the normal Solve window occurs;
- the group may choose **Set Aside Subject** instead of purchasing another question;
- after three extras, an unresolved subject is automatically set aside and replaced;
- Set Aside has no additional penalty;
- existing deductions remain and the shared pool does not reset;
- maximum exposure for one subject is eight questions: five normal plus three paid;
- unused evidence is not revealed after a solve or Set Aside, preserving replay value.

Player-facing action is **Set Aside Subject**; replacement is the system result.

## Solve input and difficulty

- **Easy:** persistent fixed-choice dropdown with 10–15 plausible answers and exactly one correct answer. Wrong choices are not removed, reordered or marked.
- **Normal / Hard / Expert:** typed answer with normalization, aliases and appropriate spelling tolerance.
- Number of free questions and wrong-solve penalty do not change by difficulty.
- Difficulty primarily changes subject obscurity and evidence/question composition.
- **Expert evidence retention:** only the most recent question plus terse answer remains visible. Earlier evidence must be remembered/communicated.
- Easy/Normal/Hard retain accumulated asked question/answer history.

Reusable evidence-retention policies should include at least `ALL` and `LATEST_ONLY`.

## Evidence authoring rules

Author subjects evidence-first:
1. select at least ten terse, atomic evidence answers that describe the subject;
2. author/select a valid question for each answer.

Prefer specific evidence over generic yes/no where useful, but **the availability of an unasked question must provide no reliable evidence about the hidden subject**. Question templates cannot leak that their premise is true. For example, a generic sibling question must be valid both when a sibling is known and when the legitimate terse answer is "No sibling identified/recorded."

Answers:
- answer exactly what was asked;
- remain terse and atomic;
- may be names, places, quantities, classifications, yes/no, or concise absence/unknown statements;
- do not volunteer adjacent clues, explanations, references or related facts unless requested.

Maintain reusable category-level question-dimension/template libraries for Person, Place, Thing and Event. Content-pack validation should detect premise/question-list clue leakage and invalid question/evidence pairs.

Unused questions/evidence remain secret after resolution so the same subject may return later with different selected questions.

## Scripture flow

Opening: arrive at Rephidim with no water (Exodus 17:1–3) without front-loading the later "testing the LORD" conclusion.

After the Investigation challenge:
- Moses cries to the LORD;
- God directs Moses concerning the rock at Horeb;
- water is provided;
- present Exodus 17:7 and the significance of Massah/Meribah, including Israel's question whether the LORD was among them.

---

# Part II — Amalek Attacks Israel

## Experience identity

This is a cooperative, simultaneous endurance battle based on Exodus 17:8–16.

All teams fight as distinct visible tribal forces within **one shared Israelite army** under Joshua. All teams must also watch Moses on the Hill and occasionally send participants to help. There are no separate team fronts, team victories, RTS troop commands or elimination objective.

The battle lasts until sunset. Remaining Amalekite forces are defeated and flee/withdraw at the end; gameplay never requires killing every enemy.

## Multiple Playing Fields

The game uses two linked playing fields:

### Battlefield
- Main active-play field.
- All active Battlefield Challenge streams operate simultaneously; never alternate teams.
- Stage shows one shared battlefield with distinct visible tribal forces.
- Battlefield perspective exposes local fighting and battle pressure, but not exact overall progress.

### Hill
- Moses is visible above the battle.
- During active battle, Main Stage normally shows Hill as a persistent small circular PiP.
- Battlefield controllers may select the Hill control/PiP to move their own participation to Hill when permitted.
- A Hill participant sees an integrated elevated Hill scene with Moses/Aaron/Hur and a broad battlefield below/background; do not cram a miniature stage beside the Challenge UI.
- Hill perspective may expose broad strategic battle condition unavailable from the Battlefield, but never an exact numeric progress meter.

### Presentation/transition rules
Multiple Playing Fields is a reusable platform capability. A game independently configures Main Stage primary/PiP, controller primary/PiP, PiP selectability/interactivity, stage/controller switching, synchronized versus individual transitions, access rules and participant limits.

Field **availability** is separate from field **presentation**.

Transitions may be player-, host-, or game-initiated and may target Main Stage, all controllers, a team, one participant, selected controllers or configured surface groups.

Rephidim uses game-initiated transitions for its cinematic opening, Phase 2, and ending.

## Opening

Do not reveal all of Exodus 17:8–16 before play.

Introduce:
- Amalek attacks at Rephidim;
- Moses tells Joshua to choose men and fight;
- Moses will stand on the hill with the staff of God.

Start Main Stage on the Hill. Moses initially holds the staff/arms at rest, then deliberately raises his arms. As they rise, Israel begins pressing into battle. The camera transitions/zooms from Moses/Hill down into Joshua/Battlefield. Battlefield becomes Main Stage primary and Hill becomes the persistent PiP.

This teaches the relationship through action rather than a tutorial popup.

## Battlefield Challenges

Content themes include:
- endurance/perseverance;
- God providing strength;
- physical battles;
- spiritual battles;
- health/physical struggles;
- mental/emotional struggles;
- weapons/armor;
- courage/deliverance;
- cooperation, mutual support and working together.

Use **quick Challenge types**, targeting roughly **15–20 seconds per Challenge**.

Battlefield Challenge difficulty uses Player Profile as the normal baseline and Moses' arm state as a dynamic modifier:
- arms high: profile-level difficulty;
- lowering arms: progressively harder;
- arms fully down: **Expert difficulty for everyone**, intentionally overriding the normal profile envelope because Israel should make little or no progress in this state.

The resulting difficulty and point value are locked when a Challenge is issued; later arm movement does not change an in-progress Challenge.

## Hill Challenges

Hill content emphasizes:
- endurance/perseverance;
- God providing strength;
- helping/supporting others;
- weariness and renewal;
- dependence on God;
- biblical examples of God sustaining His people.

Use **medium-length Challenge types**.

Hill Challenge difficulty is controlled **only by Player Profile**. Arm position, battle state and elapsed time never increase Hill Bible-question difficulty. Hill pressure comes from endurance depletion, not harder questions.

Wrong Hill answers have no explicit penalty; they simply restore no endurance.

## Phase 1 — Moses alone

- Moses begins alone with both arms sharing **one endurance state**.
- Arm position is the player-facing endurance display; do not show a numeric endurance bar.
- Zero endurance means both arms are fully down.
- Successful Hill Challenges restore depleted endurance up to the currently recoverable amount; no overflow/banking.
- Current depth/duration of exhaustion affects recoverability: spending longer/deeper at low endurance causes successful restoration to become less effective.
- Elapsed battle time also increases Moses' underlying exhaustion/recoverability decline.
- Good Hill management may delay the transition, but cannot prevent it.
- Phase 2 must occur **before the halfway point** of the configured battle duration, with tuning generally targeting approximately the 30–45% range.
- Time influences the fatigue/recoverability system rather than directly firing the transition.

### Phase 2 trigger

Phase 2 begins when a **successful Hill Challenge can no longer raise Moses' arms**.

Zero endurance by itself is not the trigger if a successful Challenge can still raise his arms.

## Phase 2 — Stone, Aaron and Hur

When the trigger occurs:
- active fighting pauses;
- the game changes Main Stage playing field from Battlefield to Hill;
- all participants see Moses unable to lift his arms through the existing support mechanic;
- show the biblical transition: a stone is provided for Moses to sit on, and Aaron and Hur come alongside to support his hands;
- after the transition, Moses' arms rise, the game returns/zooms to Battlefield, Hill returns to PiP, and fighting resumes.

This is a game-state/narrative transition, not punishment for failure.

## Phase 3 — Aaron and Hur

- Aaron and Hur have **independent endurance states**, each controlling one supported arm.
- Their starting endurance, maximum endurance, depletion rate and acceleration do **not** need to be identical.
- Up to **two participants** may work on Hill simultaneously.
- Each Hill participant independently chooses **Support Aaron** or **Support Hur**.
- Duplicate targeting is allowed; both participants may choose the same supporter.
- Successful Challenges restore only depleted endurance and cannot exceed the target's maximum; extra restoration never banks.
- Aaron and Hur's depletion rate increases over time if not replenished.
- Unlike Moses, Aaron and Hur **never enter an unrecoverable critical state**. They may reach zero and allow an arm to fall completely, but successful Challenges can always restore them.
- A one-player game manages the two supporters sequentially; larger groups may devote two participants simultaneously.

Moses' two arm positions are the visible endurance indicators; separate stamina bars are unnecessary.

## Hill occupancy and inactivity

Hill occupancy requires active participation.

After entering Hill, a Challenge is immediately available. After resolving it, the participant chooses **Help Again** or **Return to Battle**. Help Again immediately starts the next Challenge. Do not automatically return an actively helping participant after each Challenge and do not impose a maximum Hill stay.

If the participant is not actively engaged:
- Easy/Normal: **15-second** inactivity timeout;
- Hard/Expert: **10-second** inactivity timeout.

On timeout, automatically return that participant to Battlefield and immediately free the Hill slot. Active Challenge reading/answering time does not count as inactivity.

This is a reusable **activity-required field occupancy** policy.

## Battle pressure model

Use one simple hidden signed battle-pressure value:

**Battle Pressure = Moses Arm Pressure + Recent Fight Results**

- positive: Israel prevailing;
- negative: Amalek prevailing;
- value is never shown numerically.
- Moses' arm height directly contributes continuous pressure, faithful to Exodus 17:11.
- During Aaron/Hur phase, each arm contributes independently.
- Correct Battlefield Challenges add short-lived positive impulses.
- Wrong Battlefield Challenges add no explicit penalty; they simply add no progress while pressure continues.
- Fight-result impulses decay naturally so ongoing participation matters.
- Fully lowered arms provide strong enough negative pressure that occasional Expert successes generally cannot overcome it.

Do not add unnecessary RTS/combat subsystems or an Amalek HP pool.

## Battlefield status presentation

The **primary status indicator is directional pressure arrows** integrated into the battlefield:
- direction indicates which side is prevailing;
- size/intensity/number indicates strength;
- near equilibrium arrows become weak/subtle or disappear;
- arrows remain useful when physical troop movement has reached a visual boundary.

Secondary indicators:
- bounded forward/backward movement of the battle line;
- visible Amalekite pressure/density and local combat behavior.

Both advance and pushback have hard visual bounds before sunset. Israel cannot visibly advance far enough to imply final victory, and Amalek cannot push far enough to imply Israel's defeat. Underlying pressure may continue changing after a visual movement boundary is reached; arrows/intensity continue communicating that state.

Battlefield players always see substantial enemy forces and never receive enemy count, health, territory percentage or exact progress.

## Sunset and duration

Battle duration is **fixed once play begins** and is configured by game difficulty. Initial playtest targets:
- Easy: ~12 minutes;
- Normal: ~15 minutes;
- Hard: ~18 minutes;
- Expert: ~20 minutes.

Exact values remain tuning data, but the fixed-time-by-difficulty principle is design-approved.

Do not show an exact countdown. The sky is the natural clock: progressive daylight/afternoon/lowering sun, subtle warming/dimming, longer shadows and stronger horizon/silhouette treatment communicate the approach of sunset.

As sunset approaches:
- Aaron/Hur depletion pressure increases;
- Moses' arms may spend more time somewhat lowered;
- **compress ordinary late-game arm-effect variation** so moderate sagging does not make Amalek appear decisively victorious immediately before the canonical ending;
- fully lowered arms remain materially bad.

At sunset:
- active Challenges stop;
- battle pressure/fighting settles gradually rather than instantaneously flipping;
- Main Stage performs the reverse transition from Battlefield to Hill;
- from the broader Hill perspective everyone sees defeated remaining Amalekite forces breaking/fleeing/withdrawing;
- Moses may finally lower his arms because the battle is over.

## Scoring

Each correct Battlefield Challenge earns points into a **shared cumulative battle pool**. Hill Challenges earn no direct points; their value is sustaining the conditions that allow the army to prevail and continue winning fights.

Challenge point value rises with the actual resulting Battlefield difficulty caused by Hill endurance and falls again as arms recover. Reward is locked when the Challenge is issued.

Do **not** show a persistent accumulated-points visualization or Manna-style collection visual. Immediate Challenge reward may appear locally on the controller. The battlefield itself—especially pressure arrows—is the persistent status visualization.

At sunset:
1. total earned Battlefield points form the shared pool;
2. divide the shared pool evenly among teams;
3. apply team-specific inactivity adjustments to that team's share only.

## Battlefield inactivity adjustment

Qualifying Battlefield inactivity is tracked only while a committed gameplay stream is expected to participate on Battlefield.

- Hill participation never counts as Battlefield inactivity.
- Active Challenge reading/answering, game transitions, animations, Phase 2 and other non-actionable periods do not count.
- Every **30 cumulative seconds** of qualifying inactivity deducts the equivalent of **one base/normal Battlefield Challenge** from that team's final share.
- Use base Challenge value, not a dynamically elevated Moses-arms value.
- Discard an incomplete final remainder under 30 seconds rather than prorating.
- Deductions apply only to the inactive team's allocation; active teams are not charged for another team's inactivity.
- A team that meaningfully participated has a **50% floor**: inactivity deductions cannot reduce its pre-deduction shared allocation below half.
- Complete nonparticipation may be handled separately and does not automatically receive the participation floor.

The cooperative pool is therefore shared-earned scoring with participant/team-specific post-distribution adjustments.

## Participation and controllers

All Battlefield gameplay is simultaneous; teams/players never alternate with other teams.

### Team Mode
Exactly one active Battlefield Challenge stream per team.

Before play, Team Mode configures one of:
- **Fixed Player:** one designated team player operates the stream for the round/game.
- **Alternating Players:** the active actor rotates among designated team members according to game rules.

Team Mode does **not** imply one physical controller. If the current actor has a connected controller, the team stream can activate on that controller; otherwise a shared team controller may be used. Separate:
- gameplay stream ownership;
- active actor;
- input-device/controller assignment.

### Player Mode
Each player who **has a controller and opts in before play** receives an independent simultaneous Battlefield Challenge stream.
- rostered players without controllers create no stream;
- controller-equipped players who do not opt in create no stream;
- once opted in, the player remains committed through sunset and cannot opt out merely to avoid inactivity;
- moving to Hill is valid participation and pauses that player's Battlefield inactivity;
- additional opted-in streams increase potential shared points and also increase inactivity exposure attributed to their teams.

This is one Agon experience where active participants may exceed team count. The same capability may also apply to Manna and other suitable games.

Generalize as a **Concurrent Actor / Participation Scope** capability supporting team-owned streams, opted-in controller-equipped player streams and future configured roles.

## Scripture resolution and Rephidim close

After the sunset victory reveal, finish the biblical account before showing scores:
- Joshua defeats Amalek;
- the LORD instructs Moses to record the event as a memorial and rehearse it to Joshua;
- Moses builds the altar **The LORD Is My Banner / YHWH-Nissi**;
- use reviewed, translation-aware Scripture presentation.

Then show a concise cooperative battle report:
- fights won;
- shared battle points;
- equal team share;
- team-specific inactivity adjustment only where applicable;
- final team award.
Do not rank teams as separate battle winners. Hill Challenges may be shown as a non-scoring accomplishment if useful.

Close Rephidim by connecting its two experiences: at Massah/Meribah Israel asked whether the LORD was among them; immediately afterward at Rephidim, the people had to depend on God's strength/provision when Amalek attacked.

Mark Rephidim complete, return briefly to the Journey map, and show **Sinai visibly ahead**.

## Reusable capabilities surfaced by Rephidim

Implement generically when not already present:
- checkpoint composition containing multiple sequential activities/narrative transitions;
- Investigation / Deductive Identification;
- evidence-first hidden-subject authoring and category question templates;
- public evidence with configurable retention (`ALL`, `LATEST_ONLY`);
- timed Solve windows with committed answer-entry timing;
- simultaneous solve resolution;
- fixed-choice/free-text answer modes with normalization/aliases;
- shared reward pool with participant-triggered deductions;
- bounded paid extensions and Set Aside/replacement;
- replay exposure tracking and question-list clue-leakage validation;
- Multiple Playing Fields and independent presentation surfaces;
- field availability vs field presentation;
- player-, host- and game-initiated field transitions;
- linked activity fields and configurable influence/modifier channels;
- perspective-scoped information;
- dynamic participant movement between fields;
- activity-required field occupancy;
- endurance objectives;
- independent support targets and concurrent secondary roles;
- bounded restoration with no overflow/banking;
- fatigue/recoverability where deep/prolonged depletion reduces restoration;
- shared objective with distinct visible contributors;
- simple dynamic battle/front advantage;
- bounded visual state projection;
- dynamic Challenge reward based on resolved difficulty;
- participation/inactivity tracking with team-specific post-distribution adjustments and floors;
- Concurrent Actor / Participation Scope;
- separation of gameplay-stream ownership, active actor and controller assignment;
- composable post-game sequence: **Cinematic Resolution -> Scripture/Narrative -> Results -> Reflection -> Journey Transition**.

Exodus owns the Scripture, Rephidim theming, authored sequence, visual assets and tuning presets; reusable mechanics belong to generic Agon capabilities/contracts.

## Acceptance

- [ ] Rephidim is one checkpoint containing Massah & Meribah then Amalek.
- [ ] Massah & Meribah follows the five-normal-plus-up-to-three-paid Investigation structure and evidence-authoring rules.
- [ ] Amalek uses one shared battlefield plus linked Hill playing field; all Battlefield streams act simultaneously.
- [ ] Moses' arms directly affect both battle pressure and Battlefield Challenge difficulty.
- [ ] fully lowered arms produce Expert Battlefield Challenges and strong Amalek pressure.
- [ ] Phase 2 is triggered by a successful Hill Challenge no longer being able to raise Moses' arms and occurs before halfway through the battle.
- [ ] fighting pauses and all players see the stone/Aaron/Hur transition on the Hill.
- [ ] Aaron and Hur have independent, potentially unequal endurance/depletion and never become unrecoverable.
- [ ] Moses' arm positions are the endurance display; no numeric stamina bar is required.
- [ ] Hill inactivity returns participants after 15s Easy/Normal or 10s Hard/Expert.
- [ ] pressure arrows are the primary battlefield status indicator.
- [ ] battle duration is fixed by difficulty; no exact countdown is shown.
- [ ] sunset uses progressive lighting and reduced ordinary late-game arm-effect variation.
- [ ] sunset ends active Challenges and reveals Amalek fleeing from the Hill perspective.
- [ ] Battlefield Challenge points are shared-earned, difficulty-sensitive and hidden as a running total.
- [ ] every 30s qualifying inactivity costs only the responsible team one base Challenge-equivalent, with a 50% floor for participating teams.
- [ ] Team Mode supports Fixed Player or Alternating Players and does not require passing one physical controller.
- [ ] Player Mode creates streams only for controller-equipped players who opt in before play.
- [ ] Scripture is revealed progressively so Aaron/Hur is not spoiled in the opening.
- [ ] post-game order is cinematic resolution, Scripture, results, Rephidim reflection, Journey transition.
- [ ] generic mechanics are implemented as reusable capabilities rather than Exodus-only code.
