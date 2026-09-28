## Summary

<!-- What changed and why. Link the issue: "Closes #N". -->

## Agon vNext checklist (ADR-001)

- [ ] This PR does **not** add major new game/engine logic to `src/lib/gameEngine.ts` or `src/renderer/App.tsx`, **or** it is a `legacy-only` change (defect, content, security/accessibility, compatibility adapter, migration support) with the justification in the linked issue.
- [ ] No new member of the legacy `GameId` union and no new per-game field on `PlayerStats`.
- [ ] Game/capability code does not import Electron, filesystem or network transport directly.
- [ ] AGON_GENERAL / AGON_KIDS audience boundary respected.
- [ ] If JSON schemas in `src/data/` changed: `npm run sync-schemas --workspace bible-challenge-admin -- --source ..` was run.

## Validation

- [ ] `npm run typecheck` / `npm run typecheck:admin`
- [ ] `npm run test:run` / `npm run test:admin`
- [ ] `npm run test:e2e` (if UI/runtime affected)
