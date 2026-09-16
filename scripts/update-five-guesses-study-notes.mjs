import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../src/data/five-guesses.json");

const manualNotes = {
  Moses: {
    scriptureReference: "Exodus 3:1-10; Exodus 14:21-31; Exodus 20:1-17",
    teachingNote: "Moses is identified by the burning bush call, the Red Sea crossing, and receiving the law at Sinai; those Exodus anchors explain why he fits every clue."
  },
  Passover: {
    scriptureReference: "Exodus 12:1-14",
    teachingNote: "Exodus 12 ties Passover to the marked Israelite houses and the final plague, which is why the clues focus on blood, urgency, and deliverance from Egypt."
  },
  Manna: {
    scriptureReference: "Exodus 16:13-31",
    teachingNote: "Exodus 16 describes manna appearing with the morning dew and being gathered daily, so the clues point to God's wilderness provision."
  },
  Joshua: {
    scriptureReference: "Numbers 14:6-9; Joshua 1:1-9; Joshua 6:20",
    teachingNote: "Joshua is anchored by his faithful spy report, the command to be strong and courageous, and Jericho falling under his leadership."
  },
  Tabernacle: {
    scriptureReference: "Exodus 25:8-9; Exodus 40:17-34",
    teachingNote: "The tabernacle was Israel's portable sanctuary; Exodus gives its pattern and then records it being set up in the wilderness."
  },
  Elijah: {
    scriptureReference: "1 Kings 17:2-16; 1 Kings 18:20-40; 2 Kings 2:11",
    teachingNote: "Elijah's clues come from the brook and widow provision, the Mount Carmel confrontation, and his being taken up in a whirlwind."
  },
  Jezebel: {
    scriptureReference: "1 Kings 18:4; 1 Kings 19:1-2; 1 Kings 21:5-16",
    teachingNote: "Jezebel is identified by her opposition to the Lord's prophets, her threat against Elijah, and her role in Naboth's vineyard."
  },
  Daniel: {
    scriptureReference: "Daniel 1:8-20; Daniel 6:10-23",
    teachingNote: "Daniel's Babylon setting, disciplined faith, dream wisdom, and deliverance from lions all point to the same exile-era servant of God."
  },
  Nehemiah: {
    scriptureReference: "Nehemiah 1:1-11; Nehemiah 4:15-18; Nehemiah 6:15-16",
    teachingNote: "Nehemiah's clues center on his prayerful grief over Jerusalem's walls and the guarded rebuilding work that finished the wall."
  },
  Esther: {
    scriptureReference: "Esther 4:13-16; Esther 7:1-6",
    teachingNote: "Esther risked approaching the king and used the banquet setting to expose Haman's plot against the Jews."
  },
  Bethlehem: {
    scriptureReference: "Micah 5:2; Luke 2:4-7",
    teachingNote: "Bethlehem is the city named in Micah's messianic prophecy and Luke's account of Jesus's birth."
  },
  Nicodemus: {
    scriptureReference: "John 3:1-10; John 19:39-40",
    teachingNote: "Nicodemus first comes to Jesus by night in John 3 and later helps care for Jesus's body in John 19."
  },
  Beatitudes: {
    scriptureReference: "Matthew 5:1-12",
    teachingNote: "The Beatitudes open the Sermon on the Mount with repeated blessings such as the poor in spirit, the meek, and the merciful."
  },
  Zacchaeus: {
    scriptureReference: "Luke 19:1-10",
    teachingNote: "Luke 19 identifies Zacchaeus as the short tax collector who climbed a sycamore tree and responded to Jesus with repentance."
  },
  Galilee: {
    scriptureReference: "Matthew 4:12-23",
    teachingNote: "Galilee is central to Jesus's early ministry, where He preached, called disciples, and ministered around the sea."
  },
  Pentecost: {
    scriptureReference: "Acts 2:1-4",
    teachingNote: "Acts 2 places Pentecost after the ascension, when the Holy Spirit came and the gathered believers began speaking as enabled."
  },
  Stephen: {
    scriptureReference: "Acts 6:8-15; Acts 7:54-60",
    teachingNote: "Stephen is identified by his Spirit-filled witness before the council and his martyrdom while praying for his killers."
  },
  Lydia: {
    scriptureReference: "Acts 16:14-15",
    teachingNote: "Acts 16 names Lydia as a seller of purple from Thyatira whose heart the Lord opened in Philippi."
  },
  "Philippian Jailer": {
    scriptureReference: "Acts 16:25-34",
    teachingNote: "The Philippian jailer is tied to the midnight earthquake, his question about salvation, and his household's baptism."
  },
  "Damascus Road": {
    scriptureReference: "Acts 9:1-19",
    teachingNote: "Acts 9 records Saul meeting the risen Jesus on the road to Damascus, the turning point behind the conversion clues."
  },
  Proverbs: {
    scriptureReference: "Proverbs 1:1-7",
    teachingNote: "Proverbs identifies itself with wisdom, instruction, and the fear of the Lord as the beginning of knowledge."
  },
  Ecclesiastes: {
    scriptureReference: "Ecclesiastes 1:1-11; Ecclesiastes 12:13",
    teachingNote: "Ecclesiastes wrestles with vanity and meaning, then ends by calling people to fear God and keep His commandments."
  },
  Job: {
    scriptureReference: "Job 1:1-22; Job 42:1-17",
    teachingNote: "Job is anchored by righteous suffering, honest wrestling, and God's final restoration after Job refuses to curse God."
  },
  Psalms: {
    scriptureReference: "Psalm 1:1-6; Psalm 150:1-6",
    teachingNote: "Psalms spans prayer, lament, wisdom, and praise, from the blessed man of Psalm 1 to the closing call for everything to praise the Lord."
  },
  "Song of Songs": {
    scriptureReference: "Song of Solomon 1:1-4; Song of Solomon 8:6-7",
    teachingNote: "Song of Songs is poetic love literature, using vivid imagery and covenant-like devotion to celebrate faithful love."
  }
};

function getClueValue(clues, prefix) {
  const clue = clues.find((entry) => entry.startsWith(prefix));
  return clue ? clue.slice(prefix.length).replace(/\.$/, "").trim() : "";
}

function buildReferenceCardNote(round) {
  if (!/^[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+$/.test(round.answer)) {
    return null;
  }

  const clues = Array.isArray(round.clues) ? round.clues : [];
  const testament = getClueValue(clues, "This answer is a KJV scripture reference from the ");
  const bookClue = getClueValue(clues, "It belongs to ");
  const chapter = getClueValue(clues, "The verse is in chapter ");
  const theme = getClueValue(clues, "Theme clue: ");
  const opening = getClueValue(clues, "The verse begins, ").replace(/^"|"$/g, "");
  const bookParts = bookClue.match(/^(.+), in the (.+) section$/);
  const book = bookParts ? bookParts[1] : bookClue;
  const section = bookParts ? bookParts[2] : round.category;
  const themeText = theme ? theme[0].toUpperCase() + theme.slice(1) : "";

  return {
    scriptureReference: round.answer,
    teachingNote: `${round.answer} is the target ${testament || "KJV"} reference${book ? ` in ${book}` : ""}${section ? `, within the ${section} section` : ""}${chapter ? `, chapter ${chapter}` : ""}. The clues anchor it with ${themeText ? `${themeText} and ` : ""}the opening words "${opening || "the verse text"}."`
      .replace("..", ".")
  };
}

const pack = JSON.parse(await readFile(dataPath, "utf8"));
let updated = 0;

for (const session of pack.sessions ?? []) {
  for (const round of session.rounds ?? []) {
    const manual = manualNotes[round.answer];
    const generated = manual ?? buildReferenceCardNote(round);

    if (!generated) {
      continue;
    }

    if (round.scriptureReference !== generated.scriptureReference || round.teachingNote !== generated.teachingNote) {
      round.scriptureReference = generated.scriptureReference;
      round.teachingNote = generated.teachingNote;
      updated += 1;
    }
  }
}

await writeFile(dataPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Updated ${updated} five-guesses study notes.`);
