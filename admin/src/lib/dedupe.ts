// Same normalize-and-compare convention the main app uses for alias/answer matching
// (src/lib/gameEngine.ts's normalizeText) — case/whitespace/punctuation-insensitive.
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds a normalized "fingerprint" string for one round, from a small set of key text
 * fields likely to indicate the round is a duplicate if they match exactly (after
 * normalization). Different games key on different fields — callers pass in which fields
 * to use for a given game (see DEDUPE_KEY_FIELDS_BY_GAME below).
 */
export function fingerprintRound(round: Record<string, unknown>, keyFields: string[]): string {
  return keyFields
    .map((field) => {
      const value = round[field];
      if (typeof value === "string") {
        return normalizeText(value);
      }
      if (Array.isArray(value)) {
        return value
          .filter((entry): entry is string => typeof entry === "string")
          .map(normalizeText)
          .sort()
          .join("|");
      }
      return "";
    })
    .join("::");
}

export interface DedupeResult<T> {
  accepted: T[];
  duplicates: Array<{ candidate: T; matchedFingerprint: string; reason: "existing" | "within-batch" }>;
}

/**
 * Checks a batch of candidate rounds against both the existing pack's rounds and each
 * other, flagging exact-fingerprint duplicates. Never silently drops anything — the
 * caller is expected to present `duplicates` to the admin author for explicit
 * accept/reject before writing `accepted` (or any accepted duplicates) to disk.
 */
export function findDuplicates<T extends Record<string, unknown>>(
  candidates: T[],
  existingRounds: T[],
  keyFields: string[]
): DedupeResult<T> {
  const existingFingerprints = new Set(existingRounds.map((round) => fingerprintRound(round, keyFields)));
  const seenInBatch = new Set<string>();
  const accepted: T[] = [];
  const duplicates: DedupeResult<T>["duplicates"] = [];

  for (const candidate of candidates) {
    const fingerprint = fingerprintRound(candidate, keyFields);

    if (existingFingerprints.has(fingerprint)) {
      duplicates.push({ candidate, matchedFingerprint: fingerprint, reason: "existing" });
      continue;
    }

    if (seenInBatch.has(fingerprint)) {
      duplicates.push({ candidate, matchedFingerprint: fingerprint, reason: "within-batch" });
      continue;
    }

    seenInBatch.add(fingerprint);
    accepted.push(candidate);
  }

  return { accepted, duplicates };
}

// Per-game key fields for dedup fingerprinting — the text field(s) most likely to
// indicate two rounds are "the same content" if they match. Not exhaustive/perfect (a
// deliberately reworded duplicate won't be caught), but catches accidental re-adds and
// exact re-imports, which is the realistic failure mode for a batch-add flow.
export const DEDUPE_KEY_FIELDS_BY_GAME: Record<string, string[]> = {
  "five-guesses": ["answer", "aliases"],
  initials: ["answer", "aliases"],
  "scripture-puzzles": ["reference"],
  "bible-timeline": ["prompt"],
  "verse-scramble": ["reference"],
  "bible-connections": ["title"],
  "name-that-book": ["book"],
  "before-or-after": ["leftEvent", "rightEvent"],
  "reference-rush": ["reference"],
  "chapter-finder": ["answerBook", "answerChapter", "prompt"],
  "who-said-it": ["quote"],
  "bible-books-relay": ["title", "books"],
  "missing-word": ["reference", "missingWords"],
  "prophecy-match": ["prophecyReference", "fulfillmentReference"],
  "messiah-prophecy": ["prophecyReference", "prompt"],
  "prophecy-clue-ladder": ["answer", "reference"],
  "fulfillment-finder": ["fulfillmentReference", "correctProphecyReference"],
  "prophecy-categories": ["title"],
  "complete-the-verse": ["reference", "correctEnding"],
  "wisdom-match": ["reference", "correctTheme"],
  "psalm-theme": ["reference", "correctTheme"],
  "proverb-categories": ["title"],
  "psalm-reference-finder": ["correctReference", "excerpt"],
  "two-truths-and-a-lie": ["subject", "statements"],
  "relay-verse-build": ["reference"],
  "verse-typing-race": ["reference"],
  "word-ladder": ["startWord", "endWord"],
  "bible-anagrams": ["answer"],
  "bible-cryptogram": ["reference", "verseText"]
};
