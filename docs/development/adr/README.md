# Architecture Decision Records (ADRs)

Agon uses ADRs for decisions that materially change stable architectural contracts, authority boundaries, persistence/wire schemas, security/privacy behavior, runtime portability or major technology direction.

## When an ADR is required

Create an ADR when a change:
- breaks or materially reinterprets a STABLE/LOCKED contract;
- moves authoritative ownership between layers;
- introduces a new cross-cutting engine/service abstraction;
- changes persisted/wire/package compatibility strategy;
- changes trust/security/privacy boundaries;
- adds a runtime-specific exception to the common Local/Shared/Hosted model;
- adopts/replaces a major framework/provider that constrains architecture.

An ADR is not required for an implementation refactor behind unchanged contracts, a new ordinary game using existing engines, or an additive content change.

## File naming

`NNNN-short-kebab-title.md`, starting with `0001`.

## Template

```markdown
# ADR-NNNN: Title

- Status: Proposed | Accepted | Superseded | Rejected
- Date: YYYY-MM-DD
- Decision owners: ...
- Related issues/PRs: ...
- Supersedes: ...

## Context
What problem/constraint requires a decision?

## Decision
What is the decision? State contract/ownership semantics precisely.

## Alternatives considered
What realistic alternatives were evaluated and why were they not selected?

## Consequences
Positive, negative, migration, security/privacy, performance, testing and operational consequences.

## Compatibility and migration
Contract/schema versions affected, migration/negotiation/rollback plan.

## Validation
Tests, reference implementation or measurements that demonstrate the decision works.
```

## Lifecycle

1. Proposed ADR is included with or before implementation PR.
2. Review specifically calls out contract/migration implications.
3. Once accepted/merged, code and normative docs align to it.
4. Do not rewrite historical accepted ADRs to hide changed decisions. Create a new ADR that supersedes the old one.
5. Link implementation issues/PRs both directions where practical.

## Contract freeze rule

After the foundation/reference-game validation gate, a new cross-cutting abstraction should normally have concrete evidence from implementation, conformance failure or a committed product requirement. ADRs are not a mechanism for continuing speculative architecture indefinitely.