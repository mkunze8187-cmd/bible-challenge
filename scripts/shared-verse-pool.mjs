import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildVerseStudyNote } from "./verse-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

// Relay Verse Build, First Letter Recall, and Verse Typing Race all need a large pool of
// distinct, accurately-transcribed KJV verses. Rather than hand-retype a new list (real
// transcription-accuracy risk for a scripture app), this harvests the already-shipped,
// already-validated verse text from this repo's existing verse-based games
// (scripture-puzzles/missing-word/reference-rush/verse-scramble), deduplicated by reference.
const SOURCE_FILES = ["scripture-puzzles.json", "missing-word.json", "reference-rush.json", "verse-scramble.json"];

export async function loadSharedVersePool() {
  const pool = new Map();

  for (const fileName of SOURCE_FILES) {
    const raw = await readFile(path.join(dataDir, fileName), "utf8");
    const pack = JSON.parse(raw);

    for (const session of pack.sessions) {
      for (const round of session.rounds) {
        const reference = typeof round.reference === "string" ? round.reference.trim() : "";
        const verseText = round.verseText;

        if (!reference || typeof verseText !== "string" || !verseText.trim()) {
          continue;
        }

        if (!pool.has(reference)) {
          const generatedTeachingNote = buildVerseStudyNote({
            reference,
            verseText,
            theme: typeof round.theme === "string" && round.theme.trim() ? round.theme.trim() : "Scripture"
          });

          pool.set(reference, {
            reference,
            verseText: verseText.trim(),
            theme: typeof round.theme === "string" && round.theme.trim() ? round.theme.trim() : "Scripture",
            difficulty: round.difficulty === "easy" || round.difficulty === "medium" || round.difficulty === "hard" ? round.difficulty : "medium",
            teachingNote:
              generatedTeachingNote ||
              (typeof round.teachingNote === "string" && round.teachingNote.trim()
                ? round.teachingNote.trim()
                : `Review ${reference} before continuing.`),
            wordCount: verseText.trim().split(/\s+/).filter(Boolean).length
          });
        }
      }
    }
  }

  return Array.from(pool.values());
}

export function slugifyReference(reference) {
  return reference
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function chunkIntoSessions(prefix, titlePrefix, entries, roundsPerSession, buildRound) {
  const sessions = [];

  for (let index = 0; index < entries.length; index += roundsPerSession) {
    const sessionNumber = Math.floor(index / roundsPerSession) + 1;
    const chunk = entries.slice(index, index + roundsPerSession);

    if (chunk.length < roundsPerSession) {
      break;
    }

    sessions.push({
      id: `${prefix}-session-${sessionNumber.toString().padStart(2, "0")}`,
      title: `${titlePrefix} ${sessionNumber}`,
      theme: chunk[0].theme,
      rounds: chunk.map((entry, roundIndex) => buildRound(entry, index + roundIndex, sessionNumber))
    });
  }

  return sessions;
}
