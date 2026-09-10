import type { GameId, ParticipantMode } from "../lib/gameEngine";

export interface EventScoreEntry {
  key: string;
  participantName: string;
  participantMode: ParticipantMode;
  color: string;
  totalScore: number;
  challengesCompleted: number;
}

export interface ChallengeRating {
  totalStars: number;
  ratingCount: number;
}

export interface SavedEventDefinition {
  id: string;
  name: string;
  gameIds: GameId[];
}

export interface MissedPromptStat {
  itemId: string;
  label: string;
  reference?: string;
  misses: number;
}

export interface GamePlayStats {
  totalPlays: number;
  individualPlays: number;
  teamPlays: number;
  eventPlays: number;
  completedPlays: number;
  totalPrompts: number;
  totalMissedPrompts: number;
  totalIncorrectAttempts: number;
  totalScore: number;
  bestScore: number;
  lastPlayedAt: string | null;
  missedPrompts: MissedPromptStat[];
}
