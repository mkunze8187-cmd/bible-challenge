# Kids Games: Two by Two & Come Like a Child

**Status:** Proposed
**Audience profiles:** Preschool (3–5), Kids (6–10), Family

## Shared kids-game principles
Both games follow Agon's kids-learning pattern: **Hear it -> Play it -> Say it -> Take it Home**.

- Hear it: show/read the relevant Scripture or an age-appropriate excerpt through BibleTextService; do not paraphrase Scripture as though it were the biblical text.
- Play it: the mechanic reinforces a concrete idea from the passage.
- Say it: short memory-verse/reference reinforcement appropriate to the age profile.
- Take it Home: optional Dig Deeper card for parent/family discussion.
- Accessibility accommodations are never earned rewards or penalties.
- Failure should invite another attempt rather than shame or imply spiritual failure.
- Scores/stars measure game performance only, never faith, humility, obedience, God's favor, or spiritual worth.

---

# 1. Two by Two

## Concept
A Noah's Ark memory/matching game. Players find matching animal pairs; completed pairs visually move to/appear aboard the ark. The primary gameplay is Concentration-style memory matching, with variants suitable for preschool and older children.

## Scripture grounding
Primary narrative content: Genesis 6–9, with exact references/content selected and reviewed before release. The game should teach the biblical account without implying that the player's matching determines whether God's recorded plan succeeds.

## Implementation shape
**Catalog role:** Kids quick game / embeddable challenge candidate
**Primary capability:** reusable `matching.memory` capability (or existing matching capability extended with hidden/reveal state if already sufficient)
**Consumes:** Card/Tile presentation, Score, Timer optional, BibleTextService, Stage/InputActions, Audio optional

The Noah theme MUST remain content/presentation over a reusable matching mechanic. Do not implement a Noah-specific matching engine.

## Core loop
1. Present a grid of face-down animal tiles/cards.
2. Active player selects first tile; reveal it.
3. Player selects second tile; reveal it.
4. If pair identity matches, mark both as matched and animate/place the pair aboard the ark.
5. If not, allow a short review period and return them face-down.
6. Continue until all configured pairs are found or the selected round condition ends.

## Modes
### Preschool / Discovery (3–5)
- fewer pairs;
- large images and large targets;
- optional cards initially face-up before hiding;
- optional visual silhouettes/hints for remaining animals;
- no punitive timer by default;
- optional spoken animal names and sounds;
- can match image-to-image, image-to-silhouette, or animal-to-sound where accessible equivalents exist.

### Classic Memory
Traditional face-down pair matching with configurable pair count/grid size.

### Team / Family
Players or teams alternate turns. Configurable policy:
- matched pair grants another turn; or
- always rotate after two selections.

### Cooperative Ark
All participants share the goal of finding every pair. Track group attempts/time only if enabled. Avoid a threatening 'animals fail to reach the ark' theological framing.

### Challenge embedding
`matching.memory` can be launched by Gauntlet, Journey, Board Play, Kids activities, etc. The host game receives normalized completion/score/attempt outcomes.

## Optional rain presentation
A rain/cloud visual may indicate elapsed attempts/time in older difficulty profiles, but it MUST NOT imply players can cause the biblical Flood outcome to change or that unmatched animals are canonically left behind. Preschool default should omit pressure presentation.

## Content model
```yaml
gameId: kids.two-by-two
matchingProfile:
  identityMode: PAIR
  revealMode: HIDDEN
  pairCount: 6
  matchPolicy: SAME_CONTENT_ID
  onMatch: arkBoard.placePair
contentPool: noah.animals.reviewed
```

Animal art/content should avoid presenting speculative species detail as explicit biblical fact. Help/Dig Deeper can distinguish Scripture from artistic representation.

## Scoring
Configurable: pairs found, attempts efficiency, completion time for older profiles, team contribution, or cooperative completion. Preschool can use celebration/progress without numeric ranking.

## Presentation
- ark visible as destination/progress presentation;
- each match produces a brief animal-pair movement/placement animation;
- reduced-motion mode places the pair immediately;
- completed pairs remain visibly/semantically accounted for;
- Stage suitable for projector/family display; controller selection can be local/phone where configured.

## Accessibility
- animal identity never relies solely on color;
- text/spoken animal names available;
- sound-matching has visual/text alternative;
- large-target mode;
- reduced motion;
- configurable reveal duration;
- keyboard/switch/controller navigation through semantic tile IDs.

## Learning flow
**Hear it:** selected reviewed Noah passage/reference.
**Play it:** find animals in pairs.
**Say it:** short selected verse/reference appropriate to profile.
**Take it Home:** discuss what the passage says about Noah, the animals, God's instructions/covenant according to selected content.

---

# 2. Come Like a Child

## Concept
A gentle Scripture-learning/progression game centered on Luke 18:15–17, especially Jesus' teaching about receiving the kingdom of God like a child. The gameplay emphasizes **humble dependence, trust, receiving, listening and coming to Jesus without status or self-sufficiency as the basis of acceptance**.

The game is not merely 'remove barriers so children can reach Jesus.' Its central teaching design is the childlike posture highlighted in the passage.

## Scripture/theological guardrails
- Jesus is not an unlockable prize.
- Players do not earn permission to come to Jesus.
- Humility, faith or God's blessing are not currencies, meters, scores or power-ups.
- Wrong choices do not mean a child is rejected by Jesus.
- Do not place invented quotations in Jesus' mouth.
- Distinguish exact Scripture from explanatory/application material.
- Application prompts should be reviewed and age-appropriate.

## Implementation shape
**Catalog role:** Kids Scripture experience / thematic progression composite
**Primary orchestration:** Journey/progression or lightweight activity sequence; reuse Board Play path primitives only if useful
**Consumes:** Challenge/choice activities, Ordering/Matching where useful, BibleTextService, Timer optional, Score optional, Stage/InputActions

Do not create a new engine solely for this game. Individual activities should be reusable activity/challenge definitions where possible.

## Core structure
A short sequence of child-friendly stations. The path represents learning/application progression, not spiritual distance from Jesus. The final scene is a Scripture-centered welcome/blessing presentation and review, not a reward earned by accumulating virtue points.

### Station family: Ask for Help
Present a simple situation where progress requires accepting/asking for appropriate help instead of selecting a boastful self-sufficient approach. Feedback explains the application connection without claiming the invented scenario is Scripture.

### Station family: Trust / Follow
Simple sequence/path/listening activity where the child follows given guidance. Success measures attention/gameplay, not amount of faith.

### Station family: Open Hands / Receive
A sorting or choice activity contrasting receiving a gift/help with trying to prove worth or status. Avoid mechanically requiring children to discard possessions as though Luke 18:16 teaches poverty; that belongs to different passages/context.

### Station family: Listen
Short Scripture listening/ordering/completion activity. The game reinforces willingness to hear and receive Jesus' words.

### Station family: Simple Prayer
Offer age-appropriate prayer prompts such as help, thanks, confession or trust as optional reflective/application moments. Never score prayer choices or claim one wording causes a spiritual effect.

### Station family: Come / Welcome
Conclude with the actual passage/reference and a warm Stage presentation showing children coming to Jesus. No final skill gate blocks access to the conclusion.

## Difficulty / age profiles
### Preschool (3–5)
- 3–4 very short stations;
- picture choices, matching, simple following/listening;
- narration;
- no timer by default;
- adult co-play encouraged.

### Kids (6–10)
- 4–6 stations;
- Scripture ordering/completion and simple application choices;
- optional short memory verse;
- discussion prompts.

### Family / group
Host can pause after stations for brief discussion. Multiple children/teams can contribute without turning humility into a competition. If scoring is enabled, score only objective puzzle/challenge performance.

## Feedback design
Prefer feedback such as: 'This choice shows asking for help' or 'Let's look again at what Jesus said.' Avoid moral labels such as 'proud child,' 'bad choice,' or 'you were not humble enough.'

## Learning flow
**Hear it:** Luke 18:15–17 through BibleTextService.
**Play it:** activities illustrating receiving, dependence, listening and trust.
**Say it:** reinforce Luke 18:16 or another reviewed selected excerpt/reference according to translation licensing.
**Take it Home:** family discussion prompts such as what it means to receive rather than earn, why adults also need childlike dependence, and how humility differs from pretending we have no abilities.

## Multiplayer
This is primarily cooperative/shared learning. Competitive variants should be limited to objective sub-challenges and must not rank participants by humility/faith. A shared Stage can show the group's station progression while each participant can complete compatible individual prompts/activities.

## Completion
Completion means the configured learning sequence was completed. Post-game review shows the passage, concepts covered, optional questions missed in objective Scripture challenges, and Dig Deeper material.

---

# Reusable capability consequence: Memory Matching
Before implementing Two by Two, audit the existing Match/Concentration-like games. If current shared Matching already supports hidden/reveal memory state, extend/reuse it. Otherwise extract `matching.memory` as a reusable capability with:
- N-of-a-kind grouping (pairs initially; future configurable groups);
- hidden/revealed/matched tile states;
- configurable selection count;
- identity/match evaluator;
- turn policy hooks;
- reveal delay;
- normalized match/miss/completion events;
- deterministic layout/shuffle;
- save/resume without reshuffle;
- semantic accessible tile selection;
- embeddable challenge adapter.

This capability should support future Concentration-style Scripture, character, symbol, animal, book/reference and image/text matching games without duplicating mechanics.