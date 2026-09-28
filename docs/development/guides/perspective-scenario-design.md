# Perspective Scenario Design Guide

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../../../specs/agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

## Purpose
Perspective Scenario is a reusable kids/activity capability for situations where the learner should consider an event from another person's point of view before choosing or discussing a response.

It is content-neutral. Scripture/theological meaning belongs to the consuming game/content profile.

## Core sequence
`Situation -> Perspective prompt -> Switch Places -> Response/action -> Authored feedback -> optional Scripture/application review`

Games may omit the first response question or use discussion mode, but the perspective switch must remain semantically represented rather than being only an animation.

## Authoring rules
- Scenarios are application content unless they directly reproduce a reviewed biblical event.
- Store character roles separately from character artwork/names so scenes can be reskinned/reused.
- Author more than one accepted response when multiple responses reasonably express the intended principle.
- Response evaluation and explanation are reviewed content, never runtime-generated moral judgments.
- Include enough context to distinguish accidents, intent and uncertainty when those distinctions matter.
- Do not use false dilemmas solely to force the intended answer.
- Older-child scenarios may be nuanced; preschool scenarios should have concrete, observable needs and clearly differentiated choices.

## Response model
Recommended response classifications are `APPROPRIATE`, `QUESTIONABLE`, and `CONTRARY_TO_PRINCIPLE`, with per-response or per-class explanation. These classifications describe the response within the authored scenario, not the child/player.

Never label the player as kind, selfish, proud, loving, disobedient, etc. based on a game response.

## Golden Rule profile
`As You Would` is the first major consumer. Its scenarios should explicitly distinguish Matthew 7:12 from reciprocity: choosing appropriate treatment is not contingent on the other person having treated the player well first, and the game must not promise that good treatment will be returned.

Recommended scenario categories: inclusion, sharing/turns, helping, mistakes, words, fairness, welcoming newcomers, disagreement, possessions/resources and responding after unfair treatment.

## Modes
- Picture Choice: short illustrated/narrated choices.
- Switch Places: full two-perspective interaction.
- Scene Detective: semantic hotspots launch scenarios from a larger scene.
- Discussion: Host/group discusses before authored feedback appears.
- Simultaneous Private Response: participants answer privately before reveal/discussion.
- Embedded Challenge: another orchestrator receives normalized objective completion/result events.

## Scoring
Perspective Scenario does not define virtue scores. Consuming games may score objective actions such as identifying a relevant hotspot, completing Scripture recall, or selecting a reviewed accepted response when appropriate. Do not expose `kindness`, `humility`, `love`, `faith`, `character`, or similar spiritual/moral meters.

## Accessibility
Every scene needs a semantic description of the situation and roles. Do not require facial-expression recognition, color, audio, animation or spatial viewpoint to understand the scenario. Perspective-switch animation needs a reduced-motion equivalent. Choices need text/narration alternatives and semantic focus order.

## Reuse
Potential future profiles include forgiveness, compassion, serving, friendship, loving your neighbor, conflict, sharing, honesty and encouragement. Each profile owns its Scripture references, learning objective, response content and explanations. The shared capability owns only scenario state and interaction mechanics.

## Content review checklist
Before release, verify:
1. Scripture references and quotations are correct for installed/licensed translation.
2. Application is clearly distinguished from Scripture.
3. Scenario contains sufficient context for its evaluation.
4. All reasonably acceptable authored choices are recognized.
5. Feedback evaluates the response, not the child.
6. No guaranteed reciprocity or prosperity implication is introduced.
7. Age level and reading load match the profile.
8. Accessibility description communicates all information required to answer.