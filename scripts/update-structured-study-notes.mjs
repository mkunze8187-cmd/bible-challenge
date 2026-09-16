import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildBibleAnagramStudyNote,
  buildBibleConnectionsStudyNote,
  buildBooksRelayStudyNote,
  buildCategoryBoardStudyNote,
  buildGenericWordLadderStudyNote,
  buildNameThatBookStudyNote,
  buildTimelineStudyNote
} from "./structured-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

async function updatePack(fileName, buildNote) {
  const filePath = path.join(dataDir, fileName);
  const pack = JSON.parse(await readFile(filePath, "utf8"));
  let updated = 0;

  for (const session of pack.sessions ?? []) {
    for (const round of session.rounds ?? []) {
      const note = buildNote(round);
      const nextReference = note.scriptureReference;
      const referenceChanged = nextReference != null && round.scriptureReference !== nextReference;
      const noteChanged = round.teachingNote !== note.teachingNote;

      if (referenceChanged) {
        round.scriptureReference = nextReference;
      }

      if (noteChanged) {
        round.teachingNote = note.teachingNote;
      }

      if (referenceChanged || noteChanged) {
        updated += 1;
      }
    }
  }

  await writeFile(filePath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log(`${fileName}: updated ${updated} study notes.`);
}

await updatePack("bible-books-relay.json", buildBooksRelayStudyNote);
await updatePack("bible-timeline.json", buildTimelineStudyNote);
await updatePack("bible-anagrams.json", buildBibleAnagramStudyNote);
await updatePack("bible-connections.json", buildBibleConnectionsStudyNote);
await updatePack("name-that-book.json", buildNameThatBookStudyNote);
await updatePack("prophecy-categories.json", buildCategoryBoardStudyNote);
await updatePack("proverb-categories.json", buildCategoryBoardStudyNote);
await updatePack("word-ladder.json", (round) =>
  round.scriptureReference ? { teachingNote: round.teachingNote } : buildGenericWordLadderStudyNote(round)
);
