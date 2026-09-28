# Kids Story Activity Expansion

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed
**Audience:** Preschool 3–5, Kids 6–10, Family/Group

## Purpose
Adapt classroom-game themes around Zacchaeus, David and Goliath, the Good Samaritan, Feeding the 5,000, Creation and Jonah into Agon without multiplying duplicate GameIds or engines.

The default architecture is **story/content + reusable activity sequence + artwork/audio + configuration**. New standalone GameIds are created only when the player-facing rules and learning objective justify them.

All experiences follow **Hear it -> Play it -> Say it -> Take it Home** and preserve canonical Scripture events: gameplay may affect score, presentation, attempts and application activities, never whether a recorded biblical event occurs.

## Duplicate/consolidation audit
Repository issue search identified existing overlapping definitions:

| Theme | Existing work | Decision |
|---|---|---|
| Zacchaeus | #254 `Who's in the Story?` already includes a Zacchaeus crowd-scene/search round; #246 may use Zacchaeus as Bible lookup content | **Do not duplicate.** New Zacchaeus experience composes #254 as one activity and adds distinct story/change/restoration activities. |
| David & Goliath | #473 `David and Goliath: Five Stones` already defines a themed Gauntlet profile; #242 uses the story as ordering content | **Merge into #473.** Do not create a second Five Stones GameId. Add optional kids profile/target activity to the existing definition. |
| Creation | #236 `Let There Be…`, #261 `Who Did God Make?`, and #242 Creation ordering already cover the proposed stations | **Consolidate, do not create `In the Beginning` as another GameId.** Treat the panorama/stations idea as a presentation/composition profile joining existing Creation activities. |
| Jonah | #242 already contains Jonah story ordering; #247 can contain Jonah correction content; Bible Map #23 can cover geography | **No duplicate quiz/order game.** Add a Jonah story-experience/profile that composes existing activities and adds only genuinely distinct direction/route/story progression. |
| Good Samaritan | no matching existing issue found | New thematic Scripture experience, primarily Perspective Scenario + story/application sequence. |
| Feeding 5,000 | no matching existing issue found | New themed activity/content profile; first consumer of reusable Distribution Puzzle if no equivalent capability exists. |

Before implementation, the definitive catalog/migration audit (#304/#331) remains authoritative; if it reveals an additional equivalent GameDefinition, implementation must merge/overlay rather than duplicate.

---

# Kids Activity Sequence / Story Experience

## Architectural pattern
A Kids Story Experience is a declarative sequence of reusable activities around reviewed Scripture content. It is not a new general-purpose engine if Journey/activity orchestration already provides the required sequencing.

```text
Scripture / Story Scene
        |
Reusable Activity
  +-----+------+------+------+------+
  |     |      |      |      |      |
Search Match Ordering Perspective Target Distribution
  |     |      |      |      |      |
        Story / Review
             |
        Memory Verse
             |
         Dig Deeper
```

Use existing Journey/progression/activity orchestration first. Introduce only missing reusable activity capabilities.

---

# Zacchaeus: Come Down!

**Scripture:** Luke 19:1–10
**Shape:** Kids Story Experience / activity composition, not a replacement for #254.

## Learning focus
Observe the text, Jesus' initiative toward Zacchaeus, Zacchaeus' response/change, generosity/restoration, and application. Preserve narrative order; player actions do not earn Jesus' attention or acceptance.

## Activity sequence
1. **Hear it:** selected Luke 19 passage through BibleTextService.
2. **Find Zacchaeus:** reuse/embed the Zacchaeus content from #254 `Who's in the Story?`; identify him using text clues and the sycamore/tree scene.
3. **Jesus Calls Zacchaeus:** canonical story scene; not a success/failure gate.
4. **What Changed?:** matching/classification/ordering activity comparing observed actions before/after the encounter.
5. **Make It Right:** restoration/application puzzle. Identify who/what was affected and what action restores what is owed according to authored scenario rules. For older children this may include age-appropriate arithmetic.
6. **Say it / Take it Home:** reviewed memory/reference and parent discussion.

## Restoration activity guardrails
The generic mechanic may model objective restoration/restitution puzzles but must not calculate repentance, forgiveness, salvation or spiritual worth. Application scenarios are labeled separately from Scripture.

---

# David and Goliath: Five Stones — Kids Profile

**Scripture:** 1 Samuel 17
**Decision:** extend existing #473; no new GameId.

The existing Five Stones Gauntlet remains the canonical implementation direction. Add a Kids profile that can use age-appropriate challenge stages and an optional reusable Target activity as presentation/play payoff.

## Target activity
A generic `target.challenge` activity may support timing/aim/placement interactions with large-target preschool mode and optional angle/power/timing for older kids. It is reusable for nonviolent toss/placement activities as well.

For David and Goliath, the target activity is a playful reenactment/presentation after Scripture/challenges. It never implies David's victory depended on the player's arcade skill, and violence/gore are not depicted.

# Good Samaritan: Who Is My Neighbor?

**Scripture:** Luke 10:25–37
**Shape:** Kids Scripture Experience / Perspective Scenario consumer.

## Core sequence
1. Hear/read the parable faithfully.
2. Observe/identify who stopped and helped using objective story activities.
3. Review Jesus' neighbor question/conclusion from the passage.
4. Move into clearly labeled **Application** Perspective Scenarios: playground, classroom, church, neighborhood, family, newcomer, injured/upset child, etc.
5. Switch perspective: what might you hope someone appropriately does if you were the person needing help?
6. Choose/discuss possible neighborly actions; allow multiple reviewed appropriate responses.
7. Say it / Take it Home.

The player does not rewrite which characters helped in the parable. Competitive scoring is limited to objective challenge mechanics; compassion/love are not scored traits.

# Loaves & Fishes — Sharing / Distribution Activity

**Scripture:** Mark 6:30–44 and/or John 6:1–14 according to reviewed content profile.
**Shape:** themed kids activity/content profile, not a simulation of causing the miracle.

## Canonical boundary
Present the biblical event first/as recorded. Player distribution puzzles are application/math activities and must not imply the miracle succeeds because children divided resources correctly.

## Distribution Puzzle capability
Audit existing engines first. If no equivalent exists, implement reusable `distribution.puzzle` supporting:
- source item pools;
- recipients/containers;
- equal distribution;
- authored per-recipient requirements;
- grouping/counting;
- optional fractions for older profiles;
- fair-vs-equal authored puzzles where context is explicit;
- drag/drop, tap-to-assign and accessible non-drag controls;
- validation with multiple valid distributions;
- deterministic layouts;
- save/resume;
- normalized completion/outcome event for embedding.

Preschool example: place one illustrated item on each plate. Older-child examples can use counting/grouping without presenting the miracle as arithmetic.

# Creation — Consolidated Activity Profile

**Scripture:** Genesis 1:1–2:3
**Decision:** no new Creation GameId.

The proposed seven-station/panorama concept becomes a **Creation composition/presentation profile** over existing work:
- #236 `Let There Be…` supplies narrated day-by-day/host-driven experience;
- #261 `Who Did God Make?` supplies day/content identification;
- #242 `What Happened Next?` supplies ordering/sequencing where appropriate;
- shared Matching/Classification/Ordering activities provide other station interactions.

## Panorama presentation
As each reviewed activity/day completes, Stage adds the corresponding visual layer to a cumulative Creation panorama. Reduced-motion mode reveals layers without animation. Artwork is illustrative and must not be confused with exact Scripture detail.

This is an overlay/composition profile, not a fourth Creation implementation.

# Jonah: Turn Around — Story Profile

**Scripture:** Jonah 1–4
**Shape:** Kids Story Experience/profile; reuse existing story/order/map capabilities.

## Scope
Do not create another Jonah ordering/trivia GameId. Compose:
- #242 `What Happened Next?` for story ordering;
- Bible Map/Image Board capabilities (#23/#280–#286) when geography/route interaction is useful;
- existing Challenge/Matching/Ordering activities;
- Journey/progression presentation for story sequence.

Add a distinct **direction/route contrast** activity where reviewed content shows God's instruction and Jonah's attempted travel direction. This is text/geography observation, not a mechanic that changes the canonical story.

The experience continues through Jonah 4 rather than ending at the fish. Content should address Nineveh, Jonah's response, and God's concluding concern/question according to the text.

Avoid mechanics where saying a prayer/apology is a token that automatically releases Jonah/the player from the fish.

---

# Reusable capability decisions

## Perspective Scenario
Reuse the capability planned by #487 for Good Samaritan application scenarios. Do not create a Samaritan-specific choice engine.

## Target Challenge
Audit existing toss/aim/timing interactions before extraction. If none exists, create a small generic activity capability. It should be optional for #473 and reusable elsewhere.

## Distribution Puzzle
Audit existing allocation/sorting mechanics before extraction. Prefer extending a sufficiently general existing capability; otherwise add `distribution.puzzle`.

## Restoration Puzzle
First attempt to express Make It Right with existing Matching/Distribution/Classification/math challenge primitives. Extract a generic restoration activity only after at least two consumers demonstrate genuinely shared behavior.

## Story/activity composition
Use Journey/progression and GameDefinition composition rather than creating a parallel Kids Story Engine unless an implementation spike proves a missing orchestration contract.

# Packaging
These experiences should be lightweight packs/definitions containing Scripture references/content profiles, activity sequence definitions, scene/art/audio assets, application content, parent/host help and dependency manifests. Shared executable mechanics remain platform capabilities.

# Acceptance / governance
- no duplicate GameId where an existing definition/profile already owns the experience;
- #304/#331 catalog audit checked before implementation;
- every activity declares existing capability dependencies;
- new reusable capability requires documented gap analysis;
- Scripture, Explanation and Application content are distinguishable;
- canonical outcomes never depend on player success;
- 3–5 and 6–10 profiles where appropriate;
- accessibility and reduced-motion support;
- Hear it -> Play it -> Say it -> Take it Home;
- help/Dig Deeper content and Scripture references;
- objective gameplay scores only, never spiritual-character scores.