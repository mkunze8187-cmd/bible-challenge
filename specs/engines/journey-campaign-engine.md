# Journey / Campaign Engine Specification

**Status:** Proposed
**Capability:** `journey.campaign` v1

## Purpose
Provide reusable progression through an authored journey/campaign made of chapters, locations, canonical checkpoints and variable gameplay activities. The engine is content/domain neutral and can support Exodus, Paths of Paul and future historical/geographic journeys.

## Core principle: narrative and gameplay are separate
A campaign owns progression through authored checkpoints. For Scripture-history campaigns, gameplay performance may affect score and permitted gameplay aids, but MUST NOT rewrite the canonical narrative.

```ts
type NarrativePolicy = 'CANONICAL' | 'VARIABLE';

interface JourneyCampaignDefinition {
  campaignId: string;
  narrativePolicy: NarrativePolicy;
  chapters: JourneyChapter[];
  startCheckpointId: string;
}
```

### CANONICAL narrative invariance
When `narrativePolicy === 'CANONICAL'`:
- recorded events/outcomes cannot be changed, prevented, replaced or contradicted by challenge results, RNG, score, difficulty or multiplayer outcomes;
- players cannot choose alternate historical outcomes;
- failure at a gameplay activity cannot prevent the campaign from eventually progressing to the next canonical checkpoint;
- branches may vary presentation/activity selection but may not represent contradictory alternate Scripture;
- aids/resources may modify gameplay challenges only, never canonical narrative state.

## Model
```ts
interface JourneyChapter {
  chapterId: string;
  title: string;
  checkpointIds: string[];
}

interface JourneyCheckpoint {
  checkpointId: string;
  location?: JourneyLocation;
  scriptureReferences?: CanonicalScriptureReference[];
  kind: 'CANONICAL' | 'GAMEPLAY';
  narrativeContentId?: string;
  activitySlots: JourneyActivitySlot[];
  nextCheckpointIds: string[];
}

interface JourneyActivitySlot {
  slotId: string;
  requiredCapability: CapabilityRequirement;
  activityTemplate: string;
  contentQuery?: ChallengeContentQuery;
  scorePolicyId?: string;
  aidAwardPolicyId?: string;
}
```

Canonical checkpoints anchor recorded narrative. Gameplay checkpoints/slots provide replayable activities within/between those anchors.

## Variable challenges
The checkpoint theme/mechanic does not require questions to be about that checkpoint's Bible story. An activity can draw from Host-configured Bible content pools (whole Bible, testament, books, people, current study, etc.). This is a major replayability mechanism.

Example: an Exodus 16 `Gather Manna` activity can be a 60-second answer-as-many-as-possible challenge drawing from the configured question pool. Correct answers earn normal Agon score and may earn challenge aids. The biblical fact of manna provision remains fixed.

## Activity composition
Journey Engine does not implement every mini-game. Activity slots resolve Engine SDK capabilities such as challenge, cards, dice, sequence/build, scripture.relationship, race.track or future engines. Cross-engine orchestration remains explicit.

## Challenge aids
Journey campaigns may award scoped gameplay aids. Aids are not canonical resources and never determine whether a biblical event occurs.

Allowed examples:
- additional challenge time;
- one extra submission/retry;
- reveal a hint;
- eliminate a distractor;
- protect/reduce a scoring penalty;
- other explicit challenge modifiers.

Disallowed in CANONICAL mode:
- skip/change a recorded event;
- prevent an event recorded in Scripture;
- alter chronology/history;
- change who participates in/receives a canonical outcome;
- use a resource shortage to create alternate biblical history.

Journey Engine records awarded/available aid grants but delegates application to a reusable Challenge Aid/Modifier capability.

## Progression
Checkpoint completion advances journey progress according to the authored campaign. A failed activity can affect score, aid awards or activity completion presentation but cannot rewrite canonical progression. Campaign definitions may require completing an activity attempt before progression while always providing a non-contradictory continuation path.

## Scoring
Activities award points through Score Ledger. Journey Engine may aggregate/display campaign standings but does not create a parallel scoring authority. Shared journey progression and competitive team/player scoring can coexist.

## Multiplayer
Support solo and 1–4 teams. A campaign may use one shared canonical journey while teams compete on checkpoint activities. Team scores/aids remain separate where configured. Private answers remain private until reveal.

## Persistence
Persist campaign definition/version, narrative policy, current chapter/checkpoint, completed checkpoints, selected/generated activity definitions, scores by reference, awarded/consumed aid grants, content revisions, RNG state where relevant and presentation/review state needed for resume. Canonical checkpoint history cannot be mutated by a gameplay aid.

## Stage/map
Projection exposes journey map/progress, current checkpoint, completed canonical locations and public activity state. Visual map geometry is presentation data; logical progression uses stable checkpoint IDs. Renderer supports fog/reveal if desired without inventing unknown narrative branches.

## Documentation/review
Canonical campaigns provide passage references and reviewed narrative summaries. Post-checkpoint/campaign review can show what happened, relevant Scripture, challenge results/misses and Dig Deeper material.

## Conformance tests
- canonical event cannot be skipped/changed by challenge result;
- RNG cannot choose contradictory canonical outcome;
- gameplay activity can vary between runs;
- content query can vary independently of checkpoint theme;
- score changes do not alter canonical progression;
- aid grant changes only permitted gameplay state;
- save/resume preserves canonical checkpoint history;
- 1–4 team shared journey/private score state;
- capability/activity readiness failure occurs before activity start.