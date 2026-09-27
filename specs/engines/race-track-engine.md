# Race / Track Engine Specification

**Status:** Proposed
**Capability:** `race.track` v1

## Purpose
Provide reusable deterministic race/progress mechanics independent of any specific game theme or Bible content.

## Engine-owned concepts
- competitors/runners and lanes;
- track/course and ordered/branched segments;
- position/progress;
- pace;
- stamina/energy;
- momentum/streak modifiers;
- obstacles and segment effects;
- movement/effect resolution;
- finish conditions and placement;
- race phases/status.

The engine does **not** own Scripture, questions, Bible characters, scoring policy, tournament points, translations or game-specific theology. Games translate challenge outcomes into Race Engine commands/effects.

## Core model
```ts
type Pace = 'RECOVERY' | 'STEADY' | 'RUN' | 'SPRINT';

interface RaceCompetitorState {
  competitorId: string;
  position: TrackPosition;
  pace: Pace;
  stamina: number;
  momentum: number;
  activeEffects: RaceEffect[];
  finishedAt?: number;
}

interface RaceTrack {
  trackId: string;
  segments: RaceSegment[];
  finish: FinishCondition;
}

interface RaceSegment {
  segmentId: string;
  kind: 'OPEN' | 'HURDLE' | 'HILL' | 'WEIGHT' | 'SPRINT' | 'CHECKPOINT' | 'CUSTOM';
  length: number;
  metadata?: Record<string, unknown>;
}
```

## Generic commands
Examples: `SET_PACE`, `APPLY_CHALLENGE_RESULT`, `ADVANCE`, `APPLY_EFFECT`, `CLEAR_EFFECT`, `START_RACE`, `PAUSE_RACE`, `RESUME_RACE`, `FINISH_CHECK`.

Game rules decide when commands are legal and what a challenge means. Engine validates race-state invariants.

## Pace/stamina
Pace changes movement/stamina tradeoffs through configurable race policy. Sprint is faster but consumes more stamina; recovery conserves/restores according to policy. Values are deterministic and visible enough for players to make informed choices. No hidden rubber-banding based solely on placement.

## Momentum
Momentum represents earned temporary race advantage, normally from configured successful outcomes/streaks. It is generic numeric/effect state; the game decides what actions award it.

## Obstacles/effects
Obstacles are generic track segments/effects. Hurdle/hill/weight semantics are configured by the consuming game. A `WEIGHT` effect may increase stamina cost or reduce movement until cleared. The engine does not interpret Hebrews 12.

## Fairness
The engine must not secretly alter movement to make trailing competitors catch up. A consuming game may offer explicit symmetric risk/reward mechanics (e.g. harder comeback challenge) available under documented rules. Timing-sensitive effects use platform fairness/latency policy.

## Multiplayer
Support 1–4 competitors/teams initially. Race state is authoritative. Private pre-challenge decisions may remain private until phase reveal if configured by the game.

## Track generation
Tracks may be authored or generated from deterministic templates using injected RNG. Generated course layout is persisted. Presentation geometry may vary without changing logical segment identity/progress.

## Projection
```ts
interface RaceProjection {
  raceStatus: string;
  track: PublicTrackProjection;
  competitors: PublicCompetitorProjection[];
  viewer?: PrivateCompetitorProjection;
}
```
Public Stage projection includes course, positions and permitted public stats/effects. Controller projection may add the viewer's pace controls/stamina/detail. Hidden decisions are excluded until reveal.

## Presentation
Ancient/modern/fantasy/etc. visuals are themes outside engine state. Renderer maps logical segment kinds/positions to Agon Stage visuals. Reduced Motion uses non-animated position/state changes.

## Persistence
Snapshot includes track definition/template identity, policy/version, competitor state, phase, deterministic RNG information where relevant, active effects and finish state. Restore must reproduce race semantics independent of animation progress.

## AI
AI-playable trait is optional v1. If implemented, AI chooses game-level strategy through permitted actions; engine itself does not decide theological/question answers.

## Testing
Cover pace/stamina arithmetic, effects, hurdle/segment transitions, simultaneous finishes/ties, deterministic tracks, no hidden placement rubber-banding, snapshot/restore, multiplayer isolation, projection privacy, invalid movement and finish ordering.