export interface SessionPackBase<TRound> {
  $schema: string;
  game: string;
  version: number;
  displayName: string;
  roundsPerSession: number;
  sessions: GameSession<TRound>[];
}

export interface GameSession<TRound> {
  id: string;
  title: string;
  theme: string;
  rounds: TRound[];
}

export type GameId =
  | "five-guesses"
  | "initials"
  | "scripture-puzzles"
  | "bible-timeline"
  | "verse-scramble"
  | "bible-connections"
  | "name-that-book"
  | "before-or-after"
  | "reference-rush"
  | "chapter-finder"
  | "who-said-it"
  | "bible-books-relay"
  | "missing-word"
  | "prophecy-match"
  | "messiah-prophecy"
  | "prophecy-clue-ladder"
  | "fulfillment-finder"
  | "prophecy-categories"
  | "complete-the-verse"
  | "wisdom-match"
  | "psalm-theme"
  | "proverb-categories"
  | "psalm-reference-finder"
  | "two-truths-and-a-lie"
  | "relay-verse-build"
  | "first-letter-recall"
  | "verse-typing-race"
  | "word-ladder"
  | "bible-anagrams";

export interface FiveGuessesRound {
  id: string;
  category: string;
  answer: string;
  aliases: string[];
  clues: string[];
}

export type FiveGuessesPack = SessionPackBase<FiveGuessesRound>;

export interface InitialsRound {
  id: string;
  category: string;
  initials: string;
  answer: string;
  aliases: string[];
  hints: string[];
}

export type InitialsPack = SessionPackBase<InitialsRound>;

export type ScriptureContentMode = "placeholder" | "public-domain-text" | "licensed-text";

export interface ScripturePuzzleRound {
  id: string;
  reference: string;
  referenceAliases: string[];
  sourceTranslation: "KJV" | "NIV";
  theme: string;
  contextClue: string;
  contentMode: ScriptureContentMode;
  placeholderText?: string | null;
  verseText?: string | null;
  solutionAliases?: string[];
}

export type ScripturePuzzlesPack = SessionPackBase<ScripturePuzzleRound>;

export interface TimelineEvent {
  id: string;
  label: string;
  order: number;
  clue?: string;
}

export interface BibleTimelineRound {
  id: string;
  prompt: string;
  events: TimelineEvent[];
}

export type BibleTimelinePack = SessionPackBase<BibleTimelineRound>;

export interface VerseScrambleRound {
  id: string;
  reference: string;
  referenceAliases: string[];
  sourceTranslation: "KJV";
  theme: string;
  verseText: string;
}

export type VerseScramblePack = SessionPackBase<VerseScrambleRound>;

export interface ConnectionGroup {
  id: string;
  category: string;
  items: string[];
}

export interface BibleConnectionsRound {
  id: string;
  title: string;
  groups: ConnectionGroup[];
}

export type BibleConnectionsPack = SessionPackBase<BibleConnectionsRound>;

export interface NameThatBookRound {
  id: string;
  book: string;
  testament: "Old Testament" | "New Testament";
  category: string;
  aliases: string[];
  clues: string[];
}

export type NameThatBookPack = SessionPackBase<NameThatBookRound>;

export interface BeforeOrAfterRound {
  id: string;
  leftEvent: string;
  rightEvent: string;
  earlierEvent: "left" | "right";
  explanation: string;
  theme: string;
}

export type BeforeOrAfterPack = SessionPackBase<BeforeOrAfterRound>;

export interface ReferenceRushRound {
  id: string;
  reference: string;
  referenceAliases: string[];
  sourceTranslation: "KJV";
  theme: string;
  verseText: string;
}

export type ReferenceRushPack = SessionPackBase<ReferenceRushRound>;

export interface ChapterFinderRound {
  id: string;
  prompt: string;
  answerBook: string;
  answerChapter: number;
  aliases: string[];
  theme: string;
  clue?: string;
}

export type ChapterFinderPack = SessionPackBase<ChapterFinderRound>;

export interface WhoSaidItRound {
  id: string;
  quote: string;
  speaker: string;
  speakerAliases: string[];
  reference: string;
  context: string;
  sourceTranslation: "KJV";
  theme: string;
}

export type WhoSaidItPack = SessionPackBase<WhoSaidItRound>;

export interface BibleBooksRelayRound {
  id: string;
  title: string;
  section: string;
  books: string[];
}

export type BibleBooksRelayPack = SessionPackBase<BibleBooksRelayRound>;

export interface MissingWordRound {
  id: string;
  reference: string;
  sourceTranslation: "KJV";
  theme: string;
  verseText: string;
  missingWords: string[];
  acceptedAnswers: string[];
}

export type MissingWordPack = SessionPackBase<MissingWordRound>;

export type ProphecyDifficulty = "easy" | "medium" | "hard";

export interface ProphecyMatchRound {
  id: string;
  title: string;
  theme: string;
  prophecyReference: string;
  prophecySummary: string;
  prophecyTextShort: string;
  fulfillmentReference: string;
  fulfillmentSummary: string;
  fulfillmentTextShort: string;
  answerKey: string;
  difficulty: ProphecyDifficulty;
  teachingNote: string;
}

export type ProphecyMatchPack = SessionPackBase<ProphecyMatchRound>;

export interface MessiahProphecyRound {
  id: string;
  title: string;
  theme: string;
  prophecyReference: string;
  prophecyTextShort: string;
  prompt: string;
  correctAnswer: string;
  choices: string[];
  fulfillmentReference: string;
  fulfillmentSummary: string;
  difficulty: ProphecyDifficulty;
  teachingNote: string;
}

export type MessiahProphecyPack = SessionPackBase<MessiahProphecyRound>;

export interface ProphecyClueLadderRound {
  id: string;
  title: string;
  theme: string;
  answer: string;
  acceptedAnswers: string[];
  reference: string;
  fulfillmentReference: string;
  clues: string[];
  difficulty: ProphecyDifficulty;
  teachingNote: string;
}

export type ProphecyClueLadderPack = SessionPackBase<ProphecyClueLadderRound>;

export interface FulfillmentFinderChoice {
  reference: string;
  summary: string;
}

export interface FulfillmentFinderRound {
  id: string;
  title: string;
  theme: string;
  fulfillmentReference: string;
  fulfillmentSummary: string;
  fulfillmentText: string;
  prompt: string;
  correctProphecyReference: string;
  correctProphecySummary: string;
  choices: FulfillmentFinderChoice[];
  difficulty: ProphecyDifficulty;
  teachingNote: string;
}

export type FulfillmentFinderPack = SessionPackBase<FulfillmentFinderRound>;

export interface ProphecyCategoryCard {
  cardId: string;
  reference: string;
  summary: string;
  textShort: string;
  category: string;
  difficulty: ProphecyDifficulty;
  teachingNote: string;
}

export interface ProphecyCategoriesRound {
  id: string;
  title: string;
  theme: string;
  categories: string[];
  cards: ProphecyCategoryCard[];
}

export type ProphecyCategoriesPack = SessionPackBase<ProphecyCategoriesRound>;

export type PsalmsProverbsDifficulty = "easy" | "medium" | "hard";

export interface CompleteVerseRound {
  id: string;
  title: string;
  book: "Psalms" | "Proverbs";
  reference: string;
  verseStart: string;
  correctEnding: string;
  choices: string[];
  theme: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type CompleteVersePack = SessionPackBase<CompleteVerseRound>;

export interface WisdomMatchRound {
  id: string;
  title: string;
  reference: string;
  verseTextShort: string;
  correctTheme: string;
  choices: string[];
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type WisdomMatchPack = SessionPackBase<WisdomMatchRound>;

export interface PsalmThemeRound {
  id: string;
  title: string;
  reference: string;
  excerpt: string;
  correctTheme: string;
  choices: string[];
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type PsalmThemePack = SessionPackBase<PsalmThemeRound>;

export interface ProverbCategoryCard {
  cardId: string;
  reference: string;
  textShort: string;
  category: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export interface ProverbCategoriesRound {
  id: string;
  title: string;
  theme: string;
  categories: string[];
  cards: ProverbCategoryCard[];
}

export type ProverbCategoriesPack = SessionPackBase<ProverbCategoriesRound>;

export interface PsalmReferenceFinderRound {
  id: string;
  title: string;
  excerpt: string;
  correctReference: string;
  choices: string[];
  theme: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type PsalmReferenceFinderPack = SessionPackBase<PsalmReferenceFinderRound>;

export interface TwoTruthsAndALieRound {
  id: string;
  subject: string;
  subjectType: "person" | "event";
  statements: [string, string, string];
  lieIndex: 0 | 1 | 2;
  explanation: string;
  reference: string;
  theme: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type TwoTruthsAndALiePack = SessionPackBase<TwoTruthsAndALieRound>;

export interface RelayVerseBuildRound {
  id: string;
  reference: string;
  sourceTranslation: "KJV";
  theme: string;
  verseText: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type RelayVerseBuildPack = SessionPackBase<RelayVerseBuildRound>;

export interface FirstLetterRecallRound {
  id: string;
  reference: string;
  sourceTranslation: "KJV";
  theme: string;
  verseText: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type FirstLetterRecallPack = SessionPackBase<FirstLetterRecallRound>;

export interface VerseTypingRaceRound {
  id: string;
  reference: string;
  sourceTranslation: "KJV";
  theme: string;
  verseText: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type VerseTypingRacePack = SessionPackBase<VerseTypingRaceRound>;

export interface WordLadderRound {
  id: string;
  startWord: string;
  endWord: string;
  wordLength: number;
  minSteps: number;
  revealPath: string[];
  startFlavorText: string;
  endFlavorText: string;
  theme: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type WordLadderPack = SessionPackBase<WordLadderRound>;

export type BibleAnagramCategory = "Person" | "Place" | "Thing" | "Event";

export interface BibleAnagramRound {
  id: string;
  answer: string;
  category: BibleAnagramCategory;
  clue: string;
  theme: string;
  difficulty: PsalmsProverbsDifficulty;
  teachingNote: string;
}

export type BibleAnagramsPack = SessionPackBase<BibleAnagramRound>;
