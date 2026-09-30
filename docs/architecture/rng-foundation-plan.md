# Agon vNext RNG Foundation Plan

## Decision

M0 owns a small permanent **authoritative deterministic RNG primitive/session contract**. The full reusable Randomizer Engine remains M3 work.

This separates runtime randomness authority from product/game randomizer features. M0 must establish deterministic, recoverable randomness so later capabilities do not invent ad-hoc RNG. M0 does **not** need dice, spinner, wheel, lots, custom-face, weighting, history UI, or randomizer presentation behavior.

## M0 foundation scope

The M0 RNG primitive must provide:

- runtime/engine-authoritative random outcomes; clients and presentation layers may request randomness but never claim outcomes;
- deterministic seeded state owned by the authoritative session/runtime;
- reproducible sequence behavior for the same seed and state;
- stable state/checkpoint semantics for save/resume and replay;
- duplicate/replayed command protection so one logical request cannot accidentally consume randomness twice;
- minimal reusable operations such as bounded integer selection and candidate selection/shuffle primitives where justified by consumers;
- deterministic test fixtures independent of Electron, renderer, and network implementations;
- a stable capability/service boundary that M3 randomizers and other random consumers can use.

The primitive is not a mock or temporary shim. It is the permanent lower-level source of authoritative deterministic randomness.

## Explicit M0 non-goals

The M0 primitive does not implement dice/custom-face definitions, heterogeneous multi-randomizer rolls, weighted randomizer authoring semantics, randomizer history/presentation metadata beyond what is necessary for authoritative replay/audit, Spinner/Wheel/Casting Lots/tumbler/dice presentation, Admin randomizer authoring, or Player/Host/Projector randomizer UX. Those remain M3 randomizer capability work.

## M3 relationship

M3 owns the full reusable Randomizer Engine. Issue #141 defines/configures randomizers. Issue #142 builds the authoritative reusable randomizer engine on top of both #141 and the M0 RNG primitive. Presentation/integration issues continue to build on #142 as appropriate.

```text
M0 authoritative deterministic RNG primitive
        |
        v
M3 #141 randomizer definitions/configuration
        |
        v
M3 #142 reusable Randomizer Engine
        |
        +-- Dice
        +-- Spinner / Wheel
        +-- Casting Lots
        +-- custom randomizers
        +-- game integrations
```

## M1/M2 implications

Five Clues does not require the full #142 Randomizer Engine. M1 may consume the M0 RNG primitive only if an authoritative random decision is actually needed.

M2 catalogs RNG/Dice/Spinner/Lots capability requirements and consumers; it does not require #142 to be implemented before classification.

Consumers needing deterministic randomness but not randomizer-product semantics (for example seeded team rotation, shuffle/order selection, deterministic question selection) should depend on the M0 RNG primitive rather than #142 unless they genuinely consume the Randomizer Engine.

## Roadmap interpretation

- M0: authoritative deterministic RNG primitive/session contract.
- M1: reference migration; no dependency on full #142 unless scope changes.
- M2: identify random capability consumers and migration dependencies.
- M3: #141 + #142 and the rest of the Randomizer capability family.

This plan supersedes roadmap wording that lists full #142 as the M0 RNG owner.