import { describe, expect, it } from "vitest";
import {
  continueGame,
  getCurrentActorLabel,
  passScriptureTurn,
  selectBoardCard,
  submitBoardGuess,
  submitScriptureLetterGuess,
  submitScriptureSolve,
  type FiveGuessesState,
  type ScriptureState
} from "../src/lib/gameEngine";
import type { PlayerStats } from "../src/lib/gameEngine";

function stats(): PlayerStats {
  return {
    totalScore: 0,
    roundWins: 0,
    earlySolves: 0,
    initialsOnlySolves: 0,
    incorrectAttempts: 0,
    correctFullSolves: 0,
    letterRevealPoints: 0,
    hiddenLetterSolveBonus: 0,
    timelinePerfectOrders: 0,
    scrambleSolves: 0,
    connectionsGroupsFound: 0,
    bookEarlySolves: 0,
    beforeAfterCorrect: 0,
    referenceRushCorrect: 0,
    chapterFinderCorrect: 0,
    whoSaidItCorrect: 0,
    booksRelayPerfectOrders: 0,
    missingWordCorrect: 0
  };
}

const participants = [
  {
    id: "player-anna-1",
    name: "Anna",
    color: "#111111",
    members: [{ id: "member-anna-1", name: "Anna" }],
    turnCounter: 0
  },
  {
    id: "player-ben-2",
    name: "Ben",
    color: "#222222",
    members: [{ id: "member-ben-1", name: "Ben" }],
    turnCounter: 0
  }
];

function makeFiveGuessesState(totalPrompts = 1): FiveGuessesState {
  return {
    gameId: "five-guesses",
    displayName: "Five Clues",
    sessionTitle: "Test Board",
    sessionTheme: "Test",
    participantMode: "individual",
    participants: structuredClone(participants),
    stats: {
      "player-anna-1": stats(),
      "player-ben-2": stats()
    },
    activityLog: [],
    status: "in-progress",
    turnIndex: 0,
    totalPrompts,
    resolvedPrompts: 0,
    boardCards: [
      {
        id: "card-1",
        round: {
          id: "round-1",
          category: "People",
          answer: "Moses",
          aliases: ["Moshe"],
          clues: ["Clue 1", "Clue 2", "Clue 3", "Clue 4", "Clue 5"],
          theme: "Test",
          sourceSessionTitle: "Test",
          cluePoolSize: 5
        },
        pickNumber: 1,
        boardCategory: "People",
        boardValue: 300,
        status: "available",
        winnerParticipantId: null
      }
    ],
    currentPrompt: null
  };
}

function makeScriptureState(rounds = ["Faith", "Hope"]): ScriptureState {
  const puzzleRounds = rounds.map((verseText, index) => ({
    id: `scripture-${index + 1}`,
    reference: `Test ${index + 1}:1`,
    referenceAliases: [],
    sourceTranslation: "KJV" as const,
    theme: "Test",
    contextClue: "Test clue",
    contentMode: "public-domain-text" as const,
    verseText,
    placeholderText: null,
    solutionAliases: []
  }));

  return {
    gameId: "scripture-puzzles",
    displayName: "Verse Reveal",
    sessionTitle: "Test Scripture",
    sessionTheme: "Test",
    participantMode: "individual",
    participants: structuredClone(participants),
    stats: {
      "player-anna-1": stats(),
      "player-ben-2": stats()
    },
    activityLog: [],
    status: "in-progress",
    turnIndex: 0,
    totalPrompts: puzzleRounds.length,
    resolvedPrompts: 0,
    sessionId: "test-session",
    roundIndex: 0,
    rounds: puzzleRounds,
    currentPrompt: {
      kind: "scripture-puzzles",
      round: puzzleRounds[0],
      phase: "letter",
      attemptedLetters: [],
      isComplete: false,
      winnerParticipantId: null,
      completedReason: null
    }
  };
}

describe("gameEngine transitions", () => {
  it("moves a Five Clues card into steal after the primary player exhausts clues", () => {
    let state = selectBoardCard(makeFiveGuessesState(), "card-1").nextState as FiveGuessesState;

    for (let misses = 0; misses < 5; misses += 1) {
      state = submitBoardGuess(state, "wrong").nextState as FiveGuessesState;
    }

    expect(state.currentPrompt?.phase).toBe("steal");
    expect(getCurrentActorLabel(state)).toBe("Ben");
    expect(state.participants[0].turnCounter).toBe(1);
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(5);
  });

  it("awards a board steal to the stealing player and completes the final prompt", () => {
    let state = selectBoardCard(makeFiveGuessesState(), "card-1").nextState as FiveGuessesState;

    for (let misses = 0; misses < 5; misses += 1) {
      state = submitBoardGuess(state, "wrong").nextState as FiveGuessesState;
    }

    state = submitBoardGuess(state, "moshe").nextState as FiveGuessesState;

    expect(state.currentPrompt?.phase).toBe("resolved");
    expect(state.status).toBe("completed");
    expect(state.resolvedPrompts).toBe(1);
    expect(state.boardCards[0].status).toBe("solved");
    expect(state.boardCards[0].winnerParticipantId).toBe("player-ben-2");
    expect(state.stats["player-ben-2"].totalScore).toBe(300);
    expect(state.stats["player-ben-2"].roundWins).toBe(1);
    expect(state.participants[1].turnCounter).toBe(1);
  });

  it("records Verse Reveal letter points and requires solve or pass before another letter", () => {
    let state = makeScriptureState(["Faith"]);

    state = submitScriptureLetterGuess(state, "f").nextState as ScriptureState;

    expect(state.currentPrompt.phase).toBe("solve");
    expect(state.currentPrompt.attemptedLetters).toEqual(["f"]);
    expect(state.stats["player-anna-1"].totalScore).toBe(1);
    expect(state.stats["player-anna-1"].letterRevealPoints).toBe(1);
    expect(() => submitScriptureLetterGuess(state, "a")).toThrow("Solve or pass");
  });

  it("rotates Verse Reveal turns on pass and records incorrect solve attempts", () => {
    let state = makeScriptureState(["Faith"]);

    state = submitScriptureLetterGuess(state, "z").nextState as ScriptureState;
    state = passScriptureTurn(state).nextState as ScriptureState;

    expect(state.currentPrompt.phase).toBe("letter");
    expect(state.turnIndex).toBe(1);
    expect(state.participants[0].turnCounter).toBe(1);

    state = submitScriptureLetterGuess(state, "a").nextState as ScriptureState;
    state = submitScriptureSolve(state, "wrong verse").nextState as ScriptureState;

    expect(state.turnIndex).toBe(0);
    expect(state.stats["player-ben-2"].incorrectAttempts).toBe(1);
    expect(state.participants[1].turnCounter).toBe(1);
  });

  it("marks the scripture game completed after continuing from the final solved round", () => {
    let state = makeScriptureState(["Faith"]);

    state = submitScriptureLetterGuess(state, "f").nextState as ScriptureState;
    state = submitScriptureSolve(state, "Faith").nextState as ScriptureState;
    expect(state.currentPrompt.isComplete).toBe(true);
    expect(state.currentPrompt.winnerParticipantId).toBe("player-anna-1");
    expect(state.stats["player-anna-1"].correctFullSolves).toBe(1);

    state = continueGame(state).nextState as ScriptureState;

    expect(state.status).toBe("completed");
    expect(state.resolvedPrompts).toBe(1);
  });
});
