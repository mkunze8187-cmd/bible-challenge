# Agon Team Play Styles Spec

## 1. Purpose

In team mode, a host should be able to choose, for each game in an Event, *who on the team answers*:

- **Solo:** one designated member answers for the team for the whole game.
- **Tag Team:** members take turns in a fixed order; each question (or turn) goes to the next member in line.
- **Random Tag:** the next member is chosen at random, fairly, and revealed on screen.

This gets every member involved (not just the strongest reader), adds suspense in Random Tag, and supports Solo "champion" games inside a team Event. It applies to every turn-based game and to every future game through the shared competition-capability contract.

## 2. Current behavior (baseline)

From `SPEC.md` §7A and `src/lib/gameEngine.ts`:

- `ParticipantMode` is `individual` or `teams`; a team has 1–5 `members`.
- Each `Participant` has a `turnCounter`. The active member is `members[turnCounter % members.length]` (`getCurrentMemberName`).
- `consumeTurn()` increments `turnCounter` every time the team takes a turn, including each steal attempt and each Verse Reveal letter guess.
- Round selection at session start predicts future members (`memberTurnOffset`, gameEngine.ts ~1663) so per-member difficulty (`ParticipantMember.difficulty`, #84) picks the right content.
- Phones show "Your team's turn: Sarah is up" (`phone-buzzer-spec.md` §2.4).

This is a Tag Team style with a per-turn rotation unit. It becomes the default so existing sessions behave identically.

## 3. Concepts

```ts
export type TeamPlayStyle = "solo" | "tag-team" | "random-tag";

export type RotationUnit =
  | "per-turn"      // current behavior: every team turn (incl. steals, letter guesses) advances
  | "per-prompt";   // one member owns a whole question/card/tile, including follow-up guesses on it

export type RandomTagFairness =
  | "fair-bag"      // default: everyone goes once (in random order) before anyone repeats
  | "pure";         // independent draw each time; repeats possible

export type SoloSelection = "host-pick" | "random-pick" | "rotate-per-game";

export interface TeamPlayConfig {
  style: TeamPlayStyle;
  rotationUnit: RotationUnit;             // tag-team and random-tag only
  randomFairness: RandomTagFairness;      // random-tag only
  soloSelection: SoloSelection;           // solo only
  soloMemberIds?: Record<string, string>; // participantId → memberId, when host-pick
  teamMayHelp: boolean;                   // false = "hot seat": only the active member may answer
  revealNextMember: "instant" | "animated"; // random-tag reveal presentation
}
```

Defaults (preserve today's behavior): `style: "tag-team"`, `rotationUnit: "per-turn"`, `teamMayHelp: true`, `randomFairness: "fair-bag"`, `soloSelection: "host-pick"`, `revealNextMember: "animated"`.

In `individual` mode every participant has exactly one member, so the style selector is hidden and has no effect.

## 4. Behavior by style

### 4.1 Solo
- One member per team answers for the entire game. The team still owns the score (unchanged: scoring always belongs to the team).
- Selecting the member:
  - `host-pick`: the host chooses in game setup (defaults to the first member).
  - `random-pick`: chosen once at game start with the seeded randomizer, revealed on the projector.
  - `rotate-per-game`: in an Event, each team's solo player advances to the next member for each successive Solo game, so every member gets a Solo game over the Event. The cursor persists in the Event.
- Effective difficulty uses that member's difficulty (member > team > global, as #84).
- Teams may have different-sized rosters; each picks its own solo member.

### 4.2 Tag Team
- Members answer in roster order; the host may reorder the roster before the game.
- `per-turn`: identical to today.
- `per-prompt`: the member who is up when a question/card/tile opens keeps it until it resolves (multiple guesses on the same prompt stay with them). The rotation advances when the team's next prompt begins.
- Steal attempts: the stealing team's *up-next* member attempts the steal, and it counts as that team's turn (matches §7A). Under `per-prompt`, a steal counts as that team's participation in the prompt and advances their rotation.
- Across games in an Event: rotation continues where it left off (the next game starts with the member after the one who answered last), so the same member doesn't always open every game. Host can reset.

### 4.3 Random Tag
- Before each team's turn (or prompt, per `rotationUnit`), the next member is drawn with the authoritative seeded RNG (Randomizers #142).
- `fair-bag` (default): shuffle all active members into a bag; draw without replacement; refill when empty; never allow the same member twice in a row across a refill (swap the first draw of the new bag if needed, when the team has 2+ members).
- `pure`: independent draw each time; repeats allowed. Offered for hosts who want maximum suspense; not the default.
- Reveal: `animated` uses a short Casting Lots / name-spinner presentation from the Randomizer family (#144, #154) on the projector and team controller, with Reduced/Off motion alternatives (#114); `instant` just shows the name.
- The draw happens at the moment the team's turn begins (not at session start), so the reveal is live. For content selection that depends on member difficulty (§6), the whole draw sequence is pre-generated from the seed at game start and kept private, and revealed one draw at a time. Pre-generation is deterministic so recovery and replay produce the same order.

### 4.4 Team may help vs. hot seat
- `teamMayHelp: true` (default): teammates may confer; the active member gives the answer.
- `teamMayHelp: false` ("hot seat"): only the active member may answer.
  - Projector and team controller show "Hot seat: Sarah answers alone."
  - Member-linked phones: only the active member's phone gets the answer interaction; teammates' phones show "Sarah is answering".
  - Shared team phone: shows "Pass the phone to Sarah".
  - Verbal/host-operated play relies on the host; Host Remote shows the active member prominently.
  - Buzz-in games: the team's buzz is allowed, but in hot seat only the active member may answer after winning the buzz. (The team buzzer stays team-owned per `phone-buzzer-spec.md`.)

### 4.5 Sitting out, late arrivals, and changes mid-game
- The host can mark a member **sitting out** (bathroom, left early). They are skipped by all styles until returned; a Solo member sitting out prompts the host to choose a replacement.
- A member added mid-game joins at the end of the Tag Team order, or into the next Random Tag bag.
- Host override: the host can set the active member for the current turn (e.g., the drawn child is shy); recorded in the undo stack (#9) and activity log.
- Removing all but one member makes every style behave as Solo.

## 5. Game capability declaration

Not every game is turn-based. Extend `GameCompetitionCapabilities` (#189) with:

```ts
teamPlay: {
  supportedStyles: TeamPlayStyle[];            // usually all three
  supportedRotationUnits: RotationUnit[];      // e.g. ["per-turn","per-prompt"]
  hotSeatSupported: boolean;
  notes?: string;                               // shown in setup
}
```

- Simultaneous games (every team answers at once, e.g. private submissions in Multitude, typing races) apply the style to *which member submits for the team* this round.
- Relay games (Books Relay, Relay Verse Build) already pass between members per step; they declare `per-turn` only.
- Games that can't meaningfully use a style declare it unsupported, and setup hides it with an explanation.

## 6. Engine changes

Replace direct `turnCounter % members.length` reads with a rotation model:

```ts
export interface MemberRotationState {
  config: TeamPlayConfig;
  perParticipant: Record<string, {
    order: string[];            // tag-team: roster order; random-tag: pre-generated draw sequence
    cursor: number;             // index into order
    sittingOut: string[];       // memberIds
    soloMemberId?: string;
    currentPromptOwner?: string; // per-prompt unit: member who owns the open prompt
  }>;
  seed: string;                 // from the authoritative RNG (#142)
}
```

- `getActiveMember(state, participantId)` replaces `getCurrentMemberName` and `getEffectiveParticipantDifficulty` lookups.
- `advanceRotation(state, participantId, reason: "turn" | "prompt-start")` replaces `consumeTurn`; it applies the unit rule and skips sitting-out members.
- Round pre-selection (gameEngine.ts ~1663) uses `peekMember(state, participantId, offset)` so per-member difficulty keeps working for all three styles (Random Tag via its pre-generated order).
- `turnCounter` is kept and still incremented for compatibility (stats, legacy saves) but no longer drives member selection.
- State stays `structuredClone`-safe and deterministic; no RNG calls in renderers.
- Migration: sessions/snapshots without `MemberRotationState` load as `tag-team` + `per-turn` with the order derived from `turnCounter`, so behavior is unchanged.

## 7. Setup UX

- **Players tab** (team mode): per team, drag to set member order; mark members sitting out.
- **Game setup** (team mode): "How does your team play?" with three large choices and one-line descriptions:
  - Solo: "One player answers the whole game"
  - Tag Team: "Take turns in order"
  - Random Tag: "Surprise! The next player is picked at random"
  - Advanced (collapsed): rotation unit, fairness, solo selection, team may help / hot seat, reveal animation.
- **Event setup** (#195): default style for the Event, overridable per game. The Saved Events dashboard (#196) shows each game's style.
- **Host Remote** (#109–#110): change style between games (not mid-game), override the active member, toggle sitting out.
- Kids Mode (#234): Tag Team `per-prompt` with team may help is the recommended preset for classrooms; Random Tag reveal adds excitement without penalizing anyone.

## 8. Presentation

- Projector: team scoreboard shows each team's active member under the team name ("Lions · Sarah"), and in Tag Team a small "up next" name. Random Tag shows the reveal animation at turn start.
- Team controllers: "Your team's turn: Sarah is up" (existing pattern), "Pass the phone to Sarah" in hot seat, and the Random Tag reveal.
- Activity log and results recap name the member who answered each question.

## 9. Stats and fairness

- Scores remain team-owned. Add an optional per-member contribution tally (questions answered, correct) for recaps, not for ranking.
- The recap shows turns per member so hosts can see participation was even. Fair-bag guarantees counts differ by at most 1 within a team.
- Uneven team sizes are fine: each team rotates independently; a 2-member team's members simply answer more often.

## 10. Tournament and persistence

- `TeamPlayConfig` is stored per game in the Event (#190) and per match in tournaments (#191–#194).
- Rotation cursors, Random Tag sequences, Solo rotate-per-game cursors, and sitting-out lists persist and restore on resume/recovery (#197–#198).
- Idempotent on replay: re-applying a persisted action never advances the rotation twice.

## 11. Privacy

- The pre-generated Random Tag order is never sent to any client; `toPhoneView()` exposes only the current active member (and the next member in Tag Team, which is public).
- Hot-seat gating is enforced server-side: answer actions from non-active linked phones are rejected, not just hidden.

## 12. Testing

- Unit: each style × unit × game family (board with steals, relay, simultaneous, Verse Reveal letter guesses); fair-bag distribution and no back-to-back repeat; sitting out and mid-game joins; solo rotate-per-game across an Event; migration from legacy saves reproduces current behavior exactly.
- Determinism: same seed → same Random Tag order after recovery.
- Privacy: leak test confirms the Random Tag sequence is never in controller payloads; hot-seat rejection test.
- E2E: a 3-game Event with Solo, Tag Team, and Random Tag; reconnect mid-game.
- Visual/accessibility: scoreboard active-member labels and reveal animation at projector/phone sizes, Reduced motion.

## 13. Implementation phases (issues)

1. Rotation model, engine integration, capability declaration, and migration.
2. Setup UX: Players tab order/sitting out, game setup style picker, Event defaults.
3. Presentation: projector active/up-next labels, Random Tag reveal, controller "Sarah is up" / pass-the-phone, hot-seat gating.
4. Host Remote controls and Event/tournament persistence.
5. Stats, recap, and release validation.

## 14. Open decisions

- Whether Random Tag should also be offered in individual mode as "random next player" turn order (changes team order rather than member order). Recommended as a separate, later option.
- Whether hosts can change the style mid-game (recommended: no; between games only).
