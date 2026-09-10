import { loadGameContent } from "../content";
import { scoreFiveGuesses } from "../scoring";
import type { FiveGuessesRound } from "../../types/gameData";
import type {
  BoardPromptBase,
  CardRoundMeta,
  DifficultyFilter,
  EngineActionResult,
  Participant,
  ParticipantMode,
  PlayerStats,
  SessionBase
} from "../gameCore";

export interface FiveGuessesBoardCard {
  id: string;
  round: FiveGuessesRound & CardRoundMeta;
  pickNumber: number;
  boardCategory: string;
  boardValue: number;
  status: "available" | "active" | "solved" | "unsolved";
  winnerParticipantId: string | null;
}

export interface FiveGuessesPrompt extends BoardPromptBase {
  kind: "five-guesses";
  cardId: string;
  round: FiveGuessesRound & CardRoundMeta;
  revealedClues: number;
  primaryMemberName: string;
}

export interface FiveGuessesState extends SessionBase {
  gameId: "five-guesses";
  boardCards: FiveGuessesBoardCard[];
  currentPrompt: FiveGuessesPrompt | null;
}

const FIVE_GUESSES_CLUES_PER_CARD = 5;

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAliases(answer: string, aliases: string[] = []): string[] {
  return Array.from(new Set([answer, ...aliases].map(normalizeText)));
}

function isCorrectGuess(answer: string, aliases: string[] | undefined, guess: string): boolean {
  const normalizedGuess = normalizeText(guess);

  if (!normalizedGuess) {
    return false;
  }

  return getAliases(answer, aliases ?? []).includes(normalizedGuess);
}

function nextIndex(length: number, currentIndex: number): number {
  return (currentIndex + 1) % length;
}

function consumeTurn(participants: Participant[], participantIndex: number) {
  participants[participantIndex].turnCounter += 1;
}

function buildStealOrder(length: number, primaryIndex: number): number[] {
  const order: number[] = [];

  for (let step = 1; step < length; step += 1) {
    order.push((primaryIndex + step) % length);
  }

  return order;
}

function shuffle<T>(values: T[]): T[] {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function pickRandomSubset<T>(values: T[], count: number): T[] {
  if (count <= 0) {
    return [];
  }

  return shuffle(
    values.map((value, index) => ({
      value,
      index
    }))
  )
    .slice(0, Math.min(count, values.length))
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.value);
}

function getRoundDifficulty(round: unknown): "easy" | "medium" | "hard" | null {
  const difficulty = (round as { difficulty?: unknown }).difficulty;
  return difficulty === "easy" || difficulty === "medium" || difficulty === "hard" ? difficulty : null;
}

function filterRoundsByDifficulty<T>(rounds: T[], difficulty: DifficultyFilter | undefined, gameName: string): T[] {
  if (!difficulty || difficulty === "mixed") {
    return rounds;
  }

  const filtered = rounds.filter((round) => getRoundDifficulty(round) === difficulty);

  if (filtered.length === 0) {
    throw new Error(`${gameName} does not have ${difficulty} content. Use Mixed for this game or choose another difficulty.`);
  }

  return filtered;
}

function getCurrentMemberName(participant: Participant): string {
  const member = participant.members[participant.turnCounter % participant.members.length];
  return member?.name ?? participant.name;
}

function getParticipantDisplayLabel(
  participantMode: ParticipantMode,
  participant: Participant,
  memberName?: string
): string {
  if (participantMode === "teams") {
    return `${participant.name} · ${memberName ?? getCurrentMemberName(participant)}`;
  }

  return participant.name;
}

function getRoundNumber(state: FiveGuessesState): number {
  return Math.min(state.resolvedPrompts + (state.currentPrompt ? 1 : 0), state.totalPrompts) || 1;
}

function addActivity(
  nextState: FiveGuessesState,
  tone: "info" | "success" | "warning",
  text: string
): EngineActionResult<FiveGuessesState> {
  nextState.activityLog.unshift({
    id: `${getRoundNumber(nextState)}-${nextState.activityLog.length + 1}`,
    tone,
    text,
    roundNumber: getRoundNumber(nextState)
  });

  return {
    nextState,
    tone,
    text
  };
}

function getParticipantStats(state: FiveGuessesState, participantIndex: number): PlayerStats {
  const participant = state.participants[participantIndex];
  return state.stats[participant.id];
}

function findFiveGuessesCard(
  state: FiveGuessesState,
  cardId: string
): { cardIndex: number; card: FiveGuessesBoardCard } | null {
  const cardIndex = state.boardCards.findIndex((card) => card.id === cardId);

  if (cardIndex < 0) {
    return null;
  }

  return {
    cardIndex,
    card: state.boardCards[cardIndex]
  };
}

function finalizeFiveGuessesPrompt(
  nextState: FiveGuessesState,
  options: {
    solved: boolean;
    winnerParticipantIndex?: number;
    message: string;
  }
): EngineActionResult<FiveGuessesState> {
  const prompt = nextState.currentPrompt;

  if (!prompt) {
    throw new Error("No active prompt is available.");
  }

  if (!prompt.primaryTurnConsumed) {
    consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
    prompt.primaryTurnConsumed = true;
  }

  nextState.turnIndex = nextIndex(nextState.participants.length, prompt.primaryParticipantIndex);
  nextState.resolvedPrompts += 1;

  if (nextState.resolvedPrompts >= nextState.totalPrompts) {
    nextState.status = "completed";
  }

  const found = findFiveGuessesCard(nextState, prompt.cardId);

  if (!found) {
    throw new Error("Unable to locate the active board card.");
  }

  found.card.status = options.solved ? "solved" : "unsolved";
  found.card.winnerParticipantId =
    options.winnerParticipantIndex == null ? null : nextState.participants[options.winnerParticipantIndex].id;

  prompt.phase = "resolved";
  prompt.resolvedMessage = options.message;

  return addActivity(nextState, options.solved ? "success" : "warning", options.message);
}

export async function createFiveGuessesBoard(
  difficulty: DifficultyFilter | undefined,
  customOnly = false
): Promise<FiveGuessesBoardCard[]> {
  const pack = await loadGameContent("five-guesses", { customOnly });
  const allRounds = filterRoundsByDifficulty(
    pack.sessions.flatMap((session) =>
      session.rounds.map((round) => ({
        ...round,
        theme: session.theme,
        sourceSessionTitle: session.title,
        cluePoolSize: round.clues.length,
        clues: pickRandomSubset(round.clues, FIVE_GUESSES_CLUES_PER_CARD)
      }))
    ),
    difficulty,
    "Five Clues"
  );
  const grouped = new Map<string, typeof allRounds>();

  for (const round of shuffle(allRounds)) {
    const categoryRounds = grouped.get(round.category) ?? [];
    categoryRounds.push(round);
    grouped.set(round.category, categoryRounds);
  }

  const categoryGroups = shuffle(Array.from(grouped.entries()).filter(([, rounds]) => rounds.length >= 5)).slice(0, 5);

  if (categoryGroups.length < 5) {
    throw new Error("Five Clues needs at least five categories with five cards each.");
  }

  return categoryGroups.flatMap(([boardCategory, rounds], categoryIndex) =>
    shuffle(rounds)
      .slice(0, 5)
      .map((round, valueIndex) => ({
        id: `${round.id}-${categoryIndex + 1}-${valueIndex + 1}`,
        round,
        pickNumber: categoryIndex * 5 + valueIndex + 1,
        boardCategory,
        boardValue: (valueIndex + 1) * 100,
        status: "available" as const,
        winnerParticipantId: null
      }))
  );
}

export function getFiveGuessesCurrentActorLabel(state: FiveGuessesState): string {
  const prompt = state.currentPrompt;

  if (!prompt) {
    return getParticipantDisplayLabel(state.participantMode, state.participants[state.turnIndex]);
  }

  if (prompt.phase === "primary") {
    const participant = state.participants[prompt.primaryParticipantIndex];
    return getParticipantDisplayLabel(state.participantMode, participant, prompt.primaryMemberName);
  }

  if (prompt.phase === "steal") {
    const participantIndex = prompt.stealOrder[prompt.stealCursor];
    return getParticipantDisplayLabel(state.participantMode, state.participants[participantIndex]);
  }

  return getParticipantDisplayLabel(state.participantMode, state.participants[state.turnIndex]);
}

export function selectFiveGuessesBoardCard(
  state: FiveGuessesState,
  cardId: string
): EngineActionResult<FiveGuessesState> {
  if (state.currentPrompt) {
    throw new Error("Finish the active prompt before picking another card.");
  }

  const nextState = structuredClone(state);
  const found = findFiveGuessesCard(nextState, cardId);

  if (!found || found.card.status !== "available") {
    throw new Error("Choose an available card.");
  }

  found.card.status = "active";
  nextState.currentPrompt = {
    kind: "five-guesses",
    cardId: found.card.id,
    round: found.card.round,
    revealedClues: 1,
    phase: "primary",
    primaryParticipantIndex: nextState.turnIndex,
    primaryTurnConsumed: false,
    stealOrder: buildStealOrder(nextState.participants.length, nextState.turnIndex),
    stealCursor: 0,
    primaryMemberName: getCurrentMemberName(nextState.participants[nextState.turnIndex]),
    resolvedMessage: null
  };

  const actor = getFiveGuessesCurrentActorLabel(nextState);

  return addActivity(
    nextState,
    "info",
    `${actor} selected ${found.card.boardCategory} for ${found.card.boardValue}. Clue 1 is now visible.`
  );
}

export function submitFiveGuessesBoardGuess(
  state: FiveGuessesState,
  guess: string
): EngineActionResult<FiveGuessesState> {
  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter a guess before submitting.");
  }

  if (!state.currentPrompt) {
    throw new Error("Pick a board card before guessing.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the board before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt!;
  const actorIndex =
    prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getFiveGuessesCurrentActorLabel(nextState);

  if (isCorrectGuess(prompt.round.answer, prompt.round.aliases, trimmedGuess)) {
    const found = findFiveGuessesCard(nextState, prompt.cardId);
    const points = found?.card.boardValue ?? scoreFiveGuesses(prompt.revealedClues as 1 | 2 | 3 | 4 | 5);

    stats.totalScore += points;
    stats.roundWins += 1;
    stats.earlySolves += prompt.phase === "primary" && prompt.revealedClues <= 2 ? 1 : 0;

    if (prompt.phase === "steal") {
      consumeTurn(nextState.participants, actorIndex);
    }

    return finalizeFiveGuessesPrompt(nextState, {
      solved: true,
      winnerParticipantIndex: actorIndex,
      message: `${actorLabel} solved ${prompt.round.answer} for ${points} point${points === 1 ? "" : "s"}.`
    });
  }

  stats.incorrectAttempts += 1;

  if (prompt.phase === "primary") {
    if (prompt.revealedClues < FIVE_GUESSES_CLUES_PER_CARD) {
      prompt.revealedClues += 1;

      return addActivity(nextState, "warning", `${actorLabel} missed. Clue ${prompt.revealedClues} is now revealed.`);
    }

    if (!prompt.primaryTurnConsumed) {
      consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
      prompt.primaryTurnConsumed = true;
    }

    if (prompt.stealOrder.length === 0) {
      return finalizeFiveGuessesPrompt(nextState, {
        solved: false,
        message: `No stealers remained. ${prompt.round.answer} closes unsolved.`
      });
    }

    prompt.phase = "steal";
    prompt.stealCursor = 0;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} used all five clues. ${getFiveGuessesCurrentActorLabel(nextState)} is up first for the steal.`
    );
  }

  consumeTurn(nextState.participants, actorIndex);

  if (prompt.stealCursor < prompt.stealOrder.length - 1) {
    prompt.stealCursor += 1;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} missed the steal. ${getFiveGuessesCurrentActorLabel(nextState)} is next.`
    );
  }

  return finalizeFiveGuessesPrompt(nextState, {
    solved: false,
    message: `All steal attempts missed. ${prompt.round.answer} closes unsolved.`
  });
}

export function passFiveGuessesBoardGuess(state: FiveGuessesState): EngineActionResult<FiveGuessesState> {
  if (!state.currentPrompt) {
    throw new Error("Pick a board card before passing.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the board before passing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt!;
  const actorIndex =
    prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getFiveGuessesCurrentActorLabel(nextState);

  stats.incorrectAttempts += 1;

  if (prompt.phase === "primary") {
    if (prompt.revealedClues < FIVE_GUESSES_CLUES_PER_CARD) {
      prompt.revealedClues += 1;

      return addActivity(nextState, "warning", `${actorLabel} passed. Clue ${prompt.revealedClues} is now revealed.`);
    }

    if (!prompt.primaryTurnConsumed) {
      consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
      prompt.primaryTurnConsumed = true;
    }

    if (prompt.stealOrder.length === 0) {
      return finalizeFiveGuessesPrompt(nextState, {
        solved: false,
        message: `${actorLabel} passed after all five clues. ${prompt.round.answer} closes unsolved.`
      });
    }

    prompt.phase = "steal";
    prompt.stealCursor = 0;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} passed after all five clues. ${getFiveGuessesCurrentActorLabel(nextState)} is up first for the steal.`
    );
  }

  consumeTurn(nextState.participants, actorIndex);

  if (prompt.stealCursor < prompt.stealOrder.length - 1) {
    prompt.stealCursor += 1;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} passed the steal. ${getFiveGuessesCurrentActorLabel(nextState)} is next.`
    );
  }

  return finalizeFiveGuessesPrompt(nextState, {
    solved: false,
    message: `All steal attempts passed or missed. ${prompt.round.answer} closes unsolved.`
  });
}
