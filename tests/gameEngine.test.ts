import { describe, expect, it, vi } from "vitest";
import oddOneOutData from "../src/data/odd-one-out.json";
import {
  continueGame,
  createSessionState,
  getCurrentActorLabel,
  moveBibleAnagramTile,
  passBibleAnagram,
  passBibleCryptogramTurn,
  passGenealogyTurn,
  passRelayWord,
  passScriptureTurn,
  passWordLadderTurn,
  removeLastGenealogyLink,
  removeLastWordLadderRung,
  selectParableMatchCard,
  reorderBibleBook,
  reorderTimelineEvent,
  selectBoardCard,
  selectTwoTruthsStatement,
  submitBibleAnagram,
  submitBibleCryptogramLetterGuess,
  submitBibleCryptogramSolve,
  submitBoardGuess,
  submitGenealogyStep,
  submitOddOneOutChoice,
  submitParableMatch,
  submitRelayWord,
  submitScriptureLetterGuess,
  submitScriptureSolve,
  submitWordLadderStep,
  type BibleAnagramsState,
  type BibleBooksRelayState,
  type BibleCryptogramState,
  type BibleTimelineState,
  type BeforeOrAfterState,
  type FiveGuessesState,
  type GenealogyState,
  type InitialsState,
  type OddOneOutState,
  type ParableMatchState,
  type RelayVerseBuildState,
  type ScriptureState,
  type TwoTruthsAndALieState,
  type WhoSaidItState,
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

function makeGenealogyState(): GenealogyState {
  const round = {
    id: "gen-test-1",
    startPerson: "Abraham",
    endPerson: "Judah",
    fullChain: ["abraham", "isaac", "jacob", "judah"],
    startFlavorText: "Received God's covenant promises.",
    endFlavorText: "Ancestor of the royal line.",
    scriptureReference: "Matthew 1:2",
    theme: "Test",
    difficulty: "easy" as const,
    teachingNote: "Note."
  };

  return {
    gameId: "genealogy",
    displayName: "Fill in the Genealogy",
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
      kind: "genealogy",
      round,
      chain: [round.startPerson],
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
      cipherGuesses: {},
      isComplete: false,
      winnerParticipantId: null,
      completedReason: null
    }
  };
}

function makeBibleTimelineState(): BibleTimelineState {
  const events = [
    { id: "event-a", label: "Creation", order: 1 },
    { id: "event-b", label: "Exodus", order: 2 },
    { id: "event-c", label: "Exile", order: 3 },
    { id: "event-d", label: "Resurrection", order: 4 }
  ];
  const round = { id: "bt-test-1", prompt: "Put these in order", events };

  return {
    gameId: "bible-timeline",
    displayName: "Bible Timeline",
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
      kind: "bible-timeline",
      round,
      // Shuffled relative to `order` so a reorder actually has to move something.
      arrangedEventIds: ["event-d", "event-a", "event-c", "event-b"],
      attemptedParticipantIds: [],
      phase: "active",
      wasCorrect: null,
      resolvedMessage: null
    }
  };
}

function makeBibleBooksRelayState(): BibleBooksRelayState {
  const books = ["Genesis", "Exodus", "Leviticus", "Numbers"];
  const round = { id: "bbr-test-1", title: "Order the books", section: "Pentateuch", books };

  return {
    gameId: "bible-books-relay",
    displayName: "Bible Books Relay",
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
      kind: "bible-books-relay",
      round,
      arrangedBooks: ["Numbers", "Genesis", "Leviticus", "Exodus"],
      attemptedParticipantIds: [],
      phase: "active",
      wasCorrect: null,
      resolvedMessage: null
    }
  };
}

function makeResolvedBeforeOrAfterState(): BeforeOrAfterState {
  const rounds = [
    {
      id: "boa-test-1",
      leftEvent: "Creation",
      rightEvent: "Flood",
      earlierEvent: "left" as const,
      explanation: "Creation comes before the flood.",
      theme: "Test",
      teachingNote: "Creation comes before the flood."
    },
    {
      id: "boa-test-2",
      leftEvent: "Exodus",
      rightEvent: "Resurrection",
      earlierEvent: "left" as const,
      explanation: "The Exodus comes before the resurrection.",
      theme: "Test",
      teachingNote: "The Exodus comes before the resurrection."
    }
  ];

  return {
    gameId: "before-or-after",
    displayName: "Before or After",
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
    totalPrompts: 2,
    resolvedPrompts: 0,
    roundIndex: 0,
    rounds,
    currentPrompt: {
      kind: "before-or-after",
      round: rounds[0],
      attemptedParticipantIds: [],
      selectedAnswer: "left",
      phase: "resolved",
      wasCorrect: true,
      resolvedMessage: "Correct."
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

  it("records Bible Cryptogram letter points and allows mapping more cipher letters without solving or passing", () => {
    let state = makeBibleCryptogramState("CAT");

    // The test cipher map shifts every real letter forward by one, so "CAT" is displayed
    // as "DBU" — cipher letter "d" decodes to real letter "c".
    state = submitBibleCryptogramLetterGuess(state, "d", "c").nextState as BibleCryptogramState;

    expect(state.currentPrompt.cipherGuesses).toEqual({ d: "c" });
    expect(state.stats["player-anna-1"].totalScore).toBe(1);
    expect(state.stats["player-anna-1"].letterRevealPoints).toBe(1);

    // Unlike Verse Reveal, a letter guess never forces a solve-or-pass before the next one
    // — the same player can keep filling in cipher letters freely.
    state = submitBibleCryptogramLetterGuess(state, "b", "a").nextState as BibleCryptogramState;
    expect(state.currentPrompt.cipherGuesses).toEqual({ d: "c", b: "a" });
    expect(state.turnIndex).toBe(0);
  });

  it("only fills the solve-so-far board for the one cipher letter guessed, and only when correct", () => {
    let state = makeBibleCryptogramState("CAT");

    // "c" is not what cipher letter "d" decodes to (the real answer is "c" for "d"; here
    // we guess the wrong real letter), so it must miss and not affect any other box.
    state = submitBibleCryptogramLetterGuess(state, "d", "z").nextState as BibleCryptogramState;
    expect(state.currentPrompt.cipherGuesses).toEqual({ d: "z" });
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(1);
    expect(state.stats["player-anna-1"].totalScore).toBe(0);
  });

  it("blocks reusing a real letter that's already guessed for a different cipher letter", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "d", "c").nextState as BibleCryptogramState;

    expect(() => submitBibleCryptogramLetterGuess(state, "b", "c")).toThrow("already your guess");
  });

  it("lets a player freely edit their own guess for a cipher letter", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "d", "z").nextState as BibleCryptogramState;
    expect(state.currentPrompt.cipherGuesses.d).toBe("z");

    state = submitBibleCryptogramLetterGuess(state, "d", "c").nextState as BibleCryptogramState;
    expect(state.currentPrompt.cipherGuesses.d).toBe("c");
    expect(state.stats["player-anna-1"].totalScore).toBe(1);
  });

  it("rotates Bible Cryptogram turns on pass and records incorrect solve attempts", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "d", "z").nextState as BibleCryptogramState;
    state = passBibleCryptogramTurn(state).nextState as BibleCryptogramState;

    expect(state.turnIndex).toBe(1);
    expect(state.participants[0].turnCounter).toBe(1);

    state = submitBibleCryptogramLetterGuess(state, "d", "c").nextState as BibleCryptogramState;
    state = submitBibleCryptogramSolve(state, "wrong").nextState as BibleCryptogramState;

    expect(state.turnIndex).toBe(0);
    expect(state.stats["player-ben-2"].incorrectAttempts).toBe(1);
    expect(state.participants[1].turnCounter).toBe(1);
  });

  it("marks the Bible Cryptogram game completed after continuing from the final solved round", () => {
    let state = makeBibleCryptogramState("CAT");

    state = submitBibleCryptogramLetterGuess(state, "d", "c").nextState as BibleCryptogramState;
    state = submitBibleCryptogramSolve(state, "CAT").nextState as BibleCryptogramState;
    expect(state.currentPrompt.isComplete).toBe(true);
    expect(state.currentPrompt.winnerParticipantId).toBe("player-anna-1");
    expect(state.stats["player-anna-1"].correctFullSolves).toBe(1);

    state = continueGame(state).nextState as BibleCryptogramState;

    expect(state.status).toBe("completed");
    expect(state.resolvedPrompts).toBe(1);
  });

  it("moves a Bible Timeline card directly to a dropped-on slot in one step", () => {
    let state = makeBibleTimelineState();

    expect(state.currentPrompt.arrangedEventIds).toEqual(["event-d", "event-a", "event-c", "event-b"]);

    // Drag "event-d" (index 0) onto the slot currently held by "event-b" (index 3) — a
    // single drop spanning three positions, not three separate arrow-key steps.
    state = reorderTimelineEvent(state, "event-d", 3).nextState as BibleTimelineState;

    expect(state.currentPrompt.arrangedEventIds).toEqual(["event-a", "event-c", "event-b", "event-d"]);
  });

  it("leaves the Bible Timeline order unchanged when dropped back on its own slot", () => {
    let state = makeBibleTimelineState();

    state = reorderTimelineEvent(state, "event-a", 1).nextState as BibleTimelineState;

    expect(state.currentPrompt.arrangedEventIds).toEqual(["event-d", "event-a", "event-c", "event-b"]);
  });

  it("moves a Bible Books Relay tile directly to a dropped-on slot in one step", () => {
    let state = makeBibleBooksRelayState();

    expect(state.currentPrompt.arrangedBooks).toEqual(["Numbers", "Genesis", "Leviticus", "Exodus"]);

    state = reorderBibleBook(state, "Numbers", 3).nextState as BibleBooksRelayState;

    expect(state.currentPrompt.arrangedBooks).toEqual(["Genesis", "Leviticus", "Exodus", "Numbers"]);
  });

  it("uses multiple choice for easier Who Said It rounds", async () => {
    const state = (await createSessionState({
      gameId: "who-said-it",
      participantMode: "individual",
      difficulty: "easy",
      individualNames: ["Anna", "Ben"]
    })) as WhoSaidItState;

    expect(state.currentPrompt.round.difficulty).toBe("easy");
    expect(state.currentPrompt.choices).toContain(state.currentPrompt.round.speaker);
    expect(state.currentPrompt.choices?.length).toBeGreaterThan(1);
  });

  it("keeps hard Who Said It rounds as typed answers", async () => {
    const state = (await createSessionState({
      gameId: "who-said-it",
      participantMode: "individual",
      difficulty: "hard",
      individualNames: ["Anna", "Ben"]
    })) as WhoSaidItState;

    expect(state.currentPrompt.round.difficulty).toBe("hard");
    expect(state.currentPrompt.choices).toBeNull();
  });

  it("randomizes Before or After left/right display while preserving the correct side", () => {
    const randomSpy = vi.spyOn(Math, "random");

    try {
      randomSpy.mockReturnValueOnce(0.25);
      let state = continueGame(makeResolvedBeforeOrAfterState()).nextState as BeforeOrAfterState;
      expect(state.currentPrompt.round.leftEvent).toBe("Resurrection");
      expect(state.currentPrompt.round.rightEvent).toBe("Exodus");
      expect(state.currentPrompt.round.earlierEvent).toBe("right");
      expect(state.rounds[1].leftEvent).toBe("Exodus");
      expect(state.rounds[1].earlierEvent).toBe("left");

      randomSpy.mockReturnValueOnce(0.75);
      state = continueGame(makeResolvedBeforeOrAfterState()).nextState as BeforeOrAfterState;
      expect(state.currentPrompt.round.leftEvent).toBe("Exodus");
      expect(state.currentPrompt.round.rightEvent).toBe("Resurrection");
      expect(state.currentPrompt.round.earlierEvent).toBe("left");
    } finally {
      randomSpy.mockRestore();
    }
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

  it("scores Odd One Out after a miss with stepped-down points", async () => {
    let state = (await createSessionState({
      gameId: "odd-one-out",
      participantMode: "individual",
      individualNames: ["Anna", "Ben"]
    })) as OddOneOutState;
    const wrongChoice = state.currentPrompt.round.items.find((item) => item !== state.currentPrompt.round.oddItem)!;

    state = submitOddOneOutChoice(state, wrongChoice).nextState as OddOneOutState;
    expect(state.currentPrompt.phase).toBe("active");
    expect(state.currentPrompt.eliminatedChoices).toContain(wrongChoice);
    expect(state.stats["player-anna-1"].incorrectAttempts).toBe(1);

    state = submitOddOneOutChoice(state, state.currentPrompt.round.oddItem).nextState as OddOneOutState;
    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.wasCorrect).toBe(true);
    expect(state.stats["player-ben-2"].totalScore).toBe(4);
  });

  it("ships Odd One Out content without repeated correct-item sets", () => {
    const rounds = oddOneOutData.sessions.flatMap((session) => session.rounds);
    const correctSetKeys = rounds.map((round) =>
      round.items
        .filter((item) => item !== round.oddItem)
        .slice()
        .sort()
        .join("|")
    );

    expect(new Set(correctSetKeys).size).toBe(correctSetKeys.length);
  });

  it("starts the newest games without falling back from restrictive difficulty filters", async () => {
    const oddOneOut = (await createSessionState({
      gameId: "odd-one-out",
      participantMode: "individual",
      individualNames: ["Anna", "Ben"],
      difficulty: "hard"
    })) as OddOneOutState;
    expect(oddOneOut.rounds).toHaveLength(10);
    expect(oddOneOut.rounds.every((round) => round.difficulty === "hard")).toBe(true);
    expect(oddOneOut.activityLog[0].text).not.toContain("mixed difficulty");

    const genealogy = (await createSessionState({
      gameId: "genealogy",
      participantMode: "individual",
      individualNames: ["Anna", "Ben"],
      difficulty: "medium"
    })) as GenealogyState;
    expect(genealogy.rounds).toHaveLength(6);
    expect(genealogy.rounds.every((round) => round.difficulty === "medium")).toBe(true);
    expect(genealogy.activityLog[0].text).not.toContain("mixed difficulty");

    const parableMatch = (await createSessionState({
      gameId: "parable-match",
      participantMode: "individual",
      individualNames: ["Anna", "Ben"],
      difficulty: "hard"
    })) as ParableMatchState;
    expect(parableMatch.pairs).toHaveLength(5);
    expect(parableMatch.pairs.every((pair) => pair.difficulty === "hard")).toBe(true);
    expect(parableMatch.activityLog[0].text).not.toContain("mixed difficulty");
  });

  it("builds and edits a Genealogy chain using authored next names", async () => {
    let state = makeGenealogyState();
    const firstNextName = state.currentPrompt.round.fullChain[1];

    state = submitGenealogyStep(state, firstNextName).nextState as GenealogyState;
    expect(state.currentPrompt.chain).toEqual([state.currentPrompt.round.startPerson, firstNextName]);

    state = removeLastGenealogyLink(state).nextState as GenealogyState;
    expect(state.currentPrompt.chain).toEqual([state.currentPrompt.round.startPerson]);

    state = passGenealogyTurn(state).nextState as GenealogyState;
    expect(state.turnIndex).toBe(1);
    expect(state.currentPrompt.phase).toBe("active");
  });

  it("completes a Genealogy round when every authored link is submitted", async () => {
    let state = makeGenealogyState();

    for (const name of state.currentPrompt.round.fullChain.slice(1)) {
      state = submitGenealogyStep(state, name).nextState as GenealogyState;
    }

    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.wasCorrect).toBe(true);
    expect(state.stats["player-anna-1"].roundWins).toBe(1);
    expect(state.stats["player-anna-1"].totalScore).toBeGreaterThan(0);
  });

  it("matches Parable Match cards and completes the board", async () => {
    let state = (await createSessionState({
      gameId: "parable-match",
      participantMode: "individual",
      individualNames: ["Anna", "Ben"]
    })) as ParableMatchState;

    for (const pair of state.pairs) {
      const parable = state.currentPrompt.parableCards.find((card) => card.pairId === pair.id)!;
      const lesson = state.currentPrompt.lessonCards.find((card) => card.pairId === pair.id)!;
      state = selectParableMatchCard(state, "parable", parable.id).nextState as ParableMatchState;
      state = selectParableMatchCard(state, "lesson", lesson.id).nextState as ParableMatchState;
      state = submitParableMatch(state).nextState as ParableMatchState;
    }

    expect(state.currentPrompt.phase).toBe("resolved");
    expect(state.currentPrompt.matchedPairIds).toHaveLength(state.totalPrompts);
    expect(state.resolvedPrompts).toBe(state.totalPrompts);
  });

  describe("maxPrompts", () => {
    it("caps a round-based game to the requested prompt count", async () => {
      const state = (await createSessionState({
        gameId: "who-said-it",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"],
        maxPrompts: 2
      })) as WhoSaidItState;

      expect(state.totalPrompts).toBe(2);
    });

    it("caps the Five Clues board to the requested card count", async () => {
      const state = (await createSessionState({
        gameId: "five-guesses",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"],
        maxPrompts: 2
      })) as FiveGuessesState;

      expect(state.boardCards).toHaveLength(2);
      expect(state.totalPrompts).toBe(2);
    });

    it("caps the Bible Initials board to the requested card count", async () => {
      const state = (await createSessionState({
        gameId: "initials",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"],
        maxPrompts: 2
      })) as InitialsState;

      expect(state.boardCards).toHaveLength(2);
      expect(state.totalPrompts).toBe(2);
    });

    it("never picks fewer than one prompt, even when maxPrompts is 0 or negative", async () => {
      const zero = (await createSessionState({
        gameId: "who-said-it",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"],
        maxPrompts: 0
      })) as WhoSaidItState;
      const negative = (await createSessionState({
        gameId: "who-said-it",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"],
        maxPrompts: -5
      })) as WhoSaidItState;

      // maxPrompts <= 0 is treated as "no cap" (falls back to the game's normal default),
      // matching capPromptCount's guard — it must never throw or produce a zero-prompt session.
      expect(zero.totalPrompts).toBeGreaterThan(0);
      expect(negative.totalPrompts).toBeGreaterThan(0);
    });

    it("leaves the session unchanged when maxPrompts is not set", async () => {
      const withCap = (await createSessionState({
        gameId: "who-said-it",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"],
        maxPrompts: 3
      })) as WhoSaidItState;
      const withoutCap = (await createSessionState({
        gameId: "who-said-it",
        participantMode: "individual",
        individualNames: ["Anna", "Ben"]
      })) as WhoSaidItState;

      expect(withCap.totalPrompts).toBe(3);
      expect(withoutCap.totalPrompts).toBeGreaterThan(withCap.totalPrompts);
    });
  });
});
