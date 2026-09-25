# Agon Gauntlet — Game Specification

## Status
Candidate/backlog game. Independently droppable without affecting shared Agon engines.

## Purpose
Gauntlet is a 1–4 player/team Scripture challenge race built from Agon's reusable game/challenge engines. Each match generates one shared sequence of different challenge-stage types. Every competitor begins at Stage 1. A correct result advances exactly one stage; an incorrect/timeout result leaves that competitor at the current stage for another attempt in the next synchronized Gauntlet Round.

The first competitor to clear the Final Gate wins the race, while normal Agon scoring from completed challenges remains part of the player's/team's score.

The game should test a broad range of Bible knowledge and Bible-use skills rather than becoming a collection of unrelated minigames. Compatible stages may include trivia, Bible navigation/Find It, cards, dice, spinner/wheel, ordering, Before/After/chronology, Who Said It/context, casting lots, matching, and other engines that expose a Gauntlet adapter.

No betting/wagering mechanics.

---

## Core invariant: same course, independent challenge instances
At match start Agon generates and persists a single **Gauntlet Course**. All competitors encounter the same ordered stage TYPES.

Example:
1. Trivia Gate
2. Card Bridge
3. Dice Tower
4. Before/After Fork
5. Ordering Steps
6. Find It / Scroll Chamber
7. Spinner Gate
8. Final Gate

Competitors do NOT necessarily receive the identical question/card/roll at a stage. Each receives an independently randomized, equivalent-difficulty challenge instance from that stage adapter so answers cannot be copied. The stage type, configured difficulty policy, scoring policy, and success condition are shared/fair.

---

## Competition capabilities
- players/teams: 1–4
- simultaneous competitive mode: 2–4
- solo mode: yes
- cooperative variant: future/not required initially
- tournament eligibility: generally not needed as a nested tournament game; Gauntlet itself naturally ranks 1–4 competitors
- Event challenge eligible: strongly yes
- persistent Game Session/Event compatible: required
- computer opponents: future adapter-compatible, not initial requirement

### Solo
Goal is to complete the course in the fewest Gauntlet Rounds/attempts, with normal challenge scoring retained. Optional personal-best/time stats may be shown without changing correctness.

### Competitive
All competitors act once per synchronized Gauntlet Round. First to clear the Final Gate wins. Other competitors should normally be allowed to finish for placement and continued Scripture engagement when Event timing permits.

---

## Synchronized Gauntlet Rounds
Gauntlet is NOT a free-running asynchronous race. Every competitor receives at most one stage attempt per synchronized round.

Example Round 6:
- Blue is on Stage 6 / Find It
- Gold is on Stage 4 / Before-After
- Red is on Stage 5 / Dice
- Green is on Stage 6 / Find It

Each receives one private challenge from the adapter for their current stage. When all competitors have locked/timed out (or Host resolves permitted adjudication), results reveal and advancement is committed together.

Correct -> advance one stage.
Incorrect/timeout -> remain on current stage.

No player can advance multiple stages in one Gauntlet Round merely by answering faster.

This keeps controller pacing fair and makes projector progress comprehensible.

---

## Gauntlet course generation
Course generation occurs once before play and is authoritative, seeded, validated, and persisted.

### Length presets
Recommended starting presets:
- Short: 5 stages including Final Gate
- Standard: 7 stages including Final Gate
- Long: 10 stages including Final Gate
- Custom: Host selects supported range

### Generation constraints
The course generator must:
- use only registered adapters with `supportsGauntletStage=true`
- verify enough eligible content exists before selecting a stage
- honor active age/content/difficulty/device/controller profiles
- avoid duplicate stage types by default; allow duplicates only by explicit configuration
- avoid adjacent near-identical mechanics
- balance stage learning/mechanic families where possible
- optionally guarantee at least one Bible-open/navigation stage
- choose Final Gate only from adapters declaring `supportsGauntletFinale=true`
- snapshot adapter/version/config for recovery
- produce deterministic results from persisted RNG seed/state

The entire course may be revealed before Stage 1 by default. Host may configure hidden/upcoming-stage presentation later, but hiding stages must never change the generated course.

---

## Difficulty policies
Support:
- **Flat**: Host-selected difficulty across stages
- **Ascending**: difficulty increases through course
- **Mixed**: stage difficulties generated within configured bounds
- **Adaptive participant profile**: same stage type but each participant receives content appropriate to configured age/ability profile while preserving equivalent stage success semantics

Difficulty must represent actual content/response complexity, not merely a score multiplier.

---

## GauntletStageAdapter
Do not embed entire games inside Gauntlet. Compatible engines/games expose a bounded single-attempt adapter.

Suggested contract concept:
- `adapterId`
- `displayName`
- `iconToken`
- `visualStationArchetype`
- `supportsGauntletStage`
- `supportsGauntletFinale`
- supported difficulty/content/player profiles
- `canGenerate(context)`
- `createAttempt(context, rng)`
- private/public projection contract
- authoritative `evaluateAttempt(response)`
- `success` boolean
- native Agon score transaction(s)
- review/reference/explanation projection
- persistence/version payload

A Gauntlet attempt must be bounded enough to complete within one synchronized round.

### Initial compatibility candidates
Likely compatible:
- standard Trivia/MC/typed answer
- Find It / Bible navigation
- Before/After/chronology
- Who Said It/context
- ordering
- Dice single-round challenge
- Spinner/Wheel single-round challenge
- Card single-round challenge
- Casting Lots single-round challenge
- compact match/reveal challenge where an objective can be resolved in one round

Likely NOT compatible without a purpose-built compact adapter:
- Multitude full timed round
- Wayfinder full maze
- Joust full match
- tournament structures
- any game whose meaningful result requires multiple internal rounds

No game is automatically compatible simply because it exists.

---

## Stage attempts and randomization
The stage TYPE is identical for every competitor at the same course position. The specific challenge instance is independently randomized per competitor/attempt.

Requirements:
- equivalent configured difficulty
- no answer leakage/copying
- avoid giving the same participant an identical failed challenge on immediate retry unless content pool forces it
- challenge IDs and RNG state persisted before delivery
- reconnect never regenerates an attempt
- competitors reaching a stage in different rounds still receive that stage's configured type/policy

---

## Progression and finish
Correct attempt advances exactly one stage. Wrong/timeout repeats same stage next round with a newly generated eligible challenge after previous attempt is finalized.

### Final Gate
The last course position is visually and mechanically designated **Final Gate**. Its adapter is randomly selected at course generation from finale-capable adapters unless Host explicitly configures one.

A competitor who fails Final Gate remains there and receives another Final Gate attempt next synchronized round. This allows trailing competitors to catch up naturally without artificial rubber-banding.

First competitor to successfully clear Final Gate wins. If multiple competitors clear it in the same synchronized round, use a symmetric configured tiebreak rather than submission speed by default. Recommended: a Sudden Gate series using the same difficulty policy until exactly one remains correct when another is incorrect/timeout.

Remaining placements can continue to completion. If Event/Host ends immediately, unresolved placements use explicit shared Event ranking rules such as furthest stage reached, then fewest attempts at current stage, then configured neutral tiebreak; never invent ordering from answer submission latency unless explicitly configured.

---

## Scoring
Maintain separation between:
1. **native Agon challenge points** from each stage adapter
2. **Gauntlet progression** (current stage)
3. **Gauntlet finish/placement**
4. **Event placement bonus**, if configured by Event system

A correct stage attempt automatically advances; a player cannot choose to remain and farm points.

Failed/repeated attempts must not create a scoring exploit. Recommended default: native correctness points are awarded according to the adapter, but a stage-completion/clear bonus can be awarded only once per stage per competitor. No negative wagering/stakes and no loss of previously earned points.

---

# Main Stage visual design — THE COURSE IS THE PROGRESS UI

## Hard visual requirement
**Do not represent Gauntlet primarily as generic progress bars, numbered tracks, or spreadsheet-like lanes.**

The Main Stage must render an **Agon-styled thematic Gauntlet course**, and each competitor's physical position within that course is the primary progress indicator.

Numeric/text status such as `Blue — Stage 4 of 7: Cards` is supplemental for accessibility/clarity only.

## Fit the established Agon UI
Gauntlet artwork/components must use the project's established Agon design system/reference assets:
- existing typography hierarchy
- established frames/panels/textures/material language
- team identity/color treatment
- icon/symbol treatment
- lighting/depth/illustration treatment
- spacing and responsive rules
- existing logo/branding rules
- Full/Reduced/Off motion conventions

Do not introduce an unrelated generic-fantasy/mobile-game visual style. Medieval/course imagery is interpreted through Agon's existing look and feel.

## Generated/composed course scene
At initialization, compose/select the complete course scene once from reusable Agon visual station archetypes and the generated stage list. The course remains stable for the entire match/reconnect.

Examples of thematic station archetypes (presentation, not hard binding):
- entrance/start arch
- gate
- bridge/drawbridge
- tower
- courtyard
- scroll/library chamber
- fork/crossroads
- ordering steps/stepping stones
- wheel gate
- card/scroll table
- dice-stone station
- final illuminated gate/castle entrance

The selected challenge adapter supplies an icon/symbol and compatible visual archetype so the station communicates its mechanic without turning the whole scene into literal oversized UI widgets.

## Team markers
Each competitor uses an Agon-consistent team marker such as shield/banner/standard/crest token derived from existing team identity. Do not invent unrelated avatars unless a future shared avatar system exists.

Each station reserves up to four non-overlapping marker anchor slots. Multiple competitors at one stage remain individually readable.

## Advancement animation
After authoritative synchronized result commit:
- correct competitor's marker visibly travels from current station to next station
- failed competitor remains at current station
- cleared station may react (gate opens, torch lights, bridge lowers, banner unfurls, etc.)
- reaction is cosmetic and driven from authoritative state
- next station becomes the competitor's visible location

The movement from station to station **is the progress indication**.

Reduced Motion: short crossfade/step between anchors.
Off Motion: marker instantly relocates with clear static before/after/status treatment.

## Final Gate presentation
Final Gate is visually identifiable from match start and clearly represents the goal. Clearing it moves the competitor through/beyond the final station and triggers Agon-consistent completion presentation. Do not replace this with a generic `100%` progress bar.

## Responsive scene composition
The course must remain legible at 4:3, 16:10, 16:9, common laptop/windowed sizes, and supported projector resolutions.

Do not simply scale one very wide bitmap. Use responsive scene/layout composition:
- station anchors derived from normalized/layout coordinates
- course may bend, wrap, zig-zag, or use depth to fit aspect ratio
- stage order remains visually unmistakable
- team markers never overlap essential labels
- final gate remains visible where practical
- safe areas reserve room for score/round/reveal overlays

For long 10-stage courses, support camera/pan/section focus while retaining an understandable overview/minimap only if necessary. Any overview must still use thematic station markers rather than becoming the primary generic progress bar.

## Result/reveal integration
During private attempts, Main Stage keeps the course visible and shows neutral per-team `ANSWERING` / `LOCKED` status without leaking answers. At synchronized reveal, overlay each team's result in an Agon-consistent presentation, then animate successful markers to their next stations.

---

## Player Controller
Controller shows the participant's current stage identity and private attempt, not the whole opponent answer state.

Required:
- current stage name/type and `Stage X of N`
- stage-themed Agon icon
- private challenge controls from adapter
- submit/lock
- after lock, waiting status
- after reveal, success/stay result and next-stage preview as allowed
- optional compact course overview using Agon station icons, not generic progress meter as primary representation

Support phone/tablet, portrait/landscape, touch/keyboard, accessible text sizing.

---

## Host Remote
Host sees:
- complete generated course and adapter/config snapshot
- each competitor's current stage/attempt count
- private attempt status
- authoritative answers/evaluation after lock as permitted
- adjudication before progression commit for Host-reviewed challenge types
- pause/resume
- audited void/replay attempt
- force timeout through authorized flow
- Event/scoring context
- recovery diagnostics

Host may inspect the logical course independently of the projector artwork.

---

## Scripture/learning requirements
Gauntlet should intentionally mix knowledge and Bible-use skills. Course generation may use learning-objective metadata to prevent every stage from being simple recall.

Recommended Standard-course rule: where content/profile allows, include at least one stage emphasizing direct Scripture navigation/observation/context.

Each adapter remains responsible for correct answer/reference/explanation. Review may occur immediately after synchronized reveal or in compact form so gameplay does not outrun learning.

Kids Mode adapters, if later enabled, must continue to honor Hear it -> Play it -> Say it -> Take it home and age-profile rules rather than bypass them merely because they are inside Gauntlet.

---

## Persistence/recovery
Persist/version:
- course ID, length, stage order/types
- station visual archetypes/layout seed
- adapter IDs/versions/config snapshots
- course RNG seed/state
- difficulty policy
- competitor stage positions
- per-stage clear state and attempt counts
- current synchronized round
- generated attempt IDs/question snapshots
- private responses/evaluation/adjudication
- native score transaction IDs
- progression transactions
- Final Gate/tiebreak state
- finish order/result
- projector animation acknowledgement/checkpoint as needed

Recovery cannot regenerate course, change station art/order, move a competitor, reroll an in-progress challenge, duplicate score/progression, reveal private data, or change finish order.

---

## Accessibility/privacy
- private challenges/answers only in authorized projections
- projector never contains unrevealed answer payloads
- non-color marker identity
- course order conveyed visually and semantically
- screen-reader stage/progress descriptions
- keyboard alternatives for all adapter interactions
- Full/Reduced/Off motion
- animation never required to understand progression
- responsive/reflowed layouts
- timeout accommodations

---

## Initial acceptance criteria
1. Generate deterministic 5/7/10-stage courses from registered compatible adapters.
2. All 1–4 competitors use identical ordered stage types.
3. Competitors receive independent equivalent-difficulty challenge instances.
4. Each synchronized round allows exactly one attempt per active competitor.
5. Correct advances exactly one stage; wrong/timeout stays.
6. Different competitors can simultaneously execute different adapter types after separating in progress.
7. Failed stage retry receives a new eligible challenge without rerolling course.
8. Challenge/course state survives reconnect exactly.
9. Final Gate is finale-capable and first clear determines winner subject to simultaneous-clear tiebreak.
10. Native Agon points remain separate from progression/placement and cannot be farmed by choosing not to advance.
11. Main Stage's primary progress representation is an Agon-styled spatial Gauntlet course, not progress bars.
12. Team marker movement between visual stations represents advancement.
13. Up to four markers remain readable at the same station.
14. Scene fits established Agon UI/reference design and does not introduce unrelated visual language.
15. Course scene/layout remains stable through match and reconnect.
16. Responsive layouts work at 4:3, 16:10, 16:9 and common laptop/windowed sizes.
17. Full/Reduced/Off motion communicate identical logical progress.
18. Private answers never leak through projector/course payload.
19. Host can pause/adjudicate/void/replay without duplicate score/progression.
20. E2E covers solo, 2/3/4 competitors, divergence across stage types, repeated failures, simultaneous advances, Final Gate tie, reconnect at every phase, and Event persistence.

## Dependencies
- shared Challenge Engine and content pools
- generalized Card/Deck infrastructure where adapters use it
- Dice/Spinner/Wheel/Casting Lots engines where adapters use them
- Timer/Buzzer only where selected adapter requires them
- Before/After/ordering/navigation challenge infrastructure
- Player Controller private input
- Host Remote
- shared scoring ledger
- persistent Game Session/Event infrastructure (#190 and related)
- shared responsive Agon visual system/reference assets
- learning-objective metadata (#257) where available

Do not duplicate any shared engine inside Gauntlet. Gauntlet orchestrates adapters, synchronized rounds, course progression, and its themed progress visualization.