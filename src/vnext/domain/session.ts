/**
 * Session-scoped execution concepts for the Agon vNext domain model (#362;
 * design source: specs/architecture/core-foundations-and-stage-orchestration.md
 * section 1). Round/Turn/Attempt are session/game execution concepts and must
 * not be confused with Tournament structure in ownership.ts.
 */

import type { AttemptId, ParticipantId, PlayerId, RoundId, SessionId, TeamId } from "./ids";

/** A player's durable identity, distinct from any one session's ParticipantId. */
export interface Player {
  id: PlayerId;
  displayName: string;
}

/** A team's durable identity, distinct from any one session's ParticipantId. */
export interface Team {
  id: TeamId;
  displayName: string;
}

/**
 * A Player or Team's participation in one specific Session. Identity IDs
 * (PlayerId/TeamId) and session-participant IDs are intentionally distinct:
 * a Player's identity persists across sessions, a Participant does not.
 */
export interface Participant {
  id: ParticipantId;
  sessionId: SessionId;
  playerId?: PlayerId;
  teamId?: TeamId;
}

export type SessionLifecycleState = "setup" | "active" | "paused" | "completed" | "abandoned";

/** One play session of a Game/Variant. */
export interface Session {
  id: SessionId;
  state: SessionLifecycleState;
  participantIds: ParticipantId[];
}

/** One round within a Session's execution (not a Tournament round). */
export interface Round {
  id: RoundId;
  sessionId: SessionId;
  index: number;
}

/** One participant's attempt at a Round/Challenge within a Session. */
export interface Attempt {
  id: AttemptId;
  roundId: RoundId;
  participantId: ParticipantId;
}
