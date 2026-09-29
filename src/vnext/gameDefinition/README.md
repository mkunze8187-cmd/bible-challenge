# GameDefinition schema and registry

Versioned `GameDefinition` schema and runtime registry (#314). Design source: [`specs/architecture/modular-game-platform-distribution.md`](../../../specs/architecture/modular-game-platform-distribution.md), section 4 ("Game definitions").

## What a GameDefinition declares

A `GameDefinition` (`schema.ts`) declares, rather than owns:

- metadata (name, family)
- player/team capabilities
- mechanic/engine dependencies (by `MechanicId`, with a role)
- challenge/content requirements
- randomizer/scoring/round/difficulty policy names
- Main Stage/Player Controller/Host projection names
- persistence policy
- asset dependencies

It does not contain behavior. Interpreting a definition (turning `randomizerPolicy: "seeded-selection"` into actual randomizer calls, for example) is the Game Runtime's job (#447–450), not this schema's.

## Registration and validation

`GameDefinitionRegistry` (`registry.ts`) validates a definition against the JSON Schema at registration time (build/install), and the same validator can be re-run defensively at runtime. Registration also resolves each definition's mechanic dependencies against previously-registered mechanics and rejects (rather than partially registers) a definition that:

- fails schema validation (`Error`, with per-field details);
- requires a mechanic that isn't registered (`MissingMechanicError`);
- reuses an already-registered `GameDefinitionId` (`DuplicateGameDefinitionError`);
- has a mechanic dependency cycle (`MechanicDependencyCycleError`).

## Reuse-first rule

An existing mechanic **must** be reused unless an architecture decision explains why not. When extending behavior:

- broadly reusable behavior belongs in a shared mechanic engine, registered once and depended on by any `GameDefinition` that needs it;
- truly unique behavior (a novel mechanic with no existing analog) belongs in its own narrow module, not bolted onto an unrelated engine or duplicated per game.

Do not add a game-specific special case to `GameDefinitionRegistry` or the schema itself to work around a missing mechanic — register the mechanic, or open an architecture decision explaining why this game's behavior can't be expressed as a mechanic dependency.

## Coexistence with the legacy engine

This registry has no knowledge of and does not gate `src/lib/gameEngine.ts`'s `GAME_LIBRARY`. A game can have both a legacy registration (still authoritative for actual play) and a `GameDefinition` fixture proving the vNext shape can describe it, simultaneously, without either one needing to change. See `fixtures/beforeOrAfter.ts` for a worked example against the real `before-or-after` legacy game.

Per the architecture-boundary guard (#515), nothing under `src/vnext/` may import `src/lib/gameEngine.ts` or `src/renderer/App.tsx` — this package only reads legacy source as plain text in tests, to assert the legacy path stays untouched.
