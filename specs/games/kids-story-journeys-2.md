# Kids Bible Story Journeys — Expansion Set 2

## Scope
This specification defines six Kids Scripture experiences selected for Agon:

1. **Joseph: From Pit to Palace** — Genesis 37; 39–50
2. **Abraham: Follow the Promise** — Genesis 12–22 (with later promise/family context where appropriate)
3. **Daniel: Faithful Every Day** — Daniel 6
4. **The Way Home** — Luke 15:11–32
5. **Emmaus: Along the Way** — Luke 24:13–35
6. **Saul: Turned Around** — Acts 9 with reviewed before/after context from Acts

These should be implemented as composed Kids Scripture experiences over shared engines/capabilities, not six bespoke engines.

## Catalog / duplicate rules
Before assigning final GameIds, implementation must re-run the catalog/migration audit. Known overlap is intentional:
- **Joseph's Coat** remains the preschool pattern game; From Pit to Palace is the broader older-kids narrative/providence journey and may embed/reuse Joseph's Coat content rather than replace it.
- Generic story ordering such as **What Happened Next?** remains a reusable challenge/activity and can be embedded in all six experiences.
- Existing Journey/Campaign, Board, Image Board, Ordering, Perspective Scenario, Challenge, BibleTextService, Stage and Kids Story Activity composition capabilities must be reused.
- `Turned Around` is a thematic title/profile and must not duplicate Jonah: Turn Around mechanics or GameId; shared route/turnaround presentation should be reused where appropriate.

## Shared Bible Story Journey profile
These six experiences expose a need for a reusable **Bible Story Journey profile** over Kids Story Activity composition. This is orchestration/configuration, not a new simulation engine.

A journey definition should support:
- ordered Scripture checkpoints/scenes;
- optional map/location or abstract timeline presentation;
- Scripture narration/read-along through BibleTextService;
- embedded activities/challenges between scenes;
- canonical-event locks: player performance never changes recorded Scripture outcomes;
- optional evidence/theme markers collected for a final review visualization;
- age/difficulty profiles;
- save/resume at checkpoint/activity state;
- host/family discussion pauses;
- final Scripture/theme review, Say It, and Take It Home;
- reusable Stage transitions and controller participation.

The same profile can later support Ruth, Exodus, Prodigal Son, Jonah, Zacchaeus and other narrative experiences.

# 1. Joseph: From Pit to Palace

**Primary audience:** 6–10 / family
**Passages:** Genesis 37; 39–50
**Learning emphasis:** God's providence, forgiveness/reconciliation, faithfulness through changing circumstances.

## Distinctive mechanic — Providence Threads
Children progress through major Joseph scenes: dreams/family conflict -> pit/sold -> Potiphar -> prison -> dreams -> Pharaoh -> responsibility in Egypt -> famine -> brothers -> recognition/reconciliation.

At checkpoints, players collect **event/evidence threads**. At the end the Stage reconnects apparently disconnected events into a timeline and reviews Genesis 50:20 in context. The game must not claim every harmful act was morally good; it distinguishes human intent/actions from God's providential outcome.

Activities may include ordering, character/location matching, dream/event association, Who's in the Story-style identification, Scripture lookup and Perspective Scenario for reviewed application after the canonical narrative.

### Relationship to Joseph's Coat
Do not duplicate #244. Joseph's Coat can be offered as an optional preschool/younger sibling activity or embedded early activity if compatible. From Pit to Palace is the narrative journey for older kids.

# 2. Abraham: Follow the Promise

**Primary audience:** 6–10 / family
**Passages:** Genesis 12, 13, 15, 17, 18, 21, 22 with carefully selected context
**Learning emphasis:** God's promise, Abraham's journey of faith, God's faithfulness/provision.

## Distinctive mechanic — Promise Markers
A journey map follows major locations/events. Players collect reviewed promise markers such as **land**, **offspring/descendants**, and **blessing**, then connect later scenes back to earlier promises.

Activities: map/path ordering, promise-to-passage matching, star/count visualizations, event sequencing, Scripture lookup, challenge inserts.

Genesis 22 is presented sensitively for children and as one late checkpoint in Abraham's broader story, not as a dexterity/choice game where the child decides Isaac's fate. The recorded outcome is canonical and unchanged by performance.

# 3. Daniel: Faithful Every Day

**Primary audience:** 6–10 / family
**Passage:** Daniel 6
**Learning emphasis:** Daniel's established faithfulness/prayer practice, faithfulness under pressure, God's protection.

## Distinctive mechanic — Daily Rhythm
The Stage shows repeating daily cycles. Children observe that Daniel's practice did not begin because of the decree: the story explicitly presents his continued practice. Activities occur across repeated morning/day/evening visual rhythms, culminating in the decree, den and deliverance scenes.

Possible activities: listen/observe, event ordering, identify what changed vs what Daniel continued doing, Scripture phrase matching, timeline/routine placement.

Do not make prayer a meter, score prayer quality, or imply completing a prayer mini-game causes God's protection. No lion-dodging arcade mechanic is required.

# 4. The Way Home — Prodigal Son

**Primary audience:** 5–10 / family
**Passage:** Luke 15:11–32
**Learning emphasis:** repentance/return, the father's welcome, forgiveness/grace, and the older brother's response.

## Distinctive mechanic — Two Perspectives
The path progresses home -> distant country -> need -> realization -> return -> welcome -> older brother. Scripture events are revealed canonically; predictions never rewrite the parable.

Perspective Scenario is used after/around reviewed narrative moments to consider the younger son, father and older brother without assigning virtue scores to the player. Older-kids mode gives meaningful attention to the older brother rather than ending at the celebration.

Activities: sequence the path, prediction-before-reveal, perspective switch, story-character matching, Scripture phrase/reference activities.

The father's welcome is not an unlockable reward earned by player performance.

# 5. Emmaus: Along the Way

**Primary audience:** 7–12 / family
**Passage:** Luke 24:13–35
**Learning emphasis:** recognizing the risen Jesus, understanding Scripture in relation to Christ, movement from confusion to recognition.

## Distinctive mechanic — Scripture Connections
Two disciples move along the road while reviewed Scripture/theme clues accumulate. Players connect passages/themes/events through existing Scripture Relationship/Chain capabilities where appropriate. The Stage progressively clarifies a visual motif as understanding grows; recognition occurs at the canonical point in Luke 24 regardless of score.

Activities: reference connection, ordering, identify what the disciples knew/said, Scripture lookup, progressive clues and final review.

Do not invent the specific Old Testament passages Jesus explained unless the game clearly labels them as later interpretive examples rather than claiming Luke names them.

# 6. Saul: Turned Around

**Primary audience:** 8–12 / family
**Passage:** Acts 9, with reviewed Acts context
**Learning emphasis:** grace, transformation, calling/mission, evidence of changed direction.

## Distinctive mechanic — Before / Encounter / After
Players gather text-grounded evidence about Saul before the Damascus road, reconstruct Acts 9 in canonical order, then gather evidence of changed actions afterward. The final Stage places the evidence in three columns: **Before -> Encounter -> After**.

Activities: evidence classification, ordering, map/route presentation, character identification, Scripture lookup and challenge inserts.

The experience should avoid implying Saul became a different person because the player completed challenges. `Turned Around` may reuse route-turn presentation from Jonah or generic Journey but is a separate content experience, not a duplicate engine.

## Multiplayer
All six support solo/family and, where shared participation APIs permit, 1–4 teams. Default multiplayer is cooperative/shared progress through canonical story checkpoints. Objective sub-challenges may score by team; the story progresses together and canonical events remain synchronized.

## Content and theological guardrails
- Scripture is sourced through BibleTextService; packs reference passages rather than hard-code licensed text.
- Distinguish Scripture, explanation and application.
- Do not invent dialogue and present it as biblical quotation.
- Player success/failure never changes canonical events.
- Do not score faith, prayer, repentance, forgiveness, grace, spiritual worth or God's favor.
- Where multiple Gospel/Scripture passages are combined, disclose the source rather than silently harmonizing details.
- Application scenarios may use Perspective Scenario but must be labeled application.

## Packaging
Each experience should primarily ship as definition/content/assets:
- journey/checkpoint definition;
- Scripture references/content profile;
- activity/challenge configuration;
- art/audio/narration assets;
- help/parent/Dig Deeper material;
- dependency manifest.

Shared orchestration/runtime remains in core/shared packages.

## Acceptance criteria
For each experience:
- complete canonical checkpoint path;
- at least 3 reusable activity/challenge families;
- Hear it -> Play it -> Say it -> Take it Home;
- age-appropriate help/parent material;
- accessibility/reduced motion/narration alternatives;
- deterministic activity selection where randomized;
- save/resume;
- solo/family and compatible 1–4 team profile;
- no duplicate engine or redundant GameId after implementation-time audit;
- content/biblical QA.