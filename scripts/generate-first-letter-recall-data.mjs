import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chunkIntoSessions, loadSharedVersePool, slugifyReference } from "./shared-verse-pool.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 10;

const pool = await loadSharedVersePool();
// Reverse the pool relative to Relay Verse Build's slice order so the two games don't line
// up on the exact same verses session-for-session, while both still draw from the same
// verified source list.
const orderedPool = [...pool].reverse();
const sessions = chunkIntoSessions("flr", "First Letter Recall Deck", orderedPool, ROUNDS_PER_SESSION, (entry, index) => ({
  id: `flr-r${(index + 1).toString().padStart(3, "0")}-${slugifyReference(entry.reference)}`,
  reference: entry.reference,
  sourceTranslation: "KJV",
  theme: entry.theme,
  verseText: entry.verseText,
  difficulty: entry.difficulty,
  teachingNote: entry.teachingNote
}));

const pack = {
  $schema: "https://example.local/schemas/first-letter-recall.schema.json",
  game: "first-letter-recall",
  version: 1,
  displayName: "First Letter Recall",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

await writeFile(path.join(dataDir, "first-letter-recall.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Generated first-letter-recall.json with ${sessions.length} sessions (${sessions.length * ROUNDS_PER_SESSION} rounds).`);
