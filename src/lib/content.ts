import Ajv2020 from "ajv/dist/2020";
import type {
  BeforeOrAfterPack,
  BibleAnagramsPack,
  BibleConnectionsPack,
  BibleCryptogramPack,
  BibleTimelinePack,
  CompleteVersePack,
  FiveGuessesPack,
  GameId,
  InitialsPack,
  BibleBooksRelayPack,
  ChapterFinderPack,
  GenealogyPack,
  MissingWordPack,
  NameThatBookPack,
  MessiahProphecyPack,
  OddOneOutPack,
  ParableMatchPack,
  ProphecyCategoriesPack,
  ProphecyClueLadderPack,
  ProphecyMatchPack,
  ProverbCategoriesPack,
  PsalmReferenceFinderPack,
  PsalmThemePack,
  ReferenceRushPack,
  RelayVerseBuildPack,
  ScripturePuzzlesPack,
  TwoTruthsAndALiePack,
  VerseScramblePack,
  VerseTypingRacePack,
  WisdomMatchPack,
  WhoSaidItPack,
  WordLadderPack,
  FulfillmentFinderPack
} from "../types/gameData";

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

export interface ContentPackByGame {
  "five-guesses": FiveGuessesPack;
  initials: InitialsPack;
  "scripture-puzzles": ScripturePuzzlesPack;
  "bible-timeline": BibleTimelinePack;
  "verse-scramble": VerseScramblePack;
  "bible-connections": BibleConnectionsPack;
  "name-that-book": NameThatBookPack;
  "before-or-after": BeforeOrAfterPack;
  "reference-rush": ReferenceRushPack;
  "chapter-finder": ChapterFinderPack;
  "who-said-it": WhoSaidItPack;
  "bible-books-relay": BibleBooksRelayPack;
  "missing-word": MissingWordPack;
  "odd-one-out": OddOneOutPack;
  genealogy: GenealogyPack;
  "prophecy-match": ProphecyMatchPack;
  "parable-match": ParableMatchPack;
  "messiah-prophecy": MessiahProphecyPack;
  "prophecy-clue-ladder": ProphecyClueLadderPack;
  "fulfillment-finder": FulfillmentFinderPack;
  "prophecy-categories": ProphecyCategoriesPack;
  "complete-the-verse": CompleteVersePack;
  "wisdom-match": WisdomMatchPack;
  "psalm-theme": PsalmThemePack;
  "proverb-categories": ProverbCategoriesPack;
  "psalm-reference-finder": PsalmReferenceFinderPack;
  "two-truths-and-a-lie": TwoTruthsAndALiePack;
  "relay-verse-build": RelayVerseBuildPack;
  "verse-typing-race": VerseTypingRacePack;
  "word-ladder": WordLadderPack;
  "bible-anagrams": BibleAnagramsPack;
  "bible-cryptogram": BibleCryptogramPack;
}

type LoaderMap = {
  [TGame in GameId]: () => Promise<ContentPackByGame[TGame]>;
};
type SchemaLoaderMap = Record<GameId, () => Promise<object>>;

const contentCache: Partial<ContentPackByGame> = {};

export interface CustomContentGame {
  gameId: string;
  gameTitle: string;
  gameType: GameId;
  description: string;
  rounds: unknown[];
}

export interface CustomContentPack {
  packId: string;
  packName: string;
  accentColor: string;
  games: CustomContentGame[];
}

let customContentPacks: CustomContentPack[] = [];

function loadValidatedPack<T>(schema: object, data: unknown, label: string): T {
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    const detail = (validate.errors ?? [])
      .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
      .join("; ");

    throw new Error(`Invalid ${label} content: ${detail}`);
  }

  return data as T;
}

async function loadPair<T>(options: {
  label: string;
  data: Promise<{ default: unknown }>;
  schema: Promise<{ default: object }>;
}): Promise<T> {
  const [dataModule, schemaModule] = await Promise.all([options.data, options.schema]);
  return loadValidatedPack<T>(schemaModule.default, dataModule.default, options.label);
}

// Vite's import analysis requires each dynamic import() to have a literal, static
// specifier, so the data/schema module paths below can't be built from a runtime
// string. This table is the single source of truth for the pack label and the two
// import() call sites; adding a game means adding one row here plus its matching
// entry point below, instead of one hand-written closure per map.
const PACK_LOADER_ENTRIES: {
  [TGame in GameId]: {
    label: string;
    data: () => Promise<{ default: unknown }>;
    schema: () => Promise<{ default: object }>;
  };
} = {
  "five-guesses": {
    label: "Five Clues",
    data: () => import("../data/five-guesses.json"),
    schema: () => import("../data/schemas/five-guesses.schema.json")
  },
  initials: {
    label: "Bible Initials",
    data: () => import("../data/initials.json"),
    schema: () => import("../data/schemas/initials.schema.json")
  },
  "scripture-puzzles": {
    label: "Verse Reveal",
    data: () => import("../data/scripture-puzzles.json"),
    schema: () => import("../data/schemas/scripture-puzzles.schema.json")
  },
  "bible-timeline": {
    label: "Bible Timeline",
    data: () => import("../data/bible-timeline.json"),
    schema: () => import("../data/schemas/bible-timeline.schema.json")
  },
  "verse-scramble": {
    label: "Verse Scramble",
    data: () => import("../data/verse-scramble.json"),
    schema: () => import("../data/schemas/verse-scramble.schema.json")
  },
  "bible-connections": {
    label: "Bible Connections",
    data: () => import("../data/bible-connections.json"),
    schema: () => import("../data/schemas/bible-connections.schema.json")
  },
  "name-that-book": {
    label: "Name That Book",
    data: () => import("../data/name-that-book.json"),
    schema: () => import("../data/schemas/name-that-book.schema.json")
  },
  "before-or-after": {
    label: "Before Or After",
    data: () => import("../data/before-or-after.json"),
    schema: () => import("../data/schemas/before-or-after.schema.json")
  },
  "reference-rush": {
    label: "Reference Rush",
    data: () => import("../data/reference-rush.json"),
    schema: () => import("../data/schemas/reference-rush.schema.json")
  },
  "chapter-finder": {
    label: "Chapter Finder",
    data: () => import("../data/chapter-finder.json"),
    schema: () => import("../data/schemas/chapter-finder.schema.json")
  },
  "who-said-it": {
    label: "Who Said It?",
    data: () => import("../data/who-said-it.json"),
    schema: () => import("../data/schemas/who-said-it.schema.json")
  },
  "bible-books-relay": {
    label: "Bible Books Relay",
    data: () => import("../data/bible-books-relay.json"),
    schema: () => import("../data/schemas/bible-books-relay.schema.json")
  },
  "missing-word": {
    label: "Missing Word",
    data: () => import("../data/missing-word.json"),
    schema: () => import("../data/schemas/missing-word.schema.json")
  },
  "odd-one-out": {
    label: "Odd One Out",
    data: () => import("../data/odd-one-out.json"),
    schema: () => import("../data/schemas/odd-one-out.schema.json")
  },
  genealogy: {
    label: "Fill in the Genealogy",
    data: () => import("../data/genealogy.json"),
    schema: () => import("../data/schemas/genealogy.schema.json")
  },
  "prophecy-match": {
    label: "Prophecy Match Challenge",
    data: () => import("../data/prophecy-match.json"),
    schema: () => import("../data/schemas/prophecy-match.schema.json")
  },
  "parable-match": {
    label: "Parable Match",
    data: () => import("../data/parable-match.json"),
    schema: () => import("../data/schemas/parable-match.schema.json")
  },
  "messiah-prophecy": {
    label: "Messiah Prophecy Challenge",
    data: () => import("../data/messiah-prophecy.json"),
    schema: () => import("../data/schemas/messiah-prophecy.schema.json")
  },
  "prophecy-clue-ladder": {
    label: "Prophecy Clue Ladder",
    data: () => import("../data/prophecy-clue-ladder.json"),
    schema: () => import("../data/schemas/prophecy-clue-ladder.schema.json")
  },
  "fulfillment-finder": {
    label: "Fulfillment Finder Challenge",
    data: () => import("../data/fulfillment-finder.json"),
    schema: () => import("../data/schemas/fulfillment-finder.schema.json")
  },
  "prophecy-categories": {
    label: "Prophecy Categories Challenge",
    data: () => import("../data/prophecy-categories.json"),
    schema: () => import("../data/schemas/prophecy-categories.schema.json")
  },
  "complete-the-verse": {
    label: "Complete the Verse Challenge",
    data: () => import("../data/complete-the-verse.json"),
    schema: () => import("../data/schemas/complete-the-verse.schema.json")
  },
  "wisdom-match": {
    label: "Wisdom Match Challenge",
    data: () => import("../data/wisdom-match.json"),
    schema: () => import("../data/schemas/wisdom-match.schema.json")
  },
  "psalm-theme": {
    label: "Psalm Theme Challenge",
    data: () => import("../data/psalm-theme.json"),
    schema: () => import("../data/schemas/psalm-theme.schema.json")
  },
  "proverb-categories": {
    label: "Proverb Categories Challenge",
    data: () => import("../data/proverb-categories.json"),
    schema: () => import("../data/schemas/proverb-categories.schema.json")
  },
  "psalm-reference-finder": {
    label: "Psalm Reference Finder",
    data: () => import("../data/psalm-reference-finder.json"),
    schema: () => import("../data/schemas/psalm-reference-finder.schema.json")
  },
  "two-truths-and-a-lie": {
    label: "Two Truths and a Lie",
    data: () => import("../data/two-truths-and-a-lie.json"),
    schema: () => import("../data/schemas/two-truths-and-a-lie.schema.json")
  },
  "relay-verse-build": {
    label: "Relay Verse Build",
    data: () => import("../data/relay-verse-build.json"),
    schema: () => import("../data/schemas/relay-verse-build.schema.json")
  },
  "verse-typing-race": {
    label: "Verse Typing Race",
    data: () => import("../data/verse-typing-race.json"),
    schema: () => import("../data/schemas/verse-typing-race.schema.json")
  },
  "word-ladder": {
    label: "Word Ladder",
    data: () => import("../data/word-ladder.json"),
    schema: () => import("../data/schemas/word-ladder.schema.json")
  },
  "bible-anagrams": {
    label: "Bible Anagrams",
    data: () => import("../data/bible-anagrams.json"),
    schema: () => import("../data/schemas/bible-anagrams.schema.json")
  },
  "bible-cryptogram": {
    label: "Bible Cryptogram",
    data: () => import("../data/bible-cryptogram.json"),
    schema: () => import("../data/schemas/bible-cryptogram.schema.json")
  }
};

const loaders: LoaderMap = Object.fromEntries(
  (Object.entries(PACK_LOADER_ENTRIES) as [GameId, (typeof PACK_LOADER_ENTRIES)[GameId]][]).map(
    ([gameId, entry]) => [
      gameId,
      () => loadPair({ label: entry.label, data: entry.data(), schema: entry.schema() })
    ]
  )
) as LoaderMap;

// Custom content (runtime-imported JSON packs) is supported for every game — derived from
// PACK_LOADER_ENTRIES rather than a separately hand-maintained list, so a newly added game
// is automatically importable without a second place to remember to update.
const SUPPORTED_CUSTOM_GAME_IDS = new Set<GameId>(Object.keys(PACK_LOADER_ENTRIES) as GameId[]);

const schemaLoaders: SchemaLoaderMap = Object.fromEntries(
  (Object.entries(PACK_LOADER_ENTRIES) as [GameId, (typeof PACK_LOADER_ENTRIES)[GameId]][]).map(
    ([gameId, entry]) => [gameId, () => entry.schema().then((module) => module.default)]
  )
) as SchemaLoaderMap;

function isGameId(value: unknown): value is GameId {
  return typeof value === "string" && value in loaders;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "custom";
}

function normalizeAccentColor(value: unknown): string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : "#666b72";
}

function readString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

async function validateCustomGame(packId: string, packName: string, game: CustomContentGame): Promise<void> {
  const schema = await schemaLoaders[game.gameType]();
  const sessionPack = {
    $schema: `custom://${packId}/${game.gameType}`,
    game: game.gameType,
    version: 1,
    displayName: game.gameTitle,
    roundsPerSession: Math.max(1, Math.min(10, game.rounds.length)),
    sessions: [
      {
        id: `${slugify(packId)}-${slugify(game.gameId)}`,
        title: game.gameTitle,
        theme: packName,
        rounds: game.rounds
      }
    ]
  };

  loadValidatedPack(schema, sessionPack, `${packName} / ${game.gameTitle}`);
}

export async function normalizeCustomContentPack(input: unknown): Promise<CustomContentPack> {
  if (!input || typeof input !== "object") {
    throw new Error("Custom content must be a JSON object.");
  }

  const candidate = input as Partial<CustomContentPack>;
  const packId = slugify(readString(candidate.packId, "packId"));
  const packName = readString(candidate.packName, "packName");
  const accentColor = normalizeAccentColor(candidate.accentColor);

  if (!Array.isArray(candidate.games) || candidate.games.length === 0) {
    throw new Error("games must be a non-empty array.");
  }

  const gameIds = new Set<string>();
  const games: CustomContentGame[] = candidate.games.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`games[${index}] must be an object.`);
    }

    const game = entry as Partial<CustomContentGame> & { gameType?: unknown };
    const gameType = game.gameType;
    const gameId = slugify(readString(game.gameId, `games[${index}].gameId`));

    if (gameIds.has(gameId)) {
      throw new Error(`Duplicate custom gameId "${gameId}".`);
    }
    gameIds.add(gameId);

    if (!isGameId(gameType) || !SUPPORTED_CUSTOM_GAME_IDS.has(gameType)) {
      throw new Error(`games[${index}].gameType must be a supported existing game type.`);
    }

    if (!Array.isArray(game.rounds) || game.rounds.length === 0) {
      throw new Error(`games[${index}].rounds must be a non-empty array.`);
    }

    return {
      gameId,
      gameTitle: readString(game.gameTitle, `games[${index}].gameTitle`),
      gameType,
      description: typeof game.description === "string" ? game.description.trim() : "",
      rounds: game.rounds
    };
  });

  const normalized = { packId, packName, accentColor, games };
  for (const game of normalized.games) {
    await validateCustomGame(packId, packName, game);
  }

  return normalized;
}

export async function normalizeCustomContentPacks(input: unknown): Promise<CustomContentPack[]> {
  if (!Array.isArray(input)) {
    return [];
  }

  const packs: CustomContentPack[] = [];
  const packIds = new Set<string>();
  for (const entry of input) {
    const pack = await normalizeCustomContentPack(entry);
    if (!packIds.has(pack.packId)) {
      packs.push(pack);
      packIds.add(pack.packId);
    }
  }

  return packs;
}

export function registerCustomContentPacks(packs: CustomContentPack[]) {
  customContentPacks = packs;
  for (const key of Object.keys(contentCache) as GameId[]) {
    delete contentCache[key];
  }
}

export async function loadGameContent<TGame extends GameId>(
  gameId: TGame,
  options: { customOnly?: boolean } = {}
): Promise<ContentPackByGame[TGame]> {
  const cached = contentCache[gameId] as ContentPackByGame[TGame] | undefined;

  if (cached && !options.customOnly) {
    return cached;
  }

  const pack = await loaders[gameId]();
  const customSessions = customContentPacks.flatMap((customPack) =>
    customPack.games
      .filter((game) => game.gameType === gameId)
      .map((game) => ({
        id: `${slugify(customPack.packId)}-${slugify(game.gameId)}`,
        title: game.gameTitle,
        theme: customPack.packName,
        rounds: game.rounds
      }))
  );
  if (options.customOnly) {
    if (customSessions.length === 0) {
      throw new Error(`${pack.displayName} has no imported custom content. Import a matching custom pack or choose another content pack.`);
    }

    return { ...pack, sessions: customSessions as never } as ContentPackByGame[TGame];
  }

  const mergedPack = customSessions.length > 0 ? { ...pack, sessions: [...customSessions, ...pack.sessions] } : pack;
  contentCache[gameId] = mergedPack as never;
  return mergedPack as ContentPackByGame[TGame];
}

// The Word Ladder dictionary is a flat curated word list, not a GameId round pack, so it
// isn't shaped like ContentPackByGame/PACK_LOADER_ENTRIES above — it gets its own small
// loader using the same import()+ajv validation mechanism.
export interface WordLadderDictionaryFile {
  $schema: string;
  version: number;
  words: string[];
}

let wordLadderDictionaryCache: ReadonlySet<string> | null = null;

export async function loadWordLadderDictionary(): Promise<ReadonlySet<string>> {
  if (wordLadderDictionaryCache) {
    return wordLadderDictionaryCache;
  }

  const [dataModule, schemaModule] = await Promise.all([
    import("../data/word-ladder-dictionary.json"),
    import("../data/schemas/word-ladder-dictionary.schema.json")
  ]);
  const pack = loadValidatedPack<WordLadderDictionaryFile>(
    schemaModule.default,
    dataModule.default,
    "Word Ladder Dictionary"
  );
  const dictionary = new Set(pack.words);
  wordLadderDictionaryCache = dictionary;
  return dictionary;
}
