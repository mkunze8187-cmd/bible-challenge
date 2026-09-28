# Bible Story Journey Design Guide

## Purpose
A Bible Story Journey is a declarative Kids Story Activity composition for biblical narratives that naturally progress through multiple scenes, places or phases. It is not a separate gameplay engine.

Use it when a story benefits from persistent visual progression and several different reusable activities. Prefer a normal single challenge/game when the concept has one dominant mechanic.

## Structure
`Intro Scripture -> Checkpoint -> Activity -> Checkpoint -> Activity ... -> Canonical conclusion -> Review -> Say It -> Take It Home`

Checkpoints may use geographic maps, timelines, paths, repeated-day displays or abstract progress presentations.

## Canonical-event rule
A recorded biblical event is never conditional on player success. Activities can affect score, hints, presentation, optional review and challenge outcomes, but cannot rewrite Scripture. If a player misses an activity, the journey still reaches the next canonical checkpoint through retry/review/host policy.

## Theme/evidence markers
Journeys may collect semantic markers that are reviewed at the end, such as Joseph's event/providence threads, Abraham's promise markers, or Saul's before/after evidence. Markers are learning aids, not spiritual currencies and should not imply the player earned God's action.

## Reuse before creation
Before defining a new GameId:
1. search the game catalog and migration audit for the same story/theme;
2. determine whether the idea is a profile/variant of an existing game;
3. reuse Kids Story Activity, Journey/Campaign, Board, Image Board, Ordering, Perspective Scenario, Scripture Relationship, Challenge and other shared capabilities;
4. create a new executable engine only when an independently reusable mechanic cannot be represented by existing contracts.

A story may legitimately have multiple experiences when their dominant mechanics/audiences differ—for example a preschool Joseph pattern game and an older-kids Joseph narrative journey—but they should share content/assets/capabilities where practical.

## Multiplayer
Canonical story progression is shared/synchronized. Teams may earn their own objective challenge scores while all participants move through the same Scripture checkpoints at the same pace. Some embedded activities may be head-to-head and others individual/cooperative; the journey orchestrator normalizes their outcomes without branching canonical history.

## Content guidance
- BibleTextService owns Scripture text/translation access.
- Clearly label Scripture vs explanation vs application.
- Do not invent quotations for biblical figures and present them as Scripture.
- Avoid unsupported specificity when the biblical text does not supply it.
- If combining passages, retain references/provenance.
- Application scenarios happen outside the canonical story unless the interaction simply observes/reconstructs what Scripture records.

## Kids spiritual-scoring rule
Never score or meter faith, repentance, prayer quality, forgiveness, salvation, grace, God's favor or spiritual worth. Objective game performance can be scored.

## Authoring checklist
Each journey definition should specify:
- primary/related passages;
- audience/age profile;
- learning emphasis;
- canonical checkpoint order;
- Stage presentation type;
- reusable activities at each checkpoint;
- optional theme/evidence markers;
- retry/review behavior;
- Scripture/Explanation/Application content types;
- help/parent/Dig Deeper content;
- accessibility descriptions and reduced-motion equivalents;
- save/resume boundaries;
- multiplayer participation policy;
- package dependencies;
- biblical/content QA status.