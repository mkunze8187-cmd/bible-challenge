# Scripture Chain — Scripture Relationship Game Specification

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed
**Working title:** Scripture Chain (final title TBD)
**Players/teams:** 1–4, mode dependent
**Core purpose:** learn Scripture and strengthen Bible knowledge by discovering and explaining meaningful relationships between passages.

## 1. Design goals
- Make players explore how passages connect rather than answer isolated trivia.
- Support several game modes using one reusable Scripture Relationship Engine.
- Accept multiple biblically valid solutions instead of comparing against one fixed ordering.
- Keep relationship content reviewed/provenanced.
- Encourage reading passages in context through post-round review and optional passage viewing.
- Work with Agon's selected Bible translation while identifying relationships that depend on wording in a specific translation.

## 2. Scripture Relationship Engine

The engine is reusable platform/game infrastructure, not private logic inside Scripture Chain.

### Passage node
A node is a canonical Scripture passage reference and may be a verse or range, e.g. `John 3:16` or `Ephesians 2:8-9`.

```ts
interface ScripturePassageNode {
  nodeId: string;
  reference: CanonicalScriptureReference;
}
```

### Relationship edge

```ts
interface ScriptureRelationship {
  relationshipId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: ScriptureRelationshipType;
  traversal: 'BIDIRECTIONAL' | 'DIRECTIONAL';
  sourceRole?: string;
  targetRole?: string;
  title: string;
  explanation: string;
  difficulty: Difficulty;
  translationScope?: string[];
  provenance: ContentProvenance;
  reviewStatus: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'RETIRED';
}
```

Most relationships may be traversed bidirectionally. Directional semantic metadata is retained for relationships such as prophecy -> fulfillment even when a mode permits reverse traversal.

### Initial relationship taxonomy
- THEME_CONCEPT
- PERSON
- PLACE
- EVENT
- QUOTATION_ALLUSION
- PROPHECY_FULFILLMENT
- PROMISE_FULFILLMENT
- PARALLEL_ACCOUNT
- SHARED_WORDING
- CAUSE_RESULT
- CHRONOLOGY

Taxonomy is extensible through versioned content/schema. Host game configuration can permit all types or select one/more relationship types for a round/game.

`SHARED_WORDING` and any other wording-dependent relationship declares translation scope. Translation-neutral relationships should not be duplicated per translation.

## 3. Validation principles
1. Validate submitted adjacency/edges, not a hard-coded solution sequence.
2. Multiple valid solutions are accepted.
3. Only relationships allowed by the current game's relationship-type filter count.
4. Only published/approved relationships are used in ordinary play.
5. Directionality rules are honored when a mode requires semantic direction.
6. Puzzle generation analyzes solution space to avoid accidental impossible or excessively ambiguous puzzles outside configured tolerances.
7. Circular solutions normalize rotation; reversal is equivalent when all relevant edges are nondirectional for that puzzle.

## 4. Game configuration

```ts
interface ScriptureChainConfig {
  mode: ScriptureChainMode;
  difficulty: Difficulty;
  relationshipTypes: ScriptureRelationshipType[] | 'ALL';
  passageDisplayPolicy: 'REFERENCE_ONLY' | 'TEXT_ON_REQUEST' | 'TEXT_VISIBLE';
  textViewCost?: HintCostPolicy;
  timeLimitSeconds?: number;
  submissionLimit?: number;
  relationshipQuestionPolicy: 'OFF' | 'SOME_LINKS' | 'EVERY_LINK';
  hints: HintPolicy;
  playerMode: 'SOLO' | 'MULTIPLAYER';
}
```

Difficulty presets provide defaults, but Host configuration may override permitted options.

### Passage display
Default presentation is the Scripture reference. Depending on difficulty/configuration, hover/tap/button can reveal full passage text through BibleTextService. `TEXT_VISIBLE` shows it immediately. `REFERENCE_ONLY` disables text assistance during active solving. Post-round review can show/read passages subject to translation availability/licensing.

## 5. Modes

### 5.1 Next Link
Given a current passage and candidate passages, choose a valid passage that continues the chain. Multiple candidates may be valid only when intentionally configured; ordinary generated questions should have clear expected choice semantics.

### 5.2 Ordered Chain
Players receive a shuffled set of passage cards and arrange all cards so each adjacent pair has an allowed relationship. First and last passages do not need to relate.

### 5.3 Circular Chain
Arrange all supplied passages in a ring so every passage relates to both neighbors, including last -> first. Rotation is equivalent; reversal is equivalent unless directional semantics make it distinct.

### 5.4 Missing Link
Find/select a passage that validly connects two existing passages. Advanced variants may contain multiple missing nodes.

### 5.5 Broken Chain
Inspect an apparently completed chain, identify an invalid edge/node placement, and repair the chain.

### 5.6 Destination
Build/discover a valid route from a specified starting passage to a target passage. Multiple legitimate routes are accepted. Puzzle constraints may specify maximum links, relationship types or required concepts.

### 5.7 Relationship
Given two connected passages, identify why they are related. This can also appear as a secondary challenge after creating a link in other modes.

## 6. MVP and later modes
MVP implementation:
1. Next Link
2. Ordered Chain
3. Missing Link
4. Relationship secondary challenge
5. progressive hints
6. solo + simultaneous private multiplayer where applicable

Subsequent modes:
- Circular Chain
- Broken Chain
- Destination/shared graph

The engine supports all modes from the beginning without requiring all UIs in MVP.

## 7. Relationship-identification challenge
When configured, a successfully proposed link can trigger a multiple-choice question asking what relationship connects the passages. Distractors are selected from plausible relationship types/concepts appropriate to difficulty.

Correct identification earns additional points. An incorrect relationship answer does not necessarily invalidate the underlying valid Scripture link; scoring/policy distinguishes `VALID_LINK_WRONG_EXPLANATION` from `INVALID_LINK`.

Harder future variants may omit multiple choice, but typed theological explanations are not required for MVP because reliable automated evaluation is substantially harder.

## 8. Time and submissions
Rounds can use a time limit, submission limit, or both. These are the primary protection against brute-force rearrangement.

On submission:
- validate entire arrangement/path;
- return mode-appropriate feedback without unnecessarily revealing the solution while attempts remain;
- decrement submission allowance;
- finish when solved, submissions exhausted or timer expires.

Feedback granularity is difficulty/configurable so validation itself cannot be abused as an unlimited hint.

## 9. Hints
Progressive hints reduce frustration and can reduce score.

Possible levels:
1. relationship/theme hint;
2. identify a passage/card involved in a valid edge;
3. narrow candidate cards;
4. reveal relationship type;
5. reveal one valid adjacency/link.

Hint policy controls availability, number and score cost. Accessibility accommodations are not automatically treated as score-costing hints.

## 10. Scoring
Scoring is policy-driven and uses Score Ledger.

Potential components:
- completion/base score;
- valid-link/chain completion score;
- relationship-identification bonus;
- remaining-time bonus;
- first/early submission bonus where fair;
- hint deductions;
- submission-attempt deductions;
- difficulty multiplier.

Avoid rewarding speed in configurations where accessibility/input differences make it inappropriate. Multiplayer fairness policies apply.

## 11. Multiplayer
Support up to Agon's platform maximum of four players/teams where mode permits.

### Private simultaneous modes
Ordered Chain, Circular Chain, Missing Link and many Next Link rounds can give each player/team the same puzzle and collect answers privately through controllers. Other teams' arrangements/selections remain hidden until reveal or round completion.

### Reveal
After all submit or time expires, Stage reveals solutions/results together and explains valid/invalid relationships.

### Destination multiplayer
Can support either private race paths or a later shared-graph/alternating-turn variant. Shared graph rules must define claiming/blocking separately; MVP does not require competitive blocking.

### Solo
All core modes should support solo study/play where mechanically sensible.

## 12. Controller/UI
Passage cards use semantic InputActions and shared card/order controls.

Required interactions include:
- select card/reference;
- reorder/drag with accessible non-drag alternative;
- request passage text when policy permits;
- submit;
- choose relationship multiple-choice answer;
- request hint;
- inspect post-round passage/relationship.

Stage shows shared prompt/timer/progress and post-round review but never leaks private active arrangements before reveal.

## 13. Difficulty
Difficulty can influence:
- number of passages;
- relationship subtlety/edge difficulty;
- candidate/distractor similarity;
- passage-text assistance default;
- time/submission allowance;
- hints;
- relationship-identification frequency;
- number of possible valid paths;
- directional relationship requirements.

Difficulty is not solely a card-count setting.

## 14. Translation behavior
Canonical passage references and translation-neutral relationships are independent of selected translation. Passage text is obtained through BibleTextService.

A relationship with `translationScope` is eligible only when the selected translation satisfies it. Readiness/puzzle generation excludes unavailable relationships rather than failing mid-round.

Translation licensing/caching/display follows the Bible translation/package architecture; relationship content must not embed copyrighted passage text merely to bypass provider/package restrictions.

## 15. Content authoring and review
Relationships are content records governed by Agon's provenance/review lifecycle. AI/tooling may suggest candidate relationships for an author, but suggestions are not published automatically.

Authoring UI/tooling should support:
- choose source/target passage;
- relationship type;
- directional roles;
- concise relationship title;
- explanation;
- difficulty;
- translation scope if wording-dependent;
- provenance/source/editor notes;
- review/approval;
- duplicate/conflict detection;
- graph visualization/coverage analysis.

## 16. Puzzle generation
Generator takes mode, difficulty, allowed relationship types, passage count/length, translation capabilities and solution-space constraints.

It must be deterministic under Agon's RNG service when used in an authoritative session. Generated puzzle definition is persisted/replayable.

Generation checks:
- all required edges exist and are approved;
- at least one valid solution;
- intended solution-space tolerance;
- no ineligible translation-dependent edge;
- candidate/distractor quality;
- no duplicate passages unless explicitly permitted;
- mode-specific topology (path/ring/bridge/etc.).

## 17. Post-round review / Dig Deeper
Post-round review is a central learning feature.

Show the completed valid chain/graph and each relationship explanation. Allow passage text/context viewing through BibleTextService. Highlight alternate valid solutions where useful rather than telling a player a valid alternate was "wrong."

Optional Dig Deeper material can provide:
- passages to read together;
- relationship summary;
- reviewed discussion questions;
- related passages/concepts.

The review should encourage reading context, not present isolated verse matching as complete interpretation.

## 18. Persistence/replay
Persist game config, puzzle definition/node IDs, eligible relationship IDs/revisions, RNG seed/state as required, submissions, hints, timer state, scores and selected translation/capabilities needed to resume/review deterministically.

Published relationship revisions used by a saved session are pinned according to content/package persistence policy.

## 19. Packaging
The game module can be packaged independently from relationship content packs. Relationship datasets may be Core or optional content packages. Game readiness requires sufficient approved relationship content for selected mode/type/difficulty/translation.

This allows future themed relationship packs without changing game code.

## 20. Accessibility
- all card ordering has keyboard/controller alternative to drag;
- reference/text view is screen-reader accessible;
- relationship graph/ring has equivalent ordered textual representation;
- no color-only relationship distinction;
- timers respect platform accessibility policies/accommodations;
- hover-only text access is prohibited: hover may be supported on desktop but an explicit focus/tap/button action is always available;
- Stage animations respect Reduced Motion.

## 21. Documentation
GameDefinition must provide How to Play, Quick Start and Host notes. Documentation explains each enabled mode, relationship filters, passage-text assistance, hints, submission/time limits, scoring and review.

Relationship Engine developer documentation describes node/edge schema, validation, generator contracts, translation scope and content-review requirements.

## 22. Testing
Tests include:
- bidirectional/directional edge traversal;
- relationship-type filtering;
- multiple valid ordered solutions;
- circular rotation/reversal normalization;
- missing-link multiple-valid-answer case;
- translation-scoped relationship eligibility;
- deterministic puzzle generation;
- impossible/over-ambiguous puzzle rejection;
- time/submission exhaustion;
- hint progression/scoring;
- valid link + wrong relationship explanation scoring;
- 1–4 player private-answer projection leak tests;
- save/resume/replay;
- accessibility ordering alternative;
- post-round alternate-solution review.

## 23. Definition of done
The game demonstrates that one reviewed Scripture relationship graph can safely power multiple learning modes; accepts legitimate alternate solutions; remains translation/provider agnostic; works solo and multiplayer; provides frustration-reducing hints and meaningful post-round review; and reuses Agon's engines, content, scoring, controllers, persistence, packaging and documentation foundations.