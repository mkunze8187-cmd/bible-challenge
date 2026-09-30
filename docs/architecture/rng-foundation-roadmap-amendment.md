# Roadmap amendment — RNG foundation split

Apply this amendment anywhere the roadmap/refactor proposal currently treats full Randomizer Engine issue #142 as M0 foundation work.

## Replacement wording

**M0 RNG authority:** M0 provides a permanent authoritative deterministic RNG primitive/session contract (tracked by the dedicated M0 RNG-foundation issue). It owns seeded runtime state, deterministic/recoverable consumption, replay/save-resume semantics, duplicate-consumption protection, and test fixtures. It is renderer/network independent.

**M3 Randomizer Engine:** #141 and #142 remain M3 capability work. #142 consumes the M0 RNG primitive plus #141 definitions/configuration and owns reusable randomizer semantics such as configured outcomes, multi-randomizer rolls, weighting where supported, roll/history semantics, and the foundation used by Dice/Spinner/Wheel/Casting Lots presentation and integrations.

## Execution-order correction

Where M0 currently lists `#142 + #156`, replace that conceptual pairing with `M0 RNG foundation + #156 timer foundation`. Remove #142 from the M0 completion gate. Add #142 to M3 immediately after its prerequisites (#141 and the M0 RNG foundation) are satisfied.

## Dependency correction

Consumers that need deterministic randomness but not Randomizer Engine semantics should depend on the M0 RNG foundation, not #142. #292 Random Tag/team rotation is the first identified correction. M2/#511 should identify any additional cases during capability classification.

## M1/M2

M1/Five Clues does not require full #142. M2 may catalog Randomizer consumers without #142 being complete.
