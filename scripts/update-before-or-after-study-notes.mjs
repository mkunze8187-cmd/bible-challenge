import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEventStudyNote } from "./bible-event-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../src/data/before-or-after.json");

const pack = JSON.parse(await readFile(dataPath, "utf8"));
let updated = 0;

for (const session of pack.sessions ?? []) {
  for (const round of session.rounds ?? []) {
    const earlier = round.earlierEvent === "left" ? round.leftEvent : round.rightEvent;
    const later = round.earlierEvent === "left" ? round.rightEvent : round.leftEvent;
    const note = buildEventStudyNote(earlier, later);

    if (round.explanation !== note || round.teachingNote !== note) {
      round.explanation = note;
      round.teachingNote = note;
      updated += 1;
    }
  }
}

await writeFile(dataPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Updated ${updated} before-or-after study notes.`);
