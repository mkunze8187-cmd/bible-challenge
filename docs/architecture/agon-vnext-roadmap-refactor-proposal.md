# Agon vNext — Roadmap Refactor Proposal

**Status:** APPROVED 2026-09-28 with modifications (see §11); phases 1–6 executed. Phase 7 (closing duplicates) still requires separate approval.
**Date:** 2026-09-28
**Anchors:** ADR-001 + `specs/agon-vnext-migration-spec.md` (PR #512), #509, #510, #511, #507.
**Inventory basis:** 52 milestones (3 closed), 435 open issues, 892 native `blockedBy` edges, 34 open spec PRs, 32 implemented GameIds in `src/types/gameData.ts`.

---

## 0. Audit findings

| # | Finding | Evidence | Consequence |
|---|---|---|---|
| F1 | **Most architecture specs are not on `main`.** 34 spec PRs are open (#129–#499), including every platform contract spec (#312 modular platform, #348 multi-runtime, #361 core foundations, #412 handbook contracts, #446 Engine SDK, #303 existing-game migration). Issues reference `specs/…` paths that don't exist on `main`. | `ls specs/` on main = 14 files, none of them platform specs | Issues cite unmerged designs; ADR-001 can't be "authoritative" over specs nobody merged. |
| F2 | **A vNext-shaped foundation already exists as ~25 issues split across 5 milestones.** `0.6.0 Platform Architecture Foundation`, `Core Foundation (Pre-Migration)`, `Reference Architecture Validation`, `Stage Platform Foundation` and 13 unmilestoned Engine SDK/security issues all describe pieces of #509. | #314, #320, #350–#358, #362–#367, #447–#450 | #509 would duplicate them unless they become its sub-issues. |
| F3 | **Overlapping contract issues** that each claim the same boundary. | Commands/events: #350, #363, #448. Projection/privacy: #351, #387, #11, #50. Persistence: #353, #449, #190. Score ledger: #364, #191. Authority/validation: #365, #389. RNG/timer authority: #355, #142, #156. Registry: #314, #447. | Consolidation needed before implementation starts, or two contracts get built. |
| F4 | **Pre-ADR migration plan conflicts with ADR-001.** #321 selects "≥3 relatively simple games" as reference (ADR says don't pick trivial). #304 duplicates #511's matrix. #331 is a "migrate everything" issue. #451 is a third inventory of existing engines. | bodies of #304, #321, #331, #451 | Reword/fold into #510/#511; don't close yet. |
| F5 | **Newest ~125 issues have no dependencies and no milestone.** #385–#511 have zero `blockedBy` edges. #509/#510/#511 aren't linked to each other. | GraphQL `blockedBy` export | The anchors themselves are not wired into the graph. |
| F6 | **UI redesign milestones target the legacy monolith.** 0.7.0–0.9.0 (#103, #105–#110) redesign surfaces inside the current `App.tsx` (9,272 lines, 95+ `gameId ===` branches). #105 is literally "standard quiz-family migration". | ROADMAP.md, issue bodies | Doing these before M5 decomposition means redesigning code about to be replaced. |
| F7 | **Phone Mode is specified against the legacy prompt model.** #11–#20, #50–#51 extend `PhonePromptModel`/`toPhoneView()`. | #50 title | Moves behind Controller intents (M6) instead. |
| F8 | **Game-specific global stats still planned.** #64 "Bible Baseball: stats fields"; current `PlayerStats` has 18 per-game fields. | `src/lib/gameCore.ts:23` | Violates ADR guardrail 4; reword. |
| F9 | **Packaging/licensing specified twice.** Content Licensing #31–#37 vs Entitlements #427/#431/#432; pack model #24 vs #319 vs #425/#426; updates #324 vs #433; translation packs #347 vs #429. | titles/bodies | One Packaging track; reconcile before any is built. |
| F10 | **CI doesn't exist** (#7 is optional backlog). The legacy-freeze rule has no enforcement mechanism without it. | milestone `Backlog — Remaining Testing & CI` | Pull #7 into M0. |
| F11 | **No save/resume exists today** (only app settings in `localStorage`). | `App.tsx:2447` | The reference migration must build persistence, not port it. |
| F12 | Game-level milestones (Bible Baseball, Pairs of Faith, Wayfinder, …) mix engine work with game work, and ~20 of 52 milestones hold ≤3 issues. | milestone list | Milestone explosion; grouping moves to `track:` labels. |

Audience boundary: the only issue bodies that currently merge across families were already corrected by #507/PR #508. No new cross-family merges are proposed here; all duplicate candidates below are same-family.

---

## 1. Revised milestone list

Eleven architectural gates (M0–M10) plus five value tracks and three backlogs replace the current 49 open milestones. Closed milestones (0.1.x, 0.2.0, 0.3.0) stay as history.

| Milestone | Purpose | Entry | Exit | Depends on | Open issues |
|---|---|---|---|---|---|
| **M0 — vNext Architecture Foundation** | Contracts, AgonRuntime, registries, Engine SDK, Offline adapter, LegacyGameAdapter/launch resolver, deterministic harness, CI enforcement. | PR #512 merged. | A minimal GameDefinition runs in a test host with no Electron/renderer/network import; all 32 legacy games still launch; CI enforces boundaries. | — | 25 + 3 new |
| **M1 — vNext Reference Migration** | #510: one representative game authoritative on vNext end-to-end. | M0 exit. | Reference game authoritative in launch registry; migration checklist/template checked in. | M0 | 4 |
| **M2 — Catalog & Migration Classification** | #507 + #511: migration matrix and dependency graph. | #507 can start now; #511 needs M1. | Checked-in matrix; wave issues created; M3/M4 rebuilt from it. | M1 (for #511) | 5 |
| **M3 — Core Capability Extraction** | Reusable engines/capabilities with named consumers. | M0 exit (SDK); per-capability consumers from M2. | Capabilities needed by the first bulk waves have stable contracts + deterministic tests. | M0, M2 | 65 |
| **M4 — Existing Game Migration Waves** | Migrate implemented games by capability family. | M1 exit + wave issue from #511 + its capabilities. | Every retained implemented game authoritative on vNext or dispositioned. | M1, M2, M3 | 12 (+ wave issues from #511) |
| **M5 — Renderer / Experience Decomposition** | Shell, setup, Host console, Stage, game surface, results, help as bounded surfaces. | M1 (first vNext surfaces exist). | Migrated games need no game-specific top-level branch in `App.tsx`. | M1; runs alongside M4 | 20 + 1 new |
| **M6 — Controller & Shared/LAN Contract Migration** | LAN/Host Remote/phone behind Controller intents + transport contract. | M0 controller-intent contract; M1 proves intents. | Phone controllers work through vNext; a second transport could implement the same contract. | M0, M1 | 30 |
| **M7 — New General Agon Catalog on vNext** | New AGON_GENERAL games. | Game's capabilities (M3) + #507 disposition. | per-game | M3, M2 | 70 |
| **M8 — Agon Kids on vNext** | AGON_KIDS family: Kids Mode foundation, Journeys, Activity Events, Kids games. | Shared capabilities + #234/#235 Kids foundation. | per-game | M3, M2 | 27 |
| **M9 — Shared/Hosted Platform Implementations** | Adapters/services only, no game forks. | M6 exit. | Shared/Hosted run existing GameDefinitions unchanged. | M6 | 11 |
| **M10 — Legacy Retirement** | Delete legacy launch path, monolith branches, per-game `PlayerStats`. | Every retained implemented game migrated or superseded. | `gameEngine.ts` gone; full regression + package suite green. | M4, M5, M6 | 0 + 1 new epic |
| Track — Agon Brand & Design System | Renamed from 0.5.0 Agon 1 + Admin shell #104. Renderer-agnostic, so it runs in parallel with M0. | now | tokens/primitives usable by vNext surfaces | — | 7 |
| Track — Tournaments & Persistent Events | Retains the existing milestone and its description. | M0 persistence + score ledger; M1. | — | M0, M1, M3 | 11 |
| Track — Packaging, Distribution & Entitlements | Merges Content Licensing, Game & Content Packs, Translation Providers & Packs, #425–#436, asset/footprint issues. | M0 content contract | — | M0 | 33 |
| Track — Themed Content & Seasonal Packs | Merges Themed Content Groundwork + Themed Content Packs (content-only; allowed under the freeze). | pack model (#24) from Packaging | — | Packaging | 14 |
| Track — Platform Hardening & Operations | Merges Platform Hardening + Platform Cleanup + docs publishing/localization/privacy. | post-M4 | — | M4 | 17 |
| 1.0.0 — Stabilization | First release-quality, architecturally complete **Local vNext** product (see §11). | M0 + M1 | see §11 | M0, M1, M6 (local) | 2 |
| Backlog — General Candidates | Existing "Backlog — Candidate Games"; items leave only via #507 disposition → M7. | — | — | #507 | 38 |
| Backlog — Agon Kids Candidates | Existing "Backlog — Agon Kids"; exits to M8. | — | — | #507 | 42 |
| Backlog — Remaining Testing | #5, #6 (#4 → M1, #7 → M0). | — | — | — | 2 |

**Milestones to close once empty (43):** 0.4.0, 0.7.0 Agon 2, 0.8.0 Agon 3, 0.9.0 Agon 4, Agon 5, Agon 6, Phone Stages 2&3, Controller Private Choice, Daily Challenge, Bible Map, Themed Content Groundwork, Themed Content Packs, Content Licensing, Progressive Reveal Batch, Timeline Sub-Modes, Director's Cut, Bible Baseball, Blockbusters, Forbidden Words, Agon Game Foundations, Bible Playing Deck, Pairs of Faith, Unveiled, Multitude, Wayfinder, Computer Players, Platform Architecture Foundation, Reference Architecture Validation, Platform Migration 2, Platform Cleanup, Game & Content Packs, Image Board, Team Play Styles, Participant Emblems, Kids Activity Events, Bible Translation Foundation, Bible Translation Providers & Packs, Core Foundation, Stage Platform, Platform Hardening, Learning Platform Expansion, Future Hosted, Future Shared. Each description is preserved by copying it into the matching `track:` label description (or into the roadmap doc when it is longer than a label allows). Milestones will be **closed, not deleted**. To keep history and descriptions, three of them are renamed instead of closed: Themed Content Groundwork becomes the Themed Content track, Content Licensing becomes the Packaging track, and Platform Hardening becomes the Hardening track. The net result is 40 closed.

**Labels to add:** `audience: general`, `audience: kids`, `vnext: capability`, `vnext: migration`, `vnext: new-game`, `legacy-only` (defect/content work allowed under the freeze), and `track: <name>` for each former per-game/feature milestone (e.g. `track: bible-baseball`, `track: cards`, `track: randomizers`).

---

## 2. Dependency map

```text
PR #512 (ADR-001)
   │
   ▼
M0 Foundation (#509) ───────────────┬──────────────► Track: Brand & Design System (parallel, no dep)
   │  #362 domain ─► #314 GameDef ─► #447 EngineRegistry
   │  #350/#448 intents+events ─► #351 projection ─► #353 persistence
   │  #142 RNG, #156 timer, #364 ledger, #338/#339 BibleTextService
   │  NEW LegacyGameAdapter/launch resolver, NEW Offline adapter, NEW boundary CI (+#7)
   ▼
M1 Reference (#510, +#402 answer evaluation, #4 oracle tests)
   │                    ╲
   ▼                     ▼
M2 #507 ──► #511 ──►  M5 renderer decomposition (starts at M1, grows with M4)
   │                    M6 controller/LAN contracts (starts at M1)
   ▼                                   │
M3 capabilities (named consumers)      │
   │                                   │
   ▼                                   ▼
M4 migration waves ──────────────► M9 Shared/Hosted (after M6)
   │
   ├──► M7 General new games (need M3 capability + #507 disposition)
   ├──► M8 Kids (need M3 capability + #234/#235)
   ▼
M10 Legacy retirement (after M4 + M5 + M6)
```

**Native `blockedBy` edges to add (≈40):**

- #510 ← #509. #511 ← #507, #510. #304 ← #511 (folded; see §6).
- #509 sub-issues: #314, #320, #349, #350, #351, #353, #355, #356, #358, #362, #363, #364, #366, #367, #447–#450, #142, #156, #337–#339, #7, + 3 new.
- #510 ← #402. #402 ← #350, #338.
- M4 wave placeholders #305–#309, #321, #331 ← #511.
- #56, #57 ← #306 (timeline wave). #58 ← #308. #87 ← word-puzzle wave (from #511). #311 ← #331.
- M6 entry: #11, #357, #399 ← #510. #352, #354 ← #350.
- M5 entry: #103, #105, #108, #369 ← #510.
- Every M7/M8 game epic ← #509 plus its capability issue. The first pass uses the capabilities already named in each issue body (e.g. #454 ← #452, #461 ← #458, #440 ← #438, #182 ← #181, #122 ← #132). The ~120 existing edges into #321 get redirected to #509 (for the foundation) or #510 (for the proof), because #321 is being reworded.
- New-issue edges: M10 retirement epic ← #331.

Existing edges stay unless they point at a reworded issue, as above.

---

## 3. Implemented-game migration matrix (provisional input to #511)

Legacy test assets for every game: the `gamePlaythrough.test.ts` all-correct playthrough (parametrized over all 32), `gameEngine.test.ts` (52 cases, mixed), and `scoring.test.ts`. Waves are **provisional**; #511 owns the final assignment.

| Wave | GameId (label) | Buzz policy | Dominant loop | Primary capabilities | Disposition / #507 question |
|---|---|---|---|---|---|
| **W1 ref** | five-guesses (Five Clues) | orders-steals | Category/value board → progressive clues → typed answer → steals | board selection, progressive reveal, answer evaluation, buzzer, value scoring | KEEP; **recommended reference** (§ Reference selection) |
| W2 clue | initials (Bible Initials) | orders-steals | 25-card board, initials + 6 clues | same as W1 + letter-hint | KEEP; could be a W1 profile (initials-first) — ask #507 |
| W2 clue | name-that-book | orders-steals | 5-clue ladder, steals | progressive reveal, answer eval | KEEP |
| W2 clue | prophecy-clue-ladder | replaces-turn | 5-clue ladder | progressive reveal | **Same-family merge candidate** with name-that-book as content profile |
| W3 question | who-said-it, reference-rush, chapter-finder, missing-word, complete-the-verse, messiah-prophecy, fulfillment-finder, psalm-theme, psalm-reference-finder, wisdom-match, two-truths-and-a-lie, odd-one-out | replaces-turn | One prompt → choice or typed answer | Challenge API, answer eval, Bible navigation | Biggest consolidation opportunity. Candidate pairs: psalm-theme/wisdom-match; complete-the-verse/missing-word; messiah-prophecy/fulfillment-finder; psalm-reference-finder/reference-rush/chapter-finder → `VARIANT_PROFILE` of one definition? **Don't port independently until #507 decides.** |
| W4 ordering | bible-timeline, bible-books-relay, verse-scramble, before-or-after, genealogy | replaces-turn / turn-only (genealogy) | Arrange/sequence; pairwise chronology | ordering capability, drag/controller ordering intent | KEEP; before-or-after may become a timeline mode (it overlaps #56 "Which Came First?") |
| W5 matching | bible-connections, prophecy-match, parable-match, prophecy-categories, proverb-categories | replaces-turn | Group/match cards | grouping/matching, card/tile | prophecy-categories/proverb-categories = same engine, content profiles |
| W6 word puzzle | scripture-puzzles (Verse Reveal), bible-cryptogram, bible-anagrams, word-ladder | buzz-to-solve / replaces / turn-only | Letter reveal/decode/transform | letter reveal, dictionary validation | KEEP; #87 (word-ladder rungs) lands here |
| W7 typing/race | verse-typing-race, relay-verse-build | not-supported / turn-only | Typing speed/accuracy; turn-by-word | typed input, race engine (#452) | KEEP; depends on race capability |

Per-game `PlayerStats` fields to become namespaced results as each wave lands: `earlySolves`, `initialsOnlySolves`, `letterRevealPoints`, `hiddenLetterSolveBonus`, `timelinePerfectOrders`, `scrambleSolves`, `connectionsGroupsFound`, `bookEarlySolves`, `beforeAfterCorrect`, `referenceRushCorrect`, `chapterFinderCorrect`, `whoSaidItCorrect`, `booksRelayPerfectOrders`, `missingWordCorrect`, `wordLadderStepsCompleted`.

### Reference-game selection (#510)

| Criterion | Five Clues | Name That Book | Bible Timeline | Before or After |
|---|---|---|---|---|
| Team/individual participation | ✔ | ✔ | ✔ | ✔ |
| Nontrivial state transitions | ✔ board → card → clue ladder → steal chain | ◐ ladder + steal | ◐ ordering submit | ✘ |
| Scoring/results | ✔ card value, early-solve | ◐ | ◐ | ✘ |
| Reusable mechanic potential | ✔ progressive reveal (initials, name-that-book, prophecy-clue-ladder, #52–#55, #231, #233, #381) + board selection (#65, #172) | ✔ progressive reveal | ✔ ordering (5 games) | ◐ |
| Content loading | ✔ session packs + aliases | ✔ | ✔ | ✔ |
| Stage usefulness | ✔ board projection | ◐ | ✔ | ◐ |
| Controller usefulness | ✔ buzz + typed + card pick | ✔ buzz + typed | ◐ ordering (hard on phone) | ✔ choice |
| Host usefulness | ✔ reveal/mark/select answerer/undo | ✔ | ◐ | ◐ |
| Persistence usefulness | ✔ multi-card board mid-session | ◐ | ◐ | ✘ |
| Already separated | ✔ `src/lib/games/fiveGuesses.ts` (483 lines) | ✘ | ✘ | ✘ |
| Manageable scope | ◐ board + steals is the largest | ✔ | ✔ | ✔ |

**Recommendation: Five Clues**, with **Name That Book as the fallback** if the board scope proves too large. The fallback proves the same progressive-reveal, answer-evaluation and buzz-steal boundaries, minus board selection. Five Clues is preferred on merit, not because it is already separated: it is the only candidate that covers every #510 boundary, and its reveal capability has the largest downstream consumer set.

---

## 4. Planned-game disposition / migration matrix (coordinate with #507)

Dispositions from PR #508 are used where they exist; everything else is "pending #507". No planned game starts before its capability exists and it has a disposition.

| Game / track | Audience | Issues | Target | Needs capability (M3) | Disposition |
|---|---|---|---|---|---|
| Pairs of Faith | GENERAL | #120–#128 | M7 | cards #130/#132, relationships #438 | pending #507 — relationship model overlaps Scripture Relationship #438; share one graph |
| Unveiled | GENERAL | #172 | M7 | reveal/board (from #510), timer #156 | pending #507 — vs #231 Open the Scroll (#508 says distinct) |
| Multitude | GENERAL | #174–#179 | M7 | category/listing (**new capability issue**, currently inside #174) | pending |
| Wayfinder | GENERAL | #182–#186 | M7 | maze #181 | pending |
| Bible Baseball | GENERAL | #59–#64 | M7 | turn rotation #292, private choice (M6) | pending; #64 reworded (§5) |
| Bible Blockbusters | GENERAL | #65–#68 | M7 | hex board (Board Play #476) | pending |
| Forbidden Words | GENERAL | #69–#71 | M7 | timer, private clue-giver view (M6) | pending |
| Progressive-reveal batch | GENERAL | #52–#55 | M7 | progressive reveal (M1) | **likely VARIANT_PROFILE** of Five Clues/Name That Book family — #507 |
| Bible Map Challenge | GENERAL | #23, #286 | M7 | Image Board #280–#285 | **#23 and #286 are same-family duplicates** — keep #286 as the implementation, migrate #23's requirements, then close #23 |
| Daily Challenge | GENERAL | #22 | M7 | seeded RNG #142 | KEEP (mode/profile) |
| Bible Playing Deck | GENERAL | #138–#139 | M7 | cards | KEEP |
| Scripture Chain | GENERAL | #440–#443, #445 | M7 | #438/#439 | KEEP |
| Running the Race | GENERAL | #454–#456 | M7 | race #452/#453 | KEEP; absorbs #210 profile per #508 |
| Exodus: The Journey | GENERAL | #461–#463 | M7 | journey #458–#460 | KEEP; supersedes #229 per #508 |
| Lost in Translation / Secret Identity | GENERAL | #379 / #381 | M7 | reveal; bidding #380 | pending |
| Themed P2 (Babel, Armor of God, Sow & Grow, To the Churches, Beatitudes, Pilgrim's Way, Five Stones) | GENERAL (#473 has an open Kids-profile question) | #467–#473 | M7 | various | pending #507. Cross-family neighbours (#251 Armor Up, #250 Sower's Field) are SHARE only |
| Computer Players | infra | #160–#166 | M7 (first consumer: Pairs of Faith #164) | participants (M0) | — |
| Candidates #200–#233 | GENERAL | — | Backlog → M7 | per #508 table | per #508: merge/supersede #212, #229, #230; profile #203, #204, #210, #214, #215, #217, #220, #226, #232 |
| Joust / Gauntlet | GENERAL | #289 / #291, #310 | Backlog | tournament orchestration, simultaneous | pending |
| Kids foundation | KIDS | #234, #235, #257 | M8 | — | foundation |
| Kids P2 games & Journeys | KIDS | #484–#506 | M8 | #483, #487, #491, #493, #495, #500 | **#484 Two by Two duplicates candidate #243 Two by Two** (same-family Kids): keep #484, migrate #243's requirements |
| Kids Activity Events | KIDS | #325–#335 | M8 | Make engine #329, Image Board | KEEP_KIDS |
| Kids candidates | KIDS | #236–#279 | Backlog → M8 | — | pending #507 |

---

## 5. Existing issues whose wording, dependencies or milestone must change

Milestone reassignment for every open issue is in **Appendix A**. The wording edits below are in addition to that. Each rewrite adds a "vNext target (ADR-001)" section at the top of the issue and leaves the original text intact below it (rule A).

| Issue | Change |
|---|---|
| #509 | Add a sub-issue list (§2) and a "Contract ownership" table that resolves F3: #350 owns command/intent envelopes; #363 is folded into #350/#448; #351 owns projection and #387 hardens it later in M6; #353 owns session persistence, #190 builds Event persistence on top of it, and #449 owns engine snapshots; #364 owns the score/results ledger, which #191 consumes. |
| #510 | Record the reference-game decision and add #402 and #4 as prerequisites. |
| #511 | Absorb #304's capability columns and #451's engine inventory; mark #304/#451 as feeding it. |
| #507 | Add §4 duplicate candidates (#23/#286, #243/#484, #52–#55 profile question, W3 consolidation pairs). |
| #304 | Retarget: "matrix columns become part of #511 output". Close after #511's matrix covers them (§6). |
| #314 | Drop "after PR #312 merges"; add "implements the GameDefinition/registry part of #509 per ADR-001". |
| #321 | Rewrite: from "≥3 simple reference games" to "W2 reference-adjacent migrations after #510", consistent with ADR-001's "not trivial" rule. |
| #331 | Rewrite as the **M4 migration-waves epic**, with one sub-issue per wave created by #511. |
| #357 | Narrow to "Local LAN controllers through vNext Controller/transport contracts" (M6); the reference-game proof moves to #510. |
| #305–#309 | Add a note: "Placeholder for M4 wave; scope and game list are finalized by #511. Capability extraction portions move to M3 issues that #511 creates." |
| #11, #50, #51, #12–#20 | Replace `PhonePromptModel`/`toPhoneView()` targets with Controller intents and projection (#350, #351). Legacy games are reached through the LegacyGameAdapter. |
| #103, #105–#110 | Replace "redesign in App.tsx / quiz-family migration" with "build as vNext surface (M5) and apply the design system". #105's "standard quiz-family migration" becomes a dependency on the W3 wave. |
| #64 | "stats fields" → "namespaced result/stat contributions via #364 ledger; no global `PlayerStats` field". |
| #67 | "GameId, schema" → "GameDefinition registration + content schema". |
| #56, #57, #58, #87 | Add "implement as vNext profile/variant after its migration wave; legacy-only change not permitted". |
| #197, #310, #311 | "Existing games" → "migrated vNext GameDefinitions". |
| #292, #103, #27, #52 | The body text references `gameEngine.ts`/`App.tsx`/`PlayerStats`; retarget to vNext contracts. |
| #7 | Promote from optional; scope = typecheck + unit + architecture-boundary check on every PR. |
| #4 | Scope to regression-oracle coverage for the reference game first, then each wave. |
| #365, #389 | Mark #365 as the authorization model and #389 as its threat-model/validation hardening; both go to M6. |
| #24 vs #425, #319 vs #425/#426, #324 vs #433, #31–#35 vs #427/#431/#432, #347 vs #429 | Cross-link and mark the older issue "requirements to merge into newer packaging issue" (§6). |
| #466 | Tag as "single consumer (#467, possibly #223): classify as game-local unless #507 finds a second consumer". |
| All issues citing an unmerged spec PR as a dependency | Replace "after PR #N merges" with a reference to the spec path once the PR merges (§8). |

---

## 6. Obsolete / redundant issues — do NOT close yet

Each issue below closes only after its unique requirements have been copied into the destination and reciprocal links added.

| Issue | Destination | Reason |
|---|---|---|
| #304 | #511 | Same implemented-game matrix. |
| #451 | #511 + M3 capability issues | Third inventory of existing engines. |
| #321 | M4 W2 wave issue | Superseded by #510 (reference) + W2. |
| #363 | #350 / #448 | Same event-envelope vocabulary. |
| #21 | #189–#198 | Old tournament umbrella; the numbered issues cover it. |
| #23 | #286 | Same Bible Map game. |
| #243 | #484 | Same Kids Two by Two game. |
| #229 | #461–#463 | SUPERSEDED per #508. |
| #212, #230 | timeline family / #207 | MERGE_SAME_FAMILY / VARIANT_PROFILE per #508. |
| #24, #319, #324, #31–#35, #347 | newer packaging issues | F9 duplicates. |
| #14 | M6 / #434 Prepare Event readiness | "Optional" event-readiness step overlaps #434. |
| PR #187 (roadmap-agon-games) | new ROADMAP.md | Superseded roadmap PR; close after this refactor lands. |

---

## 7. New issues (gaps only)

| New issue | Milestone | Why not an existing issue |
|---|---|---|
| **#513** vNext: LegacyGameAdapter and GameId launch resolver (one authoritative path per game)** | M0 | Only a bullet inside #509; nothing owns it. |
| **#514** vNext: Offline/Local platform adapter — inject Electron/storage/clock services via contracts** | M0 | #349 is only an audit; #357 is LAN end-to-end. |
| **#515** vNext: architecture-boundary enforcement and legacy-freeze guard in CI** | M0 | #323 is a later size/duplication budget. This issue covers import boundaries (vNext code must not import `gameEngine.ts`, `App.tsx` or Electron) and flags diffs that grow the `GameId` union. |
| **#516** Renderer: vNext surface host inside the legacy shell (mount GameDefinition surfaces without `App.tsx` branches)** | M1 (moved from M5 during execution) | The #103/#105 redesign issues assume the monolith. |
| **#517** M10: Legacy retirement epic (entry criteria + removal checklist)** | M10 | No retirement tracking exists. |

Deliberately not created now: per-wave migration issues and new capability issues (e.g. category/listing for Multitude). **#511 creates those**, so that each one names its consumers.

---

## 8. Roadmap and spec references

1. Merge PR #512 first. ADR-001 becomes the governing document.
2. **Open spec PRs (34): decision needed (§11).** Recommended: merge design-complete specs as **design references** with a header line: *"Implementation targets Agon vNext per ADR-001. Any integration via `gameEngine.ts`/`App.tsx` described here is superseded; sequencing is governed by ROADMAP.md."* This separates design-complete from implementation sequencing (rule B) and makes the `specs/` paths that issues cite actually exist. Architecture specs #312, #348, #361, #412 and #446 get an extra note that ADR-001 prevails on conflict. #303 gets "sequencing superseded by #511". #187 is closed, not merged.
3. Rewrite `ROADMAP.md` around M0–M10 + tracks with the §2 diagram. It keeps the "native `blockedBy` is the source of truth" rule.
4. Add the legacy-freeze rule to `AGENTS.md` and to the PR template.

---

## 9. Do-not-implement-yet

| Work | Blocked until |
|---|---|
| Any M7/M8 game (#52–#71, #120–#128, #172–#186, #379, #381, #440–#473, #484–#506, Activity Events) | M0 + its M3 capability + #507 disposition |
| Timeline sub-modes #56/#57, Director's Cut #58, Word Ladder rungs #87, randomizer variants #311 | the owning game's M4 wave |
| Agon UI redesign of legacy surfaces #103, #105–#110 | M1 (vNext surface host exists) |
| Phone Mode #11–#20, #50–#51, Player Controller #111–#113 | Controller intent contract (M0), proven in M1 |
| Tournaments #189–#198, Gauntlet adapters #310 | M0 persistence/ledger; #197 needs M4 |
| Hosted/Shared/communications #359, #360, #377, #378, #382, #383, #386, #390, #411, #435 | M6 exit |
| Packaging implementation (#425+) and Licensing (#31+) | duplicate reconciliation (F9) + M0 content contract |
| Engine migrations #305–#309, #331 | #511 |
| Computer players #160–#166 | M0 participants + first consumer |

**Allowed now, in parallel with M0:** #117 and #99–#102 (design system); #104 (Admin shell); content authoring for existing games; legacy defect, security and accessibility fixes; #507 catalog audit; #4 oracle tests.

---

## 10. Next 20 actionable items, in execution order

1. Review/merge **PR #512** (ADR-001).
2. Approve this proposal, then apply milestones, labels, dependency edges and rewordings (§12).
3. **#7** CI: typecheck, unit, and the architecture-boundary guard (new M0 issue).
4. **#509** kickoff: record the contract-ownership table (F3) and the sub-issue list.
5. **#362** canonical domain model (participants, teams, IDs).
6. **#314** GameDefinition schema + registry (+ #358 capability metadata).
7. **#447** EngineRegistry + lifecycle.
8. **#350 / #448** intents, commands and events (fold #363).
9. **#351** projection: Stage public vs Host/Player private.
10. **#142** seeded RNG + **#156** timer model (platform contracts).
11. **#364** score/results ledger (namespaced stats).
12. **#353** SessionPersistence + Local adapter.
13. **#338 / #339** BibleTextService + KJV local provider.
14. New: **Offline/Local platform adapter**.
15. New: **LegacyGameAdapter + launch resolver**; **#356** in-memory conformance harness. → M0 exit.
16. **#507** catalog audit (in parallel from step 2).
17. **#4** Five Clues oracle tests + **#510** selection note.
18. **#402** Answer Evaluation Service (extracted for Five Clues).
19. New: **vNext surface host** (minimal) → **#510** implementation → M1 exit.
20. **#511** → wave and capability issues; start W2 (progressive-clue family).

---

## 11. Decisions (approved 2026-09-28)

1. **Reference game:** Five Clues (`five-guesses`); fallback Name That Book.
2. **0.4.0 Phone Mode Stage 1:** folded into M6 behind Controller intents; no legacy-path exception.
3. **1.0.0:** the first release-quality, architecturally complete Local vNext product: M0 complete; M1/reference architecture proven; design system at release quality; local phone controllers operating through vNext contracts; save/resume working; CI/regression/package validation green; a representative set of migrated games covering the important interaction families. The **percentage migrated is tracked separately as a roadmap metric**, not a release criterion. Shared/Hosted, complete legacy retirement and the entire new-game catalog are **not** 1.0 requirements. (This replaces the earlier proposed "≥50% migrated" criterion.)
4. **Open spec PRs:** merged as design references after adding ADR-001/vNext supersession headers; roadmap PR #187 closed unmerged.
5. **Execution:** phases 1–6, with verification/export after each phase. Duplicate closure (phase 7) requires separate approval after requirements are migrated and cross-linked.

### Adjustments made during execution
- New issues: #513 LegacyGameAdapter/launch resolver (M0), #514 Offline/Local adapter (M0), #515 boundary CI (M0), #516 vNext surface host (**moved to M1**, since #510 needs it), #517 legacy retirement epic (M10).
- #403 host adjudication moved to M6 (depends on #365 authorization); #481 Board Play reuse audit moved to M3 (depends on #480).
- Dependency fixes that broke gate inversions or cycles: removed #353←#190 (Event persistence now builds on #353), #356/#358←#352/#354/#357 (M0 must not wait on M6), #351←#316, #142←#141 (RNG core precedes the dice model; #141←#142 added); #15 blockers replaced by the new 1.0 definition.

---

## 12. Execution plan (after approval)

All steps are scripted and driven from the checked-in mapping CSV, and each phase is re-verified with a fresh export.

1. **Additive:** create M0–M10 + track milestones; create labels; create the 5 new issues.
2. **Reassign:** move the 435 open issues per Appendix A; add labels.
3. **Wire:** add the §2 `blockedBy` edges and #509 sub-issues; redirect #321 edges.
4. **Reword:** prepend "vNext target" sections to the §5 issues.
5. **Docs PR:** new ROADMAP.md, AGENTS.md freeze rule, this document plus the migration matrix under `docs/architecture/`.
6. **Close empty milestones** (close, never delete).
7. **Later, separately confirmed:** close the §6 duplicates after their requirements have been migrated.

---

## Appendix A — Issue → milestone mapping (435 pre-existing open issues + 5 new)

Codes: M0–M10 as above; UI = Brand & Design System; TE = Tournaments & Events; PK = Packaging, Distribution & Entitlements; TC = Themed Content; PH = Platform Hardening & Ops; S1 = 1.0.0 Stabilization; BG/BK/BT = General/Kids/Testing backlogs.


### M0 (28)

| # | Title | Previous milestone |
|---|---|---|
| #7 | Testing: Step 7 (optional) — CI pipeline | Backlog — Remaining Testing & CI |
| #142 | Agon Randomizers: 2. authoritative seeded RNG, multi-roll engine, and history | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #156 | Agon Timer: 1. authoritative timer model, clock, lifecycle, and recovery | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #314 | Platform: implement versioned GameDefinition schema, capability registry, and runtime composition | 0.6.0 — Platform Architecture Foundation |
| #320 | Platform: define trusted novel-mechanic module contract for games that cannot be purely declarative | 1.x — Platform Migration 2: Existing Game Families |
| #337 | Bible translations: inventory KJV assumptions and translation-dependent games/content | 1.x — Bible Translation Foundation |
| #338 | Bible translations: implement BibleTextService, TranslationProvider contract, and Translation Registry | 1.x — Bible Translation Foundation |
| #339 | Bible translations: wrap current KJV corpus in local provider and remove direct KJV access | 1.x — Bible Translation Foundation |
| #349 | Multi-runtime: audit desktop, LAN, filesystem, and local-authority assumptions | 1.x — Core Foundation (Pre-Migration) |
| #350 | Multi-runtime: implement versioned SessionRuntime command/event contracts | 1.x — Core Foundation (Pre-Migration) |
| #351 | Multi-runtime: implement least-privilege ProjectionService for Stage, Host, Player, Team, and Site | 1.x — Core Foundation (Pre-Migration) |
| #353 | Multi-runtime: implement SessionPersistence contract and Local persistence adapter | 1.x — Core Foundation (Pre-Migration) |
| #355 | Multi-runtime: make Timer, Buzzer, RNG, and simultaneous-response mechanics authority-safe | 1.x — Core Foundation (Pre-Migration) |
| #356 | Multi-runtime: build in-memory conformance runtime and network-condition simulation test harness | 1.x — Reference Architecture Validation |
| #358 | Multi-runtime: add Local/Shared/Hosted capability and compatibility metadata to GameDefinition | 1.x — Reference Architecture Validation |
| #362 | Core foundation: canonical domain model, stable IDs, and ownership boundaries | 1.x — Core Foundation (Pre-Migration) |
| #363 | Core foundation: unified authoritative domain-event vocabulary and envelopes | 1.x — Core Foundation (Pre-Migration) |
| #364 | Core foundation: implement Score & Rules Ledger for game, tournament, and event scoring | 1.x — Core Foundation (Pre-Migration) |
| #366 | Core foundation: typed configuration inheritance and immutable ResolvedSessionConfiguration | 1.x — Core Foundation (Pre-Migration) |
| #367 | Core foundation: common schema versioning and deterministic migration framework | 1.x — Core Foundation (Pre-Migration) |
| #447 | Engine SDK P0: implement EngineRegistry, capability resolution, and standard lifecycle | — |
| #448 | Engine SDK P0: standardize commands, events, projections, InputActions, and renderer registration | — |
| #449 | Engine SDK P0: add versioned persistence, replay, migrations, and package/readiness contracts | — |
| #450 | Engine SDK P0: create shared engine conformance kit and reference engine | — |
| #509 | Architecture P0: establish Agon vNext foundation and staged legacy migration | — |
| #513 | vNext P0: LegacyGameAdapter and GameId launch resolver | (new) |
| #514 | vNext P0: Offline/Local platform adapter | (new) |
| #515 | vNext P0: architecture-boundary enforcement and legacy-freeze guard in CI | (new) |

### M1 (5)

| # | Title | Previous milestone |
|---|---|---|
| #4 | Testing: Step 4 — Challenge app feature tests (Layer 2) | Backlog — Remaining Testing & CI |
| #402 | Challenge foundation: implement reusable Answer Evaluation Service and policies | — |
| #422 | Developer documentation: add game, engine, content, package, Stage, and testing authoring guides | — |
| #510 | Migration P0: migrate one representative legacy game through AgonRuntime | — |
| #516 | Renderer: vNext surface host inside the legacy shell | (new) |

### M2 (4)

| # | Title | Previous milestone |
|---|---|---|
| #304 | Architecture: audit all implemented games for shared-engine/randomizer migration | 0.6.0 — Platform Architecture Foundation |
| #385 | Network foundation: classify mechanic latency sensitivity and runtime requirements | — |
| #507 | Catalog P1: apply audience-boundary consolidation audit across Agon and Agon Kids | — |
| #511 | Migration P1: classify implemented legacy games into vNext migration waves | — |

### M3 (65)

| # | Title | Previous milestone |
|---|---|---|
| #130 | Agon Cards: 1. generic Card & Deck model + canonical 52-card Bible specialization | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #131 | Agon Cards: 2. Scroll/Crown/Trumpet/Fish suit symbols and shared card visuals | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #132 | Agon Cards: 3. deterministic generic deck, zone, pile, hand, and transfer engine | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #133 | Agon Cards: 4. secure private-hand projection and reconnect/reassignment rules | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #134 | Agon Cards: 5. responsive PlayerCardHand for 1–25 cards | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #135 | Agon Cards: 6. persistent legal-action bar for card games | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #136 | Agon Cards: 7. public card table, projector, and opponent hand summaries | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #137 | Agon Cards: 8. Host Controls and Host Remote card-game integration | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #141 | Agon Randomizers: 1. configurable dice/randomizer model and persistence | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #143 | Agon Randomizers: 3. role-based public/private/delayed result projections | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #144 | Agon Randomizers: 4. Agon dice, spinner, tumbler, and custom-face presentation | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #145 | Agon Randomizers: 5. Player Controller roll interaction and private-result UX | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #146 | Agon Randomizers: 6. projector/public roll presentation and history | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #147 | Agon Randomizers: 7. Host Controls and Host Remote roll integration | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #148 | Agon Randomizers: 8. Admin custom-die/randomizer editor and seeded preview | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #149 | Agon Randomizers: 9. reusable game integration API and Card/Challenge composition | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #150 | Agon Randomizers: 10. development harness, accessibility/privacy, and no-gambling release gate | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #152 | Agon Randomizers: 11. first-class Spinner and Wheel presentations | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #153 | Agon Randomizers: 12. wheel pools, no-repeat selection, elimination, and reset | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #154 | Agon Randomizers: 13. Casting Lots presentation and selection modes | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #155 | Agon Randomizers: 14. Admin presentation/pool configuration and cross-presentation validation | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #157 | Agon Timer: 2. Hourglass, Countdown Ring, Digital, and Compact presentations | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #158 | Agon Timer: 3. Projector, Player Controller, and Host Remote synchronization | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #159 | Agon Timer: 4. migration helpers, development harness, and release validation | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #167 | Agon Cards: 11. generic CardRenderer and variable card formats | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #168 | Agon Cards: 12. Event/Challenge/Objective/Clue/Story deck support and safe effect adapters | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #169 | Agon Cards: 13. multiple decks, dynamic subsets, and mixed-format integration harness | 1.x — Agon Game Foundations: Cards, Randomizers, Timer |
| #181 | Wayfinder: 1. graph-first maze engine, generation, solvability, and fairness | 1.x — Wayfinder |
| #280 | Image Board: 1. board model, schema, validation, and asset pipeline | 1.x — Image Board Engine |
| #281 | Image Board: 2. pure engine — hit testing, placement, reveal, layers, paths, grading | 1.x — Image Board Engine |
| #282 | Image Board: 3. ImageBoardView renderer — projector, host, controller, admin surfaces | 1.x — Image Board Engine |
| #283 | Image Board: 4. controller board-select interaction and privacy projection | 1.x — Image Board Engine |
| #284 | Image Board: 5. Host Controls and Host Remote integration | 1.x — Image Board Engine |
| #285 | Image Board: 6. Admin board editor, preview, and validation | 1.x — Image Board Engine |
| #292 | Team Play Styles: 1. rotation model, engine integration, capabilities, and migration | 1.x — Team Play Styles |
| #315 | Platform: implement GameDefinition variant overlays instead of forked game implementations | 1.x — Reference Architecture Validation |
| #318 | Content Platform: reusable Bible content registry and versioned content packs | 0.6.0 — Platform Architecture Foundation |
| #340 | Bible translations: add translation dependency metadata and Scripture requirements to content/GameDefinition | 1.x — Bible Translation Foundation |
| #341 | Bible translations: implement Application/Event/Game translation selection and deterministic session pinning | 1.x — Bible Translation Foundation |
| #342 | Bible translations: make exact-wording games generate and evaluate from selected translation | 1.x — Bible Translation Foundation |
| #343 | Bible translations: centralize Scripture attribution, copyright, and translation labeling UI | 1.x — Bible Translation Foundation |
| #368 | Learning foundation: add Scripture learning metadata taxonomy to Content Registry | 1.x — Core Foundation (Pre-Migration) |
| #380 | Foundation — reusable hidden Bid & Contract Engine | 1.x — Platform Migration 2: Existing Game Families |
| #438 | Scripture relationships: implement reusable graph schema, registry, and validation engine | — |
| #439 | Scripture relationships: build deterministic puzzle generator and solution-space analyzer | — |
| #444 | Scripture relationships: add authoring, review, provenance, and graph coverage tooling | — |
| #451 | Engine SDK P1: inventory and incrementally migrate existing reusable engines/mechanics | — |
| #452 | Race Engine P1: implement race.track v1 core mechanics on Engine SDK | — |
| #453 | Race Engine P1: add Stage renderer, controller actions, accessibility, and generated-course support | — |
| #458 | Journey Engine P1: implement journey.campaign v1 with canonical narrative invariance | — |
| #459 | Challenge Aids P1: implement reusable challenge.aid modifiers | — |
| #460 | Journey Engine P1: implement activity-slot composition and configurable challenge pools | — |
| #466 | Tower of Babel P2: implement communication.constraint v1 capability | — |
| #476 | Board Play P1: implement board graph, tokens, movement, and topology validation | — |
| #477 | Board Play P1: implement declarative turn flow and space action orchestration | — |
| #478 | Board Play P1: integrate Randomizer, Card/Deck, Challenge, and Score capabilities | — |
| #479 | Board Play P1: add Stage/controller projections, persistence, and deterministic resume | — |
| #480 | Board Play P1: create reference board game and pack/readiness conformance fixture | — |
| #481 | Board Play P2: audit existing/planned games for Board Play reuse and pack consolidation | — |
| #483 | Kids P1: audit/extract reusable Memory Matching capability | — |
| #487 | Kids P1: implement reusable Perspective Scenario capability | — |
| #491 | Kids P1: implement declarative Story Activity Sequence composition | — |
| #493 | Kids P1: audit/extract reusable Target Challenge activity | — |
| #495 | Kids P1: audit/extract reusable Distribution Puzzle activity | — |
| #500 | Kids P1: formalize reusable Bible Story Journey profile | — |

### M4 (12)

| # | Title | Previous milestone |
|---|---|---|
| #56 | bible-timeline: add roundType and "Which Came First?" pairwise mode | 1.x — Timeline Sub-Modes |
| #57 | bible-timeline: add "Insert Event" round mode | 1.x — Timeline Sub-Modes |
| #58 | two-truths-and-a-lie: add presentationStyle and narrated-account content | 1.x — Director's Cut Presentation Variant |
| #87 | Word Ladder: cap number of rungs by difficulty level (easy = unlimited) | 1.0.0 — Stabilization |
| #305 | Refactor existing matching/category games onto shared Card/Tile/Deck Engine | 1.x — Platform Migration 2: Existing Game Families |
| #306 | Refactor Bible Timeline, Bible Books Relay, and Verse Scramble onto shared ordering engine | 1.x — Platform Migration 2: Existing Game Families |
| #307 | Refactor Five Clues, Name That Book, and Prophecy Clue Ladder onto progressive-clue engine | 1.x — Platform Migration 2: Existing Game Families |
| #308 | Migrate existing question-style games to shared Challenge Engine and Bible-navigation services | 1.x — Platform Migration 2: Existing Game Families |
| #309 | Refactor Verse Reveal onto shared reveal primitives | 1.x — Platform Migration 2: Existing Game Families |
| #311 | Add meaningful optional randomizer variants to migrated existing games | 1.x — Platform Migration 2: Existing Game Families |
| #321 | Platform migration: convert reference existing games to GameDefinitions and reusable content/assets | 1.x — Reference Architecture Validation |
| #331 | Platform migration: migrate all remaining existing games to modular GameDefinition/module architecture | 1.x — Platform Migration 2: Existing Game Families |

### M5 (20)

| # | Title | Previous milestone |
|---|---|---|
| #103 | Agon UI: 2.1 Challenge home, navigation, setup, settings, and common dialogs | 0.7.0 — Agon 2: Core Apps |
| #105 | Agon UI: 3.1 Game Presentation System and standard quiz-family migration | 0.8.0 — Agon 3: Game Presentation |
| #106 | Agon UI: 3.2 projector/audience adaptive layouts and safe-area system | 0.8.0 — Agon 3: Game Presentation |
| #107 | Agon UI: 3.3 specialized board games, card ordering, maps, tiles, and Bible Baseball presentation | 0.8.0 — Agon 3: Game Presentation |
| #108 | Agon UI: 4.1 shared Host Controls component system and desktop host redesign | 0.9.0 — Agon 4: Host Experience |
| #114 | Agon UI: 6.1 motion, audio, haptics, and game feedback polish | 1.x — Agon 6: Polish & Validation |
| #293 | Team Play Styles: 2. setup UX — Players tab, game setup picker, Event defaults | 1.x — Team Play Styles |
| #294 | Team Play Styles: 3. presentation — active member, Random Tag reveal, hot seat | 1.x — Team Play Styles |
| #296 | Team Play Styles: 5. member stats, recap, and release validation | 1.x — Team Play Styles |
| #299 | Emblems: 2. data model, persistence, uniqueness, and migration | 1.x — Participant Emblems |
| #300 | Emblems: 3. picker UX — Players tab, setup, phone join, Host Remote, Admin | 1.x — Participant Emblems |
| #301 | Emblems: 4. ParticipantShield everywhere and release validation | 1.x — Participant Emblems |
| #316 | UI Platform: consolidate reusable Agon components across Main Stage, controllers, Host, and Admin | 0.7.0 — Agon 2: Core Apps |
| #369 | Stage foundation: implement DisplayEndpoint contract and capability registration | 1.x — Stage Platform Foundation |
| #370 | Stage foundation: implement StageOrchestrationService and semantic presentation state machine | 1.x — Stage Platform Foundation |
| #372 | Stage foundation: adapt current Local Main Stage to Display/Orchestration contracts | 1.x — Stage Platform Foundation |
| #400 | Accessibility foundation: implement AccessibilityProfile and interaction readiness | — |
| #413 | Documentation foundation: implement DocumentationRegistry, topic schema, and package integration | — |
| #414 | Documentation foundation: implement context-sensitive HelpContext resolver and offline Help shell | — |
| #415 | Game documentation: require How to Play, Quick Start, Host notes, and learning-guide metadata | — |

### M6 (31)

| # | Title | Previous milestone |
|---|---|---|
| #11 | Phone Mode: Shared foundation — server, protocol, privacy projection | 0.4.0 — Phone Mode Stage 1 (Buzz Only) |
| #12 | Phone Mode Stage 1, Step 1: Connect and Buzz | 0.4.0 — Phone Mode Stage 1 (Buzz Only) |
| #13 | Phone Mode Stage 1, Step 2: Roster and Room | 0.4.0 — Phone Mode Stage 1 (Buzz Only) |
| #14 | Phone Mode Stage 1, Step 3 (optional): Event Readiness | 0.4.0 — Phone Mode Stage 1 (Buzz Only) |
| #16 | Phone Mode Stage 2: Buzz + Typed Answer | 1.x — Phone Mode Stages 2 & 3 |
| #17 | Phone Mode Stage 3, Step 1: Choice Select | 1.x — Phone Mode Stages 2 & 3 |
| #18 | Phone Mode Stage 3, Step 2: Collect All | 1.x — Phone Mode Stages 2 & 3 |
| #19 | Phone Mode Stage 3, Step 3: Map and Medium Games | 1.x — Phone Mode Stages 2 & 3 |
| #20 | Phone Mode Stage 3, Step 4: Board Games | 1.x — Phone Mode Stages 2 & 3 |
| #50 | Controller: add privateOverride to PhonePromptModel and extend toPhoneView() | 1.x — Controller: Private Choice & Number Input |
| #51 | Controller: extend Stage 3 leak test for privateOverride | 1.x — Controller: Private Choice & Number Input |
| #109 | Agon UI: 4.2 responsive Host Remote — phone and tablet producer console | 0.9.0 — Agon 4: Host Experience |
| #110 | Agon UI: 4.3 Host Remote game-board controls, ordering, text entry, and specialized interactions | 0.9.0 — Agon 4: Host Experience |
| #111 | Agon UI: 5.1 Player Controller shell, join/room, connection states, and responsive buzzer | 1.x — Agon 5: Player Controller |
| #112 | Agon UI: 5.2 Player Controller typed-answer, choice, number, and private-choice interactions | 1.x — Agon 5: Player Controller |
| #113 | Agon UI: 5.3 Player Controller ordering, tiles, grouping, maps, and specialized boards | 1.x — Agon 5: Player Controller |
| #295 | Team Play Styles: 4. Host Remote controls and Event/tournament persistence | 1.x — Team Play Styles |
| #352 | Multi-runtime: implement SessionTransport abstraction, reconnect, and protocol negotiation | 1.x — Core Foundation (Pre-Migration) |
| #354 | Multi-runtime: implement Identity, Presence, roles, join identity, and Local site abstraction | 1.x — Core Foundation (Pre-Migration) |
| #357 | Multi-runtime: adapt Agon Local end-to-end to platform contracts with reference games | 1.x — Reference Architecture Validation |
| #365 | Core foundation: capability-based authorization for Host, site, team, player, and admin actions | 1.x — Core Foundation (Pre-Migration) |
| #371 | Stage foundation: synchronized presentation scheduling, reconnect, and Stage resynchronization | 1.x — Stage Platform Foundation |
| #387 | Security foundation: enforce hidden-information projection and serialized-payload privacy | — |
| #388 | Resilience foundation: centralize disconnect, reconnect, grace, and interruption policies | — |
| #389 | Security foundation: formalize threat model and authority-side command validation | — |
| #391 | Network fairness: implement centralized Fairness Policy Engine and bounded buzzer arbitration | — |
| #392 | Security foundation: implement scoped session invites, join credentials, admission, and site pairing | — |
| #393 | Security foundation: harden command idempotency, replay protection, and authority fencing | — |
| #394 | Security foundation: centralized rate limiting and abuse-resilience policies | — |
| #399 | Experience foundation: implement semantic InputAction and device-adapter architecture | — |
| #403 | Host foundation: implement authoritative answer adjudication and game correction workflow | — |

### M7 (70)

| # | Title | Previous milestone |
|---|---|---|
| #22 | Daily Challenge Pack | 1.x — Daily Challenge Pack |
| #23 | Bible Map Challenge | 1.x — Bible Map Challenge |
| #52 | Clue Ladder: new game (progressive-reveal clue guessing) | 1.x — New Games: Progressive Reveal Content Batch |
| #53 | Who Am I? / Name That Story / Quick Bible Mystery: new games (shared schema) | 1.x — New Games: Progressive Reveal Content Batch |
| #54 | Movie Trailer / Investigator / Archaeologist / Casting Call: new games | 1.x — New Games: Progressive Reveal Content Batch |
| #55 | Scripture Stumpers: new game (decode license-plate-style abbreviations) | 1.x — New Games: Progressive Reveal Content Batch |
| #59 | Bible Baseball: base-running state machine | 1.x — Bible Baseball |
| #60 | Bible Baseball: pitch inventory reducer and difficulty presets | 1.x — Bible Baseball |
| #61 | Bible Baseball: role-switching participant support | 1.x — Bible Baseball |
| #62 | Bible Baseball: pitcher private-choice UI and batter answer UI | 1.x — Bible Baseball |
| #63 | Bible Baseball: host console and projector views | 1.x — Bible Baseball |
| #64 | Bible Baseball: stats fields and scoring integration | 1.x — Bible Baseball |
| #65 | Bible Blockbusters: hex board state, adjacency, and win-check | 1.x — Bible Blockbusters |
| #66 | Bible Blockbusters: content-aware board generator | 1.x — Bible Blockbusters |
| #67 | Bible Blockbusters: GameId, schema, and content | 1.x — Bible Blockbusters |
| #68 | Bible Blockbusters: host console and projector board UI | 1.x — Bible Blockbusters |
| #69 | Forbidden Words: team-turn clue-giver flow using privateOverride | 1.x — Forbidden Words |
| #70 | Forbidden Words: timer and scoring | 1.x — Forbidden Words |
| #71 | Forbidden Words: content (target word + forbidden list) | 1.x — Forbidden Words |
| #120 | Pairs of Faith: 1. relationship content model, persistence, and migration | 1.x — Pairs of Faith |
| #121 | Pairs of Faith: 2. constrained board generator and ambiguity validator | 1.x — Pairs of Faith |
| #122 | Pairs of Faith: 3. gameplay engine, scoring, turns, and Challenge integration | 1.x — Pairs of Faith |
| #123 | Pairs of Faith: 4. Agon card board, projector presentation, and adaptive UX | 1.x — Pairs of Faith |
| #124 | Pairs of Faith: 5. Admin relationship editor, ambiguity analysis, and test-board preview | 1.x — Pairs of Faith |
| #125 | Pairs of Faith: 6. Player Controller card selection and hidden-card privacy | 1.x — Pairs of Faith |
| #126 | Pairs of Faith: 7. Host Controls and Host Remote board operation | 1.x — Pairs of Faith |
| #127 | Pairs of Faith: 8. curated starter relationship content and biblical QA | 1.x — Pairs of Faith |
| #128 | Pairs of Faith: 9. end-to-end, privacy, accessibility, and responsive release validation | 1.x — Pairs of Faith |
| #138 | Agon Cards: 9. define and curate the 52 Bible-character card assignments | 1.x — Bible Playing Deck |
| #139 | Agon Cards: 10. Bible Playing Deck/private-hand validation on generic Card & Deck Engine | 1.x — Bible Playing Deck |
| #160 | Agon Computer Players: 1. participant model and per-game capability declarations | 1.x — Computer Player Framework |
| #161 | Agon Computer Players: 2. legal-action decision context, safe ComputerPlayerView, and strategy API | 1.x — Computer Player Framework |
| #162 | Agon Computer Players: 3. difficulty semantics, deterministic strategy utilities, and turn runner | 1.x — Computer Player Framework |
| #163 | Agon Computer Players: 4. setup, projector, Player Controller, and Host Remote UX | 1.x — Computer Player Framework |
| #164 | Agon Computer Players: 5. Pairs of Faith strategy adapter and single-player proof | 1.x — Computer Player Framework |
| #165 | Agon Computer Players: 6. simulated trivia answering model for computer opponents | 1.x — Computer Player Framework |
| #166 | Agon Computer Players: 7. simulation harness, privacy/no-cheating tests, and framework release gate | 1.x — Computer Player Framework |
| #172 | Game: Unveiled — reveal-board challenge, clue regions, solve buzzer, and scoring | 1.x — Unveiled |
| #174 | Multitude: 1. round engine, private submissions, normalization, duplicate cancellation, and scoring | 1.x — Multitude |
| #175 | Multitude: 2. Player Controller private entry and shared-team input | 1.x — Multitude |
| #176 | Multitude: 3. projector reveal, validation, duplicate-crossout, and scoring presentation | 1.x — Multitude |
| #177 | Multitude: 4. Host Review, Host Remote controls, and answer adjudication | 1.x — Multitude |
| #178 | Multitude: 5. Admin category authoring, aliases, references, and validation preview | 1.x — Multitude |
| #179 | Multitude: 6. privacy, recovery, responsive E2E, and release validation | 1.x — Multitude |
| #182 | Wayfinder: 2. synchronized question/answer engine for Solo and Head-to-Head | 1.x — Wayfinder |
| #183 | Wayfinder: 3. maze renderer, fog of war, projector, and Player Controller UX | 1.x — Wayfinder |
| #184 | Wayfinder: 4. required Path Review, route replay, and learning summary | 1.x — Wayfinder |
| #185 | Wayfinder: 5. Host Remote, configuration, typed adjudication, and generation diagnostics | 1.x — Wayfinder |
| #186 | Wayfinder: 6. persistence, privacy, responsive E2E, and release validation | 1.x — Wayfinder |
| #286 | Image Board: 7. Bible Map Challenge migration and release gate | 1.x — Image Board Engine |
| #379 | Lost in Translation — implement progressive garbled-message game | 1.x — Platform Migration 2: Existing Game Families |
| #381 | Secret Identity — bidding + progressive character clue game | 1.x — Platform Migration 2: Existing Game Families |
| #440 | Scripture Chain MVP: implement Next Link, Ordered Chain, and Missing Link modes | — |
| #441 | Scripture Chain: add relationship-identification challenges, hints, and scoring policies | — |
| #442 | Scripture Chain: implement 1–4 player/team private simultaneous multiplayer and Stage reveal | — |
| #443 | Scripture Chain: implement Circular Chain, Broken Chain, and Destination modes | — |
| #445 | Scripture Chain: add post-round relationship review, passage context, Dig Deeper, and game help | — |
| #454 | Running the Race P1: implement Sprint and standard Race MVP | — |
| #455 | Running the Race P1: add Featured Passage, Cloud of Witnesses, review, and game help | — |
| #456 | Running the Race P2: add Relay, Endurance, Obstacle Course, and cross-engine stations | — |
| #461 | Exodus Journey P1: implement canonical campaign map and core checkpoint activities | — |
| #462 | Exodus Journey P1: implement Gather Manna timed challenge and aid awards | — |
| #463 | Exodus Journey P1: add Journey Journal, Scripture review, Dig Deeper, and game help | — |
| #467 | Tower of Babel P2: implement constrained-communication assembly game | — |
| #468 | Armor of God P2: implement cooperative composite game | — |
| #469 | Sow & Grow P2: implement Parable of the Sower learning game | — |
| #470 | To the Churches P2: implement Revelation 2–3 relationship/classification game | — |
| #471 | Beatitudes Quest P2: implement thematic progression game | — |
| #472 | The Pilgrim's Way P2: prototype thematic Journey composition | — |
| #473 | David and Goliath P2: implement Five Stones as themed Gauntlet profile | — |

### M8 (27)

| # | Title | Previous milestone |
|---|---|---|
| #234 | Kids Mode: pre-reader UX, gentle rules, age tagging, scripture loop | Backlog — Agon Kids |
| #235 | Kids: Dig Deeper cards, Memory Verse Wall, Story Passport | Backlog — Agon Kids |
| #257 | Kids Mode: learning-objective taxonomy and catalog coverage diagnostics | Backlog — Agon Kids |
| #325 | Activity Event Series (Ages 3–5): Bible Baking | Backlog — Kids Activity Events |
| #326 | Activity Event Series (Ages 3–5): Bible Builders | Backlog — Kids Activity Events |
| #327 | Activity Events: 1. model, registry, lifecycle, persistence, and cooperative capability | Backlog — Kids Activity Events |
| #328 | Activity Events: 2. segment runner, Kids Activities home, and presentation | Backlog — Kids Activity Events |
| #329 | Activity Events: 3. Make engine for baking and building | Backlog — Kids Activity Events |
| #330 | Activity Events: 4. Admin Activity Event, Make activity, and series editors | Backlog — Kids Activity Events |
| #333 | Activity Events: 5. Leader Guide generation, print/PDF, and host access | Backlog — Kids Activity Events |
| #334 | Activity Event Series (Ages 6–10): Bible Builders | Backlog — Kids Activity Events |
| #335 | Activity Event Series (Ages 6–10): Bible Baking | Backlog — Kids Activity Events |
| #484 | Kids P2: implement Two by Two Noah's Ark memory game | — |
| #485 | Kids P2: implement Come Like a Child Luke 18 experience | — |
| #488 | Kids P2: implement As You Would Golden Rule game | — |
| #489 | Kids P2: author and review As You Would scenario/content pack | — |
| #492 | Kids P2: implement Zacchaeus Come Down story experience without duplicating Who's in the Story | — |
| #494 | Kids P2: implement Who Is My Neighbor? Good Samaritan experience | — |
| #496 | Kids P2: implement Loaves & Fishes distribution/application profile | — |
| #497 | Kids P2: consolidate Creation stations/panorama into existing Creation games | — |
| #498 | Kids P2: implement Jonah Turn Around story profile using existing ordering/map capabilities | — |
| #501 | Kids P2: Joseph — From Pit to Palace journey | — |
| #502 | Kids P2: Abraham — Follow the Promise journey | — |
| #503 | Kids P2: Daniel — Faithful Every Day journey | — |
| #504 | Kids P2: The Way Home — Prodigal Son journey | — |
| #505 | Kids P2: Emmaus — Along the Way journey | — |
| #506 | Kids P2: Saul — Turned Around journey | — |

### M9 (11)

| # | Title | Previous milestone |
|---|---|---|
| #359 | Agon Hosted: implement reference hosted runtime using common platform contracts | Future — Agon Hosted |
| #360 | Agon Shared: implement cross-site installed play using common platform contracts | Future — Agon Shared |
| #377 | Agon Shared: implement remote installed Stage adapter and Host multi-site Stage control | Future — Agon Shared |
| #378 | Agon Hosted: implement browser Stage adapter using StageOrchestration and Projection contracts | Future — Agon Hosted |
| #382 | Foundation — Session Communications API contracts and Local provider | 1.x — Platform Migration 2: Existing Game Families |
| #383 | Foundation — communications-aware presentation and semantic focus contracts | 1.x — Platform Migration 2: Existing Game Families |
| #386 | Network foundation: implement authoritative clock synchronization and uncertainty model | — |
| #390 | Network fairness: implement Network Quality Service and realtime readiness assessment | — |
| #407 | Quality foundation: generate compatibility certification matrix from conformance evidence | — |
| #411 | Communications foundation: define provider-neutral audio, video, and chat contracts | — |
| #435 | Shared P1: negotiate package, translation, capability, and entitlement readiness across sites | — |

### M10 (1)

| # | Title | Previous milestone |
|---|---|---|
| #517 | M10: Legacy retirement epic | (new) |

### UI (7)

| # | Title | Previous milestone |
|---|---|---|
| #99 | Agon UI: 1.1 brand assets and product naming | 0.5.0 — Agon 1: Foundation |
| #100 | Agon UI: 1.2 design tokens, typography, icons, and theme bridge | 0.5.0 — Agon 1: Foundation |
| #101 | Agon UI: 1.3 shared UI primitives and accessibility foundation | 0.5.0 — Agon 1: Foundation |
| #102 | Agon UI: 1.4 adaptive layout utilities and viewport test harness | 0.5.0 — Agon 1: Foundation |
| #104 | Agon UI: 2.2 Admin console shell, navigation, forms, tables, and density | 0.7.0 — Agon 2: Core Apps |
| #117 | Agon rename: installer, update, and data-folder continuity | 0.5.0 — Agon 1: Foundation |
| #298 | Emblems: 1. Agon Emblem set design and production | 1.x — Participant Emblems |

### TE (11)

| # | Title | Previous milestone |
|---|---|---|
| #21 | Tournament / Season Mode | 1.x — Tournaments, Event Championships & Persistent Events |
| #189 | Tournament/Event 1: four-team platform limit and game competition capability contract | 1.x — Tournaments, Event Championships & Persistent Events |
| #190 | Tournament/Event 2: persistent Event and Game Session foundation with versioned recovery | 1.x — Tournaments, Event Championships & Persistent Events |
| #191 | Tournament/Event 3: shared match engine, normal scoring ledger, results, and placement bonuses | 1.x — Tournaments, Event Championships & Persistent Events |
| #192 | Tournament/Event 4: Single-Elimination and Double-Elimination bracket engines | 1.x — Tournaments, Event Championships & Persistent Events |
| #193 | Tournament/Event 5: Round-Robin, Swiss, and Round-Robin + Knockout engines | 1.x — Tournaments, Event Championships & Persistent Events |
| #194 | Tournament/Event 6: Event Championship qualifiers, combined seeding, and final knockout | 1.x — Tournaments, Event Championships & Persistent Events |
| #195 | Tournament/Event 7: Admin setup for tournaments, Event Championships, scoring, and validation | 1.x — Tournaments, Event Championships & Persistent Events |
| #196 | Tournament/Event 8: Saved Events dashboard, resume flow, Host Remote, and projector competition views | 1.x — Tournaments, Event Championships & Persistent Events |
| #197 | Tournament/Event 9: integrate tournament capabilities and persistent sessions into existing games | 1.x — Tournaments, Event Championships & Persistent Events |
| #198 | Tournament/Event 10: multi-gathering persistence, idempotency, migration, privacy, and E2E release gate | 1.x — Tournaments, Event Championships & Persistent Events |

### PK (33)

| # | Title | Previous milestone |
|---|---|---|
| #24 | Themed content: Step 0 — Pack model and Core split | 1.x — Themed Content Groundwork |
| #31 | Licensing: Step 1 — Formats and tools | 1.x — Content Licensing |
| #32 | Licensing: Step 2 — Build and release guard | 1.x — Content Licensing |
| #33 | Licensing: Step 3 — Main-process licensing | 1.x — Content Licensing |
| #34 | Licensing: Step 4 — App UI | 1.x — Content Licensing |
| #35 | Licensing: Step 5 — Admin console | 1.x — Content Licensing |
| #36 | Licensing: Step 6 — Public releases-only repo | 1.x — Content Licensing |
| #37 | Licensing: Step 7 (deferred) — Payments | 1.x — Content Licensing |
| #313 | Architecture: baseline Agon installer, bundles, dependencies, assets, and content footprint | 0.6.0 — Platform Architecture Foundation |
| #317 | Asset Platform: semantic registry, deduplication, optimization, and reusable asset packs | 0.6.0 — Platform Architecture Foundation |
| #319 | Distribution: implement package manifests, dependency resolution, and locally enableable game/content/asset packs | 1.x — Game & Content Packs |
| #324 | Distribution: optional downloadable packs with offline use, integrity verification, and safe updates | 1.x — Game & Content Packs |
| #344 | Bible translations: implement policy-driven offline cache, prefetch, and Event readiness checks | 1.x — Bible Translation Providers & Packs |
| #345 | Bible translations: integrate translation capability with Gauntlet, Events, and Tournaments | 1.x — Bible Translation Providers & Packs |
| #346 | Bible translations: implement optional external TranslationProvider adapter and secure configuration | 1.x — Bible Translation Providers & Packs |
| #347 | Bible translations: package local translation data once and integrate with modular pack lifecycle | 1.x — Bible Translation Providers & Packs |
| #395 | Security foundation: enforce package/content integrity and safe package activation | — |
| #401 | Content foundation: implement provenance, revision, review, and publishing lifecycle | — |
| #405 | Asset foundation: implement media delivery variants, preload, caching, and readiness | — |
| #406 | Packaging foundation: implement resource footprint classes and optional/on-demand delivery | — |
| #409 | Operations foundation: implement safe application/package update and rollback lifecycle | — |
| #410 | Administration foundation: separate Agon Play and Agon Admin capability surfaces | — |
| #425 | Packaging P0: define .agonpack manifest schema, package types, and PackageRegistry | — |
| #426 | Packaging P0: implement transactional package store, dependency resolver, install/remove, and integrity | — |
| #427 | Entitlements P0: implement entitlement model and signed offline certificate verification | — |
| #428 | Installer P0: package Agon Core, Play, Admin, and bundled locked/unlocked packs in one installer | — |
| #429 | Bible translations P0: implement BIBLE_TRANSLATION package contract and provider integration | — |
| #430 | Packaging P0: protect saved sessions and Events with package/content version pins | — |
| #431 | Entitlements P1: implement online product-key activation, transfer/recovery, and offline activation workflow | — |
| #432 | Package Manager P1: build Admin packages, licensing, translations, update, and repair UI | — |
| #433 | Updates P1: implement independent application/package updates with staging, rollback, and Event safety | — |
| #434 | Events P1: implement Prepare Event dependency, entitlement, asset, translation, and site readiness | — |
| #436 | Packaging P1: implement repair, recovery, registry rebuild, and safe package cleanup | — |

### TC (14)

| # | Title | Previous milestone |
|---|---|---|
| #25 | Themed content: Step 1 — Categories, visibility, and round selection | 1.x — Themed Content Groundwork |
| #26 | Themed content: Step 2 — Season calendar | 1.x — Themed Content Groundwork |
| #27 | Themed content: Step 3 — Predefined events | 1.x — Themed Content Groundwork |
| #28 | Themed content: Step 4 — Featured seasonal event | 1.x — Themed Content Groundwork |
| #29 | Themed content: Step 5 — Admin console and data checks | 1.x — Themed Content Groundwork |
| #30 | Themed content: Step 6 — Ship first packs (Christmas & Easter) | 1.x — Themed Content Groundwork |
| #38 | Content pack: Christmas | 1.x.y — Themed Content Packs |
| #39 | Content pack: Easter / Resurrection Day | 1.x.y — Themed Content Packs |
| #40 | Content pack: Pentecost | 1.x.y — Themed Content Packs |
| #41 | Content pack: Thanksgiving Day | 1.x.y — Themed Content Packs |
| #42 | Content pack: Mother's Day | 1.x.y — Themed Content Packs |
| #43 | Content pack: Father's Day | 1.x.y — Themed Content Packs |
| #44 | Content pack: New Year | 1.x.y — Themed Content Packs |
| #45 | Content pack: Biblical Feasts | 1.x.y — Themed Content Packs |

### PH (17)

| # | Title | Previous milestone |
|---|---|---|
| #322 | Build optimization: add lazy loading/code splitting and remove production dependency duplication | 1.x — Platform Cleanup & Build Optimization |
| #323 | CI governance: size attribution, budgets, duplicate detection, and reuse-first architecture checks | 1.x — Platform Cleanup & Build Optimization |
| #373 | Core foundation: stable diagnostics, observability, privacy classification, and redaction | 1.x — Platform Hardening |
| #374 | Core foundation: centralized runtime capabilities and controlled feature rollout flags | 1.x — Platform Hardening |
| #375 | Core foundation: deterministic session replay and diagnostic reconstruction | 1.x — Platform Hardening |
| #376 | Learning foundation: define optional learning-history provider separate from scoring | 1.x — Learning Platform Expansion |
| #396 | Privacy foundation: define and enforce data classification, retention, deletion, and synchronization policy | — |
| #397 | Resilience foundation: dependency health, degraded modes, and fail-safe authority behavior | — |
| #404 | Experience foundation: implement application localization independent of Bible translations | — |
| #408 | Portability foundation: implement versioned AgonArchive backup, export, and import | — |
| #416 | Help Center: implement offline search across game, Player, Host, Admin, and Parent/Teacher documentation | — |
| #417 | Product documentation: author structured Player Guide and Host Handbook | — |
| #418 | Product documentation: author Administration Guide with contextual Admin help | — |
| #419 | Learning documentation: generate Parent/Teacher and Dig Deeper help from learning metadata | — |
| #420 | Documentation delivery: generate versioned PDF/print publications from canonical help content | — |
| #421 | Documentation quality: add CI/conformance validation for Help, game docs, links, assets, and renderers | — |
| #423 | Documentation UX: add optional interactive game tutorials using semantic InputActions | — |

### S1 (2)

| # | Title | Previous milestone |
|---|---|---|
| #15 | 1.0.0 stabilization checklist | 1.0.0 — Stabilization |
| #115 | Agon UI: 6.2 accessibility, responsive, visual-regression, and real-device validation | 1.x — Agon 6: Polish & Validation |

### BG (38)

| # | Title | Previous milestone |
|---|---|---|
| #200 | Candidate Game: The Lot Falls To... | Backlog — Candidate Games |
| #201 | Candidate Game: Wheel Within a Wheel | Backlog — Candidate Games |
| #202 | Candidate Game: Gather the Twelve | Backlog — Candidate Games |
| #203 | Candidate Game: Urn of Questions | Backlog — Candidate Games |
| #204 | Candidate Game: The Narrow Gate | Backlog — Candidate Games |
| #205 | Candidate Game: Providence? | Backlog — Candidate Games |
| #206 | Candidate Game: Witnesses | Backlog — Candidate Games |
| #207 | Candidate Game: The Scribe | Backlog — Candidate Games |
| #208 | Candidate Game: Twelve Tribes | Backlog — Candidate Games |
| #209 | Candidate Game: Epistle | Backlog — Candidate Games |
| #210 | Candidate Game: Cloud of Witnesses | Backlog — Candidate Games |
| #211 | Candidate Game: One Body | Backlog — Candidate Games |
| #212 | Candidate Game: Before & After (working title — rename required) | Backlog — Candidate Games |
| #213 | Candidate Game: Three Witnesses | Backlog — Candidate Games |
| #214 | Candidate Game: Facets | Backlog — Candidate Games |
| #215 | Candidate Game: Crossroads | Backlog — Candidate Games |
| #216 | Candidate Game: Against the Odds | Backlog — Candidate Games |
| #217 | Candidate Game: While the Sand Falls | Backlog — Candidate Games |
| #218 | Candidate Game: A Time for Everything | Backlog — Candidate Games |
| #219 | Candidate Game: Redeem the Time | Backlog — Candidate Games |
| #220 | Candidate Game: The Midnight Hour | Backlog — Candidate Games |
| #221 | Candidate Game: Selah | Backlog — Candidate Games |
| #222 | Candidate Game: One Is Missing | Backlog — Candidate Games |
| #223 | Candidate Game: The Messenger | Backlog — Candidate Games |
| #224 | Candidate Game: Build the Temple | Backlog — Candidate Games |
| #225 | Candidate Game: Walls of Jerusalem — strategic connected-block control | Backlog — Candidate Games |
| #226 | Candidate Game: Paths of Paul | Backlog — Candidate Games |
| #227 | Candidate Game: The Road to Damascus | Backlog — Candidate Games |
| #228 | Candidate Game: Council of Jerusalem | Backlog — Candidate Games |
| #229 | Candidate Game: Exodus | Backlog — Candidate Games |
| #230 | Candidate Game: The Scribe's Table | Backlog — Candidate Games |
| #231 | Candidate Game: Open the Scroll | Backlog — Candidate Games |
| #232 | Candidate Game: Forty | Backlog — Candidate Games |
| #233 | Candidate Game: Convergence | Backlog — Candidate Games |
| #289 | Candidate Game: Agon Joust — simultaneous Bible challenge tournament | Backlog — Candidate Games |
| #291 | Candidate Game: Agon Gauntlet — synchronized multi-engine Scripture challenge race | Backlog — Candidate Games |
| #310 | Add GauntletStageAdapter support to eligible existing games | Backlog — Candidate Games |
| #474 | Exodus Journey P2: evaluate visual traversal/adventure checkpoint templates | — |

### BK (42)

| # | Title | Previous milestone |
|---|---|---|
| #236 | Candidate Game (Ages 3–5): Let There Be… | Backlog — Agon Kids |
| #237 | Candidate Game (Ages 3–5): March Around Jericho | Backlog — Agon Kids |
| #238 | Candidate Game (Ages 3–5): Here I Am, Samuel! | Backlog — Agon Kids |
| #239 | Candidate Game (Ages 3–5): Lost & Found | Backlog — Agon Kids |
| #240 | Candidate Game (Ages 3–5): Share the Lunch | Backlog — Agon Kids |
| #241 | Candidate Game (Ages 3–5): Picture Verse | Backlog — Agon Kids |
| #242 | Candidate Game (Ages 3–5): What Happened Next? | Backlog — Agon Kids |
| #243 | Candidate Game (Ages 3–5): Two by Two | Backlog — Agon Kids |
| #244 | Candidate Game (Ages 3–5): Joseph's Coat | Backlog — Agon Kids |
| #245 | Agon Kids — Ages 3–5 Candidate Games (tracking) | Backlog — Agon Kids |
| #246 | Candidate Game (Ages 6–10): Open Your Bible! | Backlog — Agon Kids |
| #247 | Candidate Game (Ages 6–10): Fix the Story | Backlog — Agon Kids |
| #248 | Candidate Game (Ages 6–10): Manna Mornings | Backlog — Agon Kids |
| #249 | Candidate Game (Ages 6–10): Tabernacle Blueprint | Backlog — Agon Kids |
| #250 | Candidate Game (Ages 6–10): Sower's Field | Backlog — Agon Kids |
| #251 | Candidate Game (Ages 6–10): Armor Up | Backlog — Agon Kids |
| #252 | Candidate Game (Ages 6–10): Psalm 150 Band | Backlog — Agon Kids |
| #253 | Candidate Game (Ages 6–10): Gideon's 300 | Backlog — Agon Kids |
| #254 | Candidate Game (Ages 6–10): Who's in the Story? | Backlog — Agon Kids |
| #255 | Agon Kids — Ages 6–10 Candidate Games (tracking) | Backlog — Agon Kids |
| #258 | Candidate Kids Game (Ages 3–5): Jesus Said… | Backlog — Agon Kids |
| #259 | Candidate Kids Game (Ages 3–5): Build on the Rock | Backlog — Agon Kids |
| #260 | Candidate Kids Game (Ages 3–5): Follow the Star | Backlog — Agon Kids |
| #261 | Candidate Kids Game (Ages 3–5): Who Did God Make? | Backlog — Agon Kids |
| #262 | Candidate Kids Game (Ages 3–5): Little Shepherd | Backlog — Agon Kids |
| #263 | Candidate Kids Game (Ages 3–5): Fill the Basket | Backlog — Agon Kids |
| #264 | Candidate Kids Game (Ages 3–5): Who Said It? — Little Listeners | Backlog — Agon Kids |
| #265 | Candidate Kids Game (Ages 3–5): Bible Sounds | Backlog — Agon Kids |
| #266 | Candidate Kids Game (Ages 6–10): Bible Detective | Backlog — Agon Kids |
| #267 | Candidate Kids Game (Ages 6–10): Prove It! | Backlog — Agon Kids |
| #268 | Candidate Kids Game (Ages 6–10): Who Said That? — Context Challenge | Backlog — Agon Kids |
| #269 | Candidate Kids Game (Ages 6–10): Bible Map Quest | Backlog — Agon Kids |
| #270 | Candidate Kids Game (Ages 6–10): What Does the Text Say? | Backlog — Agon Kids |
| #271 | Candidate Kids Game (Ages 6–10): Context Clues | Backlog — Agon Kids |
| #272 | Candidate Kids Game (Ages 6–10): Find the Connection | Backlog — Agon Kids |
| #273 | Candidate Kids Game (Ages 6–10): Book Builder | Backlog — Agon Kids |
| #274 | Candidate Kids Game (Ages 6–10): Ask the Passage | Backlog — Agon Kids |
| #275 | Candidate Kids Game (Ages 6–10): Missing from the Story | Backlog — Agon Kids |
| #276 | Candidate Kids Game (Ages 6–10): Then What? | Backlog — Agon Kids |
| #277 | Candidate Kids Game (Ages 6–10): Scripture Treasure Hunt | Backlog — Agon Kids |
| #278 | Agon Kids — Batch 2 Ages 3–5 Candidate Games (tracking) | Backlog — Agon Kids |
| #279 | Agon Kids — Batch 2 Ages 6–10 Candidate Games (tracking) | Backlog — Agon Kids |

### BT (2)

| # | Title | Previous milestone |
|---|---|---|
| #5 | Testing: Step 5 — Admin console and cross-app tests (Layer 2) | Backlog — Remaining Testing & CI |
| #6 | Testing: Step 6 — Visual regression baselines (Layer 3) | Backlog — Remaining Testing & CI |
