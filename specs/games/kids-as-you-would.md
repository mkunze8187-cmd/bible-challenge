# As You Would

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed
**Working title:** As You Would
**Audience:** Preschool (3–5), Kids (6–10), Family/Group
**Catalog role:** Kids Scripture experience / scenario-based challenge game
**Primary Scripture:** Matthew 7:12
**Related Scripture:** Luke 6:31 and other reviewed supporting passages

## Purpose
Teach and practice the principle commonly called the Golden Rule by helping children consider another person's perspective and connect that perspective to how they choose to treat others.

The core gameplay is not merely identifying whether an action is "nice" or "mean." The distinctive loop is:

**See the situation -> Switch perspective -> Consider how you would want to be treated -> Choose how to act -> Review the Scripture connection.**

The game follows Agon's kids pattern: **Hear it -> Play it -> Say it -> Take it Home**.

## Scripture/content guardrails
- Scripture text is supplied through BibleTextService and is visually/semantically distinguished from explanatory/application content.
- Invented scenarios are labeled application, not biblical events.
- Do not invent quotations for Jesus or biblical characters and present them as Scripture.
- The Golden Rule is not represented as a promise that others will reciprocate good treatment.
- Do not teach a karma/reward loop such as "be kind so people will be kind to you."
- Game score measures objective gameplay only, not kindness, love, character, obedience, or spiritual worth.
- Multiple appropriate responses may be accepted where the scenario reasonably permits them.

## Implementation shape
Do not create a Golden Rule-specific engine.

Implement the game as the first major consumer of a reusable **Perspective Scenario** activity/challenge contract. The game may reuse Challenge, Choice/Classification, Matching/Ordering where useful, Stage, InputActions, Score Ledger, BibleTextService and optional Journey/Board presentation primitives.

## Core round
1. Present an illustrated or narrated social situation.
2. Identify/focus the person affected by the situation.
3. Ask the player to consider the scene from that person's perspective.
4. Optionally ask: "How would you want to be treated?" using age-appropriate picture/text choices.
5. Animate/perform **Switch Places**, changing the viewpoint/role.
6. Ask what the acting character could do.
7. Evaluate against a reviewed response set that may contain multiple acceptable responses.
8. Show concise explanatory feedback and, where configured, the Scripture connection.
9. Continue to the next scenario or activity.

## Perspective Scenario contract
```ts
interface PerspectiveScenarioDefinition {
  scenarioId: string;
  ageProfiles: string[];
  setting: ScenarioSetting;
  characters: ScenarioCharacter[];
  initialPerspectiveRoleId: string;
  actingRoleId: string;
  situation: LocalizedApplicationContent;
  perspectivePrompt?: ScenarioPrompt;
  desiredTreatmentResponses?: ScenarioResponse[];
  actionPrompt: ScenarioPrompt;
  actionResponses: ScenarioResponse[];
  explanation: LocalizedApplicationContent;
  scriptureConnections: ScriptureReference[];
  tags: string[];
  accessibility?: ScenarioAccessibilityMetadata;
}

interface ScenarioResponse {
  responseId: string;
  presentation: LocalizedApplicationContent;
  evaluation: 'APPROPRIATE' | 'QUESTIONABLE' | 'CONTRARY_TO_PRINCIPLE';
  explanation?: LocalizedApplicationContent;
  acceptedForCompletion?: boolean;
}
```

The reusable contract should support more than three response choices and multiple accepted answers. Evaluations are authored/reviewed content, not generated moral judgments at runtime.

## Reusable Perspective Scenario capability
The reusable activity should provide:
- role/perspective assignment;
- private/public scenario information where needed;
- perspective-switch transition;
- picture/text/audio prompts;
- one or multiple acceptable responses;
- authored explanation per response or response class;
- normalized outcome events for embedding;
- optional discussion mode with no automatic answer reveal until Host continues;
- deterministic scenario selection when seeded;
- save/resume at scenario step;
- age/accessibility presentation variants.

Potential future consumers include forgiveness, compassion, serving, friendship, loving your neighbor, conflict, sharing, honesty and encouragement games/content. A future consumer must define its own Scripture/content profile rather than inheriting Golden Rule theology from the generic capability.

## Modes
### 1. Picture Choices — Preschool 3–5
Use large illustrated scenes and 2–3 clear choices. Narration is available. Situations should be concrete and familiar: sharing toys, dropped crayons, taking turns, helping after a fall, welcoming someone into play, accidentally knocking over blocks.

No timer by default. Feedback is brief and concrete.

### 2. Switch Places — Core mode
The full two-perspective loop. The Stage visibly changes viewpoint/character focus after the player considers desired treatment.

### 3. Golden Rule Detective — Kids 6–10
Present a larger scene such as playground, classroom, church, lunchroom, park or neighborhood with several interactions. Players identify an interaction worth examining, then enter a Perspective Scenario round.

Scene hotspots are semantic authored objects, not pixel-only targets. Randomized scenario subsets increase replayability.

### 4. Circle / What Comes Around — Cooperative demonstration
Arrange participants/characters in a circle or chain. Each scenario connects one person's action to another person's experience so everyone is shown as both an actor and recipient across the activity.

This mode exists to demonstrate perspective/interdependence. It MUST NOT imply that good actions guarantee equivalent treatment in return.

### 5. Family / Group Discussion
Host presents a scenario and participants discuss possible responses before revealing authored feedback. Multiple appropriate ideas can be recognized. Host may advance without ranking participants.

### 6. Quick Challenge
A compact Perspective Scenario can be embedded in Gauntlet, Journey, Board Play or another compatible game. The host receives a normalized objective completion/result; spiritual-character labels are never returned.

## Scenario content categories
Initial reviewed scenario library should cover age-appropriate examples such as:
- inclusion / someone left out;
- sharing and taking turns;
- helping someone who needs assistance;
- accidental harm/mistakes;
- words that encourage or hurt;
- fairness;
- welcoming someone new;
- disagreement/conflict;
- possessions/resources;
- responding when another person treated you unfairly.

The last category is important: the principle is not simple reciprocity. Scenarios should progressively demonstrate choosing appropriate treatment even when the other person did not first treat you that way.

## Difficulty progression
### Preschool
Concrete visible needs; clearly differentiated choices; picture/audio support.

### Early kids
Simple perspective questions plus several plausible choices.

### Older kids
More nuanced contexts, multiple acceptable responses, accidental versus intentional behavior, conflict, unfair treatment and situations requiring explanation.

Difficulty increases ambiguity/reasoning, not moral harshness.

## Scoring
Recommended defaults:
- Preschool: completion/progress celebration without ranking.
- Kids: optional objective points for identifying relevant situations, Scripture recall, matching/ordering, or selecting an appropriate response from authored choices.
- Discussion mode: no response score required.

Never display a `Kindness`, `Golden Rule`, `Love`, `Character` or equivalent virtue score.

## Multiplayer
Primary multiplayer profile is cooperative/family. Players may alternate scenarios or jointly discuss them.

Competitive variants may score objective mechanics such as finding scenario hotspots or Scripture challenges, but must not rank which child is "kinder" or more obedient.

For 1–4 teams, the Stage may present a common scenario while controllers submit private choices before simultaneous reveal/discussion. This can reuse Agon's simultaneous-private-response participation capability.

## Stage presentation
The Stage should make perspective change visually understandable. Options include:
- camera/focus shift from one character to another;
- character positions swapping sides;
- highlighted role frame/avatar changing;
- a "Switch Places" transition;
- split-screen before/after perspective.

The visual effect is presentation only. Semantic role IDs and scenario state remain authoritative.

## Accessibility
- never rely solely on facial expression, color, or visual perspective to communicate the situation;
- provide text/narration descriptions of relevant context;
- large-target mode;
- keyboard/controller/switch navigation;
- reduced-motion perspective transition;
- captions/text alternatives for audio;
- configurable reading/review time;
- scenario meaning must remain available when animation is disabled.

## Learning flow
### Hear it
Present Matthew 7:12 using the selected licensed/installed Bible translation. Luke 6:31 may be included as reviewed related Scripture.

### Play it
Use Perspective Scenarios and Switch Places to practice considering how the other person would want to be treated and choosing an appropriate action.

### Say it
Age-appropriate reference/verse reinforcement: repeat, assemble, complete or identify the selected verse according to profile/difficulty.

### Take it Home
Provide a family prompt such as looking for an opportunity to consider another person's perspective and treat them accordingly. Parent material should explain that the activity is application of the passage, not an additional biblical narrative.

## Help / parent guide
Explain:
- the Golden Rule passage and reference;
- why the game uses perspective-taking;
- that several responses can appropriately express the principle;
- that the game does not teach guaranteed reciprocity;
- the distinction between Scripture and illustrative scenarios;
- suggested family discussion questions.

## Packaging
The game pack should primarily contain:
- GameDefinition;
- Perspective Scenario definitions/content;
- scene/character artwork and audio;
- Scripture/content profile;
- rules/help/Dig Deeper material;
- dependency manifest.

Reusable Perspective Scenario runtime belongs in shared capabilities, not the game pack.

## Acceptance criteria
- Preschool 3–5, Kids 6–10 and Family profiles;
- at least 20 reviewed initial scenarios across multiple categories;
- full Switch Places two-perspective loop;
- multiple acceptable responses supported;
- Golden Rule Detective scene with semantic hotspots;
- cooperative/group discussion mode;
- optional simultaneous private response for compatible multiplayer;
- no virtue/spiritual scoring;
- no guaranteed-reciprocity framing;
- BibleTextService integration;
- Scripture/Explanation/Application content distinction;
- Hear it -> Play it -> Say it -> Take it Home;
- accessible/nonvisual scenario description and reduced-motion support;
- save/resume and deterministic scenario selection;
- embeddable Perspective Scenario challenge adapter.