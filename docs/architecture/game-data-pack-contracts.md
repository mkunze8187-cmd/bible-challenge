# Game Data Packs, schema compatibility, and authoring migrations

Status: **Approved design decisions** (2026-10-10). This refines existing package/content/translation architecture; implementation remains tracked by linked issues.

## Package separation and ownership
- Use the common versioned `.agonpack` manifest, registry, entitlement, installation and dependency resolver for Game Packs, Game Data Packs and Bible Translation Packs. The existing technical `CONTENT` package type may represent `GAME_DATA` as an explicit subtype; exact manifest encoding is implementation work, not permission to create a second package manager.
- **Game Packs** define games and their versioned capability/configuration and data-contract requirements. Trusted Agon releases supply executable behavior. Common non-customizable game data may ship with the game; authored configurable content uses the same data contracts as organization packs.
- **Game Data Packs** carry translation-specific, authored game data, optionally organization-customized. One pack may support **multiple games** or only one. They do not define new executable game mechanics or schemas.
- **Bible Translation Packs** carry Scripture text, translation identity/version and associated licensing. Translation packs are distinct from game data.
- Agon owns and versions **all game-data schemas and contracts**. Custom pack manifests identify the Agon-defined schema ID/version used, supported game IDs and compatible versions, translation ID and compatible translation version, content domains, publisher/organization, dependencies, entitlement, integrity, provenance and stable content IDs. Pack claims of game support are validated against the game's declared data contracts, not trusted blindly.

## Host selection, readiness and fallback
- The Host may select one or more eligible Game Data Packs when starting a **game, event, tournament or Journey**. Preserve explicit scope inheritance/overrides and deterministic Active Pack Set composition from #584.
- Resolve content by game and required domain/contract, not by assuming that a selected pack supports every game or every content record. Retain selected pack/source identity and version in the resolved set.
- **Approved fallback A:** When selected data lacks supported content for a game, Agon may use its bundled **KJV-based fallback data**, and must clearly identify fallback content as **KJV**. Do not silently mislabel KJV text as the Host-selected translation, or substitute incompatible Scripture text.
- Fallback is valid **only if** the bundled KJV data meets the game's required schema, content and capability contracts. If no compatible selected or bundled data satisfies a game's required contracts, the game is **NOT PLAYABLE**, with actionable missing-dependency/readiness diagnostics. Never silently downgrade the game contract.
- Game, event, tournament and Journey preparation validates dependencies, translation identity, data-contract compatibility, content availability, enablement and entitlement. Pin resolved package IDs/versions, schema versions, content provenance, fallback decisions and deterministic replay inputs for sessions/saves.

## Schema evolution and compatibility
- A game declares the Agon data schema/contract IDs and **supported versions or version ranges**, including minimum versions when enhanced data is required. A game may require a newer schema; older incompatible data is insufficient even when the pack is otherwise installed.
- A schema revision must not break games whose declared contract remains supported. Additive optional fields are nonbreaking; older games must safely tolerate/ignore unknown additional fields and must not execute or interpret them as instructions.
- Compatible changes must preserve existing required fields, types, meaning and validation guarantees. Removing/renaming required fields, changing semantics or introducing new mandatory fields requires an explicitly incompatible contract version or a separately negotiated compatible projection.
- Unknown optional extension fields are permitted where the Agon-owned schema declares extensibility. Unknown required features, malformed known fields, unsupported contract versions and invalid references fail validation; extensions cannot silently change gameplay.
- Data packs declare **which Agon schemas/versions** they conform to; they cannot define or modify schema semantics. New game behavior requires Agon-defined versioned capability and contract support.
- Compatibility must be validated and regression-tested against supported older game contracts and newer data with unknown optional fields. Schema version and package version are distinct concepts.

## Organization data migration
- Agon supplies **deterministic, versioned migrations** for organization-customized data through the **Data Authoring Tool** (whether hosted in Admin or a separate Studio; placement remains undecided). The game runtime must not migrate data implicitly during gameplay.
- Organizations may **keep older data packs indefinitely while they remain compatible** with the games/features they choose. A newer schema release alone does not require migration; upgrading becomes necessary when a desired game/feature requires a newer incompatible schema.
- Migration reads a source pack/schema version, preserves a backup/original and stable IDs/provenance, applies known transforms (including chained migrations), validates the output and presents a preview/report before publishing a **new pack version**. Never destructively overwrite an organization's original.
- Preserve authored data and unrecognized extension fields when safely representable; never silently discard data. When required new information cannot be inferred, flag records for human editing and block publication until validated; do not fabricate answers or use AI.
- Migration metadata includes source/target schema versions, migration steps, warnings, errors and unresolved manual actions. Existing sessions stay pinned to the prior resolved versions; migration does not rewrite historical sessions.
- Test round trips where feasible, idempotency/retry behavior, interrupted migration recovery, deterministic output and old/new pack coexistence.

## Existing architecture and implementation tracking
- [#425](https://github.com/mkunze8187-cmd/bible-challenge/issues/425): common `.agonpack` types, schema and registry.
- [#580](https://github.com/mkunze8187-cmd/bible-challenge/issues/580): organization content/data packs and Host selection.
- [#584](https://github.com/mkunze8187-cmd/bible-challenge/issues/584): deterministic Active Pack Sets, composition and translation constraints.
- [#583](https://github.com/mkunze8187-cmd/bible-challenge/issues/583): runtime enablement/entitlements.
- Authoring Studio issue: schema-specific organization migration and publishing workflow.
- Existing generic Content Pack descriptions remain applicable to other content domains; **Game Data Pack** is the specialized contract for translation-specific game data. Reconcile prior wording that permitted translation-independent content within a Game Data Pack: common non-customizable data belongs with the game/common Agon assets instead.

## Non-goals
No arbitrary executable pack payloads, no organization-defined schemas, no runtime AI, no implicit migration, no destructive replacement of official content, and no forced upgrade of still-compatible organization packs.
