# Agon — Current Work / Conversation Continuity

**Snapshot: 2026-10-10.** Recheck live GitHub issues and PRs in the next conversation. This is a handoff/navigation aid, not a substitute for current repository state.

## Priority
Finish **Exodus Journey** design/spec reconciliation and implementation before optional native controllers. Continue with the next Exodus checkpoint, first reviewing existing approved specs, issues, and relevant implementation.

## Exodus
- Master implementation issue: [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461).
- Reconciliation/design records: [PR #628](https://github.com/mkunze8187-cmd/bible-challenge/pull/628) **merged**; follow-up audit [#629](https://github.com/mkunze8187-cmd/bible-challenge/issues/629) remains tracked.
- Choker ha-Machane: [PR #618](https://github.com/mkunze8187-cmd/bible-challenge/pull/618) **merged**.
- Sinai Ten Commandments: [PR #610](https://github.com/mkunze8187-cmd/bible-challenge/pull/610) **still open** as of this snapshot; review and merge separately. Its contents must not be treated as on `main`.
- Baseline specs on `main`: `specs/games/exodus-journey.md`, `specs/games/exodus-red-sea-crossing.md`, `specs/games/exodus-rephidim.md`. Consult `specs/games/exodus-documentation-index.md` and relevant checkpoint specs.

## Recently merged cross-cutting decisions
- [PR #630](https://github.com/mkunze8187-cmd/bible-challenge/pull/630) **merged**: GitHub-first design governance and deterministic/no-AI application principle; read `AGENTS.md`, `docs/ai/design-principles.md`, and `docs/ai/design-workflow.md`.
- [PR #631](https://github.com/mkunze8187-cmd/bible-challenge/pull/631) **merged**: approved Game Data Pack contracts and organization data migration policy. Authority: `docs/architecture/game-data-pack-contracts.md` and `docs/ai/decision-register.md`.
  - Distinct Game, translation-specific Game Data, and Bible Translation pack responsibilities under the common `.agonpack` system; one Game Data Pack can support multiple games.
  - Agon owns versioned data schemas; organization packs declare supported games and schema versions but cannot define schemas. Games may require newer schema versions; additive optional fields must not break compatible older games.
  - Host selects data packs for games, events, tournaments and Journeys; explicitly labeled bundled KJV fallback is allowed only when compatible; otherwise a game requiring unavailable compatible data is **NOT PLAYABLE**.
  - Organizations can continue using older compatible packs. Deterministic, non-destructive migration happens in the Data Authoring Tool and publishes a new pack version, not at gameplay runtime.
  - Implementation follow-up: [#425](https://github.com/mkunze8187-cmd/bible-challenge/issues/425), [#580](https://github.com/mkunze8187-cmd/bible-challenge/issues/580), [#584](https://github.com/mkunze8187-cmd/bible-challenge/issues/584), [#581](https://github.com/mkunze8187-cmd/bible-challenge/issues/581). The Admin-integrated versus standalone placement of the authoring tool is undecided.

## Deferred platform work
- [#625](https://github.com/mkunze8187-cmd/bible-challenge/issues/625): universal QR pairing/controller transport architecture **after Exodus**.
- [#626](https://github.com/mkunze8187-cmd/bible-challenge/issues/626): optional Android controller.
- [#627](https://github.com/mkunze8187-cmd/bible-challenge/issues/627): optional iOS controller.

## Working agreement
GitHub is the source of truth. Review existing issues/specs/architecture and relevant code before proposing changes; preserve approved mechanics, perform a reuse audit, and distinguish proposed from approved. Record approved decisions through PRs and linked issues. Check open PR state before assuming content is on `main`. If any approved decisions remain only in chat, identify them explicitly.
