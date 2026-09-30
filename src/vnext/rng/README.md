# RNG

Authoritative deterministic RNG primitive for #538. Design source: `docs/architecture/rng-foundation-plan.md`.

`AuthoritativeRng` is the permanent low-level seeded random source for vNext runtime/session authority. It owns stable state and cursor position, supports checkpoint/restore, and protects accepted operations with idempotency keys so retry/reconnect cannot consume randomness twice.

This package intentionally has no dice, spinner, wheel, casting-lots, face-definition, weighting, presentation, renderer, Electron, network, or UI semantics. M3 randomizer work (#141/#142) consumes this primitive rather than replacing it.
