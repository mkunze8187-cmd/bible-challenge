import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const files = [
  { fileName: "five-guesses.json", game: "five-guesses" },
  { fileName: "initials.json", game: "initials" },
  { fileName: "scripture-puzzles.json", game: "scripture-puzzles" },
  { fileName: "bible-timeline.json", game: "bible-timeline" },
  { fileName: "verse-scramble.json", game: "verse-scramble" },
  { fileName: "bible-connections.json", game: "bible-connections" },
  { fileName: "name-that-book.json", game: "name-that-book" },
  { fileName: "before-or-after.json", game: "before-or-after" },
  { fileName: "reference-rush.json", game: "reference-rush" },
  { fileName: "chapter-finder.json", game: "chapter-finder" },
  { fileName: "who-said-it.json", game: "who-said-it" },
  { fileName: "bible-books-relay.json", game: "bible-books-relay" },
  { fileName: "missing-word.json", game: "missing-word" },
  { fileName: "odd-one-out.json", game: "odd-one-out" },
  { fileName: "genealogy.json", game: "genealogy" },
  { fileName: "prophecy-match.json", game: "prophecy-match" },
  { fileName: "parable-match.json", game: "parable-match" },
  { fileName: "messiah-prophecy.json", game: "messiah-prophecy" },
  { fileName: "prophecy-clue-ladder.json", game: "prophecy-clue-ladder" },
  { fileName: "fulfillment-finder.json", game: "fulfillment-finder" },
  { fileName: "prophecy-categories.json", game: "prophecy-categories" },
  { fileName: "complete-the-verse.json", game: "complete-the-verse" },
  { fileName: "wisdom-match.json", game: "wisdom-match" },
  { fileName: "psalm-theme.json", game: "psalm-theme" },
  { fileName: "proverb-categories.json", game: "proverb-categories" },
  { fileName: "psalm-reference-finder.json", game: "psalm-reference-finder" },
  { fileName: "two-truths-and-a-lie.json", game: "two-truths-and-a-lie" },
  { fileName: "relay-verse-build.json", game: "relay-verse-build" },
  { fileName: "verse-typing-race.json", game: "verse-typing-race" },
  { fileName: "word-ladder.json", game: "word-ladder" },
  { fileName: "bible-anagrams.json", game: "bible-anagrams" },
  { fileName: "bible-cryptogram.json", game: "bible-cryptogram" }
];

const failures = [];
const ajv = new Ajv2020({ allErrors: true, strict: false });

function fail(message) {
  failures.push(message);
}

function ensure(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateOptionalString(value, message) {
  if (value != null) {
    ensure(isNonEmptyString(value), message);
  }
}

function normalizeAlias(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeWord(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const referenceBookAbbreviations = new Map([
  ["genesis", "Gen"],
  ["exodus", "Exod"],
  ["leviticus", "Lev"],
  ["numbers", "Num"],
  ["deuteronomy", "Deut"],
  ["joshua", "Josh"],
  ["judges", "Judg"],
  ["ruth", "Ruth"],
  ["1 samuel", "1 Sam"],
  ["2 samuel", "2 Sam"],
  ["1 kings", "1 Kgs"],
  ["2 kings", "2 Kgs"],
  ["1 chronicles", "1 Chr"],
  ["2 chronicles", "2 Chr"],
  ["ezra", "Ezra"],
  ["nehemiah", "Neh"],
  ["esther", "Esth"],
  ["job", "Job"],
  ["psalm", "Ps"],
  ["psalms", "Ps"],
  ["proverbs", "Prov"],
  ["ecclesiastes", "Eccl"],
  ["song of solomon", "Song"],
  ["isaiah", "Isa"],
  ["jeremiah", "Jer"],
  ["lamentations", "Lam"],
  ["ezekiel", "Ezek"],
  ["daniel", "Dan"],
  ["hosea", "Hos"],
  ["joel", "Joel"],
  ["amos", "Amos"],
  ["obadiah", "Obad"],
  ["jonah", "Jon"],
  ["micah", "Mic"],
  ["nahum", "Nah"],
  ["habakkuk", "Hab"],
  ["zephaniah", "Zeph"],
  ["haggai", "Hag"],
  ["zechariah", "Zech"],
  ["malachi", "Mal"],
  ["matthew", "Matt"],
  ["mark", "Mark"],
  ["luke", "Lk"],
  ["john", "Jn"],
  ["acts", "Ac"],
  ["romans", "Rom"],
  ["1 corinthians", "1 Cor"],
  ["2 corinthians", "2 Cor"],
  ["galatians", "Gal"],
  ["ephesians", "Eph"],
  ["philippians", "Phil"],
  ["colossians", "Col"],
  ["1 thessalonians", "1 Thess"],
  ["2 thessalonians", "2 Thess"],
  ["1 timothy", "1 Tim"],
  ["2 timothy", "2 Tim"],
  ["titus", "Titus"],
  ["philemon", "Phlm"],
  ["hebrews", "Heb"],
  ["james", "Jas"],
  ["1 peter", "1 Pet"],
  ["2 peter", "2 Pet"],
  ["1 john", "1 Jn"],
  ["2 john", "2 Jn"],
  ["3 john", "3 Jn"],
  ["jude", "Jude"],
  ["revelation", "Rev"]
]);

function parseReference(reference) {
  const match = reference.trim().match(/^(.+?)\s+(\d+):(\d+)$/);
  return match ? { book: match[1], chapter: match[2], verse: match[3] } : null;
}

function getAbbreviatedReference(reference) {
  const parsed = parseReference(reference);

  if (!parsed) {
    return null;
  }

  const abbreviation = referenceBookAbbreviations.get(parsed.book.toLowerCase());
  return abbreviation ? `${abbreviation} ${parsed.chapter}:${parsed.verse}` : null;
}

function validatePack(pack, expectedGame, fileName) {
  ensure(pack.game === expectedGame, `${fileName}: game must be "${expectedGame}".`);
  ensure(Number.isInteger(pack.version) && pack.version >= 1, `${fileName}: version must be an integer >= 1.`);
  ensure(isNonEmptyString(pack.displayName), `${fileName}: displayName is required.`);
  ensure(
    Number.isInteger(pack.roundsPerSession) && pack.roundsPerSession >= 1,
    `${fileName}: roundsPerSession must be an integer >= 1.`
  );
  ensure(Array.isArray(pack.sessions), `${fileName}: sessions must be an array.`);

  if (!Array.isArray(pack.sessions)) {
    return;
  }

  const sessionIds = new Set();
  const roundIds = new Set();

  pack.sessions.forEach((session, sessionIndex) => {
    ensure(isNonEmptyString(session.id), `${fileName}: session ${sessionIndex + 1} is missing id.`);
    ensure(!sessionIds.has(session.id), `${fileName}: duplicate session id "${session.id}".`);
    sessionIds.add(session.id);

    ensure(isNonEmptyString(session.title), `${fileName}: session ${session.id} title is required.`);
    ensure(isNonEmptyString(session.theme), `${fileName}: session ${session.id} theme is required.`);
    ensure(Array.isArray(session.rounds), `${fileName}: session ${session.id} rounds must be an array.`);

    if (!Array.isArray(session.rounds)) {
      return;
    }
    ensure(session.rounds.length >= 1, `${fileName}: session ${session.id} must contain at least 1 round.`);

    session.rounds.forEach((round, roundIndex) => {
      ensure(isNonEmptyString(round.id), `${fileName}: round ${roundIndex + 1} in ${session.id} is missing id.`);
      ensure(!roundIds.has(round.id), `${fileName}: duplicate round id "${round.id}".`);
      roundIds.add(round.id);
    });
  });
}

function validateFiveGuesses(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.category), `${round.id}: category is required.`);
      ensure(isNonEmptyString(round.answer), `${round.id}: answer is required.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(Array.isArray(round.aliases) && round.aliases.length >= 1, `${round.id}: at least one alias is required.`);
      ensure(
        Array.isArray(round.clues) && round.clues.length >= 5 && round.clues.length <= 20,
        `${round.id}: clues must contain between 5 and 20 entries.`
      );

      const normalized = new Set();
      round.aliases.forEach((alias) => {
        ensure(isNonEmptyString(alias), `${round.id}: aliases must be non-empty strings.`);
        normalized.add(normalizeAlias(alias));
      });

      ensure(normalized.has(normalizeAlias(round.answer)), `${round.id}: aliases should include the canonical answer.`);
      round.clues.forEach((clue, index) => ensure(isNonEmptyString(clue), `${round.id}: clue ${index + 1} is required.`));
    });
  });
}

function validateInitials(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.category), `${round.id}: category is required.`);
      ensure(isNonEmptyString(round.initials), `${round.id}: initials are required.`);
      ensure(/^[A-Z]\.[A-Z]\.$/.test(round.initials), `${round.id}: initials must be exactly two letter initials like A.B.`);
      ensure(isNonEmptyString(round.answer), `${round.id}: answer is required.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(
        Array.isArray(round.hints) && round.hints.length >= 6 && round.hints.length <= 20,
        `${round.id}: hints must contain between 6 and 20 entries.`
      );
      ensure(Array.isArray(round.aliases) && round.aliases.length >= 1, `${round.id}: at least one alias is required.`);

      const normalized = new Set();
      round.aliases.forEach((alias) => {
        ensure(isNonEmptyString(alias), `${round.id}: aliases must be non-empty strings.`);
        normalized.add(normalizeAlias(alias));
      });

      ensure(normalized.has(normalizeAlias(round.answer)), `${round.id}: aliases should include the canonical answer.`);
      round.hints.forEach((hint, index) => ensure(isNonEmptyString(hint), `${round.id}: hint ${index + 1} is required.`));
    });
  });
}

function validateScripturePuzzles(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.reference), `${round.id}: reference is required.`);
      ensure(Array.isArray(round.referenceAliases) && round.referenceAliases.length >= 1, `${round.id}: referenceAliases are required.`);
      ensure(round.sourceTranslation === "KJV" || round.sourceTranslation === "NIV", `${round.id}: sourceTranslation must be KJV or NIV.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);
      ensure(isNonEmptyString(round.contextClue), `${round.id}: contextClue is required.`);
      ensure(
        round.contentMode === "placeholder" ||
          round.contentMode === "public-domain-text" ||
          round.contentMode === "licensed-text",
        `${round.id}: invalid contentMode.`
      );

      if (round.contentMode === "placeholder") {
        ensure(round.verseText == null, `${round.id}: placeholder rounds must not include verseText.`);
        ensure(isNonEmptyString(round.placeholderText), `${round.id}: placeholderText is required for placeholder rounds.`);
        ensure(!Array.isArray(round.solutionAliases) || round.solutionAliases.length === 0, `${round.id}: placeholder rounds should not include solutionAliases.`);
      }

      if (round.contentMode === "public-domain-text" || round.contentMode === "licensed-text") {
        ensure(isNonEmptyString(round.verseText), `${round.id}: licensed-text rounds require verseText.`);
        ensure(
          Array.isArray(round.solutionAliases) && round.solutionAliases.length >= 1,
          `${round.id}: non-placeholder rounds require solutionAliases.`
        );
      }
    });
  });
}

function validateBibleTimeline(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.prompt), `${round.id}: prompt is required.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(
        Array.isArray(round.events) && round.events.length >= 5 && round.events.length <= 8,
        `${round.id}: events must contain between 5 and 8 entries.`
      );

      if (!Array.isArray(round.events)) {
        return;
      }

      const orders = new Set();
      const eventIds = new Set();
      round.events.forEach((event, index) => {
        ensure(isNonEmptyString(event.id), `${round.id}: event ${index + 1} id is required.`);
        ensure(!eventIds.has(event.id), `${round.id}: duplicate event id "${event.id}".`);
        eventIds.add(event.id);
        ensure(isNonEmptyString(event.label), `${event.id}: label is required.`);
        ensure(Number.isInteger(event.order), `${event.id}: order must be an integer.`);
        ensure(!orders.has(event.order), `${round.id}: duplicate timeline order "${event.order}".`);
        orders.add(event.order);
        if (event.clue != null) {
          ensure(isNonEmptyString(event.clue), `${event.id}: clue must be a non-empty string when present.`);
        }
      });
    });
  });
}

function validateVerseScramble(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.reference), `${round.id}: reference is required.`);
      ensure(Array.isArray(round.referenceAliases) && round.referenceAliases.length >= 1, `${round.id}: referenceAliases are required.`);
      ensure(round.sourceTranslation === "KJV", `${round.id}: sourceTranslation must be KJV.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);
      ensure(isNonEmptyString(round.verseText), `${round.id}: verseText is required.`);

      if (Array.isArray(round.referenceAliases)) {
        round.referenceAliases.forEach((alias) => ensure(isNonEmptyString(alias), `${round.id}: referenceAliases must be non-empty strings.`));
      }
    });
  });
}

function validateBibleConnections(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.title), `${round.id}: title is required.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(Array.isArray(round.groups) && round.groups.length === 4, `${round.id}: must contain exactly 4 groups.`);

      if (!Array.isArray(round.groups)) {
        return;
      }

      const roundItems = new Set();
      const groupIds = new Set();
      round.groups.forEach((group, groupIndex) => {
        ensure(isNonEmptyString(group.id), `${round.id}: group ${groupIndex + 1} id is required.`);
        ensure(!groupIds.has(group.id), `${round.id}: duplicate group id "${group.id}".`);
        groupIds.add(group.id);
        ensure(isNonEmptyString(group.category), `${group.id}: category is required.`);
        ensure(Array.isArray(group.items) && group.items.length === 4, `${group.id}: must contain exactly 4 items.`);

        if (!Array.isArray(group.items)) {
          return;
        }

        const groupItems = new Set();
        group.items.forEach((item) => {
          ensure(isNonEmptyString(item), `${group.id}: items must be non-empty strings.`);
          const normalized = normalizeAlias(item);
          ensure(!groupItems.has(normalized), `${group.id}: duplicate item "${item}".`);
          ensure(!roundItems.has(normalized), `${round.id}: duplicate item "${item}" across groups.`);
          groupItems.add(normalized);
          roundItems.add(normalized);
        });
      });
    });
  });
}

function validateNameThatBook(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.book), `${round.id}: book is required.`);
      ensure(round.testament === "Old Testament" || round.testament === "New Testament", `${round.id}: invalid testament.`);
      ensure(isNonEmptyString(round.category), `${round.id}: category is required.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(Array.isArray(round.aliases) && round.aliases.length >= 1, `${round.id}: aliases are required.`);
      ensure(Array.isArray(round.clues) && round.clues.length === 5, `${round.id}: must contain exactly 5 clues.`);

      if (Array.isArray(round.aliases)) {
        const aliases = new Set();
        round.aliases.forEach((alias) => {
          ensure(isNonEmptyString(alias), `${round.id}: aliases must be non-empty strings.`);
          aliases.add(normalizeAlias(alias));
        });
        ensure(aliases.has(normalizeAlias(round.book)), `${round.id}: aliases must include the canonical book name.`);
      }

      if (Array.isArray(round.clues)) {
        round.clues.forEach((clue, index) => ensure(isNonEmptyString(clue), `${round.id}: clue ${index + 1} is required.`));
      }
    });
  });
}

function validateBeforeOrAfter(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.leftEvent), `${round.id}: leftEvent is required.`);
      ensure(isNonEmptyString(round.rightEvent), `${round.id}: rightEvent is required.`);
      ensure(round.earlierEvent === "left" || round.earlierEvent === "right", `${round.id}: earlierEvent must be left or right.`);
      ensure(isNonEmptyString(round.explanation), `${round.id}: explanation is required.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);
    });
  });
}

function validateReferenceRush(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.reference), `${round.id}: reference is required.`);
      ensure(Array.isArray(round.referenceAliases) && round.referenceAliases.length >= 3, `${round.id}: at least three referenceAliases are required.`);
      ensure(round.sourceTranslation === "KJV", `${round.id}: sourceTranslation must be KJV.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);
      ensure(isNonEmptyString(round.verseText), `${round.id}: verseText is required.`);

      if (!Array.isArray(round.referenceAliases)) {
        return;
      }

      const aliases = new Set();
      round.referenceAliases.forEach((alias) => {
        ensure(isNonEmptyString(alias), `${round.id}: referenceAliases must be non-empty strings.`);
        aliases.add(normalizeAlias(alias));
      });

      ensure(aliases.has(normalizeAlias(round.reference)), `${round.id}: aliases must include the canonical reference.`);

      const abbreviatedReference = getAbbreviatedReference(round.reference);
      ensure(
        abbreviatedReference != null && aliases.has(normalizeAlias(abbreviatedReference)),
        `${round.id}: aliases must include the abbreviated reference form.`
      );

      const parsed = parseReference(round.reference);
      ensure(
        parsed != null &&
          round.referenceAliases.some(
            (alias) =>
              !alias.includes(":") &&
              normalizeAlias(alias) === normalizeAlias(`${parsed.book} ${parsed.chapter} ${parsed.verse}`)
          ),
        `${round.id}: aliases must include an alternate spacing reference without a colon.`
      );
    });
  });
}

function validateChapterFinder(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.prompt), `${round.id}: prompt is required.`);
      ensure(isNonEmptyString(round.answerBook), `${round.id}: answerBook is required.`);
      ensure(Number.isInteger(round.answerChapter) && round.answerChapter >= 1, `${round.id}: answerChapter must be an integer >= 1.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(Array.isArray(round.aliases) && round.aliases.length >= 2, `${round.id}: aliases are required.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);
      if (round.clue != null) {
        ensure(isNonEmptyString(round.clue), `${round.id}: clue must be a non-empty string when present.`);
      }

      if (Array.isArray(round.aliases)) {
        const aliases = new Set();
        round.aliases.forEach((alias) => {
          ensure(isNonEmptyString(alias), `${round.id}: aliases must be non-empty strings.`);
          aliases.add(normalizeAlias(alias));
        });
        ensure(
          aliases.has(normalizeAlias(`${round.answerBook} ${round.answerChapter}`)),
          `${round.id}: aliases must include canonical book chapter format.`
        );
      }
    });
  });
}

function validateWhoSaidIt(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.quote), `${round.id}: quote is required.`);
      ensure(isNonEmptyString(round.speaker), `${round.id}: speaker is required.`);
      ensure(Array.isArray(round.speakerAliases) && round.speakerAliases.length >= 1, `${round.id}: speakerAliases are required.`);
      ensure(isNonEmptyString(round.reference), `${round.id}: reference is required.`);
      ensure(isNonEmptyString(round.context), `${round.id}: context is required.`);
      ensure(round.sourceTranslation === "KJV", `${round.id}: sourceTranslation must be KJV.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);

      if (Array.isArray(round.speakerAliases)) {
        const aliases = new Set();
        round.speakerAliases.forEach((alias) => {
          ensure(isNonEmptyString(alias), `${round.id}: speakerAliases must be non-empty strings.`);
          aliases.add(normalizeAlias(alias));
        });
        ensure(aliases.has(normalizeAlias(round.speaker)), `${round.id}: speakerAliases must include the canonical speaker.`);
      }
    });
  });
}

function validateBibleBooksRelay(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.title), `${round.id}: title is required.`);
      ensure(isNonEmptyString(round.section), `${round.id}: section is required.`);
      validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
      ensure(
        Array.isArray(round.books) && round.books.length >= 5 && round.books.length <= 10,
        `${round.id}: books must contain between 5 and 10 entries.`
      );

      if (Array.isArray(round.books)) {
        const books = new Set();
        round.books.forEach((book) => {
          ensure(isNonEmptyString(book), `${round.id}: books must be non-empty strings.`);
          const normalized = normalizeAlias(book);
          ensure(!books.has(normalized), `${round.id}: duplicate book "${book}".`);
          books.add(normalized);
        });
      }
    });
  });
}

function validateMissingWord(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.reference), `${round.id}: reference is required.`);
      ensure(round.sourceTranslation === "KJV", `${round.id}: sourceTranslation must be KJV.`);
      ensure(isNonEmptyString(round.theme), `${round.id}: theme is required.`);
      ensure(isNonEmptyString(round.verseText), `${round.id}: verseText is required.`);
      ensure(
        Array.isArray(round.missingWords) && round.missingWords.length >= 1 && round.missingWords.length <= 3,
        `${round.id}: missingWords must contain between 1 and 3 entries.`
      );
      ensure(Array.isArray(round.acceptedAnswers) && round.acceptedAnswers.length >= 1, `${round.id}: acceptedAnswers are required.`);

      if (!Array.isArray(round.missingWords) || !Array.isArray(round.acceptedAnswers)) {
        return;
      }

      const verseWords = new Set(round.verseText.split(/\s+/).map(normalizeWord).filter(Boolean));
      round.missingWords.forEach((word) => {
        ensure(isNonEmptyString(word), `${round.id}: missingWords must be non-empty strings.`);
        ensure(verseWords.has(normalizeWord(word)), `${round.id}: missing word "${word}" must appear in verseText.`);
      });

      const canonicalAnswer = normalizeAlias(round.missingWords.join(" "));
      const acceptedAnswers = new Set();
      round.acceptedAnswers.forEach((answer) => {
        ensure(isNonEmptyString(answer), `${round.id}: acceptedAnswers must be non-empty strings.`);
        acceptedAnswers.add(normalizeAlias(answer));
      });
      ensure(
        acceptedAnswers.has(canonicalAnswer),
        `${round.id}: acceptedAnswers must include the canonical missing word or phrase.`
      );
    });
  });
}

function getAllRounds(pack) {
  return pack.sessions.flatMap((session) => session.rounds);
}

function validateDifficulty(round) {
  ensure(
    round.difficulty === "easy" || round.difficulty === "medium" || round.difficulty === "hard",
    `${round.id}: difficulty must be easy, medium, or hard.`
  );
}

function validateFourChoiceRound(round, answer, answerLabel) {
  ensure(Array.isArray(round.choices) && round.choices.length === 4, `${round.id}: choices must contain exactly 4 options.`);

  if (!Array.isArray(round.choices)) {
    return;
  }

  const normalizedChoices = round.choices.map(normalizeAlias);
  ensure(new Set(normalizedChoices).size === 4, `${round.id}: choices must be unique.`);
  ensure(
    normalizedChoices.filter((choice) => choice === normalizeAlias(answer)).length === 1,
    `${round.id}: ${answerLabel} must appear exactly once in choices.`
  );
}

function validateUniqueReferences(rounds, fileName, referenceGetter) {
  const references = new Set();
  rounds.forEach((round) => {
    const reference = normalizeAlias(referenceGetter(round));
    ensure(!references.has(reference), `${fileName}: duplicate reference "${referenceGetter(round)}".`);
    references.add(reference);
  });
}

function validateCompleteVerse(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "complete-the-verse.json: must contain at least 25 playable rounds.");
  validateUniqueReferences(rounds, "complete-the-verse.json", (round) => round.reference);

  rounds.forEach((round) => {
    ensure(round.id.startsWith("ctv-"), `${round.id}: complete-the-verse ids must start with ctv-.`);
    ["title", "reference", "verseStart", "correctEnding", "theme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    ensure(round.book === "Psalms" || round.book === "Proverbs", `${round.id}: book must be Psalms or Proverbs.`);
    validateDifficulty(round);
    validateFourChoiceRound(round, round.correctEnding, "correctEnding");
  });
}

function validateWisdomMatch(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "wisdom-match.json: must contain at least 25 playable rounds.");
  validateUniqueReferences(rounds, "wisdom-match.json", (round) => round.reference);

  rounds.forEach((round) => {
    ensure(round.id.startsWith("wm-"), `${round.id}: wisdom-match ids must start with wm-.`);
    ["title", "reference", "verseTextShort", "correctTheme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    validateDifficulty(round);
    validateFourChoiceRound(round, round.correctTheme, "correctTheme");
  });
}

function validatePsalmTheme(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "psalm-theme.json: must contain at least 25 playable rounds.");
  validateUniqueReferences(rounds, "psalm-theme.json", (round) => round.reference);

  rounds.forEach((round) => {
    ensure(round.id.startsWith("pt-"), `${round.id}: psalm-theme ids must start with pt-.`);
    ["title", "reference", "excerpt", "correctTheme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    validateDifficulty(round);
    validateFourChoiceRound(round, round.correctTheme, "correctTheme");
  });
}

function validatePsalmReferenceFinder(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "psalm-reference-finder.json: must contain at least 25 playable rounds.");
  validateUniqueReferences(rounds, "psalm-reference-finder.json", (round) => round.correctReference);

  rounds.forEach((round) => {
    ensure(round.id.startsWith("prf-"), `${round.id}: psalm-reference-finder ids must start with prf-.`);
    ["title", "excerpt", "correctReference", "theme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    validateDifficulty(round);
    validateFourChoiceRound(round, round.correctReference, "correctReference");
  });
}

function validateTwoTruthsAndALie(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "two-truths-and-a-lie.json: must contain at least 25 playable rounds.");

  const seenTriples = new Set();
  rounds.forEach((round) => {
    ensure(round.id.startsWith("ttl-"), `${round.id}: two-truths-and-a-lie ids must start with ttl-.`);
    ["subject", "explanation", "reference", "theme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    ensure(round.subjectType === "person" || round.subjectType === "event", `${round.id}: subjectType must be person or event.`);
    ensure(Array.isArray(round.statements) && round.statements.length === 3, `${round.id}: statements must contain exactly 3 entries.`);
    validateDifficulty(round);

    if (!Array.isArray(round.statements)) {
      return;
    }

    round.statements.forEach((statement, index) =>
      ensure(isNonEmptyString(statement), `${round.id}: statement ${index + 1} is required.`)
    );
    ensure(
      round.lieIndex === 0 || round.lieIndex === 1 || round.lieIndex === 2,
      `${round.id}: lieIndex must be 0, 1, or 2.`
    );

    const tripleKey = round.statements.map(normalizeAlias).join("|");
    ensure(!seenTriples.has(tripleKey), `${round.id}: duplicate statement triple.`);
    seenTriples.add(tripleKey);
  });
}

function validateBibleAnagrams(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "bible-anagrams.json: must contain at least 25 playable rounds.");

  const seenAnswers = new Set();
  rounds.forEach((round) => {
    ensure(round.id.startsWith("ba-"), `${round.id}: bible-anagrams ids must start with ba-.`);
    ["answer", "clue", "theme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
    ensure(
      ["Person", "Place", "Thing", "Event"].includes(round.category),
      `${round.id}: category must be Person, Place, Thing, or Event.`
    );
    ensure(
      typeof round.answer === "string" && /^[A-Za-z]+( [A-Za-z]+)*$/.test(round.answer),
      `${round.id}: answer must be letters only (spaces allowed between words).`
    );
    validateDifficulty(round);

    const normalizedAnswer = normalizeAlias(round.answer);
    ensure(!seenAnswers.has(normalizedAnswer), `${round.id}: duplicate answer "${round.answer}".`);
    seenAnswers.add(normalizedAnswer);
  });
}

function validateVerseRound(pack, fileName, idPrefix) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, `${fileName}: must contain at least 25 playable rounds.`);
  validateUniqueReferences(rounds, fileName, (round) => round.reference);

  rounds.forEach((round) => {
    ensure(round.id.startsWith(idPrefix), `${round.id}: ${fileName} ids must start with ${idPrefix}.`);
    ["reference", "theme", "verseText", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    ensure(round.sourceTranslation === "KJV", `${round.id}: sourceTranslation must be KJV.`);
    validateDifficulty(round);
  });
}

function validateRelayVerseBuild(pack) {
  validateVerseRound(pack, "relay-verse-build.json", "rvb-");
}

function validateBibleCryptogram(pack) {
  validateVerseRound(pack, "bible-cryptogram.json", "bc-");

  // Cryptogram content deliberately spans short names (easy) through longer verse-like
  // text (hard), not one fixed length like the other verse-round games — so instead of a
  // word-count band, just guard against a degenerate entry with too few distinct letters
  // to make a real substitution puzzle.
  const rounds = getAllRounds(pack);
  rounds.forEach((round) => {
    const distinctLetters = new Set(round.verseText.toLowerCase().replace(/[^a-z]/g, "").split(""));
    ensure(distinctLetters.size >= 4, `${round.id}: verseText needs at least 4 distinct letters to form a cryptogram.`);
  });
}

function validateVerseTypingRace(pack) {
  validateVerseRound(pack, "verse-typing-race.json", "vtr-");

  const rounds = getAllRounds(pack);
  rounds.forEach((round) => {
    const wordCount = round.verseText.trim().split(/\s+/).filter(Boolean).length;
    ensure(wordCount >= 4 && wordCount <= 30, `${round.id}: verseText should be a short-to-medium verse for a typing race.`);
  });
}

function validateOddOneOut(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(Array.isArray(round.items) && round.items.includes(round.oddItem), `${round.id}: oddItem must be one of items.`);
      ensure(isNonEmptyString(round.groupTheme), `${round.id}: groupTheme is required.`);
      ensure(isNonEmptyString(round.explanation), `${round.id}: explanation is required.`);
      validateDifficulty(round);
    });
  });
}

function validateGenealogy(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      const first = round.fullChain?.[0];
      const last = round.fullChain?.[round.fullChain.length - 1];
      ensure(normalizeAlias(first ?? "") === normalizeAlias(round.startPerson), `${round.id}: fullChain must start with startPerson.`);
      ensure(normalizeAlias(last ?? "") === normalizeAlias(round.endPerson), `${round.id}: fullChain must end with endPerson.`);
      validateDifficulty(round);
    });
  });
}

function validateWordLadder(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "word-ladder.json: must contain at least 25 playable rounds.");

  function hammingDistanceOne(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    let differences = 0;
    for (let index = 0; index < a.length; index += 1) {
      if (a[index] !== b[index]) {
        differences += 1;
        if (differences > 1) {
          return false;
        }
      }
    }
    return differences === 1;
  }

  rounds.forEach((round) => {
    ensure(round.id.startsWith("wl-"), `${round.id}: word-ladder ids must start with wl-.`);
    ["startWord", "endWord", "startFlavorText", "endFlavorText", "theme", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    validateOptionalString(round.scriptureReference, `${round.id}: scriptureReference must be non-empty when present.`);
    ensure(/^[a-z]+$/.test(round.startWord), `${round.id}: startWord must be lowercase letters only.`);
    ensure(/^[a-z]+$/.test(round.endWord), `${round.id}: endWord must be lowercase letters only.`);
    ensure(round.startWord.length === round.endWord.length, `${round.id}: startWord and endWord must be the same length.`);
    ensure(round.wordLength === round.startWord.length, `${round.id}: wordLength must match startWord's length.`);
    ensure(Number.isInteger(round.minSteps) && round.minSteps >= 1, `${round.id}: minSteps must be a positive integer.`);
    validateDifficulty(round);

    ensure(
      Array.isArray(round.revealPath) && round.revealPath.length === round.minSteps + 1,
      `${round.id}: revealPath must contain minSteps + 1 words.`
    );

    if (!Array.isArray(round.revealPath)) {
      return;
    }

    ensure(round.revealPath[0] === round.startWord, `${round.id}: revealPath must start with startWord.`);
    ensure(round.revealPath[round.revealPath.length - 1] === round.endWord, `${round.id}: revealPath must end with endWord.`);

    for (let index = 1; index < round.revealPath.length; index += 1) {
      ensure(
        hammingDistanceOne(round.revealPath[index - 1], round.revealPath[index]),
        `${round.id}: revealPath step ${index} does not change exactly one letter.`
      );
    }
  });
}

function validateWordLadderDictionary(dictionaryPack) {
  ensure(Array.isArray(dictionaryPack.words) && dictionaryPack.words.length > 0, "word-ladder-dictionary.json: words must be a non-empty array.");
  const seen = new Set();
  dictionaryPack.words.forEach((word) => {
    ensure(/^[a-z]{3,7}$/.test(word), `word-ladder-dictionary.json: "${word}" must be 3-7 lowercase letters.`);
    ensure(!seen.has(word), `word-ladder-dictionary.json: duplicate word "${word}".`);
    seen.add(word);
  });
}

function validateProverbCategories(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "proverb-categories.json: must contain at least 25 playable category sessions.");

  const cardIds = new Set();
  rounds.forEach((round) => {
    ensure(round.id.startsWith("pcv-"), `${round.id}: proverb-categories ids must start with pcv-.`);
    ["title", "theme"].forEach((field) => ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`));
    ensure(Array.isArray(round.categories) && round.categories.length === 5, `${round.id}: categories must contain exactly 5 names.`);
    ensure(Array.isArray(round.cards) && round.cards.length >= 15 && round.cards.length <= 25, `${round.id}: cards must contain 15 to 25 entries.`);

    if (!Array.isArray(round.categories) || !Array.isArray(round.cards)) {
      return;
    }

    const categories = new Set(round.categories);
    const references = new Set();
    ensure(categories.size === 5, `${round.id}: categories must be unique.`);
    round.cards.forEach((card) => {
      ensure(isNonEmptyString(card.cardId), `${round.id}: every card needs cardId.`);
      ensure(card.cardId.startsWith("pcv-"), `${card.cardId}: proverb category card ids must start with pcv-.`);
      ensure(!cardIds.has(card.cardId), `${round.id}: duplicate category card id "${card.cardId}".`);
      cardIds.add(card.cardId);
      ["reference", "textShort", "category", "teachingNote"].forEach((field) =>
        ensure(isNonEmptyString(card[field]), `${card.cardId}: ${field} is required.`)
      );
      const reference = normalizeAlias(card.reference ?? "");
      ensure(!references.has(reference), `${round.id}: duplicate card reference "${card.reference}".`);
      references.add(reference);
      validateDifficulty(card);
      ensure(categories.has(card.category), `${card.cardId}: category must exist in its session categories.`);
    });
  });
}

function validateProphecyMatch(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "prophecy-match.json: must contain at least 25 unique prophecy pairs.");

  const pairs = new Set();
  rounds.forEach((round) => {
    ensure(round.id.startsWith("pm-"), `${round.id}: prophecy-match ids must start with pm-.`);
    [
      "title",
      "theme",
      "prophecyReference",
      "prophecySummary",
      "prophecyTextShort",
      "fulfillmentReference",
      "fulfillmentSummary",
      "fulfillmentTextShort",
      "answerKey",
      "teachingNote"
    ].forEach((field) => ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`));
    validateDifficulty(round);

    const pairKey = `${normalizeAlias(round.prophecyReference)}=>${normalizeAlias(round.fulfillmentReference)}`;
    ensure(!pairs.has(pairKey), `${round.id}: duplicate prophecy/fulfillment pair.`);
    pairs.add(pairKey);
  });
}

function validateParableMatch(pack) {
  pack.sessions.forEach((session) => {
    session.rounds.forEach((round) => {
      ensure(isNonEmptyString(round.title), `${round.id}: title is required.`);
      ensure(isNonEmptyString(round.parableReference), `${round.id}: parableReference is required.`);
      ensure(isNonEmptyString(round.parableSummary), `${round.id}: parableSummary is required.`);
      ensure(isNonEmptyString(round.parableTextShort), `${round.id}: parableTextShort is required.`);
      ensure(isNonEmptyString(round.lessonSummary), `${round.id}: lessonSummary is required.`);
      ensure(isNonEmptyString(round.lessonTextShort), `${round.id}: lessonTextShort is required.`);
      ensure(isNonEmptyString(round.answerKey), `${round.id}: answerKey is required.`);
      validateDifficulty(round);
    });
  });
}

function validateMessiahProphecy(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "messiah-prophecy.json: must contain at least 25 rounds.");

  rounds.forEach((round) => {
    ensure(round.id.startsWith("mp-"), `${round.id}: messiah-prophecy ids must start with mp-.`);
    [
      "title",
      "theme",
      "prophecyReference",
      "prophecyTextShort",
      "prompt",
      "correctAnswer",
      "fulfillmentReference",
      "fulfillmentSummary",
      "teachingNote"
    ].forEach((field) => ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`));
    validateDifficulty(round);

    ensure(Array.isArray(round.choices) && round.choices.length === 4, `${round.id}: choices must contain exactly 4 options.`);
    if (Array.isArray(round.choices)) {
      const normalizedChoices = round.choices.map(normalizeAlias);
      ensure(new Set(normalizedChoices).size === 4, `${round.id}: choices must be unique.`);
      ensure(
        normalizedChoices.filter((choice) => choice === normalizeAlias(round.correctAnswer)).length === 1,
        `${round.id}: correctAnswer must appear exactly once in choices.`
      );
    }
  });
}

function validateProphecyClueLadder(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "prophecy-clue-ladder.json: must contain at least 25 rounds.");

  rounds.forEach((round) => {
    ensure(round.id.startsWith("pcl-"), `${round.id}: prophecy-clue-ladder ids must start with pcl-.`);
    ["title", "theme", "answer", "reference", "fulfillmentReference", "teachingNote"].forEach((field) =>
      ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`)
    );
    validateDifficulty(round);
    ensure(Array.isArray(round.acceptedAnswers) && round.acceptedAnswers.length >= 1, `${round.id}: acceptedAnswers are required.`);
    ensure(Array.isArray(round.clues) && round.clues.length === 5, `${round.id}: clues must contain exactly 5 entries.`);

    if (Array.isArray(round.acceptedAnswers)) {
      const accepted = new Set(round.acceptedAnswers.map(normalizeAlias));
      ensure(accepted.has(normalizeAlias(round.answer)), `${round.id}: acceptedAnswers must include answer.`);
    }
    if (Array.isArray(round.clues)) {
      round.clues.forEach((clue, index) => ensure(isNonEmptyString(clue), `${round.id}: clue ${index + 1} is required.`));
    }
  });
}

function validateFulfillmentFinder(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "fulfillment-finder.json: must contain at least 25 rounds.");

  rounds.forEach((round) => {
    ensure(round.id.startsWith("ff-"), `${round.id}: fulfillment-finder ids must start with ff-.`);
    [
      "title",
      "theme",
      "fulfillmentReference",
      "fulfillmentSummary",
      "fulfillmentText",
      "prompt",
      "correctProphecyReference",
      "correctProphecySummary",
      "teachingNote"
    ].forEach((field) => ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`));
    validateDifficulty(round);

    ensure(Array.isArray(round.choices) && round.choices.length === 4, `${round.id}: choices must contain exactly 4 options.`);
    if (Array.isArray(round.choices)) {
      const references = round.choices.map((choice) => normalizeAlias(choice?.reference ?? ""));
      ensure(new Set(references).size === 4, `${round.id}: choice references must be unique.`);
      ensure(
        references.filter((reference) => reference === normalizeAlias(round.correctProphecyReference)).length === 1,
        `${round.id}: correctProphecyReference must appear exactly once in choices.`
      );
      round.choices.forEach((choice, index) => {
        ensure(isNonEmptyString(choice?.reference), `${round.id}: choice ${index + 1} reference is required.`);
        ensure(isNonEmptyString(choice?.summary), `${round.id}: choice ${index + 1} summary is required.`);
      });
    }
  });
}

function validateProphecyCategories(pack) {
  const rounds = getAllRounds(pack);
  ensure(rounds.length >= 25, "prophecy-categories.json: must contain at least 25 playable category sessions.");

  const cardIds = new Set();
  rounds.forEach((round) => {
    ensure(round.id.startsWith("pc-"), `${round.id}: prophecy-categories ids must start with pc-.`);
    ["title", "theme"].forEach((field) => ensure(isNonEmptyString(round[field]), `${round.id}: ${field} is required.`));
    ensure(Array.isArray(round.categories) && round.categories.length === 5, `${round.id}: categories must contain exactly 5 names.`);
    ensure(Array.isArray(round.cards) && round.cards.length >= 15 && round.cards.length <= 25, `${round.id}: cards must contain 15 to 25 entries.`);

    if (!Array.isArray(round.categories) || !Array.isArray(round.cards)) {
      return;
    }

    const categories = new Set(round.categories);
    ensure(categories.size === 5, `${round.id}: categories must be unique.`);
    round.cards.forEach((card) => {
      ensure(isNonEmptyString(card.cardId), `${round.id}: every card needs cardId.`);
      ensure(card.cardId.startsWith("pc-"), `${card.cardId}: prophecy category card ids must start with pc-.`);
      ensure(!cardIds.has(card.cardId), `${round.id}: duplicate category card id "${card.cardId}".`);
      cardIds.add(card.cardId);
      ["reference", "summary", "textShort", "category", "teachingNote"].forEach((field) =>
        ensure(isNonEmptyString(card[field]), `${card.cardId}: ${field} is required.`)
      );
      validateDifficulty(card);
      ensure(categories.has(card.category), `${card.cardId}: category must exist in its session categories.`);
    });
  });
}

async function validateSchema(fileName, pack) {
  const schemaName = fileName.replace(".json", ".schema.json");
  const schemaRaw = await readFile(path.join(dataDir, "schemas", schemaName), "utf8");
  const schema = JSON.parse(schemaRaw);
  const validate = ajv.compile(schema);

  if (!validate(pack)) {
    for (const error of validate.errors ?? []) {
      fail(`${fileName}: schema ${error.instancePath || "/"} ${error.message ?? "is invalid"}.`);
    }
  }
}

for (const { fileName, game } of files) {
  const raw = await readFile(path.join(dataDir, fileName), "utf8");
  const pack = JSON.parse(raw);

  await validateSchema(fileName, pack);

  if (fileName === "five-guesses.json") {
    validatePack(pack, game, fileName);
    validateFiveGuesses(pack);
  } else if (fileName === "initials.json") {
    validatePack(pack, game, fileName);
    validateInitials(pack);
  } else if (fileName === "scripture-puzzles.json") {
    validatePack(pack, game, fileName);
    validateScripturePuzzles(pack);
  } else if (fileName === "bible-timeline.json") {
    validatePack(pack, game, fileName);
    validateBibleTimeline(pack);
  } else if (fileName === "verse-scramble.json") {
    validatePack(pack, game, fileName);
    validateVerseScramble(pack);
  } else if (fileName === "bible-connections.json") {
    validatePack(pack, game, fileName);
    validateBibleConnections(pack);
  } else if (fileName === "name-that-book.json") {
    validatePack(pack, game, fileName);
    validateNameThatBook(pack);
  } else if (fileName === "before-or-after.json") {
    validatePack(pack, game, fileName);
    validateBeforeOrAfter(pack);
  } else if (fileName === "reference-rush.json") {
    validatePack(pack, game, fileName);
    validateReferenceRush(pack);
  } else if (fileName === "chapter-finder.json") {
    validatePack(pack, game, fileName);
    validateChapterFinder(pack);
  } else if (fileName === "who-said-it.json") {
    validatePack(pack, game, fileName);
    validateWhoSaidIt(pack);
  } else if (fileName === "bible-books-relay.json") {
    validatePack(pack, game, fileName);
    validateBibleBooksRelay(pack);
  } else if (fileName === "missing-word.json") {
    validatePack(pack, game, fileName);
    validateMissingWord(pack);
  } else if (fileName === "prophecy-match.json") {
    validatePack(pack, game, fileName);
    validateProphecyMatch(pack);
  } else if (fileName === "messiah-prophecy.json") {
    validatePack(pack, game, fileName);
    validateMessiahProphecy(pack);
  } else if (fileName === "prophecy-clue-ladder.json") {
    validatePack(pack, game, fileName);
    validateProphecyClueLadder(pack);
  } else if (fileName === "fulfillment-finder.json") {
    validatePack(pack, game, fileName);
    validateFulfillmentFinder(pack);
  } else if (fileName === "prophecy-categories.json") {
    validatePack(pack, game, fileName);
    validateProphecyCategories(pack);
  } else if (fileName === "complete-the-verse.json") {
    validatePack(pack, game, fileName);
    validateCompleteVerse(pack);
  } else if (fileName === "wisdom-match.json") {
    validatePack(pack, game, fileName);
    validateWisdomMatch(pack);
  } else if (fileName === "psalm-theme.json") {
    validatePack(pack, game, fileName);
    validatePsalmTheme(pack);
  } else if (fileName === "proverb-categories.json") {
    validatePack(pack, game, fileName);
    validateProverbCategories(pack);
  } else if (fileName === "psalm-reference-finder.json") {
    validatePack(pack, game, fileName);
    validatePsalmReferenceFinder(pack);
  } else if (fileName === "two-truths-and-a-lie.json") {
    validatePack(pack, game, fileName);
    validateTwoTruthsAndALie(pack);
  } else if (fileName === "relay-verse-build.json") {
    validatePack(pack, game, fileName);
    validateRelayVerseBuild(pack);
  } else if (fileName === "verse-typing-race.json") {
    validatePack(pack, game, fileName);
    validateVerseTypingRace(pack);
  } else if (fileName === "word-ladder.json") {
    validatePack(pack, game, fileName);
    validateWordLadder(pack);
  } else if (fileName === "bible-anagrams.json") {
    validatePack(pack, game, fileName);
    validateBibleAnagrams(pack);
  } else if (fileName === "bible-cryptogram.json") {
    validatePack(pack, game, fileName);
    validateBibleCryptogram(pack);
  }
}

const wordLadderDictionaryPack = JSON.parse(await readFile(path.join(dataDir, "word-ladder-dictionary.json"), "utf8"));
validateWordLadderDictionary(wordLadderDictionaryPack);

const gameEngineSource = await readFile(path.resolve(__dirname, "../src/lib/gameEngine.ts"), "utf8");
const appSource = await readFile(path.resolve(__dirname, "../src/renderer/App.tsx"), "utf8");
const styleSource = await readFile(path.resolve(__dirname, "../src/renderer/styles.css"), "utf8");
const newGames = ["bible-anagrams", "bible-cryptogram"];

newGames.forEach((game) => {
  ensure(gameEngineSource.includes(`"${game}"`), `${game}: missing from game engine library or state handling.`);
  ensure(appSource.includes(`"${game}":`), `${game}: missing from timer defaults.`);
  ensure(appSource.includes(`sessionState.gameId === "${game}"`), `${game}: missing from gameplay renderer.`);
});
ensure(
  appSource.includes("const ALL_GAME_IDS = Object.keys(GAME_LIBRARY) as GameId[];"),
  "event mode must use GAME_LIBRARY-derived game ids."
);
ensure(styleSource.includes("overflow: hidden;"), "styles must preserve hidden overflow for the app shell/main stage.");

if (failures.length > 0) {
  console.error("Data validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Data validation passed for:");
for (const { fileName } of files) {
  console.log(`- ${fileName}`);
}
