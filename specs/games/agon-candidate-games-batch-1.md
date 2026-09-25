# Agon Candidate Game Specifications — Batch 1

## Status and intent
These are **candidate/backlog games**, intentionally preserved so they can be evaluated and crossed off later without losing the design. Inclusion here does **not** commit the project to implementation. Each candidate should receive one implementation issue; split only if implementation later proves to require genuinely reusable platform infrastructure.

All games must use Agon visual/responsive foundations, support projector/laptop/Host Remote and applicable phone/tablet Player Controllers, use the shared max-4-team platform contract, declare `GameCompetitionCapabilities`, support Event/Game persistence contracts, and use shared cards/dice/randomizers/timers/buzzers/tournament/computer-player systems rather than duplicating them. No betting/gambling mechanics or presentation are permitted anywhere in Agon.

Difficulty should primarily change Bible-content difficulty, clue depth, input mode, time pressure, information availability, or board complexity—not merely inflate point values. Normal Agon scoring/event/tournament rules apply.

---

## 1. The Lot Falls To...
**Core:** Biblical deduction game driven by the shared Casting Lots randomizer. A hidden Bible person/place/event/role is selected; lots progressively determine clue dimensions or which clue becomes available. Players use Bible knowledge to identify the target before rivals.

**Play:** 1–4 teams. Each round creates a validated target and clue set. A lot draw reveals/selects a clue category (person, place, event, relationship, quote/theme, object, chronology, etc.). Teams may answer when eligible; earlier correct identification earns more points, wrong guesses may impose a short lockout. Solo mode scores efficiency.

**Dependencies:** Casting Lots/randomizer #152–#155 family, Challenge Engine, Buzzer/private response where configured, Timer, persistence, computer-player optional.

**Acceptance:** deterministic seeded target/lot recovery; clues never contradict target; no impossible clue combination; responsive lot animation; answer privacy where simultaneous.

---

## 2. Wheel Within a Wheel
**Core:** Two concentric/shared wheels generate a Bible relationship challenge—for example Person + Event, Person + Place, Book + Theme, Object + Event. Players must identify/explain the valid connection.

**Play:** 1–4 teams. Spin outer and inner wheels; server validates that generated pairing has an authored/accepted relationship or deliberately marks a decoy mode. Buzz or simultaneous answer depending round configuration. Harder levels use less obvious relationship dimensions and typed responses.

**Dependencies:** Spinner/Wheel #152–#155, Challenge Engine, Buzzer, Timer, canonical answers.

**Acceptance:** no accidental unsolvable pair; deterministic spin recovery; wheel labels remain legible on projector/phone; connection explanation/reference available after resolution.

---

## 3. Gather the Twelve
**Core:** Collection/mission game using lots/cards. Teams attempt to assemble a target set of twelve Bible-related items/people while completing challenges to acquire, protect, exchange, or select needed members.

**Play:** 1–4 teams. A mission defines the twelve-item collection (e.g. apostles or another authored twelve/set). Correct challenges earn draws/selections; duplicate/unneeded items create tactical choices without trading-as-betting. First completion or best collection at round end wins game outcome; all challenge points still score normally.

**Dependencies:** Generic Card/Deck #130–#139/#167–#169 and/or Casting Lots; Challenge Engine; persistence.

**Acceptance:** authored valid sets; no impossible completion due to deck exhaustion; collection visible without exposing private choices; reconnect restores exact collection/deck order.

---

## 4. Urn of Questions
**Core:** A visual urn contains tokens that determine the next question's category and/or difficulty. Drawing creates controlled randomness while teams choose when/where to take risks.

**Play:** 1–4 teams. Tokens may encode category, difficulty, special challenge type, or combinations. Host can configure token distribution. Draw is authoritative/seeded. Correct answer scores normal challenge points; optional finite-token mode makes the urn composition evolve visibly.

**Dependencies:** Casting Lots/randomizer, Challenge Engine, Timer/Buzzer as configured.

**Acceptance:** weighted/unweighted draws supported; finite urn never draws removed token; recovery preserves urn composition/RNG; accessible non-animation representation.

---

## 5. The Narrow Gate
**Core:** Progressive survival/qualification game using a narrowing randomizer/wheel. Correct Bible answers keep a team/player eligible as available paths/options narrow.

**Play:** 1–4 teams. Rounds reduce available safe choices/lanes after challenges. Elimination is tournament/game-state only and never removes points already earned. Provide non-elimination family mode where misses add disadvantage rather than removing a team from play.

**Dependencies:** Wheel/randomizer, Challenge Engine, Timer, tournament capabilities where used.

**Acceptance:** no arbitrary elimination without a challenge opportunity; eliminated teams retain Agon points; safe path generation is deterministic and fair.

---

## 6. Providence? (working punctuation/title)
**Core:** Random Person + Place + Object/Event combinations are generated. Players decide whether the combination has a genuine biblical connection or is a plausible decoy, then identify/explain the connection.

**Play:** 1–4 teams; simultaneous private TRUE CONNECTION / DECOY decision followed by explanation/typed answer on harder levels. Authored relationship graph prevents accidental decoys that actually form a valid connection.

**Dependencies:** randomizer/dice/card engines, relationship content model, private responses, canonical answer validation.

**Acceptance:** every generated combination prevalidated; decoys checked against relationship graph; post-answer Scripture explanation.

---

## 7. Witnesses
**Core:** Set-building knowledge game. Teams collect complementary Person + Place + Object/Theme/Event evidence cards that together identify or substantiate a biblical account.

**Play:** 1–4 teams. Correct challenges earn/select evidence. Completing a valid witness set scores a set bonus while underlying challenge points remain. Hard levels hide some metadata and require identifying the account before set completion.

**Dependencies:** Generic Card Engine, Challenge Engine, canonical relationship data.

**Acceptance:** valid set definitions authored/validated; no impossible deck state; private hands use Player Controller; projector shows public tableau only.

---

## 8. The Scribe
**Core:** Build Scripture structure correctly from cards/tiles: book, section, passage, speaker/audience, sequence, or verse fragments depending challenge pack.

**Play:** 1–4 teams; ordering/placement interface supports touch drag/drop and accessible move controls. Correct placements build a manuscript/tableau. Wrong placements may lock temporarily or return tile depending difficulty.

**Dependencies:** generalized Card Engine, ordering-card controller interaction, Challenge Engine.

**Acceptance:** no drag-only requirement; phone ordering usable; authored canonical order/structure; Scripture references/explanation after round.

---

## 9. Twelve Tribes
**Core:** Relationship-family game centered on Jacob's twelve sons/tribes and associated people, territories, events, blessings, symbols, or later biblical references.

**Play:** 1–4 teams. Challenges assign/match clues to the correct tribe; board gradually forms twelve tribe areas. Difficulty controls clue obscurity and whether answer is MC, placement, or typed.

**Dependencies:** Challenge Engine, card/placement UI, relationship content.

**Acceptance:** distinguish person/tribe terminology accurately; ambiguous cross-tribe clues require authored accepted mappings; educational review/reference.

---

## 10. Epistle
**Core:** Assemble an epistle profile from Author + Audience + Location/Context + Theme + Teaching cards/clues.

**Play:** 1–4 teams. Teams solve challenges to claim/profile components, then identify the letter or complete its profile. Multiple valid associations are explicitly authored; no assumption that every theme uniquely identifies one letter.

**Dependencies:** Card Engine, Challenge Engine, relationship graph.

**Acceptance:** canonical/alternate scholarly-safe associations represented as authored content; avoid disputed authorship being silently presented as uncontested where relevant; references/explanations included.

---

## 11. Cloud of Witnesses
**Core:** Overlapping-traits deduction/collection game. Bible people share traits (prophet, king, exile, miracle witness, journey, martyr/witness tradition, etc.); players identify people at intersections of revealed traits.

**Play:** 1–4 teams. Trait cards/cloud regions accumulate. Teams answer who fits all active constraints or place people into overlapping groups. Higher difficulty adds more intersections/near-miss decoys.

**Dependencies:** Card Engine, relationship/tag content model, Challenge Engine.

**Acceptance:** intersection queries generated only when valid answer set known; multiple valid answers handled explicitly; no overclaiming extra-biblical traditions without labeling content source.

---

## 12. One Body
**Core:** Cooperative game built around private complementary information/resources. Each player/team sees only part of what is needed; success requires communicating and combining knowledge.

**Play:** 2–4 teams/participants cooperatively, with optional competitive team-vs-team variant only if later designed. Private controllers receive different clues/cards/roles. Shared board shows objective, not hidden information. Challenges unlock/share resources.

**Dependencies:** private Player Controller projections, Card Engine, Timer, persistence.

**Acceptance:** no controller can inspect another private payload; cooperative objective always solvable; disconnect/reassignment preserves authorized private state.

---

## 13. Before & After — WORKING TITLE, RENAME REQUIRED
**Core:** Chronology game using response cards/controls to decide whether events/people/passages occurred before or after a reference, then increasingly complex relative-order challenges.

**Naming:** Existing Agon game name is too similar/confusing. Do not finalize this title. Keep issue/spec searchable under working title until replacement selected.

**Play:** 1–4 teams. Easy uses Before/After; harder modes add Same Era/Between or order 3–6 events. Simultaneous private answers preferred.

**Dependencies:** chronology content, Card/ordering controls, Challenge Engine, Timer.

**Acceptance:** chronology metadata supports approximate/contested dates without false precision; ambiguous chronology excluded or authored with accepted range.

---

## 14. Three Witnesses
**Core:** Three independent random dimensions—typically Person, Place, Event—are rolled/drawn. Players determine the valid biblical connection or identify which dimension does not belong.

**Play:** 1–4 teams. Dice/randomizer produces prevalidated triples. Modes: Connect All Three; Find False Witness; Name the Account. Difficulty changes obscurity and answer mode.

**Dependencies:** Dice/Randomizer #141–#155, relationship content, Challenge Engine.

**Acceptance:** triples prevalidated; decoys cannot accidentally create alternate valid solution; seeded recovery.

---

## 15. Facets
**Core:** Two-die/randomizer challenge generator. One facet selects Bible category/content; another selects action/question type (identify, order, connect, quote completion, who/where/when, etc.).

**Play:** 1–4 teams. Roll creates varied challenge combinations from compatible matrix. Invalid category/action combinations are excluded before roll.

**Dependencies:** variable-face Dice Engine, Challenge Engine.

**Acceptance:** compatibility matrix; custom word/color/icon die faces; deterministic roll; no empty challenge pool.

---

## 16. Crossroads
**Core:** Dice/randomizer creates a biblical situation and branching choices. Correct knowledge determines the advantageous path/resource/outcome.

**Play:** 1–4 teams. A shared map or individual route presents crossroads. Roll/challenge selects situation; team chooses path/answer. This is strategic branching, distinct from Wayfinder's hidden maze/fog model.

**Dependencies:** Dice/Randomizer, Challenge Engine, graph/path component where reusable.

**Acceptance:** branches authored/validated; no unwinnable state; strategic choice remains meaningful beyond random roll.

---

## 17. Against the Odds
**Core:** Dice-based challenge where teams choose among increasingly difficult Bible challenges with different success thresholds/rewards, balancing reliable progress against harder opportunities. This is **not betting**: no wagering, stakes, pot, odds-making, or loss of previously earned points.

**Play:** 1–4 teams. Difficulty/target is chosen or generated; answer correctness plus configured die mechanic determines progress/bonus. Randomness supplements knowledge rather than replacing it.

**Dependencies:** Dice Engine, Challenge Engine.

**Acceptance:** no gambling vocabulary/presentation; cannot wager points; knowledge remains primary determinant; probability visible as game mechanic where needed.

---

## 18. While the Sand Falls
**Core:** Hourglass-pressure challenge. Teams answer as many linked Bible prompts as possible before the visual sand expires.

**Play:** 1–4 teams, alternating or simultaneous according to pack. Correct answer advances chain; pass behavior configurable. Hourglass is visual skin over authoritative Agon Timer.

**Dependencies:** Timer #156–#159 with hourglass renderer, Challenge Engine.

**Acceptance:** server-authoritative deadline; Reduced/Off motion alternative; pause/resume rules; no local visual drift affects scoring.

---

## 19. A Time for Everything
**Core:** Ecclesiastes-inspired time/category pairing. Players match Bible events/actions to time/season prompts or order events into appropriate chronological/seasonal relationships.

**Play:** 1–4 teams. Spinner/cards select a 'time for...' concept or chronology dimension; players identify fitting event/person/passages from authored choices.

**Dependencies:** Timer/randomizer/card components as appropriate, Challenge Engine, authored relationship data.

**Acceptance:** do not imply Ecclesiastes phrases directly describe unrelated events unless clearly presented as game categorization; references/review included.

---

## 20. Redeem the Time
**Core:** Strategic time-budget game. Teams have a finite shared round clock and choose quick/lower-complexity versus longer/harder challenges to maximize completed objectives.

**Play:** 1–4 teams. No wagering of points. Choices consume known time budget or challenge slots; correct answers score normal points/advance objective. Host-configurable round duration.

**Dependencies:** Timer, Challenge Engine, difficulty metadata.

**Acceptance:** authoritative time budget; choices show time cost before commitment; accessibility/reduced motion; persistence restores deadline correctly.

---

## 21. The Midnight Hour
**Core:** Countdown escalation game themed around approaching midnight. Challenges become more difficult/urgent as the clock approaches zero; milestone events can change category or response type.

**Play:** 1–4 teams. Shared countdown divided into phases. Correct answers accumulate normal points and may unlock phase advantages; no loss of earned points at midnight.

**Dependencies:** Timer, Challenge Engine, optional randomizer.

**Acceptance:** phase transitions authoritative; visual clock accessible; no dependence on wall-clock timezone; resume semantics defined.

---

## 22. Selah
**Core:** Deliberate pause/reflection/recall game. A passage, scene, sequence, or set of clues is shown briefly; after a Selah pause/transition, players answer from memory or identify what changed/was emphasized.

**Play:** 1–4 teams, simultaneous private answers. Difficulty controls exposure time, passage/clue length, and recall depth. Should feel contemplative rather than frantic.

**Dependencies:** Timer, private responses, Challenge Engine.

**Acceptance:** accessible alternative to purely visual memory; Scripture text licensing/content rules respected; authoritative exposure timing.

---

## 23. One Is Missing
**Core:** Deduction game: display a known biblical set/group with one member/item omitted; players identify the missing one.

**Play:** 1–4 teams. Examples use authored sets (apostles, plagues, armor of God components, Beatitudes concepts where content model permits, etc.). Harder modes remove labels or use larger/less obvious sets.

**Dependencies:** set/relationship content, Challenge Engine, Buzzer/private response.

**Acceptance:** sets have explicit canonical scope; variants/textual traditions handled intentionally; random omission deterministic.

---

## 24. The Messenger
**Core:** Information-transfer game. A biblical message/clue must move through stages/players while preserving key facts; challenges unlock or verify message fragments.

**Play:** 2–4 participants/teams. Controllers can receive private fragments; depending mode, players relay via constrained clue choices or reconstruct final message. Avoid requiring free-form secret communication the system cannot validate unless Host-mediated.

**Dependencies:** private projections, Card Engine, Timer, Challenge Engine.

**Acceptance:** private fragments isolated; reconnect retains fragment ownership; final answer can be objectively validated; cooperative/competitive mode explicitly declared.

---

## 25. Build the Temple
**Core:** Spatial construction game. Correct Bible challenges earn/select structural pieces used to complete a temple/building objective. Placement strategy matters; this is not merely a progress bar.

**Play:** 1–4 teams. Pieces have connection/placement rules. Teams may pursue different sections/objectives. Difficulty controls board complexity and required challenge type.

**Dependencies:** Card/tile engine, spatial board/placement UI, Challenge Engine.

**Acceptance:** touch + keyboard placement; valid build always possible; no historically speculative detail presented as certain without content labeling; persistence restores exact board.

---

## 26. Walls of Jerusalem
**Core:** Competitive strategic wall-building/control game. Teams try to complete connected wall sections by answering challenges for individual blocks. Opponents can deliberately select a strategically important unclaimed block and **steal/block the connection by answering that block's challenge first**.

**Board:** Graph/grid of wall blocks grouped into sections/gates. A team's objective is to establish connected ownership paths and/or complete assigned wall sections. Ownership is visually distinct and accessible.

**Turn:** Active team selects an eligible block → challenge is presented. Depending mode, selected team gets first opportunity or challenge opens to opponents after miss/steal window. Correct answer claims block. Opponents may target unclaimed blocks on later turns to break another team's planned connection. Already-owned blocks are not casually stolen unless a separately configured advanced rule explicitly permits it; default strategy is blocking by claiming key unowned connections.

**Scoring:** normal challenge points + board objective bonuses for completed connected sections/gates. Do not remove normal earned points when blocked.

**Play:** 2–4 teams. Solo puzzle mode optional later. Board generator must ensure multiple viable routes and avoid first-player forced win.

**Dependencies:** Challenge Engine, Buzzer/steal rules, strategic graph/grid board, Timer, persistence, computer-player optional.

**Acceptance:** connectivity calculated server-side; legal selectable blocks clear; opponent blocking can disrupt but not create permanently impossible board too early; deterministic board; Host can inspect ownership/connectivity; responsive projector + phone block selection; AI/computer strategy interface later.

---

## 27. Paths of Paul
**Core:** Route/map game following Paul's journeys. Correct challenges advance along historically/biblically grounded route nodes; players identify locations, events, companions, letters, or sequence.

**Play:** 1–4 teams. Map is educational and route-based, not Wayfinder's random maze. Different journey packs may cover missionary journeys, voyage to Rome, etc.

**Dependencies:** map/spatial renderer, Challenge Engine, route content.

**Acceptance:** route geography/content sourced/authored carefully; map scales responsively; alternative scholarly route uncertainty labeled where relevant.

---

## 28. The Road to Damascus
**Core:** Progressive reveal/transformation game centered on identifying people/events from clues that dramatically change context after a pivotal reveal. Default content pack may use Saul/Paul but engine should support analogous authored transformations/turning points.

**Play:** 1–4 teams. Early clues are intentionally partial; challenge success reveals road markers/clues. Teams may attempt identification at configured points; wrong early guesses can lock briefly.

**Dependencies:** reveal/card engine, Challenge Engine, Buzzer/private guess.

**Acceptance:** not dependent on a single fixed question; clue order validated from broad→specific; replayable target pool if generalized.

---

## 29. Council of Jerusalem
**Core:** Evidence/argument classification game based on Acts 15 and, in generalized packs, biblical councils/disputes/decisions. Players organize speakers, claims, evidence, and final decision in correct relationships/order.

**Play:** 1–4 teams. Cards/tiles represent people, statements, events, Scripture references and decision components. Challenges earn placements or corrections.

**Dependencies:** Card/ordering engine, Challenge Engine.

**Acceptance:** distinguish biblical text from later interpretation; Acts 15 source references; objective authored mappings; no requirement for players to endorse a theological position beyond identifying the text/history asked.

---

## 30. Exodus
**Core:** Multi-stage journey board from Egypt toward the Promised Land/wilderness milestones. Challenges advance through authored Exodus events; randomizers may alter route resources/events without overriding Bible knowledge.

**Play:** 1–4 teams. Stages can include plagues, Passover, Red Sea, wilderness, Sinai/tabernacle-related content as authored. Strategic route/progress game, distinct from Wayfinder's hidden maze.

**Dependencies:** spatial/route board, Challenge Engine, optional dice/cards/randomizers.

**Acceptance:** biblical sequence validated; no impossible progress state; stage resume; normal points retained independent of race position.

---

## 31. The Scribe's Table
**Core:** Hands-on manuscript/tableau puzzle. Players arrange words, verse fragments, references, book sections, names, or textual clues on a shared/private 'scribe table' to reconstruct correct Scripture-related structures.

**Play:** 1–4 teams. More tactile/puzzle-oriented than The Scribe: table can contain multiple simultaneous fragments and decoys. Phone controller supports tile tray and selection; projector shows public table.

**Dependencies:** generalized Card/Tile Engine, ordering/drag accessible controls, Challenge Engine.

**Acceptance:** no drag-only UX; decoys authored; text remains readable; private tray not leaked; Scripture content/reference review.

---

## 32. Open the Scroll
**Core:** Layered reveal game. A closed/rolled scroll progressively opens as challenges are solved, exposing text, image, clues, map, prophecy/context, or a final identification target.

**Play:** 1–4 teams. Correct answers reveal segments; misses may leave segment hidden or allow opponents an opportunity depending pack. Earlier final identification yields larger objective bonus while normal challenge points remain.

**Dependencies:** reveal engine/card renderer, Challenge Engine, Buzzer/Timer optional.

**Acceptance:** segment state persistent; Reduced/Off motion scroll alternative; hidden content not leaked in client payload where secrecy matters.

---

## 33. Forty
**Core:** Forty-step/forty-themed endurance game using biblical 'forty' motifs as thematic structure. A session should not literally require 40 long questions by default; use 40 spaces/units grouped into manageable challenge stages.

**Play:** 1–4 teams. Challenges move markers through 40 units; special authored milestones reference biblical forty-day/year events. Compact mode can aggregate units per correct answer.

**Dependencies:** route/progress board, Challenge Engine, optional dice/randomizer.

**Acceptance:** practical round duration; no claim that unrelated biblical forty references are the same event; persistent progress; scalable difficulty/length.

---

## 34. Convergence
**Core:** Multiple independent clue/path streams gradually converge on one shared Bible answer. Teams decide when enough streams have converged to identify the person/place/event/book/theme.

**Play:** 1–4 teams. Each stream reveals clues through challenges (e.g. Person clues, Place clues, Event clues, Scripture clues). Correct challenge opens/advances a stream. Teams may buzz/submit final target; earlier solve earns larger objective bonus, wrong solve creates configurable lockout.

**Dependencies:** reveal/path component, Challenge Engine, Buzzer/private final answer, Timer optional.

**Acceptance:** all clue streams independently valid and converge uniquely or explicitly allow known aliases; wrong-answer lockout fair; clue order authored broad→specific; hidden clue state persistent.

---

# Shared candidate-game implementation requirements
Every candidate implementation issue should include:
- candidate status; closing `not planned` later is expected and should not affect shared infrastructure
- `GameCompetitionCapabilities` declaration and tournament compatibility
- normal Agon scoring; no game-specific tournament engine
- Event/Game Session persistence serializer/version/migration
- Host Remote actions and projector/player projections
- 4:3, 16:10, 16:9 projector; phone/tablet controller; laptop/admin
- Full/Reduced/Off motion where animated
- keyboard/touch/non-color accessibility
- authoritative server state/randomness/timers
- reconnect/idempotency/privacy tests
- optional Computer Player adapter only where game semantics make it useful
- no betting/gambling/wagering mechanics

# Naming follow-ups
- **Before & After** is explicitly a working title and must be renamed before implementation/release because it is too easily confused with the existing Before or After game.
- **Providence?** punctuation/title may be revisited without changing the candidate's mechanic.
