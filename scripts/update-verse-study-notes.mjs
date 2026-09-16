import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildVerseStudyNote } from "./verse-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const files = (await readdir(dataDir))
  .filter((fileName) => fileName.endsWith(".json") && fileName !== "word-ladder-dictionary.json")
  .sort();

let totalUpdated = 0;

for (const fileName of files) {
  const filePath = path.join(dataDir, fileName);
  const pack = JSON.parse(await readFile(filePath, "utf8"));
  let fileUpdated = 0;

  for (const session of pack.sessions ?? []) {
    for (const round of session.rounds ?? []) {
      const note = buildVerseStudyNote(round);
      if (!note) {
        continue;
      }

      if (round.teachingNote !== note) {
        round.teachingNote = note;
        fileUpdated += 1;
      }
    }
  }

  if (fileUpdated > 0) {
    await writeFile(filePath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
    console.log(`${fileName}: updated ${fileUpdated} verse study notes.`);
    totalUpdated += fileUpdated;
  }
}

console.log(`Updated ${totalUpdated} verse study notes.`);
