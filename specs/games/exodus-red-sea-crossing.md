# Exodus: Red Sea Crossing — Checkpoint Specification

> **Status: design-approved 2026-10-06.** Tracking: #602. Parent Journey: #461. Implementation targets Agon vNext. Exact numeric curves/timers/rates marked as prototype values remain playtest tuning.

## Classification
**Parent Journey:** #461 Exodus: The Journey  
**Experience:** Red Sea Crossing — Exodus 14:10–31; Exodus 15:1–21  
**Mode:** SHARED_COOPERATIVE real-time mass movement/logistics  
**Target:** Agon vNext only

## Identity
Red Sea Crossing is not a Bible-question round, race, or tournament. All participants cooperate to move Israel through the opened sea and assemble the twelve tribes on the far shore.

> **Players organize and move Israel. God saves Israel.**

Players do not open the sea, cause the pillar, defeat Egypt, or cause the sea to close. There is no loss condition; mistakes make the crossing harder/longer but never make canonical deliverance impossible.

## Scripture / canonical sequence
Opening follows Exodus 14 in order:
- 14:10 Pharaoh approaches; Israel fears.
- 14:11–12 Israel complains.
- 14:13–14 Moses tells Israel not to fear; the LORD will fight for them.
- 14:15 God commands Israel to **go forward**.
- 14:16–18 command concerning the sea and declaration concerning Pharaoh.
- 14:19–20 angel/pillar moves behind Israel.
- 14:21 Moses stretches out his hand; the LORD drives back the sea by the east wind.
- 14:22 opened passage / gameplay handoff.

Use a substantial Scripture-driven opening. No free planning phase/countdown: once controls activate, time is already passing.

After the last tribe is across and assembled, player control ends and the canonical narrative resumes:
- 14:23–31 Egyptian pursuit, morning watch, troubled chariots, sea returns, Israel sees the LORD's deliverance.
- Exodus 15:1–19 Song of Moses carries most of the closing.
- **End the biblical experience with Miriam, Exodus 15:20–21.**
- Only after Miriam resolves/fades may Agon show results.

## Stage / camera
One continuous stage: **Near Shore -> Sea Passage -> Far Shore / Assembly Area**.
- normal operational viewport shows only part of the crossing (prototype target ~1/4 length);
- synchronized minimap shows simple tribe identity/position only, not enough detail to manage formations;
- environment progresses Night -> Deep Night -> Morning Watch -> Approaching Dawn;
- one shared main camera for all teams;
- every controller has synchronized PAN Near Shore <-> Far Shore;
- newest PAN input controls the shared camera;
- no automatic camera movement during active gameplay;
- selection/alerts do not move camera;
- constrain zoom so players cannot defeat the shared-attention mechanic.

## Tribes / procession
Use Jacob's twelve sons directly:
Reuben, Simeon, Levi, Judah, Dan, Naphtali, Gad, Asher, Issachar, Zebulun, Joseph, Benjamin.

Near shore starts as a randomized broad semicircle. Tribes do not move automatically.

Multiple tribes may move concurrently, but **there are no side-by-side tribal lanes in the sea**. They form a sequential procession distributed along the crossing.

Each tribe is always **one contiguous cohesive-but-deformable formation**. It may stretch, compress, skew, bow or bunch but never splits into detached pieces.

## Real-time command model
Movement is continuous. SUBMIT changes a tribe's persistent instructions; it does not advance one turn/step.

Command flow:
**TRIBE -> COMMAND (+ magnitude/pace where applicable) -> SUBMIT**

Core commands:
- MOVE — resume retained direction/pace;
- HALT — propagate a stop instruction; physical stopping is gradual;
- FORWARD — establish forward direction plus commanded/max pace; can start stationary tribe;
- LEFT / RIGHT — persistent directional correction; advanced magnitude 1–5; can start stationary tribe;
- PACE — persistent abstract pace;
- REGROUP — persistent slow movement mode (~Pace 1) prioritizing formation/cohesion recovery.

FORWARD/LEFT/RIGHT/REGROUP can start or resume a stationary tribe. HALT retains prior direction/pace settings. No CANCEL after submission.

## Propagation / multi-controller cooperation
All command types use the same base propagation rate (prototype target ~15 sec end-to-end healthy; tune ~10–20 sec).
- conditions change physical response, not propagation speed;
- later commands do not erase earlier commands already propagating;
- simultaneous controller submissions are accepted;
- no tribe ownership lock, conflict warning or automatic reconciliation;
- conflicting/duplicate commands may cause different portions of one continuous formation to respond differently and deform;
- recent-command history may be shown per tribe.

## Conditions
Selected tribe exposes **Fatigue, Stress, Cohesion** using Green -> Yellow -> Orange -> Red gauges. Physical deformation remains visible on Stage.

**Fatigue**
- accumulates increasingly with pace and stress;
- meaningful direct slowdown begins after a threshold and becomes nonlinear;
- regions may fatigue differently while one overall gauge is shown;
- low pace/HALT permit recovery; recovery does not automatically restore formation.

**Stress**
- modestly increases natural pace;
- increases fatigue accumulation;
- undermines cohesion.

**Cohesion**
- controls consistency of local pace/heading/response;
- low cohesion increases local variance/deformation rather than applying a flat speed penalty;
- low cohesion raises stress; high cohesion helps stress fall; high stress lowers cohesion, with damping to avoid trivial runaway.

## Pace / response prototype
Prototype ideal full-crossing times:
- Pace 1 ~8 min
- Pace 2 ~6 min
- Pace 3 ~4.5 min
- Pace 4 ~3.5 min
- Pace 5 ~3 min

Prototype relative base speeds: .56 / .75 / 1.00 / 1.29 / 1.50.
Prototype fatigue accumulation multipliers: .15 / .40 / 1.00 / 1.75 / 3.00.

Acceleration/deceleration and HALT are physical, progressive responses. High-speed emergency HALT can create compression. Exact numeric curves are playtest tuning.

## REGROUP / recovery
REGROUP always moves slowly; it never means full stop and never magically repairs state.
- from high pace, tribe must decelerate into regrouping and abrupt use may itself compress/distort;
- once established, REGROUP lets faster areas moderate, lagging areas catch up and cohesion recover;
- remains active until explicitly replaced;
- HALT is strongest for fatigue recovery;
- REGROUP is strongest for cohesion recovery.

## Passage / water boundary
Passage is broad and straightforward: no maze, dead ends, sharp turns or dramatic bottlenecks. Gentle curvature requires occasional correction.

Water boundary is not a hard wall. Contact slows/redirects the affected outer region while the rest continues, producing asymmetric movement -> skew/stretch -> local compression -> cohesion deterioration if uncorrected.

## Collision escalation
When one tribe reaches another, physical obstruction immediately causes congestion/slowdown.

**Contact -> Congestion -> Intermingling -> Dispute -> Fighting**

Elapsed unresolved time is the fundamental escalation driver. Stress/cohesion may modify later escalation speed.
- congestion compresses/slows formations;
- unresolved congestion progresses to intermingling;
- unresolved intermingling progresses to dispute;
- unresolved dispute can progress to fighting;
- fighting is not combat/HP; it costs time, movement, cohesion and stress.

Resolve the underlying traffic/formation problem using existing commands; no special RESOLVE CONGESTION action. Exact escalation timers are playtest tuning.

## Rare internal problems
Internal problems are rare, state-driven localized complications, not arbitrary event-card spam:
- Livestock Trouble
- Cart / Possessions Trouble
- Family Difficulty
- Dispute
- severe: Panic
- severe escalation: Fighting

REGROUP is the universal resolution mechanism once slow regrouping reaches the affected area. Problems are discovered through Stage behavior and selected-tribe inspection; no automatic popup/banner.

## Far-shore assembly
Tribes are directed into a broad semicircle. No tribal order is required there.

A tribe counts assembled when fully clear of the exit, in the assembly area, stopped and sufficiently settled. Perfect cohesion/placement is unnecessary.

Assistance:
- Easy: clear semicircular guidance
- Normal: subtle guidance
- Hard/Expert: none

Guidance is never magnetic or tribe-specific.

## Completion / bonuses
Dawn is **not failure**. Play continues until every tribe is safely across and assembled.

Only two cooperative bonuses:
1. **Before Dawn** — all twelve tribes across and assembled before dawn.
2. **Progression Order** — tribes enter in Jacob's sons' birth order: Reuben -> Simeon -> Levi -> Judah -> Dan -> Naphtali -> Gad -> Asher -> Issachar -> Zebulun -> Joseph -> Benjamin.

Progression Order is gameplay, not a claim about historical Red Sea marching order. Out-of-order launch simply forfeits the bonus.

Do not add cohesion/fatigue/peace medals or individual/team winners.

## Difficulty presets
| Setting | Easy | Normal | Hard | Expert |
|---|---|---|---|---|
| Starting pace | 1 | 2 | 3 | 4 |
| Starting stress | Green | Low Yellow | Yellow | Yellow |
| Far-shore guidance | Clear | Subtle | None | None |
| Direction control | Simple | Simple | 1–5 | 1–5 |
| Pace control | Simple | 1–5 | 1–5 | 1–5 |
| Internal problems | Very rare | Rare | Rare | Rare |
| Simulation rules | Same | Same | Same | Same |

Difficulty changes initial pressure/assistance, not fundamental physics. Before Dawn timing and Progression Order requirements remain identical across difficulties.

## No-loss invariant
No permanently immobilized tribe, impossible internal problem or unrecoverable death spiral. Severe states remain recoverable through slowing, regrouping and good management.

## Architecture / capability audit
This checkpoint demonstrates reusable needs for:
- continuous deformable group/formation simulation;
- persistent propagating command state;
- synchronized shared camera control across controllers;
- authoritative real-time multi-controller input;
- condition/state simulation and congestion escalation.

Implement reusable capabilities where justified by additional consumers; keep Exodus-specific Scripture, twelve-tribe identity, sea presentation, bonuses and narrative in the official Exodus Content Pack. Coordinate traversal/capability conclusions with #474 rather than duplicating a separate Exodus Adventure game.

## Acceptance
- [ ] Scripture sequence follows Exodus 14 in order and closes through Exodus 15, ending with Miriam 15:20–21.
- [ ] no Bible-question challenges inside Red Sea Crossing.
- [ ] no player action causes God's miracles or Pharaoh's defeat.
- [ ] one shared real-time crossing and shared camera.
- [ ] twelve randomized near-shore tribes and sequential sea procession.
- [ ] continuous persistent commands with propagation and multi-controller conflicts.
- [ ] contiguous deformable formations; never detached tribe pieces.
- [ ] Fatigue/Stress/Cohesion interactions and visible physical consequences.
- [ ] gradual acceleration/deceleration/HALT and persistent slow REGROUP.
- [ ] water-boundary asymmetric slowdown/deformation.
- [ ] timed Contact -> Congestion -> Intermingling -> Dispute -> Fighting escalation.
- [ ] internal problems remain rare and resolve through REGROUP.
- [ ] far-shore semicircle assembly and difficulty-specific guidance.
- [ ] no loss condition.
- [ ] only Before Dawn + Progression Order bonuses.
- [ ] fixed difficulty presets above with identical simulation rules.
- [ ] player control ends before canonical Egyptian defeat; Miriam is final biblical beat before results.
- [ ] exact numeric curves/escalation timers/problem rates remain prototype/playtest tuning.

