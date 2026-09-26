# Agon Developer Documentation

**Status:** Normative developer handbook entry point  
**Audience:** contributors, maintainers, coding agents, reviewers  
**Architecture target:** Agon foundations and reference migrations

This directory is the canonical starting point for development documentation. Product behavior belongs in `SPEC.md` and feature/game specifications; this handbook describes **how Agon is structured, how layers interact, and how changes are built, tested and released**.

## Documentation map

| Document | Purpose | Authority |
|---|---|---|
| [System Design](system-design.md) | Architecture, layers, trust boundaries, runtime modes, data/control flow, diagrams | Normative architecture overview |
| [Contract/API Reference](contracts.md) | Official contracts between layers and compatibility/change rules | **Normative / semi-locked** |
| [Build, Test & Deploy Guide](build-test-deploy.md) | Local setup, build, test pyramid, packaging, deployment/release gates | Normative engineering procedure |
| [Architecture Decision Records](adr/README.md) | How consequential architectural changes are proposed and recorded | Normative governance |

Related source documents remain authoritative for their detailed domain:
- `SPEC.md` — product/game behavior.
- `ROADMAP.md` — delivery direction.
- architecture specs introduced by foundation PRs/issues — detailed rationale and planned implementations.
- source TypeScript interfaces/schemas — executable realization of the contracts in this handbook.

If source code and this handbook disagree, treat that as a defect: do not silently choose one. Determine whether implementation is behind the accepted contract or the contract has intentionally changed, then update code/tests/docs together.

## Contract maturity

Agon uses three documentation maturity levels:

1. **DRAFT** — exploratory; implementation may change freely.
2. **STABLE** — accepted for implementation; additive compatible changes are preferred.
3. **LOCKED** — cross-runtime/public persistence/protocol contract. Breaking changes require an ADR, explicit version change, migration/compatibility plan, and conformance tests.

The contracts in `contracts.md` are **STABLE by default**. Wire envelopes, persisted schemas, package manifests and published plugin/module boundaries become **LOCKED** when their first production version is released.

## Definition of a contract change

A contract change includes changes to method/event/command names, required fields, semantics, ownership/authority, serialization, error behavior, ordering, privacy projection, versioning or compatibility guarantees. Refactoring an implementation behind an unchanged contract is not a contract change.

## Documentation-as-code rule

A PR that changes a STABLE/LOCKED contract must include, in the same PR when practical:
- updated contract documentation;
- updated TypeScript types and JSON/schema definitions;
- unit/contract/conformance tests;
- migration or compatibility notes for breaking changes;
- an ADR for significant or breaking architectural decisions.

Mermaid diagrams are used as version-controlled architecture diagrams because GitHub renders them directly and they remain reviewable as text.