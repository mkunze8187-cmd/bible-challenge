import { loadGameContent } from "./content";
import {
  scoreFiveGuesses,
  scoreInitials,
  scoreProphecyRetry,
  scoreScriptureLetterGuess,
  scoreScriptureSolve
} from "./scoring";
import type {
  BeforeOrAfterRound,
  BibleConnectionsRound,
  BibleBooksRelayRound,
  BibleTimelineRound,
  ChapterFinderRound,
  CompleteVerseRound,
  FulfillmentFinderRound,
  FiveGuessesRound,
  GameId,
  InitialsRound,
  MessiahProphecyRound,
  MissingWordRound,
  NameThatBookRound,
  ProphecyCategoriesRound,
  ProphecyCategoryCard,
  ProphecyClueLadderRound,
  ProphecyMatchRound,
  ProverbCategoriesRound,
  ProverbCategoryCard,
  PsalmReferenceFinderRound,
  PsalmThemeRound,
  ReferenceRushRound,
  TimelineEvent,
  VerseScrambleRound,
  ScripturePuzzleRound,
  WisdomMatchRound,
  WhoSaidItRound
} from "../types/gameData";

export type { GameId } from "../types/gameData";
export type ActivityTone = "info" | "success" | "warning";
export type ParticipantMode = "individual" | "teams";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type DifficultyFilter = ChallengeDifficulty | "mixed";

export interface TeamSetup {
  teamName: string;
  members: string[];
  color?: string;
}

export interface SessionConfig {
  gameId: GameId;
  participantMode: ParticipantMode;
  difficulty?: DifficultyFilter;
  contentSource?: "built-in" | "custom" | "all";
  individualNames?: string[];
  individualColors?: string[];
  teams?: TeamSetup[];
  sessionId?: string;
}

export interface ParticipantMember {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  members: ParticipantMember[];
  turnCounter: number;
}

export interface PlayerStats {
  totalScore: number;
  roundWins: number;
  earlySolves: number;
  initialsOnlySolves: number;
  incorrectAttempts: number;
  correctFullSolves: number;
  letterRevealPoints: number;
  hiddenLetterSolveBonus: number;
  timelinePerfectOrders: number;
  scrambleSolves: number;
  connectionsGroupsFound: number;
  bookEarlySolves: number;
  beforeAfterCorrect: number;
  referenceRushCorrect: number;
  chapterFinderCorrect: number;
  whoSaidItCorrect: number;
  booksRelayPerfectOrders: number;
  missingWordCorrect: number;
}

export interface ActivityEntry {
  id: string;
  tone: ActivityTone;
  text: string;
  roundNumber: number;
}

export interface ActionResult {
  nextState: SessionState;
  tone: ActivityTone;
  text: string;
}

export interface Standing {
  participant: Participant;
  stats: PlayerStats;
}

export interface SessionOption {
  id: string;
  title: string;
  theme: string;
}

interface CardRoundMeta {
  theme: string;
  sourceSessionTitle: string;
  cluePoolSize: number;
}

interface SessionBase {
  gameId: GameId;
  displayName: string;
  sessionTitle: string;
  sessionTheme: string;
  participantMode: ParticipantMode;
  participants: Participant[];
  stats: Record<string, PlayerStats>;
  activityLog: ActivityEntry[];
  status: "in-progress" | "completed";
  turnIndex: number;
  totalPrompts: number;
  resolvedPrompts: number;
}

export interface FiveGuessesBoardCard {
  id: string;
  round: FiveGuessesRound & CardRoundMeta;
  pickNumber: number;
  boardCategory: string;
  boardValue: number;
  status: "available" | "active" | "solved" | "unsolved";
  winnerParticipantId: string | null;
}

interface BoardPromptBase {
  phase: "primary" | "steal" | "resolved";
  primaryParticipantIndex: number;
  primaryTurnConsumed: boolean;
  stealOrder: number[];
  stealCursor: number;
  resolvedMessage: string | null;
}

export interface FiveGuessesPrompt extends BoardPromptBase {
  kind: "five-guesses";
  cardId: string;
  round: FiveGuessesRound & CardRoundMeta;
  revealedClues: number;
  primaryMemberName: string;
}

export interface FiveGuessesState extends SessionBase {
  gameId: "five-guesses";
  boardCards: FiveGuessesBoardCard[];
  currentPrompt: FiveGuessesPrompt | null;
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
  | ProphecyMatchState
  | MessiahProphecyState
  | ProphecyClueLadderState
  | FulfillmentFinderState
  | ProphecyCategoriesState
  | CompleteVerseState
  | WisdomMatchState
  | PsalmThemeState
  | ProverbCategoriesState
  | PsalmReferenceFinderState;

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
  "prophecy-match": {
    label: "Prophecy Match Challenge",
    shortDescription: "Match Old Testament prophecy cards with New Testament fulfillment cards.",
    setupPrompt: "Five prophecy pairs are selected. Match each prophecy to its fulfillment.",
    accent: "#6a4b2c"
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
  }
};

const BOARD_CARD_COUNT = 25;
const FIVE_GUESSES_CLUES_PER_CARD = 5;
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
const PROPHECY_MATCH_PAIRS_PER_GAME = 5;
const PROPHECY_MULTIPLE_CHOICE_ROUNDS_PER_GAME = 10;
const PROPHECY_CLUE_LADDER_ROUNDS_PER_GAME = 10;
const PROPHECY_CATEGORIES_ROUNDS_PER_GAME = 1;
const PSALMS_PROVERBS_MULTIPLE_CHOICE_ROUNDS_PER_GAME = 10;
const PROVERB_CATEGORIES_ROUNDS_PER_GAME = 1;
const DEFAULT_PARTICIPANT_COLORS = ["#2f6f5f", "#8a5c24", "#69436d", "#285f73", "#9b4a36", "#5c6f2a"];

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
    missingWordCorrect: 0
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

function createParticipants(config: SessionConfig): Participant[] {
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
          name
        }
      ],
      turnCounter: 0
    }));
  }

  const teams = (config.teams ?? [])
    .map((team, index) => ({
      teamName: team.teamName.trim() || `Team ${index + 1}`,
      members: team.members.map((member) => member.trim()).filter(Boolean),
      color: team.color
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
        name: member
      })),
      turnCounter: 0
    };
  });
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

function shuffle<T>(values: T[]): T[] {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
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
    state.gameId === "prophecy-match" ||
    state.gameId === "messiah-prophecy" ||
    state.gameId === "prophecy-clue-ladder" ||
    state.gameId === "fulfillment-finder" ||
    state.gameId === "prophecy-categories" ||
    state.gameId === "complete-the-verse" ||
    state.gameId === "wisdom-match" ||
    state.gameId === "psalm-theme" ||
    state.gameId === "proverb-categories" ||
    state.gameId === "psalm-reference-finder"
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

function findFiveGuessesCard(
  state: FiveGuessesState,
  cardId: string
): { cardIndex: number; card: FiveGuessesBoardCard } | null {
  const cardIndex = state.boardCards.findIndex((card) => card.id === cardId);

  if (cardIndex < 0) {
    return null;
  }

  return {
    cardIndex,
    card: state.boardCards[cardIndex]
  };
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
  nextState: FiveGuessesState | InitialsState,
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

  if (nextState.gameId === "five-guesses") {
    const found = findFiveGuessesCard(nextState, prompt.cardId);

    if (!found) {
      throw new Error("Unable to locate the active board card.");
    }

    found.card.status = options.solved ? "solved" : "unsolved";
    found.card.winnerParticipantId =
      options.winnerParticipantIndex == null ? null : nextState.participants[options.winnerParticipantIndex].id;
  } else {
    const found = findInitialsCard(nextState, prompt.cardId);

    if (!found) {
      throw new Error("Unable to locate the active board card.");
    }

    found.card.status = options.solved ? "solved" : "unsolved";
    found.card.winnerParticipantId =
      options.winnerParticipantIndex == null ? null : nextState.participants[options.winnerParticipantIndex].id;
  }

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

async function createFiveGuessesBoard(
  difficulty: DifficultyFilter | undefined,
  customOnly = false
): Promise<FiveGuessesBoardCard[]> {
  const pack = await loadGameContent("five-guesses", { customOnly });
  const allRounds = filterRoundsByDifficulty(
    pack.sessions.flatMap((session) =>
      session.rounds.map((round) => ({
        ...round,
        theme: session.theme,
        sourceSessionTitle: session.title,
        cluePoolSize: round.clues.length,
        clues: pickRandomSubset(round.clues, FIVE_GUESSES_CLUES_PER_CARD)
      }))
    ),
    difficulty,
    "Five Clues"
  );
  const grouped = new Map<string, typeof allRounds>();

  for (const round of shuffle(allRounds)) {
    const categoryRounds = grouped.get(round.category) ?? [];
    categoryRounds.push(round);
    grouped.set(round.category, categoryRounds);
  }

  const categoryGroups = shuffle(Array.from(grouped.entries()).filter(([, rounds]) => rounds.length >= 5)).slice(0, 5);

  if (categoryGroups.length < 5) {
    throw new Error("Five Clues needs at least five categories with five cards each.");
  }

  return categoryGroups.flatMap(([boardCategory, rounds], categoryIndex) =>
    shuffle(rounds)
      .slice(0, 5)
      .map((round, valueIndex) => ({
        id: `${round.id}-${categoryIndex + 1}-${valueIndex + 1}`,
        round,
        pickNumber: categoryIndex * 5 + valueIndex + 1,
        boardCategory,
        boardValue: (valueIndex + 1) * 100,
        status: "available" as const,
        winnerParticipantId: null
      }))
  );
}

async function createInitialsBoard(
  difficulty: DifficultyFilter | undefined,
  customOnly = false
): Promise<InitialsBoardCard[]> {
  const pack = await loadGameContent("initials", { customOnly });
  const allRounds = filterRoundsByDifficulty(
    pack.sessions.flatMap((session) =>
      session.rounds.map((round) => ({
        ...round,
        theme: session.theme,
        sourceSessionTitle: session.title,
        cluePoolSize: round.hints.length,
        hints: pickRandomSubset(round.hints, INITIALS_CLUES_PER_CARD)
      }))
    ),
    difficulty,
    "Bible Initials"
  );
  const pool = pickUniqueInitialsRounds(allRounds, BOARD_CARD_COUNT);

  return pool.map((round, index) => ({
    id: round.id,
    round,
    pickNumber: index + 1,
    status: "available",
    winnerParticipantId: null
  }));
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
  return {
    kind: "before-or-after",
    round,
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

function createWhoSaidItPrompt(round: WhoSaidItRound): WhoSaidItPrompt {
  return {
    kind: "who-said-it",
    round,
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

export async function createSessionState(config: SessionConfig): Promise<SessionState> {
  const participants = createParticipants(config);
  const stats = Object.fromEntries(participants.map((participant) => [participant.id, createPlayerStats()]));
  const customOnly = config.contentSource === "custom";
  const loadContent = <TGame extends GameId>(mode: TGame) => loadGameContent(mode, { customOnly });
  const pickRounds = <T,>(rounds: T[], count: number, gameName: string) =>
    pickGameRounds(rounds, count, gameName, config.difficulty);

  if (config.gameId === "five-guesses") {
    const boardCards = await createFiveGuessesBoard(config.difficulty, customOnly);

    return {
      gameId: "five-guesses",
      displayName: GAME_LIBRARY["five-guesses"].label,
      sessionTitle: "Random Five Clues Board",
      sessionTheme: "Five categories with five value cards drawn from the full library.",
      participantMode: config.participantMode,
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
    const boardCards = await createInitialsBoard(config.difficulty, customOnly);

    return {
      gameId: "initials",
      displayName: GAME_LIBRARY.initials.label,
      sessionTitle: "Random Bible Initials Board",
      sessionTheme: "Twenty-five random Bible Initials cards drawn from the full library.",
      participantMode: config.participantMode,
      participants,
      stats,
      activityLog: [
        {
          id: "start-1",
          tone: "info",
          text: "Bible Initials random board is ready. The active player chooses any available card.",
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
      currentPrompt: createWhoSaidItPrompt(rounds[0])
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

    return {
      gameId: "prophecy-categories",
      displayName: GAME_LIBRARY["prophecy-categories"].label,
      sessionTitle: rounds[0].title,
      sessionTheme: "Sort each prophecy card into the correct reference category.",
      participantMode: config.participantMode,
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
      totalPrompts: rounds[0].cards.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createProphecyCategoriesPrompt(rounds[0])
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

    return {
      gameId: "proverb-categories",
      displayName: GAME_LIBRARY["proverb-categories"].label,
      sessionTitle: rounds[0].title,
      sessionTheme: "Sort each Proverbs card into the correct wisdom category.",
      participantMode: config.participantMode,
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
      totalPrompts: rounds[0].cards.length,
      resolvedPrompts: 0,
      roundIndex: 0,
      rounds,
      currentPrompt: createProverbCategoriesPrompt(rounds[0])
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
    state.gameId === "prophecy-match" ||
    state.gameId === "messiah-prophecy" ||
    state.gameId === "prophecy-clue-ladder" ||
    state.gameId === "fulfillment-finder" ||
    state.gameId === "prophecy-categories" ||
    state.gameId === "complete-the-verse" ||
    state.gameId === "wisdom-match" ||
    state.gameId === "psalm-theme" ||
    state.gameId === "proverb-categories" ||
    state.gameId === "psalm-reference-finder"
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

  if (state.currentPrompt) {
    throw new Error("Finish the active prompt before picking another card.");
  }

  if (state.gameId === "five-guesses") {
    const nextState = structuredClone(state);
    const found = findFiveGuessesCard(nextState, cardId);

    if (!found || found.card.status !== "available") {
      throw new Error("Choose an available card.");
    }

    found.card.status = "active";
    nextState.currentPrompt = {
      kind: "five-guesses",
      cardId: found.card.id,
      round: found.card.round,
      revealedClues: 1,
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
      `${actor} selected ${found.card.boardCategory} for ${found.card.boardValue}. Clue 1 is now visible.`
    );
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

  if (!state.currentPrompt) {
    throw new Error("Pick a board card before guessing.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the board before guessing again.");
  }

  if (state.gameId === "five-guesses") {
    const nextState = structuredClone(state);
    const prompt = nextState.currentPrompt!;
    const actorIndex =
      prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
    const actor = nextState.participants[actorIndex];
    const stats = getParticipantStats(nextState, actorIndex);
    const actorLabel = getCurrentActorLabel(nextState);

    if (isCorrectGuess(prompt.round.answer, prompt.round.aliases, trimmedGuess)) {
      const found = findFiveGuessesCard(nextState, prompt.cardId);
      const points = found?.card.boardValue ?? scoreFiveGuesses(prompt.revealedClues as 1 | 2 | 3 | 4 | 5);

      stats.totalScore += points;
      stats.roundWins += 1;
      stats.earlySolves += prompt.phase === "primary" && prompt.revealedClues <= 2 ? 1 : 0;

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
      if (prompt.revealedClues < 5) {
        prompt.revealedClues += 1;

        return addActivity(
          nextState,
          "warning",
          `${actorLabel} missed. Clue ${prompt.revealedClues} is now revealed.`
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
        `${actorLabel} used all five clues. ${getCurrentActorLabel(nextState)} is up first for the steal.`
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

  if (!state.currentPrompt) {
    throw new Error("Pick a board card before passing.");
  }

  if (state.currentPrompt.phase === "resolved") {
    throw new Error("Continue to the board before passing again.");
  }

  if (state.gameId === "five-guesses") {
    const nextState = structuredClone(state);
    const prompt = nextState.currentPrompt!;
    const actorIndex =
      prompt.phase === "primary" ? prompt.primaryParticipantIndex : prompt.stealOrder[prompt.stealCursor];
    const stats = getParticipantStats(nextState, actorIndex);
    const actorLabel = getCurrentActorLabel(nextState);

    stats.incorrectAttempts += 1;

    if (prompt.phase === "primary") {
      if (prompt.revealedClues < FIVE_GUESSES_CLUES_PER_CARD) {
        prompt.revealedClues += 1;

        return addActivity(
          nextState,
          "warning",
          `${actorLabel} passed. Clue ${prompt.revealedClues} is now revealed.`
        );
      }

      if (!prompt.primaryTurnConsumed) {
        consumeTurn(nextState.participants, prompt.primaryParticipantIndex);
        prompt.primaryTurnConsumed = true;
      }

      if (prompt.stealOrder.length === 0) {
        return finalizeBoardPrompt(nextState, {
          solved: false,
          message: `${actorLabel} passed after all five clues. ${prompt.round.answer} closes unsolved.`
        });
      }

      prompt.phase = "steal";
      prompt.stealCursor = 0;

      return addActivity(
        nextState,
        "warning",
        `${actorLabel} passed after all five clues. ${getCurrentActorLabel(nextState)} is up first for the steal.`
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

    return advanceLinearRound(nextState, (round) => createWhoSaidItPrompt(round as WhoSaidItRound));
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

    return advanceLinearRound(nextState, (round) => createProverbCategoriesPrompt(round as ProverbCategoriesRound));
  }

  if (nextState.gameId === "psalm-reference-finder") {
    if (nextState.currentPrompt.phase !== "resolved") {
      throw new Error("Resolve the Psalm reference round before continuing.");
    }

    return advanceLinearRound(nextState, (round) => createPsalmReferenceFinderPrompt(round as PsalmReferenceFinderRound));
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

