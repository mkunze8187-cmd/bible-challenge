// Central randomness source for game logic. Everything that needs "pick a random thing" or
// "shuffle this array" during gameplay should go through random()/shuffle() here instead of
// calling Math.random() directly, so that automated tests can seed a deterministic sequence
// with setRandomSeed() and get repeatable question selection, shuffles, and ordering.
//
// Outside of test mode this behaves exactly like Math.random() — nothing changes for a normal
// player. See specs/automated-testing-spec.md section 4.2.

let seededNext: (() => number) | null = null;

// mulberry32: a small, fast, deterministic 32-bit PRNG. Good enough for shuffles and round
// selection — this is not used for anything security-sensitive.
function createMulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a pseudo-random number in [0, 1), like Math.random(). Uses the seeded generator
 * when one has been installed via setRandomSeed(), otherwise falls back to Math.random().
 */
export function random(): number {
  return seededNext ? seededNext() : Math.random();
}

/**
 * Installs a deterministic seed so subsequent random() and shuffle() calls become repeatable.
 * Pass null to clear the seed and return to Math.random(). Intended for test mode only —
 * normal app startup never calls this.
 */
export function setRandomSeed(seed: number | null): void {
  seededNext = seed === null ? null : createMulberry32(seed);
}

/**
 * Returns whether a seed is currently installed (useful for assertions in tests).
 */
export function isRandomSeeded(): boolean {
  return seededNext !== null;
}

/**
 * Fisher-Yates shuffle using random(). Does not mutate the input array.
 */
export function shuffle<T>(values: T[]): T[] {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
