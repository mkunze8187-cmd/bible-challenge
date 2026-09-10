import type { GameId } from "../types/gameData";

export type ActivityTone = "info" | "success" | "warning";
export type ParticipantMode = "individual" | "teams";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type DifficultyFilter = ChallengeDifficulty | "mixed";

export interface ParticipantMember {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  members: ParticipantMember[];
  turnCounter: number;
}

export interface PlayerStats {
  totalScore: number;
  roundWins: number;
  earlySolves: number;
  initialsOnlySolves: number;
  incorrectAttempts: number;
  correctFullSolves: number;
  letterRevealPoints: number;
  hiddenLetterSolveBonus: number;
  timelinePerfectOrders: number;
  scrambleSolves: number;
  connectionsGroupsFound: number;
  bookEarlySolves: number;
  beforeAfterCorrect: number;
  referenceRushCorrect: number;
  chapterFinderCorrect: number;
  whoSaidItCorrect: number;
  booksRelayPerfectOrders: number;
  missingWordCorrect: number;
}

export interface ActivityEntry {
  id: string;
  tone: ActivityTone;
  text: string;
  roundNumber: number;
}

export interface SessionBase {
  gameId: GameId;
  displayName: string;
  sessionTitle: string;
  sessionTheme: string;
  participantMode: ParticipantMode;
  participants: Participant[];
  stats: Record<string, PlayerStats>;
  activityLog: ActivityEntry[];
  status: "in-progress" | "completed";
  turnIndex: number;
  totalPrompts: number;
  resolvedPrompts: number;
}

export interface EngineActionResult<TState> {
  nextState: TState;
  tone: ActivityTone;
  text: string;
}

export interface CardRoundMeta {
  theme: string;
  sourceSessionTitle: string;
  cluePoolSize: number;
}

export interface BoardPromptBase {
  phase: "primary" | "steal" | "resolved";
  primaryParticipantIndex: number;
  primaryTurnConsumed: boolean;
  stealOrder: number[];
  stealCursor: number;
  resolvedMessage: string | null;
}
