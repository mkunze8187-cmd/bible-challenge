import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chunkIntoSessions, loadSharedVersePool, slugifyReference } from "./shared-verse-pool.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 5;

const pool = await loadSharedVersePool();
// Every verse works for a word-by-word relay regardless of length, so no filtering beyond
// what loadSharedVersePool already applies (real text, deduplicated by reference).
const sessions = chunkIntoSessions("rvb", "Relay Verse Build Deck", pool, ROUNDS_PER_SESSION, (entry, index) => ({
  id: `rvb-r${(index + 1).toString().padStart(3, "0")}-${slugifyReference(entry.reference)}`,
  reference: entry.reference,
  sourceTranslation: "KJV",
  theme: entry.theme,
  verseText: entry.verseText,
  difficulty: entry.difficulty,
  teachingNote: entry.teachingNote
}));

const pack = {
  $schema: "https://example.local/schemas/relay-verse-build.schema.json",
  game: "relay-verse-build",
  version: 1,
  displayName: "Relay Verse Build",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

await writeFile(path.join(dataDir, "relay-verse-build.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Generated relay-verse-build.json with ${sessions.length} sessions (${sessions.length * ROUNDS_PER_SESSION} rounds).`);
