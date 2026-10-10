# Agon — Approved Cross-Game Design Principles

These principles govern **design, implementation and authored content** across Offline, Shared/LAN and Hosted, general and kids experiences. Specific approved game specs may specialize behavior but cannot silently violate global constraints.

## Absolute: no AI in the application
- **Agon must not embed, invoke, ship, depend upon or expose AI/ML/generative models or AI services in any application component**: game runtime, Admin, content creation tools, controllers, Host, Stage, installer, update mechanism, offline, LAN or Hosted service.
- No runtime AI-generated questions, dialogue, narratives, cases, clues, rules, scoring, judgments, opponents, hints, adaptive difficulty or decisions. No telemetry-driven AI profiling or remote inference. Do not introduce an optional AI feature or plugin.
- All game behavior must be **deterministic and reproducible** from versioned authored content, configuration, initial state, explicit inputs, and recorded/seeded random draws. Use seeded pseudorandom generators where variation is intended; persist seeds, draws as necessary, content versions, event order and replay inputs. Network scheduling must not change authoritative outcomes outside explicit approved ordering rules.
- **Development-time AI assistance is outside the shipped application**, but any resulting code, prose, question, artwork or content must be human-reviewed and committed as static/versioned assets before distribution. Never include an inference runtime or model-dependent build/deployment requirement.
- Flag any existing or proposed feature conflicting with this principle for explicit removal/redesign; do not assume legacy behavior is compliant.

## Game and platform invariants
- **No betting** in any Agon game.
- Maximum **four teams**, one to four players per team where team participation applies; mixed ages supported.
- Bible Challenge content difficulty follows the **individual Player Profile**. Mechanic/game difficulty is independent. Do not infer player ability, maintain ability scores or adapt challenges based on performance.
- Speed does not affect scoring unless an explicitly approved game spec says otherwise.
- Preserve Scripture chronology and canonical events; distinguish counterfactual gameplay simulations from the biblical account and return to canonical state where appropriate.
- Content, story variations, Scripture, cases and authored explanations are data-driven, versioned and pack-compatible; custom packs configure content, not executable new game engines.
- Offline, Shared/LAN and Hosted share the same authoritative gameplay contracts, permissions, scoring and semantics.
- No game requires a native controller: browser/PWA must remain functionally equivalent; native Android/iOS are optional enhancements only.
- Stage is presentation, controllers submit intents, and the runtime owns authoritative state. Keep secret/private projections restricted to their intended role.
- General-purpose mechanics belong in reusable engines/capabilities. Exodus or other games compose them with their own themes, content and tuning; do not duplicate capabilities merely because only one game currently uses them.

## Decision hierarchy
Accepted ADRs and these project-wide invariants govern architecture; game-specific approved specs define behavior; issues track scope and acceptance; implementation/tests must conform. If two approved sources conflict, **stop and request a decision** rather than silently choosing. Drafts and conversations do not override approved GitHub records.
