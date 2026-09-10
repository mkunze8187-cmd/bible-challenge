import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");
const kjvUrl = "https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/kjv/kjv.json";
const localKjvPath = path.join(os.tmpdir(), "kjv.json");

const CANON_BOOK_NAMES = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation"
];

const BOOK_ABBREVIATIONS = {
  Genesis: "Gen",
  Exodus: "Exod",
  Leviticus: "Lev",
  Numbers: "Num",
  Deuteronomy: "Deut",
  Joshua: "Josh",
  Judges: "Judg",
  Ruth: "Ruth",
  "1 Samuel": "1 Sam",
  "2 Samuel": "2 Sam",
  "1 Kings": "1 Kgs",
  "2 Kings": "2 Kgs",
  "1 Chronicles": "1 Chr",
  "2 Chronicles": "2 Chr",
  Ezra: "Ezra",
  Nehemiah: "Neh",
  Esther: "Esth",
  Job: "Job",
  Psalms: "Ps",
  Psalm: "Ps",
  Proverbs: "Prov",
  Ecclesiastes: "Eccl",
  "Song of Solomon": "Song",
  Isaiah: "Isa",
  Jeremiah: "Jer",
  Lamentations: "Lam",
  Ezekiel: "Ezek",
  Daniel: "Dan",
  Hosea: "Hos",
  Joel: "Joel",
  Amos: "Amos",
  Obadiah: "Obad",
  Jonah: "Jon",
  Micah: "Mic",
  Nahum: "Nah",
  Habakkuk: "Hab",
  Zephaniah: "Zeph",
  Haggai: "Hag",
  Zechariah: "Zech",
  Malachi: "Mal",
  Matthew: "Matt",
  Mark: "Mark",
  Luke: "Lk",
  John: "Jn",
  Acts: "Ac",
  Romans: "Rom",
  "1 Corinthians": "1 Cor",
  "2 Corinthians": "2 Cor",
  Galatians: "Gal",
  Ephesians: "Eph",
  Philippians: "Phil",
  Colossians: "Col",
  "1 Thessalonians": "1 Thess",
  "2 Thessalonians": "2 Thess",
  "1 Timothy": "1 Tim",
  "2 Timothy": "2 Tim",
  Titus: "Titus",
  Philemon: "Phlm",
  Hebrews: "Heb",
  James: "Jas",
  "1 Peter": "1 Pet",
  "2 Peter": "2 Pet",
  "1 John": "1 Jn",
  "2 John": "2 Jn",
  "3 John": "3 Jn",
  Jude: "Jude",
  Revelation: "Rev"
};

const BOOK_WORDS = {
  "1 Samuel": "First Samuel",
  "2 Samuel": "Second Samuel",
  "1 Kings": "First Kings",
  "2 Kings": "Second Kings",
  "1 Chronicles": "First Chronicles",
  "2 Chronicles": "Second Chronicles",
  "1 Corinthians": "First Corinthians",
  "2 Corinthians": "Second Corinthians",
  "1 Thessalonians": "First Thessalonians",
  "2 Thessalonians": "Second Thessalonians",
  "1 Timothy": "First Timothy",
  "2 Timothy": "Second Timothy",
  "1 Peter": "First Peter",
  "2 Peter": "Second Peter",
  "1 John": "First John",
  "2 John": "Second John",
  "3 John": "Third John"
};

const SECTION_RANGES = [
  ["Genesis", "Deuteronomy", "Law"],
  ["Joshua", "Esther", "History"],
  ["Job", "Song of Solomon", "Wisdom"],
  ["Isaiah", "Daniel", "Major Prophets"],
  ["Hosea", "Malachi", "Minor Prophets"],
  ["Matthew", "John", "Gospels"],
  ["Acts", "Acts", "Church History"],
  ["Romans", "Jude", "Letters"],
  ["Revelation", "Revelation", "Prophecy"]
];

const ORDERED_EVENTS = [
  "Creation",
  "Fall in Eden",
  "Cain kills Abel",
  "Noah builds the ark",
  "Flood covers the earth",
  "Tower of Babel",
  "Abram leaves Haran",
  "Isaac is born",
  "Jacob receives the blessing",
  "Joseph is sold by his brothers",
  "Israel moves to Egypt",
  "Moses is born",
  "Moses sees the burning bush",
  "Plagues strike Egypt",
  "The Passover night",
  "The Red Sea crossing",
  "The law is given at Sinai",
  "The tabernacle is built",
  "The spies enter Canaan",
  "Joshua leads Israel",
  "The Jordan River crossing",
  "Jericho falls",
  "Deborah judges Israel",
  "Gideon defeats Midian",
  "Samson fights the Philistines",
  "Ruth meets Boaz",
  "Samuel is called",
  "Saul becomes king",
  "David defeats Goliath",
  "David becomes king",
  "Solomon asks for wisdom",
  "Solomon builds the temple",
  "The kingdom divides",
  "Elijah confronts Baal's prophets",
  "Elisha receives Elijah's mantle",
  "Jonah preaches to Nineveh",
  "Isaiah sees the Lord",
  "Samaria falls to Assyria",
  "Josiah finds the book of the law",
  "Jeremiah warns Judah",
  "Jerusalem falls to Babylon",
  "Daniel serves in Babylon",
  "The fiery furnace",
  "Daniel in the lions' den",
  "Cyrus permits the return",
  "The second temple is completed",
  "Ezra teaches the law",
  "Nehemiah rebuilds Jerusalem's wall",
  "Gabriel visits Zacharias",
  "Gabriel visits Mary",
  "Jesus is born",
  "John the Baptist preaches",
  "Jesus is baptized",
  "Jesus is tempted",
  "Jesus calls the first disciples",
  "Sermon on the Mount",
  "Jesus calms the storm",
  "Jesus feeds the five thousand",
  "Peter confesses Christ",
  "The transfiguration",
  "Lazarus is raised",
  "The triumphal entry",
  "The Last Supper",
  "Jesus prays in Gethsemane",
  "The crucifixion",
  "The resurrection",
  "The ascension",
  "Pentecost",
  "Stephen is martyred",
  "Saul is converted",
  "Cornelius hears Peter",
  "The Jerusalem Council",
  "Paul preaches in Athens",
  "Paul is arrested in Jerusalem",
  "Paul reaches Rome",
  "John receives Revelation"
];

const CONNECTION_GROUPS = [
  ["Books Of The Law", ["Genesis", "Exodus", "Leviticus", "Numbers"]],
  ["Early History Books", ["Joshua", "Judges", "Ruth", "1 Samuel"]],
  ["Kingdom History Books", ["2 Samuel", "1 Kings", "2 Kings", "1 Chronicles"]],
  ["Return History Books", ["2 Chronicles", "Ezra", "Nehemiah", "Esther"]],
  ["Wisdom Books", ["Job", "Psalms", "Proverbs", "Ecclesiastes"]],
  ["Major Prophets", ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel"]],
  ["Minor Prophets A", ["Hosea", "Joel", "Amos", "Obadiah"]],
  ["Minor Prophets B", ["Jonah", "Micah", "Nahum", "Habakkuk"]],
  ["Minor Prophets C", ["Zephaniah", "Haggai", "Zechariah", "Malachi"]],
  ["Gospels", ["Matthew", "Mark", "Luke", "John"]],
  ["Church Letters A", ["Romans", "1 Corinthians", "2 Corinthians", "Galatians"]],
  ["Church Letters B", ["Ephesians", "Philippians", "Colossians", "1 Thessalonians"]],
  ["Pastoral Letters", ["1 Timothy", "2 Timothy", "Titus", "Philemon"]],
  ["General Letters A", ["Hebrews", "James", "1 Peter", "2 Peter"]],
  ["John's Letters", ["1 John", "2 John", "3 John", "Revelation"]],
  ["Patriarchs", ["Abraham", "Isaac", "Jacob", "Joseph"]],
  ["Moses Family", ["Amram", "Jochebed", "Aaron", "Miriam"]],
  ["Judges", ["Deborah", "Gideon", "Jephthah", "Samson"]],
  ["United Monarchy", ["Saul", "David", "Solomon", "Jonathan"]],
  ["Exile Faithful", ["Hananiah", "Mishael", "Azariah", "Mordecai"]],
  ["Return Leaders", ["Zerubbabel", "Joshua", "Ezra", "Nehemiah"]],
  ["Twelve Apostles A", ["Peter", "Andrew", "James", "John"]],
  ["Twelve Apostles B", ["Philip", "Bartholomew", "Thomas", "Matthew"]],
  ["Acts Missionaries", ["Barnabas", "Silas", "Timothy", "Luke"]],
  ["Acts Converts", ["Lydia", "Cornelius", "Ethiopian eunuch", "Dionysius"]],
  ["Garden And Early Places", ["Eden", "Ararat", "Babel", "Ur"]],
  ["Patriarch Places", ["Haran", "Bethel", "Hebron", "Beersheba"]],
  ["Conquest Places", ["Jordan", "Jericho", "Ai", "Gibeon"]],
  ["David Places", ["Bethlehem", "Adullam", "Ziklag", "Jerusalem"]],
  ["Galilee Places", ["Capernaum", "Cana", "Nain", "Bethsaida"]],
  ["Acts Places", ["Joppa", "Antioch", "Philippi", "Athens"]],
  ["Feasts", ["Passover", "Unleavened Bread", "Weeks", "Tabernacles"]],
  ["Parables", ["Sower", "Mustard seed", "Lost sheep", "Prodigal son"]],
  ["Miracles", ["Water to wine", "Storm calmed", "Lazarus raised", "Blind man healed"]],
  ["Armor Of God", ["Belt", "Breastplate", "Shield", "Helmet"]]
];

const CHAPTER_PROMPTS = [
  "Identify the Bible chapter that includes this KJV line:",
  "Find the book and chapter for this KJV verse:",
  "Name the chapter where this KJV wording appears:",
  "Which Bible chapter contains this KJV excerpt?"
];

const SPEAKERS = [
  "God",
  "Lord God",
  "Lord",
  "Jesus",
  "Moses",
  "Aaron",
  "Pharaoh",
  "Joshua",
  "Gideon",
  "Ruth",
  "Naomi",
  "Boaz",
  "Samuel",
  "Saul",
  "David",
  "Solomon",
  "Elijah",
  "Elisha",
  "Isaiah",
  "Jeremiah",
  "Ezekiel",
  "Daniel",
  "Jonah",
  "Job",
  "Peter",
  "Mary",
  "Martha",
  "Thomas",
  "Paul",
  "Festus",
  "Agrippa",
  "Pilate",
  "Abraham",
  "Isaac",
  "Jacob",
  "Joseph",
  "Noah",
  "Adam",
  "Eve",
  "Cain"
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "unto",
  "shall",
  "thou",
  "thy",
  "thee",
  "this",
  "from",
  "have",
  "hath",
  "will",
  "were",
  "they",
  "them",
  "their",
  "there",
  "which",
  "before",
  "after",
  "into",
  "upon",
  "your",
  "you",
  "his",
  "her",
  "him",
  "not",
  "but",
  "are",
  "was",
  "all"
]);

function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeLoose(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeWord(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordsForNumber(value) {
  const ones = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (value < 20) return ones[value];
  if (value < 100) {
    const ten = Math.floor(value / 10);
    const one = value % 10;
    return one === 0 ? tens[ten] : `${tens[ten]} ${ones[one]}`;
  }

  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return rest === 0 ? `${ones[hundred]} Hundred` : `${ones[hundred]} Hundred ${wordsForNumber(rest)}`;
}

function referenceFor(verse) {
  return `${verse.book} ${verse.chapter}:${verse.verse}`;
}

function aliasesForReference(reference) {
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return [reference];

  const [, book, chapter, verse] = match;
  const abbreviation = BOOK_ABBREVIATIONS[book] ?? book;
  const bookWords = BOOK_WORDS[book] ?? book;

  return Array.from(
    new Set([
      reference,
      `${abbreviation} ${chapter}:${verse}`,
      `${book} ${chapter} ${verse}`,
      `${abbreviation} ${chapter} ${verse}`,
      `${book} chapter ${chapter} verse ${verse}`,
      `${bookWords} ${wordsForNumber(Number(chapter))} ${wordsForNumber(Number(verse))}`
    ])
  );
}

function aliasesForChapter(book, chapter) {
  const abbreviation = BOOK_ABBREVIATIONS[book] ?? book;
  const bookWords = BOOK_WORDS[book] ?? book;

  return Array.from(
    new Set([
      `${book} ${chapter}`,
      `${abbreviation} ${chapter}`,
      `${book} chapter ${chapter}`,
      `${bookWords} ${chapter}`,
      `${bookWords} chapter ${chapter}`
    ])
  );
}

function themeForText(text) {
  const lower = text.toLowerCase();

  if (/\blove\b|\bcharity\b/.test(lower)) return "Love";
  if (/\bfaith\b|\bbelieve\b|\btrust\b/.test(lower)) return "Faith";
  if (/\bpeace\b|\bcomfort\b|\brest\b/.test(lower)) return "Peace";
  if (/\bpray\b|\bprayer\b|\bask\b/.test(lower)) return "Prayer";
  if (/\bwisdom\b|\bwise\b|\bunderstanding\b/.test(lower)) return "Wisdom";
  if (/\blight\b|\bdarkness\b/.test(lower)) return "Light";
  if (/\bkingdom\b|\bking\b|\breign\b/.test(lower)) return "Kingdom";
  if (/\bsin\b|\bforgive\b|\bmercy\b/.test(lower)) return "Mercy";
  if (/\bjoy\b|\brejoice\b|\bglad\b/.test(lower)) return "Joy";
  if (/\bstrength\b|\bstrong\b|\bcourage\b/.test(lower)) return "Strength";
  if (/\bword\b|\bcommandment\b|\blaw\b/.test(lower)) return "God's Word";
  if (/\blord\b|\bgod\b/.test(lower)) return "God's Character";

  return "Scripture";
}

function sectionForBook(bookName) {
  const bookIndex = CANON_BOOK_NAMES.indexOf(bookName);

  for (const [first, last, section] of SECTION_RANGES) {
    const firstIndex = CANON_BOOK_NAMES.indexOf(first);
    const lastIndex = CANON_BOOK_NAMES.indexOf(last);

    if (bookIndex >= firstIndex && bookIndex <= lastIndex) {
      return section;
    }
  }

  return "Bible";
}

function chunkSessions(prefix, titlePrefix, theme, rounds, chunkSize) {
  const sessions = [];

  for (let index = 0; index < rounds.length; index += chunkSize) {
    const sessionNumber = Math.floor(index / chunkSize) + 1;
    sessions.push({
      id: `${prefix}-session-${String(sessionNumber).padStart(3, "0")}`,
      title: `${titlePrefix} ${String(sessionNumber).padStart(3, "0")}`,
      theme,
      rounds: rounds.slice(index, index + chunkSize)
    });
  }

  return sessions;
}

async function readJson(fileName) {
  return JSON.parse(await readFile(path.join(dataDir, fileName), "utf8"));
}

async function writeJson(fileName, data) {
  await writeFile(path.join(dataDir, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function loadKjv() {
  if (existsSync(localKjvPath)) {
    return JSON.parse(await readFile(localKjvPath, "utf8"));
  }

  const response = await fetch(kjvUrl);
  if (!response.ok) {
    throw new Error(`Unable to fetch KJV data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function flattenKjv(bible) {
  return bible.books.flatMap((book) =>
    book.chapters.flatMap((chapter) =>
      chapter.verses.map((verse) => ({
        book: CANON_BOOK_NAMES[book.bookId - 1] ?? book.englishName,
        chapter: chapter.chapter,
        verse: verse.number,
        text: verse.text.replace(/\s+/g, " ").trim()
      }))
    )
  );
}

function pickVerseCandidates(flatVerses, count, offset = 0) {
  const candidates = flatVerses.filter((entry) => {
    const words = entry.text.split(/\s+/).filter(Boolean).length;
    return words >= 8 && words <= 34 && entry.text.length <= 190 && /^[\x00-\x7F]+$/.test(entry.text);
  });
  const selected = [];
  const usedReferences = new Set();

  for (let index = offset; index < candidates.length && selected.length < count; index += Math.max(1, Math.floor(candidates.length / (count * 3)))) {
    const entry = candidates[index];
    const reference = referenceFor(entry);

    if (usedReferences.has(reference)) continue;
    usedReferences.add(reference);
    selected.push(entry);
  }

  for (const entry of candidates) {
    if (selected.length >= count) break;

    const reference = referenceFor(entry);
    if (usedReferences.has(reference)) continue;
    usedReferences.add(reference);
    selected.push(entry);
  }

  if (selected.length < count) {
    throw new Error(`Expected ${count} KJV verse candidates, found ${selected.length}.`);
  }

  return selected;
}

function compactExistingRounds(pack) {
  return pack.sessions.flatMap((session) => session.rounds);
}

function mergeRounds(existingRounds, generatedRounds, keyFor, target) {
  const output = [];
  const used = new Set();

  for (const round of [...existingRounds, ...generatedRounds]) {
    const key = keyFor(round);
    if (used.has(key)) continue;
    used.add(key);
    output.push(round);
    if (output.length >= target) break;
  }

  if (output.length < target) {
    throw new Error(`Expected ${target} unique rounds, generated ${output.length}.`);
  }

  return output;
}

function buildReferenceRush(existingPack, flatVerses) {
  const target = existingPack.roundsPerSession * 25;
  const generated = pickVerseCandidates(flatVerses, target, 0).map((verse, index) => ({
    id: `rr-auto-r${String(index + 1).padStart(3, "0")}`,
    reference: referenceFor(verse),
    referenceAliases: aliasesForReference(referenceFor(verse)),
    sourceTranslation: "KJV",
    theme: themeForText(verse.text),
    verseText: verse.text
  }));
  const rounds = mergeRounds(compactExistingRounds(existingPack), generated, (round) => normalizeLoose(round.reference), target)
    .map((round, index) => ({ ...round, id: `rr-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("rr", "Reference Rush Pack", "KJV memory references", rounds, existingPack.roundsPerSession)
  };
}

function buildScripturePuzzles(existingPack, flatVerses) {
  const target = existingPack.roundsPerSession * 25;
  const generated = pickVerseCandidates(flatVerses, target, 250).map((verse, index) => ({
    id: `sp-auto-r${String(index + 1).padStart(3, "0")}`,
    reference: referenceFor(verse),
    referenceAliases: aliasesForReference(referenceFor(verse)),
    sourceTranslation: "KJV",
    theme: themeForText(verse.text),
    contextClue: `A KJV verse connected with ${themeForText(verse.text).toLowerCase()} in ${verse.book}.`,
    contentMode: "public-domain-text",
    verseText: verse.text,
    solutionAliases: [verse.text]
  }));
  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    generated,
    (round) => normalizeLoose(`${round.reference}|${round.verseText ?? round.placeholderText ?? ""}`),
    target
  ).map((round, index) => ({ ...round, id: `sp-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("sp", "Verse Reveal Pack", "KJV verse reveal rounds", rounds, existingPack.roundsPerSession)
  };
}

function buildChapterFinder(existingPack, flatVerses) {
  const target = existingPack.roundsPerSession * 25;
  const generated = pickVerseCandidates(flatVerses, target, 75).map((verse, index) => ({
    id: `cf-auto-r${String(index + 1).padStart(3, "0")}`,
    prompt: `${CHAPTER_PROMPTS[index % CHAPTER_PROMPTS.length]} "${verse.text}"`,
    answerBook: verse.book,
    answerChapter: verse.chapter,
    aliases: aliasesForChapter(verse.book, verse.chapter),
    theme: sectionForBook(verse.book),
    clue: `This line appears in ${verse.book}.`
  }));
  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    generated,
    (round) => normalizeLoose(`${round.prompt}|${round.answerBook}|${round.answerChapter}`),
    target
  ).map((round, index) => ({ ...round, id: `cf-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("cf", "Chapter Finder Pack", "Bible chapters", rounds, existingPack.roundsPerSession)
  };
}

function pickMissingWord(text) {
  const words = text.match(/[A-Za-z0-9']+/g) ?? [];
  const candidates = words
    .map((word) => word.replace(/^'+|'+$/g, ""))
    .filter((word) => {
      const normalized = normalizeWord(word);
      return normalized.length >= 4 && !STOP_WORDS.has(normalized);
    })
    .sort((left, right) => normalizeWord(right).length - normalizeWord(left).length);

  return candidates[0] ?? words.find((word) => normalizeWord(word).length >= 3) ?? null;
}

function buildMissingWord(existingPack, flatVerses) {
  const target = existingPack.roundsPerSession * 25;
  const generated = [];

  for (const verse of pickVerseCandidates(flatVerses, target * 2, 150)) {
    const missingWord = pickMissingWord(verse.text);
    if (!missingWord) continue;

    generated.push({
      id: `mw-auto-r${String(generated.length + 1).padStart(3, "0")}`,
      reference: referenceFor(verse),
      sourceTranslation: "KJV",
      theme: themeForText(verse.text),
      verseText: verse.text,
      missingWords: [missingWord],
      acceptedAnswers: [missingWord]
    });

    if (generated.length >= target) break;
  }

  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    generated,
    (round) => normalizeLoose(`${round.reference}|${round.missingWords.join(" ")}`),
    target
  ).map((round, index) => ({ ...round, id: `mw-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("mw", "Missing Word Pack", "KJV missing-word verses", rounds, existingPack.roundsPerSession)
  };
}

function extractSpeakerRounds(flatVerses) {
  const rounds = [];
  const used = new Set();

  for (const verse of flatVerses) {
    const text = verse.text;

    for (const rawSpeaker of SPEAKERS) {
      const subject =
        rawSpeaker === "Lord"
          ? "(?:the )?Lord"
          : rawSpeaker === "Lord God"
            ? "(?:the )?Lord God"
            : escapeRegExp(rawSpeaker);
      const patterns = [
        new RegExp(
          `^(?:And |Then |But |Now )?${subject} (?:answered and said|answered|said|spake)(?: unto [^,;:]+| to [^,;:]+)?[,:]\\s*(.+)$`,
          "i"
        ),
        new RegExp(
          `^(?:And |Then |But |Now )?${subject} [^.;:]{0,50}, and said(?: unto [^,;:]+| to [^,;:]+)?[,:]\\s*(.+)$`,
          "i"
        )
      ];
      const match = patterns.map((pattern) => text.match(pattern)).find(Boolean);
      if (!match) continue;

      const quote = match[1].trim();
      const speaker = rawSpeaker === "Lord" || rawSpeaker === "Lord God" ? "God" : rawSpeaker;
      const key = normalizeLoose(`${referenceFor(verse)}|${speaker}|${quote}`);

      if (
        quote.length < 12 ||
        quote.length > 180 ||
        /^saying,?$/i.test(quote) ||
        /^after that|^and the lord did|^as he had|^for he had/i.test(quote) ||
        /\b(?:he|she|they|woman|man|lord|god|jesus|moses|abraham|isaac|jacob|joseph|pharaoh|david|saul|peter|paul) (?:answered and )?said\b/i.test(quote) ||
        used.has(key)
      ) {
        continue;
      }

      used.add(key);
      rounds.push({
        id: `wsi-auto-r${String(rounds.length + 1).padStart(3, "0")}`,
        quote,
        speaker,
        speakerAliases: speaker === "God" ? ["God", "The LORD", "Lord God", "The Lord"] : [speaker],
        reference: referenceFor(verse),
        context: `${speaker} spoke in ${referenceFor(verse)}.`,
        sourceTranslation: "KJV",
        theme: themeForText(quote)
      });
      break;
    }
  }

  return rounds;
}

function buildWhoSaidIt(existingPack, flatVerses) {
  const target = existingPack.roundsPerSession * 25;
  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    extractSpeakerRounds(flatVerses),
    (round) => normalizeLoose(`${round.reference}|${round.quote}|${round.speaker}`),
    target
  ).map((round, index) => ({ ...round, id: `wsi-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("wsi", "Who Said It Pack", "Bible speakers", rounds, existingPack.roundsPerSession)
  };
}

function buildBeforeOrAfter(existingPack) {
  const target = existingPack.roundsPerSession * 25;
  const generated = [];
  const usedPairs = new Set();

  for (let distance = 1; distance < ORDERED_EVENTS.length && generated.length < target; distance += 1) {
    for (let index = 0; index + distance < ORDERED_EVENTS.length && generated.length < target; index += 1) {
      const earlier = ORDERED_EVENTS[index];
      const later = ORDERED_EVENTS[index + distance];
      const pairKey = [earlier, later].map(normalizeLoose).sort().join("|");

      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      const flip = generated.length % 2 === 1;
      generated.push({
        id: `boa-auto-r${String(generated.length + 1).padStart(3, "0")}`,
        leftEvent: flip ? later : earlier,
        rightEvent: flip ? earlier : later,
        earlierEvent: flip ? "right" : "left",
        explanation: `${earlier} comes earlier in the biblical sequence than ${later}.`,
        theme: "Bible event order"
      });
    }
  }

  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    generated,
    (round) => [round.leftEvent, round.rightEvent].map(normalizeLoose).sort().join("|"),
    target
  ).map((round, index) => ({ ...round, id: `boa-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("boa", "Before Or After Pack", "Bible event order", rounds, existingPack.roundsPerSession)
  };
}

function buildTimeline(existingPack) {
  const target = existingPack.roundsPerSession * 25;
  const generated = [];

  for (let size = 5; size <= 8 && generated.length < target; size += 1) {
    for (let start = 0; start + size <= ORDERED_EVENTS.length && generated.length < target; start += 1) {
      const labels = ORDERED_EVENTS.slice(start, start + size);
      generated.push({
        id: `bt-auto-r${String(generated.length + 1).padStart(3, "0")}`,
        prompt: `Put these Bible events in order, from ${labels[0]} through ${labels[labels.length - 1]}.`,
        events: labels.map((label, index) => ({
          id: `bt-auto-r${String(generated.length + 1).padStart(3, "0")}-e${String(index + 1).padStart(2, "0")}`,
          label,
          order: index + 1,
          clue: "Bible chronology"
        }))
      });
    }
  }

  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    generated,
    (round) => round.events.map((event) => normalizeLoose(event.label)).join("|"),
    target
  ).map((round, index) => ({
    ...round,
    id: `bt-r${String(index + 1).padStart(3, "0")}`,
    events: round.events.map((event, eventIndex) => ({
      ...event,
      id: `bt-r${String(index + 1).padStart(3, "0")}-e${String(eventIndex + 1).padStart(2, "0")}`
    }))
  }));

  return {
    ...existingPack,
    sessions: chunkSessions("bt", "Timeline Pack", "Bible chronology", rounds, existingPack.roundsPerSession)
  };
}

function buildConnections(existingPack) {
  const target = existingPack.roundsPerSession * 25;
  const existingRounds = compactExistingRounds(existingPack);
  const generated = [];

  for (let first = 0; first < CONNECTION_GROUPS.length && generated.length < target * 2; first += 1) {
    for (let second = first + 1; second < CONNECTION_GROUPS.length && generated.length < target * 2; second += 1) {
      for (let third = second + 1; third < CONNECTION_GROUPS.length && generated.length < target * 2; third += 1) {
        for (let fourth = third + 1; fourth < CONNECTION_GROUPS.length && generated.length < target * 2; fourth += 1) {
          const selectedGroups = [first, second, third, fourth].map((index) => CONNECTION_GROUPS[index]);
          const usedItems = new Set();

          if (
            selectedGroups.some(([, items]) =>
              items.some((item) => {
                const normalized = normalizeLoose(item);
                if (usedItems.has(normalized)) return true;
                usedItems.add(normalized);
                return false;
              })
            )
          ) {
            continue;
          }

          generated.push({
            id: `bc-auto-r${String(generated.length + 1).padStart(3, "0")}`,
            title: `Connections Board ${generated.length + 1}`,
            groups: selectedGroups.map(([category, items], groupIndex) => ({
              id: `bc-auto-r${String(generated.length + 1).padStart(3, "0")}-g${String(groupIndex + 1).padStart(2, "0")}`,
              category,
              items
            }))
          });
        }
      }
    }
  }

  const rounds = mergeRounds(
    existingRounds,
    generated,
    (round) => round.groups.map((group) => normalizeLoose(group.category)).sort().join("|"),
    target
  ).map((round, index) => ({
    ...round,
    id: `bc-r${String(index + 1).padStart(3, "0")}`,
    groups: round.groups.map((group, groupIndex) => ({
      ...group,
      id: `bc-r${String(index + 1).padStart(3, "0")}-g${String(groupIndex + 1).padStart(2, "0")}`
    }))
  }));

  return {
    ...existingPack,
    sessions: chunkSessions("bc", "Connections Pack", "Bible term groups", rounds, existingPack.roundsPerSession)
  };
}

function buildBooksRelay(existingPack) {
  const target = existingPack.roundsPerSession * 25;
  const generated = [];

  for (let size = 5; size <= 10 && generated.length < target; size += 1) {
    for (let start = 0; start + size <= CANON_BOOK_NAMES.length && generated.length < target; start += 1) {
      const books = CANON_BOOK_NAMES.slice(start, start + size);
      generated.push({
        id: `bbr-auto-r${String(generated.length + 1).padStart(3, "0")}`,
        title: `${sectionForBook(books[0])} Relay ${generated.length + 1}`,
        section: `${books[0]} through ${books[books.length - 1]}`,
        books
      });
    }
  }

  const rounds = mergeRounds(
    compactExistingRounds(existingPack),
    generated,
    (round) => round.books.map(normalizeLoose).join("|"),
    target
  ).map((round, index) => ({ ...round, id: `bbr-r${String(index + 1).padStart(3, "0")}` }));

  return {
    ...existingPack,
    sessions: chunkSessions("bbr", "Bible Books Relay Pack", "Canonical book order", rounds, existingPack.roundsPerSession)
  };
}

function naturalRoundKey(game, round) {
  if (game === "name-that-book") return normalizeLoose(round.book);
  if (game === "reference-rush") return normalizeLoose(round.reference);
  if (game === "chapter-finder") return normalizeLoose(`${round.prompt}|${round.answerBook}|${round.answerChapter}`);
  if (game === "who-said-it") return normalizeLoose(`${round.reference}|${round.quote}|${round.speaker}`);
  if (game === "bible-books-relay") return round.books.map(normalizeLoose).join("|");
  if (game === "missing-word") return normalizeLoose(`${round.reference}|${round.missingWords.join(" ")}`);
  if (game === "before-or-after") return [round.leftEvent, round.rightEvent].map(normalizeLoose).sort().join("|");
  if (game === "bible-timeline") return round.events.map((event) => normalizeLoose(event.label)).join("|");
  if (game === "bible-connections") return round.groups.map((group) => normalizeLoose(group.category)).sort().join("|");
  return normalizeLoose(round.id);
}

function summarizePack(pack) {
  const rounds = compactExistingRounds(pack);
  return {
    game: pack.game,
    target: pack.roundsPerSession * 25,
    rounds: rounds.length,
    uniqueNaturalRounds: new Set(rounds.map((round) => naturalRoundKey(pack.game, round))).size
  };
}

const bible = await loadKjv();
const flatVerses = flattenKjv(bible);

const packs = {
  "scripture-puzzles.json": buildScripturePuzzles(await readJson("scripture-puzzles.json"), flatVerses),
  "bible-timeline.json": buildTimeline(await readJson("bible-timeline.json")),
  "bible-connections.json": buildConnections(await readJson("bible-connections.json")),
  "before-or-after.json": buildBeforeOrAfter(await readJson("before-or-after.json")),
  "reference-rush.json": buildReferenceRush(await readJson("reference-rush.json"), flatVerses),
  "chapter-finder.json": buildChapterFinder(await readJson("chapter-finder.json"), flatVerses),
  "who-said-it.json": buildWhoSaidIt(await readJson("who-said-it.json"), flatVerses),
  "bible-books-relay.json": buildBooksRelay(await readJson("bible-books-relay.json")),
  "missing-word.json": buildMissingWord(await readJson("missing-word.json"), flatVerses)
};

for (const [fileName, pack] of Object.entries(packs)) {
  await writeJson(fileName, pack);
  const summary = summarizePack(pack);
  console.log(
    `${fileName}: ${summary.rounds} rounds, ${summary.uniqueNaturalRounds} unique natural rounds, target ${summary.target}.`
  );
}
