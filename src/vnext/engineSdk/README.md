# Engine SDK

Foundational Engine SDK contracts for #447. Design source: [`specs/architecture/engine-sdk.md`](../../../specs/architecture/engine-sdk.md).

An engine is a reusable mechanic/capability. Games and future session runtime code declare capability requirements and resolve them through `EngineRegistry`; they do not import concrete engine implementations by game name.

## Contracts

- `EngineDescriptor` declares engine identity, semantic version, provided capabilities, dependency requirements, traits and optional state schema version.
- `EngineFactory` creates or restores an `EngineInstance` with injected `EngineContext`.
- `EngineInstance` exposes the standard lifecycle: `handleCommand`, `getProjection`, `snapshot` and `dispose`.
- `EngineContext` injects RNG, clock, session identity, capability resolution, event publication and diagnostics.

## Integration Boundaries (#448)

- `EngineCommandEnvelope` and `EngineEventEnvelope` carry commands and events across Local/Shared adapters without exposing engine implementation objects.
- `InputActionRegistry` maps semantic controller actions to command types and rejects unauthorized roles before dispatch.
- `RendererContributionRegistry` resolves Stage, controller and host renderer contributions by capability/surface.
- Projections are always requested through `getProjection(viewer)`; raw engine state is never treated as client-visible.

## Capability Resolution

Capability IDs are stable strings such as `cards.hand`, `dice.roll` or `race.track`. Version matching supports exact versions, `^major` / `^major.minor` ranges, `>=` floors and `*`.

`EngineRegistry.resolveRequirements` separates required, optional and missing optional capabilities. Missing required capabilities throw `UnknownCapabilityError` with a stable message.

## Persistence And Readiness (#449)

- `PersistedEngineSnapshot` stores logical state with an `EngineSessionPin` containing effective engine version, capability versions and state schema version.
- `EngineSnapshotMigrationRegistry` restores compatible snapshots, applies explicit one-version-at-a-time schema migrations and rejects newer engine/schema snapshots.
- `EnginePackageManifest` declares engine capability requirements for packages/games.
- `evaluatePrepareEventEngineReadiness` reports missing or incompatible engine capabilities before play.
- `negotiateSharedEngineCapabilities` compares capability metadata for Shared/Hosted style negotiation without exchanging implementation objects.
