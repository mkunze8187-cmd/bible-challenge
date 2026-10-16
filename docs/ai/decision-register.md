# Agon — Design Decision Register

Record significant **cross-game** decisions here; detailed mechanics belong in game/engine specs and ADRs. Do not copy the entire backlog.

| Decision | Status | Scope | Source / rationale |
| --- | --- | --- | --- |
| No AI in any Agon app, Admin, controller, content tooling or service; deterministic authored gameplay and reproducible seeded variation | **Approved / locked** | All platforms, games, packs, tooling | [Design principles](design-principles.md) |
| GitHub is the source of truth; approved design changes must be committed, not chat-only | **Approved** | Collaboration | [Workflow](design-workflow.md) |
| Reuse generic mechanics across games; compose game-specific content/configuration | **Approved** | vNext engines and checkpoints | [ADR-001](../architecture/adr-001-agon-vnext-staged-replacement.md), [Design principles](design-principles.md) |
| Browser controller remains fully capable; native controllers optional | **Approved** | Controllers | [#625](https://github.com/mkunze8187-cmd/bible-challenge/issues/625) |
| Native Android and iOS controller implementation | **Deferred / not committed** | Controllers | [#626](https://github.com/mkunze8187-cmd/bible-challenge/issues/626), [#627](https://github.com/mkunze8187-cmd/bible-challenge/issues/627) |

| Translation-specific multi-game Game Data Packs, Agon-owned versioned schemas, explicit KJV fallback and schema-gated playability | **Approved** | Packages, games, Host, translations | [Data pack contracts](../architecture/game-data-pack-contracts.md), [#425](https://github.com/mkunze8187-cmd/bible-challenge/issues/425), [#580](https://github.com/mkunze8187-cmd/bible-challenge/issues/580), [#584](https://github.com/mkunze8187-cmd/bible-challenge/issues/584) |
| Optional non-destructive migration of organization-authored data through the Data Authoring Tool; older compatible packs remain usable | **Approved** | Authoring and package lifecycle | [Data pack contracts](../architecture/game-data-pack-contracts.md) |

When adding a row, link the approved issue, ADR or spec; do not mark proposals as approved.

| Tabernacle cooperative production/installation, hidden inventory and challenge-gated transfers, seeded bounded variable game-resource recipes (not biblical specifications), educational section inspections and clickable final review | **Approved design** | Exodus and candidate reusable worksite capability | [Tabernacle spec](../../specs/games/exodus-tabernacle.md), [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461) |

| Authored deterministic branching narrative with player agency, role-aware substitution, bounded loops and synchronized visual/structured authoring | **Approved functional design** | Cross-game narrative capability | [Engine spec](../../specs/engines/branching-narrative-engine.md), [#645](https://github.com/mkunze8187-cmd/bible-challenge/issues/645) |
| Relative effort units and weighted live session calibration; duration/clock deadlines affect dynamic selection only near the end | **Approved design** | Agon-wide estimation/scheduling | [Estimation spec](../architecture/agon-effort-duration-estimation.md), [#646](https://github.com/mkunze8187-cmd/bible-challenge/issues/646) |
| One authoritative game implementation available in standalone and Journey checkpoint contexts; context-specific intro/outro and return | **Approved principle; API pending** | Games/Journeys/packs | [Launch composition](../architecture/game-launch-composition.md), [#647](https://github.com/mkunze8187-cmd/bible-challenge/issues/647), [#460](https://github.com/mkunze8187-cmd/bible-challenge/issues/460) |
| Be Ye Holy Leviticus wilderness cooperative checkpoint, scenario director and branch-aware Scripture review | **Approved design; content audit pending** | Exodus/wilderness Journey and standalone | [Checkpoint spec](../../specs/games/exodus-be-ye-holy.md), [#644](https://github.com/mkunze8187-cmd/bible-challenge/issues/644) |
