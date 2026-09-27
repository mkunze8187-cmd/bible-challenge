# Agon Engine Development Guide

**Status:** Proposed STABLE developer guide
**Architecture:** `specs/architecture/engine-sdk.md`

## Rule of thumb
An engine is a reusable mechanic/capability. A game is orchestration/rules/content composed from engines and platform services. If adding an engine requires `if (game === ...)` in SessionRuntime, networking, persistence or installer code, the extension boundary has failed.

## Required steps
1. Choose a stable capability ID and semantic major version.
2. Define descriptor, config, state, commands, events and projections.
3. Implement EngineFactory/EngineInstance lifecycle.
4. Inject RNG/clock/content/capability services; do not use hidden globals.
5. Register capability in EngineRegistry.
6. Register Stage renderer/controller InputAction adapters if needed.
7. Define snapshot/schema migration when serializable.
8. Declare package/readiness dependencies.
9. Pass shared Engine SDK conformance suite.
10. Document behavior and compatibility.

## Capability consumption
Games declare requirements such as `race.track ^1`; they do not import a concrete RaceEngine implementation. Optional capabilities must have explicit degraded/alternate behavior.

## Composition
Games can compose multiple engines. Cross-engine orchestration belongs in game rules/coordinators, not concrete engine-to-engine imports. This keeps Cards usable with Gauntlet, Race, or future games without circular dependencies.

## Authority and privacy
Commands are requests; authoritative engine instances validate them. Never expose raw engine state automatically. Projections are viewer-aware and tested for hidden-information leaks.

## Presentation
Keep logical state separate from animation/theme. A renderer consumes projections. New engines may contribute renderer components but must not add game-specific global Stage branches. Controllers use semantic InputActions rather than keyboard/touch/network specifics.

## Persistence
Persist logical state, schema version and effective capability version. Do not persist animation frames. Restore must use compatible engine semantics or explicit migration. Saved sessions pin requirements needed for resume.

## Packaging/security
Normal `.agonpack` packages are non-executable. Trusted executable engine implementations ship through signed Agon application/module releases. Content packages may supply engine data/templates but cannot inject arbitrary code.

## Conformance
Applicable tests cover capability resolution/versioning, deterministic behavior, authorization/idempotency, snapshot/restore, replay, projection privacy, multiplayer isolation, invalid commands, renderer/action registration and readiness reporting.

## Existing-engine migration
Adapt existing reusable mechanics incrementally with compatibility adapters. Avoid a big-bang rewrite. Prioritize engines used by multiple games or needed by upcoming games. A migration issue should name consuming games and prove behavior parity before removing legacy paths.