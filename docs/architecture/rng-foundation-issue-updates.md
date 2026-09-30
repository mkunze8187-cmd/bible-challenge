# Issue updates required by RNG foundation split

This checklist accompanies the RNG foundation plan.

1. Create an M0 issue named **vNext P0: authoritative deterministic RNG primitive and session contract** with the scope and acceptance criteria in `rng-foundation-plan.md`.
2. Move #142 to **M3 — Core Capability Extraction**. Its prerequisites are #141 plus the new M0 RNG foundation issue. Keep #142's full reusable Randomizer Engine scope intact.
3. Update #509 so the RNG/runtime authority boundary is owned by the new M0 RNG issue rather than #142. #142 is no longer an M0 sub-issue/completion gate.
4. Update #292 so Random Tag/team-rotation deterministic selection depends on the new M0 RNG primitive rather than the full #142 Randomizer Engine unless Random Tag later consumes first-class randomizer semantics.
5. During #511/M2 classification, audit other references to #142 and retarget consumers that only require deterministic random selection/shuffle to the M0 primitive.
6. Preserve #142 dependencies for true Randomizer Engine consumers such as Dice, Spinner, Wheel, Casting Lots, randomizer projections/presentation, and randomizer-specific integration APIs.
