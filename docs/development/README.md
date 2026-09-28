# Agon Developer Documentation

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../../specs/agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies. Where this document conflicts with ADR-001, **ADR-001 prevails**.

**Status:** Normative developer handbook entry point  
**Audience:** contributors, maintainers, coding agents, reviewers  
**Architecture target:** Agon foundations and reference migrations

This directory is the canonical starting point for development documentation. Product behavior belongs in `SPEC.md` and feature/game specifications; this handbook describes **how Agon is structured, how layers interact, and how changes are built, tested and released**.

## Documentation map

| Document | Purpose | Authority |
|---|---|---|
| [System Design](system-design.md) | Architecture, layers, trust boundaries, runtime modes, data/control flow, diagrams | Normative architecture overview |
| [Contract/API Reference](contracts.md) | Official contracts between layers and compatibility/change rules | **Normative / semi-locked** |
| [Package & Entitlement Contracts](contracts/package-entitlement-contracts.md) | PackageManager/Registry, EntitlementService, Bible translation delivery and Event preparation boundaries | **Normative / semi-locked** |
| [Build, Test & Deploy Guide](build-test-deploy.md) | Local setup, build, package/installer, test pyramid, updates, deployment/release gates | Normative engineering procedure |
| [Package, Entitlement & Translation Development Guide](guides/package-development.md) | How `.agonpack`, licensing/entitlements, translations, updates and Event preparation integrate with development | Normative engineering procedure |
| [Documentation & Help Development Guide](documentation-system.md) | How game/player/Host/Admin/Parent-Teacher/developer documentation is authored, delivered, versioned and tested | Normative documentation procedure |
| [Architecture Decision Records](adr/README.md) | How consequential architectural changes are proposed and recorded | Normative governance |

Related source documents remain authoritative for their detailed domain:
- `SPEC.md` — product/game behavior.
- `ROADMAP.md` — delivery direction.
- architecture specs introduced by foundation PRs/issues — detailed rationale and planned implementations.
- `specs/architecture/documentation-help-system.md` — documentation/help subsystem architecture.
- `specs/architecture/packaging-installation-entitlements.md` — package/installer/update/entitlement/translation architecture (PR #424 until merged).
- source TypeScript interfaces/schemas — executable realization of the contracts in this handbook.

If source code and this handbook disagree, treat that as a defect: do not silently choose one. Determine whether implementation is behind the accepted contract or the contract has intentionally changed, then update code/tests/docs together.

## Contract maturity

Agon uses three documentation maturity levels:
1. **DRAFT** — exploratory; implementation may change freely.
2. **STABLE** — accepted for implementation; additive compatible changes are preferred.
3. **LOCKED** — cross-runtime/public persistence/protocol contract. Breaking changes require an ADR, explicit version change, migration/compatibility plan, and conformance tests.

The contracts in `contracts.md` and `contracts/` are **STABLE by default**. Wire envelopes, persisted schemas, `.agonpack` manifests, signed entitlement certificate schemas and published plugin/module boundaries become **LOCKED** when their first production version is released.

## Definition of a contract change

A contract change includes changes to method/event/command names, required fields, semantics, ownership/authority, serialization, error behavior, ordering, privacy projection, package/entitlement state semantics, versioning or compatibility guarantees. Refactoring an implementation behind an unchanged contract is not a contract change.

## Documentation-as-code rule

A PR that changes a STABLE/LOCKED contract must include, in the same PR when practical:
- updated contract documentation;
- updated TypeScript types and JSON/schema definitions;
- unit/contract/conformance tests;
- migration or compatibility notes for breaking changes;
- an ADR for significant or breaking architectural decisions.

Product documentation follows the same principle: new games require How to Play + Quick Start; new Host/Admin features require contextual help; learning-oriented kids games require applicable Parent/Teacher material; package/entitlement/translation features require Admin/Host troubleshooting and licensing/attribution guidance. PDF/print/web/in-app Help should be generated or rendered from canonical structured documentation rather than maintained as conflicting copies.

Mermaid diagrams are used as version-controlled architecture diagrams because GitHub renders them directly and they remain reviewable as text.