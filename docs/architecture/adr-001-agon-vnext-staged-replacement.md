# ADR-001: Agon vNext uses staged architectural replacement

**Status:** Accepted  
**Date:** 2026-09-28

## Context

The current application contains substantial reusable value: TypeScript/React/Electron tooling, content and schemas, Admin work, LAN/controller infrastructure, packaging, automated tests, assets, and working game behavior. However, the central architecture has become highly concentrated: most game behavior is coordinated through `src/lib/gameEngine.ts`, while the main renderer is concentrated in `src/renderer/App.tsx`. Common state such as `PlayerStats` also contains game-specific fields.

Agon's target design is materially different. Games should compose reusable engines/capabilities through stable contracts and should not depend directly on platform, transport, or a monolithic renderer. Offline/local is implemented first, while Shared and Hosted modes use the same contracts later.

## Decision

Agon vNext will be a **major architectural replacement inside the existing repository, performed incrementally with compatibility adapters**.

We will NOT continue adding major new game architecture directly to the legacy `gameEngine.ts` / `App.tsx` monoliths, attempt to transform those monoliths into the final architecture in-place, or discard the repository and rewrite all content, tests, tooling, Admin, LAN/controller work, and existing game behavior from zero.

We WILL preserve the repository, TypeScript/React toolchain, Electron offline shell initially, content, useful schemas, Admin investment, tests, assets, and reusable infrastructure; establish vNext contracts and runtime beside the legacy runtime; make the runtime platform-neutral; migrate games incrementally using legacy behavior as reference; and retire legacy modules only after callers migrate and regression coverage exists.

## Architectural guardrails

1. No new major game logic in the legacy monolith. Bug fixes and migration-support changes are allowed.
2. No game may require Electron APIs directly. Platform services are injected through contracts.
3. No game may require a particular network transport. Controller/host actions use contracts.
4. No global stats interface grows a field for each game. Stats/results use generic and namespaced/extensible models.
5. Game identity is registry/definition driven; avoid expanding a central hard-coded union/switch as the primary extension mechanism.
6. Stage is a presentation contract; gameplay state is not owned by projector/display UI.
7. Controllers submit intents/actions and do not own authoritative game state.
8. Content remains data-driven and migration preserves authored content wherever possible.
9. Existing automated tests become a regression oracle. Migrated games add vNext contract/unit tests and equivalent playthrough coverage.
10. AGON_GENERAL and AGON_KIDS audience boundaries remain intact. They may share engines/content/assets without collapsing player-facing definitions solely because mechanics or Scripture overlap.

## Migration model

Use a strangler pattern:

`legacy shell -> LegacyGameAdapter -> legacy engine`

alongside:

`legacy/new shell -> AgonRuntime -> GameDefinition -> reusable capabilities`

The shell may host both paths until migration is complete.

## Initial migration sequence

1. Freeze architectural expansion of the legacy monoliths.
2. Establish contracts and package/module boundaries.
3. Implement `AgonRuntime` with local/offline adapters first.
4. Implement legacy compatibility/launch routing.
5. Select one representative reference game and migrate it end-to-end.
6. Prove behavioral/test equivalence and Stage/controller boundaries.
7. Migrate related game families using catalog/consolidation audit #507 to identify common capabilities.
8. Decompose the renderer as vNext surfaces become authoritative.
9. Retire legacy engine/UI paths only when unused.

## Consequences

Existing investment is preserved and migration can be verified game-by-game, but legacy and vNext runtimes coexist temporarily and compatibility adapters add short-term complexity. Some tests/content schemas require transitional adapters.

## Roadmap implication

Before large-scale new-game implementation, create a vNext foundation/migration milestone covering contracts, runtime, compatibility, reference-game migration, test equivalence and architectural enforcement. Catalog issue #507 should then inform migration waves and reusable-capability extraction; it should not be used as justification to continue growing the legacy monolith.
