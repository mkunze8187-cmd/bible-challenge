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
