# Agon — GitHub-First Design Workflow

Use for **gameplay brainstorming, review and specification**, not just coding. GitHub is the persistent source of truth across assistants, devices and chats.

## Begin a design conversation
1. Read root `AGENTS.md`, `docs/ai/design-principles.md`, this workflow and `docs/ai/current-work.md`. For an existing game, find its entry in the specs/index and current issue.
2. Search GitHub issues, approved specs, ADRs and **relevant implementation code** before asserting that a mechanic is new or reusable. Check similar games, existing capabilities and planned-but-unimplemented issues. Distinguish implemented, specified, proposed and missing.
3. Identify applicable constraints, current approved behavior, dependencies and any contradictions. Ask rather than invent missing rules.
4. During design, clearly label **idea / proposal / approved / deferred / rejected**. Do not infer approval from exploration or a passing example.
5. For each proposed capability, document reuse analysis: existing mechanism, possible extension, generic contract, game-specific configuration, other consumers, and duplication risks. Prefer generic reusable capabilities immediately when behavior plausibly applies elsewhere; a second consumer is not required.
6. Preserve previously approved rules, terminology, canonical biblical narrative, profile-aware challenge selection, platform parity and the **no-AI deterministic runtime** invariant.

## Commit approved decisions
1. Update the **authoritative game/engine/controller spec** and its linked implementation issue; create a new issue only if genuinely distinct. Keep one-line summaries, scope, acceptance criteria, dependencies and issue cross-links.
2. If changing architecture, security, transport, persistence or shared contracts, create/update an ADR or architecture issue; get explicit approval before implementation.
3. For major or cross-cutting changes, use a GitHub branch and PR; respect branch protection. Link specs, issues and related capabilities. Never claim a PR's contents are merged into `main` until confirmed.
4. Update `docs/ai/decision-register.md` for important cross-game decisions and `docs/ai/current-work.md` when the active focus or open decisions change. Maintain checkpoint indexes such as `specs/games/exodus-documentation-index.md`.
5. State exactly which decisions were committed, where, what is awaiting review/merge, and **what remains only in chat**. If a write fails, surface the missing material explicitly.

## Review and handoff
- At the end of a substantial session, reconcile all approved decisions to GitHub, then provide a compact handoff with relevant links, unresolved choices, and next actions.
- Start a new chat with the template in `docs/ai/conversation-handoff.md`; never rely on the new chat automatically knowing or loading repository rules.
- Don't broaden a task into adjacent implementation or redesign. If a design requires unapproved changes, pause for authorization.
- Never claim complete conversation-to-repository reconciliation without actually comparing the complete source conversations.
