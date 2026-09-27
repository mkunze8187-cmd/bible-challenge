# Journey / Campaign Development Guide

**Status:** Proposed STABLE developer guidance
**Architecture:** `specs/engines/journey-campaign-engine.md`

## Canonical Scripture campaigns
Use `narrativePolicy: CANONICAL` for campaigns reenacting recorded biblical history. Treat canonical checkpoints/outcomes as immutable authored content. Player performance may change score, challenge presentation and Challenge Aids, but never Scripture.

A code review should reject any canonical-campaign rule equivalent to `if score < X then biblicalEventDoesNotHappen`.

## Separate four concerns
1. **Narrative:** reviewed canonical checkpoints/references.
2. **Activity mechanic:** capability/template used at a checkpoint.
3. **Challenge content:** query/pool supplying questions; normally configurable independently of checkpoint subject.
4. **Outcome:** Score Ledger points plus optional gameplay-only aid grants.

This separation creates replayability without alternate history.

## Activity templates
Prefer Engine SDK capability composition over campaign-specific mini-game implementations. A checkpoint declares the capability/template it needs. Prepare Event/readiness verifies all required capabilities/content before play.

## Challenge Aids
Use `challenge.aid` for earned modifiers such as extra time, hints, distractor elimination or extra submissions. Themes may call an aid manna/provision/etc., but persistence/authority uses generic grants. Aids never mutate canonical progression. Accessibility accommodations are not aids.

## Content review
Canonical summaries, Scripture-event mappings and story-specific explanations require reviewed provenance. General challenge pools can reuse existing approved Agon content. Bible text remains provided through BibleTextService under translation licensing policy.

## Persistence
Pin campaign/content revisions needed to resume. Persist logical checkpoint/activity/aid state, not animation state. Canonical checkpoint history is append-only from the gameplay perspective; corrections to source content use content revision/migration processes.

## Reuse
Before adding a new biblical journey, determine whether it is content over `journey.campaign` rather than a new engine. Paths of Paul and similar geographic/chronological journeys should normally reuse this capability.