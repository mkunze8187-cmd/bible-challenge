# Agon vNext domain model

Canonical domain types for Agon vNext (#362). Design source: [`specs/architecture/core-foundations-and-stage-orchestration.md`](../../../specs/architecture/core-foundations-and-stage-orchestration.md), section 1 (IDs) and section 13 (ownership hierarchy).

## Ownership hierarchy

```text
Mechanic -> Game (GameDefinition) -> Variant -> Match -> Tournament -> Event
```

- **Mechanic** — a reusable rule primitive (cards, buzzer, ordering, dice). Owns no score or transport.
- **GameDefinition** — a named playable ruleset/composition of one or more Mechanics.
- **Variant** — a constrained overlay on a `GameDefinition`. Must not duplicate the full definition.
- **Match** — one competitive instance of a Game/Variant between participants or teams.
- **Tournament** — a structure composed of Matches.
- **Event** — a broader multi-game/multi-session gathering structure.

`Round`/`Turn`/`Attempt` are **session/game execution concepts** (see `session.ts`), not Tournament structure — do not confuse a session `Round` with a Tournament round.

A Mechanic must never own Event score. A Game must never own transport. A Variant must never duplicate an entire `GameDefinition` rather than overlaying one.

## IDs

All IDs (`ids.ts`) are opaque, branded string types:

- created with `createId<Brand>()`, backed by `crypto.randomUUID()` — never derived from a display name;
- display names can change without breaking persistence, because nothing is keyed on them;
- identity IDs (`PlayerId`, `TeamId`) are distinct from session-participant IDs (`ParticipantId`) — a Player's identity persists across sessions, a Participant does not;
- IDs are plain strings at runtime (serialize to/from JSON with no special handling), so they round-trip across Local/Shared/Hosted without transport-specific logic;
- use `asId<Brand>(value)` only to re-wrap a string already known to be a valid ID of that kind (e.g. read back from persistence) — never to mint a new ID.

## Serialization conventions

- IDs serialize as plain JSON strings.
- Persisted references to versioned/content-bearing entities (`VersionedReference` in `ownership.ts`) always carry `gameVersion` (and `challengeVersion` when challenge content matters), so a save/replay is pinned to the rules it was created under even if the `GameDefinition` is updated later.
- See `tests/vnextDomain.test.ts` for round-trip serialization fixtures covering every exported ID brand and the `VersionedReference` shape.
