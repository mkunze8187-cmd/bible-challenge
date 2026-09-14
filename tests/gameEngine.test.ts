import { describe, expect, it } from "vitest";
import {
  continueGame,
  getCurrentActorLabel,
  moveBibleAnagramTile,
  passBibleAnagram,
  passBibleCryptogramTurn,
  passRelayWord,
  passScriptureTurn,
  passWordLadderTurn,
  removeLastWordLadderRung,
  selectBoardCard,
  selectTwoTruthsStatement,
  submitBibleAnagram,
  submitBibleCryptogramLetterGuess,
  submitBibleCryptogramSolve,
  submitBoardGuess,
  submitRelayWord,
  submitScriptureLetterGuess,
  submitScriptureSolve,
  submitWordLadderStep,
  type BibleAnagramsState,
  type BibleCryptogramState,
  type FiveGuessesState,
  type RelayVerseBuildState,
  type ScriptureState,
  type TwoTruthsAndALieState,
  type WordLadderState
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
    missingWordCorrect: 0,
    wordLadderStepsCompleted: 0
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

function makeTwoTruthsState(): TwoTruthsAndALieState {
  const round = {
    id: "ttl-test-1",
    subject: "Test Subject",
    subjectType: "person" as const,
    statements: ["True one.", "True two.", "The lie."] as [string, string, string],
    lieIndex: 2 as const,
    explanation: "Explanation.",
    reference: "Test 1:1",
    theme: "Test",
    difficulty: "easy" as const,
    teachingNote: "Note."
  };

  return {
    gameId: "two-truths-and-a-lie",
    displayName: "Two Truths and a Lie",
    sessionTitle: "Test",
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
    totalPrompts: 1,
    resolvedPrompts: 0,
    roundIndex: 0,
    rounds: [round],
    currentPrompt: {
      kind: "two-truths-and-a-lie",
      round,
      statements: round.statements.map((text, index) => ({ text, originalIndex: index as 0 | 1 | 2 })),
      eliminatedIndexes: [],
      selectedIndex: null,
      phase: "active",
      wasCorrect: null,
      resolvedMessage: null
    }
  };
}

function makeRelayVerseBuildState(): RelayVerseBuildState {
  const round = {
    id: "rvb-test-1",
    reference: "Test 1:1",
    sourceTranslation: "KJV" as const,
    theme: "Test",
    verseText: "In the beginning God created",
    difficulty: "easy" as const,
    teachingNote: "Note."
  };

  return {
    gameId: "relay-verse-build",
    displayName: "Relay Verse Build",
    sessionTitle: "Test",
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
    totalPrompts: 1,
    resolvedPrompts: 0,
    roundIndex: 0,
    rounds: [round],
    currentPrompt: {
      kind: "relay-verse-build",
      round,
      words: ["In", "the", "beginning", "God", "created"],
      revealedCount: 0,
      wrongAttemptsThisWord: 0,
      totalWrongAttempts: 0,
      phase: "active",
      wasCorrect: null,
      resolvedMessage: null
    }
  };
}

function makeWordLadderState(): WordLadderState {
  const round = {
    id: "wl-test-1",
    startWord: "cat",
    endWord: "dog",
    wordLength: 3,
    minSteps: 3,
    revealPath: ["cat", "cot", "cog", "dog"],
    startFlavorText: "Start",
    endFlavorText: "End",
    theme: "Test",
    difficulty: "easy" as const,
    teachingNote: "Note."
  };

  return {
    gameId: "word-ladder",
    displayName: "Word Ladder",
    sessionTitle: "Test",
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
    totalPrompts: 1,
    resolvedPrompts: 0,
    roundIndex: 0,
    rounds: [round],
    currentPrompt: {
      kind: "word-ladder",
      round,
      chain: ["cat"],
      startTurnIndex: 0,
      phase: "active",
      wasCorrect: null,
      resolvedMessage: null
    }
  };
}

function makeBibleAnagramsState(): BibleAnagramsState {
  const round = {
    id: "ba-test-1",
    answer: "Noah",
    category: "Person" as const,
    clue: "He built an ark.",
    theme: "Test",
    difficulty: "easy" as const,
    teachingNote: "Note."
  };

  const tiles = ["N", "O", "A", "H"].map((letter, index) => ({
    id: `ba-test-1-letter-${index}`,
    letter,
    originalIndex: index
  }));

  return {
    gameId: "bible-anagrams",
    displayName: "Bible Anagrams",
    sessionTitle: "Test",
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
    totalPrompts: 1,
    resolvedPrompts: 0,
    roundIndex: 0,
    rounds: [round],
    currentPrompt: {
      kind: "bible-anagrams",
      round,
      tiles,
      bankTileIds: tiles.map((tile) => tile.id),
      answerTileIds: [],
      attemptedParticipantIds: [],
      phase: "active",
      wasCorrect: null,
      resolvedMessage: null
    }
  };
}

function makeBibleCryptogramState(verseText = "CAT"): BibleCryptogramState {
  const round = {
    id: "bc-test-1",
    reference: "Test 1:1",
    sourceTranslation: "KJV" as const,
    theme: "Test",
    verseText,
    difficulty: "easy" as const,
    teachingNote: "Note."
  };

  // A fixed, deterministic cipher map for testing — every real letter maps to a
  // different real letter, shifted by one (a->b, b->c, ... z->a), so no letter maps to
  // itself and the mapping is easy to reason about in assertions.
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const cipherMap: Record<string, string> = {};
  alphabet.forEach((letter, index) => {
    cipherMap[letter] = alphabet[(index + 1) % alphabet.length];
  });

  return {
    gameId: "bible-cryptogram",
    displayName: "Bible Cryptogram",
    sessionTitle: "Test",
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
    totalPrompts: 1,
    resolvedPrompts: 0,
    roundIndex: 0,
    rounds: [round],
    currentPrompt: {
      kind: "bible-cryptogram",
      round,
      cipherMap,
      attemptedLetters: [],
      phase: "letter",
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

  it("records Bible Cryptogram letter points and requires solve or pass before another letter", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "c").nextState as BibleCryptogramState;

    expect(state.currentPrompt.phase).toBe("solve");
    expect(state.currentPrompt.attemptedLetters).toEqual(["c"]);
    expect(state.stats["player-anna-1"].totalScore).toBe(1);
    expect(state.stats["player-anna-1"].letterRevealPoints).toBe(1);
    expect(() => submitBibleCryptogramLetterGuess(state, "a")).toThrow("Solve or pass");
  });

  it("does not lock guesses to the cipher and reveals every occurrence of a correctly guessed letter", () => {
    let state = makeBibleCryptogramState("CAT");

    // "z" isn't in "CAT" at all, so it must miss regardless of what the cipher maps it to
    // — guesses are checked against the real plaintext, never against the cipher mapping.
    state = submitBibleCryptogramLetterGuess(state, "z").nextState as BibleCryptogramState;
    expect(state.currentPrompt.attemptedLetters).toEqual(["z"]);
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(1);
  });

  it("rotates Bible Cryptogram turns on pass and records incorrect solve attempts", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "z").nextState as BibleCryptogramState;
    state = passBibleCryptogramTurn(state).nextState as BibleCryptogramState;

    expect(state.currentPrompt.phase).toBe("letter");
    expect(state.turnIndex).toBe(1);
    expect(state.participants[0].turnCounter).toBe(1);

    state = submitBibleCryptogramLetterGuess(state, "c").nextState as BibleCryptogramState;
    state = submitBibleCryptogramSolve(state, "wrong").nextState as BibleCryptogramState;

    expect(state.turnIndex).toBe(0);
    expect(state.stats["player-ben-2"].incorrectAttempts).toBe(1);
    expect(state.participants[1].turnCounter).toBe(1);
  });

  it("marks the Bible Cryptogram game completed after continuing from the final solved round", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "c").nextState as BibleCryptogramState;
    state = submitBibleCryptogramSolve(state, "CAT").nextState as BibleCryptogramState;
    expect(state.currentPrompt.isComplete).toBe(true);
    expect(state.currentPrompt.winnerParticipantId).toBe("player-anna-1");
    expect(state.stats["player-anna-1"].correctFullSolves).toBe(1);

    state = continueGame(state).nextState as BibleCryptogramState;

    expect(state.status).toBe("completed");
    expect(state.resolvedPrompts).toBe(1);
  });

  it("resolves Two Truths and a Lie when the lie is picked and steps down score on misses", () => {
    let state = makeTwoTruthsState();

    state = selectTwoTruthsStatement(state, 0).nextState as TwoTruthsAndALieState;
    expect(state.currentPrompt.phase).toBe("active");
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(1);
    expect(state.turnIndex).toBe(1);

    state = selectTwoTruthsStatement(state, 2).nextState as TwoTruthsAndALieState;
    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.wasCorrect).toBe(true);
    expect(state.stats["player-ben-2"].totalScore).toBe(4);
  });

  it("keeps the same player on a Relay Verse Build miss and rotates turns on a correct word", () => {
    let state = makeRelayVerseBuildState();

    state = submitRelayWord(state, "wrong").nextState as RelayVerseBuildState;
    expect(state.turnIndex).toBe(0);
    expect(state.currentPrompt.wrongAttemptsThisWord).toBe(1);
    expect(state.currentPrompt.revealedCount).toBe(0);

    state = submitRelayWord(state, "In").nextState as RelayVerseBuildState;
    expect(state.turnIndex).toBe(1);
    expect(state.currentPrompt.revealedCount).toBe(1);
    expect(state.currentPrompt.wrongAttemptsThisWord).toBe(0);
  });

  it("reveals the current word and passes the turn on Skip Word", () => {
    let state = makeRelayVerseBuildState();

    state = passRelayWord(state).nextState as RelayVerseBuildState;
    expect(state.currentPrompt.revealedCount).toBe(1);
    expect(state.currentPrompt.totalWrongAttempts).toBe(1);
    expect(state.turnIndex).toBe(1);
  });

  it("scores a guess changing more than one letter as a miss without passing the turn, then accepts a valid step", () => {
    let state = makeWordLadderState();
    const dictionary = new Set(["cat", "cot", "cog", "dog", "bat"]);

    state = submitWordLadderStep(state, "cog", dictionary).nextState as WordLadderState;
    expect(state.currentPrompt.chain).toEqual(["cat"]);
    expect(state.turnIndex).toBe(0);
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(1);

    state = submitWordLadderStep(state, "cot", dictionary).nextState as WordLadderState;
    expect(state.currentPrompt.chain).toEqual(["cat", "cot"]);
    expect(state.turnIndex).toBe(0);
    expect(state.stats["player-anna-1"].wordLadderStepsCompleted).toBe(1);
  });

  it("throws when a Word Ladder guess repeats a word already in the chain", () => {
    const state = makeWordLadderState();
    const dictionary = new Set(["cat", "cot", "cog", "dog"]);

    expect(() => submitWordLadderStep(state, "cat", dictionary)).toThrow();
  });

  it("keeps the same player on unlimited Word Ladder misses until they pass", () => {
    let state = makeWordLadderState();
    const dictionary = new Set(["cat"]);

    for (let miss = 0; miss < 6; miss += 1) {
      state = submitWordLadderStep(state, "zzz", dictionary).nextState as WordLadderState;
    }

    expect(state.currentPrompt.phase).toBe("active");
    expect(state.turnIndex).toBe(0);
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(6);
  });

  it("removes the last rung from a Word Ladder chain but never the starting word", () => {
    let state = makeWordLadderState();
    const dictionary = new Set(["cat", "cot"]);

    state = submitWordLadderStep(state, "cot", dictionary).nextState as WordLadderState;
    expect(state.currentPrompt.chain).toEqual(["cat", "cot"]);

    state = removeLastWordLadderRung(state).nextState as WordLadderState;
    expect(state.currentPrompt.chain).toEqual(["cat"]);

    expect(() => removeLastWordLadderRung(state)).toThrow("starting word");
  });

  it("passes the Word Ladder turn to the next participant without resetting the chain", () => {
    let state = makeWordLadderState();
    const dictionary = new Set(["cat", "cot"]);

    state = submitWordLadderStep(state, "cot", dictionary).nextState as WordLadderState;
    state = passWordLadderTurn(state).nextState as WordLadderState;

    expect(state.turnIndex).toBe(1);
    expect(state.currentPrompt.phase).toBe("active");
    expect(state.currentPrompt.chain).toEqual(["cat", "cot"]);
  });

  it("reveals the path once every participant has passed on a stalled Word Ladder round", () => {
    let state = makeWordLadderState();

    state = passWordLadderTurn(state).nextState as WordLadderState;
    expect(state.currentPrompt.phase).toBe("active");
    expect(state.turnIndex).toBe(1);

    state = passWordLadderTurn(state).nextState as WordLadderState;
    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.wasCorrect).toBe(false);
    expect(state.currentPrompt.resolvedMessage).toContain("cat");
  });

  it("solves a Bible Anagrams round when the correct letters are moved to the answer row", () => {
    let state = makeBibleAnagramsState();

    for (const letter of ["N", "O", "A", "H"]) {
      const tile = state.currentPrompt.tiles.find((entry) => entry.letter === letter && state.currentPrompt.bankTileIds.includes(entry.id));
      state = moveBibleAnagramTile(state, tile!.id, "answer").nextState as BibleAnagramsState;
    }

    expect(state.currentPrompt.answerTileIds).toHaveLength(4);
    expect(state.currentPrompt.bankTileIds).toHaveLength(0);

    state = submitBibleAnagram(state).nextState as BibleAnagramsState;

    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.wasCorrect).toBe(true);
    expect(state.stats["player-anna-1"].totalScore).toBe(10);
  });

  it("rejects an incorrect Bible Anagrams submission and passes the turn", () => {
    let state = makeBibleAnagramsState();

    // Move letters in the wrong order: H, A, O, N spells "HAON", not "NOAH"
    for (const letter of ["H", "A", "O", "N"]) {
      const tile = state.currentPrompt.tiles.find((entry) => entry.letter === letter && state.currentPrompt.bankTileIds.includes(entry.id));
      state = moveBibleAnagramTile(state, tile!.id, "answer").nextState as BibleAnagramsState;
    }

    state = submitBibleAnagram(state).nextState as BibleAnagramsState;

    expect(state.currentPrompt.phase).toBe("active");
    expect(state.turnIndex).toBe(1);
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(1);
  });

  it("reveals the answer on Bible Anagrams once all players have passed", () => {
    let state = makeBibleAnagramsState();

    state = passBibleAnagram(state).nextState as BibleAnagramsState;
    expect(state.currentPrompt.phase).toBe("active");

    state = passBibleAnagram(state).nextState as BibleAnagramsState;
    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.wasCorrect).toBe(false);
  });
});
