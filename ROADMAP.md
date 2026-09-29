# Agon: The Bible Challenge — Roadmap

This roadmap summarizes the GitHub milestones and how they depend on each other. **Native GitHub `blockedBy` links and sub-issues are the source of truth for dependencies**; "Depends on" lines in issue bodies are for reading only.

**Governing architecture:** [ADR-001](docs/architecture/adr-001-agon-vnext-staged-replacement.md) and the [vNext migration spec](specs/agon-vnext-migration-spec.md). Agon vNext replaces the legacy `gameEngine.ts` / `App.tsx` architecture in stages, inside this repository. The full refactor rationale, audit and issue mapping are in [docs/architecture/agon-vnext-roadmap-refactor-proposal.md](docs/architecture/agon-vnext-roadmap-refactor-proposal.md). Descriptions of retired milestones are preserved in [docs/architecture/retired-milestones.md](docs/architecture/retired-milestones.md).

## Rules

- **Legacy freeze.** Planned engines and major new games target vNext contracts. Legacy changes are limited to defect fixes, content maintenance, security/accessibility fixes, compatibility adapters and migration support (label `legacy-only`, with a justification in the issue).
- **Local first.** Offline/Local is implemented first; Shared/Hosted never block Local.
- **Audience boundary.** AGON_GENERAL and AGON_KIDS are separate player-facing families (#507, `docs/development/game-catalog-consolidation-policy.md`). They share infrastructure, not GameDefinitions.
- **No duplicate closure without migration.** Close a duplicate only after its unique requirements are copied into the destination and cross-linked.
- **Specs are design references.** Merged specs describe the design. Sequencing lives here and in issue dependencies.

## Current baseline

- Shipped: `0.3.0` Host Remote. The legacy runtime runs all 32 implemented GameIds.
- Next: M0 vNext foundation (#509), then the Five Clues reference migration (#510).

## Gates

```text
PR #512 (ADR-001)
   │
   ▼
M0 Foundation (#509) ─────────────────────────► Track: Brand & Design System (parallel; closes at 1.0.0)
   │  domain #362/#363 → GameDefinition #314 → EngineRegistry #447
   │  intents/events #350/#448 → projection #351 → persistence #353
   │  RNG #142, timer #156, ledger #364 (coordinated with #524), BibleTextService #338/#339
   │  LegacyGameAdapter #513, Offline adapter #514, boundary CI #515 (+#7)
   │  M0 exit gate: #522 gameplay lifecycle/resolution policies, #523 gameplay shell/viewport
   │               contract, #524 cross-game scoring normalization — all must be defined and
   │               tested before #510 can begin (M0 is not complete until they are)
   ├──► Track: Platform Hardening & Operations (after M0)
   ▼
M1 Reference: Five Clues (#510; #402, #4, surface host #516, #522, #523, #524)
   │                     ╲
   ▼                      ▼
M2 #507 → #511        M5 renderer decomposition   M6 controller/LAN contracts
   │                      (grow alongside M4)          │
   ▼                                                    ▼
M3 capabilities ──► M4 migration waves (#331) ──► M9 Shared/Hosted (after M6)
   │                     │  ├──► Track: Tournaments & Persistent Events (after M0; #197/#310 need M4)
   │                     │  ├──► Track: Packaging, Distribution & Entitlements (after M0 content contract + dup. reconciliation)
   │                     │  └──► Track: Themed Content & Seasonal Packs (after Packaging unblocks)
   ├──► M7 General new games (capability + #507 disposition) ──► Backlog: General Candidates (per-issue disposition)
   ├──► M8 Agon Kids (capability + Kids foundation #234/#235) ──► Backlog: Agon Kids Candidates (per-issue disposition)
   ▼
M10 Legacy retirement (#517; after M4 + M5 + M6)
   │
   ▼
1.0.0 Stabilization (#15, #115) ◄── Track: Brand & Design System closes here
```

| Milestone | Purpose | Exit |
|---|---|---|
| **M0 — vNext Architecture Foundation** | #509: contracts, AgonRuntime, registries, Engine SDK, Offline adapter, LegacyGameAdapter/launch resolver, deterministic harness, CI enforcement, plus the three cross-cutting M0 contracts #522 (gameplay lifecycle/resolution policies), #523 (gameplay shell/viewport containment), #524 (cross-game scoring normalization/Event contribution, coordinated with #364) | A minimal GameDefinition runs in a test host with no Electron/renderer/network dependency; all legacy games still launch; CI enforces boundaries; **and** #522/#523/#524 are sufficiently defined and tested for #510 to begin — M0 is not complete without them |
| **M1 — vNext Reference Migration** | #510: **Five Clues** end-to-end (fallback: Name That Book), proving #522/#523/#524 | Five Clues is authoritative on vNext; migration checklist/template checked in; Five Clues records its native scoring and #524 Event-contribution profile without itself inventing the cross-game scale |
| **M2 — Catalog & Migration Classification** | #507 audience/catalog audit + #511 migration waves | Checked-in migration matrix + dependency graph; wave and capability issues created |
| **M3 — Core Capability Extraction** | Reusable engines/capabilities with named consumers | Capabilities for the first bulk waves have stable contracts/tests |
| **M4 — Existing Game Migration Waves** | #331 epic; waves by capability family | Every retained implemented game is on vNext or dispositioned |
| **M5 — Renderer / Experience Decomposition** | Shell, setup, Host, Stage, game surface, results, help | Migrated games need no game-specific `App.tsx` branches |
| **M6 — Controller & Shared/LAN Contract Migration** | Phone Mode, Player Controller, Host Remote behind Controller intents | Phone controllers work through vNext; another transport could implement the contract |
| **M7 — New General Agon Catalog on vNext** | New AGON_GENERAL games | per game |
| **M8 — Agon Kids on vNext** | AGON_KIDS family | per game |
| **M9 — Shared/Hosted Platform Implementations** | Adapters/services, not game forks | Shared/Hosted run existing GameDefinitions unchanged |
| **M10 — Legacy Retirement** | #517 | `gameEngine.ts` and the legacy launch path are removed; full regression green |

Value tracks: **Agon Brand & Design System** (parallel from M0, closes at 1.0.0), **Platform Hardening & Operations** (starts after M0), **Tournaments & Persistent Events** (starts after M0), **Packaging, Distribution & Entitlements** (after M0 content contract + duplicate reconciliation), **Themed Content & Seasonal Packs** (after Packaging unblocks). Backlogs: **General Candidates**, **Agon Kids Candidates** (both enter M7/M8 only via a #507 disposition, per issue), **Remaining Testing**. Per-game and per-feature grouping uses `track: *` labels.

## Full execution order (all 444 open issues)

This is the single ordered sequence every Track and Backlog above resolves into — nothing here is unsequenced. Where the roadmap states an explicit issue-level chain, issues are listed in that order; where it only states a milestone-level or track-level trigger, the block is kept as one named, countable group rather than inventing a false internal order. All counts below match GitHub's current open-issue milestone assignments.

1. **PR #512 (ADR-001)** — governing decision record, already adopted; precedes everything below.
2. **#7 CI pipeline + #515 architecture-boundary/legacy-freeze guard** — first concrete step (also M0 members).
3. **M0 — vNext Architecture Foundation (32 issues, including #7/#515 already placed in step 2):**
   stated chain — #362/#363 → #314 (+#358, #320) → #447 → #448 → #449 → #450 → #350 → #351 → #142 + #156 → #364 → #353 → #338 + #339 → #514 → #513 → #356;
   remaining M0 issues (no stated order among themselves, complete before M0's core-contracts exit): #337, #349, #355, #366, #367, #509, #519;
   **M0 exit gate — #522, #523, #524 (P0, added after the roadmap refactor):** these three contracts are foundation work, not later migration-visible work, even though Five Clues is their first proof. Each covers a distinct concern and must not be merged:
   - **#522** — common gameplay lifecycle and resolution policies (timeout, attempts, answer resolution, buzzers, steals/rebounds, scoring transitions, round advancement);
   - **#523** — standard gameplay shell, viewport containment, and reachable controls (fixes the existing defect where content can extend below the viewport and hide controls; defect correction, not redesign);
   - **#524** — cross-game scoring normalization and Event contribution profiles (native score vs. GameResult/performance vs. normalized Event contribution vs. tournament/Event bonuses vs. seeding, coordinated with #364's ledger implementation; the implemented-game calibration audit that sets STANDARD/MAJOR/FEATURE ranges happens here, before bulk migration).
   All three must be sufficiently defined and tested before #510 begins; M0 is not considered complete until they are. #510 already lists all three as prerequisites in its issue body.
4. **Track — Agon Brand & Design System (7 issues, parallel with M0, closes at 1.0.0):** #99, #100, #101, #102, #104, #117, #298.
5. **#507 catalog audit** — starts parallel to M1 setup (formally an M2 issue, started early per stated near-term order).
6. **M1 — vNext Reference Migration (5 issues):** #4 → #402 → #516 → (#522/#523/#524 gate satisfied) → **#510 (Five Clues, M1 exit — proves #522/#523/#524, does not itself define the cross-game scoring scale)**; plus #422 (no stated position).
7. **M2 — Catalog & Migration Classification, remainder (3 issues):** #511, #304, #385 (#507 already placed in step 5).
8. **M3 — Core Capability Extraction (65 issues, single block, unlocked by M2 exit):** #130–#137, #141, #143–#150, #152–#155, #157–#159, #167–#169, #181, #280–#285, #292, #315, #318, #340–#343, #368, #380, #438, #439, #444, #451–#453, #458–#460, #466, #476–#481, #483, #487, #491, #493, #495, #500.
9. **M4 — Existing Game Migration Waves (12 issues, unlocked by M3 capabilities):**
   first named wave — #307 (progressive-clue engine: Five Clues, Name That Book, Prophecy Clue Ladder);
   remaining waves (no further stated order) — #305, #306, #308, #309, #321, #331;
   wave-gated enhancements (blocked until their owning game's wave lands) — #56, #57, #58, #87, #311.
10. **M5 — Renderer / Experience Decomposition (20 issues, grows alongside M4 once M1's surface host exists):** #103, #105–#108, #114, #293, #294, #296, #299–#301, #316, #369, #370, #372, #400, #413–#415.
11. **M6 — Controller & Shared/LAN Contract Migration (31 issues, grows alongside M4, unlocked by M0 + M1):** #11–#14, #16–#20, #50, #51, #109–#113, #295, #352, #354, #357, #365, #371, #387–#389, #391–#394, #399, #403.
12. **Track — Platform Hardening & Operations (17 issues, starts after M0):** #322, #323, #373–#376, #396, #397, #404, #408, #416–#421, #423.
13. **Track — Tournaments & Persistent Events (11 issues, unlocked by M0 persistence/ledger):** #21, #189–#196, #198 (startable now); #197 and #310 additionally require M4-migrated games.
14. **Track — Packaging, Distribution & Entitlements (33 issues, blocked until duplicate reconciliation + M0 content contract):** #24, #31–#37, #313, #317, #319, #324, #344–#347, #395, #401, #405, #406, #409, #410, #425–#434, #436.
15. **Track — Themed Content & Seasonal Packs (14 issues, follows once Packaging unblocks — its Step 0, #24, lives in Packaging):** #25–#30, #38–#45.
16. **M7 — New General Agon Catalog on vNext (70 issues, unlocked per game by M0 + M3 capability + #507 disposition):** #22, #23, #52–#55, #59–#71, #120–#128, #138, #139, #160–#166, #172, #174–#179, #182–#186, #286, #379, #381, #440–#443, #445, #454–#456, #461–#463, #467–#473.
17. **Backlog — General Candidates (38 issues, enters M7 only via #507 disposition, per issue):** #200–#233, #289, #291, #310, #474. (#310 also gates additionally on M4 per step 13's Tournaments note.)
18. **M8 — Agon Kids on vNext (27 issues, unlocked per game by M0 + M3 capability + #507 disposition + Kids foundation):** foundation — #234, #235; remaining — #257, #325–#330, #333–#335, #484, #485, #488, #489, #492, #494, #496–#498, #501–#506.
19. **Backlog — Agon Kids Candidates (42 issues, enters M8 only via #507 disposition + Kids foundation):** #236–#255, #258–#279.
20. **M9 — Shared/Hosted Platform Implementations (11 issues, unlocked at M6 exit):** #359, #360, #377, #378, #382, #383, #386, #390, #407, #411, #435.
21. **M10 — Legacy Retirement (1 issue, after M4 + M5 + M6):** #517.
22. **Backlog — Remaining Testing (2 issues, no stated trigger; inferred from surfaces they test):** #5 (after Admin console shell, #104), #6 (after M5 stable UI).
23. **1.0.0 — Stabilization (2 issues, composite release gate; Brand & Design System closes here):** #15, #115.

Full per-issue rationale and the ambiguity notes behind steps 12 (Platform Hardening trigger), 14 (Packaging's unnamed "duplicate reconciliation" set), 15 (Themed Content's inferred trigger), 22 (Remaining Testing's inferred triggers), and 23 (1.0.0's composite-vs-sequential gate) are in [docs/architecture/roadmap-ordered-sequence-draft.md](docs/architecture/roadmap-ordered-sequence-draft.md).

## 1.0.0 definition

1.0 is the first release-quality, architecturally complete **Local vNext** product:

- M0 complete; M1 reference architecture proven;
- design system at release quality;
- local phone controllers operating through vNext contracts;
- save/resume working;
- CI, regression and package validation green;
- a representative set of migrated games covering the important interaction families (clue/reveal, question/choice, ordering, matching).

The **percentage of implemented games on vNext is tracked as a roadmap metric**, not a release criterion. Shared/Hosted, complete legacy retirement and the new-game catalog are **not** 1.0 requirements. Tracking issue: #15.

## Migration metric

| Date | Implemented GameIds | Authoritative on vNext | % |
|---|---|---|---|
| 2026-09-28 | 32 | 0 | 0% |

## Near-term execution order

See "Full execution order" above for the complete, single sequence (all 444 open issues, nothing untracked). Immediate next steps:

1. #7 CI + #515 boundary guard.
2. #509 foundation: #362/#363 → #314 (+#358, #320) → #447–#450 → #350/#448 → #351 → #142/#156 → #364 → #353 → #338/#339 → #514 → #513 → #356.
3. #507 catalog audit (parallel).
4. #522 gameplay lifecycle/resolution policies, #523 gameplay shell/viewport contract, #524 cross-game scoring normalization (coordinated with #364) — required M0 exit gate, all three before #510 begins.
5. #4 Five Clues oracle tests, #402 answer evaluation, #516 surface host → **#510 Five Clues** (proves #522/#523/#524; does not itself set the cross-game scoring scale).
6. #511 → wave and capability issues → first wave (progressive-clue family, #307).
7. M5/M6 as migrated surfaces require them; then approved M7/M8 games.

In parallel now: Brand & Design System (#117, #99–#102, #104, closes at 1.0.0), Platform Hardening & Operations (#322 etc., starts once M0 lands), content authoring, legacy defect fixes.

## Do not implement yet

| Work | Blocked until |
|---|---|
| M7/M8 games | M0 + their M3 capability + a #507 disposition |
| Timeline sub-modes #56/#57, Director's Cut #58, Word Ladder rungs #87, randomizer variants #311 | the owning game's M4 wave |
| Legacy UI redesign #103, #105–#110 | #510 + #516 |
| Phone Mode / Player Controller #11–#20, #50–#51, #111–#113 | Controller intents (M0), proven in #510 |
| Tournaments #189–#198, Gauntlet adapters #310 | M0 persistence/ledger; #191/#194 additionally need #524/#364 Event-contribution contract; #197 needs M4 |
| Shared/Hosted/communications | M6 exit |
| Packaging/Licensing implementation | duplicate reconciliation + M0 content contract |
| Themed Content & Seasonal Packs #25–#30, #38–#45 | Packaging track unblocks (shares Step 0, #24) |
| Platform Hardening & Operations #322 etc. | M0 lands |

## Release versions

Versions are assigned in the order releases actually ship. Pre-1.0 feature work ships as minor releases; content, polish and test work can ship as patch releases. Both apps (Challenge and Admin Console) share one version number. Before each minor release, bump both app versions together, run `npm run test:all`, and write release notes for host-facing setup or behavior changes.
