import {
  answerBeforeOrAfter,
  continueGame,
  createSessionState,
  GAME_LIBRARY,
  moveBibleAnagramTile,
  moveVerseTile,
  passBeforeOrAfter,
  passBibleAnagram,
  passBibleBooksRelay,
  passBoardGuess,
  passChapterFinder,
  passCompleteVerse,
  passConnectionTurn,
  passFulfillmentFinder,
  passGenealogyTurn,
  passMessiahProphecy,
  passMissingWord,
  passNameThatBookTurn,
  passOddOneOut,
  passParableMatch,
  passProphecyCategory,
  passProphecyClue,
  passProphecyMatch,
  passProverbCategory,
  passPsalmReferenceFinder,
  passPsalmTheme,
  passReferenceRush,
  passRelayWord,
  passTimelineRound,
  passTwoTruths,
  passVerseScramble,
  passWhoSaidIt,
  passWisdomMatch,
  passWordLadderTurn,
  reorderBibleBook,
  reorderTimelineEvent,
  selectBoardCard,
  selectParableMatchCard,
  selectProphecyCategory,
  selectProphecyCategoryCard,
  selectProphecyMatchCard,
  selectProverbCategory,
  selectProverbCategoryCard,
  selectTwoTruthsStatement,
  submitBibleAnagram,
  submitBibleBooksRelay,
  submitBibleCryptogramSolve,
  submitBoardGuess,
  submitChapterFinderGuess,
  submitCompleteVerseChoice,
  submitConnectionGroup,
  submitFulfillmentFinderChoice,
  submitGenealogyStep,
  submitMessiahProphecyChoice,
  submitMissingWordGuess,
  submitNameThatBookGuess,
  submitOddOneOutChoice,
  submitParableMatch,
  submitProphecyCategory,
  submitProphecyClueGuess,
  submitProphecyMatch,
  submitProverbCategory,
  submitPsalmReferenceFinderChoice,
  submitPsalmThemeChoice,
  submitReferenceRushGuess,
  submitRelayWord,
  submitScriptureLetterGuess,
  submitScriptureSolve,
  submitTimelineOrder,
  submitVerseScramble,
  submitVerseTypingResult,
  submitWhoSaidItGuess,
  submitWisdomMatchChoice,
  submitWordLadderStep,
  toggleConnectionTile,
  type GameId,
  type ParticipantMode,
  type SessionState,
  type TeamSetup
} from "../../src/lib/gameEngine";
import {
  loadGameContent,
  loadWordLadderDictionary,
  registerCustomContentPacks,
  type CustomContentPack
} from "../../src/lib/content";
import { setRandomSeed } from "../../src/lib/random";

export interface GamePlayer {
  playCorrect(state: SessionState): Promise<SessionState> | SessionState;
  passPrompt(state: SessionState): Promise<SessionState> | SessionState;
}

type MutableSessionState = any;

const individualNames = ["Anna", "Ben", "Chloe"];
const teams: TeamSetup[] = [
  { teamName: "Team Alpha", members: ["Anna", "Ben"], color: "#1f77b4" },
  { teamName: "Team Beta", members: ["Chloe", "David"], color: "#2ca02c" }
];
const mixedModePassGameIds = new Set<GameId>([
  "bible-timeline",
  "verse-scramble",
  "before-or-after",
  "reference-rush",
  "chapter-finder",
  "who-said-it",
  "bible-books-relay",
  "missing-word"
]);

function nextState(result: { nextState: SessionState }): SessionState {
  return result.nextState;
}

function firstLetter(value: string): string {
  const match = value.match(/[a-z]/i);
  if (!match) {
    throw new Error(`No guessable letter found in "${value}".`);
  }

  return match[0];
}

function scriptureText(round: { verseText?: string | null }): string {
  if (!round.verseText) {
    throw new Error("Play-through tests require built-in scripture rounds with verse text.");
  }

  return round.verseText;
}

function moveBoardToCorrectOrder<T extends { id?: string; label?: string; order?: number }>(
  state: SessionState,
  arrangedIds: string[],
  orderedItems: T[],
  move: (state: SessionState, id: string, targetIndex: number) => { nextState: SessionState }
): SessionState {
  let next = state;
  orderedItems.forEach((item, targetIndex) => {
    const id = item.id ?? item.label;
    if (!id || arrangedIds[targetIndex] === id) {
      return;
    }

    next = move(next, id, targetIndex).nextState;
    arrangedIds = (next as MutableSessionState).currentPrompt.arrangedEventIds ?? arrangedIds;
  });

  return next;
}

function completeBoardCard(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  if (!next.currentPrompt) {
    const card = next.boardCards.find((entry: any) => entry.status === "available");
    if (!card) {
      throw new Error(`${state.gameId} has no available board card.`);
    }
    next = selectBoardCard(next, card.id).nextState as MutableSessionState;
  }

  return nextState(submitBoardGuess(next, next.currentPrompt.round.answer));
}

function passBoardCard(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  if (!next.currentPrompt) {
    const card = next.boardCards.find((entry: any) => entry.status === "available");
    if (!card) {
      throw new Error(`${state.gameId} has no available board card.`);
    }
    next = selectBoardCard(next, card.id).nextState as MutableSessionState;
  }

  while (next.currentPrompt?.phase !== "resolved") {
    next = passBoardGuess(next).nextState as MutableSessionState;
  }

  return next;
}

function completeScripture(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  const verse = scriptureText(next.currentPrompt.round);
  next = submitScriptureLetterGuess(next, firstLetter(verse)).nextState as MutableSessionState;
  return nextState(submitScriptureSolve(next, verse));
}

function completeTimeline(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  const orderedEvents = [...next.currentPrompt.round.events].sort((left: any, right: any) => left.order - right.order);
  next = moveBoardToCorrectOrder(
    next,
    [...next.currentPrompt.arrangedEventIds],
    orderedEvents,
    reorderTimelineEvent
  ) as MutableSessionState;
  return nextState(submitTimelineOrder(next));
}

function completeVerseScramble(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  for (const tile of [...next.currentPrompt.tiles].sort((left: any, right: any) => left.originalIndex - right.originalIndex)) {
    if (next.currentPrompt.bankTileIds.includes(tile.id)) {
      next = moveVerseTile(next, tile.id, "answer").nextState as MutableSessionState;
    }
  }

  return nextState(submitVerseScramble(next));
}

function completeConnections(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  for (const group of next.currentPrompt.round.groups) {
    for (const tile of next.currentPrompt.tiles.filter((entry: any) => entry.groupId === group.id)) {
      next = toggleConnectionTile(next, tile.id).nextState as MutableSessionState;
    }
    next = submitConnectionGroup(next).nextState as MutableSessionState;
  }

  return next;
}

function completeBookRelay(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  next.currentPrompt.round.books.forEach((book: string, targetIndex: number) => {
    if (next.currentPrompt.arrangedBooks[targetIndex] !== book) {
      next = reorderBibleBook(next, book, targetIndex).nextState as MutableSessionState;
    }
  });

  return nextState(submitBibleBooksRelay(next));
}

function completeProphecyMatch(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  for (const pair of next.pairs) {
    const prophecy = next.currentPrompt.prophecyCards.find((card: any) => card.pairId === pair.id);
    const fulfillment = next.currentPrompt.fulfillmentCards.find((card: any) => card.pairId === pair.id);
    next = selectProphecyMatchCard(next, "prophecy", prophecy.id).nextState as MutableSessionState;
    next = selectProphecyMatchCard(next, "fulfillment", fulfillment.id).nextState as MutableSessionState;
    next = submitProphecyMatch(next).nextState as MutableSessionState;
  }

  return next;
}

function completeParableMatch(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  for (const pair of next.pairs) {
    const parable = next.currentPrompt.parableCards.find((card: any) => card.pairId === pair.id);
    const lesson = next.currentPrompt.lessonCards.find((card: any) => card.pairId === pair.id);
    next = selectParableMatchCard(next, "parable", parable.id).nextState as MutableSessionState;
    next = selectParableMatchCard(next, "lesson", lesson.id).nextState as MutableSessionState;
    next = submitParableMatch(next).nextState as MutableSessionState;
  }

  return next;
}

function completeCategoryBoard(
  state: SessionState,
  selectCard: (state: SessionState, cardId: string) => { nextState: SessionState },
  selectCategory: (state: SessionState, category: string) => { nextState: SessionState },
  submit: (state: SessionState) => { nextState: SessionState }
): SessionState {
  let next = state as MutableSessionState;
  for (const card of next.currentPrompt.cards) {
    next = selectCard(next, card.cardId).nextState as MutableSessionState;
    next = selectCategory(next, card.category).nextState as MutableSessionState;
    next = submit(next).nextState as MutableSessionState;
  }

  return next;
}

function passUntilResolved(
  state: SessionState,
  pass: (state: SessionState) => { nextState: SessionState }
): SessionState {
  let next = state as MutableSessionState;
  let safety = 0;
  while (next.status !== "completed" && next.currentPrompt?.phase !== "resolved" && next.currentPrompt?.isComplete !== true) {
    next = pass(next).nextState as MutableSessionState;
    safety += 1;
    if (safety > 50) {
      throw new Error(`${state.gameId} did not resolve after 50 pass actions.`);
    }
  }

  return next;
}

function completeRelayVerse(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  for (const word of next.currentPrompt.round.verseText.split(/\s+/)) {
    next = submitRelayWord(next, word).nextState as MutableSessionState;
  }

  return next;
}

async function completeWordLadder(state: SessionState): Promise<SessionState> {
  let next = state as MutableSessionState;
  const dictionary = await loadWordLadderDictionary();
  for (const word of next.currentPrompt.round.revealPath.slice(1)) {
    next = submitWordLadderStep(next, word, dictionary).nextState as MutableSessionState;
  }

  return next;
}

function completeBibleAnagram(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  const answerLetters = next.currentPrompt.round.answer.toUpperCase().replace(/[^A-Z]/g, "").split("");
  for (const letter of answerLetters) {
    const tile = next.currentPrompt.tiles.find(
      (entry: any) => entry.letter.toUpperCase() === letter && next.currentPrompt.bankTileIds.includes(entry.id)
    );
    if (!tile) {
      throw new Error(`Could not find anagram tile for ${letter}.`);
    }
    next = moveBibleAnagramTile(next, tile.id, "answer").nextState as MutableSessionState;
  }

  return nextState(submitBibleAnagram(next));
}

function completeVerseTypingRace(state: SessionState): SessionState {
  let next = state as MutableSessionState;
  while (next.currentPrompt.phase === "active") {
    next = submitVerseTypingResult(next, {
      typedText: next.currentPrompt.round.verseText,
      elapsedMs: 60000
    }).nextState as MutableSessionState;
  }

  return next;
}

function passVerseTypingRace(state: SessionState): SessionState {
  return passUntilResolved(state, (next) => submitVerseTypingResult(next, { typedText: "", elapsedMs: 60000 }));
}

function player(
  playCorrect: GamePlayer["playCorrect"],
  passPrompt: GamePlayer["passPrompt"]
): GamePlayer {
  return { playCorrect, passPrompt };
}

export const GAME_PLAYERS: Record<GameId, GamePlayer> = {
  "five-guesses": player(completeBoardCard, passBoardCard),
  initials: player(completeBoardCard, passBoardCard),
  "scripture-puzzles": player(
    completeScripture,
    (state) => submitScriptureSolve(state, "__pass__").nextState
  ),
  "bible-timeline": player(completeTimeline, (state) => passUntilResolved(state, passTimelineRound)),
  "verse-scramble": player(completeVerseScramble, (state) => passUntilResolved(state, passVerseScramble)),
  "bible-connections": player(completeConnections, (state) => passUntilResolved(state, passConnectionTurn)),
  "name-that-book": player(
    (state) => submitNameThatBookGuess(state, (state as MutableSessionState).currentPrompt.round.book).nextState,
    (state) => passUntilResolved(state, passNameThatBookTurn)
  ),
  "before-or-after": player(
    (state) => answerBeforeOrAfter(state, (state as MutableSessionState).currentPrompt.round.earlierEvent).nextState,
    (state) => passUntilResolved(state, passBeforeOrAfter)
  ),
  "reference-rush": player(
    (state) => submitReferenceRushGuess(state, (state as MutableSessionState).currentPrompt.round.reference).nextState,
    (state) => passUntilResolved(state, passReferenceRush)
  ),
  "chapter-finder": player(
    (state) => {
      const round = (state as MutableSessionState).currentPrompt.round;
      return submitChapterFinderGuess(state, `${round.answerBook} ${round.answerChapter}`).nextState;
    },
    (state) => passUntilResolved(state, passChapterFinder)
  ),
  "who-said-it": player(
    (state) => submitWhoSaidItGuess(state, (state as MutableSessionState).currentPrompt.round.speaker).nextState,
    (state) => passUntilResolved(state, passWhoSaidIt)
  ),
  "bible-books-relay": player(completeBookRelay, (state) => passUntilResolved(state, passBibleBooksRelay)),
  "missing-word": player(
    (state) => {
      const round = (state as MutableSessionState).currentPrompt.round;
      return submitMissingWordGuess(state, round.acceptedAnswers[0] ?? round.missingWords.join(" ")).nextState;
    },
    (state) => passUntilResolved(state, passMissingWord)
  ),
  "odd-one-out": player(
    (state) => submitOddOneOutChoice(state, (state as MutableSessionState).currentPrompt.round.oddItem).nextState,
    (state) => passUntilResolved(state, passOddOneOut)
  ),
  genealogy: player(
    (state) => {
      let next = state as MutableSessionState;
      for (const name of next.currentPrompt.round.fullChain.slice(1)) {
        next = submitGenealogyStep(next, name).nextState as MutableSessionState;
      }
      return next;
    },
    (state) => passUntilResolved(state, passGenealogyTurn)
  ),
  "prophecy-match": player(completeProphecyMatch, (state) => passUntilResolved(state, passProphecyMatch)),
  "parable-match": player(completeParableMatch, (state) => passUntilResolved(state, passParableMatch)),
  "messiah-prophecy": player(
    (state) => submitMessiahProphecyChoice(state, (state as MutableSessionState).currentPrompt.round.correctAnswer).nextState,
    (state) => passUntilResolved(state, passMessiahProphecy)
  ),
  "prophecy-clue-ladder": player(
    (state) => submitProphecyClueGuess(state, (state as MutableSessionState).currentPrompt.round.answer).nextState,
    (state) => passUntilResolved(state, passProphecyClue)
  ),
  "fulfillment-finder": player(
    (state) =>
      submitFulfillmentFinderChoice(state, (state as MutableSessionState).currentPrompt.round.correctProphecyReference)
        .nextState,
    (state) => passUntilResolved(state, passFulfillmentFinder)
  ),
  "prophecy-categories": player(
    (state) => completeCategoryBoard(state, selectProphecyCategoryCard, selectProphecyCategory, submitProphecyCategory),
    (state) => passUntilResolved(state, passProphecyCategory)
  ),
  "complete-the-verse": player(
    (state) => submitCompleteVerseChoice(state, (state as MutableSessionState).currentPrompt.round.correctEnding).nextState,
    (state) => passUntilResolved(state, passCompleteVerse)
  ),
  "wisdom-match": player(
    (state) => submitWisdomMatchChoice(state, (state as MutableSessionState).currentPrompt.round.correctTheme).nextState,
    (state) => passUntilResolved(state, passWisdomMatch)
  ),
  "psalm-theme": player(
    (state) => submitPsalmThemeChoice(state, (state as MutableSessionState).currentPrompt.round.correctTheme).nextState,
    (state) => passUntilResolved(state, passPsalmTheme)
  ),
  "proverb-categories": player(
    (state) => completeCategoryBoard(state, selectProverbCategoryCard, selectProverbCategory, submitProverbCategory),
    (state) => passUntilResolved(state, passProverbCategory)
  ),
  "psalm-reference-finder": player(
    (state) => submitPsalmReferenceFinderChoice(state, (state as MutableSessionState).currentPrompt.round.correctReference).nextState,
    (state) => passUntilResolved(state, passPsalmReferenceFinder)
  ),
  "two-truths-and-a-lie": player(
    (state) => selectTwoTruthsStatement(state, (state as MutableSessionState).currentPrompt.round.lieIndex).nextState,
    (state) => passUntilResolved(state, passTwoTruths)
  ),
  "relay-verse-build": player(completeRelayVerse, (state) => passUntilResolved(state, passRelayWord)),
  "verse-typing-race": player(completeVerseTypingRace, passVerseTypingRace),
  "word-ladder": player(completeWordLadder, (state) => passUntilResolved(state, passWordLadderTurn)),
  "bible-anagrams": player(completeBibleAnagram, (state) => passUntilResolved(state, passBibleAnagram)),
  "bible-cryptogram": player(
    (state) => submitBibleCryptogramSolve(state, scriptureText((state as MutableSessionState).currentPrompt.round)).nextState,
    (state) => submitBibleCryptogramSolve(state, "__pass__").nextState
  )
};

export async function createTestSession(
  gameId: GameId,
  options: {
    participantMode?: ParticipantMode;
    maxPrompts?: number;
    seed?: number;
    individualNames?: string[];
    contentSource?: "built-in" | "custom" | "all";
  } = {}
): Promise<SessionState> {
  setRandomSeed(options.seed ?? 8187);
  try {
    return await createSessionState({
      gameId,
      participantMode: options.participantMode ?? "individual",
      individualNames: options.individualNames ?? individualNames,
      teams,
      maxPrompts: options.maxPrompts,
      difficulty: "mixed",
      contentSource: options.contentSource
    });
  } finally {
    setRandomSeed(null);
  }
}

export async function createCustomContentSession(gameId: GameId): Promise<SessionState> {
  registerCustomContentPacks([]);
  const pack = await loadGameContent(gameId);
  const rounds = (pack.sessions as Array<{ rounds: unknown[] }>).flatMap((session) => session.rounds);
  if (rounds.length === 0) {
    throw new Error(`${gameId} has no built-in rounds to mirror as custom content.`);
  }

  const customPack: CustomContentPack = {
    packId: `layer-1-${gameId}`,
    packName: `Layer 1 ${GAME_LIBRARY[gameId].label}`,
    accentColor: "#315e56",
    games: [
      {
        gameId: `layer-1-${gameId}`,
        gameTitle: `Layer 1 ${GAME_LIBRARY[gameId].label}`,
        gameType: gameId,
        description: "Generated from validated built-in content for custom-only play-through coverage.",
        rounds: structuredClone(rounds) as unknown[]
      }
    ]
  };

  registerCustomContentPacks([customPack]);
  try {
    return await createTestSession(gameId, { contentSource: "custom", maxPrompts: 2, seed: 8187 });
  } finally {
    registerCustomContentPacks([]);
  }
}

export async function createSingleRoundCustomSession(gameId: GameId, round: unknown): Promise<SessionState> {
  registerCustomContentPacks([]);
  const customPack: CustomContentPack = {
    packId: `layer-1-single-${gameId}`,
    packName: `Layer 1 Single ${GAME_LIBRARY[gameId].label}`,
    accentColor: "#315e56",
    games: [
      {
        gameId: `layer-1-single-${gameId}`,
        gameTitle: `Layer 1 Single ${GAME_LIBRARY[gameId].label}`,
        gameType: gameId,
        description: "Generated from one built-in round for content solvability coverage.",
        rounds: [structuredClone(round)]
      }
    ]
  };

  registerCustomContentPacks([customPack]);
  try {
    return await createTestSession(gameId, { contentSource: "custom", maxPrompts: 1, seed: 8187 });
  } finally {
    registerCustomContentPacks([]);
  }
}

export function gameIds(): GameId[] {
  return Object.keys(GAME_LIBRARY) as GameId[];
}

export async function playToCompletion(
  initialState: SessionState,
  action: "correct" | "pass" | "mixed" = "correct"
): Promise<SessionState> {
  let state = initialState;
  let safety = 0;

  while (state.status !== "completed") {
    const player = GAME_PLAYERS[state.gameId];
    const beforeResolved = state.resolvedPrompts;
    const inputState = state;
    const beforeAction = structuredClone(inputState);
    const shouldPass =
      action === "pass" || (action === "mixed" && safety % 3 === 1 && mixedModePassGameIds.has(state.gameId));
    state = await (shouldPass
      ? player.passPrompt(inputState)
      : player.playCorrect(inputState));
    assertInputNotMutated(beforeAction, inputState);
    assertBasicInvariants(state, beforeResolved);

    if (state.status !== "completed") {
      state = continueGame(state).nextState;
      assertBasicInvariants(state, beforeResolved);
    }

    safety += 1;
    if (safety > 50) {
      throw new Error(`${state.gameId} did not complete within 50 play-through actions.`);
    }
  }

  return state;
}

function assertInputNotMutated(expected: SessionState, actual: SessionState): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${actual.gameId} mutated its input state.`);
  }
}

export function assertBasicInvariants(state: SessionState, previousResolved = 0): void {
  if (state.resolvedPrompts < previousResolved) {
    throw new Error(`${state.gameId} resolvedPrompts regressed from ${previousResolved} to ${state.resolvedPrompts}.`);
  }

  if (state.resolvedPrompts > state.totalPrompts) {
    throw new Error(`${state.gameId} resolvedPrompts ${state.resolvedPrompts} exceeded totalPrompts ${state.totalPrompts}.`);
  }

  if (state.turnIndex < 0 || state.turnIndex >= state.participants.length) {
    throw new Error(`${state.gameId} turnIndex ${state.turnIndex} is invalid for ${state.participants.length} participants.`);
  }

  if (state.activityLog.length === 0 || !state.activityLog.at(-1)?.text.trim()) {
    throw new Error(`${state.gameId} did not record a non-empty activity message.`);
  }

  for (const [participantId, stats] of Object.entries(state.stats)) {
    if (!state.participants.some((participant) => participant.id === participantId)) {
      throw new Error(`${state.gameId} has stats for unknown participant ${participantId}.`);
    }

    if (stats.totalScore < 0) {
      throw new Error(`${state.gameId} produced a negative score for ${participantId}.`);
    }

    if (!Number.isInteger(stats.totalScore)) {
      throw new Error(`${state.gameId} produced a non-integer score for ${participantId}.`);
    }
  }
}
