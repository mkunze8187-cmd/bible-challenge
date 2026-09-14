export function scoreFiveGuesses(clueNumber: 1 | 2 | 3 | 4 | 5): number {
  return 6 - clueNumber;
}

export function scoreInitials(revealedClueCount: number): number {
  if (!Number.isInteger(revealedClueCount) || revealedClueCount < 0 || revealedClueCount > 6) {
    throw new Error("revealedClueCount must be an integer from 0 to 6.");
  }

  return 7 - revealedClueCount;
}

export function scoreScriptureLetterGuess(revealedLetterSpaces: number): number {
  if (!Number.isInteger(revealedLetterSpaces) || revealedLetterSpaces < 0) {
    throw new Error("revealedLetterSpaces must be a non-negative integer.");
  }

  return revealedLetterSpaces;
}

export function scoreScriptureSolve(remainingHiddenLetterSpaces: number): number {
  if (!Number.isInteger(remainingHiddenLetterSpaces) || remainingHiddenLetterSpaces < 0) {
    throw new Error("remainingHiddenLetterSpaces must be a non-negative integer.");
  }

  return 10 + remainingHiddenLetterSpaces;
}

export function scoreProphecyRetry(wrongGuessCount: number): number {
  if (!Number.isInteger(wrongGuessCount) || wrongGuessCount < 0) {
    throw new Error("wrongGuessCount must be a non-negative integer.");
  }

  return wrongGuessCount >= 3 ? 1 : 5 - wrongGuessCount;
}

export function scoreVerseTypingRace(wpm: number, accuracy: number): number {
  if (!Number.isFinite(wpm) || wpm < 0) {
    throw new Error("wpm must be a non-negative number.");
  }

  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 1) {
    throw new Error("accuracy must be a number from 0 to 1.");
  }

  return Math.max(0, Math.round(wpm * accuracy));
}

export function scoreWordLadder(stepsTaken: number, minSteps: number): number {
  if (!Number.isInteger(stepsTaken) || stepsTaken <= 0) {
    throw new Error("stepsTaken must be a positive integer.");
  }

  if (!Number.isInteger(minSteps) || minSteps <= 0) {
    throw new Error("minSteps must be a positive integer.");
  }

  return Math.max(1, 10 - Math.max(0, stepsTaken - minSteps));
}
