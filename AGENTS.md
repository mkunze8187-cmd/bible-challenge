# AI Execution Rules

## Scope & Approval
- Read the active GitHub issue first; its acceptance criteria plus referenced ADRs/specs define scope.
- Load only documents needed for the active issue. Do not preload the docs/specs tree.
- Do not implement adjacent backlog items.
- **Approval required:** architecture/dependency direction, public contracts/schemas, security/trust boundaries, persistence formats, game rules/scoring, or UI/UX/layout/navigation/wording changes not explicitly authorized by the issue/spec.
- If a protected decision or missing/contradictory contract blocks work, STOP and request approval. Do not invent a local workaround.
- Migration/refactoring is not redesign: preserve observable behavior unless an approved requirement says otherwise.

## Cross-Agent Compatibility
- Claude, Codex, and humans must be interchangeable between commits.
- Source, tests, issues, ADRs, and specs are shared memory; never rely on undocumented agent assumptions.
- Leave completed work buildable/testable and record durable decisions in the repository, not chat.

## UI/UX Freeze
Unless explicitly authorized:
- preserve layout, wording, controls, interaction order, responsive behavior, and existing design tokens/components;
- do not modernize/simplify UI during migration;
- never update visual baselines merely to make a regression pass.
Unexpected visual differences are regressions.

## Agon vNext (ADR-001)
- Governing docs: `docs/architecture/adr-001-agon-vnext-staged-replacement.md`, `specs/agon-vnext-migration-spec.md`, `ROADMAP.md`.
- No new major game/engine logic in legacy `src/lib/gameEngine.ts` or `src/renderer/App.tsx`.
- Allowed legacy work: defects, content, security/accessibility, compatibility adapters, migration support. Use `legacy-only` and justify why vNext cannot host it.
- Never extend legacy `GameId` for a new game, add per-game `PlayerStats` fields, or import Electron/network transport from game code.
- Games use runtime/contracts; Stage consumes public projections; controllers submit intents; runtime owns authority.
- AGON_GENERAL and AGON_KIDS remain separate player-facing families; share infrastructure, not GameDefinitions.

## Workspace
- Root Electron app: Main/Preload `electron/`, Renderer `src/`.
- Admin SPA: `admin/` workspace (`bible-challenge-admin`). Confirm workspace before editing.
- Shared schemas: `src/data/`; Admin copies are synced to `admin/src/data/schemas/`.
- If modifying schemas, run: `npm run sync-schemas --workspace bible-challenge-admin -- --source ..`
- Never guess ambiguous paths; inspect the tree/package first.

## Validation
Run the narrowest relevant checks while developing; run issue-required acceptance checks before completion. Do not fix unrelated failures without scope.
- Typecheck: `npm run typecheck` | `npm run typecheck:admin`
- Unit: `npm run test:run` | `npm run test:admin`
- Data: `npm run check:data`
- E2E: `npm run test:e2e` (`test:e2e:fast` only with fresh dist)
- Full: `npm run test:all` only when required by issue/PR gate or broad cross-cutting change.
- Run apps: `npm run start` | `npm run start --workspace bible-challenge-admin`

## Response Economy
- Code/work first; no preamble, fluff, or post-mortem unless requested.
- Report only changed files, validation results, blockers, and approval decisions.
- Do not restate issue/spec requirements.
