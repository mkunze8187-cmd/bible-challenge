import { loadGameContent, loadWordLadderDictionary } from "./content";
import { random, shuffle } from "./random";
import {
  scoreInitials,
  scoreProphecyRetry,
  scoreScriptureLetterGuess,
  scoreScriptureSolve,
  scoreVerseTypingRace,
  scoreWordLadder
} from "./scoring";
import type {
  ActivityEntry,
  ActivityTone,
  BoardPromptBase,
  CardRoundMeta,
  ChallengeDifficulty,
  DifficultyFilter,
  EngineActionResult,
  Participant,
  ParticipantMode,
  PlayerStats,
  SessionBase
} from "./gameCore";
import {
  createFiveGuessesBoard,
  getFiveGuessesCurrentActorLabel,
  passFiveGuessesBoardGuess,
  selectFiveGuessesBoardCard,
  submitFiveGuessesBoardGuess,
  type FiveGuessesBoardCard,
  type FiveGuessesPrompt,
  type FiveGuessesState
} from "./games/fiveGuesses";
import type {
  BeforeOrAfterRound,
  BibleAnagramRound,
  BibleConnectionsRound,
  BibleBooksRelayRound,
  BibleCryptogramRound,
  BibleTimelineRound,
  ChapterFinderRound,
  CompleteVerseRound,
  FulfillmentFinderRound,
  GenealogyRound,
  GameId,
  InitialsRound,
  MessiahProphecyRound,
  MissingWordRound,
  NameThatBookRound,
  OddOneOutRound,
  ParableMatchRound,
  ProphecyCategoriesRound,
  ProphecyCategoryCard,
  ProphecyClueLadderRound,
  ProphecyMatchRound,
  ProverbCategoriesRound,
  ProverbCategoryCard,
  PsalmReferenceFinderRound,
  PsalmThemeRound,
  ReferenceRushRound,
  RelayVerseBuildRound,
  TimelineEvent,
  TwoTruthsAndALieRound,
  VerseScrambleRound,
  VerseTypingRaceRound,
  ScripturePuzzleRound,
  WisdomMatchRound,
  WhoSaidItRound,
  WordLadderRound
} from "../types/gameData";

export type { GameId } from "../types/gameData";
export type {
  ActivityEntry,
  ActivityTone,
  ChallengeDifficulty,
  DifficultyFilter,
  Participant,
  ParticipantMode,
  PlayerStats
} from "./gameCore";
export type { FiveGuessesBoardCard, FiveGuessesPrompt, FiveGuessesState } from "./games/fiveGuesses";

export interface TeamSetup {
  teamName: string;
  members: string[];
  color?: string;
  difficulty?: DifficultyFilter;
  memberDifficulties?: DifficultyFilter[];
}

export interface SessionConfig {
  gameId: GameId;
  participantMode: ParticipantMode;
  difficulty?: DifficultyFilter;
  contentSource?: "built-in" | "custom" | "all";
  individualNames?: string[];
  individualColors?: string[];
  individualDifficulties?: DifficultyFilter[];
  teams?: TeamSetup[];
  sessionId?: string;
  // Caps the number of rounds (or board cards, for board games) a session is created with.
  // Test mode only, for short E2E play-throughs — leave unset for normal play, which uses
  // each game's own default round count. See specs/automated-testing-spec.md section 4.4.
  maxPrompts?: number;
}

export type ActionResult = EngineActionResult<SessionState>;

export interface Standing {
  participant: Participant;
  stats: PlayerStats;
}

export interface SessionOption {
  id: string;
  title: string;
  theme: string;
}

export interface InitialsBoardCard {
  id: string;
  round: InitialsRound & CardRoundMeta;
  pickNumber: number;
  status: "available" | "active" | "solved" | "unsolved";
  winnerParticipantId: string | null;
}

export interface InitialsPrompt extends BoardPromptBase {
  kind: "initials";
  cardId: string;
  round: InitialsRound & CardRoundMeta;
  revealedClues: number;
  primaryMemberName: string;
}

export interface InitialsState extends SessionBase {
  gameId: "initials";
  boardCards: InitialsBoardCard[];
  currentPrompt: InitialsPrompt | null;
}

export interface ScripturePrompt {
  kind: "scripture-puzzles";
  round: ScripturePuzzleRound;
  phase: "letter" | "solve";
  attemptedLetters: string[];
  isComplete: boolean;
  winnerParticipantId: string | null;
  completedReason: "solved" | "fully-revealed" | null;
}

export interface ScriptureState extends SessionBase {
  gameId: "scripture-puzzles";
  sessionId: string;
  roundIndex: number;
  rounds: ScripturePuzzleRound[];
  currentPrompt: ScripturePrompt;
}

interface RoundSessionBase<TRound, TPrompt> extends SessionBase {
  roundIndex: number;
  rounds: TRound[];
  currentPrompt: TPrompt;
}

export interface BibleTimelinePrompt {
  kind: "bible-timeline";
  round: BibleTimelineRound;
  arrangedEventIds: string[];
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface BibleTimelineState extends RoundSessionBase<BibleTimelineRound, BibleTimelinePrompt> {
  gameId: "bible-timeline";
}

export interface VerseScrambleTile {
  id: string;
  text: string;
  originalIndex: number;
}

export interface VerseScramblePrompt {
  kind: "verse-scramble";
  round: VerseScrambleRound;
  tiles: VerseScrambleTile[];
  bankTileIds: string[];
  answerTileIds: string[];
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface VerseScrambleState extends RoundSessionBase<VerseScrambleRound, VerseScramblePrompt> {
  gameId: "verse-scramble";
}

export interface ConnectionTile {
  id: string;
  text: string;
  groupId: string;
}

export interface SolvedConnectionGroup {
  groupId: string;
  category: string;
  items: string[];
  participantId: string;
}

export interface BibleConnectionsPrompt {
  kind: "bible-connections";
  round: BibleConnectionsRound;
  tiles: ConnectionTile[];
  selectedTileIds: string[];
  solvedGroups: SolvedConnectionGroup[];
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  resolvedMessage: string | null;
}

export interface BibleConnectionsState extends RoundSessionBase<BibleConnectionsRound, BibleConnectionsPrompt> {
  gameId: "bible-connections";
}

export interface NameThatBookPrompt extends BoardPromptBase {
  kind: "name-that-book";
  round: NameThatBookRound;
  revealedClues: number;
  primaryMemberName: string;
  winnerParticipantId: string | null;
}

export interface NameThatBookState extends RoundSessionBase<NameThatBookRound, NameThatBookPrompt> {
  gameId: "name-that-book";
}

export interface BeforeOrAfterPrompt {
  kind: "before-or-after";
  round: BeforeOrAfterRound;
  attemptedParticipantIds: string[];
  selectedAnswer: "left" | "right" | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface BeforeOrAfterState extends RoundSessionBase<BeforeOrAfterRound, BeforeOrAfterPrompt> {
  gameId: "before-or-after";
}

export interface ReferenceRushPrompt {
  kind: "reference-rush";
  round: ReferenceRushRound;
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface ReferenceRushState extends RoundSessionBase<ReferenceRushRound, ReferenceRushPrompt> {
  gameId: "reference-rush";
}

export interface ChapterFinderPrompt {
  kind: "chapter-finder";
  round: ChapterFinderRound;
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface ChapterFinderState extends RoundSessionBase<ChapterFinderRound, ChapterFinderPrompt> {
  gameId: "chapter-finder";
}

export interface WhoSaidItPrompt {
  kind: "who-said-it";
  round: WhoSaidItRound;
  choices: string[] | null;
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface WhoSaidItState extends RoundSessionBase<WhoSaidItRound, WhoSaidItPrompt> {
  gameId: "who-said-it";
}

export interface BibleBooksRelayPrompt {
  kind: "bible-books-relay";
  round: BibleBooksRelayRound;
  arrangedBooks: string[];
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface BibleBooksRelayState extends RoundSessionBase<BibleBooksRelayRound, BibleBooksRelayPrompt> {
  gameId: "bible-books-relay";
}

export interface MissingWordPrompt {
  kind: "missing-word";
  round: MissingWordRound;
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface MissingWordState extends RoundSessionBase<MissingWordRound, MissingWordPrompt> {
  gameId: "missing-word";
}

export interface OddOneOutPrompt {
  kind: "odd-one-out";
  round: OddOneOutRound;
  eliminatedChoices: string[];
  selectedChoice: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface OddOneOutState extends RoundSessionBase<OddOneOutRound, OddOneOutPrompt> {
  gameId: "odd-one-out";
}

export interface GenealogyPrompt {
  kind: "genealogy";
  round: GenealogyRound;
  chain: string[];
  startTurnIndex: number;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface GenealogyState extends RoundSessionBase<GenealogyRound, GenealogyPrompt> {
  gameId: "genealogy";
}

export interface ProphecyMatchCard {
  id: string;
  pairId: string;
  answerKey: string;
  reference: string;
  summary: string;
  textShort: string;
  status: "available" | "selected" | "matched";
}

export interface ProphecyMatchPrompt {
  kind: "prophecy-match";
  prophecyCards: ProphecyMatchCard[];
  fulfillmentCards: ProphecyMatchCard[];
  selectedProphecyId: string | null;
  selectedFulfillmentId: string | null;
  matchedPairIds: string[];
  wrongAttemptsByPairId: Record<string, number>;
  lastAttempt: { prophecyId: string; fulfillmentId: string; wasCorrect: boolean } | null;
  phase: "active" | "resolved";
  resolvedMessage: string | null;
}

export interface ProphecyMatchState extends SessionBase {
  gameId: "prophecy-match";
  pairs: ProphecyMatchRound[];
  currentPrompt: ProphecyMatchPrompt;
}

export interface ParableMatchCard {
  id: string;
  pairId: string;
  answerKey: string;
  reference: string;
  summary: string;
  textShort: string;
  status: "available" | "selected" | "matched";
}

export interface ParableMatchPrompt {
  kind: "parable-match";
  parableCards: ParableMatchCard[];
  lessonCards: ParableMatchCard[];
  selectedParableId: string | null;
  selectedLessonId: string | null;
  matchedPairIds: string[];
  wrongAttemptsByPairId: Record<string, number>;
  lastAttempt: { parableId: string; lessonId: string; wasCorrect: boolean } | null;
  phase: "active" | "resolved";
  resolvedMessage: string | null;
}

export interface ParableMatchState extends SessionBase {
  gameId: "parable-match";
  pairs: ParableMatchRound[];
  currentPrompt: ParableMatchPrompt;
}

export interface MessiahProphecyPrompt {
  kind: "messiah-prophecy";
  round: MessiahProphecyRound;
  eliminatedChoices: string[];
  selectedAnswer: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface MessiahProphecyState extends RoundSessionBase<MessiahProphecyRound, MessiahProphecyPrompt> {
  gameId: "messiah-prophecy";
}

export interface ProphecyClueLadderPrompt {
  kind: "prophecy-clue-ladder";
  round: ProphecyClueLadderRound;
  revealedClues: number;
  guessingDisabled: boolean;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface ProphecyClueLadderState extends RoundSessionBase<ProphecyClueLadderRound, ProphecyClueLadderPrompt> {
  gameId: "prophecy-clue-ladder";
}

export interface FulfillmentFinderPrompt {
  kind: "fulfillment-finder";
  round: FulfillmentFinderRound;
  eliminatedReferences: string[];
  selectedReference: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface FulfillmentFinderState extends RoundSessionBase<FulfillmentFinderRound, FulfillmentFinderPrompt> {
  gameId: "fulfillment-finder";
}

export interface ProphecyCategoriesPrompt {
  kind: "prophecy-categories";
  round: ProphecyCategoriesRound;
  cards: ProphecyCategoryCard[];
  selectedCardId: string | null;
  selectedCategory: string | null;
  sortedCardIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface ProphecyCategoriesState extends RoundSessionBase<ProphecyCategoriesRound, ProphecyCategoriesPrompt> {
  gameId: "prophecy-categories";
}

export interface CompleteVersePrompt {
  kind: "complete-the-verse";
  round: CompleteVerseRound;
  eliminatedChoices: string[];
  selectedChoice: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface CompleteVerseState extends RoundSessionBase<CompleteVerseRound, CompleteVersePrompt> {
  gameId: "complete-the-verse";
}

export interface WisdomMatchPrompt {
  kind: "wisdom-match";
  round: WisdomMatchRound;
  eliminatedChoices: string[];
  selectedChoice: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface WisdomMatchState extends RoundSessionBase<WisdomMatchRound, WisdomMatchPrompt> {
  gameId: "wisdom-match";
}

export interface PsalmThemePrompt {
  kind: "psalm-theme";
  round: PsalmThemeRound;
  eliminatedChoices: string[];
  selectedChoice: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface PsalmThemeState extends RoundSessionBase<PsalmThemeRound, PsalmThemePrompt> {
  gameId: "psalm-theme";
}

export interface ProverbCategoriesPrompt {
  kind: "proverb-categories";
  round: ProverbCategoriesRound;
  cards: ProverbCategoryCard[];
  selectedCardId: string | null;
  selectedCategory: string | null;
  sortedCardIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface ProverbCategoriesState extends RoundSessionBase<ProverbCategoriesRound, ProverbCategoriesPrompt> {
  gameId: "proverb-categories";
}

export interface PsalmReferenceFinderPrompt {
  kind: "psalm-reference-finder";
  round: PsalmReferenceFinderRound;
  eliminatedReferences: string[];
  selectedReference: string | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface PsalmReferenceFinderState extends RoundSessionBase<PsalmReferenceFinderRound, PsalmReferenceFinderPrompt> {
  gameId: "psalm-reference-finder";
}

export interface TwoTruthsAndALieStatement {
  text: string;
  originalIndex: 0 | 1 | 2;
}

export interface TwoTruthsAndALiePrompt {
  kind: "two-truths-and-a-lie";
  round: TwoTruthsAndALieRound;
  statements: TwoTruthsAndALieStatement[];
  eliminatedIndexes: number[];
  selectedIndex: number | null;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface TwoTruthsAndALieState extends RoundSessionBase<TwoTruthsAndALieRound, TwoTruthsAndALiePrompt> {
  gameId: "two-truths-and-a-lie";
}

export interface RelayVerseBuildPrompt {
  kind: "relay-verse-build";
  round: RelayVerseBuildRound;
  words: string[];
  revealedCount: number;
  wrongAttemptsThisWord: number;
  totalWrongAttempts: number;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface RelayVerseBuildState extends RoundSessionBase<RelayVerseBuildRound, RelayVerseBuildPrompt> {
  gameId: "relay-verse-build";
}

export interface VerseTypingRaceResult {
  participantId: string;
  wpm: number;
  accuracy: number;
}

export interface VerseTypingRacePrompt {
  kind: "verse-typing-race";
  round: VerseTypingRaceRound;
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  lastResult: VerseTypingRaceResult | null;
  resolvedMessage: string | null;
}

export interface VerseTypingRaceState extends RoundSessionBase<VerseTypingRaceRound, VerseTypingRacePrompt> {
  gameId: "verse-typing-race";
}

export interface WordLadderPrompt {
  kind: "word-ladder";
  round: WordLadderRound;
  chain: string[];
  startTurnIndex: number;
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface WordLadderState extends RoundSessionBase<WordLadderRound, WordLadderPrompt> {
  gameId: "word-ladder";
}

export interface BibleAnagramTile {
  id: string;
  letter: string;
  originalIndex: number;
}

export interface BibleAnagramPrompt {
  kind: "bible-anagrams";
  round: BibleAnagramRound;
  tiles: BibleAnagramTile[];
  bankTileIds: string[];
  answerTileIds: string[];
  attemptedParticipantIds: string[];
  phase: "active" | "resolved";
  wasCorrect: boolean | null;
  resolvedMessage: string | null;
}

export interface BibleAnagramsState extends RoundSessionBase<BibleAnagramRound, BibleAnagramPrompt> {
  gameId: "bible-anagrams";
}

export interface BibleCryptogramPrompt {
  kind: "bible-cryptogram";
  round: BibleCryptogramRound;
  // Maps each real lowercase letter to the cipher letter that stands in for it in the
  // displayed puzzle (a derangement — no letter maps to itself). Generated fresh per
  // prompt, not stored in content, the same way Bible Anagrams shuffles its tile order
  // and Word Ladder validates against a runtime dictionary rather than authored data.
  cipherMap: Record<string, string>;
  // The player's working substitution key: cipher letter -> the real letter they think it
  // decodes to. Like a real paper cryptogram, this is a guess at the mapping itself, not a
  // guess that a letter appears somewhere — so it only ever touches the one cipher symbol
  // it was entered for, stays editable (retyping a box just replaces its entry), and the
  // original cipher board never changes; only the solved-so-far board reflects it, and
  // only where the guess happens to be correct.
  cipherGuesses: Record<string, string>;
  // Unlike Verse Reveal (which this mechanic is otherwise adapted from), Cryptogram does
  // not force a single-letter-guess-then-solve-or-pass rhythm — the active player/team can
  // fill in as many letters as they want, in any order, and attempt a solve whenever they
  // choose, matching how a real paper cryptogram is solved. There is deliberately no
  // "phase" field gating which action is available.
  isComplete: boolean;
  winnerParticipantId: string | null;
  completedReason: "solved" | "fully-revealed" | null;
}

export interface BibleCryptogramState extends RoundSessionBase<BibleCryptogramRound, BibleCryptogramPrompt> {
  gameId: "bible-cryptogram";
}

export type SessionState =
  | FiveGuessesState
  | InitialsState
  | ScriptureState
  | BibleTimelineState
  | VerseScrambleState
  | BibleConnectionsState
  | NameThatBookState
  | BeforeOrAfterState
  | ReferenceRushState
  | ChapterFinderState
  | WhoSaidItState
  | BibleBooksRelayState
  | MissingWordState
  | OddOneOutState
  | GenealogyState
  | ProphecyMatchState
  | ParableMatchState
  | MessiahProphecyState
  | ProphecyClueLadderState
  | FulfillmentFinderState
  | ProphecyCategoriesState
  | CompleteVerseState
  | WisdomMatchState
  | PsalmThemeState
  | ProverbCategoriesState
  | PsalmReferenceFinderState
  | TwoTruthsAndALieState
  | RelayVerseBuildState
  | VerseTypingRaceState
  | WordLadderState
  | BibleAnagramsState
  | BibleCryptogramState;

export const GAME_LIBRARY: Record<
  GameId,
  {
    label: string;
    shortDescription: string;
    setupPrompt: string;
    accent: string;
  }
> = {
  "five-guesses": {
    label: "Five Clues",
    shortDescription: "A five-category board with five value cards per category and steal attempts.",
    setupPrompt: "The active player chooses a category value. Five clues reveal automatically after misses.",
    accent: "#8a5c24"
  },
  initials: {
    label: "Bible Initials",
    shortDescription: "A random twenty-five-card board with initials first, then six live clues.",
    setupPrompt: "The active player chooses a card. Initials stay visible while six clues reveal after misses.",
    accent: "#1f6650"
  },
  "scripture-puzzles": {
    label: "Verse Reveal",
    shortDescription: "Turn-based random scripture rounds with letter scoring and full-solve bonuses.",
    setupPrompt: "Five random scripture rounds are selected and turns rotate automatically after each action.",
    accent: "#5d3567"
  },
  "bible-timeline": {
    label: "Bible Timeline",
    shortDescription: "Arrange Bible events in chronological order before submitting the full timeline.",
    setupPrompt: "Five random timeline rounds are selected. A full correct order scores 10 points.",
    accent: "#7c3f2c"
  },
  "verse-scramble": {
    label: "Verse Scramble",
    shortDescription: "Rebuild a short KJV verse from scrambled word tiles.",
    setupPrompt: "Five random KJV verse rounds are selected. Click tiles into the answer row, then submit.",
    accent: "#285f73"
  },
  "bible-connections": {
    label: "Bible Connections",
    shortDescription: "Find four connected sets of four Bible terms from a shuffled sixteen-tile board.",
    setupPrompt: "Three random connections boards are selected. Each correct group scores 5 points.",
    accent: "#5c6f2a"
  },
  "name-that-book": {
    label: "Name That Book",
    shortDescription: "Guess the Bible book from a five-clue ladder with one-point steal attempts.",
    setupPrompt: "Ten random book rounds are selected. Earlier clues score more points.",
    accent: "#69436d"
  },
  "before-or-after": {
    label: "Before Or After",
    shortDescription: "Choose which of two Bible events happened first.",
    setupPrompt: "Fifteen random comparison rounds are selected. Each correct answer scores 3 points.",
    accent: "#83572a"
  },
  "reference-rush": {
    label: "Reference Rush",
    shortDescription: "Read a KJV verse and name its scripture reference before the round moves on.",
    setupPrompt: "Ten random KJV verse rounds are selected. A correct reference scores 5 points.",
    accent: "#386b7d"
  },
  "chapter-finder": {
    label: "Chapter Finder",
    shortDescription: "Identify the Bible book and chapter for a prompt, event, quote, person, or theme.",
    setupPrompt: "Ten random book-and-chapter prompts are selected. A correct answer scores 5 points.",
    accent: "#6a6f2c"
  },
  "who-said-it": {
    label: "Who Said It?",
    shortDescription: "Identify the speaker of a recognizable KJV Bible quote or statement.",
    setupPrompt: "Ten random quote rounds are selected. A correct speaker scores 5 points.",
    accent: "#7f3b4a"
  },
  "bible-books-relay": {
    label: "Bible Books Relay",
    shortDescription: "Arrange shuffled Bible book tiles into canonical order.",
    setupPrompt: "Five random book-order relays are selected. A perfect order scores 10 points.",
    accent: "#3f6b45"
  },
  "missing-word": {
    label: "Missing Word",
    shortDescription: "Fill in one to three missing words from a KJV verse.",
    setupPrompt: "Ten random KJV verse rounds are selected. More missing words score more points.",
    accent: "#75512e"
  },
  "odd-one-out": {
    label: "Odd One Out",
    shortDescription: "Pick the Bible person, place, event, or book that does not fit the group.",
    setupPrompt: "Ten random odd-one-out rounds are selected. Wrong choices disappear and scoring steps down.",
    accent: "#83572a"
  },
  genealogy: {
    label: "Fill in the Genealogy",
    shortDescription: "Build the Bible family line one correct name at a time.",
    setupPrompt: "Six random genealogy chains are selected. Submit the next person in the authored lineage.",
    accent: "#3f6b45"
  },
  "prophecy-match": {
    label: "Prophecy Match Challenge",
    shortDescription: "Match Old Testament prophecy cards with New Testament fulfillment cards.",
    setupPrompt: "Five prophecy pairs are selected. Match each prophecy to its fulfillment.",
    accent: "#6a4b2c"
  },
  "parable-match": {
    label: "Parable Match",
    shortDescription: "Match Jesus' parables with their central lessons.",
    setupPrompt: "Five parable pairs are selected. Match each parable to its lesson.",
    accent: "#5d3567"
  },
  "messiah-prophecy": {
    label: "Messiah Prophecy Challenge",
    shortDescription: "Identify the messianic fulfillment, event, person, or theme tied to a prophecy.",
    setupPrompt: "Ten prophecy prompts are selected. Wrong choices disappear and scoring steps down.",
    accent: "#2f6653"
  },
  "prophecy-clue-ladder": {
    label: "Prophecy Clue Ladder",
    shortDescription: "Name the prophecy theme, reference, fulfillment, person, or event from five clues.",
    setupPrompt: "Ten prophecy clue rounds are selected. Each miss or timer expiry reveals the next clue.",
    accent: "#69436d"
  },
  "fulfillment-finder": {
    label: "Fulfillment Finder Challenge",
    shortDescription: "Choose the Old Testament prophecy connected to a New Testament fulfillment.",
    setupPrompt: "Ten fulfillment prompts are selected. Wrong prophecy references are disabled.",
    accent: "#386b7d"
  },
  "prophecy-categories": {
    label: "Prophecy Categories Challenge",
    shortDescription: "Sort prophecy cards into five reference-based categories.",
    setupPrompt: "One fifteen-card sorting board is selected with five prophecy categories.",
    accent: "#7f3b4a"
  },
  "complete-the-verse": {
    label: "Complete the Verse Challenge",
    shortDescription: "Complete a well-known KJV verse from Psalms or Proverbs from four endings.",
    setupPrompt: "Ten verse-ending rounds are selected. Wrong endings disappear and scoring steps down.",
    accent: "#2f6653"
  },
  "wisdom-match": {
    label: "Wisdom Match Challenge",
    shortDescription: "Match a Proverbs excerpt to its wisdom theme.",
    setupPrompt: "Ten Proverbs wisdom rounds are selected. Wrong themes disappear and scoring steps down.",
    accent: "#8a5c24"
  },
  "psalm-theme": {
    label: "Psalm Theme Challenge",
    shortDescription: "Identify the major theme of a short Psalm excerpt.",
    setupPrompt: "Ten Psalm theme rounds are selected. Wrong themes disappear and scoring steps down.",
    accent: "#285f73"
  },
  "proverb-categories": {
    label: "Proverb Categories Challenge",
    shortDescription: "Sort Proverbs cards into five wisdom categories.",
    setupPrompt: "One Proverbs sorting board is selected with five wisdom categories.",
    accent: "#69436d"
  },
  "psalm-reference-finder": {
    label: "Psalm Reference Finder",
    shortDescription: "Choose the correct Psalm reference for a familiar KJV phrase.",
    setupPrompt: "Ten Psalm reference rounds are selected. Wrong references disappear and scoring steps down.",
    accent: "#386b7d"
  },
  "two-truths-and-a-lie": {
    label: "Two Truths and a Lie",
    shortDescription: "Spot the false statement among three about a Bible figure or event.",
    setupPrompt: "Ten random subject rounds are selected. Wrong picks disappear and scoring steps down.",
    accent: "#7f3b4a"
  },
  "relay-verse-build": {
    label: "Relay Verse Build",
    shortDescription: "Take turns typing one word at a time to rebuild a hidden KJV verse.",
    setupPrompt: "Five random KJV verse rounds are selected. A miss doesn't pass the turn, but Skip Word does.",
    accent: "#3f6b45"
  },
  "verse-typing-race": {
    label: "Verse Typing Race",
    shortDescription: "Type a KJV verse as fast and accurately as you can.",
    setupPrompt: "Five random short KJV verse rounds are selected. Score is based on speed and accuracy.",
    accent: "#285f73"
  },
  "word-ladder": {
    label: "Word Ladder",
    shortDescription: "Change one letter at a time to turn the start word into the end word.",
    setupPrompt: "Six random word ladders are selected. Take turns submitting the next valid word in the chain.",
    accent: "#6a6f2c"
  },
  "bible-anagrams": {
    label: "Bible Anagrams",
    shortDescription: "Unscramble the letters to name a Bible person, place, thing, or event.",
    setupPrompt: "Ten random anagram rounds are selected. Easy and medium rounds show a clue; hard rounds do not.",
    accent: "#8a5c24"
  },
  "bible-cryptogram": {
    label: "Bible Cryptogram",
    shortDescription: "Crack a letter-substitution cipher to reveal a Bible name, phrase, or short verse.",
    setupPrompt: "A fresh random cipher is generated for each round. Guess a letter to reveal every occurrence, or solve the whole puzzle at once.",
    accent: "#5d3567"
  }
};

const BOARD_CARD_COUNT = 25;
const INITIALS_CLUES_PER_CARD = 6;
const SCRIPTURE_ROUNDS_PER_GAME = 5;
const TIMELINE_ROUNDS_PER_GAME = 5;
const VERSE_SCRAMBLE_ROUNDS_PER_GAME = 5;
const CONNECTIONS_ROUNDS_PER_GAME = 3;
const NAME_THAT_BOOK_ROUNDS_PER_GAME = 10;
const BEFORE_AFTER_ROUNDS_PER_GAME = 15;
const REFERENCE_RUSH_ROUNDS_PER_GAME = 10;
const CHAPTER_FINDER_ROUNDS_PER_GAME = 10;
const WHO_SAID_IT_ROUNDS_PER_GAME = 10;
const BIBLE_BOOKS_RELAY_ROUNDS_PER_GAME = 5;
const MISSING_WORD_ROUNDS_PER_GAME = 10;
const ODD_ONE_OUT_ROUNDS_PER_GAME = 10;
const GENEALOGY_ROUNDS_PER_GAME = 6;
const PROPHECY_MATCH_PAIRS_PER_GAME = 5;
const PARABLE_MATCH_PAIRS_PER_GAME = 5;
const PROPHECY_MULTIPLE_CHOICE_ROUNDS_PER_GAME = 10;
const PROPHECY_CLUE_LADDER_ROUNDS_PER_GAME = 10;
const PROPHECY_CATEGORIES_ROUNDS_PER_GAME = 1;
const PSALMS_PROVERBS_MULTIPLE_CHOICE_ROUNDS_PER_GAME = 10;
const PROVERB_CATEGORIES_ROUNDS_PER_GAME = 1;
const TWO_TRUTHS_AND_A_LIE_ROUNDS_PER_GAME = 10;
const RELAY_VERSE_BUILD_ROUNDS_PER_GAME = 5;
const VERSE_TYPING_RACE_ROUNDS_PER_GAME = 5;
const WORD_LADDER_ROUNDS_PER_GAME = 6;
const BIBLE_ANAGRAMS_ROUNDS_PER_GAME = 10;
const BIBLE_CRYPTOGRAM_ROUNDS_PER_GAME = 5;
const DEFAULT_PARTICIPANT_COLORS = ["#2f6f5f", "#8a5c24", "#69436d", "#285f73", "#9b4a36", "#5c6f2a"];
const HOST_MARK_INCORRECT_PLACEHOLDER = "__host_mark_incorrect__";

const HOST_PHASE_ONE_GAMES = new Set<GameId>([
  "before-or-after",
  "reference-rush",
  "chapter-finder",
  "who-said-it",
  "missing-word",
  "odd-one-out",
  "messiah-prophecy",
  "fulfillment-finder",
  "complete-the-verse",
  "wisdom-match",
  "psalm-theme",
  "psalm-reference-finder",
  "two-truths-and-a-lie",
  "prophecy-clue-ladder",
  "bible-anagrams",
  "bible-timeline",
  "verse-scramble",
  "bible-books-relay",
  "bible-connections",
  "prophecy-match",
  "parable-match",
  "prophecy-categories",
  "proverb-categories"
]);

function createPlayerStats(): PlayerStats {
  return {
    totalScore: 0,
    roundWins: 0,
    earlySolves: 0,
    initialsOnlySolves: 0,
    incorrectAttempts: 0,
    correctFullSolves: 0,
    letterRevealPoints: 0,
    hiddenLetterSolveBonus: 0,
    timelinePerfectOrders: 0,
    scrambleSolves: 0,
    connectionsGroupsFound: 0,
    bookEarlySolves: 0,
    beforeAfterCorrect: 0,
    referenceRushCorrect: 0,
    chapterFinderCorrect: 0,
    whoSaidItCorrect: 0,
    booksRelayPerfectOrders: 0,
    missingWordCorrect: 0,
    wordLadderStepsCompleted: 0
  };
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createId(prefix: string, name: string, index: number): string {
  const base = normalizeText(name).replace(/\s+/g, "-") || `${prefix}-${index + 1}`;
  return `${prefix}-${base}-${index + 1}`;
}

function createSessionInstanceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createParticipants(config: SessionConfig): Participant[] {
  const cleanDifficulty = (difficulty: DifficultyFilter | undefined): DifficultyFilter | undefined =>
    difficulty === "easy" || difficulty === "medium" || difficulty === "hard" || difficulty === "mixed"
      ? difficulty
      : undefined;

  if (config.participantMode === "individual") {
    const names = (config.individualNames ?? []).map((name) => name.trim()).filter(Boolean);

    if (names.length === 0) {
      throw new Error("Add at least one player before starting.");
    }

    return names.map((name, index) => ({
      id: createId("player", name, index),
      name,
      color: config.individualColors?.[index] ?? DEFAULT_PARTICIPANT_COLORS[index % DEFAULT_PARTICIPANT_COLORS.length],
      members: [
        {
          id: createId("member", name, 0),
          name,
          difficulty: cleanDifficulty(config.individualDifficulties?.[index])
        }
      ],
      turnCounter: 0,
      difficulty: cleanDifficulty(config.individualDifficulties?.[index])
    }));
  }

  const teams = (config.teams ?? [])
    .map((team, index) => ({
      teamName: team.teamName.trim() || `Team ${index + 1}`,
      members: team.members.map((member) => member.trim()).filter(Boolean),
      color: team.color,
      difficulty: cleanDifficulty(team.difficulty),
      memberDifficulties: team.memberDifficulties?.map(cleanDifficulty)
    }))
    .filter((team) => team.members.length > 0);

  if (teams.length === 0) {
    throw new Error("Add at least one team with at least one member before starting.");
  }

  return teams.map((team, index) => {
    if (team.members.length > 5) {
      throw new Error(`"${team.teamName}" has more than five members.`);
    }

    return {
      id: createId("team", team.teamName, index),
      name: team.teamName,
      color: team.color ?? DEFAULT_PARTICIPANT_COLORS[index % DEFAULT_PARTICIPANT_COLORS.length],
      members: team.members.map((member, memberIndex) => ({
        id: createId(`team-member-${index + 1}`, member, memberIndex),
        name: member,
        difficulty: team.memberDifficulties?.[memberIndex]
      })),
      turnCounter: 0,
      difficulty: team.difficulty
    };
  });
}

function getEffectiveParticipantDifficulty(
  participant: Participant | undefined,
  memberTurnOffset = participant?.turnCounter ?? 0
): DifficultyFilter | undefined {
  if (!participant) {
    return undefined;
  }

  const member = participant.members[memberTurnOffset % participant.members.length];
  return member?.difficulty && member.difficulty !== "mixed"
    ? member.difficulty
    : participant.difficulty && participant.difficulty !== "mixed"
      ? participant.difficulty
      : undefined;
}

function getCurrentMemberName(participant: Participant): string {
  const member = participant.members[participant.turnCounter % participant.members.length];
  return member?.name ?? participant.name;
}

function getParticipantDisplayLabel(
  participantMode: ParticipantMode,
  participant: Participant,
  memberName?: string
): string {
  if (participantMode === "teams") {
    return `${participant.name} · ${memberName ?? getCurrentMemberName(participant)}`;
  }

  return participant.name;
}

function getAliases(answer: string, aliases: string[] = []): string[] {
  return Array.from(new Set([answer, ...aliases].map(normalizeText)));
}

function isCorrectGuess(answer: string, aliases: string[] | undefined, guess: string): boolean {
  const normalizedGuess = normalizeText(guess);

  if (!normalizedGuess) {
    return false;
  }

  return getAliases(answer, aliases ?? []).includes(normalizedGuess);
}

function nextIndex(length: number, currentIndex: number): number {
  return (currentIndex + 1) % length;
}

function getSessionPromptPrefix(state: SessionState): string {
  return state.sessionInstanceId ?? `legacy-${state.sessionTitle}`;
}

function consumeTurn(participants: Participant[], participantIndex: number) {
  participants[participantIndex].turnCounter += 1;
}

function buildStealOrder(length: number, primaryIndex: number): number[] {
  const order: number[] = [];

  for (let step = 1; step < length; step += 1) {
    order.push((primaryIndex + step) % length);
  }

  return order;
}

function pickRandomSubset<T>(values: T[], count: number): T[] {
  if (count <= 0) {
    return [];
  }

  return shuffle(
    values.map((value, index) => ({
      value,
      index
    }))
  )
    .slice(0, Math.min(count, values.length))
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.value);
}

function getRoundDifficulty(round: unknown): ChallengeDifficulty | null {
  const difficulty = (round as { difficulty?: unknown }).difficulty;
  return difficulty === "easy" || difficulty === "medium" || difficulty === "hard" ? difficulty : null;
}

function filterRoundsByDifficulty<T>(rounds: T[], difficulty: DifficultyFilter | undefined, gameName: string): T[] {
  if (!difficulty || difficulty === "mixed") {
    return rounds;
  }

  const filtered = rounds.filter((round) => getRoundDifficulty(round) === difficulty);

  if (filtered.length === 0) {
    throw new Error(`${gameName} does not have ${difficulty} content. Use Mixed for this game or choose another difficulty.`);
  }

  return filtered;
}

function pickUniqueInitialsRounds(
  rounds: Array<InitialsRound & CardRoundMeta>,
  count: number
): Array<InitialsRound & CardRoundMeta> {
  const selected: Array<InitialsRound & CardRoundMeta> = [];
  const usedInitials = new Set<string>();

  for (const round of shuffle(rounds)) {
    if (usedInitials.has(round.initials)) {
      continue;
    }

    selected.push(round);
    usedInitials.add(round.initials);

    if (selected.length >= count) {
      return selected;
    }
  }

  throw new Error(`Bible Initials needs at least ${count} cards with unique initials.`);
}

function getScriptureText(round: ScripturePuzzleRound): string {
  if (!round.verseText) {
    throw new Error("This scripture round does not include verse text.");
  }

  return round.verseText;
}

function countRemainingLetters(text: string, attemptedLetters: string[]): number {
  const attempted = new Set(attemptedLetters.map((entry) => entry.toLowerCase()));
  let remaining = 0;

  for (const character of text) {
    if (/[a-z]/i.test(character) && !attempted.has(character.toLowerCase())) {
      remaining += 1;
    }
  }

  return remaining;
}

function countLetterOccurrences(text: string, letter: string): number {
  let matches = 0;
  const normalized = letter.toLowerCase();

  for (const character of text) {
    if (/[a-z]/i.test(character) && character.toLowerCase() === normalized) {
      matches += 1;
    }
  }

  return matches;
}

function getRoundNumber(state: SessionState): number {
  if (
    state.gameId === "scripture-puzzles" ||
    state.gameId === "bible-timeline" ||
    state.gameId === "verse-scramble" ||
    state.gameId === "bible-connections" ||
    state.gameId === "name-that-book" ||
    state.gameId === "before-or-after" ||
    state.gameId === "reference-rush" ||
    state.gameId === "chapter-finder" ||
    state.gameId === "who-said-it" ||
    state.gameId === "bible-books-relay" ||
    state.gameId === "missing-word" ||
    state.gameId === "odd-one-out" ||
    state.gameId === "genealogy" ||
    state.gameId === "prophecy-match" ||
    state.gameId === "parable-match" ||
    state.gameId === "messiah-prophecy" ||
    state.gameId === "prophecy-clue-ladder" ||
    state.gameId === "fulfillment-finder" ||
    state.gameId === "prophecy-categories" ||
    state.gameId === "complete-the-verse" ||
    state.gameId === "wisdom-match" ||
    state.gameId === "psalm-theme" ||
    state.gameId === "proverb-categories" ||
    state.gameId === "psalm-reference-finder" ||
    state.gameId === "two-truths-and-a-lie" ||
    state.gameId === "relay-verse-build" ||
    state.gameId === "verse-typing-race" ||
    state.gameId === "word-ladder" ||
    state.gameId === "bible-anagrams" ||
    state.gameId === "bible-cryptogram"
  ) {
    return "roundIndex" in state ? state.roundIndex + 1 : Math.max(1, state.resolvedPrompts + 1);
  }

  return Math.min(state.resolvedPrompts + (state.currentPrompt ? 1 : 0), state.totalPrompts) || 1;
}

function addActivity(nextState: SessionState, tone: ActivityTone, text: string): ActionResult {
  nextState.activityLog.unshift({
    id: `${getRoundNumber(nextState)}-${nextState.activityLog.length + 1}`,
    tone,
    text,
    roundNumber: getRoundNumber(nextState)
  });

  return {
    nextState,
    tone,
    text
  };
}

function getParticipantStats(state: SessionState, participantIndex: number): PlayerStats {
  const participant = state.participants[participantIndex];
  return state.stats[participant.id];
}

function findInitialsCard(
  state: InitialsState,
  cardId: string
): { cardIndex: number; card: InitialsBoardCard } | null {
  const cardIndex = state.boardCards.findIndex((card) => card.id === cardId);

  if (cardIndex < 0) {
    return null;
  }

  return {
    cardIndex,
    card: state.boardCards[cardIndex]
  };
}

function finalizeBoardPrompt(
  nextState: InitialsState,
  options: {
    solved: boolean;
    winnerParticipantIndex?: number;
    message: string;
  }
): ActionResult {
  const prompt = nextState.currentPrompt;

  if (!prompt) {
    throw new Error("No active prompt is available.");
  }

  if (!prompt.primaryTurnConsumed) {
    consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
    prompt.primaryTurnConsumed = true;
  }

  nextState.turnIndex = nextIndex(nextState.participants.length, prompt.primaryParticipantIndex);
  nextState.resolvedPrompts += 1;

  if (nextState.resolvedPrompts >= nextState.totalPrompts) {
    nextState.status = "completed";
  }

  const found = findInitialsCard(nextState, prompt.cardId);

  if (!found) {
    throw new Error("Unable to locate the active board card.");
  }

  found.card.status = options.solved ? "solved" : "unsolved";
  found.card.winnerParticipantId =
    options.winnerParticipantIndex == null ? null : nextState.participants[options.winnerParticipantIndex].id;
  prompt.phase = "resolved";
  prompt.resolvedMessage = options.message;

  return addActivity(nextState, options.solved ? "success" : "warning", options.message);
}

function createScripturePrompt(round: ScripturePuzzleRound): ScripturePrompt {
  return {
    kind: "scripture-puzzles",
    round,
    phase: "letter",
    attemptedLetters: [],
    isComplete: false,
    winnerParticipantId: null,
    completedReason: null
  };
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// Builds a random derangement of the alphabet (a full permutation where no letter maps
// to itself) to use as a cryptogram's substitution cipher. Repeatedly shuffles until no
// fixed points remain rather than using a more elaborate derangement algorithm — with 26
// letters a shuffle satisfies "no fixed points" the overwhelming majority of the time, so
// a few retries is simpler and just as correct as a dedicated algorithm.
function buildCipherMap(): Record<string, string> {
  let shuffled = shuffle(ALPHABET);
  let attempts = 0;

  while (shuffled.some((letter, index) => letter === ALPHABET[index]) && attempts < 100) {
    shuffled = shuffle(ALPHABET);
    attempts += 1;
  }

  const map: Record<string, string> = {};
  ALPHABET.forEach((letter, index) => {
    map[letter] = shuffled[index];
  });

  return map;
}

function createBibleCryptogramPrompt(round: BibleCryptogramRound): BibleCryptogramPrompt {
  return {
    kind: "bible-cryptogram",
    round,
    cipherMap: buildCipherMap(),
    cipherGuesses: {},
    isComplete: false,
    winnerParticipantId: null,
    completedReason: null
  };
}

// The encrypted board always shows the cipher text as-is — like a real paper cryptogram,
// filling in a guess updates the solved-so-far board below it (see
// buildCryptogramSolvedBoard), never the puzzle itself.
export function buildCryptogramBoard(text: string, cipherMap: Record<string, string>): string {
  return Array.from(text)
    .map((character) => {
      if (!/[a-z]/i.test(character)) {
        return character;
      }

      const lower = character.toLowerCase();
      const cipherLetter = cipherMap[lower] ?? lower;

      return character === lower ? cipherLetter : cipherLetter.toUpperCase();
    })
    .join("");
}

export interface CryptogramSolvedCharacter {
  character: string;
  // "literal" is punctuation/spacing shown as-is; "blank" is a letter space with no guess
  // yet for its cipher letter; "correct"/"incorrect" show the player's guessed letter,
  // styled to say whether it actually matches the round's cipher map.
  status: "literal" | "blank" | "correct" | "incorrect";
}

// Builds the solve-so-far board from the player's cipher-letter -> real-letter guesses.
// Every guess shows up here — right or wrong — the way a real pencil-filled cryptogram
// shows whatever you last wrote in, whether or not it turns out to be correct; only an
// unguessed cipher letter stays blank.
export function buildCryptogramSolvedBoard(
  text: string,
  cipherMap: Record<string, string>,
  cipherGuesses: Record<string, string>
): CryptogramSolvedCharacter[] {
  return Array.from(text).map((character) => {
    if (!/[a-z]/i.test(character)) {
      return { character, status: "literal" as const };
    }

    const lower = character.toLowerCase();
    const cipherLetter = cipherMap[lower] ?? lower;
    const guess = cipherGuesses[cipherLetter];

    if (!guess) {
      return { character: "_", status: "blank" as const };
    }

    const isCorrect = guess.toLowerCase() === lower;
    const displayedGuess = character === lower ? guess.toLowerCase() : guess.toUpperCase();

    return { character: displayedGuess, status: isCorrect ? ("correct" as const) : ("incorrect" as const) };
  });
}

async function createInitialsBoard(
  difficulty: DifficultyFilter | undefined,
  customOnly = false
): Promise<{ boardCards: InitialsBoardCard[]; usedFallbackDifficulty: boolean }> {
  const pack = await loadGameContent("initials", { customOnly });
  const decoratedRounds = pack.sessions.flatMap((session) =>
    session.rounds.map((round) => ({
      ...round,
      theme: session.theme,
      sourceSessionTitle: session.title,
      cluePoolSize: round.hints.length,
      hints: pickRandomSubset(round.hints, INITIALS_CLUES_PER_CARD)
    }))
  );

  // A full board needs 25 cards with distinct initials, but the library only carries a
  // handful of rounds per difficulty tier — nowhere near enough to fill a board on its
  // own. Rather than blocking the game entirely whenever the global difficulty filter
  // isn't "Mixed" (as every other game's filter does), fall back to the full library so
  // Initials still opens; the caller surfaces that fallback in the activity log.
  const filteredRounds = filterRoundsByDifficulty(decoratedRounds, difficulty, "Bible Initials");
  const hasEnoughForFilteredBoard = new Set(filteredRounds.map((round) => round.initials)).size >= BOARD_CARD_COUNT;
  const usedFallbackDifficulty = Boolean(difficulty) && difficulty !== "mixed" && !hasEnoughForFilteredBoard;
  const pool = pickUniqueInitialsRounds(usedFallbackDifficulty ? decoratedRounds : filteredRounds, BOARD_CARD_COUNT);

  const boardCards = pool.map((round, index) => ({
    id: round.id,
    round,
    pickNumber: index + 1,
    status: "available" as const,
    winnerParticipantId: null
  }));

  return { boardCards, usedFallbackDifficulty };
}

function pickGameRounds<T>(rounds: T[], count: number, gameName: string, difficulty?: DifficultyFilter): T[] {
  const filteredRounds = filterRoundsByDifficulty(rounds, difficulty, gameName);
  const selected = shuffle(filteredRounds).slice(0, count);

  if (selected.length < count) {
    const difficultyLabel = difficulty && difficulty !== "mixed" ? ` ${difficulty}` : "";
    throw new Error(`${gameName} needs at least ${count}${difficultyLabel} rounds. Use Mixed for this game or cancel.`);
  }

  return selected;
}

function pickGameRoundsWithDifficultyFallback<T>(
  rounds: T[],
  count: number,
  gameName: string,
  difficulty?: DifficultyFilter
): { rounds: T[]; usedFallbackDifficulty: boolean } {
  if (!difficulty || difficulty === "mixed") {
    return { rounds: pickGameRounds(rounds, count, gameName, difficulty), usedFallbackDifficulty: false };
  }

  const filteredRounds = rounds.filter((round) => getRoundDifficulty(round) === difficulty);

  if (filteredRounds.length >= count) {
    return { rounds: shuffle(filteredRounds).slice(0, count), usedFallbackDifficulty: false };
  }

  if (rounds.length < count) {
    throw new Error(`${gameName} needs at least ${count} rounds. Add more content or choose another game.`);
  }

  return { rounds: shuffle(rounds).slice(0, count), usedFallbackDifficulty: true };
}

function pickGameRoundsForParticipantDifficulties<T>(
  rounds: T[],
  count: number,
  gameName: string,
  globalDifficulty: DifficultyFilter | undefined,
  participants: Participant[]
): { rounds: T[]; usedFallbackDifficulty: boolean } {
  if (
    participants.every(
      (participant) =>
        !getEffectiveParticipantDifficulty(participant) &&
        participant.members.every((member) => !member.difficulty || member.difficulty === "mixed")
    )
  ) {
    return pickGameRoundsWithDifficultyFallback(rounds, count, gameName, globalDifficulty);
  }

  const shuffled = shuffle(rounds);
  const usedRoundIndexes = new Set<number>();
  const selected: T[] = [];
  let usedFallbackDifficulty = false;

  const takeRound = (difficulty: DifficultyFilter | undefined): T | null => {
    const shouldFilter = difficulty && difficulty !== "mixed";
    const matchingIndex = shuffled.findIndex((round, index) => {
      if (usedRoundIndexes.has(index)) {
        return false;
      }

      return !shouldFilter || getRoundDifficulty(round) === difficulty;
    });

    if (matchingIndex >= 0) {
      usedRoundIndexes.add(matchingIndex);
      return shuffled[matchingIndex];
    }

    if (shouldFilter) {
      usedFallbackDifficulty = true;
      return takeRound("mixed");
    }

    return null;
  };

  for (let index = 0; index < count; index += 1) {
    const participantIndex = index % participants.length;
    const participant = participants[participantIndex];
    const memberTurnOffset = participant.turnCounter + Math.floor(index / participants.length);
    const round = takeRound(getEffectiveParticipantDifficulty(participant, memberTurnOffset) ?? globalDifficulty);

    if (!round) {
      break;
    }

    selected.push(round);
  }

  if (selected.length < count) {
    throw new Error(`${gameName} needs at least ${count} rounds. Add more content or choose another game.`);
  }

  return { rounds: selected, usedFallbackDifficulty };
}

function pickRoundsWithUniqueGroupThemeFallback<T extends { groupTheme?: string; difficulty?: string }>(
  rounds: T[],
  count: number,
  gameName: string,
  difficulty?: DifficultyFilter
): { rounds: T[]; usedFallbackDifficulty: boolean } {
  const selectUniqueThemes = (candidates: T[]): T[] => {
    const selected: T[] = [];
    const seenThemes = new Set<string>();
    const shuffled = shuffle(candidates);

    for (const round of shuffled) {
      const groupTheme = round.groupTheme?.trim();
      if (!groupTheme || seenThemes.has(groupTheme)) {
        continue;
      }

      selected.push(round);
      seenThemes.add(groupTheme);

      if (selected.length >= count) {
        return selected;
      }
    }

    for (const round of shuffled) {
      if (!selected.includes(round)) {
        selected.push(round);
      }

      if (selected.length >= count) {
        return selected;
      }
    }

    return selected;
  };

  if (!difficulty || difficulty === "mixed") {
    const selected = selectUniqueThemes(rounds);
    if (selected.length < count) {
      throw new Error(`${gameName} needs at least ${count} rounds. Add more content or choose another game.`);
    }

    return { rounds: selected, usedFallbackDifficulty: false };
  }

  const filteredRounds = rounds.filter((round) => round.difficulty === difficulty);
  const selected = selectUniqueThemes(filteredRounds);

  if (selected.length >= count) {
    return { rounds: selected, usedFallbackDifficulty: false };
  }

  if (rounds.length < count) {
    throw new Error(`${gameName} needs at least ${count} rounds. Add more content or choose another game.`);
  }

  return { rounds: selectUniqueThemes(rounds), usedFallbackDifficulty: true };
}

function createTimelinePrompt(round: BibleTimelineRound): BibleTimelinePrompt {
  return {
    kind: "bible-timeline",
    round,
    arrangedEventIds: shuffle(round.events).map((event) => event.id),
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function splitVerseWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function createVerseScramblePrompt(round: VerseScrambleRound): VerseScramblePrompt {
  const tiles = splitVerseWords(round.verseText).map((text, index) => ({
    id: `${round.id}-word-${index}`,
    text,
    originalIndex: index
  }));
  const bankTileIds = shuffle(tiles).map((tile) => tile.id);

  return {
    kind: "verse-scramble",
    round,
    tiles,
    bankTileIds,
    answerTileIds: [],
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createConnectionsPrompt(round: BibleConnectionsRound): BibleConnectionsPrompt {
  const tiles = shuffle(
    round.groups.flatMap((group) =>
      group.items.map((item, index) => ({
        id: `${group.id}-item-${index}`,
        text: item,
        groupId: group.id
      }))
    )
  );

  return {
    kind: "bible-connections",
    round,
    tiles,
    selectedTileIds: [],
    solvedGroups: [],
    attemptedParticipantIds: [],
    phase: "active",
    resolvedMessage: null
  };
}

function createNameThatBookPrompt(round: NameThatBookRound, state: Pick<SessionBase, "turnIndex" | "participants">): NameThatBookPrompt {
  return {
    kind: "name-that-book",
    round,
    revealedClues: 1,
    phase: "primary",
    primaryParticipantIndex: state.turnIndex,
    primaryTurnConsumed: false,
    stealOrder: buildStealOrder(state.participants.length, state.turnIndex),
    stealCursor: 0,
    primaryMemberName: getCurrentMemberName(state.participants[state.turnIndex]),
    resolvedMessage: null,
    winnerParticipantId: null
  };
}

function createBeforeOrAfterPrompt(round: BeforeOrAfterRound): BeforeOrAfterPrompt {
  const shouldSwap = random() < 0.5;
  const displayRound = shouldSwap
    ? {
        ...round,
        leftEvent: round.rightEvent,
        rightEvent: round.leftEvent,
        earlierEvent: round.earlierEvent === "left" ? ("right" as const) : ("left" as const)
      }
    : round;

  return {
    kind: "before-or-after",
    round: displayRound,
    attemptedParticipantIds: [],
    selectedAnswer: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createReferenceRushPrompt(round: ReferenceRushRound): ReferenceRushPrompt {
  return {
    kind: "reference-rush",
    round,
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createChapterFinderPrompt(round: ChapterFinderRound): ChapterFinderPrompt {
  return {
    kind: "chapter-finder",
    round,
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createWhoSaidItPrompt(round: WhoSaidItRound, speakerPool: string[] = []): WhoSaidItPrompt {
  const distractors = speakerPool.filter((speaker) => normalizeText(speaker) !== normalizeText(round.speaker));
  const choices =
    round.difficulty === "hard"
      ? null
      : shuffle(Array.from(new Set([round.speaker, ...shuffle(distractors).slice(0, 3)])));

  return {
    kind: "who-said-it",
    round,
    choices,
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createBibleBooksRelayPrompt(round: BibleBooksRelayRound): BibleBooksRelayPrompt {
  return {
    kind: "bible-books-relay",
    round,
    arrangedBooks: shuffle(round.books),
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createMissingWordPrompt(round: MissingWordRound): MissingWordPrompt {
  return {
    kind: "missing-word",
    round,
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createOddOneOutPrompt(round: OddOneOutRound): OddOneOutPrompt {
  if (!round.items.includes(round.oddItem)) {
    throw new Error(`Odd One Out round ${round.id} has an oddItem that is not in items.`);
  }

  return {
    kind: "odd-one-out",
    round: {
      ...round,
      items: shuffle(round.items)
    },
    eliminatedChoices: [],
    selectedChoice: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function validateGenealogyRound(round: GenealogyRound) {
  const first = round.fullChain[0];
  const last = round.fullChain[round.fullChain.length - 1];

  if (normalizeText(first) !== normalizeText(round.startPerson) || normalizeText(last) !== normalizeText(round.endPerson)) {
    throw new Error(`Genealogy round ${round.id} fullChain must start with startPerson and end with endPerson.`);
  }
}

function createGenealogyPrompt(round: GenealogyRound, startTurnIndex: number): GenealogyPrompt {
  validateGenealogyRound(round);

  return {
    kind: "genealogy",
    round,
    chain: [round.startPerson],
    startTurnIndex,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createProphecyMatchPrompt(pairs: ProphecyMatchRound[]): ProphecyMatchPrompt {
  return {
    kind: "prophecy-match",
    prophecyCards: shuffle(
      pairs.map((pair) => ({
        id: `${pair.id}-prophecy`,
        pairId: pair.id,
        answerKey: pair.answerKey,
        reference: pair.prophecyReference,
        summary: pair.prophecySummary,
        textShort: pair.prophecyTextShort,
        status: "available" as const
      }))
    ),
    fulfillmentCards: shuffle(
      pairs.map((pair) => ({
        id: `${pair.id}-fulfillment`,
        pairId: pair.id,
        answerKey: pair.answerKey,
        reference: pair.fulfillmentReference,
        summary: pair.fulfillmentSummary,
        textShort: pair.fulfillmentTextShort,
        status: "available" as const
      }))
    ),
    selectedProphecyId: null,
    selectedFulfillmentId: null,
    matchedPairIds: [],
    wrongAttemptsByPairId: {},
    lastAttempt: null,
    phase: "active",
    resolvedMessage: null
  };
}

function createParableMatchPrompt(pairs: ParableMatchRound[]): ParableMatchPrompt {
  return {
    kind: "parable-match",
    parableCards: shuffle(
      pairs.map((pair) => ({
        id: `${pair.id}-parable`,
        pairId: pair.id,
        answerKey: pair.answerKey,
        reference: pair.parableReference,
        summary: pair.parableSummary,
        textShort: pair.parableTextShort,
        status: "available" as const
      }))
    ),
    lessonCards: shuffle(
      pairs.map((pair) => ({
        id: `${pair.id}-lesson`,
        pairId: pair.id,
        answerKey: pair.answerKey,
        reference: pair.title,
        summary: pair.lessonSummary,
        textShort: pair.lessonTextShort,
        status: "available" as const
      }))
    ),
    selectedParableId: null,
    selectedLessonId: null,
    matchedPairIds: [],
    wrongAttemptsByPairId: {},
    lastAttempt: null,
    phase: "active",
    resolvedMessage: null
  };
}

function createMessiahProphecyPrompt(round: MessiahProphecyRound): MessiahProphecyPrompt {
  return {
    kind: "messiah-prophecy",
    round: {
      ...round,
      choices: shuffle(round.choices)
    },
    eliminatedChoices: [],
    selectedAnswer: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createProphecyClueLadderPrompt(round: ProphecyClueLadderRound): ProphecyClueLadderPrompt {
  return {
    kind: "prophecy-clue-ladder",
    round,
    revealedClues: 1,
    guessingDisabled: false,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createFulfillmentFinderPrompt(round: FulfillmentFinderRound): FulfillmentFinderPrompt {
  return {
    kind: "fulfillment-finder",
    round: {
      ...round,
      choices: shuffle(round.choices)
    },
    eliminatedReferences: [],
    selectedReference: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createProphecyCategoriesPrompt(round: ProphecyCategoriesRound): ProphecyCategoriesPrompt {
  return {
    kind: "prophecy-categories",
    round,
    cards: shuffle(round.cards),
    selectedCardId: null,
    selectedCategory: null,
    sortedCardIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createCompleteVersePrompt(round: CompleteVerseRound): CompleteVersePrompt {
  return {
    kind: "complete-the-verse",
    round: {
      ...round,
      choices: shuffle(round.choices)
    },
    eliminatedChoices: [],
    selectedChoice: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createWisdomMatchPrompt(round: WisdomMatchRound): WisdomMatchPrompt {
  return {
    kind: "wisdom-match",
    round: {
      ...round,
      choices: shuffle(round.choices)
    },
    eliminatedChoices: [],
    selectedChoice: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createPsalmThemePrompt(round: PsalmThemeRound): PsalmThemePrompt {
  return {
    kind: "psalm-theme",
    round: {
      ...round,
      choices: shuffle(round.choices)
    },
    eliminatedChoices: [],
    selectedChoice: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createProverbCategoriesPrompt(round: ProverbCategoriesRound): ProverbCategoriesPrompt {
  return {
    kind: "proverb-categories",
    round,
    cards: shuffle(round.cards),
    selectedCardId: null,
    selectedCategory: null,
    sortedCardIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createPsalmReferenceFinderPrompt(round: PsalmReferenceFinderRound): PsalmReferenceFinderPrompt {
  return {
    kind: "psalm-reference-finder",
    round: {
      ...round,
      choices: shuffle(round.choices)
    },
    eliminatedReferences: [],
    selectedReference: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createTwoTruthsAndALiePrompt(round: TwoTruthsAndALieRound): TwoTruthsAndALiePrompt {
  const statements = shuffle(
    round.statements.map((text, index) => ({
      text,
      originalIndex: index as 0 | 1 | 2
    }))
  );

  return {
    kind: "two-truths-and-a-lie",
    round,
    statements,
    eliminatedIndexes: [],
    selectedIndex: null,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createRelayVerseBuildPrompt(round: RelayVerseBuildRound): RelayVerseBuildPrompt {
  return {
    kind: "relay-verse-build",
    round,
    words: splitVerseWords(round.verseText),
    revealedCount: 0,
    wrongAttemptsThisWord: 0,
    totalWrongAttempts: 0,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createVerseTypingRacePrompt(round: VerseTypingRaceRound): VerseTypingRacePrompt {
  return {
    kind: "verse-typing-race",
    round,
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    lastResult: null,
    resolvedMessage: null
  };
}

function createWordLadderPrompt(round: WordLadderRound, startTurnIndex: number): WordLadderPrompt {
  return {
    kind: "word-ladder",
    round,
    chain: [round.startWord],
    startTurnIndex,
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function createBibleAnagramPrompt(round: BibleAnagramRound): BibleAnagramPrompt {
  const letters = round.answer.split("").filter((character) => /[A-Za-z]/.test(character));
  const tiles = letters.map((letter, index) => ({
    id: `${round.id}-letter-${index}`,
    letter: letter.toUpperCase(),
    originalIndex: index
  }));
  const bankTileIds = shuffle(tiles).map((tile) => tile.id);

  return {
    kind: "bible-anagrams",
    round,
    tiles,
    bankTileIds,
    answerTileIds: [],
    attemptedParticipantIds: [],
    phase: "active",
    wasCorrect: null,
    resolvedMessage: null
  };
}

function getOrderedTimelineEvents(round: BibleTimelineRound): TimelineEvent[] {
  return [...round.events].sort((left, right) => left.order - right.order);
}

function resolveRoundState<TState extends RoundSessionBase<unknown, { phase: "active" | "resolved"; resolvedMessage: string | null }>>(
  nextState: TState,
  message: string
) {
  nextState.currentPrompt.phase = "resolved";
  nextState.currentPrompt.resolvedMessage = message;
}

export function getPromptId(state: SessionState): string | null {
  const prefix = getSessionPromptPrefix(state);

  if (state.status !== "in-progress") {
    return null;
  }

  if (state.gameId === "five-guesses" || state.gameId === "initials") {
    return state.currentPrompt && state.currentPrompt.phase !== "resolved"
      ? `${prefix}:${state.gameId}:${state.currentPrompt.cardId}`
      : null;
  }

  if (state.gameId === "scripture-puzzles" || state.gameId === "bible-cryptogram") {
    return state.currentPrompt.isComplete ? null : `${prefix}:${state.gameId}:${state.roundIndex}:${state.currentPrompt.round.id}`;
  }

  if (state.gameId === "prophecy-match" || state.gameId === "parable-match") {
    return state.currentPrompt.phase === "active"
      ? `${prefix}:${state.gameId}:match-board:${state.currentPrompt.matchedPairIds.length}`
      : null;
  }

  if (state.gameId === "prophecy-categories" || state.gameId === "proverb-categories") {
    return state.currentPrompt.phase === "active"
      ? `${prefix}:${state.gameId}:${state.roundIndex}:${state.currentPrompt.sortedCardIds.length}`
      : null;
  }

  if (state.gameId === "word-ladder") {
    return state.currentPrompt.phase === "active"
      ? `${prefix}:${state.gameId}:${state.roundIndex}:${state.turnIndex}:${state.currentPrompt.chain.length}`
      : null;
  }

  if (!state.currentPrompt || state.currentPrompt.phase === "resolved") {
    return null;
  }

  if ("roundIndex" in state && "round" in state.currentPrompt && "id" in state.currentPrompt.round) {
    return `${prefix}:${state.gameId}:${state.roundIndex}:${String(state.currentPrompt.round.id)}`;
  }

  return `${prefix}:${state.gameId}:${state.resolvedPrompts}`;
}

function getParticipantIndexById(state: SessionState, participantId: string): number {
  const participantIndex = state.participants.findIndex((participant) => participant.id === participantId);

  if (participantIndex < 0) {
    throw new Error("Choose a valid participant.");
  }

  return participantIndex;
}

export function setCurrentActor(state: SessionState, participantId: string): ActionResult {
  if (state.status !== "in-progress") {
    return { nextState: state, tone: "info", text: "The game is already complete." };
  }

  const participantIndex = getParticipantIndexById(state, participantId);
  const nextState = structuredClone(state);
  nextState.turnIndex = participantIndex;
  const participant = nextState.participants[participantIndex];

  if (nextState.gameId === "name-that-book") {
    const prompt = nextState.currentPrompt;
    if (prompt.phase === "primary") {
      prompt.primaryParticipantIndex = participantIndex;
      prompt.primaryMemberName = getCurrentMemberName(participant);
      prompt.primaryTurnConsumed = false;
      prompt.stealOrder = buildStealOrder(nextState.participants.length, participantIndex);
      prompt.stealCursor = 0;
    } else if (prompt.phase === "steal") {
      prompt.stealOrder = [participantIndex, ...prompt.stealOrder.filter((entry) => entry !== participantIndex)];
      prompt.stealCursor = 0;
    }
  }

  return addActivity(nextState, "info", `Host selected ${participant.name} to answer.`);
}

function withHostActor(state: SessionState, participantId: string): SessionState {
  const participantIndex = getParticipantIndexById(state, participantId);
  const nextState = structuredClone(state);
  nextState.turnIndex = participantIndex;
  return nextState;
}

function getFirstUnsortedProphecyCategoryCard(state: ProphecyCategoriesState): ProphecyCategoryCard | null {
  return state.currentPrompt.cards.find((card) => !state.currentPrompt.sortedCardIds.includes(card.cardId)) ?? null;
}

function getFirstUnsortedProverbCategoryCard(state: ProverbCategoriesState): ProverbCategoryCard | null {
  return state.currentPrompt.cards.find((card) => !state.currentPrompt.sortedCardIds.includes(card.cardId)) ?? null;
}

export function getHostAwardPoints(state: SessionState, participantId: string): number | null {
  getParticipantIndexById(state, participantId);

  if (state.status !== "in-progress" || !HOST_PHASE_ONE_GAMES.has(state.gameId)) {
    return null;
  }

  switch (state.gameId) {
    case "before-or-after":
      return 3;
    case "reference-rush":
    case "chapter-finder":
    case "who-said-it":
      return 5;
    case "missing-word":
      return state.currentPrompt.round.missingWords.length === 1 ? 3 : state.currentPrompt.round.missingWords.length === 2 ? 5 : 7;
    case "bible-timeline":
    case "verse-scramble":
    case "bible-books-relay":
    case "bible-anagrams":
      return 10;
    case "bible-connections":
    case "prophecy-match":
    case "parable-match":
      return 5;
    case "prophecy-categories":
    case "proverb-categories":
      return 1;
    case "messiah-prophecy":
      return scoreProphecyRetry(state.currentPrompt.eliminatedChoices.length);
    case "fulfillment-finder":
    case "psalm-reference-finder":
      return scoreProphecyRetry(state.currentPrompt.eliminatedReferences.length);
    case "complete-the-verse":
    case "wisdom-match":
    case "psalm-theme":
    case "odd-one-out":
      return scoreProphecyRetry(state.currentPrompt.eliminatedChoices.length);
    case "two-truths-and-a-lie":
      return scoreProphecyRetry(state.currentPrompt.eliminatedIndexes.length);
    case "prophecy-clue-ladder":
      return scoreProphecyRetry(state.currentPrompt.revealedClues - 1);
    default:
      return null;
  }
}

function overrideAwardPoints(
  sourceState: SessionState,
  result: ActionResult,
  participantId: string,
  points: number | undefined
): ActionResult {
  if (points == null) {
    return result;
  }

  const nextState = structuredClone(result.nextState);
  const beforeScore = sourceState.stats[participantId]?.totalScore ?? 0;
  const afterScore = result.nextState.stats[participantId]?.totalScore ?? beforeScore;
  const defaultAward = afterScore - beforeScore;

  if (result.tone === "success" && nextState.stats[participantId]) {
    nextState.stats[participantId].totalScore = Math.max(0, afterScore - defaultAward + points);
  }

  return { ...result, nextState };
}

export function markCorrectForHost(
  state: SessionState,
  participantId: string,
  options: { points?: number; answerText?: string } = {}
): ActionResult {
  if (state.status !== "in-progress") {
    return { nextState: state, tone: "info", text: "The game is already complete." };
  }

  const hostState = withHostActor(state, participantId);
  let result: ActionResult;

  switch (hostState.gameId) {
    case "before-or-after":
      result = answerBeforeOrAfter(hostState, hostState.currentPrompt.round.earlierEvent);
      break;
    case "reference-rush":
      result = submitReferenceRushGuess(hostState, hostState.currentPrompt.round.reference);
      break;
    case "chapter-finder":
      result = submitChapterFinderGuess(
        hostState,
        `${hostState.currentPrompt.round.answerBook} ${hostState.currentPrompt.round.answerChapter}`
      );
      break;
    case "who-said-it":
      result = submitWhoSaidItGuess(hostState, hostState.currentPrompt.round.speaker);
      break;
    case "missing-word":
      result = submitMissingWordGuess(hostState, hostState.currentPrompt.round.missingWords.join(" "));
      break;
    case "odd-one-out":
      result = submitOddOneOutChoice(hostState, hostState.currentPrompt.round.oddItem);
      break;
    case "messiah-prophecy":
      result = submitMessiahProphecyChoice(hostState, hostState.currentPrompt.round.correctAnswer);
      break;
    case "fulfillment-finder":
      result = submitFulfillmentFinderChoice(hostState, hostState.currentPrompt.round.correctProphecyReference);
      break;
    case "complete-the-verse":
      result = submitCompleteVerseChoice(hostState, hostState.currentPrompt.round.correctEnding);
      break;
    case "wisdom-match":
      result = submitWisdomMatchChoice(hostState, hostState.currentPrompt.round.correctTheme);
      break;
    case "psalm-theme":
      result = submitPsalmThemeChoice(hostState, hostState.currentPrompt.round.correctTheme);
      break;
    case "psalm-reference-finder":
      result = submitPsalmReferenceFinderChoice(hostState, hostState.currentPrompt.round.correctReference);
      break;
    case "two-truths-and-a-lie":
      result = selectTwoTruthsStatement(hostState, hostState.currentPrompt.round.lieIndex);
      break;
    case "prophecy-clue-ladder":
      result = submitProphecyClueGuess(hostState, hostState.currentPrompt.round.answer);
      break;
    case "bible-anagrams": {
      const nextState = structuredClone(hostState);
      nextState.currentPrompt.answerTileIds = nextState.currentPrompt.tiles
        .slice()
        .sort((left, right) => left.originalIndex - right.originalIndex)
        .map((tile) => tile.id);
      nextState.currentPrompt.bankTileIds = [];
      result = submitBibleAnagram(nextState);
      break;
    }
    case "bible-timeline": {
      const nextState = structuredClone(hostState);
      nextState.currentPrompt.arrangedEventIds = nextState.currentPrompt.round.events
        .slice()
        .sort((left, right) => left.order - right.order)
        .map((event) => event.id);
      result = submitTimelineOrder(nextState);
      break;
    }
    case "verse-scramble": {
      const nextState = structuredClone(hostState);
      nextState.currentPrompt.answerTileIds = nextState.currentPrompt.tiles
        .slice()
        .sort((left, right) => left.originalIndex - right.originalIndex)
        .map((tile) => tile.id);
      nextState.currentPrompt.bankTileIds = [];
      result = submitVerseScramble(nextState);
      break;
    }
    case "bible-books-relay": {
      const nextState = structuredClone(hostState);
      nextState.currentPrompt.arrangedBooks = [...nextState.currentPrompt.round.books];
      result = submitBibleBooksRelay(nextState);
      break;
    }
    case "bible-connections": {
      const group = hostState.currentPrompt.round.groups.find(
        (entry) => !hostState.currentPrompt.solvedGroups.some((solved) => solved.groupId === entry.id)
      );
      if (!group) {
        throw new Error("No unsolved connection group is available.");
      }
      const nextState = structuredClone(hostState);
      nextState.currentPrompt.selectedTileIds = nextState.currentPrompt.tiles
        .filter((tile) => tile.groupId === group.id)
        .map((tile) => tile.id);
      result = submitConnectionGroup(nextState);
      break;
    }
    case "prophecy-match": {
      const pair = hostState.pairs.find((entry) => !hostState.currentPrompt.matchedPairIds.includes(entry.id));
      if (!pair) {
        throw new Error("No unmatched prophecy pair is available.");
      }
      let next = selectProphecyMatchCard(hostState, "prophecy", `${pair.id}-prophecy`).nextState;
      next = selectProphecyMatchCard(next, "fulfillment", `${pair.id}-fulfillment`).nextState;
      result = submitProphecyMatch(next);
      break;
    }
    case "parable-match": {
      const pair = hostState.pairs.find((entry) => !hostState.currentPrompt.matchedPairIds.includes(entry.id));
      if (!pair) {
        throw new Error("No unmatched parable pair is available.");
      }
      let next = selectParableMatchCard(hostState, "parable", `${pair.id}-parable`).nextState;
      next = selectParableMatchCard(next, "lesson", `${pair.id}-lesson`).nextState;
      result = submitParableMatch(next);
      break;
    }
    case "prophecy-categories": {
      const card = getFirstUnsortedProphecyCategoryCard(hostState);
      if (!card) {
        throw new Error("No unsorted prophecy card is available.");
      }
      let next = selectProphecyCategoryCard(hostState, card.cardId).nextState;
      next = selectProphecyCategory(next, card.category).nextState;
      result = submitProphecyCategory(next);
      break;
    }
    case "proverb-categories": {
      const card = getFirstUnsortedProverbCategoryCard(hostState);
      if (!card) {
        throw new Error("No unsorted Proverbs card is available.");
      }
      let next = selectProverbCategoryCard(hostState, card.cardId).nextState;
      next = selectProverbCategory(next, card.category).nextState;
      result = submitProverbCategory(next);
      break;
    }
    default:
      throw new Error("Host judging is not available for this game yet.");
  }

  return overrideAwardPoints(state, result, participantId, options.points);
}

export function markIncorrectForHost(
  state: SessionState,
  participantId: string,
  options: { answerText?: string } = {}
): ActionResult {
  if (state.status !== "in-progress") {
    return { nextState: state, tone: "info", text: "The game is already complete." };
  }

  const hostState = withHostActor(state, participantId);

  switch (hostState.gameId) {
    case "before-or-after":
      return answerBeforeOrAfter(hostState, hostState.currentPrompt.round.earlierEvent === "left" ? "right" : "left");
    case "reference-rush":
      return submitReferenceRushGuess(hostState, HOST_MARK_INCORRECT_PLACEHOLDER);
    case "chapter-finder":
      return submitChapterFinderGuess(hostState, HOST_MARK_INCORRECT_PLACEHOLDER);
    case "who-said-it":
      return submitWhoSaidItGuess(hostState, HOST_MARK_INCORRECT_PLACEHOLDER);
    case "missing-word":
      return submitMissingWordGuess(hostState, HOST_MARK_INCORRECT_PLACEHOLDER);
    case "odd-one-out":
      return submitOddOneOutChoice(
        hostState,
        hostState.currentPrompt.round.items.find((item) => normalizeText(item) !== normalizeText(hostState.currentPrompt.round.oddItem)) ??
          HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "messiah-prophecy":
      return submitMessiahProphecyChoice(
        hostState,
        hostState.currentPrompt.round.choices.find(
          (choice) => normalizeText(choice) !== normalizeText(hostState.currentPrompt.round.correctAnswer)
        ) ?? HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "fulfillment-finder":
      return submitFulfillmentFinderChoice(
        hostState,
        hostState.currentPrompt.round.choices.find(
          (choice) => normalizeText(choice.reference) !== normalizeText(hostState.currentPrompt.round.correctProphecyReference)
        )?.reference ?? HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "complete-the-verse":
      return submitCompleteVerseChoice(
        hostState,
        hostState.currentPrompt.round.choices.find(
          (choice) => normalizeText(choice) !== normalizeText(hostState.currentPrompt.round.correctEnding)
        ) ?? HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "wisdom-match":
      return submitWisdomMatchChoice(
        hostState,
        hostState.currentPrompt.round.choices.find(
          (choice) => normalizeText(choice) !== normalizeText(hostState.currentPrompt.round.correctTheme)
        ) ?? HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "psalm-theme":
      return submitPsalmThemeChoice(
        hostState,
        hostState.currentPrompt.round.choices.find(
          (choice) => normalizeText(choice) !== normalizeText(hostState.currentPrompt.round.correctTheme)
        ) ?? HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "psalm-reference-finder":
      return submitPsalmReferenceFinderChoice(
        hostState,
        hostState.currentPrompt.round.choices.find(
          (choice) => normalizeText(choice) !== normalizeText(hostState.currentPrompt.round.correctReference)
        ) ?? HOST_MARK_INCORRECT_PLACEHOLDER
      );
    case "two-truths-and-a-lie": {
      const trueStatement = hostState.currentPrompt.statements.find((statement) => statement.originalIndex !== hostState.currentPrompt.round.lieIndex);
      if (!trueStatement) {
        throw new Error("No incorrect statement is available.");
      }
      return selectTwoTruthsStatement(hostState, trueStatement.originalIndex);
    }
    case "prophecy-clue-ladder":
      return submitProphecyClueGuess(hostState, HOST_MARK_INCORRECT_PLACEHOLDER);
    case "bible-anagrams":
      return passBibleAnagram(hostState);
    case "bible-timeline":
      return revealTimelineRound(hostState, `${hostState.participants[hostState.turnIndex]?.name ?? "The selected participant"} missed. Correct order is revealed.`);
    case "verse-scramble":
      return passVerseScramble(hostState);
    case "bible-books-relay":
      return passBibleBooksRelay(hostState);
    case "bible-connections":
      return passConnectionTurn(hostState);
    case "prophecy-match":
      return passProphecyMatch(hostState);
    case "parable-match":
      return passParableMatch(hostState);
    case "prophecy-categories":
      return passProphecyCategory(hostState);
    case "proverb-categories":
      return passProverbCategory(hostState);
    default:
      throw new Error("Host judging is not available for this game yet.");
  }
}

function advanceLinearRound<TState extends RoundSessionBase<unknown, unknown>>(
  nextState: TState,
  createPrompt: (round: unknown) => unknown
): ActionResult {
  nextState.resolvedPrompts += 1;

  if (nextState.roundIndex + 1 >= nextState.rounds.length) {
    nextState.status = "completed";
    return addActivity(nextState as SessionState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
  }

  nextState.roundIndex += 1;
  nextState.currentPrompt = createPrompt(nextState.rounds[nextState.roundIndex]);

  return addActivity(nextState as SessionState, "info", `Round ${nextState.roundIndex + 1} is ready.`);
}

export function buildScriptureBoard(text: string, attemptedLetters: string[]): string {
  const attempted = new Set(attemptedLetters.map((entry) => entry.toLowerCase()));

  return Array.from(text)
    .map((character) => {
      if (!/[a-z]/i.test(character)) {
        return character;
      }

      return attempted.has(character.toLowerCase()) ? character : "_";
    })
    .join("");
}

function normalizeWord(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function buildMissingWordVerse(round: MissingWordRound): string {
  const missingWords = [...round.missingWords.map(normalizeWord)];

  return round.verseText.replace(/[A-Za-z0-9']+/g, (word) => {
    const normalized = normalizeWord(word);
    const missingIndex = missingWords.findIndex((missingWord) => missingWord === normalized);

    if (missingIndex < 0) {
      return word;
    }

    missingWords.splice(missingIndex, 1);
    return "_".repeat(Math.max(5, word.length));
  });
}

export async function getScriptureSessionOptions(): Promise<SessionOption[]> {
  const pack = await loadGameContent("scripture-puzzles");

  return pack.sessions.map((session) => ({
    id: session.id,
    title: session.title,
    theme: session.theme
  }));
}

// Applies SessionConfig.maxPrompts to a game's normal round/card count, for short test-mode
// sessions. Never increases the count, and always leaves at least one prompt.
function capPromptCount(count: number, maxPrompts: number | undefined): number {
  if (typeof maxPrompts !== "number" || !Number.isFinite(maxPrompts) || maxPrompts <= 0) {
    return count;
  }

  return Math.max(1, Math.min(count, Math.floor(maxPrompts)));
}

// Same idea as capPromptCount, but for board games (five-guesses, initials) whose card count
// is decided by their own board-building logic rather than pickGameRounds. Truncating the
// board to a prefix is fine here: pickNumber is only ever used for a display label, and the
// five-guesses board UI derives its category columns from whatever cards are present, so a
// short board still renders correctly. Real (non-test-mode) sessions never pass maxPrompts.
function capBoardCards<T>(boardCards: T[], maxPrompts: number | undefined): T[] {
  if (typeof maxPrompts !== "number" || !Number.isFinite(maxPrompts) || maxPrompts <= 0) {
    return boardCards;
  }

  return boardCards.slice(0, Math.max(1, Math.floor(maxPrompts)));
}

export async function createSessionState(config: SessionConfig): Promise<SessionState> {
  const sessionInstanceId = createSessionInstanceId();
  const participants = createParticipants(config);
  const stats = Object.fromEntries(participants.map((participant) => [participant.id, createPlayerStats()]));
  const customOnly = config.contentSource === "custom";
  const loadContent = <TGame extends GameId>(mode: TGame) => loadGameContent(mode, { customOnly });
  const pickRounds = <T,>(rounds: T[], count: number, gameName: string) =>
    pickGameRoundsForParticipantDifficulties(
      rounds,
      capPromptCount(count, config.maxPrompts),
      gameName,
      config.difficulty,
      participants
    ).rounds;

  if (config.gameId === "five-guesses") {
    const boardCards = capBoardCards(await createFiveGuessesBoard(config.difficulty, customOnly), config.maxPrompts);

    return {
      gameId: "five-guesses",
      displayName: GAME_LIBRARY["five-guesses"].label,
      sessionTitle: "Random Five Clues Board",
      sessionTheme: "Five categories with five value cards drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Five Clues board is live. The active player chooses any available card.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: boardCards.length,
      resolvedPrompts: 0,
      boardCards,
      currentPrompt: null
    };
  }

  if (config.gameId === "initials") {
    const { boardCards: fullBoardCards, usedFallbackDifficulty } = await createInitialsBoard(
      config.difficulty,
      customOnly
    );
    const boardCards = capBoardCards(fullBoardCards, config.maxPrompts);

    return {
      gameId: "initials",
      displayName: GAME_LIBRARY.initials.label,
      sessionTitle: "Random Bible Initials Board",
      sessionTheme: "Twenty-five random Bible Initials cards drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: usedFallbackDifficulty
            ? "Bible Initials random board is ready. This board always draws from the full library — a full 25-card board needs more unique initials than one difficulty tier has. The active player chooses any available card."
            : "Bible Initials random board is ready. The active player chooses any available card.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: boardCards.length,
      resolvedPrompts: 0,
      boardCards,
      currentPrompt: null
    };
  }

  if (config.gameId === "bible-timeline") {
    const pack = await loadContent("bible-timeline");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      TIMELINE_ROUNDS_PER_GAME,
      "Bible Timeline"
    );

    return {
      gameId: "bible-timeline",
      displayName: GAME_LIBRARY["bible-timeline"].label,
      sessionTitle: "Random Bible Timeline Deck",
      sessionTheme: "Five random chronology rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Bible Timeline is live. Arrange the events and submit the full order.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createTimelinePrompt(rounds[0])
    };
  }

  if (config.gameId === "verse-scramble") {
    const pack = await loadContent("verse-scramble");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      VERSE_SCRAMBLE_ROUNDS_PER_GAME,
      "Verse Scramble"
    );

    return {
      gameId: "verse-scramble",
      displayName: GAME_LIBRARY["verse-scramble"].label,
      sessionTitle: "Random Verse Scramble Deck",
      sessionTheme: "Five short KJV verse rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Verse Scramble is live. Build the verse from the shuffled word tiles.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createVerseScramblePrompt(rounds[0])
    };
  }

  if (config.gameId === "bible-connections") {
    const pack = await loadContent("bible-connections");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      CONNECTIONS_ROUNDS_PER_GAME,
      "Bible Connections"
    );

    return {
      gameId: "bible-connections",
      displayName: GAME_LIBRARY["bible-connections"].label,
      sessionTitle: "Random Bible Connections Boards",
      sessionTheme: "Three random sixteen-tile boards drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Bible Connections is live. Select four connected terms and submit the group.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createConnectionsPrompt(rounds[0])
    };
  }

  if (config.gameId === "name-that-book") {
    const pack = await loadContent("name-that-book");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      NAME_THAT_BOOK_ROUNDS_PER_GAME,
      "Name That Book"
    );

    const state: NameThatBookState = {
      gameId: "name-that-book",
      displayName: GAME_LIBRARY["name-that-book"].label,
      sessionTitle: "Random Name That Book Deck",
      sessionTheme: "Ten random Bible-book clue rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Name That Book is live. Guess early for more points.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: undefined as unknown as NameThatBookPrompt
    };
    state.currentPrompt = createNameThatBookPrompt(rounds[0], state);

    return state;
  }

  if (config.gameId === "before-or-after") {
    const pack = await loadContent("before-or-after");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      BEFORE_AFTER_ROUNDS_PER_GAME,
      "Before Or After"
    );

    return {
      gameId: "before-or-after",
      displayName: GAME_LIBRARY["before-or-after"].label,
      sessionTitle: "Random Before Or After Deck",
      sessionTheme: "Fifteen random event-order comparisons drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Before Or After is live. Choose which event happened first.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createBeforeOrAfterPrompt(rounds[0])
    };
  }

  if (config.gameId === "reference-rush") {
    const pack = await loadContent("reference-rush");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      REFERENCE_RUSH_ROUNDS_PER_GAME,
      "Reference Rush"
    );

    return {
      gameId: "reference-rush",
      displayName: GAME_LIBRARY["reference-rush"].label,
      sessionTitle: "Random Reference Rush Deck",
      sessionTheme: "Ten random KJV reference rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Reference Rush is live. Read the verse and name the reference.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createReferenceRushPrompt(rounds[0])
    };
  }

  if (config.gameId === "chapter-finder") {
    const pack = await loadContent("chapter-finder");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      CHAPTER_FINDER_ROUNDS_PER_GAME,
      "Chapter Finder"
    );

    return {
      gameId: "chapter-finder",
      displayName: GAME_LIBRARY["chapter-finder"].label,
      sessionTitle: "Random Chapter Finder Deck",
      sessionTheme: "Ten random book-and-chapter prompts drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Chapter Finder is live. Name the Bible book and chapter.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createChapterFinderPrompt(rounds[0])
    };
  }

  if (config.gameId === "who-said-it") {
    const pack = await loadContent("who-said-it");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      WHO_SAID_IT_ROUNDS_PER_GAME,
      "Who Said It?"
    );

    return {
      gameId: "who-said-it",
      displayName: GAME_LIBRARY["who-said-it"].label,
      sessionTitle: "Random Who Said It? Deck",
      sessionTheme: "Ten random KJV quote rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Who Said It? is live. Identify the speaker of the quote.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createWhoSaidItPrompt(rounds[0], rounds.map((round) => round.speaker))
    };
  }

  if (config.gameId === "bible-books-relay") {
    const pack = await loadContent("bible-books-relay");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      BIBLE_BOOKS_RELAY_ROUNDS_PER_GAME,
      "Bible Books Relay"
    );

    return {
      gameId: "bible-books-relay",
      displayName: GAME_LIBRARY["bible-books-relay"].label,
      sessionTitle: "Random Bible Books Relay Deck",
      sessionTheme: "Five random canonical book-order rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Bible Books Relay is live. Arrange the books in canonical order.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createBibleBooksRelayPrompt(rounds[0])
    };
  }

  if (config.gameId === "missing-word") {
    const pack = await loadContent("missing-word");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      MISSING_WORD_ROUNDS_PER_GAME,
      "Missing Word"
    );

    return {
      gameId: "missing-word",
      displayName: GAME_LIBRARY["missing-word"].label,
      sessionTitle: "Random Missing Word Deck",
      sessionTheme: "Ten random KJV missing-word rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Missing Word is live. Fill in the blank word or phrase.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createMissingWordPrompt(rounds[0])
    };
  }

  if (config.gameId === "odd-one-out") {
    const pack = await loadContent("odd-one-out");
    const { rounds, usedFallbackDifficulty } = pickRoundsWithUniqueGroupThemeFallback(
      pack.sessions.flatMap((session) => session.rounds),
      capPromptCount(ODD_ONE_OUT_ROUNDS_PER_GAME, config.maxPrompts),
      "Odd One Out",
      config.difficulty
    );

    return {
      gameId: "odd-one-out",
      displayName: GAME_LIBRARY["odd-one-out"].label,
      sessionTitle: "Random Odd One Out Deck",
      sessionTheme: "Ten random Bible grouping rounds drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: usedFallbackDifficulty
            ? "Odd One Out is live using mixed difficulty because the selected difficulty does not have enough rounds. Choose the item that does not fit the group."
            : "Odd One Out is live. Choose the item that does not fit the group.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createOddOneOutPrompt(rounds[0])
    };
  }

  if (config.gameId === "genealogy") {
    const pack = await loadContent("genealogy");
    const { rounds, usedFallbackDifficulty } = pickGameRoundsWithDifficultyFallback(
      pack.sessions.flatMap((session) => session.rounds),
      capPromptCount(GENEALOGY_ROUNDS_PER_GAME, config.maxPrompts),
      "Fill in the Genealogy",
      config.difficulty
    );

    return {
      gameId: "genealogy",
      displayName: GAME_LIBRARY.genealogy.label,
      sessionTitle: "Random Genealogy Chains",
      sessionTheme: "Six random Bible family lines drawn from the full library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: usedFallbackDifficulty
            ? "Fill in the Genealogy is live using mixed difficulty because the selected difficulty does not have enough rounds. Submit the next name in the line."
            : "Fill in the Genealogy is live. Submit the next name in the line.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createGenealogyPrompt(rounds[0], 0)
    };
  }

  if (config.gameId === "prophecy-match") {
    const pack = await loadContent("prophecy-match");
    const pairs = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PROPHECY_MATCH_PAIRS_PER_GAME,
      "Prophecy Match Challenge"
    );

    return {
      gameId: "prophecy-match",
      displayName: GAME_LIBRARY["prophecy-match"].label,
      sessionTitle: "Random Prophecy Match Board",
      sessionTheme: "Five Old Testament prophecy cards matched to New Testament fulfillment cards.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Prophecy Match Challenge is live. Select one prophecy card and one fulfillment card.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: pairs.length,
      resolvedPrompts: 0,
      pairs,
      currentPrompt: createProphecyMatchPrompt(pairs)
    };
  }

  if (config.gameId === "parable-match") {
    const pack = await loadContent("parable-match");
    const { rounds: pairs, usedFallbackDifficulty } = pickGameRoundsWithDifficultyFallback(
      pack.sessions.flatMap((session) => session.rounds),
      capPromptCount(PARABLE_MATCH_PAIRS_PER_GAME, config.maxPrompts),
      "Parable Match",
      config.difficulty
    );

    return {
      gameId: "parable-match",
      displayName: GAME_LIBRARY["parable-match"].label,
      sessionTitle: "Random Parable Match Board",
      sessionTheme: "Five parable cards matched to central lesson cards.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: usedFallbackDifficulty
            ? "Parable Match is live using mixed difficulty because the selected difficulty does not have enough pairs. Select one parable card and one lesson card."
            : "Parable Match is live. Select one parable card and one lesson card.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: pairs.length,
      resolvedPrompts: 0,
      pairs,
      currentPrompt: createParableMatchPrompt(pairs)
    };
  }

  if (config.gameId === "messiah-prophecy") {
    const pack = await loadContent("messiah-prophecy");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PROPHECY_MULTIPLE_CHOICE_ROUNDS_PER_GAME,
      "Messiah Prophecy Challenge"
    );

    return {
      gameId: "messiah-prophecy",
      displayName: GAME_LIBRARY["messiah-prophecy"].label,
      sessionTitle: "Random Messiah Prophecy Deck",
      sessionTheme: "Ten messianic prophecy prompts drawn from the prophecy library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Messiah Prophecy Challenge is live. Choose the connected fulfillment or theme.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createMessiahProphecyPrompt(rounds[0])
    };
  }

  if (config.gameId === "prophecy-clue-ladder") {
    const pack = await loadContent("prophecy-clue-ladder");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PROPHECY_CLUE_LADDER_ROUNDS_PER_GAME,
      "Prophecy Clue Ladder"
    );

    return {
      gameId: "prophecy-clue-ladder",
      displayName: GAME_LIBRARY["prophecy-clue-ladder"].label,
      sessionTitle: "Random Prophecy Clue Ladder Deck",
      sessionTheme: "Ten five-clue prophecy rounds drawn from the prophecy library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Prophecy Clue Ladder is live. Guess early for more points.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createProphecyClueLadderPrompt(rounds[0])
    };
  }

  if (config.gameId === "fulfillment-finder") {
    const pack = await loadContent("fulfillment-finder");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PROPHECY_MULTIPLE_CHOICE_ROUNDS_PER_GAME,
      "Fulfillment Finder Challenge"
    );

    return {
      gameId: "fulfillment-finder",
      displayName: GAME_LIBRARY["fulfillment-finder"].label,
      sessionTitle: "Random Fulfillment Finder Deck",
      sessionTheme: "Ten New Testament fulfillment prompts drawn from the prophecy library.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Fulfillment Finder Challenge is live. Choose the connected Old Testament prophecy.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createFulfillmentFinderPrompt(rounds[0])
    };
  }

  if (config.gameId === "prophecy-categories") {
    const pack = await loadContent("prophecy-categories");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PROPHECY_CATEGORIES_ROUNDS_PER_GAME,
      "Prophecy Categories Challenge"
    );
    const cards = capBoardCards(rounds[0].cards, config.maxPrompts);
    const round = { ...rounds[0], cards };

    return {
      gameId: "prophecy-categories",
      displayName: GAME_LIBRARY["prophecy-categories"].label,
      sessionTitle: round.title,
      sessionTheme: "Sort each prophecy card into the correct reference category.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Prophecy Categories Challenge is live. Select a prophecy card and a category.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: round.cards.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds: [{ ...rounds[0], cards }, ...rounds.slice(1)],
      currentPrompt: createProphecyCategoriesPrompt(round)
    };
  }

  if (config.gameId === "complete-the-verse") {
    const pack = await loadContent("complete-the-verse");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PSALMS_PROVERBS_MULTIPLE_CHOICE_ROUNDS_PER_GAME,
      "Complete the Verse Challenge"
    );

    return {
      gameId: "complete-the-verse",
      displayName: GAME_LIBRARY["complete-the-verse"].label,
      sessionTitle: "Random Complete the Verse Deck",
      sessionTheme: "Ten KJV verse-ending prompts drawn from Psalms and Proverbs.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Complete the Verse Challenge is live. Choose the correct KJV ending.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createCompleteVersePrompt(rounds[0])
    };
  }

  if (config.gameId === "wisdom-match") {
    const pack = await loadContent("wisdom-match");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PSALMS_PROVERBS_MULTIPLE_CHOICE_ROUNDS_PER_GAME,
      "Wisdom Match Challenge"
    );

    return {
      gameId: "wisdom-match",
      displayName: GAME_LIBRARY["wisdom-match"].label,
      sessionTitle: "Random Wisdom Match Deck",
      sessionTheme: "Ten Proverbs excerpts matched to wisdom themes.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Wisdom Match Challenge is live. Choose the matching wisdom theme.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createWisdomMatchPrompt(rounds[0])
    };
  }

  if (config.gameId === "psalm-theme") {
    const pack = await loadContent("psalm-theme");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PSALMS_PROVERBS_MULTIPLE_CHOICE_ROUNDS_PER_GAME,
      "Psalm Theme Challenge"
    );

    return {
      gameId: "psalm-theme",
      displayName: GAME_LIBRARY["psalm-theme"].label,
      sessionTitle: "Random Psalm Theme Deck",
      sessionTheme: "Ten Psalm excerpts matched to major themes.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Psalm Theme Challenge is live. Choose the major theme.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createPsalmThemePrompt(rounds[0])
    };
  }

  if (config.gameId === "proverb-categories") {
    const pack = await loadContent("proverb-categories");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PROVERB_CATEGORIES_ROUNDS_PER_GAME,
      "Proverb Categories Challenge"
    );
    const cards = capBoardCards(rounds[0].cards, config.maxPrompts);
    const round = { ...rounds[0], cards };

    return {
      gameId: "proverb-categories",
      displayName: GAME_LIBRARY["proverb-categories"].label,
      sessionTitle: round.title,
      sessionTheme: "Sort each Proverbs card into the correct wisdom category.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Proverb Categories Challenge is live. Select a Proverbs card and a category.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: round.cards.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds: [{ ...rounds[0], cards }, ...rounds.slice(1)],
      currentPrompt: createProverbCategoriesPrompt(round)
    };
  }

  if (config.gameId === "psalm-reference-finder") {
    const pack = await loadContent("psalm-reference-finder");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      PSALMS_PROVERBS_MULTIPLE_CHOICE_ROUNDS_PER_GAME,
      "Psalm Reference Finder"
    );

    return {
      gameId: "psalm-reference-finder",
      displayName: GAME_LIBRARY["psalm-reference-finder"].label,
      sessionTitle: "Random Psalm Reference Finder Deck",
      sessionTheme: "Ten Psalm excerpts matched to KJV references.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Psalm Reference Finder is live. Choose the correct Psalm reference.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createPsalmReferenceFinderPrompt(rounds[0])
    };
  }

  if (config.gameId === "two-truths-and-a-lie") {
    const pack = await loadContent("two-truths-and-a-lie");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      TWO_TRUTHS_AND_A_LIE_ROUNDS_PER_GAME,
      "Two Truths and a Lie"
    );

    return {
      gameId: "two-truths-and-a-lie",
      displayName: GAME_LIBRARY["two-truths-and-a-lie"].label,
      sessionTitle: "Random Two Truths and a Lie Deck",
      sessionTheme: "Ten Bible figures and events, each with one false statement to catch.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Two Truths and a Lie is live. Pick the false statement.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createTwoTruthsAndALiePrompt(rounds[0])
    };
  }

  if (config.gameId === "relay-verse-build") {
    const pack = await loadContent("relay-verse-build");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      RELAY_VERSE_BUILD_ROUNDS_PER_GAME,
      "Relay Verse Build"
    );

    return {
      gameId: "relay-verse-build",
      displayName: GAME_LIBRARY["relay-verse-build"].label,
      sessionTitle: "Random Relay Verse Build Deck",
      sessionTheme: "Five hidden KJV verses to rebuild one word at a time.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Relay Verse Build is live. Type the next word of the verse.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createRelayVerseBuildPrompt(rounds[0])
    };
  }

  if (config.gameId === "verse-typing-race") {
    const pack = await loadContent("verse-typing-race");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      VERSE_TYPING_RACE_ROUNDS_PER_GAME,
      "Verse Typing Race"
    );

    return {
      gameId: "verse-typing-race",
      displayName: GAME_LIBRARY["verse-typing-race"].label,
      sessionTitle: "Random Verse Typing Race Deck",
      sessionTheme: "Five short KJV verses to type as fast and accurately as you can.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Verse Typing Race is live. Type the verse as fast and accurately as you can.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createVerseTypingRacePrompt(rounds[0])
    };
  }

  if (config.gameId === "word-ladder") {
    const pack = await loadContent("word-ladder");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      WORD_LADDER_ROUNDS_PER_GAME,
      "Word Ladder"
    );

    return {
      gameId: "word-ladder",
      displayName: GAME_LIBRARY["word-ladder"].label,
      sessionTitle: "Random Word Ladder Deck",
      sessionTheme: "Six word ladders to solve one letter change at a time.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Word Ladder is live. Submit the next word in the chain.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createWordLadderPrompt(rounds[0], 0)
    };
  }

  if (config.gameId === "bible-anagrams") {
    const pack = await loadContent("bible-anagrams");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      BIBLE_ANAGRAMS_ROUNDS_PER_GAME,
      "Bible Anagrams"
    );

    return {
      gameId: "bible-anagrams",
      displayName: GAME_LIBRARY["bible-anagrams"].label,
      sessionTitle: "Random Bible Anagrams Deck",
      sessionTheme: "Ten scrambled Bible names, places, things, and events to unscramble.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Bible Anagrams is live. Unscramble the letters.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createBibleAnagramPrompt(rounds[0])
    };
  }

  if (config.gameId === "bible-cryptogram") {
    const pack = await loadContent("bible-cryptogram");
    const rounds = pickRounds(
      pack.sessions.flatMap((session) => session.rounds),
      BIBLE_CRYPTOGRAM_ROUNDS_PER_GAME,
      "Bible Cryptogram"
    );

    return {
      gameId: "bible-cryptogram",
      displayName: GAME_LIBRARY["bible-cryptogram"].label,
      sessionTitle: "Random Bible Cryptogram Deck",
      sessionTheme: "Crack the cipher to reveal a Bible name, phrase, or short verse.",
      participantMode: config.participantMode,
      sessionInstanceId,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Bible Cryptogram is live. Guess a letter or attempt a full solve.",
          roundNumber: 1
        }
      ],
      status: "in-progress",
      turnIndex: 0,
      totalPrompts: rounds.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createBibleCryptogramPrompt(rounds[0])
    };
  }

  const scripturePack = await loadContent("scripture-puzzles");
  const rounds = pickRounds(
    scripturePack.sessions.flatMap((session) => session.rounds),
    SCRIPTURE_ROUNDS_PER_GAME,
    "Verse Reveal"
  );

  return {
    gameId: "scripture-puzzles",
    displayName: GAME_LIBRARY["scripture-puzzles"].label,
    sessionTitle: "Random Verse Reveal Deck",
    sessionTheme: "Five random scripture rounds drawn from the full library.",
    participantMode: config.participantMode,
    sessionInstanceId,
    participants,
    stats,
    activityLog: [
      {
        id: "start-1",
        tone: "info",
        text: "Random scripture deck is live. Each round pulls a different verse from the library.",
        roundNumber: 1
      }
    ],
    status: "in-progress",
    turnIndex: 0,
    totalPrompts: rounds.length,
    resolvedPrompts: 0,
    sessionId: "random-scripture-session",
    roundIndex: 0,
    rounds,
    currentPrompt: createScripturePrompt(rounds[0])
  };
}

export function getUpcomingTurnLabel(state: SessionState): string {
  const participant = state.participants[state.turnIndex];
  return getParticipantDisplayLabel(state.participantMode, participant);
}

export function getCurrentActorLabel(state: SessionState): string {
  if (state.gameId === "five-guesses") {
    return getFiveGuessesCurrentActorLabel(state);
  }

  if (
    state.gameId === "scripture-puzzles" ||
    state.gameId === "bible-timeline" ||
    state.gameId === "verse-scramble" ||
    state.gameId === "bible-connections" ||
    state.gameId === "before-or-after" ||
    state.gameId === "reference-rush" ||
    state.gameId === "chapter-finder" ||
    state.gameId === "who-said-it" ||
    state.gameId === "bible-books-relay" ||
    state.gameId === "missing-word" ||
    state.gameId === "odd-one-out" ||
    state.gameId === "genealogy" ||
    state.gameId === "prophecy-match" ||
    state.gameId === "parable-match" ||
    state.gameId === "messiah-prophecy" ||
    state.gameId === "prophecy-clue-ladder" ||
    state.gameId === "fulfillment-finder" ||
    state.gameId === "prophecy-categories" ||
    state.gameId === "complete-the-verse" ||
    state.gameId === "wisdom-match" ||
    state.gameId === "psalm-theme" ||
    state.gameId === "proverb-categories" ||
    state.gameId === "psalm-reference-finder" ||
    state.gameId === "two-truths-and-a-lie" ||
    state.gameId === "relay-verse-build" ||
    state.gameId === "verse-typing-race" ||
    state.gameId === "word-ladder" ||
    state.gameId === "bible-anagrams" ||
    state.gameId === "bible-cryptogram"
  ) {
    const participant = state.participants[state.turnIndex];
    return getParticipantDisplayLabel(state.participantMode, participant);
  }

  const prompt = state.currentPrompt;

  if (!prompt) {
    return getUpcomingTurnLabel(state);
  }

  if (prompt.phase === "primary") {
    const participant = state.participants[prompt.primaryParticipantIndex];
    return getParticipantDisplayLabel(state.participantMode, participant, prompt.primaryMemberName);
  }

  if (prompt.phase === "steal") {
    const participantIndex = prompt.stealOrder[prompt.stealCursor];
    const participant = state.participants[participantIndex];
    return getParticipantDisplayLabel(state.participantMode, participant);
  }

  return getUpcomingTurnLabel(state);
}

export function getBoardProgressLabel(state: FiveGuessesState | InitialsState): string {
  return `${state.resolvedPrompts} of ${state.totalPrompts} resolved`;
}

export function selectBoardCard(state: SessionState, cardId: string): ActionResult {
  if (state.gameId !== "five-guesses" && state.gameId !== "initials") {
    throw new Error("This game does not use a board picker.");
  }

  if (state.gameId === "five-guesses") {
    return selectFiveGuessesBoardCard(state, cardId);
  }

  if (state.currentPrompt) {
    throw new Error("Finish the active prompt before picking another card.");
  }

  const nextState = structuredClone(state);
  const found = findInitialsCard(nextState, cardId);

  if (!found || found.card.status !== "available") {
    throw new Error("Choose an available tile.");
  }

  found.card.status = "active";
  nextState.currentPrompt = {
    kind: "initials",
    cardId: found.card.id,
    round: found.card.round,
    revealedClues: 0,
    phase: "primary",
    primaryParticipantIndex: nextState.turnIndex,
    primaryTurnConsumed: false,
    stealOrder: buildStealOrder(nextState.participants.length, nextState.turnIndex),
    stealCursor: 0,
    primaryMemberName: getCurrentMemberName(nextState.participants[nextState.turnIndex]),
    resolvedMessage: null
  };

  const actor = getCurrentActorLabel(nextState);

  return addActivity(
    nextState,
    "info",
    `${actor} opened tile ${found.card.pickNumber}. Initials are now visible.`
  );
}

export function submitBoardGuess(state: SessionState, guess: string): ActionResult {
  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter a guess before submitting.");
  }

  if (state.gameId !== "five-guesses" && state.gameId !== "initials") {
    throw new Error("Use the active game controls for this game.");
  }

  if (state.gameId === "five-guesses") {
    return submitFiveGuessesBoardGuess(state, trimmedGuess);
  }

  if (!state.currentPrompt) {
    throw new Error("Pick a board card before guessing.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the board before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt!;
  const actorIndex =
    prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);

  if (isCorrectGuess(prompt.round.answer, prompt.round.aliases, trimmedGuess)) {
    const points = scoreInitials(prompt.revealedClues);

    stats.totalScore += points;
    stats.roundWins += 1;
    stats.initialsOnlySolves += prompt.phase === "primary" && prompt.revealedClues === 0 ? 1 : 0;

    if (prompt.phase === "steal") {
      consumeTurn(nextState.participants, actorIndex);
    }

    return finalizeBoardPrompt(nextState, {
      solved: true,
      winnerParticipantIndex: actorIndex,
      message: `${actorLabel} solved ${prompt.round.answer} for ${points} point${points === 1 ? "" : "s"}.`
    });
  }

  stats.incorrectAttempts += 1;

  if (prompt.phase === "primary") {
    if (prompt.revealedClues < INITIALS_CLUES_PER_CARD) {
      prompt.revealedClues += 1;

      return addActivity(
        nextState,
        "warning",
        `${actorLabel} missed. Clue ${prompt.revealedClues} is now visible.`
      );
    }

    if (!prompt.primaryTurnConsumed) {
      consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
      prompt.primaryTurnConsumed = true;
    }

    if (prompt.stealOrder.length === 0) {
      return finalizeBoardPrompt(nextState, {
        solved: false,
        message: `No stealers remained. ${prompt.round.answer} closes unsolved.`
      });
    }

    prompt.phase = "steal";
    prompt.stealCursor = 0;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} used all six clues. ${getCurrentActorLabel(nextState)} is up first for the steal.`
    );
  }

  consumeTurn(nextState.participants, actorIndex);

  if (prompt.stealCursor < prompt.stealOrder.length - 1) {
    prompt.stealCursor += 1;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} missed the steal. ${getCurrentActorLabel(nextState)} is next.`
    );
  }

  return finalizeBoardPrompt(nextState, {
    solved: false,
    message: `All steal attempts missed. ${prompt.round.answer} closes unsolved.`
  });
}

export function passBoardGuess(state: SessionState): ActionResult {
  if (state.gameId !== "five-guesses" && state.gameId !== "initials") {
    throw new Error("Use the active game controls for this game.");
  }

  if (state.gameId === "five-guesses") {
    return passFiveGuessesBoardGuess(state);
  }

  if (!state.currentPrompt) {
    throw new Error("Pick a board card before passing.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the board before passing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt!;
  const actorIndex =
    prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);

  stats.incorrectAttempts += 1;

  if (prompt.phase === "primary") {
    if (prompt.revealedClues < INITIALS_CLUES_PER_CARD) {
      prompt.revealedClues += 1;

      return addActivity(
        nextState,
        "warning",
        `${actorLabel} passed. Clue ${prompt.revealedClues} is now visible.`
      );
    }

    if (!prompt.primaryTurnConsumed) {
      consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
      prompt.primaryTurnConsumed = true;
    }

    if (prompt.stealOrder.length === 0) {
      return finalizeBoardPrompt(nextState, {
        solved: false,
        message: `${actorLabel} passed after all six clues. ${prompt.round.answer} closes unsolved.`
      });
    }

    prompt.phase = "steal";
    prompt.stealCursor = 0;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} passed after all six clues. ${getCurrentActorLabel(nextState)} is up first for the steal.`
    );
  }

  consumeTurn(nextState.participants, actorIndex);

  if (prompt.stealCursor < prompt.stealOrder.length - 1) {
    prompt.stealCursor += 1;

    return addActivity(nextState, "warning", `${actorLabel} passed the steal. ${getCurrentActorLabel(nextState)} is next.`);
  }

  return finalizeBoardPrompt(nextState, {
    solved: false,
    message: `All steal attempts passed or missed. ${prompt.round.answer} closes unsolved.`
  });
}

export function continueGame(state: SessionState): ActionResult {
  const nextState = structuredClone(state);

  if (nextState.gameId === "scripture-puzzles") {
    if (!nextState.currentPrompt.isComplete) {
      throw new Error("Finish the scripture round before continuing.");
    }

    nextState.resolvedPrompts += 1;

    if (nextState.roundIndex + 1 >= nextState.rounds.length) {
      nextState.status = "completed";

      return addActivity(nextState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
    }

    nextState.roundIndex += 1;
    nextState.currentPrompt = createScripturePrompt(nextState.rounds[nextState.roundIndex]);

    return addActivity(nextState, "info", `Round ${nextState.roundIndex + 1} is ready.`);
  }

  if (nextState.gameId === "bible-cryptogram") {
    if (!nextState.currentPrompt.isComplete) {
      throw new Error("Finish the cryptogram round before continuing.");
    }

    nextState.resolvedPrompts += 1;

    if (nextState.roundIndex + 1 >= nextState.rounds.length) {
      nextState.status = "completed";

      return addActivity(nextState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
    }

    nextState.roundIndex += 1;
    nextState.currentPrompt = createBibleCryptogramPrompt(nextState.rounds[nextState.roundIndex]);

    return addActivity(nextState, "info", `Round ${nextState.roundIndex + 1} is ready.`);
  }

  if (nextState.gameId === "bible-timeline") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the timeline round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createTimelinePrompt(round as BibleTimelineRound));
  }

  if (nextState.gameId === "verse-scramble") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the verse scramble before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createVerseScramblePrompt(round as VerseScrambleRound));
  }

  if (nextState.gameId === "bible-connections") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the connections board before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createConnectionsPrompt(round as BibleConnectionsRound));
  }

  if (nextState.gameId === "name-that-book") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the book round before continuing.");
    }

    return advanceLinearRound(nextState, (round) =>
      createNameThatBookPrompt(round as NameThatBookRound, nextState as NameThatBookState)
    );
  }

  if (nextState.gameId === "before-or-after") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the before-or-after round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createBeforeOrAfterPrompt(round as BeforeOrAfterRound));
  }

  if (nextState.gameId === "reference-rush") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the reference round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createReferenceRushPrompt(round as ReferenceRushRound));
  }

  if (nextState.gameId === "chapter-finder") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the chapter round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createChapterFinderPrompt(round as ChapterFinderRound));
  }

  if (nextState.gameId === "who-said-it") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the speaker round before continuing.");
    }

    return advanceLinearRound(nextState, (round) =>
      createWhoSaidItPrompt(round as WhoSaidItRound, nextState.rounds.map((entry) => entry.speaker))
    );
  }

  if (nextState.gameId === "bible-books-relay") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the book relay before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createBibleBooksRelayPrompt(round as BibleBooksRelayRound));
  }

  if (nextState.gameId === "missing-word") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the missing-word round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createMissingWordPrompt(round as MissingWordRound));
  }

  if (nextState.gameId === "prophecy-match") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Finish the prophecy match board before continuing.");
    }

    nextState.status = "completed";
    return addActivity(nextState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
  }

  if (nextState.gameId === "parable-match") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Finish the parable match board before continuing.");
    }

    nextState.status = "completed";
    return addActivity(nextState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
  }

  if (nextState.gameId === "messiah-prophecy") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the prophecy round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createMessiahProphecyPrompt(round as MessiahProphecyRound));
  }

  if (nextState.gameId === "prophecy-clue-ladder") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the clue ladder round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createProphecyClueLadderPrompt(round as ProphecyClueLadderRound));
  }

  if (nextState.gameId === "fulfillment-finder") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the fulfillment round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createFulfillmentFinderPrompt(round as FulfillmentFinderRound));
  }

  if (nextState.gameId === "prophecy-categories") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the prophecy categories board before continuing.");
    }

    if (nextState.resolvedPrompts >= nextState.totalPrompts) {
      nextState.status = "completed";
      return addActivity(nextState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
    }

    return advanceLinearRound(nextState, (round) => createProphecyCategoriesPrompt(round as ProphecyCategoriesRound));
  }

  if (nextState.gameId === "complete-the-verse") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the verse round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createCompleteVersePrompt(round as CompleteVerseRound));
  }

  if (nextState.gameId === "wisdom-match") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the wisdom round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createWisdomMatchPrompt(round as WisdomMatchRound));
  }

  if (nextState.gameId === "psalm-theme") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the Psalm theme round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createPsalmThemePrompt(round as PsalmThemeRound));
  }

  if (nextState.gameId === "proverb-categories") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the proverb categories board before continuing.");
    }

    if (nextState.resolvedPrompts >= nextState.totalPrompts) {
      nextState.status = "completed";
      return addActivity(nextState, "info", `${nextState.sessionTitle} is complete. Final standings are ready.`);
    }

    return advanceLinearRound(nextState, (round) => createProverbCategoriesPrompt(round as ProverbCategoriesRound));
  }

  if (nextState.gameId === "psalm-reference-finder") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the Psalm reference round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createPsalmReferenceFinderPrompt(round as PsalmReferenceFinderRound));
  }

  if (nextState.gameId === "two-truths-and-a-lie") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createTwoTruthsAndALiePrompt(round as TwoTruthsAndALieRound));
  }

  if (nextState.gameId === "relay-verse-build") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current verse before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createRelayVerseBuildPrompt(round as RelayVerseBuildRound));
  }


  if (nextState.gameId === "verse-typing-race") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createVerseTypingRacePrompt(round as VerseTypingRaceRound));
  }

  if (nextState.gameId === "word-ladder") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current ladder before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createWordLadderPrompt(round as WordLadderRound, nextState.turnIndex));
  }

  if (nextState.gameId === "odd-one-out") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current odd-one-out round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createOddOneOutPrompt(round as OddOneOutRound));
  }

  if (nextState.gameId === "genealogy") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current genealogy before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createGenealogyPrompt(round as GenealogyRound, nextState.turnIndex));
  }

  if (nextState.gameId === "bible-anagrams") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the current anagram before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createBibleAnagramPrompt(round as BibleAnagramRound));
  }

  if (!nextState.currentPrompt || nextState.currentPrompt.phase !== "resolved") {
    throw new Error("Resolve the active board prompt before continuing.");
  }

  nextState.currentPrompt = null;

  if (nextState.status === "completed") {
    return addActivity(nextState, "info", `${nextState.displayName} board is complete. Final standings are ready.`);
  }

  return addActivity(nextState, "info", `${getUpcomingTurnLabel(nextState)} is up. Pick the next card.`);
}

export function submitScriptureLetterGuess(
  state: SessionState,
  letterGuess: string
): ActionResult {
  if (state.gameId !== "scripture-puzzles") {
    throw new Error("Letter guesses are only available in Verse Reveal.");
  }

  if (state.currentPrompt.isComplete) {
    throw new Error("Continue to the next round before guessing again.");
  }

  if (state.currentPrompt.phase !== "letter") {
    throw new Error("Solve or pass before guessing another letter.");
  }

  const normalizedLetter = letterGuess.trim().toLowerCase();

  if (!/^[a-z]$/.test(normalizedLetter)) {
    throw new Error("Enter exactly one letter from A to Z.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const text = getScriptureText(nextState.currentPrompt.round);

  if (nextState.currentPrompt.attemptedLetters.includes(normalizedLetter)) {
    nextState.currentPrompt.phase = "solve";

    return addActivity(
      nextState,
      "info",
      `${actorLabel} repeated "${normalizedLetter.toUpperCase()}". No new spaces were revealed. Solve or pass.`
    );
  }

  nextState.currentPrompt.attemptedLetters.push(normalizedLetter);

  const matches = countLetterOccurrences(text, normalizedLetter);

  if (matches === 0) {
    stats.incorrectAttempts += 1;
    nextState.currentPrompt.phase = "solve";

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} guessed "${normalizedLetter.toUpperCase()}". That letter is not in the verse. Solve or pass.`
    );
  }

  const points = scoreScriptureLetterGuess(matches);
  const remainingLetters = countRemainingLetters(text, nextState.currentPrompt.attemptedLetters);

  stats.totalScore += points;
  stats.letterRevealPoints += points;

  if (remainingLetters === 0) {
    nextState.currentPrompt.isComplete = true;
    nextState.currentPrompt.completedReason = "fully-revealed";

    return addActivity(
      nextState,
      "success",
      `${actorLabel} revealed the final ${matches} letter space${matches === 1 ? "" : "s"}. The verse is fully revealed.`
    );
  }

  nextState.currentPrompt.phase = "solve";

  return addActivity(
    nextState,
    "success",
    `${actorLabel} revealed ${matches} letter space${matches === 1 ? "" : "s"} and scored ${points} point${points === 1 ? "" : "s"}. Solve or pass.`
  );
}

export function submitScriptureSolve(
  state: SessionState,
  solutionGuess: string
): ActionResult {
  if (state.gameId !== "scripture-puzzles") {
    throw new Error("Full solves are only available in Verse Reveal.");
  }

  if (state.currentPrompt.isComplete) {
    throw new Error("Continue to the next round before solving again.");
  }

  if (state.currentPrompt.phase !== "solve") {
    throw new Error("Guess a letter before attempting to solve the verse.");
  }

  const trimmedGuess = solutionGuess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter the verse text before submitting a solve.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const text = getScriptureText(nextState.currentPrompt.round);
  const aliases = nextState.currentPrompt.round.solutionAliases ?? [];

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (!isCorrectGuess(text, aliases, trimmedGuess)) {
    stats.incorrectAttempts += 1;
    nextState.currentPrompt.phase = "letter";

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} attempted a full solve, but the verse remains open.`
    );
  }

  const remainingLetters = countRemainingLetters(text, nextState.currentPrompt.attemptedLetters);
  const points = scoreScriptureSolve(remainingLetters);

  stats.totalScore += points;
  stats.roundWins += 1;
  stats.correctFullSolves += 1;
  stats.hiddenLetterSolveBonus += remainingLetters;
  nextState.currentPrompt.isComplete = true;
  nextState.currentPrompt.winnerParticipantId = actor.id;
  nextState.currentPrompt.completedReason = "solved";

  return addActivity(
    nextState,
    "success",
    `${actorLabel} solved the full scripture for ${points} points, including ${remainingLetters} hidden-letter bonus point${remainingLetters === 1 ? "" : "s"}.`
  );
}

export function passScriptureTurn(state: SessionState): ActionResult {
  if (state.gameId !== "scripture-puzzles") {
    throw new Error("Scripture pass is only available in Verse Reveal.");
  }

  if (state.currentPrompt.isComplete) {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.phase = "letter";

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

// True when `realLetter` is what `cipherLetter` actually decodes to per the round's
// cipher map — i.e. the mapping the player is trying to reconstruct, not just whether the
// letter appears in the puzzle somewhere.
function isCorrectCipherGuess(cipherMap: Record<string, string>, cipherLetter: string, realLetter: string): boolean {
  return cipherMap[realLetter] === cipherLetter;
}

export function submitBibleCryptogramLetterGuess(state: SessionState, cipherLetter: string, realLetterGuess: string): ActionResult {
  if (state.gameId !== "bible-cryptogram") {
    throw new Error("Letter guesses are only available in Bible Cryptogram.");
  }

  if (state.currentPrompt.isComplete) {
    throw new Error("Continue to the next round before guessing again.");
  }

  const normalizedCipherLetter = cipherLetter.trim().toLowerCase();
  const normalizedGuess = realLetterGuess.trim().toLowerCase();

  if (!/^[a-z]$/.test(normalizedCipherLetter) || !/^[a-z]$/.test(normalizedGuess)) {
    throw new Error("Enter exactly one letter from A to Z.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const prompt = nextState.currentPrompt;
  const cipherMap = prompt.cipherMap;

  const previousGuessForLetter = prompt.cipherGuesses[normalizedCipherLetter];

  if (previousGuessForLetter === normalizedGuess) {
    return addActivity(nextState, "info", `${actorLabel} entered the same guess again. Nothing changed.`);
  }

  // Like a real paper cryptogram, one real letter can only stand for one cipher letter at
  // a time — reusing a real letter that's already assigned elsewhere would make the
  // solve-so-far board ambiguous, so it's rejected instead of silently overwriting the
  // other box. The player is still free to fix their own earlier guess for this cipher
  // letter by typing over it.
  const conflictingCipherLetter = Object.entries(prompt.cipherGuesses).find(
    ([existingCipherLetter, existingGuess]) => existingGuess === normalizedGuess && existingCipherLetter !== normalizedCipherLetter
  )?.[0];

  if (conflictingCipherLetter) {
    throw new Error(
      `"${normalizedGuess.toUpperCase()}" is already your guess for cipher letter "${conflictingCipherLetter.toUpperCase()}". Clear that guess first if you want to move it here.`
    );
  }

  const wasCorrectBefore = previousGuessForLetter != null && isCorrectCipherGuess(cipherMap, normalizedCipherLetter, previousGuessForLetter);
  const isCorrectNow = isCorrectCipherGuess(cipherMap, normalizedCipherLetter, normalizedGuess);

  prompt.cipherGuesses[normalizedCipherLetter] = normalizedGuess;

  if (!isCorrectNow) {
    stats.incorrectAttempts += 1;

    return addActivity(
      nextState,
      "warning",
      `${actorLabel} guessed "${normalizedGuess.toUpperCase()}" for cipher letter "${normalizedCipherLetter.toUpperCase()}". That's not right.`
    );
  }

  // Only score the first time this cipher letter's guess becomes correct, so editing a
  // guess back and forth can't farm points.
  if (wasCorrectBefore) {
    return addActivity(nextState, "info", `${actorLabel} re-confirmed cipher letter "${normalizedCipherLetter.toUpperCase()}".`);
  }

  // The guess is correct here, so counting occurrences of the real letter in the plaintext
  // is the same as counting occurrences of the cipher letter in the puzzle text.
  const matches = countLetterOccurrences(prompt.round.verseText, normalizedGuess);
  const points = scoreScriptureLetterGuess(matches);

  stats.totalScore += points;
  stats.letterRevealPoints += points;

  const remainingLetters = getBibleCryptogramRemainingLetters(nextState as BibleCryptogramState);

  if (remainingLetters === 0) {
    nextState.currentPrompt.isComplete = true;
    nextState.currentPrompt.completedReason = "fully-revealed";

    return addActivity(
      nextState,
      "success",
      `${actorLabel} correctly mapped the final cipher letter. The puzzle is fully revealed.`
    );
  }

  return addActivity(
    nextState,
    "success",
    `${actorLabel} correctly mapped cipher letter "${normalizedCipherLetter.toUpperCase()}" to "${normalizedGuess.toUpperCase()}" and scored ${points} point${points === 1 ? "" : "s"}.`
  );
}

export function submitBibleCryptogramSolve(state: SessionState, solutionGuess: string): ActionResult {
  if (state.gameId !== "bible-cryptogram") {
    throw new Error("Full solves are only available in Bible Cryptogram.");
  }

  if (state.currentPrompt.isComplete) {
    throw new Error("Continue to the next round before solving again.");
  }

  const trimmedGuess = solutionGuess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter the solved text before submitting a solve.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const text = nextState.currentPrompt.round.verseText;

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (normalizeText(trimmedGuess) !== normalizeText(text)) {
    stats.incorrectAttempts += 1;

    return addActivity(nextState, "warning", `${actorLabel} attempted a full solve, but the puzzle remains open. ${getCurrentActorLabel(nextState)} is up.`);
  }

  const remainingLetters = getBibleCryptogramRemainingLetters(nextState as BibleCryptogramState);
  const points = scoreScriptureSolve(remainingLetters);

  stats.totalScore += points;
  stats.roundWins += 1;
  stats.correctFullSolves += 1;
  stats.hiddenLetterSolveBonus += remainingLetters;
  nextState.currentPrompt.isComplete = true;
  nextState.currentPrompt.winnerParticipantId = actor.id;
  nextState.currentPrompt.completedReason = "solved";

  return addActivity(
    nextState,
    "success",
    `${actorLabel} solved the full puzzle for ${points} points, including ${remainingLetters} hidden-letter bonus point${remainingLetters === 1 ? "" : "s"}.`
  );
}

export function passBibleCryptogramTurn(state: SessionState): ActionResult {
  if (state.gameId !== "bible-cryptogram") {
    throw new Error("Passing is only available in Bible Cryptogram.");
  }

  if (state.currentPrompt.isComplete) {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

function addAttemptedParticipant(attemptedParticipantIds: string[], participantId: string): string[] {
  return Array.from(new Set([...attemptedParticipantIds, participantId]));
}

function allParticipantsAttempted(state: SessionBase, attemptedParticipantIds: string[]): boolean {
  return state.participants.every((participant) => attemptedParticipantIds.includes(participant.id));
}

function isSoloSession(state: SessionBase): boolean {
  return state.participants.length === 1;
}

export function selectProphecyMatchCard(
  state: SessionState,
  cardType: "prophecy" | "fulfillment",
  cardId: string
): ActionResult {
  if (state.gameId !== "prophecy-match") {
    throw new Error("Prophecy Match cards are only available in Prophecy Match Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the resolved match board.");
  }

  const nextState = structuredClone(state);
  const cards = cardType === "prophecy" ? nextState.currentPrompt.prophecyCards : nextState.currentPrompt.fulfillmentCards;
  const card = cards.find((entry) => entry.id === cardId);

  if (!card || card.status === "matched") {
    throw new Error("Choose an available prophecy match card.");
  }

  cards.forEach((entry) => {
    if (entry.status === "selected") {
      entry.status = "available";
    }
  });
  card.status = "selected";

  if (cardType === "prophecy") {
    nextState.currentPrompt.selectedProphecyId = card.id;
  } else {
    nextState.currentPrompt.selectedFulfillmentId = card.id;
  }

  return addActivity(nextState, "info", `${card.reference} selected.`);
}

export function submitProphecyMatch(state: SessionState): ActionResult {
  if (state.gameId !== "prophecy-match") {
    throw new Error("Prophecy Match submit is only available in Prophecy Match Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the resolved match board.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const prophecy = prompt.prophecyCards.find((card) => card.id === prompt.selectedProphecyId);
  const fulfillment = prompt.fulfillmentCards.find((card) => card.id === prompt.selectedFulfillmentId);

  if (!prophecy || !fulfillment) {
    throw new Error("Select one prophecy card and one fulfillment card.");
  }

  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (prophecy.answerKey === fulfillment.answerKey) {
    const wrongCount = prompt.wrongAttemptsByPairId[prophecy.pairId] ?? 0;
    const points = scoreProphecyRetry(wrongCount);
    prophecy.status = "matched";
    fulfillment.status = "matched";
    prompt.matchedPairIds = Array.from(new Set([...prompt.matchedPairIds, prophecy.pairId]));
    prompt.selectedProphecyId = null;
    prompt.selectedFulfillmentId = null;
    prompt.lastAttempt = { prophecyId: prophecy.id, fulfillmentId: fulfillment.id, wasCorrect: true };
    nextState.resolvedPrompts = prompt.matchedPairIds.length;
    stats.totalScore += points;
    stats.roundWins += 1;

    if (prompt.matchedPairIds.length >= nextState.totalPrompts) {
      prompt.phase = "resolved";
      prompt.resolvedMessage = `${actorLabel} completed the final prophecy match.`;
    }

    return addActivity(nextState, "success", `${actorLabel} matched ${prophecy.reference} with ${fulfillment.reference} for ${points} points.`);
  }

  stats.incorrectAttempts += 1;
  prompt.wrongAttemptsByPairId[prophecy.pairId] = (prompt.wrongAttemptsByPairId[prophecy.pairId] ?? 0) + 1;
  prophecy.status = "available";
  fulfillment.status = "available";
  prompt.selectedProphecyId = null;
  prompt.selectedFulfillmentId = null;
  prompt.lastAttempt = { prophecyId: prophecy.id, fulfillmentId: fulfillment.id, wasCorrect: false };

  return addActivity(nextState, "warning", `${actorLabel} missed the match. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passProphecyMatch(state: SessionState): ActionResult {
  if (state.gameId !== "prophecy-match") {
    throw new Error("Prophecy Match pass is only available in Prophecy Match Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the resolved match board.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const unmatchedPairId = nextState.pairs.find((pair) => !nextState.currentPrompt.matchedPairIds.includes(pair.id))?.id;

  nextState.currentPrompt.prophecyCards.forEach((card) => {
    if (card.status === "selected") {
      card.status = "available";
    }
  });
  nextState.currentPrompt.fulfillmentCards.forEach((card) => {
    if (card.status === "selected") {
      card.status = "available";
    }
  });
  nextState.currentPrompt.selectedProphecyId = null;
  nextState.currentPrompt.selectedFulfillmentId = null;
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState) && unmatchedPairId) {
    const prophecy = nextState.currentPrompt.prophecyCards.find((card) => card.pairId === unmatchedPairId);
    const fulfillment = nextState.currentPrompt.fulfillmentCards.find((card) => card.pairId === unmatchedPairId);

    if (prophecy && fulfillment) {
      prophecy.status = "matched";
      fulfillment.status = "matched";
      nextState.currentPrompt.matchedPairIds = Array.from(
        new Set([...nextState.currentPrompt.matchedPairIds, unmatchedPairId])
      );
      nextState.currentPrompt.lastAttempt = { prophecyId: prophecy.id, fulfillmentId: fulfillment.id, wasCorrect: false };
      nextState.resolvedPrompts = nextState.currentPrompt.matchedPairIds.length;

      if (nextState.currentPrompt.matchedPairIds.length >= nextState.totalPrompts) {
        nextState.currentPrompt.phase = "resolved";
        nextState.currentPrompt.resolvedMessage = `${actorLabel} passed on the final prophecy match.`;
      }

      return addActivity(
        nextState,
        "warning",
        `${actorLabel} passed. ${prophecy.reference} matches ${fulfillment.reference}.`
      );
    }
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function selectParableMatchCard(
  state: SessionState,
  cardType: "parable" | "lesson",
  cardId: string
): ActionResult {
  if (state.gameId !== "parable-match") {
    throw new Error("Parable Match cards are only available in Parable Match.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the resolved match board.");
  }

  const nextState = structuredClone(state);
  const cards = cardType === "parable" ? nextState.currentPrompt.parableCards : nextState.currentPrompt.lessonCards;
  const card = cards.find((entry) => entry.id === cardId);

  if (!card || card.status === "matched") {
    throw new Error("Choose an available parable match card.");
  }

  cards.forEach((entry) => {
    if (entry.status === "selected") {
      entry.status = "available";
    }
  });
  card.status = "selected";

  if (cardType === "parable") {
    nextState.currentPrompt.selectedParableId = card.id;
  } else {
    nextState.currentPrompt.selectedLessonId = card.id;
  }

  return addActivity(nextState, "info", `${card.reference} selected.`);
}

export function submitParableMatch(state: SessionState): ActionResult {
  if (state.gameId !== "parable-match") {
    throw new Error("Parable Match submit is only available in Parable Match.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the resolved match board.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const parable = prompt.parableCards.find((card) => card.id === prompt.selectedParableId);
  const lesson = prompt.lessonCards.find((card) => card.id === prompt.selectedLessonId);

  if (!parable || !lesson) {
    throw new Error("Select one parable card and one lesson card.");
  }

  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (parable.answerKey === lesson.answerKey) {
    const wrongCount = prompt.wrongAttemptsByPairId[parable.pairId] ?? 0;
    const points = scoreProphecyRetry(wrongCount);
    parable.status = "matched";
    lesson.status = "matched";
    prompt.matchedPairIds = Array.from(new Set([...prompt.matchedPairIds, parable.pairId]));
    prompt.selectedParableId = null;
    prompt.selectedLessonId = null;
    prompt.lastAttempt = { parableId: parable.id, lessonId: lesson.id, wasCorrect: true };
    nextState.resolvedPrompts = prompt.matchedPairIds.length;
    stats.totalScore += points;
    stats.roundWins += 1;

    if (prompt.matchedPairIds.length >= nextState.totalPrompts) {
      prompt.phase = "resolved";
      prompt.resolvedMessage = `${actorLabel} completed the final parable match.`;
    }

    return addActivity(nextState, "success", `${actorLabel} matched ${parable.reference} with ${lesson.summary} for ${points} points.`);
  }

  stats.incorrectAttempts += 1;
  prompt.wrongAttemptsByPairId[parable.pairId] = (prompt.wrongAttemptsByPairId[parable.pairId] ?? 0) + 1;
  parable.status = "available";
  lesson.status = "available";
  prompt.selectedParableId = null;
  prompt.selectedLessonId = null;
  prompt.lastAttempt = { parableId: parable.id, lessonId: lesson.id, wasCorrect: false };

  return addActivity(nextState, "warning", `${actorLabel} missed the match. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passParableMatch(state: SessionState): ActionResult {
  if (state.gameId !== "parable-match") {
    throw new Error("Parable Match pass is only available in Parable Match.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the resolved match board.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const unmatchedPairId = nextState.pairs.find((pair) => !nextState.currentPrompt.matchedPairIds.includes(pair.id))?.id;

  nextState.currentPrompt.parableCards.forEach((card) => {
    if (card.status === "selected") {
      card.status = "available";
    }
  });
  nextState.currentPrompt.lessonCards.forEach((card) => {
    if (card.status === "selected") {
      card.status = "available";
    }
  });
  nextState.currentPrompt.selectedParableId = null;
  nextState.currentPrompt.selectedLessonId = null;
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState) && unmatchedPairId) {
    const parable = nextState.currentPrompt.parableCards.find((card) => card.pairId === unmatchedPairId);
    const lesson = nextState.currentPrompt.lessonCards.find((card) => card.pairId === unmatchedPairId);

    if (parable && lesson) {
      parable.status = "matched";
      lesson.status = "matched";
      nextState.currentPrompt.matchedPairIds = Array.from(new Set([...nextState.currentPrompt.matchedPairIds, unmatchedPairId]));
      nextState.currentPrompt.lastAttempt = { parableId: parable.id, lessonId: lesson.id, wasCorrect: false };
      nextState.resolvedPrompts = nextState.currentPrompt.matchedPairIds.length;

      if (nextState.currentPrompt.matchedPairIds.length >= nextState.totalPrompts) {
        nextState.currentPrompt.phase = "resolved";
        nextState.currentPrompt.resolvedMessage = `${actorLabel} passed on the final parable match.`;
      }

      return addActivity(nextState, "warning", `${actorLabel} passed. ${parable.reference} matches ${lesson.summary}.`);
    }
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitMessiahProphecyChoice(state: SessionState, choice: string): ActionResult {
  if (state.gameId !== "messiah-prophecy") {
    throw new Error("Messiah prophecy choices are only available in Messiah Prophecy Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedChoices.includes(choice)) {
    throw new Error("Choose an available answer.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedAnswer = choice;

  if (normalizeText(choice) === normalizeText(prompt.round.correctAnswer)) {
    const points = scoreProphecyRetry(prompt.eliminatedChoices.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} chose the fulfillment for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Prophecy solved.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedChoices = Array.from(new Set([...prompt.eliminatedChoices, choice]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passMessiahProphecy(state: SessionState): ActionResult {
  if (state.gameId !== "messiah-prophecy") {
    throw new Error("Messiah prophecy pass is only available in Messiah Prophecy Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The fulfillment was ${nextState.currentPrompt.round.correctAnswer}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Prophecy answer revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitProphecyClueGuess(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "prophecy-clue-ladder") {
    throw new Error("Prophecy clue guesses are only available in Prophecy Clue Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  if (state.currentPrompt.guessingDisabled) {
    throw new Error("Time is up. Pass to reveal the answer.");
  }

  const trimmedGuess = guess.trim();
  if (!trimmedGuess) {
    throw new Error("Enter a prophecy answer before submitting.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrectGuess(prompt.round.answer, prompt.round.acceptedAnswers, trimmedGuess)) {
    const points = scoreProphecyRetry(prompt.revealedClues - 1);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} solved the clue ladder for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Prophecy clue solved.");
  }

  stats.incorrectAttempts += 1;
  if (prompt.revealedClues < prompt.round.clues.length) {
    prompt.revealedClues += 1;
    return addActivity(nextState, "warning", `${actorLabel} missed. Clue ${prompt.revealedClues} is revealed.`);
  }

  prompt.guessingDisabled = true;
  return addActivity(nextState, "warning", `${actorLabel} missed the final clue. Only Pass remains.`);
}

export function revealProphecyClueOnTimer(state: SessionState): ActionResult {
  if (state.gameId !== "prophecy-clue-ladder") {
    throw new Error("Timer clue reveal is only available in Prophecy Clue Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before revealing another clue.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (prompt.revealedClues < prompt.round.clues.length) {
    prompt.revealedClues += 1;
    return addActivity(nextState, "warning", `Time expired for ${actorLabel}. Clue ${prompt.revealedClues} is revealed.`);
  }

  prompt.guessingDisabled = true;
  return addActivity(nextState, "warning", `Time expired on the final clue. Only Pass remains.`);
}

export function passProphecyClue(state: SessionState): ActionResult {
  if (state.gameId !== "prophecy-clue-ladder") {
    throw new Error("Prophecy clue pass is only available in Prophecy Clue Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (prompt.guessingDisabled || (isSoloSession(nextState) && prompt.revealedClues >= prompt.round.clues.length)) {
    prompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The answer was ${prompt.round.answer}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Prophecy answer revealed.");
  }

  if (isSoloSession(nextState)) {
    prompt.revealedClues += 1;
    return addActivity(nextState, "warning", `${actorLabel} passed. Clue ${prompt.revealedClues} is revealed.`);
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitFulfillmentFinderChoice(state: SessionState, reference: string): ActionResult {
  if (state.gameId !== "fulfillment-finder") {
    throw new Error("Fulfillment choices are only available in Fulfillment Finder Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedReferences.includes(reference)) {
    throw new Error("Choose an available prophecy reference.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedReference = reference;

  if (normalizeText(reference) === normalizeText(prompt.round.correctProphecyReference)) {
    const points = scoreProphecyRetry(prompt.eliminatedReferences.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} found the prophecy for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Fulfillment solved.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedReferences = Array.from(new Set([...prompt.eliminatedReferences, reference]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passFulfillmentFinder(state: SessionState): ActionResult {
  if (state.gameId !== "fulfillment-finder") {
    throw new Error("Fulfillment pass is only available in Fulfillment Finder Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(
      nextState,
      `${actorLabel} passed. The connected prophecy was ${nextState.currentPrompt.round.correctProphecyReference}.`
    );
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Fulfillment answer revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitCompleteVerseChoice(state: SessionState, choice: string): ActionResult {
  if (state.gameId !== "complete-the-verse") {
    throw new Error("Verse-ending choices are only available in Complete the Verse Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedChoices.includes(choice)) {
    throw new Error("Choose an available ending.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedChoice = choice;

  if (normalizeText(choice) === normalizeText(prompt.round.correctEnding)) {
    const points = scoreProphecyRetry(prompt.eliminatedChoices.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} completed the verse for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Verse completed.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedChoices = Array.from(new Set([...prompt.eliminatedChoices, choice]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passCompleteVerse(state: SessionState): ActionResult {
  if (state.gameId !== "complete-the-verse") {
    throw new Error("Verse-ending pass is only available in Complete the Verse Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The ending was ${nextState.currentPrompt.round.correctEnding}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Verse ending revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitOddOneOutChoice(state: SessionState, choice: string): ActionResult {
  if (state.gameId !== "odd-one-out") {
    throw new Error("Odd One Out choices are only available in Odd One Out.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedChoices.includes(choice)) {
    throw new Error("Choose an available item.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedChoice = choice;

  if (normalizeText(choice) === normalizeText(prompt.round.oddItem)) {
    const points = scoreProphecyRetry(prompt.eliminatedChoices.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} found the odd item for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Odd item found.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedChoices = Array.from(new Set([...prompt.eliminatedChoices, choice]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passOddOneOut(state: SessionState): ActionResult {
  if (state.gameId !== "odd-one-out") {
    throw new Error("Odd One Out pass is only available in Odd One Out.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The odd item was ${nextState.currentPrompt.round.oddItem}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Odd item revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitWisdomMatchChoice(state: SessionState, choice: string): ActionResult {
  if (state.gameId !== "wisdom-match") {
    throw new Error("Wisdom theme choices are only available in Wisdom Match Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedChoices.includes(choice)) {
    throw new Error("Choose an available theme.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedChoice = choice;

  if (normalizeText(choice) === normalizeText(prompt.round.correctTheme)) {
    const points = scoreProphecyRetry(prompt.eliminatedChoices.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} matched the wisdom theme for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Wisdom theme matched.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedChoices = Array.from(new Set([...prompt.eliminatedChoices, choice]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passWisdomMatch(state: SessionState): ActionResult {
  if (state.gameId !== "wisdom-match") {
    throw new Error("Wisdom pass is only available in Wisdom Match Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The theme was ${nextState.currentPrompt.round.correctTheme}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Wisdom theme revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitPsalmThemeChoice(state: SessionState, choice: string): ActionResult {
  if (state.gameId !== "psalm-theme") {
    throw new Error("Psalm theme choices are only available in Psalm Theme Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedChoices.includes(choice)) {
    throw new Error("Choose an available theme.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedChoice = choice;

  if (normalizeText(choice) === normalizeText(prompt.round.correctTheme)) {
    const points = scoreProphecyRetry(prompt.eliminatedChoices.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} identified the Psalm theme for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Psalm theme identified.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedChoices = Array.from(new Set([...prompt.eliminatedChoices, choice]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passPsalmTheme(state: SessionState): ActionResult {
  if (state.gameId !== "psalm-theme") {
    throw new Error("Psalm theme pass is only available in Psalm Theme Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The theme was ${nextState.currentPrompt.round.correctTheme}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Psalm theme revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitPsalmReferenceFinderChoice(state: SessionState, reference: string): ActionResult {
  if (state.gameId !== "psalm-reference-finder") {
    throw new Error("Psalm reference choices are only available in Psalm Reference Finder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedReferences.includes(reference)) {
    throw new Error("Choose an available Psalm reference.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedReference = reference;

  if (normalizeText(reference) === normalizeText(prompt.round.correctReference)) {
    const points = scoreProphecyRetry(prompt.eliminatedReferences.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} found the Psalm reference for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Psalm reference found.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedReferences = Array.from(new Set([...prompt.eliminatedReferences, reference]));
  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passPsalmReferenceFinder(state: SessionState): ActionResult {
  if (state.gameId !== "psalm-reference-finder") {
    throw new Error("Psalm reference pass is only available in Psalm Reference Finder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The reference was ${nextState.currentPrompt.round.correctReference}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Psalm reference revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitRelayWord(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "relay-verse-build") {
    throw new Error("Relay word guesses are only available in Relay Verse Build.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next verse before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);
  const targetWord = prompt.words[prompt.revealedCount];

  if (normalizeText(guess) === normalizeText(targetWord)) {
    prompt.revealedCount += 1;
    prompt.wrongAttemptsThisWord = 0;
    stats.roundWins += 1;
    consumeTurn(nextState.participants, actorIndex);
    nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

    if (prompt.revealedCount >= prompt.words.length) {
      const points = scoreProphecyRetry(prompt.totalWrongAttempts);
      stats.totalScore += points;
      prompt.wasCorrect = true;
      resolveRoundState(nextState, `${actorLabel} completed the verse for ${points} points.`);
      return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Verse completed.");
    }

    return addActivity(nextState, "success", `${actorLabel} got the word right. ${getCurrentActorLabel(nextState)} is up.`);
  }

  stats.incorrectAttempts += 1;
  prompt.wrongAttemptsThisWord += 1;
  prompt.totalWrongAttempts += 1;
  return addActivity(nextState, "warning", `${actorLabel} missed that word. Try again.`);
}

export function passRelayWord(state: SessionState): ActionResult {
  if (state.gameId !== "relay-verse-build") {
    throw new Error("Skip Word is only available in Relay Verse Build.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next verse before skipping again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const skippedWord = prompt.words[prompt.revealedCount];
  prompt.revealedCount += 1;
  prompt.wrongAttemptsThisWord = 0;
  prompt.totalWrongAttempts += 1;
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (prompt.revealedCount >= prompt.words.length) {
    prompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} skipped "${skippedWord}". The verse is now revealed.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Verse revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} skipped "${skippedWord}". ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitVerseTypingResult(
  state: SessionState,
  result: { typedText: string; elapsedMs: number }
): ActionResult {
  if (state.gameId !== "verse-typing-race") {
    throw new Error("Verse typing results are only available in Verse Typing Race.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before submitting again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorId = nextState.participants[actorIndex]?.id ?? "";
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);
  const verseText = prompt.round.verseText;
  const typedText = result.typedText;
  const elapsedMinutes = Math.max(result.elapsedMs, 1) / 60000;

  let correctChars = 0;
  for (let index = 0; index < typedText.length; index += 1) {
    if (typedText[index] === verseText[index]) {
      correctChars += 1;
    }
  }

  const totalTypedChars = typedText.length;
  const accuracy = totalTypedChars > 0 ? correctChars / totalTypedChars : 0;
  const wpm = correctChars / 5 / elapsedMinutes;
  const points = scoreVerseTypingRace(wpm, accuracy);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  stats.totalScore += points;
  prompt.lastResult = { participantId: actorId, wpm, accuracy };

  if (accuracy >= 0.9) {
    stats.roundWins += 1;
    prompt.wasCorrect = true;
  } else {
    stats.incorrectAttempts += 1;
    prompt.wasCorrect = false;
  }

  prompt.attemptedParticipantIds = addAttemptedParticipant(prompt.attemptedParticipantIds, actorId);

  if (allParticipantsAttempted(nextState, prompt.attemptedParticipantIds)) {
    resolveRoundState(
      nextState,
      `${actorLabel} typed at ${Math.round(wpm)} WPM with ${Math.round(accuracy * 100)}% accuracy for ${points} points.`
    );
    return addActivity(nextState, accuracy >= 0.9 ? "success" : "warning", nextState.currentPrompt.resolvedMessage ?? "Typing result recorded.");
  }

  return addActivity(
    nextState,
    accuracy >= 0.9 ? "success" : "warning",
    `${actorLabel} typed at ${Math.round(wpm)} WPM with ${Math.round(accuracy * 100)}% accuracy. ${getCurrentActorLabel(nextState)} is up.`
  );
}

function hammingDistanceOne(a: string, b: string): boolean {
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

export function submitWordLadderStep(state: SessionState, guess: string, dictionary: ReadonlySet<string>): ActionResult {
  if (state.gameId !== "word-ladder") {
    throw new Error("Word Ladder guesses are only available in Word Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next ladder before guessing again.");
  }

  const normalizedGuess = guess.trim().toLowerCase();

  if (!normalizedGuess) {
    throw new Error("Enter a word before submitting.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const lastWord = prompt.chain[prompt.chain.length - 1];

  if (prompt.chain.includes(normalizedGuess)) {
    throw new Error("That word is already in the chain.");
  }

  if (normalizedGuess.length !== lastWord.length) {
    throw new Error(`Word must be ${lastWord.length} letters long.`);
  }

  const isValidStep = hammingDistanceOne(normalizedGuess, lastWord) && dictionary.has(normalizedGuess);

  if (isValidStep) {
    prompt.chain.push(normalizedGuess);

    if (normalizedGuess === prompt.round.endWord) {
      const stats = getParticipantStats(nextState, actorIndex);
      const stepsTaken = prompt.chain.length - 1;
      const points = scoreWordLadder(stepsTaken, prompt.round.minSteps);
      stats.totalScore += points;
      stats.roundWins += 1;
      consumeTurn(nextState.participants, actorIndex);
      prompt.wasCorrect = true;
      resolveRoundState(nextState, `${actorLabel} completed the ladder in ${stepsTaken} steps for ${points} points.`);
      return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Ladder completed.");
    }

    const nextStats = getParticipantStats(nextState, actorIndex);
    nextStats.wordLadderStepsCompleted += 1;
    return addActivity(nextState, "success", `${actorLabel} added "${normalizedGuess}".`);
  }

  // The timer now covers a single guess, not the whole ladder, so a wrong guess costs the
  // turn just like an explicit Pass or a timeout: it hands the still-live ladder to the next
  // participant to steal, rather than letting the same player keep guessing indefinitely.
  const stats = getParticipantStats(nextState, actorIndex);
  stats.incorrectAttempts += 1;
  return advanceWordLadderTurn(
    nextState,
    `${actorLabel} tried "${normalizedGuess}" — not a valid next word.`,
    `${actorLabel} tried "${normalizedGuess}" — not a valid next word. One valid path was ${prompt.round.revealPath.join(" → ")}.`
  );
}

export function removeLastWordLadderRung(state: SessionState): ActionResult {
  if (state.gameId !== "word-ladder") {
    throw new Error("Ladder rungs can only be removed in Word Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next ladder before editing it.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;

  if (prompt.chain.length <= 1) {
    throw new Error("The starting word can't be removed.");
  }

  const removedWord = prompt.chain.pop();
  return addActivity(nextState, "info", `Removed "${removedWord}" from the ladder.`);
}

export function passWordLadderTurn(state: SessionState): ActionResult {
  if (state.gameId !== "word-ladder") {
    throw new Error("Passing is only available in Word Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next ladder before passing.");
  }

  const nextState = structuredClone(state);
  const actorLabel = getCurrentActorLabel(nextState);

  return advanceWordLadderTurn(
    nextState,
    `${actorLabel} passed.`,
    `Nobody solved the ladder. One valid path was ${nextState.currentPrompt.round.revealPath.join(" → ")}.`,
    "info"
  );
}

function advanceWordLadderTurn(
  nextState: WordLadderState,
  attemptMessage: string,
  resolvedMessage: string,
  activeTone: ActivityTone = "warning"
): ActionResult {
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (nextState.turnIndex === prompt.startTurnIndex || nextState.participants.length <= 1) {
    // Every participant has now had a chance at this ladder (or there's only one to begin
    // with), so the round ends and the path is revealed rather than looping forever.
    prompt.wasCorrect = false;
    resolveRoundState(nextState, resolvedMessage);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Ladder revealed.");
  }

  return addActivity(nextState, activeTone, `${attemptMessage} ${getCurrentActorLabel(nextState)} can steal.`);
}

export function resolveWordLadderOnTimer(state: SessionState): ActionResult {
  if (state.gameId !== "word-ladder") {
    throw new Error("Word Ladder's timer resolution only applies to Word Ladder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("The ladder is already resolved.");
  }

  const nextState = structuredClone(state);
  const actorLabel = getCurrentActorLabel(nextState);

  return advanceWordLadderTurn(
    nextState,
    `Time expired for ${actorLabel}.`,
    `Time's up. One valid path was ${nextState.currentPrompt.round.revealPath.join(" → ")}.`
  );
}

export function submitGenealogyStep(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "genealogy") {
    throw new Error("Genealogy guesses are only available in Fill in the Genealogy.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next genealogy before guessing again.");
  }

  const normalizedGuess = normalizeText(guess);

  if (!normalizedGuess) {
    throw new Error("Enter a name before submitting.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const nextIndexInChain = prompt.chain.length;
  const expectedName = prompt.round.fullChain[nextIndexInChain];

  if (!expectedName) {
    throw new Error("This genealogy is already complete.");
  }

  if (prompt.chain.some((name) => normalizeText(name) === normalizedGuess)) {
    throw new Error("That name is already in the chain.");
  }

  if (normalizedGuess === normalizeText(expectedName)) {
    prompt.chain.push(expectedName);

    if (prompt.chain.length === prompt.round.fullChain.length) {
      const stats = getParticipantStats(nextState, actorIndex);
      const stepsTaken = prompt.chain.length - 1;
      const points = scoreWordLadder(stepsTaken, prompt.round.fullChain.length - 1);
      stats.totalScore += points;
      stats.roundWins += 1;
      consumeTurn(nextState.participants, actorIndex);
      prompt.wasCorrect = true;
      resolveRoundState(nextState, `${actorLabel} completed the genealogy in ${stepsTaken} generations for ${points} points.`);
      return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Genealogy completed.");
    }

    const nextStats = getParticipantStats(nextState, actorIndex);
    nextStats.wordLadderStepsCompleted += 1;
    return addActivity(nextState, "success", `${actorLabel} added ${expectedName}.`);
  }

  const stats = getParticipantStats(nextState, actorIndex);
  stats.incorrectAttempts += 1;
  return addActivity(nextState, "warning", `${actorLabel} tried "${guess.trim()}" - not the next name in this line. Try again.`);
}

export function removeLastGenealogyLink(state: SessionState): ActionResult {
  if (state.gameId !== "genealogy") {
    throw new Error("Genealogy links can only be removed in Fill in the Genealogy.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next genealogy before editing it.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;

  if (prompt.chain.length <= 1) {
    throw new Error("The starting person can't be removed.");
  }

  const removedName = prompt.chain.pop();
  return addActivity(nextState, "info", `Removed ${removedName} from the genealogy.`);
}

export function passGenealogyTurn(state: SessionState): ActionResult {
  if (state.gameId !== "genealogy") {
    throw new Error("Passing is only available in Fill in the Genealogy.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next genealogy before passing.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (nextState.turnIndex === prompt.startTurnIndex || nextState.participants.length <= 1) {
    prompt.wasCorrect = false;
    resolveRoundState(nextState, `Nobody completed the genealogy. The line was ${prompt.round.fullChain.join(" -> ")}.`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Genealogy revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} can steal.`);
}

export function resolveGenealogyOnTimer(state: SessionState): ActionResult {
  if (state.gameId !== "genealogy") {
    throw new Error("Genealogy timer resolution only applies to Fill in the Genealogy.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("The genealogy is already resolved.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  prompt.wasCorrect = false;
  resolveRoundState(nextState, `Time's up. The line was ${prompt.round.fullChain.join(" -> ")}.`);
  return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Genealogy revealed.");
}

export function moveBibleAnagramTile(state: SessionState, tileId: string, target: "answer" | "bank"): ActionResult {
  if (state.gameId !== "bible-anagrams") {
    throw new Error("Anagram tile controls are only available in Bible Anagrams.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before moving letters.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;

  if (target === "answer") {
    if (!prompt.bankTileIds.includes(tileId)) {
      return addActivity(nextState, "info", "That letter is already in the answer row.");
    }

    prompt.bankTileIds = prompt.bankTileIds.filter((id) => id !== tileId);
    prompt.answerTileIds.push(tileId);
  } else {
    if (!prompt.answerTileIds.includes(tileId)) {
      return addActivity(nextState, "info", "That letter is already in the letter bank.");
    }

    prompt.answerTileIds = prompt.answerTileIds.filter((id) => id !== tileId);
    prompt.bankTileIds.push(tileId);
  }

  return addActivity(nextState, "info", "Anagram letters updated.");
}

export function clearBibleAnagramAnswer(state: SessionState): ActionResult {
  if (state.gameId !== "bible-anagrams") {
    throw new Error("Anagram controls are only available in Bible Anagrams.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before clearing letters.");
  }

  const nextState = structuredClone(state);
  nextState.currentPrompt.bankTileIds = [
    ...nextState.currentPrompt.bankTileIds,
    ...nextState.currentPrompt.answerTileIds
  ];
  nextState.currentPrompt.answerTileIds = [];

  return addActivity(nextState, "info", "Answer row cleared.");
}

export function submitBibleAnagram(state: SessionState): ActionResult {
  if (state.gameId !== "bible-anagrams") {
    throw new Error("Anagram submit is only available in Bible Anagrams.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before submitting again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const tileById = new Map(nextState.currentPrompt.tiles.map((tile) => [tile.id, tile]));
  const submitted = nextState.currentPrompt.answerTileIds.map((tileId) => tileById.get(tileId)?.letter ?? "").join("");
  const canonicalAnswer = nextState.currentPrompt.round.answer.replace(/[^A-Za-z]/g, "").toUpperCase();
  const isCorrect = submitted.toUpperCase() === canonicalAnswer;

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 10;
    stats.roundWins += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} unscrambled the answer for 10 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Anagram solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The answer is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Answer revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passBibleAnagram(state: SessionState): ActionResult {
  if (state.gameId !== "bible-anagrams") {
    throw new Error("Anagram pass is only available in Bible Anagrams.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The answer is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Answer revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function selectTwoTruthsStatement(state: SessionState, statementIndex: number): ActionResult {
  if (state.gameId !== "two-truths-and-a-lie") {
    throw new Error("Two Truths and a Lie choices are only available in Two Truths and a Lie.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);

  if (prompt.eliminatedIndexes.includes(statementIndex)) {
    throw new Error("Choose an available statement.");
  }

  const statement = prompt.statements.find((entry) => entry.originalIndex === statementIndex);
  if (!statement) {
    throw new Error("That statement is not part of this round.");
  }

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  prompt.selectedIndex = statementIndex;

  if (statementIndex === prompt.round.lieIndex) {
    const points = scoreProphecyRetry(prompt.eliminatedIndexes.length);
    stats.totalScore += points;
    stats.roundWins += 1;
    prompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} spotted the lie for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "The lie was found.");
  }

  stats.incorrectAttempts += 1;
  prompt.eliminatedIndexes = Array.from(new Set([...prompt.eliminatedIndexes, statementIndex]));
  return addActivity(nextState, "warning", `${actorLabel} picked a true statement. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passTwoTruths(state: SessionState): ActionResult {
  if (state.gameId !== "two-truths-and-a-lie") {
    throw new Error("Two Truths and a Lie pass is only available in Two Truths and a Lie.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    const prompt = nextState.currentPrompt;
    const lieStatement = prompt.statements.find((entry) => entry.originalIndex === prompt.round.lieIndex);
    prompt.wasCorrect = false;
    resolveRoundState(nextState, `${actorLabel} passed. The lie was: "${lieStatement?.text ?? prompt.round.statements[prompt.round.lieIndex]}"`);
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "The lie was revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function selectProphecyCategoryCard(state: SessionState, cardId: string): ActionResult {
  if (state.gameId !== "prophecy-categories") {
    throw new Error("Prophecy category cards are only available in Prophecy Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  if (state.currentPrompt.sortedCardIds.includes(cardId)) {
    throw new Error("Choose an unsorted prophecy card.");
  }

  const nextState = structuredClone(state);
  nextState.currentPrompt.selectedCardId = cardId;
  return addActivity(nextState, "info", "Prophecy card selected.");
}

export function selectProphecyCategory(state: SessionState, category: string): ActionResult {
  if (state.gameId !== "prophecy-categories") {
    throw new Error("Prophecy categories are only available in Prophecy Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  if (!state.currentPrompt.round.categories.includes(category)) {
    throw new Error("Choose an available category.");
  }

  const nextState = structuredClone(state);
  nextState.currentPrompt.selectedCategory = category;
  return addActivity(nextState, "info", `${category} selected.`);
}

export function submitProphecyCategory(state: SessionState): ActionResult {
  if (state.gameId !== "prophecy-categories") {
    throw new Error("Prophecy category submit is only available in Prophecy Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const card = prompt.cards.find((entry) => entry.cardId === prompt.selectedCardId);

  if (!card || !prompt.selectedCategory) {
    throw new Error("Select a prophecy card and a category.");
  }

  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (card.category === prompt.selectedCategory) {
    prompt.sortedCardIds = Array.from(new Set([...prompt.sortedCardIds, card.cardId]));
    prompt.selectedCardId = null;
    prompt.selectedCategory = null;
    nextState.resolvedPrompts = prompt.sortedCardIds.length;
    stats.totalScore += 1;
    stats.roundWins += 1;

    if (prompt.sortedCardIds.length >= prompt.cards.length) {
      stats.totalScore += 5;
      prompt.wasCorrect = true;
      resolveRoundState(nextState, `${actorLabel} completed the board and earned a 5 point bonus.`);
      return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Categories complete.");
    }

    return addActivity(nextState, "success", `${actorLabel} sorted ${card.reference} for 1 point.`);
  }

  stats.incorrectAttempts += 1;
  prompt.selectedCardId = null;
  prompt.selectedCategory = null;
  return addActivity(nextState, "warning", `${actorLabel} missed the category. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passProphecyCategory(state: SessionState): ActionResult {
  if (state.gameId !== "prophecy-categories") {
    throw new Error("Prophecy category pass is only available in Prophecy Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  nextState.currentPrompt.selectedCardId = null;
  nextState.currentPrompt.selectedCategory = null;
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    const prompt = nextState.currentPrompt;
    const unsortedCard = prompt.cards.find((card) => !prompt.sortedCardIds.includes(card.cardId));

    if (unsortedCard) {
      prompt.sortedCardIds = Array.from(new Set([...prompt.sortedCardIds, unsortedCard.cardId]));
      nextState.resolvedPrompts = prompt.sortedCardIds.length;

      if (prompt.sortedCardIds.length >= prompt.cards.length) {
        prompt.wasCorrect = false;
        resolveRoundState(nextState, `${actorLabel} passed on the final category card.`);
      }

      return addActivity(nextState, "warning", `${actorLabel} passed. ${unsortedCard.reference} belongs in ${unsortedCard.category}.`);
    }
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function selectProverbCategoryCard(state: SessionState, cardId: string): ActionResult {
  if (state.gameId !== "proverb-categories") {
    throw new Error("Proverb category cards are only available in Proverb Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  if (state.currentPrompt.sortedCardIds.includes(cardId)) {
    throw new Error("Choose an unsorted Proverbs card.");
  }

  const nextState = structuredClone(state);
  nextState.currentPrompt.selectedCardId = cardId;
  return addActivity(nextState, "info", "Proverbs card selected.");
}

export function selectProverbCategory(state: SessionState, category: string): ActionResult {
  if (state.gameId !== "proverb-categories") {
    throw new Error("Proverb categories are only available in Proverb Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  if (!state.currentPrompt.round.categories.includes(category)) {
    throw new Error("Choose an available category.");
  }

  const nextState = structuredClone(state);
  nextState.currentPrompt.selectedCategory = category;
  return addActivity(nextState, "info", `${category} selected.`);
}

export function submitProverbCategory(state: SessionState): ActionResult {
  if (state.gameId !== "proverb-categories") {
    throw new Error("Proverb category submit is only available in Proverb Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const card = prompt.cards.find((entry) => entry.cardId === prompt.selectedCardId);

  if (!card || !prompt.selectedCategory) {
    throw new Error("Select a Proverbs card and a category.");
  }

  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  const stats = getParticipantStats(nextState, actorIndex);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (card.category === prompt.selectedCategory) {
    prompt.sortedCardIds = Array.from(new Set([...prompt.sortedCardIds, card.cardId]));
    prompt.selectedCardId = null;
    prompt.selectedCategory = null;
    nextState.resolvedPrompts = prompt.sortedCardIds.length;
    stats.totalScore += 1;
    stats.roundWins += 1;

    if (prompt.sortedCardIds.length >= prompt.cards.length) {
      stats.totalScore += 5;
      prompt.wasCorrect = true;
      resolveRoundState(nextState, `${actorLabel} completed the board and earned a 5 point bonus.`);
      return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Categories complete.");
    }

    return addActivity(nextState, "success", `${actorLabel} sorted ${card.reference} for 1 point.`);
  }

  stats.incorrectAttempts += 1;
  prompt.selectedCardId = null;
  prompt.selectedCategory = null;
  return addActivity(nextState, "warning", `${actorLabel} missed the category. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passProverbCategory(state: SessionState): ActionResult {
  if (state.gameId !== "proverb-categories") {
    throw new Error("Proverb category pass is only available in Proverb Categories Challenge.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue after the category board is resolved.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);
  nextState.currentPrompt.selectedCardId = null;
  nextState.currentPrompt.selectedCategory = null;
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isSoloSession(nextState)) {
    const prompt = nextState.currentPrompt;
    const unsortedCard = prompt.cards.find((card) => !prompt.sortedCardIds.includes(card.cardId));

    if (unsortedCard) {
      prompt.sortedCardIds = Array.from(new Set([...prompt.sortedCardIds, unsortedCard.cardId]));
      nextState.resolvedPrompts = prompt.sortedCardIds.length;

      if (prompt.sortedCardIds.length >= prompt.cards.length) {
        prompt.wasCorrect = false;
        resolveRoundState(nextState, `${actorLabel} passed on the final category card.`);
      }

      return addActivity(nextState, "warning", `${actorLabel} passed. ${unsortedCard.reference} belongs in ${unsortedCard.category}.`);
    }
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function moveTimelineEvent(
  state: SessionState,
  eventId: string,
  direction: "left" | "right"
): ActionResult {
  if (state.gameId !== "bible-timeline") {
    throw new Error("Timeline controls are only available in Bible Timeline.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before moving events.");
  }

  const nextState = structuredClone(state);
  const ids = nextState.currentPrompt.arrangedEventIds;
  const index = ids.indexOf(eventId);
  const swapIndex = direction === "left" ? index - 1 : index + 1;

  if (index < 0 || swapIndex < 0 || swapIndex >= ids.length) {
    return addActivity(nextState, "info", "That event is already at the edge of the timeline.");
  }

  [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];

  return addActivity(nextState, "info", "Timeline order updated.");
}

// The arrow buttons only ever swap one adjacent pair at a time (moveTimelineEvent above);
// dragging a card can move it several slots in one gesture, so this repositions it
// directly rather than replaying single-step swaps against state that wouldn't actually
// update between calls in the same synchronous drop handler.
export function reorderTimelineEvent(state: SessionState, eventId: string, targetIndex: number): ActionResult {
  if (state.gameId !== "bible-timeline") {
    throw new Error("Timeline controls are only available in Bible Timeline.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before moving events.");
  }

  const nextState = structuredClone(state);
  const ids = nextState.currentPrompt.arrangedEventIds;
  const fromIndex = ids.indexOf(eventId);
  const clampedTargetIndex = Math.max(0, Math.min(targetIndex, ids.length - 1));

  if (fromIndex < 0 || fromIndex === clampedTargetIndex) {
    return addActivity(nextState, "info", "Timeline order unchanged.");
  }

  const [moved] = ids.splice(fromIndex, 1);
  ids.splice(clampedTargetIndex, 0, moved);

  return addActivity(nextState, "info", "Timeline order updated.");
}

export function submitTimelineOrder(state: SessionState): ActionResult {
  if (state.gameId !== "bible-timeline") {
    throw new Error("Timeline submit is only available in Bible Timeline.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before submitting again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const orderById = new Map(nextState.currentPrompt.round.events.map((event) => [event.id, event.order]));
  const isCorrect = nextState.currentPrompt.arrangedEventIds.every((eventId, index, ids) => {
    if (index === 0) {
      return true;
    }

    return (orderById.get(ids[index - 1]) ?? 0) < (orderById.get(eventId) ?? 0);
  });

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 10;
    stats.roundWins += 1;
    stats.timelinePerfectOrders += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} placed the full timeline correctly for 10 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Timeline solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );
  nextState.currentPrompt.wasCorrect = false;
  resolveRoundState(nextState, `${actorLabel} missed the timeline. Correct order is revealed.`);
  return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Timeline revealed.");
}

export function revealTimelineRound(state: SessionState, reason = "Time ran out. Correct order is revealed."): ActionResult {
  if (state.gameId !== "bible-timeline") {
    throw new Error("Timeline reveal is only available in Bible Timeline.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before revealing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];

  if (actor) {
    getParticipantStats(nextState, actorIndex).incorrectAttempts += 1;
    consumeTurn(nextState.participants, actorIndex);
    nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
    nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
      nextState.currentPrompt.attemptedParticipantIds,
      actor.id
    );
  }

  nextState.currentPrompt.wasCorrect = false;
  resolveRoundState(nextState, reason);
  return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Timeline revealed.");
}

export function passTimelineRound(state: SessionState): ActionResult {
  if (state.gameId !== "bible-timeline") {
    throw new Error("Timeline pass is only available in Bible Timeline.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. Correct order is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Timeline revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function moveVerseTile(
  state: SessionState,
  tileId: string,
  target: "answer" | "bank"
): ActionResult {
  if (state.gameId !== "verse-scramble") {
    throw new Error("Verse tile controls are only available in Verse Scramble.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before moving words.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;

  if (target === "answer") {
    if (!prompt.bankTileIds.includes(tileId)) {
      return addActivity(nextState, "info", "That word is already in the answer row.");
    }

    prompt.bankTileIds = prompt.bankTileIds.filter((id) => id !== tileId);
    prompt.answerTileIds.push(tileId);
  } else {
    if (!prompt.answerTileIds.includes(tileId)) {
      return addActivity(nextState, "info", "That word is already in the tile bank.");
    }

    prompt.answerTileIds = prompt.answerTileIds.filter((id) => id !== tileId);
    prompt.bankTileIds.push(tileId);
  }

  return addActivity(nextState, "info", "Verse tiles updated.");
}

export function clearVerseAnswer(state: SessionState): ActionResult {
  if (state.gameId !== "verse-scramble") {
    throw new Error("Verse controls are only available in Verse Scramble.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before clearing words.");
  }

  const nextState = structuredClone(state);
  nextState.currentPrompt.bankTileIds = [
    ...nextState.currentPrompt.bankTileIds,
    ...nextState.currentPrompt.answerTileIds
  ];
  nextState.currentPrompt.answerTileIds = [];

  return addActivity(nextState, "info", "Answer row cleared.");
}

export function submitVerseScramble(state: SessionState): ActionResult {
  if (state.gameId !== "verse-scramble") {
    throw new Error("Verse submit is only available in Verse Scramble.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before submitting again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const tileById = new Map(nextState.currentPrompt.tiles.map((tile) => [tile.id, tile]));
  const submitted = nextState.currentPrompt.answerTileIds.map((tileId) => tileById.get(tileId)?.text ?? "").join(" ");
  const isCorrect = normalizeText(submitted) === normalizeText(nextState.currentPrompt.round.verseText);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 10;
    stats.roundWins += 1;
    stats.scrambleSolves += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} reconstructed the verse for 10 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Verse solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The verse is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Verse revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed the verse. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passVerseScramble(state: SessionState): ActionResult {
  if (state.gameId !== "verse-scramble") {
    throw new Error("Verse pass is only available in Verse Scramble.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The verse is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Verse revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function toggleConnectionTile(state: SessionState, tileId: string): ActionResult {
  if (state.gameId !== "bible-connections") {
    throw new Error("Connection controls are only available in Bible Connections.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before selecting tiles.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const tile = prompt.tiles.find((entry) => entry.id === tileId);

  if (!tile || prompt.solvedGroups.some((group) => group.groupId === tile.groupId)) {
    throw new Error("Choose an unsolved tile.");
  }

  if (prompt.selectedTileIds.includes(tileId)) {
    prompt.selectedTileIds = prompt.selectedTileIds.filter((id) => id !== tileId);
  } else {
    if (prompt.selectedTileIds.length >= 4) {
      throw new Error("Select exactly four tiles. Clear one before adding another.");
    }

    prompt.selectedTileIds.push(tileId);
  }

  return addActivity(nextState, "info", `${prompt.selectedTileIds.length} tile${prompt.selectedTileIds.length === 1 ? "" : "s"} selected.`);
}

export function submitConnectionGroup(state: SessionState): ActionResult {
  if (state.gameId !== "bible-connections") {
    throw new Error("Connection submit is only available in Bible Connections.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next board before submitting again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);

  if (prompt.selectedTileIds.length !== 4) {
    throw new Error("Select exactly four tiles before submitting.");
  }

  const selectedTiles = prompt.selectedTileIds.map((tileId) => {
    const tile = prompt.tiles.find((entry) => entry.id === tileId);

    if (!tile) {
      throw new Error("Selected tile is no longer available.");
    }

    return tile;
  });
  const groupIds = new Set(selectedTiles.map((tile) => tile.groupId));
  const groupId = selectedTiles[0]?.groupId;
  const isAlreadySolved = prompt.solvedGroups.some((group) => group.groupId === groupId);

  if (groupIds.size === 1 && groupId && !isAlreadySolved) {
    const group = prompt.round.groups.find((entry) => entry.id === groupId);

    if (!group) {
      throw new Error("Connection group is missing.");
    }

    stats.totalScore += 5;
    stats.roundWins += 1;
    stats.connectionsGroupsFound += 1;
    prompt.solvedGroups.push({
      groupId,
      category: group.category,
      items: group.items,
      participantId: actor.id
    });
    prompt.selectedTileIds = [];
    prompt.attemptedParticipantIds = [];

    if (prompt.solvedGroups.length === prompt.round.groups.length) {
      resolveRoundState(nextState, `${actorLabel} found the final group. Board complete.`);
      return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Connections complete.");
    }

    return addActivity(nextState, "success", `${actorLabel} found ${group.category} for 5 points. Keep going.`);
  }

  stats.incorrectAttempts += 1;
  prompt.selectedTileIds = [];
  prompt.attemptedParticipantIds = addAttemptedParticipant(prompt.attemptedParticipantIds, actor.id);
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  return addActivity(nextState, "warning", `${actorLabel} missed the connection. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passConnectionTurn(state: SessionState): ActionResult {
  if (state.gameId !== "bible-connections") {
    throw new Error("Connection pass is only available in Bible Connections.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next board before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actorLabel = getCurrentActorLabel(nextState);

  nextState.currentPrompt.selectedTileIds = [];
  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

function finalizeNameThatBookPrompt(
  nextState: NameThatBookState,
  options: { solved: boolean; winnerParticipantIndex?: number; message: string }
): ActionResult {
  const prompt = nextState.currentPrompt;

  if (!prompt.primaryTurnConsumed) {
    consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
    prompt.primaryTurnConsumed = true;
  }

  nextState.turnIndex = nextIndex(nextState.participants.length, prompt.primaryParticipantIndex);
  prompt.phase = "resolved";
  prompt.resolvedMessage = options.message;
  prompt.winnerParticipantId =
    options.winnerParticipantIndex == null ? null : nextState.participants[options.winnerParticipantIndex].id;

  return addActivity(nextState, options.solved ? "success" : "warning", options.message);
}

export function submitNameThatBookGuess(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "name-that-book") {
    throw new Error("Book guesses are only available in Name That Book.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter a book name before submitting.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);

  if (isCorrectGuess(prompt.round.book, prompt.round.aliases, trimmedGuess)) {
    const points = prompt.phase === "primary" ? 6 - prompt.revealedClues : 1;
    stats.totalScore += points;
    stats.roundWins += 1;
    stats.bookEarlySolves += prompt.phase === "primary" && prompt.revealedClues <= 2 ? 1 : 0;

    if (prompt.phase === "steal") {
      consumeTurn(nextState.participants, actorIndex);
    }

    return finalizeNameThatBookPrompt(nextState, {
      solved: true,
      winnerParticipantIndex: actorIndex,
      message: `${actorLabel} named ${prompt.round.book} for ${points} point${points === 1 ? "" : "s"}.`
    });
  }

  stats.incorrectAttempts += 1;

  if (prompt.phase === "primary") {
    if (prompt.revealedClues < 5) {
      prompt.revealedClues += 1;
      return addActivity(nextState, "warning", `${actorLabel} missed. Clue ${prompt.revealedClues} is now visible.`);
    }

    if (!prompt.primaryTurnConsumed) {
      consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
      prompt.primaryTurnConsumed = true;
    }

    if (prompt.stealOrder.length === 0) {
      return finalizeNameThatBookPrompt(nextState, {
        solved: false,
        message: `${actorLabel} missed after clue 5. The book was ${prompt.round.book}.`
      });
    }

    prompt.phase = "steal";
    prompt.stealCursor = 0;

    return addActivity(nextState, "warning", `${actorLabel} missed after clue 5. ${getCurrentActorLabel(nextState)} can steal.`);
  }

  consumeTurn(nextState.participants, actorIndex);

  if (prompt.stealCursor < prompt.stealOrder.length - 1) {
    prompt.stealCursor += 1;
    return addActivity(nextState, "warning", `${actorLabel} missed the steal. ${getCurrentActorLabel(nextState)} is next.`);
  }

  return finalizeNameThatBookPrompt(nextState, {
    solved: false,
    message: `All steal attempts missed. The book was ${prompt.round.book}.`
  });
}

export function passNameThatBookTurn(state: SessionState): ActionResult {
  if (state.gameId !== "name-that-book") {
    throw new Error("Book pass is only available in Name That Book.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const prompt = nextState.currentPrompt;
  const actorIndex = prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);

  if (prompt.phase === "primary") {
    if (nextState.participants.length === 1) {
      prompt.primaryTurnConsumed = true;

      return finalizeNameThatBookPrompt(nextState, {
        solved: false,
        message: `${actorLabel} passed. The book was ${prompt.round.book}.`
      });
    }

    nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
    prompt.primaryParticipantIndex = nextState.turnIndex;
    prompt.primaryMemberName = getCurrentMemberName(nextState.participants[nextState.turnIndex]);
    prompt.primaryTurnConsumed = false;
    prompt.stealOrder = buildStealOrder(nextState.participants.length, nextState.turnIndex);
    prompt.stealCursor = 0;

    return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
  }

  if (prompt.stealCursor < prompt.stealOrder.length - 1) {
    prompt.stealCursor += 1;
    return addActivity(nextState, "info", `${actorLabel} passed the steal. ${getCurrentActorLabel(nextState)} is next.`);
  }

  return finalizeNameThatBookPrompt(nextState, {
    solved: false,
    message: `All steal attempts passed or missed. The book was ${prompt.round.book}.`
  });
}

export function answerBeforeOrAfter(state: SessionState, answer: "left" | "right"): ActionResult {
  if (state.gameId !== "before-or-after") {
    throw new Error("Before-or-after answers are only available in Before Or After.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before answering again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const isCorrect = answer === nextState.currentPrompt.round.earlierEvent;

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.selectedAnswer = answer;
  nextState.currentPrompt.wasCorrect = isCorrect;

  if (isCorrect) {
    stats.totalScore += 3;
    stats.roundWins += 1;
    stats.beforeAfterCorrect += 1;
    resolveRoundState(nextState, `${actorLabel} chose correctly for 3 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Answer revealed.");
  }

  stats.incorrectAttempts += 1;
  resolveRoundState(nextState, `${actorLabel} missed. The earlier event is highlighted.`);
  return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Answer revealed.");
}

export function passBeforeOrAfter(state: SessionState): ActionResult {
  if (state.gameId !== "before-or-after") {
    throw new Error("Before-or-after pass is only available in Before Or After.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players passed. The earlier event is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Answer revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitReferenceRushGuess(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "reference-rush") {
    throw new Error("Reference guesses are only available in Reference Rush.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter a scripture reference before submitting.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const isCorrect = isCorrectGuess(
    nextState.currentPrompt.round.reference,
    nextState.currentPrompt.round.referenceAliases,
    trimmedGuess
  );

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 5;
    stats.roundWins += 1;
    stats.referenceRushCorrect += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} named the reference for 5 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Reference solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The reference is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Reference revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed the reference. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passReferenceRush(state: SessionState): ActionResult {
  if (state.gameId !== "reference-rush") {
    throw new Error("Reference pass is only available in Reference Rush.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The reference is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Reference revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitChapterFinderGuess(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "chapter-finder") {
    throw new Error("Chapter answers are only available in Chapter Finder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter the book and chapter before submitting.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const answer = `${nextState.currentPrompt.round.answerBook} ${nextState.currentPrompt.round.answerChapter}`;
  const isCorrect = isCorrectGuess(answer, nextState.currentPrompt.round.aliases, trimmedGuess);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 5;
    stats.roundWins += 1;
    stats.chapterFinderCorrect += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} found the chapter for 5 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Chapter found.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The chapter is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Chapter revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed the chapter. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passChapterFinder(state: SessionState): ActionResult {
  if (state.gameId !== "chapter-finder") {
    throw new Error("Chapter pass is only available in Chapter Finder.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The chapter is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Chapter revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitWhoSaidItGuess(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "who-said-it") {
    throw new Error("Speaker guesses are only available in Who Said It?.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter the speaker before submitting.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const isCorrect = isCorrectGuess(
    nextState.currentPrompt.round.speaker,
    nextState.currentPrompt.round.speakerAliases,
    trimmedGuess
  );

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 5;
    stats.roundWins += 1;
    stats.whoSaidItCorrect += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} named the speaker for 5 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Speaker solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The speaker is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Speaker revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed the speaker. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passWhoSaidIt(state: SessionState): ActionResult {
  if (state.gameId !== "who-said-it") {
    throw new Error("Speaker pass is only available in Who Said It?.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The speaker is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Speaker revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function moveBibleBook(
  state: SessionState,
  book: string,
  direction: "left" | "right"
): ActionResult {
  if (state.gameId !== "bible-books-relay") {
    throw new Error("Book relay controls are only available in Bible Books Relay.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before moving books.");
  }

  const nextState = structuredClone(state);
  const books = nextState.currentPrompt.arrangedBooks;
  const index = books.indexOf(book);
  const swapIndex = direction === "left" ? index - 1 : index + 1;

  if (index < 0 || swapIndex < 0 || swapIndex >= books.length) {
    return addActivity(nextState, "info", "That book is already at the edge of the relay.");
  }

  [books[index], books[swapIndex]] = [books[swapIndex], books[index]];

  return addActivity(nextState, "info", "Book order updated.");
}

// See reorderTimelineEvent — same reasoning: a drag gesture can move a tile several slots
// in one drop, so this repositions it directly instead of replaying moveBibleBook's
// single-step swap against state that wouldn't update between calls in one drop handler.
export function reorderBibleBook(state: SessionState, book: string, targetIndex: number): ActionResult {
  if (state.gameId !== "bible-books-relay") {
    throw new Error("Book relay controls are only available in Bible Books Relay.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before moving books.");
  }

  const nextState = structuredClone(state);
  const books = nextState.currentPrompt.arrangedBooks;
  const fromIndex = books.indexOf(book);
  const clampedTargetIndex = Math.max(0, Math.min(targetIndex, books.length - 1));

  if (fromIndex < 0 || fromIndex === clampedTargetIndex) {
    return addActivity(nextState, "info", "Book order unchanged.");
  }

  const [moved] = books.splice(fromIndex, 1);
  books.splice(clampedTargetIndex, 0, moved);

  return addActivity(nextState, "info", "Book order updated.");
}

export function submitBibleBooksRelay(state: SessionState): ActionResult {
  if (state.gameId !== "bible-books-relay") {
    throw new Error("Book relay submit is only available in Bible Books Relay.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before submitting again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const isCorrect = nextState.currentPrompt.arrangedBooks.every(
    (book, index) => book === nextState.currentPrompt.round.books[index]
  );

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    stats.totalScore += 10;
    stats.roundWins += 1;
    stats.booksRelayPerfectOrders += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} placed every book correctly for 10 points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Book order solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. Correct book order is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Book order revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed the order. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passBibleBooksRelay(state: SessionState): ActionResult {
  if (state.gameId !== "bible-books-relay") {
    throw new Error("Book relay pass is only available in Bible Books Relay.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. Correct book order is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Book order revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

export function submitMissingWordGuess(state: SessionState, guess: string): ActionResult {
  if (state.gameId !== "missing-word") {
    throw new Error("Missing-word answers are only available in Missing Word.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before guessing again.");
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    throw new Error("Enter the missing word or phrase before submitting.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const stats = getParticipantStats(nextState, actorIndex);
  const actorLabel = getCurrentActorLabel(nextState);
  const canonicalAnswer = nextState.currentPrompt.round.missingWords.join(" ");
  const isCorrect = isCorrectGuess(canonicalAnswer, nextState.currentPrompt.round.acceptedAnswers, trimmedGuess);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);

  if (isCorrect) {
    const missingCount = nextState.currentPrompt.round.missingWords.length;
    const points = missingCount === 1 ? 3 : missingCount === 2 ? 5 : 7;
    stats.totalScore += points;
    stats.roundWins += 1;
    stats.missingWordCorrect += 1;
    nextState.currentPrompt.wasCorrect = true;
    resolveRoundState(nextState, `${actorLabel} filled the blank for ${points} points.`);
    return addActivity(nextState, "success", nextState.currentPrompt.resolvedMessage ?? "Missing word solved.");
  }

  stats.incorrectAttempts += 1;
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The missing word is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Missing word revealed.");
  }

  return addActivity(nextState, "warning", `${actorLabel} missed the blank. ${getCurrentActorLabel(nextState)} is up.`);
}

export function passMissingWord(state: SessionState): ActionResult {
  if (state.gameId !== "missing-word") {
    throw new Error("Missing-word pass is only available in Missing Word.");
  }

  if (state.currentPrompt.phase !== "active") {
    throw new Error("Continue to the next round before passing again.");
  }

  const nextState = structuredClone(state);
  const actorIndex = nextState.turnIndex;
  const actor = nextState.participants[actorIndex];
  const actorLabel = getCurrentActorLabel(nextState);

  consumeTurn(nextState.participants, actorIndex);
  nextState.turnIndex = nextIndex(nextState.participants.length, actorIndex);
  nextState.currentPrompt.attemptedParticipantIds = addAttemptedParticipant(
    nextState.currentPrompt.attemptedParticipantIds,
    actor.id
  );

  if (allParticipantsAttempted(nextState, nextState.currentPrompt.attemptedParticipantIds)) {
    nextState.currentPrompt.wasCorrect = false;
    resolveRoundState(nextState, "All players missed or passed. The missing word is revealed.");
    return addActivity(nextState, "warning", nextState.currentPrompt.resolvedMessage ?? "Missing word revealed.");
  }

  return addActivity(nextState, "info", `${actorLabel} passed. ${getCurrentActorLabel(nextState)} is up.`);
}

function compareCompetitiveMetrics(gameId: GameId, left: Standing, right: Standing): number {
  void gameId;

  if (left.stats.totalScore !== right.stats.totalScore) {
    return right.stats.totalScore - left.stats.totalScore;
  }

  if (left.stats.roundWins !== right.stats.roundWins) {
    return right.stats.roundWins - left.stats.roundWins;
  }

  if (left.stats.incorrectAttempts !== right.stats.incorrectAttempts) {
    return left.stats.incorrectAttempts - right.stats.incorrectAttempts;
  }

  return 0;
}

export function getStandings(state: SessionState): Standing[] {
  return state.participants
    .map((participant) => ({
      participant,
      stats: state.stats[participant.id]
    }))
    .sort((left, right) => {
      const comparison = compareCompetitiveMetrics(state.gameId, left, right);
      return comparison !== 0 ? comparison : left.participant.name.localeCompare(right.participant.name);
    });
}

export function getUniqueWinner(state: SessionState): Standing | null {
  const standings = getStandings(state);

  if (standings.length === 0) {
    return null;
  }

  if (standings.length === 1) {
    return standings[0];
  }

  return compareCompetitiveMetrics(state.gameId, standings[0], standings[1]) === 0 ? null : standings[0];
}

export function getScriptureRemainingLetters(state: ScriptureState): number {
  return countRemainingLetters(getScriptureText(state.currentPrompt.round), state.currentPrompt.attemptedLetters);
}

export function getBibleCryptogramRemainingLetters(state: BibleCryptogramState): number {
  const { cipherMap, cipherGuesses } = state.currentPrompt;
  // A letter space counts as revealed only once its cipher letter has a *correct* guess —
  // an incorrect guess still shows on the solve-so-far board (see buildCryptogramSolvedBoard)
  // but doesn't actually solve that letter, so it stays counted as remaining here.
  const correctlyGuessedRealLetters = new Set(
    Object.entries(cipherGuesses)
      .filter(([cipherLetter, guess]) => isCorrectCipherGuess(cipherMap, cipherLetter, guess))
      .map(([, guess]) => guess)
  );

  return countRemainingLetters(state.currentPrompt.round.verseText, Array.from(correctlyGuessedRealLetters));
}
