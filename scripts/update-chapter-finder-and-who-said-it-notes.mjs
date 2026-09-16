import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

function chapterReference(round) {
  const book = round.answerBook === "Psalm" ? "Psalm" : round.answerBook;
  return `${book} ${round.answerChapter}`;
}

function buildChapterFinderNote(round) {
  const reference = chapterReference(round);
  const prompt = String(round.prompt).trim().replace(/[.?!]+$/g, "");
  const clue = typeof round.clue === "string" && round.clue.trim() ? ` ${round.clue.trim().replace(/[.?!]+$/g, "")}.` : "";
  return {
    scriptureReference: reference,
    teachingNote: `${reference} is the chapter that contains "${prompt}."${clue} The prompt's specific event or wording is the detail that points to this chapter.`
  };
}

function buildWhoSaidItNote(round) {
  return `${round.reference} identifies ${round.speaker} as the speaker of "${round.quote}" ${round.context} That context is why ${round.speaker} is the correct answer.`;
}

async function updateChapterFinder() {
  const filePath = path.join(dataDir, "chapter-finder.json");
  const pack = JSON.parse(await readFile(filePath, "utf8"));
  let updated = 0;

  for (const session of pack.sessions ?? []) {
    for (const round of session.rounds ?? []) {
      const note = buildChapterFinderNote(round);
      if (round.scriptureReference !== note.scriptureReference || round.teachingNote !== note.teachingNote) {
        round.scriptureReference = note.scriptureReference;
        round.teachingNote = note.teachingNote;
        updated += 1;
      }
    }
  }

  await writeFile(filePath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log(`chapter-finder.json: updated ${updated} study notes.`);
}

async function updateWhoSaidIt() {
  const filePath = path.join(dataDir, "who-said-it.json");
  const pack = JSON.parse(await readFile(filePath, "utf8"));
  let updated = 0;

  for (const session of pack.sessions ?? []) {
    for (const round of session.rounds ?? []) {
      const note = buildWhoSaidItNote(round);
      if (round.teachingNote !== note) {
        round.teachingNote = note;
        updated += 1;
      }
    }
  }

  await writeFile(filePath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log(`who-said-it.json: updated ${updated} study notes.`);
}

await updateChapterFinder();
await updateWhoSaidIt();

export { buildChapterFinderNote, buildWhoSaidItNote };
