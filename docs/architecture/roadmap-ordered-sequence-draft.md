# Agon Roadmap — Single Ordered Execution Sequence (DRAFT)

**Status: draft for human review. Do not treat as authoritative until the user merges it into `ROADMAP.md`.**

This is a reorganization, not a redesign: every milestone, Track, and Backlog from `ROADMAP.md` is placed here at the point the roadmap's own prose (the Gates diagram, "Near-term execution order," "Do not implement yet," and the Purpose/Exit table) already says it becomes eligible, parallel, or blocked. No new dependency claims are introduced. Where the roadmap is not precise enough to justify an issue-level order, the milestone/Track/Backlog appears as one named, countable block instead of a fabricated sequence.

---

## 1. PR #512 (ADR-001)

Governing decision record. Precedes all work below; nothing in M0 starts before it (already merged/adopted per ROADMAP.md line 23).

## 2. #7 CI + #515 boundary guard

Per "Near-term execution order" item 1. First concrete implementation step, ahead of the rest of M0.

- #7 — Testing: Step 7 (optional) — CI pipeline
- #515 — vNext P0: architecture-boundary enforcement and legacy-freeze guard in CI

(Both are also members of the M0 milestone; listed here individually because the roadmap's own numbered execution order gives them first position.)

## 3. M0 — vNext Architecture Foundation: the stated numbered chain (item 2 of "Near-term execution order")

ROADMAP.md gives an explicit chain for M0's core path:

1. #362 — Core foundation: canonical domain model, stable IDs, and ownership boundaries
2. #314 — Platform: implement versioned GameDefinition schema, capability registry, and runtime composition
   (+#358 — Multi-runtime: add Local/Shared/Hosted capability and compatibility metadata to GameDefinition; +#320 — Platform: define trusted novel-mechanic module contract, both bundled at this step per the Gates diagram and near-term order)
3. #447 — Engine SDK P0: EngineRegistry, capability resolution, standard lifecycle
   → #448 — Engine SDK P0: standardize commands, events, projections, InputActions, renderer registration
   → #449 — Engine SDK P0: versioned persistence, replay, migrations, package/readiness contracts
   → #450 — Engine SDK P0: shared engine conformance kit and reference engine
4. #350 — Multi-runtime: implement versioned SessionRuntime command/event contracts (+#448, already sequenced above)
5. #351 — Multi-runtime: implement least-privilege ProjectionService for Stage, Host, Player, Team, and Site
6. #142 — Agon Randomizers: 1. authoritative seeded RNG, multi-roll engine, and history
   #156 — Agon Timer: 1. authoritative timer model, clock, lifecycle, and recovery
   (parallel pair per "#142/#156" grouping in both the Gates diagram and near-term order)
7. #364 — Core foundation: implement Score & Rules Ledger for game, tournament, and event scoring
8. #353 — Multi-runtime: implement SessionPersistence contract and Local persistence adapter
9. #338 — Bible translations: implement BibleTextService, TranslationProvider contract, and Translation Registry
   #339 — Bible translations: wrap current KJV corpus in local provider and remove direct KJV access
   (paired per "#338/#339" grouping)
10. #514 — vNext P0: Offline/Local platform adapter — inject Electron, storage, clock, and file services via contracts
11. #513 — vNext P0: LegacyGameAdapter and GameId launch resolver (one authoritative path per game)
12. #356 — Multi-runtime: build in-memory conformance runtime and network-condition simulation test harness

### M0 remaining issues (in milestone, not given an explicit position in the stated chain)

ROADMAP.md's numbered chain covers 20 of M0's 29 issues explicitly (including #7/#515 already placed above). The remaining 9 M0 issues have no stated order relative to the chain or each other — the roadmap only says they belong to "#509: contracts, AgonRuntime, registries, Engine SDK, Offline adapter, LegacyGameAdapter/launch resolver, deterministic harness, CI enforcement." They are foundational inputs to the same M0 exit criterion ("a minimal GameDefinition runs in a test host with no Electron/renderer/network dependency; all legacy games still launch; CI enforces boundaries") and are listed here as a block, unordered among themselves, completing before M0's exit is declared:

- #337 — Bible translations: inventory KJV assumptions and translation-dependent games/content
- #349 — Multi-runtime: audit desktop, LAN, filesystem, and local-authority assumptions
- #355 — Multi-runtime: make Timer, Buzzer, RNG, and simultaneous-response mechanics authority-safe
- #363 — Core foundation: unified authoritative domain-event vocabulary and envelopes
- #366 — Core foundation: typed configuration inheritance and immutable ResolvedSessionConfiguration
- #367 — Core foundation: common schema versioning and deterministic migration framework
- #509 — Architecture P0: establish Agon vNext foundation and staged legacy migration (the M0 umbrella issue itself)
- #519 — vNext P0: Local security baseline and future-mode trust-boundary contract gate

**M0 total: 29/29 issues accounted for** (12 chain positions above cover 20 issues incl. #7/#515 already listed in section 2; 9 more in the unordered completion block; 2 issues, #7 and #515, are not double-counted — they appear only in section 2).

## 4. Track — Agon Brand & Design System: starts in parallel with M0

Per the Gates diagram ("M0 Foundation ─► Track: Brand & Design System (parallel)") and "Value tracks... Agon Brand & Design System (parallel now)" and "Near-term execution order" item 6 ("In parallel now: Brand & Design System (#117, #99–#102, #104)"). Runs alongside M0 and continues in parallel with M1 (no roadmap text closes it off at a specific later gate). Treated as one parallel block; the roadmap names its issues but gives no internal sequence among them.

- #99 — Agon UI: 1.1 brand assets and product naming
- #100 — Agon UI: 1.2 design tokens, typography, icons, and theme bridge
- #101 — Agon UI: 1.3 shared UI primitives and accessibility foundation
- #102 — Agon UI: 1.4 adaptive layout utilities and viewport test harness
- #104 — Agon UI: 2.2 Admin console shell, navigation, forms, tables, and density
- #117 — Agon rename: installer, update, and data-folder continuity
- #298 — Emblems: 1. Agon Emblem set design and production

**Track — Agon Brand & Design System: 7/7 issues accounted for**, running parallel to M0 through at least M1; no later gate is stated in ROADMAP.md as closing this track off, so it continues to run alongside subsequent gates until its own issues are done (flagged in Ambiguities below).

## 5. #507 catalog audit — starts parallel to M1 setup

Per "Near-term execution order" item 3: "#507 catalog audit (parallel)," running alongside item 4 (Five Clues oracle/answer-evaluation work, M1). #507 is formally an M2 milestone issue, but the roadmap explicitly states it begins in parallel once M0's chain is underway, ahead of the rest of M2.

- #507 — Catalog P1: apply audience-boundary consolidation audit across Agon and Agon Kids

(Remainder of M2 milestone appears in section 7, after M1 completes — ROADMAP.md's Gates diagram shows M2 following M1.)

## 6. M1 — vNext Reference Migration: the stated chain (near-term execution order item 4)

1. #4 — Testing: Step 4 — Challenge app feature tests (Layer 2)
2. #402 — Challenge foundation: implement reusable Answer Evaluation Service and policies
3. #516 — Renderer: vNext surface host inside the legacy shell (mount GameDefinition surfaces without App.tsx branches)
4. **#510 — Migration P0: migrate one representative legacy game through AgonRuntime (Five Clues)** — the M1 exit milestone

### M1 remaining issue (no stated position in the chain)

- #422 — Developer documentation: add game, engine, content, package, Stage, and testing authoring guides

(Belongs to M1's milestone per the dump but is not named in the stated #4→#402→#516→#510 chain; placed here as the milestone's remaining item, completing alongside/after #510.)

**M1 total: 5/5 issues accounted for.**

## 7. M2 — Catalog & Migration Classification (remainder, after M1 exit)

Per the Gates diagram, M2 follows M1 ("M1 Reference: Five Clues... ▼ M2 #507 → #511"). #507 already started in parallel (section 5); its disposition, plus #511 and the milestone's other issues, complete here as M2's exit ("Checked-in migration matrix + dependency graph; wave and capability issues created"). No internal order is stated among the remaining three issues.

- #511 — Migration P1: classify implemented legacy games into vNext migration waves
- #304 — Architecture: audit all implemented games for shared-engine/randomizer migration
- #385 — Network foundation: classify mechanic latency sensitivity and runtime requirements

**M2 total: 4/4 issues accounted for** (#507 placed in section 5 as the parallel-start item; #511/#304/#385 here).

## 8. M3 — Core Capability Extraction (single block)

Per the Gates diagram, M3 follows M2 ("M2 ... ▼ M3 capabilities ──► M4 migration waves"). ROADMAP.md gives no internal ordering across M3's 65 issues — only the milestone-level purpose ("Reusable engines/capabilities with named consumers") and exit ("Capabilities for the first bulk waves have stable contracts/tests"). Kept as one block; none of these 65 issues are individually sequenced by the roadmap text.

**Precondition:** M2 exit (migration matrix + wave/capability issues created) unlocks M3 as a whole; #511's wave/capability issue creation is what seeds the specific issues consumed here.

Block contents (65 issues): #130, #131, #132, #133, #134, #135, #136, #137, #141, #143, #144, #145, #146, #147, #148, #149, #150, #152, #153, #154, #155, #157, #158, #159, #167, #168, #169, #181, #280, #281, #282, #283, #284, #285, #292, #315, #318, #340, #341, #342, #343, #368, #380, #438, #439, #444, #451, #452, #453, #458, #459, #460, #466, #476, #477, #478, #479, #480, #481, #483, #487, #491, #493, #495, #500.

**M3 total: 65/65 issues accounted for as one block.**

## 9. M4 — Existing Game Migration Waves (single block, first wave named)

Per the Gates diagram, M4 follows M3 ("M3 capabilities ──► M4 migration waves (#331)"). Per "Near-term execution order" item 5: "#511 → wave and capability issues → first wave (progressive-clue family, #307)" — the *first* wave is named explicitly (progressive-clue family, #307), but the rest of M4's waves are not individually sequenced beyond "waves by capability family."

**Precondition:** M3 capability contracts (or the specific capability each wave depends on) must be stable; #331 is the umbrella epic that organizes remaining waves.

1. **First named wave:** #307 — Refactor Five Clues, Name That Book, and Prophecy Clue Ladder onto progressive-clue engine

2. **Remaining M4 waves (no further stated order — "waves by capability family," family names implied by issue titles but not sequenced against each other):**
   - #305 — Refactor existing matching/category games onto shared Card/Tile/Deck Engine
   - #306 — Refactor Bible Timeline, Bible Books Relay, and Verse Scramble onto shared ordering engine
   - #308 — Migrate existing question-style games to shared Challenge Engine and Bible-navigation services
   - #309 — Refactor Verse Reveal onto shared reveal primitives
   - #321 — Platform migration: convert reference existing games to GameDefinitions and reusable content/assets
   - #331 — Platform migration: migrate all remaining existing games to modular GameDefinition/module architecture (umbrella epic)

3. **Issues explicitly gated to "the owning game's M4 wave"** per the "Do not implement yet" table — these are not startable until their specific game's wave above lands:
   - #56 — bible-timeline: add roundType and "Which Came First?" pairwise mode (gated to Bible Timeline's wave, #306)
   - #57 — bible-timeline: add "Insert Event" round mode (gated to #306's wave)
   - #58 — two-truths-and-a-lie: add presentationStyle and narrated-account content (gated to its owning wave)
   - #87 — Word Ladder: cap number of rungs by difficulty level (gated to its owning wave)
   - #311 — Add meaningful optional randomizer variants to migrated existing games (gated to "the owning game's M4 wave," applies across waves)

**M4 total: 12/12 issues accounted for** (1 named first wave + 6 remaining-wave issues + 5 wave-gated enhancement issues named individually in "Do not implement yet").

## 10. M5 — Renderer / Experience Decomposition (single block; "grows alongside M4")

Per the Gates diagram, M5 branches from M1 and is annotated "(grow alongside M4)" — it starts once M1's surface-host work (#516) exists and scales up as M4 migration waves proceed, rather than waiting for all of M4 to finish. Per "Near-term execution order" item 6: "M5/M6 as migrated surfaces require them." No internal issue ordering is stated.

**Precondition:** grows in step with M4's migrated surfaces; not a hard gate after M4 completes, but paced by it.

Also note: per "Do not implement yet," **Legacy UI redesign #103, #105–#110 is blocked until #510 + #516** (both already satisfied once M1 completes — see section 6) — this constrains the *start* of that visual-redesign subset within M5, consistent with M5 beginning once M1's reference migration lands.

Block contents (20 issues): #103, #105, #106, #107, #108, #114, #293, #294, #296, #299, #300, #301, #316, #369, #370, #372, #400, #413, #414, #415.

**M5 total: 20/20 issues accounted for as one block**, paced alongside M4 rather than strictly sequential after it.

## 11. M6 — Controller & Shared/LAN Contract Migration (single block; "grows alongside M4")

Per the Gates diagram, M6 also branches from M1 ("M6 controller/LAN contracts") in parallel with M5, both paced by M4. Per "Do not implement yet": **Phone Mode / Player Controller #11–#20, #50–#51, #111–#113 is blocked until Controller intents (M0) exist and are proven in #510** — both preconditions are satisfied once M0 and M1 (#510) complete (sections 3 and 6). No internal ordering beyond this is stated for the rest of M6's issues.

Block contents (31 issues): #11, #12, #13, #14, #16, #17, #18, #19, #20, #50, #51, #109, #110, #111, #112, #113, #295, #352, #354, #357, #365, #371, #387, #388, #389, #391, #392, #393, #394, #399, #403.

**M6 total: 31/31 issues accounted for as one block**, unlocked by M0 + M1(#510), paced alongside M4.

## 12. Track — Tournaments & Persistent Events: unlocked after M0 persistence/ledger; #197 needs M4

Per "Do not implement yet": **"Tournaments #189–#198, Gauntlet adapters #310 | M0 persistence/ledger; #197 needs M4."** M0's persistence (#353) and ledger (#364) land in section 3, so this track's issues can start once M0 completes. #197 specifically has an additional, later precondition (M4) stated explicitly by the roadmap.

- **Startable once M0 completes** (10 issues, no further internal order stated):
  #21, #189, #190, #191, #192, #193, #194, #195, #196, #198
- **#197 — additionally requires M4** (stated explicitly): Tournament/Event 9: integrate tournament capabilities and persistent sessions into existing games — cannot start until M4's migrated games exist to integrate with.
- #310 — Add GauntletStageAdapter support to eligible existing games (named alongside Tournaments in the same "Do not implement yet" row; also requires M4-migrated games to adapt, same reasoning as #197). Note: #310 also appears in the Backlog — General Candidates list in the dump; it is placed here per its explicit gating text rather than duplicated.

**Track — Tournaments & Persistent Events total: 11/11 issues accounted for** (10 unlocked at M0 + #197 gated additionally to M4). #310 is cross-referenced here and not double-counted in the General Candidates backlog total below.

## 13. Track — Packaging, Distribution & Entitlements: blocked until "duplicate reconciliation + M0 content contract"

Per "Do not implement yet": **"Packaging/Licensing implementation | duplicate reconciliation + M0 content contract."** M0's content-adjacent contracts (BibleTextService #338/#339, GameDefinition #314) land in section 3; "duplicate reconciliation" refers to the roadmap's "No duplicate closure without migration" rule being satisfied for any packaging-adjacent duplicate issues (the roadmap does not name which duplicates, so this is stated at the same granularity ROADMAP.md uses). No internal issue ordering is given.

Block contents (33 issues): #24, #31, #32, #33, #34, #35, #36, #37, #313, #317, #319, #324, #344, #345, #346, #347, #395, #401, #405, #406, #409, #410, #425, #426, #427, #428, #429, #430, #431, #432, #433, #434, #436.

**Track — Packaging, Distribution & Entitlements total: 33/33 issues accounted for as one block**, unlocked after M0 content contracts + duplicate reconciliation (precise trigger flagged in Ambiguities below).

## 14. Track — Themed Content & Seasonal Packs

ROADMAP.md names this track in the "Value tracks" line but gives no explicit blocking condition for it in the "Do not implement yet" table or elsewhere — unlike Tournaments and Packaging, which share a content/pack foundation with this track (#24, the Pack model, is itself listed under Packaging). Since its own Step 0 dependency (#24, Pack model and Core split) lives in the Packaging track (section 13), this track is placed immediately after Packaging becomes unblocked, as the roadmap gives no independent trigger. Flagged explicitly in Ambiguities below.

Block contents (14 issues): #25, #26, #27, #28, #29, #30, #38, #39, #40, #41, #42, #43, #44, #45.

**Track — Themed Content & Seasonal Packs total: 14/14 issues accounted for as one block.**

## 15. Track — Platform Hardening & Operations

Named in "Value tracks" with no specific blocking condition stated anywhere in ROADMAP.md — it is not mentioned in "Near-term execution order," the Gates diagram, or "Do not implement yet." Per the "parallel now" framing given to the *other* tracks and the general vNext principle that infrastructure hardening applies once core foundation contracts exist, it is placed here as available once M0's foundation (diagnostics/observability-adjacent contracts included) is in place — but this positioning is the roadmap's least-specified placement and is flagged explicitly in Ambiguities below.

Block contents (17 issues): #322, #323, #373, #374, #375, #376, #396, #397, #404, #408, #416, #417, #418, #419, #420, #421, #423.

**Track — Platform Hardening & Operations total: 17/17 issues accounted for as one block.**

## 16. M7 — New General Agon Catalog on vNext

Per the Gates diagram, M7 branches from M3 ("M3 capabilities... ├──► M7 General new games (capability + #507 disposition)"). Per "Do not implement yet": **"M7/M8 games | M0 + their M3 capability + a #507 disposition."** #507 (section 5) and M0 (section 3) are already satisfied; each M7 game additionally needs its specific M3 capability (section 8) to exist. ROADMAP.md gives no ordering among M7's 70 issues beyond this shared precondition.

**Precondition:** M0 complete + relevant M3 capability landed + #507 disposition for that game/family.

Block contents (70 issues): #22, #23, #52, #53, #54, #55, #59, #60, #61, #62, #63, #64, #65, #66, #67, #68, #69, #70, #71, #120, #121, #122, #123, #124, #125, #126, #127, #128, #138, #139, #160, #161, #162, #163, #164, #165, #166, #172, #174, #175, #176, #177, #178, #179, #182, #183, #184, #185, #186, #286, #379, #381, #440, #441, #442, #443, #445, #454, #455, #456, #461, #462, #463, #467, #468, #469, #470, #471, #472, #473.

**M7 total: 70/70 issues accounted for as one block.**

## 17. Backlog — General Candidates

Per the "Do not implement yet" table's M7/M8 row, candidate games are individually startable "only via a #507 disposition" — i.e., a specific candidate becomes a real M7 issue only once #507's audit dispositions it into the catalog. None are startable on their own before that disposition; ROADMAP.md gives no per-candidate priority.

Block contents (38 issues, including #310 which is cross-referenced in section 12 under Tournaments per its explicit Gauntlet-adapter gating — counted once, here, as its home milestone bucket): #200, #201, #202, #203, #204, #205, #206, #207, #208, #209, #210, #211, #212, #213, #214, #215, #216, #217, #218, #219, #220, #221, #222, #223, #224, #225, #226, #227, #228, #229, #230, #231, #232, #233, #289, #291, #310, #474.

**Backlog — General Candidates total: 38/38 issues accounted for as one block; individual issues enter M7 only via a #507 disposition — none are startable before #507 completes (already satisfied per section 5, but each candidate still needs its own disposition decision).**

## 18. M8 — Agon Kids on vNext

Per the Gates diagram, M8 also branches from M3 ("├──► M8 Agon Kids (capability + Kids foundation #234/#235)"). Per "Do not implement yet," the same "M0 + their M3 capability + a #507 disposition" condition applies to M8 as to M7. Additionally, the Gates diagram names #234/#235 specifically as the Kids-foundation precondition for the rest of M8.

**Precondition:** M0 complete + relevant M3 capability + #507 disposition + Kids foundation (#234, #235).

1. **Kids foundation (named precondition in the Gates diagram):**
   - #234 — Kids Mode: pre-reader UX, gentle rules, age tagging, scripture loop
   - #235 — Kids: Dig Deeper cards, Memory Verse Wall, Story Passport

2. **Remaining M8 issues (no further stated order):**
   #257, #325, #326, #327, #328, #329, #330, #333, #334, #335, #484, #485, #488, #489, #492, #494, #496, #497, #498, #501, #502, #503, #504, #505, #506.

**M8 total: 27/27 issues accounted for** (2 named foundation issues + 25 in the remaining block).

## 19. Backlog — Agon Kids Candidates

Same reasoning as the General Candidates backlog (section 17): individually startable only via a #507 disposition into M8, plus the M8 Kids-foundation precondition (#234/#235, section 18).

Block contents (42 issues): #236, #237, #238, #239, #240, #241, #242, #243, #244, #245, #246, #247, #248, #249, #250, #251, #252, #253, #254, #255, #258, #259, #260, #261, #262, #263, #264, #265, #266, #267, #268, #269, #270, #271, #272, #273, #274, #275, #276, #277, #278, #279.

**Backlog — Agon Kids Candidates total: 42/42 issues accounted for as one block; individual issues enter M8 only via a #507 disposition and require the Kids foundation (#234/#235) — none are startable before both complete.**

## 20. M9 — Shared/Hosted Platform Implementations

Per the Gates diagram, M9 follows M6 ("M6 controller/LAN contracts ... ▼ M9 Shared/Hosted (after M6)"). Per "Do not implement yet": **"Shared/Hosted/communications | M6 exit."** M6 is section 11. No internal ordering stated among M9's issues.

Block contents (11 issues): #359, #360, #377, #378, #382, #383, #386, #390, #407, #411, #435.

**M9 total: 11/11 issues accounted for as one block**, unlocked at M6 exit.

## 21. M10 — Legacy Retirement

Per the Gates diagram, M10 follows M4 + M5 + M6 jointly ("M10 Legacy retirement (#517; after M4 + M5 + M6)"). Single issue, no internal order needed.

- #517 — M10: Legacy retirement epic — entry criteria and removal checklist

**M10 total: 1/1 issue accounted for.**

## 22. Backlog — Remaining Testing

Not mentioned by name in the Gates diagram, "Near-term execution order," or "Do not implement yet" — ROADMAP.md's only guidance is the milestone table's implicit content (Testing: Step 5 = Admin console/cross-app tests Layer 2; Step 6 = visual-regression baselines Layer 3) and the general principle that later testing layers depend on the surfaces they test existing. #5 (Admin console tests) presumes an Admin console shell exists (#104, Brand & Design System track, section 4). #6 (visual-regression baselines) presumes stable UI to baseline against, implying it is meaningful only once M5's presentation work (section 10) has produced stable surfaces — but ROADMAP.md never states this explicitly. Flagged in Ambiguities below.

- #5 — Testing: Step 5 — Admin console and cross-app tests (Layer 2)
- #6 — Testing: Step 6 — Visual regression baselines (Layer 3)

**Backlog — Remaining Testing total: 2/2 issues accounted for.**

## 23. 1.0.0 — Stabilization (release gate)

ROADMAP.md's "1.0.0 definition" section states 1.0 requires: M0 complete; M1 proven; design system at release quality (Brand & Design System track, section 4); local phone controllers operating through vNext (M6, section 11); save/resume working (M0 persistence, section 3); CI/regression/package validation green; and a representative set of migrated games (M4, section 9) covering clue/reveal, question/choice, ordering, and matching interaction families. #15 is explicitly named as the 1.0 tracking issue. #115 is grouped with it in this milestone in the dump (accessibility/responsive/visual-regression/real-device validation) though not individually named in the 1.0 prose.

- #15 — 1.0.0 stabilization checklist (tracking issue, per ROADMAP.md line 73)
- #115 — Agon UI: 6.2 accessibility, responsive, visual-regression, and real-device validation

**1.0.0 — Stabilization total: 2/2 issues accounted for**, gated on the composite 1.0 definition above (flagged in Ambiguities below since ROADMAP.md doesn't give this milestone its own single trigger sentence the way it does for M-gates).

---

## Accounting

**Total open issues in the milestone dump: 441** (20 milestone/track/backlog sections, header counts sum to 441, matching a direct count of `#NNNN` issue lines in the dump).

| # | Section | Issues | Accounted |
|---|---|---|---|
| 2 | #7 + #515 (named individually; also members of M0) | 2 | counted once, in M0's 29 |
| 3 | M0 — vNext Architecture Foundation | 29 | 29/29 |
| 4 | Track — Agon Brand & Design System | 7 | 7/7 |
| 5 | #507 (member of M2, started early) | 1 | counted once, in M2's 4 |
| 6 | M1 — vNext Reference Migration | 5 | 5/5 |
| 7 | M2 — Catalog & Migration Classification | 4 | 4/4 |
| 8 | M3 — Core Capability Extraction | 65 | 65/65 |
| 9 | M4 — Existing Game Migration Waves | 12 | 12/12 |
| 10 | M5 — Renderer / Experience Decomposition | 20 | 20/20 |
| 11 | M6 — Controller & Shared/LAN Contract Migration | 31 | 31/31 |
| 12 | Track — Tournaments & Persistent Events | 11 | 11/11 (#310 cross-referenced from General Candidates, not double-counted) |
| 13 | Track — Packaging, Distribution & Entitlements | 33 | 33/33 |
| 14 | Track — Themed Content & Seasonal Packs | 14 | 14/14 |
| 15 | Track — Platform Hardening & Operations | 17 | 17/17 |
| 16 | M7 — New General Agon Catalog on vNext | 70 | 70/70 |
| 17 | Backlog — General Candidates | 38 | 38/38 (includes #310, home bucket) |
| 18 | M8 — Agon Kids on vNext | 27 | 27/27 |
| 19 | Backlog — Agon Kids Candidates | 42 | 42/42 |
| 20 | M9 — Shared/Hosted Platform Implementations | 11 | 11/11 |
| 21 | M10 — Legacy Retirement | 1 | 1/1 |
| 22 | Backlog — Remaining Testing | 2 | 2/2 |
| 23 | 1.0.0 — Stabilization | 2 | 2/2 |

**Sum: 29+7+5+4+65+12+20+31+11+33+14+17+70+38+27+42+11+1+2+2 = 441. Matches the dump exactly. Every one of the 20 milestone/track/backlog buckets from the dump is represented, and every issue in each bucket is placed exactly once** (the single #310 cross-reference between Tournaments' gating text and its home bucket in General Candidates is noted, not double-counted in the total).

## Ambiguities flagged for the user's decision

ROADMAP.md's text was not precise enough to justify a firm placement in the following cases. Each was resolved with the most conservative reading (least invented precision) and called out here rather than silently decided:

1. **Track — Agon Brand & Design System has no stated end point.** The roadmap says it runs "parallel now" alongside M0 but never states when (or if) it's considered done relative to the gate sequence. This draft treats it as continuing in parallel indefinitely rather than assigning it a close-out gate. If the user wants it explicitly closed out at, say, M5 (since M5 is where UI/renderer work concentrates) or at 1.0, that's a judgment call the roadmap text doesn't make.

2. **Track — Themed Content & Seasonal Packs has no explicit blocking condition.** Only its Step 0 (#24, Pack model) sits inside the Packaging track. This draft placed the whole track immediately after Packaging becomes unblocked, but ROADMAP.md never states that the *rest* of Themed Content depends on Packaging's *other* 32 issues — only that its own Step 0 lives there. It's plausible this track could start earlier or run more independently; the roadmap simply doesn't say.

3. **Track — Platform Hardening & Operations has no stated blocking condition anywhere in ROADMAP.md.** It isn't mentioned in the Gates diagram, "Near-term execution order," or "Do not implement yet." This draft placed it as available once M0 lands (a conservative, defensible default given its infrastructure nature), but this is the weakest-justified placement in the whole sequence — the user may already have a different intended trigger in mind that isn't written down yet.

4. **Track — Packaging's precise "duplicate reconciliation" trigger is unnamed.** The "Do not implement yet" table says Packaging/Licensing implementation is blocked on "duplicate reconciliation + M0 content contract" but never says which duplicate issues need reconciling. This draft assumed M0's content contracts (#338/#339, #314) satisfy the second half and left "duplicate reconciliation" as a to-be-identified precondition rather than guessing which issues it refers to.

5. **Backlog — Remaining Testing (#5, #6) has no stated trigger.** This draft inferred #5 needs an Admin console shell (#104) and #6 needs stable UI to baseline (implying after M5), but ROADMAP.md does not say this explicitly anywhere — it's the closest analogous reasoning available, not a quoted rule.

6. **1.0.0 — Stabilization (#15, #115) is a composite gate, not a single stated trigger.** ROADMAP.md's "1.0.0 definition" section lists multiple conditions (M0, M1, design system, phone controllers, save/resume, CI green, representative migrated games) but never says these are strictly sequential vs. cumulative-whenever-true, and #115 is never individually named in that section (only grouped with #15 in the same GitHub milestone per the dump). This draft placed the milestone last, after all named preconditions appear earlier in the sequence, as the most literal reading.

7. **#310 lives in two places in the source data.** It's listed under "Backlog — General Candidates" in the milestone dump but is also named explicitly in the "Do not implement yet" table's Tournaments row ("Gauntlet adapters #310"). This draft kept #310 in its home bucket (General Candidates, section 17) for the total count, and cross-referenced its Tournament-adjacent gating in section 12, rather than picking one bucket and silently dropping the other signal.

None of the above changes any milestone definition, exit criterion, or architectural decision — they are all placement judgment calls within the existing rules, flagged so the user can confirm or correct them before this draft replaces any part of `ROADMAP.md`.
