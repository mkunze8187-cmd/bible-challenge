# Shared game implementation across standalone and Journey launch contexts
Status: approved **dual-launch principle**, proposed detailed API/lifecycle design requiring contract review. Existing Journey engine #458 and composition #460 remain owners; this document refines rather than duplicates them.

## Rule
A complete eligible game/checkpoint has **one game implementation and stable identity**, usable both as an independently selected experience and an authored Journey checkpoint. Not every internal reusable capability or tiny Journey activity must appear as a standalone catalog entry. Major checkpoints may be individually selectable. A Journey Game Pack and individual game packs use the existing .agonpack resolver; do not create separate installers or pack schemas.

## Launch-context adapter (conceptual)
Launch context declares standalone/Journey (and Event when supported), game definition/version, calling session/checkpoint, participant and role scope, active compatible pack set, profile/translation/content settings, allowed configuration overrides, narrative entry/exit assets, return destination, and completion/result contract. Shared runtime owns gameplay authority, controller intents, privacy and deterministic state; context adapters own surrounding narrative and orchestration, **not alternate gameplay rules**.

Standalone launch supplies self-contained introduction and conclusion and independent session/save. Journey launch supplies canonical continuity, shared participant context, one JourneyProgress and return to next authored checkpoint; completion reports only the game-defined results/participation/review references (score optional). Canonical outcomes never diverge due to player choices. Save/resume preserves child game state and parent Journey linkage, pinned pack versions, input/event ordering and launch context. Failure/readiness diagnostics before start for missing entitled capabilities or incompatible schema/data; bundled KJV fallback only when compatible and clearly identified.

## Contract questions for implementation review
Exact typed launch/result APIs, interruption/abandonment semantics, override precedence, nested save transaction boundaries, event integration, pack dependency encoding and standalone catalog eligibility declarations require contract approval. Do not invent an incompatible alternative to existing #458/#460 or existing Game Data Pack architecture.
