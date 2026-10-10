# Agon — Design Decision Register

Record significant **cross-game** decisions here; detailed mechanics belong in game/engine specs and ADRs. Do not copy the entire backlog.

| Decision | Status | Scope | Source / rationale |
| --- | --- | --- | --- |
| No AI in any Agon app, Admin, controller, content tooling or service; deterministic authored gameplay and reproducible seeded variation | **Approved / locked** | All platforms, games, packs, tooling | [Design principles](design-principles.md) |
| GitHub is the source of truth; approved design changes must be committed, not chat-only | **Approved** | Collaboration | [Workflow](design-workflow.md) |
| Reuse generic mechanics across games; compose game-specific content/configuration | **Approved** | vNext engines and checkpoints | [ADR-001](../architecture/adr-001-agon-vnext-staged-replacement.md), [Design principles](design-principles.md) |
| Browser controller remains fully capable; native controllers optional | **Approved** | Controllers | [#625](https://github.com/mkunze8187-cmd/bible-challenge/issues/625) |
| Native Android and iOS controller implementation | **Deferred / not committed** | Controllers | [#626](https://github.com/mkunze8187-cmd/bible-challenge/issues/626), [#627](https://github.com/mkunze8187-cmd/bible-challenge/issues/627) |

When adding a row, link the approved issue, ADR or spec; do not mark proposals as approved.

| Translation-specific multi-game Game Data Packs, Agon-owned versioned schemas, explicit KJV fallback and schema-gated playability | **Approved** | Packages, games, Host, translations | [Data pack contracts](../architecture/game-data-pack-contracts.md), [#425](https://github.com/mkunze8187-cmd/bible-challenge/issues/425), [#580](https://github.com/mkunze8187-cmd/bible-challenge/issues/580), [#584](https://github.com/mkunze8187-cmd/bible-challenge/issues/584) |
| Optional non-destructive migration of organization-authored data through the Data Authoring Tool; older compatible packs remain usable | **Approved** | Authoring and package lifecycle | [Data pack contracts](../architecture/game-data-pack-contracts.md) |
