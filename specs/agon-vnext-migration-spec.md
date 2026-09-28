# Agon vNext Migration Specification

## Purpose

Define how the existing Bible Challenge/Agon implementation transitions to the contract-driven Agon architecture without discarding working content, tests and infrastructure.

This spec implements ADR-001.

## Scope

### Preserve and migrate

- repository and build/test toolchain;
- TypeScript/React;
- Electron as the initial Offline/Local host;
- authored content and compatible schemas;
- Admin Console capabilities;
- automated unit, playthrough, E2E and visual tests;
- LAN/controller infrastructure where compatible with new contracts;
- assets/audio and useful scoring/randomization algorithms;
- individual legacy game behavior as migration reference.

### Replace incrementally

- central `gameEngine.ts` orchestration;
- monolithic `App.tsx` game rendering/orchestration;
- game-specific global `PlayerStats`;
- hard-coded central GameId/switch extension as the primary plugin mechanism;
- direct game-to-renderer, game-to-Electron and game-to-network coupling.

## Target boundaries

The target architecture must provide stable contracts for:

- `GameDefinition` and game registry;
- `AgonRuntime` / session lifecycle;
- Engine/Capability SDK;
- Challenge API and reusable challenge adapters;
- participants/teams/turns/scoring/results;
- Stage/public presentation state;
- Host/private control state;
- Controller intents, including buzzer, typed input, choices, card-hand actions and future capability-specific input;
- content packages and BibleTextService;
- persistence/save/resume;
- randomization with deterministic/testable seeds where required;
- timers;
- Offline/Local platform adapter;
- future Shared and Hosted platform/transport adapters;
- audience/profile metadata including AGON_GENERAL and AGON_KIDS.

## Suggested repository direction

The exact folder migration may be incremental, but dependency direction should converge toward:

```text
packages/
  contracts/
  game-sdk/
  challenge-sdk/
  content/
  scripture/
  engines/
  platform/
  stage/
  controller/
  persistence/
apps/
  agon/
  admin/
  controller/
  stage/
games/
  general/
  kids/
content/
```

Do not perform a mass folder move merely to resemble this tree. Establish contracts/dependency boundaries first and move modules when useful.

## Coexistence

During migration the application supports two launch paths:

- Legacy game -> `LegacyGameAdapter` -> legacy engine/render path.
- Migrated game -> `AgonRuntime` -> registered `GameDefinition` -> capability composition.

A registry/launch resolver decides which path owns each game. There must be one authoritative path per GameId at runtime.

## Reference-game migration

Select one implemented game that exercises enough of the architecture to prove it: participant setup, score/result, challenge interaction, public Stage projection, Host controls, controller-compatible input, content loading, save/resume and automated playthrough. Avoid selecting a trivial game that leaves the important boundaries untested.

The reference migration must establish templates and test fixtures for later migrations.

## Testing requirements

For every migrated game:

1. retain relevant legacy tests until behavioral equivalence is demonstrated;
2. add contract tests for its GameDefinition/capability composition;
3. add deterministic engine tests for extracted reusable capabilities;
4. add a complete vNext playthrough test;
5. cover Host/Stage public-private data separation;
6. cover controller intent validation when applicable;
7. verify save/resume if the game supports persistence;
8. preserve data/schema validation;
9. maintain E2E/visual coverage for representative surfaces.

Migration does not require pixel-identical UI if a deliberate vNext UX change is documented.

## Legacy freeze rule

After acceptance of this spec, planned engines and major new games must target vNext contracts. Legacy changes are limited to defect fixes, content maintenance, security/accessibility fixes, compatibility adapters, and work required to enable migration. Exceptions require an explicit issue note explaining why vNext cannot yet host the change and how the work avoids increasing migration debt.

## Catalog integration

Issue #507 is an input to migration planning. Its dispositions identify:

- same-family duplicates that should not both be migrated;
- variants that should become profiles/content instead of separate implementations;
- shared infrastructure candidates that should become engines/capabilities;
- audience boundaries that must survive migration.

Do not migrate a candidate merely because an issue exists. Determine its final catalog disposition and dependency family first.

## Migration waves

### Wave 0 — Foundation
Contracts, runtime skeleton, registries, local adapters, test harness, compatibility routing and architecture enforcement.

### Wave 1 — Reference game
One representative implemented game end-to-end.

### Wave 2 — Existing game families
Group the current implemented catalog by dominant mechanic/capability and migrate families, extracting reusable engines rather than porting duplicate logic.

### Wave 3 — Renderer decomposition
Move setup, Host, Stage, game surface, help and results into bounded vNext surfaces/components. Shrink legacy `App.tsx` as ownership moves.

### Wave 4 — Controllers and Shared readiness
Move current LAN/remote behavior behind Controller/transport contracts. Local LAN remains the first implementation; contracts must permit future Hosted transport without game changes.

### Wave 5 — Planned catalog
Implement approved new general/Kids games on vNext only, using #507 and engine audits to prevent duplicate mechanics.

### Wave 6 — Legacy retirement
Remove legacy GameIds/routes/state branches only after all retained games migrate or receive an explicit superseded disposition. Delete legacy monoliths when they have no production callers.

## Completion criteria

vNext migration is complete when:

- all retained player-facing games run through AgonRuntime;
- no production game imports legacy engine APIs;
- no production game directly depends on Electron/network transport;
- Stage/Host/controller boundaries are contract-driven;
- generic stats/results no longer require per-game fields;
- all retained content passes validation through the new content boundary;
- automated regression/playthrough coverage exists for retained games;
- legacy launch path and monolithic game engine can be removed;
- Shared/Hosted can be implemented as adapters without rewriting game logic.
