// Mirrors the main app's src/renderer/appTypes.ts shapes for GamePlayStats/ChallengeRating
// — both live inside the shared app-settings.json blob (see electron/main.js's
// getStatsAndRatings), so these types must match the main app's exactly.
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

export interface ChallengeRating {
  totalStars: number;
  ratingCount: number;
}

export interface StatsAndRatings {
  gameStats: Record<string, GamePlayStats>;
  challengeRatings: Record<string, ChallengeRating>;
}
