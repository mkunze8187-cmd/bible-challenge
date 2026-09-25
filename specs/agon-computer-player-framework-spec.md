# Agon Computer Player Framework Specification

## Purpose
The **Agon Computer Player Framework** allows games that normally require 2+ participants to optionally support one human playing against/with computer-controlled participants. It provides reusable participant identity, legal-action selection, information/privacy boundaries, difficulty semantics, deterministic strategy support, and turn integration.

It is a framework; each supported game supplies a game-specific strategy adapter. Not every game must support computer players.

## Design goals
- make multiplayer-capable games usable by one human where the mechanics permit
- avoid separate computer-only versions of games
- computer uses the same legal-action contract as a human participant
- computer never mutates game state directly or bypasses validation
- computer never receives hidden information unavailable to a human in the same seat/role
- offline/local deterministic strategies are preferred; generative/cloud AI is not required
- difficulty affects strategy/memory/search quality, not cheating

## Participant model
Extend participant identity conceptually:
```ts
type ParticipantKind = 'human'|'team'|'computer';

type Participant = {
  id: string;
  kind: ParticipantKind;
  displayName: string;
  seat?: number;
  teamId?: string;
  computer?: {
    difficulty: 'easy'|'medium'|'hard'|'expert';
    strategyId: string;
  };
};
```
Exact schema follows existing player/team model and must remain backward compatible.

## Per-game capability declaration
Games explicitly declare whether computer players are supported.

Conceptually:
```ts
computerPlayers: {
  supported: true,
  minHumans: 1,
  maxComputers: 3,
  supportedDifficulties: ['easy','medium','hard','expert'],
  supportedRoles?: ['player'],
  strategyId: 'pairs-of-faith-v1'
}
```

Games dependent on subjective judging, free-form creativity, acting, drawing, open discussion, or unsupported physical interaction may set `supported: false` or support only selected roles/modes.

## Legal-action contract
The authoritative game engine exposes the current participant's legal actions/options through a reusable decision context. Human participants project these to Player Controller/host UI. Computer participants pass the equivalent role-limited context to a strategy adapter.

Conceptually:
```ts
type ComputerDecisionContext<TView, TAction> = {
  participantId: string;
  gameId: string;
  turnId: string;
  difficulty: ComputerDifficulty;
  view: TView;              // only information legally visible to this seat
  legalActions: TAction[];  // already constrained or independently revalidated
  rng: DeterministicRng;
};

interface ComputerStrategy<TView,TAction> {
  chooseAction(context: ComputerDecisionContext<TView,TAction>): TAction;
}
```

Every chosen action is submitted through the same authoritative validation/reducer/command path as a human action. The engine rejects illegal/stale actions regardless of source.

## Information boundary / no cheating
Create a `ComputerPlayerView` (or reuse safe player projection) containing only information a human in that seat could legitimately know.

Examples:
- private card game: computer sees its own hand, public cards, opponent card counts; not opponent hands/deck order
- Pairs of Faith: computer remembers only cards actually revealed to that participant/public game, according to strategy memory model; it cannot inspect hidden card faces
- private randomizer result: computer sees it only if that participant would see it

Tests must inspect decision-context payloads to prove hidden state is absent.

## Difficulty model
Common semantic levels:

### Easy
- simple heuristics
- deliberately limited memory/search depth
- may choose among several reasonable legal moves with deterministic seeded variability
- does not make nonsensical/illegal moves merely to lose

### Medium
- competent basic strategy
- moderate memory/search
- reasonable prioritization

### Hard
- strong game-specific heuristics
- good legitimate memory
- deeper search/planning where appropriate

### Expert
- strongest practical deterministic strategy available within performance limits
- complete legitimate memory where the game permits humans to remember observed information
- deeper search/optimization

Difficulty must never grant hidden information or alter RNG in the computer's favor.

## Determinism
Computer decisions should be deterministic under the session seed + decision sequence where practical. Any variability uses authoritative deterministic RNG, not `Math.random()` in UI. This enables reproducible tests/replays and debugging.

## Turn timing / presentation
Computer turns should feel intentional without making games slow.
- engine may introduce a configurable presentation delay before committing/displaying a computer action
- delay is cosmetic; strategy can compute immediately
- Reduced/Off motion may shorten/remove unnecessary delays
- projector identifies computer participant and action clearly
- do not pretend a computer is a human user

## Human + computer configurations
Framework supports configurations allowed by the game, such as:
- 1 human vs 1 computer
- 1 human vs multiple computers
- human + computer teammate vs computer team
- multiple humans plus one/more computer seats

Games own team/seat constraints. At least one human is normally required for interactive Agon play unless a developer/test harness explicitly runs computer-vs-computer simulation.

## Player Controller
Computer participants do not require a Player Controller. Human controller views show computer names/status/turn/public information like any other participant, without exposing computer private state.

## Host Controls / Host Remote
Setup allows host to add/replace eligible seats with computer participants and choose allowed difficulty. During play, host can see computer status and use ordinary pause/restart/recovery controls. Host does not directly pick computer actions except through game-specific override/recovery semantics.

## Strategy adapters
Each game supporting computers supplies a focused strategy adapter rather than adding conditionals to the shared framework.

Examples:
- Pairs of Faith: memory + known-pair selection + unknown-card exploration
- card game: game-specific hand/action heuristics operating on own private hand/public table
- baseball/pitch-selection game: choose legal pitch difficulty using remaining inventory and strategy

Adapters must document:
- information used
- difficulty behavior
- tie-breaking/randomness
- computational bounds
- unsupported modes

## Question-answering games
A computer opponent should not simply use access to the answer key as if it 'knew' every Bible answer. If a game needs simulated computer answering, define an explicit game-specific accuracy/knowledge model by difficulty/content difficulty, driven deterministically. The strategy may use answer metadata to simulate whether it answers correctly, but that is a simulation mechanic and should be clearly separated from human knowledge scoring.

Do not call an external LLM merely to simulate trivia answers unless a future explicitly approved feature requires it.

## Performance/offline
- core computer strategies run locally/offline
- bounded decision time; strategy must not freeze projector/host UI
- heavy search, if needed, runs asynchronously/worker-style according to repository architecture
- fallback legal action if a strategy exceeds its budget or errors, with diagnostic logging

## Accessibility / UX
- computer participants have clear names/icons/text labels, not color alone
- setup explains difficulty in plain language
- status such as `Computer is choosing…` is available to screen readers
- delays do not trap focus or block host emergency controls

## Testing
Framework tests:
- computer action goes through normal legality validation
- stale/illegal strategy result rejected
- deterministic choice under fixed seed/context
- hidden-state exclusion from ComputerPlayerView
- strategy timeout/error fallback
- mixed human/team/computer seating

Per-game adapter tests:
- Easy/Medium/Hard/Expert behavior is measurably distinct where practical
- no difficulty can inspect forbidden hidden state
- representative complete games can finish without deadlock
- reconnect/host pause/resume does not duplicate computer turn

Simulation/property tests may run computer-vs-computer games for QA, balance and deadlock detection; this is developer tooling, not necessarily a user-facing mode.

## No betting/gambling
Computer Player Framework inherits Agon's strict no-betting/no-gambling rule. Do not create betting strategy APIs, wagering behavior, bankroll optimization, casino opponents, or poker-bot examples.

## Definition of done
- participant model can represent computer seats without breaking human/team behavior
- games explicitly opt into computer support
- shared legal-action/decision-context path exists
- ComputerPlayerView enforces human-equivalent information boundaries
- common difficulty semantics and deterministic decision support exist
- setup/Host UI can add supported computer seats
- at least one suitable game adapter demonstrates full single-human play
- framework remains offline-capable and does not require generative AI
- privacy, legality, deterministic, timeout and full-game tests pass
