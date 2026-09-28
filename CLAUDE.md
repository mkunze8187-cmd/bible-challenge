# Agon Claude Rules

## Workflow
1. Read the active GitHub issue first.
2. Read only ADRs/specs it references; follow further references only when needed.
3. Implement the smallest complete change satisfying acceptance criteria.
4. Run targeted validation; report only changes, results, blockers, and decisions.

## Approval Gate
Do not independently change architecture/dependency direction, public contracts/schemas, security/trust boundaries, persistence formats, game rules/scoring, or UI/UX/layout/navigation/wording unless explicitly authorized by the active issue/spec.

If implementation requires a protected decision or exposes a missing/contradictory contract, STOP and request approval. Do not invent a local/game-specific workaround.

Migration/refactoring is not redesign. Preserve observable behavior.

## vNext
ADR-001 governs migration. No new major functionality in legacy `src/lib/gameEngine.ts` or `src/renderer/App.tsx`. Games depend on runtime/contracts, not Electron or transport. Stage consumes public projections. Controllers submit intents; runtime owns authority. AGON_GENERAL and AGON_KIDS remain separate player-facing families while sharing lower-level infrastructure.

## UI/UX
Unless explicitly authorized, preserve layout, wording, controls, interaction order, responsive behavior, and existing components/design tokens. Do not modernize/simplify during migration. Unexpected visual differences are regressions. Never update visual baselines merely to hide one.

## Cross-Agent Compatibility
Claude, Codex, and humans must be interchangeable between commits. Source, tests, issues, ADRs, and specs are shared memory; never rely on chat-only assumptions. Leave completed work buildable/testable and record durable decisions in the repository.

## Context Economy
Do not preload the repository documentation. Start with the active issue and load only necessary references. Do not restate requirements or narrate routine work.

## Validation
Use the narrowest relevant tests while developing and the issue-required acceptance checks before completion. Do not fix unrelated failures without scope. See `AGENTS.md` for project commands/workspace map when needed.
