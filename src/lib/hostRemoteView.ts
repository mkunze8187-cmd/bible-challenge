import {
  GAME_LIBRARY,
  getHostAwardPoints,
  getPromptId,
  getStandings,
  type ActivityEntry,
  type BuzzTurnPolicy,
  type SessionState,
  type Standing
} from "./gameEngine";

export type HostCommandSource = "desktop" | "remote";
export type HostCommandType =
  | "select-answerer"
  | "mark-correct"
  | "mark-incorrect"
  | "adjust-timer"
  | "set-timer-paused"
  | "reveal-answer"
  | "skip"
  | "adjust-score"
  | "set-score"
  | "undo"
  | "restart-game"
  | "end-game"
  | "continue";

interface HostCommandBase {
  type: HostCommandType;
  promptId?: string | null;
  stateVersion?: number;
}

export type HostCommand =
  | (HostCommandBase & { type: "select-answerer"; participantId: string })
  | (HostCommandBase & { type: "mark-correct"; participantId?: string; answerText?: string })
  | (HostCommandBase & { type: "mark-incorrect"; participantId?: string; answerText?: string })
  | (HostCommandBase & { type: "adjust-timer"; seconds: number })
  | (HostCommandBase & { type: "set-timer-paused"; paused: boolean })
  | (HostCommandBase & { type: "reveal-answer" | "skip" | "undo" | "restart-game" | "end-game" | "continue" })
  | (HostCommandBase & { type: "adjust-score"; participantId?: string; delta: number })
  | (HostCommandBase & { type: "set-score"; participantId?: string; score: number });

export type HostCommandRejectReason = "stale-prompt" | "stale-version";

export interface HostCommandGuardContext {
  currentPromptId: string | null;
  stateVersion: number;
}

export interface HostRemotePromptContent {
  title: string;
  answer: string;
  reference: string;
  verse: string;
  note: string;
  hints: string[];
}

export interface HostRemoteViewContext {
  stateVersion: number;
  timeRemaining: number;
  timerEnabled: boolean;
  isTimerPaused: boolean;
  answerClockRemaining: number;
  selectedAnswererId: string | null;
  undoLabel: string | null;
}

export interface HostRemoteView {
  v: 1;
  gameId: SessionState["gameId"];
  gameLabel: string;
  sessionTitle: string;
  status: SessionState["status"];
  promptId: string | null;
  stateVersion: number;
  buzzTurnPolicy: BuzzTurnPolicy;
  timer: {
    enabled: boolean;
    paused: boolean;
    remainingSeconds: number;
    answerClockSeconds: number;
  };
  participants: SessionState["participants"];
  scoreboard: Standing[];
  currentParticipantId: string | null;
  selectedAnswererId: string | null;
  selectedAwardPoints: number | null;
  prompt: unknown;
  host: HostRemotePromptContent | null;
  undoLabel: string | null;
  activityLog: ActivityEntry[];
}

export function guardHostCommand(command: HostCommand, context: HostCommandGuardContext): HostCommandRejectReason | null {
  if (command.promptId !== undefined && command.promptId !== context.currentPromptId) {
    return "stale-prompt";
  }

  if (command.stateVersion !== undefined && command.stateVersion !== context.stateVersion) {
    return "stale-version";
  }

  return null;
}

export function toHostRemoteView(state: SessionState, context: HostRemoteViewContext): HostRemoteView {
  const currentParticipantId = state.participants[state.turnIndex]?.id ?? null;
  const selectedAnswererId =
    context.selectedAnswererId && state.participants.some((participant) => participant.id === context.selectedAnswererId)
      ? context.selectedAnswererId
      : currentParticipantId;

  return {
    v: 1,
    gameId: state.gameId,
    gameLabel: GAME_LIBRARY[state.gameId].label,
    sessionTitle: state.sessionTitle,
    status: state.status,
    promptId: getPromptId(state),
    stateVersion: context.stateVersion,
    buzzTurnPolicy: GAME_LIBRARY[state.gameId].buzzTurnPolicy,
    timer: {
      enabled: context.timerEnabled,
      paused: context.isTimerPaused,
      remainingSeconds: context.timeRemaining,
      answerClockSeconds: context.answerClockRemaining
    },
    participants: structuredClone(state.participants),
    scoreboard: getStandings(state),
    currentParticipantId,
    selectedAnswererId,
    selectedAwardPoints: selectedAnswererId ? getHostAwardPoints(state, selectedAnswererId) : null,
    prompt: getCurrentPrompt(state),
    host: getHostPromptContent(state),
    undoLabel: context.undoLabel,
    activityLog: state.activityLog.slice(0, 8)
  };
}

function getCurrentPrompt(state: SessionState): unknown {
  return "currentPrompt" in state ? structuredClone(state.currentPrompt) : null;
}

function getHostPromptContent(state: SessionState): HostRemotePromptContent | null {
  const prompt = "currentPrompt" in state ? state.currentPrompt : null;
  const round = prompt && typeof prompt === "object" && "round" in prompt ? (prompt.round as unknown) : null;

  if (!round) {
    return null;
  }

  return {
    title: "Host Notes",
    answer: getRoundAnswer(round),
    reference: getRoundReference(round),
    verse: getRoundVerse(round),
    note: getRoundTeachingNote(round),
    hints: getRoundHints(round)
  };
}

function getOptionalText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getRoundAnswer(round: unknown): string {
  const record = round as Record<string, unknown>;
  const aliases = Array.isArray(record.answerAliases) ? record.answerAliases.filter((entry): entry is string => typeof entry === "string") : [];

  return (
    getOptionalText(record.answer) ||
    getOptionalText(record.correctAnswer) ||
    getOptionalText(record.correctChoice) ||
    getOptionalText(record.correctReference) ||
    getOptionalText(record.reference) ||
    getOptionalText(record.scriptureReference) ||
    getOptionalText(record.book) ||
    aliases.join(", ") ||
    "See prompt"
  );
}

function getRoundReference(round: unknown): string {
  const record = round as Record<string, unknown>;
  return (
    getOptionalText(record.reference) ||
    getOptionalText(record.scriptureReference) ||
    getOptionalText(record.correctReference) ||
    getOptionalText(record.prophecyReference) ||
    getOptionalText(record.fulfillmentReference) ||
    getOptionalText(record.correctProphecyReference)
  );
}

function getRoundVerse(round: unknown): string {
  const record = round as Record<string, unknown>;
  return (
    getOptionalText(record.verseText) ||
    getOptionalText(record.excerpt) ||
    getOptionalText(record.verseTextShort) ||
    getOptionalText(record.prophecyTextShort) ||
    getOptionalText(record.fulfillmentText) ||
    getOptionalText(record.prompt)
  );
}

function getRoundTeachingNote(round: unknown): string {
  const record = round as Record<string, unknown>;
  return getOptionalText(record.teachingNote) || getOptionalText(record.hostNote) || getOptionalText(record.explanation);
}

function getRoundHints(round: unknown): string[] {
  const record = round as Record<string, unknown>;
  const hints = [record.hints, record.clues, record.revealPath].flatMap((value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          const entry = item as Record<string, unknown>;
          return getOptionalText(entry.text) || getOptionalText(entry.clue) || getOptionalText(entry.label) || getOptionalText(entry.title);
        }
        return "";
      })
      .filter(Boolean);
  });

  return [...new Set(hints)].slice(0, 8);
}
