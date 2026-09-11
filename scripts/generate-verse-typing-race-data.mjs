import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chunkIntoSessions, loadSharedVersePool, slugifyReference } from "./shared-verse-pool.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 5;
const MIN_WORDS = 8;
const MAX_WORDS = 25;

const pool = await loadSharedVersePool();
// Typing a very long verse against a timer is poor UX, so filter to short/medium verses.
const filteredPool = pool.filter((entry) => entry.wordCount >= MIN_WORDS && entry.wordCount <= MAX_WORDS);
const sessions = chunkIntoSessions("vtr", "Verse Typing Race Deck", filteredPool, ROUNDS_PER_SESSION, (entry, index) => ({
  id: `vtr-r${(index + 1).toString().padStart(3, "0")}-${slugifyReference(entry.reference)}`,
  reference: entry.reference,
  sourceTranslation: "KJV",
  theme: entry.theme,
  verseText: entry.verseText,
  difficulty: entry.difficulty,
  teachingNote: entry.teachingNote
}));

const pack = {
  $schema: "https://example.local/schemas/verse-typing-race.schema.json",
  game: "verse-typing-race",
  version: 1,
  displayName: "Verse Typing Race",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

await writeFile(path.join(dataDir, "verse-typing-race.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Generated verse-typing-race.json with ${sessions.length} sessions (${sessions.length * ROUNDS_PER_SESSION} rounds) from ${filteredPool.length} eligible verses.`);
