import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildVerseStudyNote } from "./verse-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");
const bibleUrl = "https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/kjv/kjv.json";

const OLD_TESTAMENT_COUNT = 39;
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
const SECTIONS = [
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
  Jonah: "Jonah",
  Micah: "Mic",
  Nahum: "Nah",
  Habakkuk: "Hab",
  Zephaniah: "Zeph",
  Haggai: "Hag",
  Zechariah: "Zech",
  Malachi: "Mal",
  Matthew: "Matt",
  Mark: "Mark",
  Luke: "Luke",
  John: "John",
  Acts: "Acts",
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
  "1 John": "1 John",
  "2 John": "2 John",
  "3 John": "3 John",
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

const NUMBER_WORDS = [
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

const TENS_WORDS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety"
];

function wordsForNumber(value) {
  if (value < 20) {
    return NUMBER_WORDS[value];
  }

  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return ones === 0 ? TENS_WORDS[tens] : `${TENS_WORDS[tens]} ${NUMBER_WORDS[ones]}`;
  }

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  return remainder === 0
    ? `${NUMBER_WORDS[hundreds]} Hundred`
    : `${NUMBER_WORDS[hundreds]} Hundred ${wordsForNumber(remainder)}`;
}

function getInitials(value) {
  const words = value
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 2) {
    throw new Error(`Cannot build two-letter initials for "${value}".`);
  }

  return words
    .slice(0, 2)
    .map((word) => `${word[0].toUpperCase()}.`)
    .join("");
}

function sanitizeId(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function quoteIntro(text, maxWords = 7) {
  return text.split(/\s+/).slice(0, maxWords).join(" ").replace(/["]/g, "'");
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

function sectionForBook(bookNames, bookName) {
  const bookIndex = bookNames.indexOf(bookName);

  for (const [first, last, section] of SECTIONS) {
    const firstIndex = bookNames.indexOf(first);
    const lastIndex = bookNames.indexOf(last);

    if (bookIndex >= firstIndex && bookIndex <= lastIndex) {
      return section;
    }
  }

  return "Bible";
}

function referenceFor(entry) {
  return `${entry.book} ${entry.chapter}:${entry.verse}`;
}

function referenceWordsFor(entry) {
  const bookWords = BOOK_WORDS[entry.book] ?? entry.book;
  return `${bookWords} ${wordsForNumber(entry.chapter)} ${wordsForNumber(entry.verse)}`;
}

function aliasesFor(entry) {
  const reference = referenceFor(entry);
  const abbreviation = BOOK_ABBREVIATIONS[entry.book] ?? entry.book;

  return Array.from(
    new Set([
      reference,
      `${entry.book} ${entry.chapter} ${entry.verse}`,
      `${entry.book} chapter ${entry.chapter} verse ${entry.verse}`,
      `${abbreviation} ${entry.chapter}:${entry.verse}`,
      `${abbreviation} ${entry.chapter} ${entry.verse}`,
      referenceWordsFor(entry)
    ])
  );
}

function contextFor(entry) {
  const theme = themeForText(entry.text);
  return `A KJV verse connected with ${theme.toLowerCase()} in ${entry.book}.`;
}

function chunkSessions(prefix, titlePrefix, theme, rounds, chunkSize = 5) {
  const sessions = [];

  for (let index = 0; index < rounds.length; index += chunkSize) {
    const sessionNumber = Math.floor(index / chunkSize) + 1;
    sessions.push({
      id: `${prefix}-session-${sessionNumber.toString().padStart(3, "0")}`,
      title: `${titlePrefix} ${sessionNumber.toString().padStart(3, "0")}`,
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

const response = await fetch(bibleUrl);

if (!response.ok) {
  throw new Error(`Unable to fetch KJV data: ${response.status} ${response.statusText}`);
}

const bible = await response.json();
const bookNames = CANON_BOOK_NAMES;
const flatVerses = bible.books.flatMap((book) =>
  book.chapters.flatMap((chapter) =>
    chapter.verses.map((verse) => ({
      book: CANON_BOOK_NAMES[book.bookId - 1] ?? book.book,
      bookCode: book.book,
      bookId: book.bookId,
      testament: book.bookId <= OLD_TESTAMENT_COUNT ? "Old Testament" : "New Testament",
      chapter: chapter.chapter,
      verse: verse.number,
      text: verse.text
    }))
  )
);

const candidates = flatVerses
  .filter((entry) => {
    const words = wordCount(entry.text);
    return words >= 9 && words <= 34 && entry.text.length <= 190 && /^[\x00-\x7F]+$/.test(entry.text);
  })
  .filter((entry) => !/begat|cubits|unclean|foreskin|concubine|whoredom/i.test(entry.text));

const selected = Array.from({ length: 600 }, (_, index) => candidates[Math.floor((index * candidates.length) / 600)]);

if (selected.some((entry) => !entry)) {
  throw new Error(`Expected at least 600 generated entries, found ${candidates.length}.`);
}

const referenceEntries = selected.slice(0, 500);
const scriptureEntries = selected.slice(500, 600);

const fiveGuesses = await readJson("five-guesses.json");
fiveGuesses.sessions = fiveGuesses.sessions.filter((session) => !session.id.startsWith("fg-auto-session-"));
fiveGuesses.sessions.push(
  ...chunkSessions(
    "fg-auto",
    "KJV Reference Cards",
    "Generated scripture reference clues from public-domain KJV text",
    referenceEntries.map((entry, index) => {
      const reference = referenceFor(entry);
      const theme = themeForText(entry.text);
      const section = sectionForBook(bookNames, entry.book);

      return {
        id: `fg-auto-r${(index + 1).toString().padStart(3, "0")}`,
        category: section,
        answer: reference,
        scriptureReference: reference,
        aliases: aliasesFor(entry),
        clues: [
          `This answer is a KJV scripture reference from the ${entry.testament}.`,
          `It belongs to ${entry.book}, in the ${section} section.`,
          `The verse is in chapter ${entry.chapter}.`,
          `Theme clue: ${theme}.`,
          `The verse begins, "${quoteIntro(entry.text)}..."`
        ],
        teachingNote: buildVerseStudyNote({ reference, theme, verseText: entry.text })
      };
    })
  )
);

const initials = await readJson("initials.json");
initials.sessions = initials.sessions.filter((session) => !session.id.startsWith("in-auto-session-"));
initials.sessions.push(
  ...chunkSessions(
    "in-auto",
    "KJV Initial Reference Cards",
    "Generated scripture reference initials from public-domain KJV text",
    referenceEntries.map((entry, index) => {
      const reference = referenceFor(entry);
      const section = sectionForBook(bookNames, entry.book);
      const referenceWords = referenceWordsFor(entry);

      return {
        id: `in-auto-r${(index + 1).toString().padStart(3, "0")}`,
        category: "Scripture Reference",
        initials: getInitials(referenceWords),
        answer: reference,
        scriptureReference: reference,
        aliases: aliasesFor(entry),
        hints: [
          "These initials point to a KJV scripture reference.",
          `The reference is in the ${entry.testament}.`,
          `The book belongs to the ${section} section.`,
          `The chapter number is ${entry.chapter}.`,
          `The verse contains about ${wordCount(entry.text)} words.`,
          `The verse begins, "${quoteIntro(entry.text)}..."`
        ],
        teachingNote: buildVerseStudyNote({ reference, theme: themeForText(entry.text), verseText: entry.text })
      };
    })
  )
);

const scripturePuzzles = await readJson("scripture-puzzles.json");
scripturePuzzles.sessions = scripturePuzzles.sessions.filter((session) => !session.id.startsWith("sp-auto-session-"));
scripturePuzzles.sessions.push(
  ...chunkSessions(
    "sp-auto",
    "KJV Verse Reveal Pack",
    "Generated KJV verse reveal rounds",
    scriptureEntries.map((entry, index) => {
      const reference = referenceFor(entry);
      const theme = themeForText(entry.text);

      return {
        id: `sp-auto-r${(index + 1).toString().padStart(3, "0")}`,
        reference,
        referenceAliases: aliasesFor(entry),
        sourceTranslation: "KJV",
        theme,
        contextClue: contextFor(entry),
        contentMode: "public-domain-text",
        verseText: entry.text,
        solutionAliases: [entry.text],
        teachingNote: buildVerseStudyNote({ reference, theme, verseText: entry.text })
      };
    })
  )
);

await writeJson("five-guesses.json", fiveGuesses);
await writeJson("initials.json", initials);
await writeJson("scripture-puzzles.json", scripturePuzzles);

console.log(`Added ${referenceEntries.length} Five Clues cards.`);
console.log(`Added ${referenceEntries.length} Bible Initials cards.`);
console.log(`Added ${scriptureEntries.length} Verse Reveal rounds.`);
