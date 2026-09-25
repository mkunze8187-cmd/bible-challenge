# Agon Timer System Specification

## Purpose
The **Agon Timer System** provides one authoritative reusable timing service for timed rounds, questions, turns, activities and game phases. Games define duration and timer rules; shared Agon surfaces render the same timer through an Hourglass, Countdown Ring, Digital, or Compact presentation.

## Core principle
Timer state and timer appearance are separate. A projector may show an animated hourglass while Player Controller shows a compact numeric countdown and Host Remote shows controls plus exact time. All represent the same authoritative timer.

## Model
Conceptually:
```ts
type AgonTimer = {
  id: string;
  contextId: string;
  durationMs: number;
  startedAt?: string;
  accumulatedElapsedMs: number;
  state: 'ready'|'running'|'paused'|'expired'|'cancelled';
  warningThresholdsMs?: number[];
  overtimeMode?: 'none'|'count-up';
  visibility: 'public'|'player'|'team'|'host-only';
};

type TimerPresentation = 'hourglass'|'ring'|'digital'|'compact';
```
Exact implementation follows repository timing/state conventions.

## Authoritative timing
- authoritative host/game state owns start/pause/resume/expire/reset
- clients derive display from authoritative timestamps/state and periodically resynchronize
- do not decrement authoritative seconds independently on each browser
- reconnect/orientation/reflow never resets or extends timer
- backgrounded phone resumes from authoritative elapsed time
- timer expiry is a game-engine event, not dependent on an animation completing
- protect start/pause/resume/reset commands with state/version/idempotency conventions

## Presentations
### Hourglass
Primary atmospheric Agon presentation for dramatic timed rounds. Navy/gold/brass frame with readable sand transfer. Exact remaining time may optionally appear below/within the component when game UX benefits.

The sand amount is derived from elapsed percentage. Animation is not authoritative.

### Countdown Ring
Best for quickly perceiving remaining proportion while preserving compact space. May include exact seconds in center.

### Digital
Exact `M:SS`/seconds presentation for precision-heavy games and accessibility.

### Compact
Small status presentation for Host Remote, Player Controller headers, Admin/test surfaces, or secondary timer context.

Games may recommend a presentation by surface. Users/accessibility settings may reduce/disable animation without changing timing.

## Timer behaviors
Support reusable operations where game permits:
- configure duration
- start
- pause
- resume
- reset
- cancel
- expire
- optional add/subtract time through explicit host/game command
- warning thresholds
- optional overtime count-up after zero

Individual games decide which operations are legal. Player Controller must not gain pause/add-time authority unless explicitly granted.

## Warnings and expiration
Games may configure warning thresholds such as 10 seconds/5 seconds. Shared UI can provide:
- visual state change
- optional sound cue
- optional haptic on authorized controller
- spoken/screen-reader announcement

Do not rely on color, sound, animation or haptic alone. Expiration must have a clear text/state indication.

## Projector
Projector may use large Hourglass/Ring/Digital presentation depending on game. Requirements:
- distance readable
- 4:3/16:10/16:9 responsive
- does not obscure primary gameplay
- warning/expired states visible without color alone
- Full/Reduced/Off motion

## Player Controller
Player Controller receives authorized timer projection and may show exact remaining time/compact ring/hourglass as appropriate. It does not own the clock. If the player's legal action expires, UI updates from authoritative game state and rejects stale submissions.

## Host Controls / Host Remote
Host sees exact timer state and only game-authorized controls: start/pause/resume/reset/add-time/etc. Commands route through shared HostCommand/dispatcher. Phone uses compact status + large relevant controls; tablet may show richer timer context.

## Multiple timers
Architecture should support multiple timer instances when a game genuinely needs them, but each timer has explicit context/visibility. Avoid ambiguous simultaneous countdowns on player-facing surfaces. A game chooses which is primary.

## Accessibility
- exact textual time available to assistive technology
- Hourglass/Ring never sole representation of remaining time for screen readers
- no rapid flashing
- Reduced/Off motion
- warning not color-only
- optional audio/haptic never required
- keyboard/touch accessible host controls

## Persistence/recovery
If session recovery persists active timers, store authoritative timestamps/state sufficient to reconstruct elapsed/remaining time under repository session conventions. Define whether offline host suspension pauses or continues timer; games may choose policy, but recovery must be deterministic and documented.

## Testing
- start/pause/resume/reset/expire
- elapsed-time accuracy with fake/test clock
- reconnect/background/resume without time reset
- stale action after expiration
- multiple surfaces show equivalent authoritative remaining time within display tolerance
- warning thresholds fire once as intended
- Full/Reduced/Off motion
- Hourglass sand proportion tests independent of timer authority
- phone/tablet/projector responsiveness
- accessibility labels

## Definition of done
- one authoritative timer service replaces per-game ad-hoc countdown logic for new/converted games
- Hourglass/Ring/Digital/Compact presentations exist
- projector/controller/Host Remote remain synchronized
- timer survives reconnect/reflow/backgrounding correctly
- accessibility/motion requirements pass
- games control timer legality without duplicating timing infrastructure
