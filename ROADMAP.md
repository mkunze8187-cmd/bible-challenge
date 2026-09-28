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
M0 Foundation (#509) ─────────────────────────► Track: Brand & Design System (parallel)
   │  domain #362 → GameDefinition #314 → EngineRegistry #447
   │  intents/events #350/#448 → projection #351 → persistence #353
   │  RNG #142, timer #156, ledger #364, BibleTextService #338/#339
   │  LegacyGameAdapter #513, Offline adapter #514, boundary CI #515 (+#7)
   ▼
M1 Reference: Five Clues (#510; #402, #4, surface host #516)
   │                     ╲
   ▼                      ▼
M2 #507 → #511        M5 renderer decomposition   M6 controller/LAN contracts
   │                      (grow alongside M4)          │
   ▼                                                    ▼
M3 capabilities ──► M4 migration waves (#331) ──► M9 Shared/Hosted (after M6)
   │                     │
   ├──► M7 General new games (capability + #507 disposition)
   ├──► M8 Agon Kids (capability + Kids foundation #234/#235)
   ▼
M10 Legacy retirement (#517; after M4 + M5 + M6)
```

| Milestone | Purpose | Exit |
|---|---|---|
| **M0 — vNext Architecture Foundation** | #509: contracts, AgonRuntime, registries, Engine SDK, Offline adapter, LegacyGameAdapter/launch resolver, deterministic harness, CI enforcement | A minimal GameDefinition runs in a test host with no Electron/renderer/network dependency; all legacy games still launch; CI enforces boundaries |
| **M1 — vNext Reference Migration** | #510: **Five Clues** end-to-end (fallback: Name That Book) | Five Clues is authoritative on vNext; migration checklist/template checked in |
| **M2 — Catalog & Migration Classification** | #507 audience/catalog audit + #511 migration waves | Checked-in migration matrix + dependency graph; wave and capability issues created |
| **M3 — Core Capability Extraction** | Reusable engines/capabilities with named consumers | Capabilities for the first bulk waves have stable contracts/tests |
| **M4 — Existing Game Migration Waves** | #331 epic; waves by capability family | Every retained implemented game is on vNext or dispositioned |
| **M5 — Renderer / Experience Decomposition** | Shell, setup, Host, Stage, game surface, results, help | Migrated games need no game-specific `App.tsx` branches |
| **M6 — Controller & Shared/LAN Contract Migration** | Phone Mode, Player Controller, Host Remote behind Controller intents | Phone controllers work through vNext; another transport could implement the contract |
| **M7 — New General Agon Catalog on vNext** | New AGON_GENERAL games | per game |
| **M8 — Agon Kids on vNext** | AGON_KIDS family | per game |
| **M9 — Shared/Hosted Platform Implementations** | Adapters/services, not game forks | Shared/Hosted run existing GameDefinitions unchanged |
| **M10 — Legacy Retirement** | #517 | `gameEngine.ts` and the legacy launch path are removed; full regression green |

Value tracks: **Agon Brand & Design System** (parallel now), **Tournaments & Persistent Events**, **Packaging, Distribution & Entitlements**, **Themed Content & Seasonal Packs**, **Platform Hardening & Operations**. Backlogs: **General Candidates**, **Agon Kids Candidates**, **Remaining Testing**. Per-game and per-feature grouping uses `track: *` labels.

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

1. #7 CI + #515 boundary guard.
2. #509 foundation: #362 → #314 (+#358, #320) → #447–#450 → #350/#448 → #351 → #142/#156 → #364 → #353 → #338/#339 → #514 → #513 → #356.
3. #507 catalog audit (parallel).
4. #4 Five Clues oracle tests, #402 answer evaluation, #516 surface host → **#510 Five Clues**.
5. #511 → wave and capability issues → first wave (progressive-clue family, #307).
6. M5/M6 as migrated surfaces require them; then approved M7/M8 games.

In parallel now: Brand & Design System (#117, #99–#102, #104), content authoring, legacy defect fixes.

## Do not implement yet

| Work | Blocked until |
|---|---|
| M7/M8 games | M0 + their M3 capability + a #507 disposition |
| Timeline sub-modes #56/#57, Director's Cut #58, Word Ladder rungs #87, randomizer variants #311 | the owning game's M4 wave |
| Legacy UI redesign #103, #105–#110 | #510 + #516 |
| Phone Mode / Player Controller #11–#20, #50–#51, #111–#113 | Controller intents (M0), proven in #510 |
| Tournaments #189–#198, Gauntlet adapters #310 | M0 persistence/ledger; #197 needs M4 |
| Shared/Hosted/communications | M6 exit |
| Packaging/Licensing implementation | duplicate reconciliation + M0 content contract |

## Release versions

Versions are assigned in the order releases actually ship. Pre-1.0 feature work ships as minor releases; content, polish and test work can ship as patch releases. Both apps (Challenge and Admin Console) share one version number. Before each minor release, bump both app versions together, run `npm run test:all`, and write release notes for host-facing setup or behavior changes.
