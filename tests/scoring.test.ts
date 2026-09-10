import { describe, expect, it } from "vitest";
import {
  scoreFiveGuesses,
  scoreInitials,
  scoreProphecyRetry,
  scoreScriptureLetterGuess,
  scoreScriptureSolve
} from "../src/lib/scoring";

describe("scoring", () => {
  it("scores Five Clues by revealed clue number", () => {
    expect(scoreFiveGuesses(1)).toBe(5);
    expect(scoreFiveGuesses(3)).toBe(3);
    expect(scoreFiveGuesses(5)).toBe(1);
  });

  it("scores Initials from unrevealed to fully revealed clues", () => {
    expect(scoreInitials(0)).toBe(7);
    expect(scoreInitials(3)).toBe(4);
    expect(scoreInitials(6)).toBe(1);
  });

  it("rejects invalid Initials clue counts", () => {
    expect(() => scoreInitials(-1)).toThrow("integer from 0 to 6");
    expect(() => scoreInitials(7)).toThrow("integer from 0 to 6");
    expect(() => scoreInitials(1.5)).toThrow("integer from 0 to 6");
  });

  it("scores Verse Reveal letter and solve actions", () => {
    expect(scoreScriptureLetterGuess(0)).toBe(0);
    expect(scoreScriptureLetterGuess(4)).toBe(4);
    expect(scoreScriptureSolve(0)).toBe(10);
    expect(scoreScriptureSolve(6)).toBe(16);
  });

  it("scores prophecy retries with a one-point floor after three wrong guesses", () => {
    expect(scoreProphecyRetry(0)).toBe(5);
    expect(scoreProphecyRetry(1)).toBe(4);
    expect(scoreProphecyRetry(2)).toBe(3);
    expect(scoreProphecyRetry(3)).toBe(1);
    expect(scoreProphecyRetry(8)).toBe(1);
  });
});
