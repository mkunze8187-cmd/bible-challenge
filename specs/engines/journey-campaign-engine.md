# Journey / Campaign Engine Specification

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

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

type JourneyParticipationMode =
  | 'SOLO'
  | 'ALL_PLAY'
  | 'TEAM_PLAY'
  | 'BUZZER'
  | 'HEAD_TO_HEAD'
  | 'TOURNAMENT'
  | 'RELAY'
  | 'SHARED_COOPERATIVE';

interface JourneyActivitySlot {
  slotId: string;
  requiredCapability: CapabilityRequirement;
  activityTemplate: string;
  allowedParticipationModes: JourneyParticipationMode[];
  defaultParticipationMode: JourneyParticipationMode;
  contentQuery?: ChallengeContentQuery;
  scorePolicyId?: string;
  aidAwardPolicyId?: string;
}

interface JourneyProgress {
  campaignId: string;
  currentChapterId: string;
  currentCheckpointId: string;
  completedCheckpointIds: string[];
}

interface ParticipantCampaignState {
  participantId: string;
  scoreLedgerRef: string;
  aidGrantIds: string[];
  statistics?: Record<string, number>;
}
```

Canonical checkpoints anchor recorded narrative. Gameplay checkpoints/slots provide replayable activities within/between those anchors.

## Shared canonical progression
For a multiplayer campaign configured as a shared canonical journey, `JourneyProgress` is owned by the session and exists exactly once. It MUST NOT be duplicated per player/team. All participants occupy the same canonical checkpoint and advance to the next checkpoint together after the checkpoint activity resolves.

Competitive state is participant-owned. Each player/team has independent Score Ledger entries, Challenge Aids and statistics. A participant may win/lose a checkpoint activity or tournament without becoming ahead of or behind another participant in canonical journey position.

Final competitive standings are determined by cumulative Score Ledger points under the campaign's scoring policy, not by journey position.

## Five independent dimensions
Journey implementations MUST keep these concerns independent:
1. **Journey progression** — where the shared campaign is in its authored narrative.
2. **Participation format** — how players/teams interact at the checkpoint.
3. **Activity mechanic** — which Engine SDK capability/template supplies gameplay.
4. **Challenge content** — which approved content query/pool supplies questions/material.
5. **Scoring policy** — how individual/team performance contributes to Score Ledger and optional placement bonuses.

Changing one dimension must not implicitly change the others.

## Participation modes
A checkpoint/activity may allow one or more participation modes:
- `SOLO`: one participant plays alone.
- `ALL_PLAY`: all participants answer the same/synchronized challenge, with private answers where appropriate.
- `TEAM_PLAY`: members collaborate on their team's response.
- `BUZZER`: participants compete for answer priority.
- `HEAD_TO_HEAD`: two participants compete directly.
- `TOURNAMENT`: 3–4 participants are organized using Agon's tournament capability; ordinary challenge scoring remains active and configured placement bonuses may be added.
- `RELAY`: team members perform defined legs/portions using relay/controller capabilities.
- `SHARED_COOPERATIVE`: participants contribute to one gameplay objective while scoring may remain individual/team-based if configured.

Participation format affects only the checkpoint activity. After a head-to-head or tournament checkpoint completes, all participants continue together on the shared canonical journey.

## Variable challenges
The checkpoint theme/mechanic does not require questions to be about that checkpoint's Bible story. An activity can draw from Host-configured Bible content pools (whole Bible, testament, books, people, current study, etc.). This is a major replayability mechanism.

Example: an Exodus 16 `Gather Manna` activity can be a 60-second answer-as-many-as-possible challenge drawing from the configured question pool. Correct answers earn normal Agon score and may earn challenge aids. The biblical fact of manna provision remains fixed.

## Activity composition
Journey Engine does not implement every mini-game. Activity slots resolve Engine SDK capabilities such as challenge, cards, dice, sequence/build, scripture.relationship, race.track, tournament/relay or future engines. Cross-engine orchestration remains explicit.

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
Checkpoint completion advances the single shared journey progress according to the authored campaign. A failed activity can affect score, aid awards or activity completion presentation but cannot rewrite canonical progression. Campaign definitions may require completing an activity attempt before progression while always providing a non-contradictory continuation path.

## Scoring
Activities award points through Score Ledger. Each player/team earns its own points. Journey Engine may aggregate/display campaign standings but does not create a parallel scoring authority. Final standings use cumulative participant/team points under configured scoring policy. Head-to-head/tournament checkpoints may retain ordinary per-challenge points and add configured finish/placement bonuses.

## Multiplayer
Support solo and 1–4 players/teams. Shared canonical campaigns use one session-owned JourneyProgress while participant competitive state remains separate. Checkpoints may mix participation modes across the same campaign. Private answers/choices remain private until the activity's reveal policy permits them.

## Persistence
Persist campaign definition/version, narrative policy, the single shared JourneyProgress, participant competitive-state references, selected/generated activity definitions, participation mode, scores by reference, awarded/consumed aid grants, content revisions, RNG state where relevant and presentation/review state needed for resume. Canonical checkpoint history cannot be mutated by a gameplay aid.

## Stage/map
Projection exposes one shared journey map/progress, current checkpoint, completed canonical locations, participant standings and public activity state. Do not render separate canonical map positions for competitors in shared mode. Visual map geometry is presentation data; logical progression uses stable checkpoint IDs.

## Documentation/review
Canonical campaigns provide passage references and reviewed narrative summaries. Post-checkpoint/campaign review can show what happened, relevant Scripture, challenge results/misses and Dig Deeper material.

## Conformance tests
- canonical event cannot be skipped/changed by challenge result;
- RNG cannot choose contradictory canonical outcome;
- gameplay activity can vary between runs;
- content query can vary independently of checkpoint theme;
- score changes do not alter canonical progression;
- aid grant changes only permitted gameplay state;
- shared canonical multiplayer has exactly one JourneyProgress;
- participants cannot diverge into different canonical checkpoint positions;
- ALL_PLAY/TEAM_PLAY/BUZZER/HEAD_TO_HEAD/TOURNAMENT/RELAY/SHARED_COOPERATIVE participation can resolve without altering journey position;
- head-to-head/tournament results affect score/bonuses but all participants advance together;
- final standings derive from cumulative participant/team points, not map position;
- save/resume preserves shared canonical checkpoint history and separate participant state;
- capability/activity readiness failure occurs before activity start.