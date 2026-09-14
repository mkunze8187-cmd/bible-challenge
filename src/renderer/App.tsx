import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import bibleChallengeLogo from "./assets/bible-challenge-logo.svg";
import { EventHomeControls } from "./components/EventHomeControls";
import { HelpModal } from "./components/HelpModal";
import { RatingModal } from "./components/RatingModal";
import { APP_HELP_CONTENT, GAME_HELP_CONTENT } from "./helpContent";
import {
  AudioManager,
  DEFAULT_AUDIO_SETTINGS,
  normalizeAudioSettings,
  type AudioSettings,
  type SoundEffectName
} from "./audio";
import {
  loadWordLadderDictionary,
  normalizeCustomContentPacks,
  registerCustomContentPacks,
  type CustomContentPack
} from "../lib/content";
import {
  GAME_LIBRARY,
  answerBeforeOrAfter,
  buildCryptogramBoard,
  buildMissingWordVerse,
  buildScriptureBoard,
  clearBibleAnagramAnswer,
  clearVerseAnswer,
  continueGame,
  createSessionState,
  getBoardProgressLabel,
  getBibleCryptogramRemainingLetters,
  getScriptureRemainingLetters,
  getStandings,
  getUniqueWinner,
  moveBibleAnagramTile,
  moveBibleBook,
  moveTimelineEvent,
  moveVerseTile,
  passBeforeOrAfter,
  passBibleAnagram,
  passBibleBooksRelay,
  passBibleCryptogramTurn,
  passBoardGuess,
  passChapterFinder,
  passCompleteVerse,
  passConnectionTurn,
  passMissingWord,
  passNameThatBookTurn,
  passFulfillmentFinder,
  passMessiahProphecy,
  passProphecyCategory,
  passProphecyClue,
  passProphecyMatch,
  passProverbCategory,
  passPsalmReferenceFinder,
  passPsalmTheme,
  passReferenceRush,
  passRelayWord,
  passScriptureTurn,
  passTimelineRound,
  passTwoTruths,
  passVerseScramble,
  passWisdomMatch,
  passWhoSaidIt,
  passWordLadderTurn,
  removeLastWordLadderRung,
  resolveWordLadderOnTimer,
  revealTimelineRound,
  selectBoardCard,
  selectProphecyCategory,
  selectProphecyCategoryCard,
  selectProphecyMatchCard,
  selectProverbCategory,
  selectProverbCategoryCard,
  selectTwoTruthsStatement,
  submitBibleAnagram,
  submitBibleCryptogramLetterGuess,
  submitBibleCryptogramSolve,
  submitCompleteVerseChoice,
  submitBibleBooksRelay,
  submitBoardGuess,
  submitChapterFinderGuess,
  submitConnectionGroup,
  submitFulfillmentFinderChoice,
  submitMessiahProphecyChoice,
  submitMissingWordGuess,
  submitNameThatBookGuess,
  submitProphecyCategory,
  submitProphecyClueGuess,
  submitProphecyMatch,
  submitProverbCategory,
  submitPsalmReferenceFinderChoice,
  submitPsalmThemeChoice,
  submitReferenceRushGuess,
  submitRelayWord,
  submitScriptureLetterGuess,
  submitScriptureSolve,
  submitTimelineOrder,
  submitVerseScramble,
  submitVerseTypingResult,
  submitWisdomMatchChoice,
  submitWhoSaidItGuess,
  submitWordLadderStep,
  toggleConnectionTile,
  type ActionResult,
  type ActivityTone,
  type BeforeOrAfterState,
  type BibleAnagramsState,
  type BibleBooksRelayState,
  type BibleConnectionsState,
  type BibleCryptogramState,
  type BibleTimelineState,
  type ChapterFinderState,
  type CompleteVerseState,
  type FulfillmentFinderState,
  type FiveGuessesState,
  type GameId,
  type DifficultyFilter,
  type InitialsState,
  type MessiahProphecyState,
  type MissingWordState,
  type NameThatBookState,
  type ParticipantMode,
  type ProphecyCategoriesState,
  type ProphecyClueLadderState,
  type ProphecyMatchState,
  type ProverbCategoriesState,
  type PsalmReferenceFinderState,
  type PsalmThemeState,
  type ReferenceRushState,
  type RelayVerseBuildState,
  revealProphecyClueOnTimer,
  type ScriptureState,
  type SessionState,
  type Standing,
  type TeamSetup,
  type TwoTruthsAndALieState,
  type VerseScrambleState,
  type VerseTypingRaceState,
  type WisdomMatchState,
  type WhoSaidItState,
  type WordLadderState
} from "../lib/gameEngine";
import type {
  ChallengeRating,
  EventScoreEntry,
  GamePlayStats,
  MissedPromptStat,
  SavedEventDefinition
} from "./appTypes";

interface FlashMessage {
  tone: ActivityTone;
  text: string;
}

type AppTheme = "classic" | "forest" | "ocean" | "plum" | "dawn" | "meadow" | "ruby";
type SettingsTab = "appearance" | "players" | "timers" | "audio" | "feedback" | "content" | "event";
type TimerPreset = "off" | "beginner" | "standard" | "advanced" | "expert" | "custom";
type DisplayMode = "normal" | "projector";
type ContentPackId =
  | "all"
  | "core"
  | "scripture"
  | "psalms-proverbs"
  | "prophecy"
  | "life-of-christ"
  | "old-testament"
  | "new-testament"
  | "custom";

interface FeedbackDraft {
  gameId: GameId | null;
  name: string;
  email: string;
  rating: number | null;
  message: string;
}

interface PersistedAppSettings {
  colorTheme: AppTheme;
  participantMode: ParticipantMode;
  // playerNames/playerColors/teams are deliberately NOT persisted — every launch
  // starts from a single default "Player 1," never restoring a previous roster.
  timerEnabled: boolean;
  challengeTimerSeconds: Record<GameId, number>;
  useVerseSecondsPerWord: boolean;
  verseScrambleSecondsPerWord: number;
  eventName: string;
  selectedEventGameIds: GameId[];
  savedEventDefinitions: SavedEventDefinition[];
  challengeRatings: Partial<Record<GameId, ChallengeRating>>;
  showChallengeRatings: boolean;
  gameStats: Partial<Record<GameId, GamePlayStats>>;
  feedbackEndpoint: string;
  showStudyNotes: boolean;
  difficultyFilter: DifficultyFilter;
  timerPreset: TimerPreset;
  displayMode: DisplayMode;
  defaultContentPackId: ContentPackId;
}

const PARTICIPANT_COLORS = ["#2f6f5f", "#8a5c24", "#69436d", "#285f73", "#9b4a36", "#5c6f2a"];
const CONNECTION_GROUP_COLORS = ["#2f6f5f", "#8a5c24", "#69436d", "#285f73"];
const PROPHECY_MATCH_COLOR_COUNT = 5;
const DEFAULT_PLAYER_NAMES = ["Player 1"];
const DEFAULT_PLAYER_COLORS = [PARTICIPANT_COLORS[0]];
const APP_THEMES: AppTheme[] = ["classic", "forest", "ocean", "plum", "dawn", "meadow", "ruby"];
const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "players", label: "Players" },
  { id: "timers", label: "Timers" },
  { id: "audio", label: "Audio" },
  { id: "feedback", label: "Feedback" },
  { id: "content", label: "Content" },
  { id: "event", label: "Event" }
];
const DEFAULT_TEAMS: TeamSetup[] = [
  {
    teamName: "Team Alpha",
    members: ["Alice"],
    color: PARTICIPANT_COLORS[0]
  }
];
const ALL_GAME_IDS = Object.keys(GAME_LIBRARY) as GameId[];
const ALL_GAME_ID_SET = new Set<GameId>(ALL_GAME_IDS);
const FORMINIT_FEEDBACK_FORM_ID = "e69o7x640m6";
const DEFAULT_FEEDBACK_ENDPOINT = `https://forminit.com/f/${FORMINIT_FEEDBACK_FORM_ID}`;
const CONTENT_PACKS: Record<ContentPackId, { label: string; color: string }> = {
  all: { label: "All Challenges", color: "#4f463d" },
  core: { label: "Core Bible Challenge", color: "#215348" },
  scripture: { label: "Scripture Memory", color: "#2f5fa8" },
  "psalms-proverbs": { label: "Psalms and Proverbs", color: "#aa7740" },
  prophecy: { label: "Prophecy", color: "#7f3b4a" },
  "life-of-christ": { label: "Life of Christ", color: "#245f62" },
  "old-testament": { label: "Old Testament", color: "#5c6f2a" },
  "new-testament": { label: "New Testament", color: "#4b4f8f" },
  custom: { label: "Custom", color: "#666b72" }
};
const CONTENT_PACK_IDS = Object.keys(CONTENT_PACKS) as ContentPackId[];
const GAME_CONTENT_PACKS: Record<GameId, ContentPackId[]> = {
  "five-guesses": ["core", "old-testament", "new-testament"],
  initials: ["core", "old-testament", "new-testament", "life-of-christ"],
  "scripture-puzzles": ["scripture"],
  "bible-timeline": ["core", "old-testament", "new-testament"],
  "verse-scramble": ["scripture"],
  "bible-connections": ["core"],
  "name-that-book": ["core", "old-testament", "new-testament"],
  "before-or-after": ["core", "old-testament", "new-testament"],
  "reference-rush": ["scripture"],
  "chapter-finder": ["core", "old-testament", "new-testament"],
  "who-said-it": ["core", "old-testament", "new-testament", "life-of-christ"],
  "bible-books-relay": ["core"],
  "missing-word": ["scripture"],
  "prophecy-match": ["prophecy"],
  "messiah-prophecy": ["prophecy", "life-of-christ"],
  "prophecy-clue-ladder": ["prophecy"],
  "fulfillment-finder": ["prophecy", "life-of-christ"],
  "prophecy-categories": ["prophecy"],
  "complete-the-verse": ["psalms-proverbs", "scripture"],
  "wisdom-match": ["psalms-proverbs"],
  "psalm-theme": ["psalms-proverbs"],
  "proverb-categories": ["psalms-proverbs"],
  "psalm-reference-finder": ["psalms-proverbs", "scripture"],
  "two-truths-and-a-lie": ["core"],
  "relay-verse-build": ["scripture"],
  "verse-typing-race": ["scripture"],
  "word-ladder": ["core"],
  "bible-anagrams": ["core"],
  "bible-cryptogram": ["scripture"]
};
const DEFAULT_CHALLENGE_TIMER_SECONDS: Record<GameId, number> = {
  "five-guesses": 30,
  initials: 30,
  "scripture-puzzles": 45,
  "bible-timeline": 90,
  "verse-scramble": 180,
  "bible-connections": 60,
  "name-that-book": 30,
  "before-or-after": 20,
  "reference-rush": 45,
  "chapter-finder": 45,
  "who-said-it": 45,
  "bible-books-relay": 90,
  "missing-word": 45,
  "prophecy-match": 45,
  "messiah-prophecy": 35,
  "prophecy-clue-ladder": 30,
  "fulfillment-finder": 35,
  "prophecy-categories": 45,
  "complete-the-verse": 35,
  "wisdom-match": 35,
  "psalm-theme": 35,
  "proverb-categories": 45,
  "psalm-reference-finder": 35,
  "two-truths-and-a-lie": 35,
  "relay-verse-build": 30,
  "verse-typing-race": 60,
  "word-ladder": 30,
  "bible-anagrams": 30,
  "bible-cryptogram": 60
};
const DEFAULT_VERSE_SCRAMBLE_SECONDS_PER_WORD = 6;
const DIFFICULTY_FILTERS: Array<{ id: DifficultyFilter; label: string }> = [
  { id: "mixed", label: "Mixed" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" }
];
const TIMER_PRESETS: Array<{ id: TimerPreset; label: string }> = [
  { id: "off", label: "Off" },
  { id: "beginner", label: "Beginner" },
  { id: "standard", label: "Standard" },
  { id: "advanced", label: "Advanced" },
  { id: "expert", label: "Expert" },
  { id: "custom", label: "Custom" }
];
const DISPLAY_MODES: Array<{ id: DisplayMode; label: string }> = [
  { id: "normal", label: "Normal" },
  { id: "projector", label: "Projector" }
];
const VERSE_TIMER_GAMES = new Set<GameId>([
  "scripture-puzzles",
  "verse-scramble",
  "reference-rush",
  "missing-word",
  "complete-the-verse",
  "psalm-theme",
  "psalm-reference-finder",
  "relay-verse-build",
  "verse-typing-race",
  "bible-cryptogram"
]);
const QUICK_CHOICE_TIMER_GAMES = new Set<GameId>([
  "before-or-after",
  "messiah-prophecy",
  "fulfillment-finder",
  "complete-the-verse",
  "wisdom-match",
  "psalm-theme",
  "psalm-reference-finder",
  "two-truths-and-a-lie"
]);
const TIMER_PRESET_SECONDS: Record<Exclude<TimerPreset, "off" | "custom">, { standard: number; verse: number; quick: number }> = {
  beginner: { standard: 90, verse: 120, quick: 45 },
  standard: { standard: 60, verse: 90, quick: 30 },
  advanced: { standard: 30, verse: 45, quick: 20 },
  expert: { standard: 15, verse: 25, quick: 10 }
};

function getActiveGuessKey(state: SessionState | null): string | null {
  if (!state || state.status !== "in-progress") {
    return null;
  }

  if (state.gameId === "scripture-puzzles" || state.gameId === "bible-cryptogram") {
    return state.currentPrompt.isComplete
      ? null
      : `${state.gameId}-${state.roundIndex}-${state.turnIndex}-${state.currentPrompt.phase}-${state.currentPrompt.attemptedLetters.join("")}`;
  }

  if (
    state.gameId === "bible-timeline" ||
    state.gameId === "verse-scramble" ||
    state.gameId === "before-or-after" ||
    state.gameId === "reference-rush" ||
    state.gameId === "chapter-finder" ||
    state.gameId === "who-said-it" ||
    state.gameId === "bible-books-relay" ||
    state.gameId === "missing-word" ||
    state.gameId === "messiah-prophecy" ||
    state.gameId === "fulfillment-finder" ||
    state.gameId === "complete-the-verse" ||
    state.gameId === "wisdom-match" ||
    state.gameId === "psalm-theme" ||
    state.gameId === "psalm-reference-finder" ||
    state.gameId === "two-truths-and-a-lie" ||
    state.gameId === "verse-typing-race" ||
    state.gameId === "bible-anagrams"
  ) {
    return state.currentPrompt.phase === "active" ? `${state.gameId}-${state.roundIndex}-${state.turnIndex}` : null;
  }

  if (state.gameId === "word-ladder") {
    // Deliberately NOT turn-scoped (no "-turnIndex" suffix): the whole round shares one
    // timer, so the countdown must not reset just because a guess or Pass moved turnIndex —
    // only starting a new ladder (roundIndex change) resets it.
    return state.currentPrompt.phase === "active" ? `${state.gameId}-${state.roundIndex}` : null;
  }

  if (state.gameId === "relay-verse-build") {
    return state.currentPrompt.phase === "active"
      ? `${state.gameId}-${state.roundIndex}-${state.turnIndex}-${state.currentPrompt.revealedCount}`
      : null;
  }

  if (state.gameId === "prophecy-match") {
    return state.currentPrompt.phase === "active"
      ? `${state.gameId}-${state.turnIndex}-${state.currentPrompt.matchedPairIds.length}`
      : null;
  }

  if (state.gameId === "prophecy-clue-ladder") {
    return state.currentPrompt.phase === "active"
      ? `${state.gameId}-${state.roundIndex}-${state.turnIndex}-${state.currentPrompt.revealedClues}-${state.currentPrompt.guessingDisabled}`
      : null;
  }

  if (state.gameId === "prophecy-categories") {
    return state.currentPrompt.phase === "active"
      ? `${state.gameId}-${state.roundIndex}-${state.turnIndex}-${state.currentPrompt.sortedCardIds.length}`
      : null;
  }

  if (state.gameId === "proverb-categories") {
    return state.currentPrompt.phase === "active"
      ? `${state.gameId}-${state.roundIndex}-${state.turnIndex}-${state.currentPrompt.sortedCardIds.length}`
      : null;
  }

  if (state.gameId === "bible-connections") {
    return state.currentPrompt.phase === "active" ? `${state.gameId}-${state.roundIndex}-${state.turnIndex}` : null;
  }

  if (state.gameId === "name-that-book") {
    return state.currentPrompt.phase === "resolved"
      ? null
      : `${state.gameId}-${state.roundIndex}-${state.currentPrompt.phase}-${state.currentPrompt.primaryParticipantIndex}-${state.currentPrompt.revealedClues}-${state.currentPrompt.stealCursor}`;
  }

  if (!state.currentPrompt || state.currentPrompt.phase === "resolved") {
    return null;
  }

  return [
    state.gameId,
    state.currentPrompt.cardId,
    state.currentPrompt.phase,
    state.currentPrompt.revealedClues,
    state.currentPrompt.stealCursor,
    state.turnIndex
  ].join("-");
}

function getRoundStartKey(state: SessionState | null): string | null {
  if (!state || state.status !== "in-progress") {
    return null;
  }

  if (!state.currentPrompt) {
    return null;
  }

  if (state.gameId === "five-guesses" || state.gameId === "initials") {
    return state.currentPrompt.phase === "resolved" ? null : `${state.sessionTitle}-${state.currentPrompt.cardId}`;
  }

  if (state.gameId === "scripture-puzzles" || state.gameId === "bible-cryptogram") {
    return state.currentPrompt.isComplete ? null : `${state.sessionTitle}-${state.roundIndex}`;
  }

  if (state.gameId === "prophecy-match") {
    return state.currentPrompt.phase === "active" ? `${state.sessionTitle}-match-board` : null;
  }

  return state.currentPrompt.phase === "active" ? `${state.sessionTitle}-${state.roundIndex}` : null;
}

function getActionSoundEffect(
  previousState: SessionState | null,
  result: ActionResult,
  preferredEffect?: SoundEffectName | null
): SoundEffectName | null {
  if (preferredEffect === null) {
    return null;
  }

  if (previousState?.status !== "completed" && result.nextState.status === "completed") {
    return "gameOver";
  }

  if (preferredEffect) {
    return preferredEffect;
  }

  if (result.tone === "success") {
    return "correct";
  }

  if (result.tone === "warning") {
    return "wrong";
  }

  return null;
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function TimerBadge(props: {
  isEnabled: boolean;
  timeRemaining: number;
  durationSeconds: number;
}) {
  const { isEnabled, timeRemaining, durationSeconds } = props;

  if (!isEnabled) {
    return null;
  }

  return (
    <span className={`timer-badge ${timeRemaining === 0 ? "timer-badge-expired" : ""}`}>
      {timeRemaining === 0 ? "Time is up" : `${formatTimer(timeRemaining)} left`}
      <span>{durationSeconds}s guess</span>
    </span>
  );
}

function getParticipantMemberName(participant: SessionState["participants"][number]): string {
  const member = participant.members[participant.turnCounter % participant.members.length];
  return member?.name ?? participant.name;
}

function getCurrentParticipantId(state: SessionState): string | null {
  if (state.status === "completed") {
    return null;
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
    state.gameId === "prophecy-match" ||
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
    return state.participants[state.turnIndex]?.id ?? null;
  }

  if (state.gameId === "name-that-book") {
    if (state.currentPrompt.phase === "primary") {
      return state.participants[state.currentPrompt.primaryParticipantIndex]?.id ?? null;
    }

    if (state.currentPrompt.phase === "steal") {
      const participantIndex = state.currentPrompt.stealOrder[state.currentPrompt.stealCursor];
      return state.participants[participantIndex]?.id ?? null;
    }

    return null;
  }

  if (!state.currentPrompt) {
    return state.participants[state.turnIndex]?.id ?? null;
  }

  if (state.currentPrompt.phase === "primary") {
    return state.participants[state.currentPrompt.primaryParticipantIndex]?.id ?? null;
  }

  if (state.currentPrompt.phase === "steal") {
    const participantIndex = state.currentPrompt.stealOrder[state.currentPrompt.stealCursor];
    return state.participants[participantIndex]?.id ?? null;
  }

  return null;
}

function getCurrentTurnMemberName(state: SessionState, participantId: string): string | null {
  if (state.participantMode !== "teams") {
    return null;
  }

  if (state.gameId !== "scripture-puzzles" && state.currentPrompt?.phase === "primary") {
    const participant = state.participants[state.currentPrompt.primaryParticipantIndex];
    return participant?.id === participantId ? state.currentPrompt.primaryMemberName : null;
  }

  const participant = state.participants.find((entry) => entry.id === participantId);
  return participant ? getParticipantMemberName(participant) : null;
}

function getTieBreakerLabel(gameId: GameId, standing: Standing): string {
  if (gameId === "five-guesses") {
    return `${standing.stats.roundWins} wins · ${standing.stats.earlySolves} early solves · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "initials") {
    return `${standing.stats.roundWins} wins · ${standing.stats.initialsOnlySolves} initials-only solves · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "scripture-puzzles") {
    return `${standing.stats.correctFullSolves} full solves · ${standing.stats.letterRevealPoints} reveal pts · ${standing.stats.hiddenLetterSolveBonus} hidden bonus`;
  }

  if (gameId === "bible-timeline") {
    return `${standing.stats.roundWins} wins · ${standing.stats.timelinePerfectOrders} perfect orders · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "verse-scramble") {
    return `${standing.stats.roundWins} wins · ${standing.stats.scrambleSolves} solves · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "bible-connections") {
    return `${standing.stats.roundWins} wins · ${standing.stats.connectionsGroupsFound} groups found · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "name-that-book") {
    return `${standing.stats.roundWins} wins · ${standing.stats.bookEarlySolves} early solves · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "before-or-after") {
    return `${standing.stats.roundWins} wins · ${standing.stats.beforeAfterCorrect} correct · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "reference-rush") {
    return `${standing.stats.roundWins} wins · ${standing.stats.referenceRushCorrect} references · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "chapter-finder") {
    return `${standing.stats.roundWins} wins · ${standing.stats.chapterFinderCorrect} chapters · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "who-said-it") {
    return `${standing.stats.roundWins} wins · ${standing.stats.whoSaidItCorrect} speakers · ${standing.stats.incorrectAttempts} misses`;
  }

  if (gameId === "bible-books-relay") {
    return `${standing.stats.roundWins} wins · ${standing.stats.booksRelayPerfectOrders} perfect orders · ${standing.stats.incorrectAttempts} misses`;
  }

  if (
    gameId === "prophecy-match" ||
    gameId === "messiah-prophecy" ||
    gameId === "prophecy-clue-ladder" ||
    gameId === "fulfillment-finder" ||
    gameId === "prophecy-categories" ||
    gameId === "complete-the-verse" ||
    gameId === "wisdom-match" ||
    gameId === "psalm-theme" ||
    gameId === "proverb-categories" ||
    gameId === "psalm-reference-finder"
  ) {
    return `${standing.stats.roundWins} correct · ${standing.stats.incorrectAttempts} misses`;
  }

  return `${standing.stats.roundWins} wins · ${standing.stats.missingWordCorrect} blanks · ${standing.stats.incorrectAttempts} misses`;
}

function getSetupDetail(gameId: GameId): string {
  if (gameId === "five-guesses") {
    return "This mode builds a fresh five-category board with five value cards in each category.";
  }

  if (gameId === "initials") {
    return "This mode builds a fresh 25-card board and shows each available card by its initials.";
  }

  if (gameId === "scripture-puzzles") {
    return "This mode builds a fresh 5-round Verse Reveal deck from the KJV library.";
  }

  if (gameId === "bible-timeline") {
    return "This mode builds a fresh 5-round chronology deck with shuffled event cards.";
  }

  if (gameId === "verse-scramble") {
    return "This mode builds a fresh 5-round KJV verse deck with click-to-move word tiles.";
  }

  if (gameId === "bible-connections") {
    return "This mode builds a fresh 3-board set with sixteen shuffled tiles per board.";
  }

  if (gameId === "name-that-book") {
    return "This mode builds a fresh 10-round clue ladder deck with one-point steals.";
  }

  if (gameId === "before-or-after") {
    return "This mode builds a fresh 15-round event-order comparison deck.";
  }

  if (gameId === "reference-rush") {
    return "This mode builds a fresh 10-round KJV verse deck. Everyone gets one shot before the reference is revealed.";
  }

  if (gameId === "chapter-finder") {
    return "This mode builds a fresh 10-round deck of Bible prompts answered by book and chapter.";
  }

  if (gameId === "who-said-it") {
    return "This mode builds a fresh 10-round KJV quote deck answered by speaker.";
  }

  if (gameId === "bible-books-relay") {
    return "This mode builds a fresh 5-round relay deck of shuffled Bible book subsets.";
  }

  if (gameId === "prophecy-match") {
    return "This mode builds a fresh 5-pair prophecy matching board with independently shuffled columns.";
  }

  if (gameId === "messiah-prophecy") {
    return "This mode builds a fresh 10-round deck of messianic prophecy multiple-choice prompts.";
  }

  if (gameId === "prophecy-clue-ladder") {
    return "This mode builds a fresh 10-round prophecy clue ladder. The timer reveals the next clue.";
  }

  if (gameId === "fulfillment-finder") {
    return "This mode builds a fresh 10-round deck of New Testament fulfillment prompts.";
  }

  if (gameId === "prophecy-categories") {
    return "This mode builds one 15-card sorting board from a pool of prophecy category sessions.";
  }

  if (gameId === "complete-the-verse") {
    return "This mode builds a fresh 10-round KJV verse-ending deck from Psalms and Proverbs.";
  }

  if (gameId === "wisdom-match") {
    return "This mode builds a fresh 10-round Proverbs theme deck.";
  }

  if (gameId === "psalm-theme") {
    return "This mode builds a fresh 10-round Psalm theme deck.";
  }

  if (gameId === "proverb-categories") {
    return "This mode builds one 15-card Proverbs sorting board from a pool of category sessions.";
  }

  if (gameId === "psalm-reference-finder") {
    return "This mode builds a fresh 10-round Psalm reference deck.";
  }

  return "This mode builds a fresh 10-round KJV verse deck with one to three blanks per round.";
}

function getProgressLabel(state: SessionState): string {
  if (state.gameId === "five-guesses" || state.gameId === "initials") {
    return getBoardProgressLabel(state);
  }

  if (state.gameId === "prophecy-match") {
    return `${state.resolvedPrompts} of ${state.totalPrompts} matched`;
  }

  if (state.gameId === "prophecy-categories" || state.gameId === "proverb-categories") {
    return `${state.resolvedPrompts} of ${state.totalPrompts} sorted`;
  }

  return `Round ${state.roundIndex + 1} of ${state.totalPrompts}`;
}

function getNextParticipantColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

function getEventParticipantKey(participantMode: ParticipantMode, participantName: string): string {
  const normalizedName =
    participantName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "participant";

  return `${participantMode}:${normalizedName}`;
}

function sortEventScores(scores: Record<string, EventScoreEntry>): EventScoreEntry[] {
  return Object.values(scores).sort((left, right) => {
    if (left.totalScore !== right.totalScore) {
      return right.totalScore - left.totalScore;
    }

    if (left.challengesCompleted !== right.challengesCompleted) {
      return right.challengesCompleted - left.challengesCompleted;
    }

    return left.participantName.localeCompare(right.participantName);
  });
}

function getEventScoreLabel(score: EventScoreEntry | undefined): string {
  if (!score) {
    return "Event 0";
  }

  return `Event ${score.totalScore}`;
}

function getRatingAverage(rating: ChallengeRating | undefined): number | null {
  if (!rating || rating.ratingCount <= 0) {
    return null;
  }

  return rating.totalStars / rating.ratingCount;
}

function getRatingLabel(rating: ChallengeRating | undefined): string {
  const average = getRatingAverage(rating);

  if (average === null) {
    return "No ratings yet";
  }

  return `${average.toFixed(1)} / 5 from ${rating?.ratingCount ?? 0}`;
}

function getRatingHeadingLabel(rating: ChallengeRating | undefined): string {
  const average = getRatingAverage(rating);
  return average === null ? "No rating" : `Rating ${average.toFixed(1)} / 5`;
}

function getFilledStarCount(rating: ChallengeRating | undefined): number {
  const average = getRatingAverage(rating);
  return average === null ? 0 : Math.round(average);
}

function getChallengeTimerLabel(
  gameId: GameId,
  challengeTimerSeconds: Record<GameId, number>,
  useVerseSecondsPerWord: boolean,
  verseScrambleSecondsPerWord: number
): string {
  if (gameId === "verse-scramble" && useVerseSecondsPerWord) {
    return `${verseScrambleSecondsPerWord}s per word`;
  }

  return `${challengeTimerSeconds[gameId]}s`;
}

function getTimerDurationSeconds(
  state: SessionState | null,
  selectedGameId: GameId,
  challengeTimerSeconds: Record<GameId, number>,
  useVerseSecondsPerWord: boolean,
  verseScrambleSecondsPerWord: number
): number {
  const gameId = state?.gameId ?? selectedGameId;

  if (state?.gameId === "verse-scramble" && useVerseSecondsPerWord) {
    return Math.max(5, state.currentPrompt.tiles.length * verseScrambleSecondsPerWord);
  }

  return challengeTimerSeconds[gameId];
}

interface StudyNoteContent {
  key: string;
  title: string;
  answer: string;
  reference: string;
  verse: string;
  note: string;
}

function getOptionalText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value : "";
}

function getRoundTeachingNote(round: unknown): string {
  return getOptionalText((round as { teachingNote?: unknown }).teachingNote) || "Review the reference and answer before continuing.";
}

function getStudyNoteContent(state: SessionState | null): StudyNoteContent | null {
  if (!state) {
    return null;
  }

  if (state.gameId === "scripture-puzzles") {
    const prompt = state.currentPrompt;
    if (!prompt.isComplete) {
      return null;
    }

    return {
      key: `${state.gameId}:${state.roundIndex}:${prompt.completedReason}`,
      title: "Verse Study Note",
      answer: prompt.round.reference,
      reference: prompt.round.reference,
      verse: prompt.round.verseText ?? prompt.round.placeholderText ?? "",
      note: getRoundTeachingNote(prompt.round)
    };
  }

  if (state.gameId === "five-guesses" || state.gameId === "initials" || state.gameId === "name-that-book") {
    const prompt = state.currentPrompt;
    if (!prompt || prompt.phase !== "resolved") {
      return null;
    }
    const promptKey = "cardId" in prompt ? prompt.cardId : "roundIndex" in state ? state.roundIndex : state.resolvedPrompts;

    return {
      key: `${state.gameId}:${promptKey}:${prompt.resolvedMessage ?? ""}`,
      title: "Study Note",
      answer: "answer" in prompt.round ? String(prompt.round.answer) : String(prompt.round.book),
      reference: getOptionalText((prompt.round as { reference?: unknown }).reference),
      verse: "",
      note: getRoundTeachingNote(prompt.round)
    };
  }

  if (state.gameId === "prophecy-match") {
    const prompt = state.currentPrompt;
    if (prompt.phase !== "resolved") {
      return null;
    }

    return {
      key: `${state.gameId}:${prompt.matchedPairIds.join(",")}`,
      title: "Prophecy Study Note",
      answer: "Prophecy board complete",
      reference: "",
      verse: "",
      note: prompt.matchedPairIds
        .map((pairId) => state.pairs.find((pair) => pair.id === pairId))
        .filter(Boolean)
        .slice(-1)
        .map((pair) => getRoundTeachingNote(pair))
        .at(0) ?? "Review the reference and answer before continuing."
    };
  }

  const prompt = "currentPrompt" in state ? state.currentPrompt : null;
  if (!prompt || !("phase" in prompt) || prompt.phase !== "resolved" || !("round" in prompt)) {
    return null;
  }

  const round = prompt.round as unknown as Record<string, unknown>;
  const answer =
    getOptionalText(round.correctAnswer) ||
    getOptionalText(round.correctTheme) ||
    getOptionalText(round.correctReference) ||
    getOptionalText(round.answer) ||
    (Array.isArray(round.missingWords) ? round.missingWords.join(" ") : "") ||
    getOptionalText(round.answerBook) ||
    getOptionalText(round.book) ||
    getOptionalText(round.earlierEvent);
  const reference =
    getOptionalText(round.reference) ||
    getOptionalText(round.prophecyReference) ||
    getOptionalText(round.fulfillmentReference) ||
    getOptionalText(round.correctProphecyReference);
  const verse =
    getOptionalText(round.verseText) ||
    getOptionalText(round.excerpt) ||
    getOptionalText(round.verseTextShort) ||
    getOptionalText(round.prophecyTextShort) ||
    getOptionalText(round.fulfillmentText);

  const keyedState = state as SessionState & { roundIndex?: number; resolvedPrompts: number; gameId: GameId };

  return {
    key: `${keyedState.gameId}:${keyedState.roundIndex ?? keyedState.resolvedPrompts}:${getOptionalText((prompt as { resolvedMessage?: unknown }).resolvedMessage)}`,
    title: VERSE_TIMER_GAMES.has(keyedState.gameId) ? "Verse Study Note" : "Study Note",
    answer: answer || "Answer revealed",
    reference,
    verse,
    note: getRoundTeachingNote(round)
  };
}

function createMissedPromptStat(itemId: string, label: string, reference?: string): MissedPromptStat {
  return {
    itemId,
    label,
    reference: reference || undefined,
    misses: 1
  };
}

function getPromptMissTarget(state: SessionState): MissedPromptStat | null {
  if (state.gameId === "five-guesses" || state.gameId === "initials") {
    const prompt = state.currentPrompt;
    return prompt
      ? createMissedPromptStat(
          prompt.round.id,
          prompt.round.answer,
          getOptionalText((prompt.round as { reference?: unknown }).reference)
        )
      : null;
  }

  if (state.gameId === "scripture-puzzles") {
    const prompt = state.currentPrompt;
    return createMissedPromptStat(prompt.round.id, prompt.round.reference, prompt.round.reference);
  }

  if (state.gameId === "bible-connections") {
    const prompt = state.currentPrompt;
    const selectedTiles = prompt.selectedTileIds
      .map((tileId) => prompt.tiles.find((tile) => tile.id === tileId)?.text)
      .filter((text): text is string => Boolean(text));
    const label = selectedTiles.length > 0 ? `${prompt.round.title}: ${selectedTiles.join(", ")}` : prompt.round.title;
    const reference = prompt.round.groups.map((group) => group.category).join(", ");
    return createMissedPromptStat(prompt.round.id, label, reference);
  }

  if (state.gameId === "name-that-book") {
    const prompt = state.currentPrompt;
    return createMissedPromptStat(prompt.round.id, prompt.round.book, prompt.round.category);
  }

  if (state.gameId === "prophecy-match") {
    const prompt = state.currentPrompt;
    const selectedProphecy = prompt.prophecyCards.find((card) => card.id === prompt.selectedProphecyId);
    const selectedFulfillment = prompt.fulfillmentCards.find((card) => card.id === prompt.selectedFulfillmentId);
    const targetCard = selectedProphecy ?? selectedFulfillment;

    if (!targetCard) {
      return createMissedPromptStat("prophecy-match-board", state.sessionTitle);
    }

    const label = selectedProphecy && selectedFulfillment
      ? `${selectedProphecy.reference} with ${selectedFulfillment.reference}`
      : targetCard.summary;
    return createMissedPromptStat(targetCard.pairId, label, targetCard.reference);
  }

  if (state.gameId === "prophecy-categories") {
    const prompt = state.currentPrompt;
    const card =
      prompt.cards.find((entry) => entry.cardId === prompt.selectedCardId) ??
      prompt.cards.find((entry) => !prompt.sortedCardIds.includes(entry.cardId));
    return card ? createMissedPromptStat(card.cardId, card.summary, card.reference) : createMissedPromptStat(prompt.round.id, prompt.round.title);
  }

  if (state.gameId === "proverb-categories") {
    const prompt = state.currentPrompt;
    const card =
      prompt.cards.find((entry) => entry.cardId === prompt.selectedCardId) ??
      prompt.cards.find((entry) => !prompt.sortedCardIds.includes(entry.cardId));
    return card ? createMissedPromptStat(card.cardId, card.textShort, card.reference) : createMissedPromptStat(prompt.round.id, prompt.round.title);
  }

  const prompt = "currentPrompt" in state ? state.currentPrompt : null;
  if (!prompt || !("round" in prompt)) {
    return null;
  }

  const round = prompt.round as unknown as Record<string, unknown>;
  const keyedState = state as SessionState & { roundIndex?: number; resolvedPrompts: number; gameId: GameId };
  const itemId =
    getOptionalText(round.id) ||
    `${keyedState.gameId}-${keyedState.roundIndex ?? keyedState.resolvedPrompts}`;
  const label =
    getOptionalText(round.title) ||
    getOptionalText(round.reference) ||
    getOptionalText(round.prompt) ||
    getOptionalText(round.correctReference) ||
    getOptionalText(round.correctProphecyReference) ||
    getOptionalText(round.answer) ||
    getOptionalText(round.book) ||
    itemId;
  const reference =
    getOptionalText(round.reference) ||
    getOptionalText(round.prophecyReference) ||
    getOptionalText(round.fulfillmentReference) ||
    getOptionalText(round.correctReference) ||
    getOptionalText(round.correctProphecyReference);

  return createMissedPromptStat(itemId, label, reference);
}

function getMissedPromptFromState(state: SessionState): MissedPromptStat | null {
  if (state.gameId === "five-guesses" || state.gameId === "initials") {
    const prompt = state.currentPrompt;
    if (!prompt || prompt.phase !== "resolved") {
      return null;
    }

    const card = state.boardCards.find((entry) => entry.id === prompt.cardId);
    return card?.status === "unsolved"
      ? createMissedPromptStat(
          prompt.round.id,
          prompt.round.answer,
          getOptionalText((prompt.round as { reference?: unknown }).reference)
        )
      : null;
  }

  if (state.gameId === "scripture-puzzles") {
    const prompt = state.currentPrompt;
    if (!prompt.isComplete || prompt.winnerParticipantId) {
      return null;
    }

    return createMissedPromptStat(prompt.round.id, prompt.round.reference, prompt.round.reference);
  }

  if (state.gameId === "name-that-book") {
    const prompt = state.currentPrompt;
    return prompt.phase === "resolved" && !prompt.winnerParticipantId
      ? createMissedPromptStat(prompt.round.id, prompt.round.book, prompt.round.category)
      : null;
  }

  if (state.gameId === "prophecy-match") {
    return state.currentPrompt.phase === "resolved" && state.currentPrompt.matchedPairIds.length < state.totalPrompts
      ? createMissedPromptStat("prophecy-match-board", state.sessionTitle)
      : null;
  }

  const prompt = "currentPrompt" in state ? state.currentPrompt : null;
  if (!prompt || !("phase" in prompt) || prompt.phase !== "resolved" || !("round" in prompt)) {
    return null;
  }

  const wasCorrect = "wasCorrect" in prompt ? prompt.wasCorrect : null;
  if (wasCorrect !== false) {
    return null;
  }

  const round = prompt.round as unknown as Record<string, unknown>;
  const keyedState = state as SessionState & { roundIndex?: number; resolvedPrompts: number; gameId: GameId };
  const itemId =
    getOptionalText(round.id) ||
    `${keyedState.gameId}-${keyedState.roundIndex ?? keyedState.resolvedPrompts}`;
  const label =
    getOptionalText(round.title) ||
    getOptionalText(round.reference) ||
    getOptionalText(round.prompt) ||
    getOptionalText(round.correctReference) ||
    getOptionalText(round.answer) ||
    getOptionalText(round.book) ||
    itemId;
  const reference =
    getOptionalText(round.reference) ||
    getOptionalText(round.prophecyReference) ||
    getOptionalText(round.fulfillmentReference) ||
    getOptionalText(round.correctReference);

  return createMissedPromptStat(itemId, label, reference);
}

function getNewMissedPrompt(previousState: SessionState | null, nextState: SessionState): MissedPromptStat | null {
  if (previousState && previousState.gameId === nextState.gameId) {
    const previousIncorrectAttempts = getSessionIncorrectAttempts(previousState);
    const nextIncorrectAttempts = getSessionIncorrectAttempts(nextState);

    if (nextIncorrectAttempts > previousIncorrectAttempts) {
      return getPromptMissTarget(previousState) ?? getPromptMissTarget(nextState);
    }
  }

  const missed = getMissedPromptFromState(nextState);
  if (!missed) {
    return null;
  }

  if (!previousState || previousState.gameId !== nextState.gameId) {
    return missed;
  }

  const previousMissed = getMissedPromptFromState(previousState);
  return previousMissed?.itemId === missed.itemId ? null : missed;
}

function mergeMissedPromptStats(existing: MissedPromptStat[], misses: MissedPromptStat[]): MissedPromptStat[] {
  const byId = new Map(existing.map((entry) => [entry.itemId, { ...entry }]));

  misses.forEach((miss) => {
    const current = byId.get(miss.itemId);
    byId.set(miss.itemId, current ? { ...current, misses: current.misses + miss.misses } : { ...miss });
  });

  return Array.from(byId.values())
    .sort((left, right) => right.misses - left.misses || left.label.localeCompare(right.label))
    .slice(0, 60);
}

function getSessionIncorrectAttempts(state: SessionState): number {
  return Object.values(state.stats).reduce((total, stats) => total + stats.incorrectAttempts, 0);
}

function getSessionTotalScore(state: SessionState): number {
  return Object.values(state.stats).reduce((total, stats) => total + stats.totalScore, 0);
}

function recordGameStarted(
  current: Partial<Record<GameId, GamePlayStats>>,
  mode: GameId,
  playMode: ParticipantMode,
  isEventPlay: boolean
): Partial<Record<GameId, GamePlayStats>> {
  const existing = current[mode] ?? createEmptyGamePlayStats();

  return {
    ...current,
    [mode]: {
      ...existing,
      totalPlays: existing.totalPlays + 1,
      individualPlays: existing.individualPlays + (playMode === "individual" ? 1 : 0),
      teamPlays: existing.teamPlays + (playMode === "teams" ? 1 : 0),
      eventPlays: existing.eventPlays + (isEventPlay ? 1 : 0),
      lastPlayedAt: new Date().toISOString()
    }
  };
}

function forceResolveForHost(state: SessionState): ActionResult {
  const nextState = structuredClone(state);
  const message = "Host revealed the answer.";

  if (nextState.status === "completed") {
    return { nextState, tone: "info", text: "The game is already complete." };
  }

  if (nextState.gameId === "scripture-puzzles") {
    nextState.currentPrompt.isComplete = true;
    nextState.currentPrompt.completedReason = "fully-revealed";
    nextState.currentPrompt.phase = "solve";
    return { nextState, tone: "warning", text: message };
  }

  if (nextState.gameId === "five-guesses" || nextState.gameId === "initials") {
    const prompt = nextState.currentPrompt;
    if (!prompt) {
      return { nextState, tone: "info", text: "Pick a card before revealing an answer." };
    }

    const card = nextState.boardCards.find((entry) => entry.id === prompt.cardId);
    if (card && card.status !== "solved" && card.status !== "unsolved") {
      card.status = "unsolved";
      card.winnerParticipantId = null;
      nextState.resolvedPrompts += 1;
    }
    prompt.phase = "resolved";
    prompt.resolvedMessage = `${message} The answer was ${prompt.round.answer}.`;
    if (nextState.resolvedPrompts >= nextState.totalPrompts) {
      nextState.status = "completed";
    }
    return { nextState, tone: "warning", text: prompt.resolvedMessage };
  }

  if (nextState.gameId === "prophecy-match") {
    nextState.currentPrompt.prophecyCards.forEach((card) => {
      card.status = "matched";
    });
    nextState.currentPrompt.fulfillmentCards.forEach((card) => {
      card.status = "matched";
    });
    nextState.currentPrompt.matchedPairIds = nextState.pairs.map((pair) => pair.id);
    nextState.currentPrompt.phase = "resolved";
    nextState.currentPrompt.resolvedMessage = message;
    nextState.resolvedPrompts = nextState.totalPrompts;
    return { nextState, tone: "warning", text: message };
  }

  if (nextState.gameId === "prophecy-categories" || nextState.gameId === "proverb-categories") {
    nextState.currentPrompt.sortedCardIds = nextState.currentPrompt.cards.map((card) => card.cardId);
    nextState.currentPrompt.phase = "resolved";
    nextState.currentPrompt.wasCorrect = false;
    nextState.currentPrompt.resolvedMessage = message;
    nextState.resolvedPrompts = nextState.totalPrompts;
    return { nextState, tone: "warning", text: message };
  }

  if (nextState.gameId === "name-that-book") {
    nextState.currentPrompt.phase = "resolved";
    nextState.currentPrompt.winnerParticipantId = null;
    nextState.currentPrompt.resolvedMessage = `${message} The answer was ${nextState.currentPrompt.round.book}.`;
    return { nextState, tone: "warning", text: nextState.currentPrompt.resolvedMessage };
  }

  const prompt = nextState.currentPrompt as { phase: "active" | "resolved"; wasCorrect?: boolean | null; resolvedMessage: string | null };
  prompt.phase = "resolved";
  prompt.wasCorrect = false;
  prompt.resolvedMessage = message;
  return { nextState, tone: "warning", text: message };
}

function submitOnEnter(
  event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  onSubmit: () => void,
  disabled = false
) {
  if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || disabled) {
    return;
  }

  event.preventDefault();
  onSubmit();
}

function isGameId(value: unknown): value is GameId {
  return typeof value === "string" && ALL_GAME_ID_SET.has(value as GameId);
}

function cleanGameIdList(value: unknown): GameId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<GameId>();
  return value.filter((entry): entry is GameId => {
    if (!isGameId(entry) || seen.has(entry)) {
      return false;
    }

    seen.add(entry);
    return true;
  });
}

function cleanSavedEventDefinitions(value: unknown): SavedEventDefinition[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  return value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const definition = entry as Partial<SavedEventDefinition>;
      const id =
        typeof definition.id === "string" && definition.id.trim()
          ? definition.id
          : `event-definition-${index + 1}`;
      const gameIds = cleanGameIdList(definition.gameIds);

      if (seen.has(id) || gameIds.length === 0) {
        return null;
      }

      seen.add(id);
      return {
        id,
        name:
          typeof definition.name === "string" && definition.name.trim()
            ? definition.name
            : `Saved Event ${index + 1}`,
        gameIds
      };
    })
    .filter((entry): entry is SavedEventDefinition => entry !== null);
}

function cleanChallengeRatings(value: unknown): Partial<Record<GameId, ChallengeRating>> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const input = value as Partial<Record<GameId, Partial<ChallengeRating>>>;
  const ratings: Partial<Record<GameId, ChallengeRating>> = {};

  ALL_GAME_IDS.forEach((mode) => {
    const rating = input[mode];

    if (!rating || typeof rating !== "object") {
      return;
    }

    const totalStars = Math.max(0, Math.round(Number(rating.totalStars)));
    const ratingCount = Math.max(0, Math.round(Number(rating.ratingCount)));

    if (Number.isFinite(totalStars) && Number.isFinite(ratingCount) && ratingCount > 0 && totalStars > 0) {
      ratings[mode] = {
        totalStars,
        ratingCount
      };
    }
  });

  return ratings;
}

function createEmptyGamePlayStats(): GamePlayStats {
  return {
    totalPlays: 0,
    individualPlays: 0,
    teamPlays: 0,
    eventPlays: 0,
    completedPlays: 0,
    totalPrompts: 0,
    totalMissedPrompts: 0,
    totalIncorrectAttempts: 0,
    totalScore: 0,
    bestScore: 0,
    lastPlayedAt: null,
    missedPrompts: []
  };
}

function cleanMissedPromptStats(value: unknown): MissedPromptStat[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): MissedPromptStat | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const prompt = entry as Partial<MissedPromptStat>;
      if (typeof prompt.itemId !== "string" || !prompt.itemId.trim() || typeof prompt.label !== "string" || !prompt.label.trim()) {
        return null;
      }

      return {
        itemId: prompt.itemId.trim(),
        label: prompt.label.trim(),
        reference: typeof prompt.reference === "string" && prompt.reference.trim() ? prompt.reference.trim() : undefined,
        misses: Math.max(1, Math.round(Number(prompt.misses) || 1))
      };
    })
    .filter((entry): entry is MissedPromptStat => entry !== null)
    .slice(0, 60);
}

function cleanGamePlayStats(value: unknown): Partial<Record<GameId, GamePlayStats>> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const input = value as Partial<Record<GameId, Partial<GamePlayStats>>>;
  const cleaned: Partial<Record<GameId, GamePlayStats>> = {};

  ALL_GAME_IDS.forEach((mode) => {
    const stats = input[mode];
    if (!stats || typeof stats !== "object") {
      return;
    }

    cleaned[mode] = {
      totalPlays: Math.max(0, Math.round(Number(stats.totalPlays) || 0)),
      individualPlays: Math.max(0, Math.round(Number(stats.individualPlays) || 0)),
      teamPlays: Math.max(0, Math.round(Number(stats.teamPlays) || 0)),
      eventPlays: Math.max(0, Math.round(Number(stats.eventPlays) || 0)),
      completedPlays: Math.max(0, Math.round(Number(stats.completedPlays) || 0)),
      totalPrompts: Math.max(0, Math.round(Number(stats.totalPrompts) || 0)),
      totalMissedPrompts: Math.max(0, Math.round(Number(stats.totalMissedPrompts) || 0)),
      totalIncorrectAttempts: Math.max(0, Math.round(Number(stats.totalIncorrectAttempts) || 0)),
      totalScore: Math.max(0, Math.round(Number(stats.totalScore) || 0)),
      bestScore: Math.max(0, Math.round(Number(stats.bestScore) || 0)),
      lastPlayedAt: typeof stats.lastPlayedAt === "string" ? stats.lastPlayedAt : null,
      missedPrompts: cleanMissedPromptStats(stats.missedPrompts)
    };
  });

  return cleaned;
}

function cleanFeedbackEndpoint(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_FEEDBACK_ENDPOINT;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return DEFAULT_FEEDBACK_ENDPOINT;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (url.protocol === "https:" && (host === "forminit.com" || host === "getform.io")) {
      return url.toString();
    }
  } catch (error) {
    return DEFAULT_FEEDBACK_ENDPOINT;
  }

  return DEFAULT_FEEDBACK_ENDPOINT;
}

function cleanDifficultyFilter(value: unknown): DifficultyFilter {
  return value === "easy" || value === "medium" || value === "hard" || value === "mixed" ? value : "mixed";
}

function cleanTimerPreset(value: unknown): TimerPreset {
  return value === "off" ||
    value === "beginner" ||
    value === "standard" ||
    value === "advanced" ||
    value === "expert" ||
    value === "custom"
    ? value
    : "standard";
}

function cleanDisplayMode(value: unknown): DisplayMode {
  return value === "projector" ? "projector" : "normal";
}

function cleanContentPackId(value: unknown): ContentPackId {
  return typeof value === "string" && CONTENT_PACK_IDS.includes(value as ContentPackId)
    ? (value as ContentPackId)
    : "core";
}

function getTimerPresetSeconds(preset: Exclude<TimerPreset, "off" | "custom">): Record<GameId, number> {
  const presetSeconds = TIMER_PRESET_SECONDS[preset];
  return ALL_GAME_IDS.reduce((timers, mode) => {
    timers[mode] = QUICK_CHOICE_TIMER_GAMES.has(mode)
      ? presetSeconds.quick
      : VERSE_TIMER_GAMES.has(mode)
        ? presetSeconds.verse
        : presetSeconds.standard;
    return timers;
  }, {} as Record<GameId, number>);
}

function cleanAppSettings(value: unknown): Partial<PersistedAppSettings> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const input = value as Partial<PersistedAppSettings>;
  const timers = { ...DEFAULT_CHALLENGE_TIMER_SECONDS };

  if (input.challengeTimerSeconds && typeof input.challengeTimerSeconds === "object") {
    ALL_GAME_IDS.forEach((mode) => {
      const parsed = Number((input.challengeTimerSeconds as Partial<Record<GameId, number>>)[mode]);
      if (Number.isFinite(parsed)) {
        timers[mode] = Math.min(1800, Math.max(5, Math.round(parsed)));
      }
    });
  }

  return {
    colorTheme: APP_THEMES.includes(input.colorTheme as AppTheme) ? input.colorTheme : "classic",
    participantMode: input.participantMode === "teams" ? "teams" : "individual",
    timerEnabled: typeof input.timerEnabled === "boolean" ? input.timerEnabled : true,
    challengeTimerSeconds: timers,
    useVerseSecondsPerWord:
      typeof input.useVerseSecondsPerWord === "boolean" ? input.useVerseSecondsPerWord : true,
    verseScrambleSecondsPerWord:
      Number.isFinite(Number(input.verseScrambleSecondsPerWord))
        ? Math.min(60, Math.max(1, Math.round(Number(input.verseScrambleSecondsPerWord))))
        : DEFAULT_VERSE_SCRAMBLE_SECONDS_PER_WORD,
    eventName:
      typeof input.eventName === "string" && input.eventName.trim()
        ? input.eventName
        : "Bible Challenge Event",
    selectedEventGameIds: cleanGameIdList(input.selectedEventGameIds),
    savedEventDefinitions: cleanSavedEventDefinitions(input.savedEventDefinitions),
    challengeRatings: cleanChallengeRatings(input.challengeRatings),
    showChallengeRatings: typeof input.showChallengeRatings === "boolean" ? input.showChallengeRatings : true,
    gameStats: cleanGamePlayStats(input.gameStats),
    feedbackEndpoint: cleanFeedbackEndpoint(input.feedbackEndpoint),
    showStudyNotes: typeof input.showStudyNotes === "boolean" ? input.showStudyNotes : true,
    difficultyFilter: cleanDifficultyFilter(input.difficultyFilter),
    timerPreset: cleanTimerPreset(input.timerPreset),
    displayMode: cleanDisplayMode(input.displayMode),
    defaultContentPackId: cleanContentPackId(input.defaultContentPackId)
  };
}

export function App() {
  const [gameId, setGameId] = useState<GameId>("five-guesses");
  // gameId itself always holds a valid GameId (used for timer/setup lookups before any
  // card has ever been picked), but the home screen should not visually highlight any
  // card as "active" until the player has actually chosen one — hasChosenGame tracks
  // that separately rather than making gameId nullable everywhere it's read.
  const [hasChosenGame, setHasChosenGame] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [infoGameId, setInfoGameId] = useState<GameId | null>(null);
  const [participantMode, setParticipantMode] = useState<ParticipantMode>("individual");
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES);
  const [playerColors, setPlayerColors] = useState<string[]>(DEFAULT_PLAYER_COLORS);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [teams, setTeams] = useState<TeamSetup[]>(DEFAULT_TEAMS);
  const [colorTheme, setColorTheme] = useState<AppTheme>("classic");
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("appearance");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerPreset, setTimerPreset] = useState<TimerPreset>("standard");
  const [challengeTimerSeconds, setChallengeTimerSeconds] =
    useState<Record<GameId, number>>(DEFAULT_CHALLENGE_TIMER_SECONDS);
  const [useVerseSecondsPerWord, setUseVerseSecondsPerWord] = useState(true);
  const [verseScrambleSecondsPerWord, setVerseScrambleSecondsPerWord] = useState(
    DEFAULT_VERSE_SCRAMBLE_SECONDS_PER_WORD
  );
  const [showStudyNotes, setShowStudyNotes] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("mixed");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal");
  const [defaultContentPackId, setDefaultContentPackId] = useState<ContentPackId>("core");
  const [activeContentPackId, setActiveContentPackId] = useState<ContentPackId>("core");
  const [customContentPacks, setCustomContentPacks] = useState<CustomContentPack[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [eventScoringEnabled, setEventScoringEnabled] = useState(false);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [isEventEndedEarly, setIsEventEndedEarly] = useState(false);
  const [eventName, setEventName] = useState("Bible Challenge Event");
  const [selectedEventGameIds, setSelectedEventGameIds] = useState<GameId[]>([]);
  const [completedEventGameIds, setCompletedEventGameIds] = useState<GameId[]>([]);
  const [eventScores, setEventScores] = useState<Record<string, EventScoreEntry>>({});
  const [creditedChallengeIds, setCreditedChallengeIds] = useState<string[]>([]);
  const [playedSessionGameIds, setPlayedSessionGameIds] = useState<GameId[]>([]);
  const [savedEventDefinitions, setSavedEventDefinitions] = useState<SavedEventDefinition[]>([]);
  const [selectedSavedEventDefinitionId, setSelectedSavedEventDefinitionId] = useState("");
  const [challengeRatings, setChallengeRatings] = useState<Partial<Record<GameId, ChallengeRating>>>({});
  const [showChallengeRatings, setShowChallengeRatings] = useState(true);
  const [ratingGameId, setRatingGameId] = useState<GameId | null>(null);
  const [gameStats, setGameStats] = useState<Partial<Record<GameId, GamePlayStats>>>({});
  const [recordedStatsChallengeIds, setRecordedStatsChallengeIds] = useState<string[]>([]);
  const [sessionMisses, setSessionMisses] = useState<Record<string, MissedPromptStat[]>>({});
  const [feedbackEndpoint, setFeedbackEndpoint] = useState(DEFAULT_FEEDBACK_ENDPOINT);
  const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hasLoadedAppSettings, setHasLoadedAppSettings] = useState(false);
  const [settingsWarning, setSettingsWarning] = useState("");
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [lastUndoState, setLastUndoState] = useState<SessionState | null>(null);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [isGameHelpOpen, setIsGameHelpOpen] = useState(false);
  const [isAppHelpOpen, setIsAppHelpOpen] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [manualScoreInput, setManualScoreInput] = useState("");
  const [dismissedStudyNoteKey, setDismissedStudyNoteKey] = useState<string | null>(null);
  const [guessText, setGuessText] = useState("");
  const [wordLadderDictionary, setWordLadderDictionary] = useState<ReadonlySet<string> | null>(null);
  const [scriptureLetter, setScriptureLetter] = useState("");
  const [scriptureSolveText, setScriptureSolveText] = useState("");
  const [cryptogramLetter, setCryptogramLetter] = useState("");
  const [cryptogramSolveText, setCryptogramSolveText] = useState("");
  const [flashMessage, setFlashMessage] = useState<FlashMessage>({
    tone: "info",
    text: "Choose a game, choose player mode, then start."
  });
  const audioManagerRef = useRef<AudioManager | null>(null);
  const previousRoundStartKeyRef = useRef<string | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [hasLoadedAudioSettings, setHasLoadedAudioSettings] = useState(false);
  const [audioWarning, setAudioWarning] = useState("");
  const [isMusicPreviewPlaying, setIsMusicPreviewPlaying] = useState(false);

  if (!audioManagerRef.current) {
    audioManagerRef.current = new AudioManager();
  }

  const audioManager = audioManagerRef.current;

  const activeGuessKey = getActiveGuessKey(sessionState);
  const roundStartKey = getRoundStartKey(sessionState);
  const activeTimerSeconds = getTimerDurationSeconds(
    sessionState,
    gameId,
    challengeTimerSeconds,
    useVerseSecondsPerWord,
    verseScrambleSecondsPerWord
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadCustomContent() {
      if (!window.desktopHost?.listCustomContentPacks) {
        return;
      }

      try {
        const packs = await normalizeCustomContentPacks(await window.desktopHost.listCustomContentPacks());

        if (!isCancelled) {
          registerCustomContentPacks(packs);
          setCustomContentPacks(packs);
        }
      } catch {
        if (!isCancelled) {
          registerCustomContentPacks([]);
          setCustomContentPacks([]);
        }
      }
    }

    void loadCustomContent();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    loadWordLadderDictionary()
      .then((dictionary) => {
        if (!isCancelled) {
          setWordLadderDictionary(dictionary);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setWordLadderDictionary(new Set());
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  function submitWordLadderStepWithDictionary(state: WordLadderState, guess: string): ActionResult {
    if (!wordLadderDictionary) {
      throw new Error("The Word Ladder dictionary is still loading. Try again in a moment.");
    }

    return submitWordLadderStep(state, guess, wordLadderDictionary);
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadAppSettings() {
      try {
        const savedSettings = window.desktopHost?.getAppSettings
          ? await window.desktopHost.getAppSettings()
          : JSON.parse(window.localStorage.getItem("bibleChallengeAppSettings") ?? "null");
        const cleaned = cleanAppSettings(savedSettings);

        if (isCancelled) {
          return;
        }

        if (cleaned.colorTheme) {
          setColorTheme(cleaned.colorTheme);
        }
        if (cleaned.participantMode) {
          setParticipantMode(cleaned.participantMode);
        }
        // playerNames/playerColors/teams are deliberately NOT restored here — every
        // launch starts from the in-memory defaults (a single "Player 1") regardless
        // of what was set up last session, per the app's player-persistence policy.
        if (typeof cleaned.timerEnabled === "boolean") {
          setTimerEnabled(cleaned.timerEnabled);
        }
        if (cleaned.challengeTimerSeconds) {
          setChallengeTimerSeconds(cleaned.challengeTimerSeconds);
        }
        if (typeof cleaned.useVerseSecondsPerWord === "boolean") {
          setUseVerseSecondsPerWord(cleaned.useVerseSecondsPerWord);
        }
        if (typeof cleaned.verseScrambleSecondsPerWord === "number") {
          setVerseScrambleSecondsPerWord(cleaned.verseScrambleSecondsPerWord);
        }
        if (cleaned.eventName) {
          setEventName(cleaned.eventName);
        }
        if (cleaned.selectedEventGameIds) {
          setSelectedEventGameIds(cleaned.selectedEventGameIds);
        }
        if (cleaned.savedEventDefinitions) {
          setSavedEventDefinitions(cleaned.savedEventDefinitions);
        }
        if (cleaned.challengeRatings) {
          setChallengeRatings(cleaned.challengeRatings);
        }
        if (typeof cleaned.showChallengeRatings === "boolean") {
          setShowChallengeRatings(cleaned.showChallengeRatings);
        }
        if (cleaned.gameStats) {
          setGameStats(cleaned.gameStats);
        }
        if (typeof cleaned.feedbackEndpoint === "string") {
          setFeedbackEndpoint(cleaned.feedbackEndpoint);
        }
        if (typeof cleaned.showStudyNotes === "boolean") {
          setShowStudyNotes(cleaned.showStudyNotes);
        }
        if (cleaned.difficultyFilter) {
          setDifficultyFilter(cleaned.difficultyFilter);
        }
        if (cleaned.timerPreset) {
          setTimerPreset(cleaned.timerPreset);
        }
        if (cleaned.displayMode) {
          setDisplayMode(cleaned.displayMode);
        }
        if (cleaned.defaultContentPackId) {
          setDefaultContentPackId(cleaned.defaultContentPackId);
          setActiveContentPackId(cleaned.defaultContentPackId);
        }
      } catch (error) {
        if (!isCancelled) {
          setSettingsWarning("App settings could not be loaded. Defaults are active for this session.");
        }
      } finally {
        if (!isCancelled) {
          setHasLoadedAppSettings(true);
        }
      }
    }

    void loadAppSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedAppSettings) {
      return;
    }

    const settings: PersistedAppSettings = {
      colorTheme,
      participantMode,
      timerEnabled,
      challengeTimerSeconds,
      useVerseSecondsPerWord,
      verseScrambleSecondsPerWord,
      eventName,
      selectedEventGameIds,
      savedEventDefinitions,
      challengeRatings,
      showChallengeRatings,
      gameStats,
      feedbackEndpoint,
      showStudyNotes,
      difficultyFilter,
      timerPreset,
      displayMode,
      defaultContentPackId
    };

    const timeoutId = window.setTimeout(() => {
      if (window.desktopHost?.saveAppSettings) {
        void window.desktopHost.saveAppSettings(settings).catch(() => {
          setSettingsWarning("App settings could not be saved.");
        });
        return;
      }

      window.localStorage.setItem("bibleChallengeAppSettings", JSON.stringify(settings));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    challengeTimerSeconds,
    challengeRatings,
    colorTheme,
    eventName,
    feedbackEndpoint,
    gameStats,
    defaultContentPackId,
    difficultyFilter,
    displayMode,
    hasLoadedAppSettings,
    participantMode,
    savedEventDefinitions,
    selectedEventGameIds,
    showChallengeRatings,
    showStudyNotes,
    timerEnabled,
    timerPreset,
    useVerseSecondsPerWord,
    verseScrambleSecondsPerWord
  ]);

  useEffect(() => {
    function updateOnlineState() {
      setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    }

    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    updateOnlineState();

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadAudioSettings() {
      if (!window.audioHost) {
        setHasLoadedAudioSettings(true);
        return;
      }

      try {
        const savedSettings = await window.audioHost.getAudioSettings();

        if (!isCancelled) {
          setAudioSettings(normalizeAudioSettings(savedSettings));
        }
      } catch (error) {
        if (!isCancelled) {
          setAudioWarning("Audio settings could not be loaded. Defaults are active for this session.");
        }
      } finally {
        if (!isCancelled) {
          setHasLoadedAudioSettings(true);
        }
      }
    }

    void loadAudioSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    audioManager.setBackgroundErrorHandler((message) => {
      setAudioWarning(message);
      setIsMusicPreviewPlaying(false);
      setAudioSettings((current) => ({
        ...current,
        backgroundMusicEnabled: false
      }));
    });

    return () => audioManager.setBackgroundErrorHandler(null);
  }, [audioManager]);

  useEffect(() => {
    audioManager.updateSettings(audioSettings);
  }, [audioManager, audioSettings]);

  useEffect(() => {
    if (!hasLoadedAudioSettings || !window.audioHost) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void window.audioHost?.saveAudioSettings(audioSettings).catch(() => {
        setAudioWarning("Audio settings could not be saved.");
      });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [audioSettings, hasLoadedAudioSettings]);

  useEffect(() => {
    audioManager.updateBackgroundPlayback(sessionState !== null || isMusicPreviewPlaying, isMusicPreviewPlaying);
  }, [audioManager, audioSettings, isMusicPreviewPlaying, sessionState]);

  useEffect(() => {
    if (isSettingsOpen) {
      return;
    }

    setIsMusicPreviewPlaying(false);
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!roundStartKey) {
      previousRoundStartKeyRef.current = null;
      return;
    }

    if (previousRoundStartKeyRef.current !== roundStartKey) {
      previousRoundStartKeyRef.current = roundStartKey;
      audioManager.playEffect("roundStart");
    }
  }, [audioManager, roundStartKey]);

  useEffect(() => {
    setTimeRemaining(activeTimerSeconds);
  }, [activeGuessKey, activeTimerSeconds, timerEnabled]);

  useEffect(() => {
    if (!activeGuessKey || !timerEnabled || isTimerPaused || timeRemaining <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimeRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [activeGuessKey, isTimerPaused, timerEnabled, timeRemaining]);

  useEffect(() => {
    if (!timerEnabled || isTimerPaused || timeRemaining !== 0 || !activeGuessKey || !sessionState) {
      return;
    }

    let didAutoPass = false;
    audioManager.playEffect("timerExpired");

    if (sessionState.gameId === "scripture-puzzles" && !sessionState.currentPrompt.isComplete) {
      handleAction(() => passScriptureTurn(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "bible-timeline") {
      handleAction(() => revealTimelineRound(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "verse-scramble") {
      handleAction(() => passVerseScramble(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "bible-connections") {
      handleAction(() => passConnectionTurn(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "before-or-after") {
      handleAction(() => passBeforeOrAfter(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "bible-books-relay") {
      handleAction(() => passBibleBooksRelay(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "prophecy-clue-ladder") {
      handleAction(() => revealProphecyClueOnTimer(sessionState), null);
      didAutoPass = true;
    } else if (sessionState.gameId === "word-ladder") {
      // Resolves the whole ladder outright rather than passing to the next participant —
      // the round timer covers the entire ladder, so expiry ends it, it doesn't hand off a
      // fresh clock the way passWordLadderTurn's explicit steal does.
      handleAction(() => resolveWordLadderOnTimer(sessionState), null);
    }

    if (didAutoPass) {
      setTimeRemaining(activeTimerSeconds);
    }
  }, [activeGuessKey, activeTimerSeconds, audioManager, isTimerPaused, sessionState, timeRemaining, timerEnabled]);

  useEffect(() => {
    if (!sessionState || sessionState.status !== "completed") {
      return;
    }

    setPlayedSessionGameIds((current) =>
      current.includes(sessionState.gameId) ? current : [...current, sessionState.gameId]
    );

    if (!activeChallengeId || recordedStatsChallengeIds.includes(activeChallengeId)) {
      return;
    }

    const finalMiss = getMissedPromptFromState(sessionState);
    const misses = mergeMissedPromptStats(sessionMisses[activeChallengeId] ?? [], finalMiss ? [finalMiss] : []);
    const totalScore = getSessionTotalScore(sessionState);

    setGameStats((current) => {
      const existing = current[sessionState.gameId] ?? createEmptyGamePlayStats();
      return {
        ...current,
        [sessionState.gameId]: {
          ...existing,
          completedPlays: existing.completedPlays + 1,
          totalPrompts: existing.totalPrompts + sessionState.totalPrompts,
          totalMissedPrompts: existing.totalMissedPrompts + misses.reduce((total, miss) => total + miss.misses, 0),
          totalIncorrectAttempts: existing.totalIncorrectAttempts + getSessionIncorrectAttempts(sessionState),
          totalScore: existing.totalScore + totalScore,
          bestScore: Math.max(existing.bestScore, totalScore),
          lastPlayedAt: new Date().toISOString(),
          missedPrompts: mergeMissedPromptStats(existing.missedPrompts, misses)
        }
      };
    });
    setRecordedStatsChallengeIds((current) => [...current, activeChallengeId]);
  }, [activeChallengeId, eventScoringEnabled, recordedStatsChallengeIds, sessionMisses, sessionState]);

  useEffect(() => {
    if (
      !eventScoringEnabled ||
      !activeChallengeId ||
      !sessionState ||
      sessionState.status !== "completed" ||
      creditedChallengeIds.includes(activeChallengeId) ||
      completedEventGameIds.includes(sessionState.gameId)
    ) {
      return;
    }

    const completedStandings = getStandings(sessionState);
    setEventScores((current) => {
      const nextScores = { ...current };

      completedStandings.forEach((standing) => {
        const key = getEventParticipantKey(sessionState.participantMode, standing.participant.name);
        const existing = nextScores[key];

        nextScores[key] = {
          key,
          participantName: standing.participant.name,
          participantMode: sessionState.participantMode,
          color: standing.participant.color,
          totalScore: (existing?.totalScore ?? 0) + standing.stats.totalScore,
          challengesCompleted: (existing?.challengesCompleted ?? 0) + 1
        };
      });

      return nextScores;
    });
    setCreditedChallengeIds((current) => [...current, activeChallengeId]);
    setCompletedEventGameIds((current) =>
      current.includes(sessionState.gameId) ? current : [...current, sessionState.gameId]
    );
    setFlashMessage({
      tone: "success",
      text: "Challenge score added to the event totals."
    });
  }, [activeChallengeId, completedEventGameIds, creditedChallengeIds, eventScoringEnabled, sessionState]);

  function updateAudioSettings(updater: (current: AudioSettings) => AudioSettings) {
    setAudioWarning("");
    setAudioSettings((current) => normalizeAudioSettings(updater(current)));
  }

  async function handleImportBackgroundMusic() {
    if (!window.audioHost) {
      setAudioWarning("Background music import is only available in the desktop app.");
      return;
    }

    try {
      const result = await window.audioHost.importBackgroundMusic();

      if (result.error) {
        setAudioWarning(result.error);
      } else if (!result.canceled) {
        setAudioWarning("");
      }

      setIsMusicPreviewPlaying(false);
      setAudioSettings(normalizeAudioSettings(result.settings));
    } catch (error) {
      setAudioWarning(error instanceof Error ? error.message : "Background music could not be imported.");
    }
  }

  async function handleRemoveBackgroundMusic() {
    if (!window.audioHost) {
      setAudioWarning("Background music removal is only available in the desktop app.");
      return;
    }

    try {
      const nextSettings = await window.audioHost.removeBackgroundMusic();
      setIsMusicPreviewPlaying(false);
      setAudioWarning("");
      setAudioSettings(normalizeAudioSettings(nextSettings));
    } catch (error) {
      setAudioWarning(error instanceof Error ? error.message : "Background music could not be removed.");
    }
  }

  function handleToggleMusicPreview() {
    setAudioWarning("");
    const isPlaying = audioManager.toggleBackgroundPreview();
    setIsMusicPreviewPlaying(isPlaying);
  }

  function handleAction(action: () => ActionResult, preferredEffect?: SoundEffectName | null) {
    try {
      const previousState = sessionState;
      const result = action();
      if (previousState) {
        setLastUndoState(previousState);
      }
      const missedPrompt = getNewMissedPrompt(previousState, result.nextState);
      if (missedPrompt && activeChallengeId) {
        setSessionMisses((current) => ({
          ...current,
          [activeChallengeId]: mergeMissedPromptStats(current[activeChallengeId] ?? [], [missedPrompt])
        }));
      }
      setSessionState(result.nextState);
      setFlashMessage({
        tone: result.tone,
        text: result.text
      });
      const effectName = getActionSoundEffect(previousState, result, preferredEffect);

      if (effectName) {
        audioManager.playEffect(effectName);
      }

      setGuessText("");
      setScriptureLetter("");
      setScriptureSolveText("");
    } catch (error) {
      setFlashMessage({
        tone: "warning",
        text: error instanceof Error ? error.message : "The action could not be completed."
      });
    }
  }

  async function handleStart(modeToStart: GameId = gameId): Promise<boolean> {
    const nextEventGameId = selectedEventGameIds.find((mode) => !completedEventGameIds.includes(mode)) ?? null;

    if (eventScoringEnabled && isEventEndedEarly) {
      setFlashMessage({
        tone: "warning",
        text: "Reset event progress before starting another event challenge."
      });
      return false;
    }

    if (eventScoringEnabled && !selectedEventGameIds.includes(modeToStart)) {
      setFlashMessage({
        tone: "warning",
        text: "Select that challenge for this event before starting it."
      });
      return false;
    }

    if (eventScoringEnabled && completedEventGameIds.includes(modeToStart)) {
      setFlashMessage({
        tone: "warning",
        text: "That challenge has already been completed in this event."
      });
      return false;
    }

    if (eventScoringEnabled && nextEventGameId && modeToStart !== nextEventGameId) {
      setFlashMessage({
        tone: "warning",
        text: `${GAME_LIBRARY[nextEventGameId].label} is next in this event.`
      });
      return false;
    }

    setIsStartingGame(true);

    try {
      const nextChallengeId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const nextState = await createSessionState({
        gameId: modeToStart,
        participantMode,
        difficulty: difficultyFilter,
        contentSource: activeContentPackId === "custom" ? "custom" : "all",
        individualNames: playerNames,
        individualColors: playerColors,
        teams,
        sessionId: nextChallengeId
      });
      setGameId(modeToStart);
      setGameStats((current) => recordGameStarted(current, modeToStart, participantMode, eventScoringEnabled));
      setSessionState(nextState);
      setLastUndoState(null);
      setIsTimerPaused(false);
      setIsHostControlsOpen(false);
      setDismissedStudyNoteKey(null);
      setSessionMisses((current) => ({
        ...current,
        [nextChallengeId]: []
      }));
      setActiveChallengeId(nextChallengeId);
      setGuessText("");
      setScriptureLetter("");
      setScriptureSolveText("");
      setIsSetupOpen(false);
      setTimeRemaining(
        getTimerDurationSeconds(
          nextState,
          modeToStart,
          challengeTimerSeconds,
          useVerseSecondsPerWord,
          verseScrambleSecondsPerWord
        )
      );
      setFlashMessage({
        tone: "success",
        text: `${GAME_LIBRARY[modeToStart].label} is ready. ${GAME_LIBRARY[modeToStart].setupPrompt}`
      });
      return true;
    } catch (error) {
      setFlashMessage({
        tone: "warning",
        text: error instanceof Error ? error.message : "Unable to start the game."
      });
      return false;
    } finally {
      setIsStartingGame(false);
    }
  }

  function handleChooseGame(mode: GameId) {
    const nextEventGameId = selectedEventGameIds.find((entry) => !completedEventGameIds.includes(entry)) ?? null;

    if (eventScoringEnabled && !eventHasStarted) {
      setFlashMessage({
        tone: "info",
        text: "Use Start Event to open the first event challenge."
      });
      return;
    }

    if (eventScoringEnabled && isEventEndedEarly) {
      setFlashMessage({
        tone: "info",
        text: "This event has ended. Reset event progress to start again."
      });
      return;
    }

    if (eventScoringEnabled && completedEventGameIds.includes(mode)) {
      setFlashMessage({
        tone: "warning",
        text: "That challenge has already been completed in this event."
      });
      return;
    }

    if (eventScoringEnabled && !selectedEventGameIds.includes(mode)) {
      setFlashMessage({
        tone: "warning",
        text: "That challenge is not selected for this event."
      });
      return;
    }

    if (eventScoringEnabled && nextEventGameId && mode !== nextEventGameId) {
      setFlashMessage({
        tone: "warning",
        text: `${GAME_LIBRARY[nextEventGameId].label} is next in this event.`
      });
      return;
    }

    setGameId(mode);
    setHasChosenGame(true);
    setIsSetupOpen(true);
  }

  function handleEventModeChange(isEnabled: boolean) {
    setEventScoringEnabled(isEnabled);
    setIsEventStarted(false);
    setIsEventEndedEarly(false);

    if (isEnabled) {
      setSelectedEventGameIds([]);
      setCompletedEventGameIds([]);
      setEventScores({});
      setCreditedChallengeIds([]);
      setSelectedSavedEventDefinitionId("");
      setFlashMessage({
        tone: "info",
        text: "Event mode enabled. Select challenges in the order they should be played."
      });
    }
  }

  function handleExitGame() {
    void window.desktopHost?.exitApp?.();
  }

  function handleExitToMenu() {
    setSessionState(null);
    setActiveChallengeId(null);
    setLastUndoState(null);
    setIsTimerPaused(false);
    setIsHostControlsOpen(false);
    setDismissedStudyNoteKey(null);
    setGuessText("");
    setScriptureLetter("");
    setScriptureSolveText("");
    setFlashMessage({
      tone: "info",
      text: "Returned to the main menu."
    });
  }

  function updateCurrentScore(update: (score: number) => number, message: string) {
    setSessionState((current) => {
      if (!current) {
        return current;
      }

      const participantId = getCurrentParticipantId(current) ?? current.participants[0]?.id;
      if (!participantId) {
        return current;
      }

      const nextState = structuredClone(current);
      setLastUndoState(current);
      nextState.stats[participantId].totalScore = Math.max(0, update(nextState.stats[participantId].totalScore));
      return nextState;
    });
    setFlashMessage({ tone: "info", text: message });
  }

  function adjustCurrentScore(delta: number) {
    updateCurrentScore((score) => score + delta, `${delta > 0 ? "Added" : "Subtracted"} ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"}.`);
  }

  function setCurrentScoreFromInput() {
    const parsed = Number.parseInt(manualScoreInput, 10);

    if (Number.isNaN(parsed)) {
      setFlashMessage({ tone: "warning", text: "Enter a whole-number score before setting it." });
      return;
    }

    updateCurrentScore(() => parsed, "Score set by host.");
    setManualScoreInput("");
  }

  function undoLastSessionAction() {
    if (!lastUndoState) {
      setFlashMessage({ tone: "info", text: "No scoring action is available to undo." });
      return;
    }

    setSessionState(lastUndoState);
    setLastUndoState(null);
    setFlashMessage({ tone: "info", text: "Last scoring action undone." });
  }

  function endCurrentGame() {
    setSessionState((current) => {
      if (!current) {
        return current;
      }

      const nextState = structuredClone(current);
      setLastUndoState(current);
      nextState.status = "completed";
      return nextState;
    });
    setIsHostControlsOpen(false);
    setFlashMessage({ tone: "info", text: "Host ended the game." });
  }

  async function restartCurrentChallenge() {
    if (!sessionState) {
      return;
    }

    setLastUndoState(sessionState);
    setIsTimerPaused(false);
    setIsHostControlsOpen(false);
    setIsStartingGame(true);

    try {
      const nextChallengeId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const restartedState = await createSessionState({
        gameId: sessionState.gameId,
        participantMode,
        difficulty: difficultyFilter,
        contentSource: activeContentPackId === "custom" ? "custom" : "all",
        individualNames: playerNames,
        individualColors: playerColors,
        teams,
        sessionId: nextChallengeId
      });
      setGameStats((current) =>
        recordGameStarted(current, sessionState.gameId, participantMode, eventScoringEnabled)
      );
      setSessionState(restartedState);
      setSessionMisses((current) => ({
        ...current,
        [nextChallengeId]: []
      }));
      setActiveChallengeId(nextChallengeId);
      setFlashMessage({ tone: "info", text: "Challenge restarted." });
    } catch (error) {
      setFlashMessage({
        tone: "warning",
        text: error instanceof Error ? error.message : "Unable to restart the challenge."
      });
    } finally {
      setIsStartingGame(false);
    }
  }

  function updateChallengeTimerSeconds(gameIdToUpdate: GameId, value: string) {
    const parsed = Number.parseInt(value, 10);
    setTimerPreset("custom");

    if (Number.isNaN(parsed)) {
      setChallengeTimerSeconds((current) => ({
        ...current,
        [gameIdToUpdate]: DEFAULT_CHALLENGE_TIMER_SECONDS[gameIdToUpdate]
      }));
      return;
    }

    setChallengeTimerSeconds((current) => ({
      ...current,
      [gameIdToUpdate]: Math.min(1800, Math.max(5, parsed))
    }));
  }

  function updateVerseScrambleSecondsPerWord(value: string) {
    const parsed = Number.parseInt(value, 10);
    setTimerPreset("custom");

    if (Number.isNaN(parsed)) {
      setVerseScrambleSecondsPerWord(DEFAULT_VERSE_SCRAMBLE_SECONDS_PER_WORD);
      return;
    }

    setVerseScrambleSecondsPerWord(Math.min(60, Math.max(1, parsed)));
  }

  function applyTimerPreset(preset: TimerPreset) {
    setTimerPreset(preset);

    if (preset === "off") {
      setTimerEnabled(false);
      return;
    }

    if (preset === "custom") {
      setTimerEnabled(true);
      return;
    }

    setTimerEnabled(true);
    setUseVerseSecondsPerWord(false);
    setChallengeTimerSeconds(getTimerPresetSeconds(preset));
  }

  function resetEvent() {
    setEventScores({});
    setCreditedChallengeIds([]);
    setCompletedEventGameIds([]);
    setIsEventStarted(false);
    setIsEventEndedEarly(false);
    setFlashMessage({
      tone: "info",
      text: "Event totals reset."
    });
  }

  async function startNextEventChallenge() {
    const nextMode = selectedEventGameIds.find((mode) => !completedEventGameIds.includes(mode)) ?? null;

    if (!eventScoringEnabled || selectedEventGameIds.length === 0) {
      setFlashMessage({
        tone: "warning",
        text: "Select at least one event challenge before starting."
      });
      return;
    }

    if (!nextMode) {
      setFlashMessage({
        tone: "info",
        text: "All selected event challenges are complete."
      });
      return;
    }

    const didStart = await handleStart(nextMode);
    if (didStart) {
      setIsEventStarted(true);
      setIsEventEndedEarly(false);
    }
  }

  function endEventEarly() {
    if (!eventHasStarted || isEventEndedEarly) {
      return;
    }

    if (!window.confirm("End this event early? Current event scores will stay visible until event progress is reset.")) {
      return;
    }

    setIsEventEndedEarly(true);
    setFlashMessage({
      tone: "info",
      text: "Event ended early. Current event scores are final."
    });
  }

  function toggleEventChallenge(mode: GameId) {
    if (completedEventGameIds.includes(mode)) {
      return;
    }

    setSelectedEventGameIds((current) =>
      current.includes(mode) ? current.filter((entry) => entry !== mode) : [...current, mode]
    );
  }

  function moveEventChallenge(mode: GameId, direction: "up" | "down") {
    setSelectedEventGameIds((current) => {
      const index = current.indexOf(mode);
      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || swapIndex < 0 || swapIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  }

  function saveEventDefinition() {
    const name = eventName.trim() || "Untitled Event";

    if (selectedEventGameIds.length === 0) {
      setFlashMessage({
        tone: "warning",
        text: "Select at least one challenge before saving an event definition."
      });
      return;
    }

    const id =
      selectedSavedEventDefinitionId ||
      `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const definition: SavedEventDefinition = {
      id,
      name,
      gameIds: selectedEventGameIds
    };

    setSavedEventDefinitions((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === id);

      if (existingIndex < 0) {
        return [...current, definition];
      }

      return current.map((entry) => (entry.id === id ? definition : entry));
    });
    setSelectedSavedEventDefinitionId(id);
    setFlashMessage({
      tone: "success",
      text: "Event definition saved."
    });
  }

  function loadEventDefinition(id: string) {
    setSelectedSavedEventDefinitionId(id);
    const definition = savedEventDefinitions.find((entry) => entry.id === id);

    if (!definition) {
      return;
    }

    setEventName(definition.name);
    setSelectedEventGameIds(definition.gameIds);
    setCompletedEventGameIds([]);
    setEventScores({});
    setCreditedChallengeIds([]);
    setIsEventStarted(false);
    setIsEventEndedEarly(false);
    setFlashMessage({
      tone: "info",
      text: `${definition.name} loaded. Event progress was reset.`
    });
  }

  function deleteEventDefinition() {
    if (!selectedSavedEventDefinitionId) {
      return;
    }

    setSavedEventDefinitions((current) => current.filter((entry) => entry.id !== selectedSavedEventDefinitionId));
    setSelectedSavedEventDefinitionId("");
    setFlashMessage({
      tone: "info",
      text: "Event definition deleted."
    });
  }

  function getFeedbackEmailBody(draft: FeedbackDraft): string {
    const challengeLabel = draft.gameId ? GAME_LIBRARY[draft.gameId].label : "Home Page";

    return [
      `Challenge: ${challengeLabel}`,
      `Event: ${eventScoringEnabled ? eventName.trim() || "Untitled Event" : "Single challenge"}`,
      `Name: ${draft.name.trim() || "Not provided"}`,
      `Email: ${draft.email.trim() || "Not provided"}`,
      `Rating: ${draft.rating ?? "Not provided"}`,
      "",
      "Feedback:",
      draft.message.trim()
    ].join("\n");
  }

  function buildFeedbackFormData(draft: FeedbackDraft): FormData {
    const challengeLabel = draft.gameId ? GAME_LIBRARY[draft.gameId].label : "Home Page";
    const formData = new FormData();

    if (draft.name.trim()) {
      formData.append("fi-sender-fullName", draft.name.trim());
    }

    if (draft.email.trim()) {
      formData.append("fi-sender-email", draft.email.trim());
    }

    if (draft.rating !== null) {
      formData.append("fi-rating-experience", String(draft.rating));
    }

    formData.append("fi-text-message", draft.message.trim());
    formData.append("fi-text-challenge", challengeLabel);
    formData.append("fi-text-challengeId", draft.gameId ?? "home");
    formData.append("fi-text-event", eventScoringEnabled ? eventName.trim() || "Untitled Event" : "Single challenge");
    formData.append("fi-text-source", "Bible Challenge desktop app");
    formData.append("fi-text-submittedAt", new Date().toISOString());

    return formData;
  }

  function handleFeedback(mode?: GameId) {
    const challengeLabel = mode ? GAME_LIBRARY[mode].label : "Home Page";
    setFeedbackDraft({
      gameId: mode ?? null,
      name: "",
      email: "",
      rating: null,
      message: ""
    });
    setFeedbackStatus(`Feedback for ${challengeLabel}`);
  }

  async function submitFeedbackForm() {
    if (!feedbackDraft || isSubmittingFeedback) {
      return;
    }

    const endpoint = cleanFeedbackEndpoint(feedbackEndpoint);

    if (!endpoint) {
      setFeedbackStatus("Check the Forminit endpoint in Settings, or use Open Email/Copy Text.");
      return;
    }

    if (!feedbackDraft.message.trim()) {
      setFeedbackStatus("Add a message before sending.");
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackStatus("Sending feedback...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: buildFeedbackFormData(feedbackDraft)
      });

      if (!response.ok) {
        throw new Error(`Feedback endpoint returned ${response.status}.`);
      }

      setFeedbackDraft(null);
      setFeedbackStatus("");
      setFlashMessage({
        tone: "success",
        text: "Feedback sent."
      });
    } catch (error) {
      setFeedbackStatus("Feedback could not be sent. Use Open Email or Copy Text as a fallback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  async function sendFeedbackEmail() {
    if (!feedbackDraft) {
      return;
    }

    const challengeLabel = feedbackDraft.gameId ? GAME_LIBRARY[feedbackDraft.gameId].label : "Home Page";
    const subject = `Bible Challenge Feedback: ${challengeLabel}`;
    const body = getFeedbackEmailBody(feedbackDraft);
    const url = `mailto:mkunze8187@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      if (window.desktopHost?.openExternal) {
        await window.desktopHost.openExternal(url);
      } else {
        window.location.href = url;
      }

      setFeedbackStatus("Email composer opened. If it did not open correctly, use Copy Text.");
    } catch (error) {
      setFeedbackStatus("Email could not be opened. Use Copy Text and paste it into your mail app.");
    }
  }

  async function copyFeedbackText() {
    if (!feedbackDraft) {
      return;
    }

    const challengeLabel = feedbackDraft.gameId ? GAME_LIBRARY[feedbackDraft.gameId].label : "Home Page";
    const text = [
      "To: mkunze8187@gmail.com",
      `Subject: Bible Challenge Feedback: ${challengeLabel}`,
      "",
      getFeedbackEmailBody(feedbackDraft)
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setFeedbackStatus("Feedback text copied.");
    } catch (error) {
      setFeedbackStatus("Copy failed. Select the text and copy it manually.");
    }
  }

  function submitChallengeRating(mode: GameId, stars: number) {
    setChallengeRatings((current) => {
      const existing = current[mode] ?? { totalStars: 0, ratingCount: 0 };

      return {
        ...current,
        [mode]: {
          totalStars: existing.totalStars + stars,
          ratingCount: existing.ratingCount + 1
        }
      };
    });
    setFlashMessage({
      tone: "success",
      text: `${GAME_LIBRARY[mode].label} rated ${stars} star${stars === 1 ? "" : "s"}.`
    });
  }

  function updatePlayerName(index: number, value: string) {
    setPlayerNames((current) => current.map((name, currentIndex) => (currentIndex === index ? value : name)));
  }

  function updateSessionParticipantColor(index: number, color: string, mode: ParticipantMode) {
    setSessionState((current) => {
      if (!current || current.participantMode !== mode || !current.participants[index]) {
        return current;
      }

      const nextState = structuredClone(current);
      nextState.participants[index].color = color;
      return nextState;
    });
  }

  function updatePlayerColor(index: number, color: string) {
    setPlayerColors((current) => current.map((entry, currentIndex) => (currentIndex === index ? color : entry)));
    updateSessionParticipantColor(index, color, "individual");
  }

  function addPlayer() {
    const trimmed = newPlayerName.trim();

    if (!trimmed) {
      setFlashMessage({
        tone: "warning",
        text: "Enter a player name before adding it."
      });
      return;
    }

    setPlayerNames((current) => [...current, trimmed]);
    setPlayerColors((current) => [...current, getNextParticipantColor(current.length)]);
    setNewPlayerName("");
  }

  function removePlayer(index: number) {
    setPlayerNames((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPlayerColors((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function updateTeamName(index: number, value: string) {
    setTeams((current) =>
      current.map((team, currentIndex) => (currentIndex === index ? { ...team, teamName: value } : team))
    );
  }

  function updateTeamColor(index: number, color: string) {
    setTeams((current) =>
      current.map((team, currentIndex) => (currentIndex === index ? { ...team, color } : team))
    );
    updateSessionParticipantColor(index, color, "teams");
  }

  function updateTeamMember(teamIndex: number, memberIndex: number, value: string) {
    setTeams((current) =>
      current.map((team, currentTeamIndex) =>
        currentTeamIndex === teamIndex
          ? {
              ...team,
              members: team.members.map((member, currentMemberIndex) =>
                currentMemberIndex === memberIndex ? value : member
              )
            }
          : team
      )
    );
  }

  function addTeam() {
    setTeams((current) => [
      ...current,
      {
        teamName: `Team ${current.length + 1}`,
        members: ["New Member"],
        color: getNextParticipantColor(current.length)
      }
    ]);
  }

  function removeTeam(index: number) {
    setTeams((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function addTeamMember(teamIndex: number) {
    setTeams((current) =>
      current.map((team, currentIndex) => {
        if (currentIndex !== teamIndex) {
          return team;
        }

        if (team.members.length >= 5) {
          setFlashMessage({
            tone: "warning",
            text: `${team.teamName} already has five members.`
          });
          return team;
        }

        return {
          ...team,
          members: [...team.members, `Member ${team.members.length + 1}`]
        };
      })
    );
  }

  function removeTeamMember(teamIndex: number, memberIndex: number) {
    setTeams((current) =>
      current.map((team, currentIndex) =>
        currentIndex === teamIndex
          ? {
              ...team,
              members: team.members.filter((_, currentMemberIndex) => currentMemberIndex !== memberIndex)
            }
          : team
      )
    );
  }

  const currentGame = GAME_LIBRARY[gameId];
  const standings = sessionState ? getStandings(sessionState) : [];
  const uniqueWinner = sessionState?.status === "completed" ? getUniqueWinner(sessionState) : null;
  const currentParticipantId = sessionState ? getCurrentParticipantId(sessionState) : null;
  const eventStandings = sortEventScores(eventScores);
  const eventChallengeCount = completedEventGameIds.length;
  const selectedEventChallengeCount = selectedEventGameIds.length;
  const savedRatingCount = Object.values(challengeRatings).reduce(
    (total, rating) => total + (rating?.ratingCount ?? 0),
    0
  );
  const customGameIds = Array.from(
    new Set(customContentPacks.flatMap((pack) => pack.games.map((customGame) => customGame.gameType)))
  );
  const visibleGameIds = eventScoringEnabled
    ? selectedEventGameIds
    : activeContentPackId === "custom"
      ? customGameIds
      : ALL_GAME_IDS.filter((mode) => activeContentPackId === "all" || GAME_CONTENT_PACKS[mode].includes(activeContentPackId));
  const nextEventGameId = selectedEventGameIds.find((mode) => !completedEventGameIds.includes(mode)) ?? null;
  const eventHasStarted = isEventStarted || completedEventGameIds.length > 0 || eventStandings.length > 0;
  const showChallengeSplash = Boolean(sessionState && sessionState.status === "completed" && standings.length > 1);
  const isEventComplete =
    eventScoringEnabled && selectedEventGameIds.length > 0 && completedEventGameIds.length >= selectedEventGameIds.length;
  const isEventFinished = isEventComplete || isEventEndedEarly;
  const eventActionLabel = eventHasStarted ? "Next Challenge" : "Start Event";
  const eventActionDisabled =
    isStartingGame || isEventFinished || selectedEventGameIds.length === 0 || nextEventGameId === null;
  const eventActionStatus = isEventEndedEarly
    ? "Event ended early"
    : isEventComplete
      ? "Event complete"
      : nextEventGameId
        ? `${eventHasStarted ? "Next" : "First"}: ${GAME_LIBRARY[nextEventGameId].label}`
        : "No challenges selected";
  const studyNoteContent = getStudyNoteContent(sessionState);
  const shouldShowStudyNote =
    showStudyNotes && studyNoteContent !== null && dismissedStudyNoteKey !== studyNoteContent.key;
  const uniqueEventWinner =
    eventStandings.length === 1 || (eventStandings[0] && eventStandings[1] && eventStandings[0].totalScore > eventStandings[1].totalScore)
      ? eventStandings[0]
      : null;

  return (
    <div className={`app-shell app-theme-${colorTheme} app-display-${displayMode} ${sessionState ? "app-shell-play" : ""}`}>
      <div className="glow glow-left" />
      <div className="glow glow-right" />
      <header className="topbar">
        <div className="brand-lockup">
          <img className="brand-logo" src={bibleChallengeLogo} alt="" />
          <div>
          <p className="kicker">Scripture Learning Challenge</p>
          <h1>Bible Challenge</h1>
          <p className="subtitle">
            Self-hosted Bible recall, scripture practice, and team-friendly learning modes.
          </p>
          </div>
        </div>
        <div className="topbar-actions">
          {!sessionState ? <span className="pill pill-muted">Electron {window.desktopHost?.versions.electron ?? "runtime"}</span> : null}
          <span className="pill pill-accent">{currentGame.label}</span>
          <button
            type="button"
            className={`ghost-button ${displayMode === "projector" ? "ghost-button-active" : ""}`}
            onClick={() => setDisplayMode((current) => (current === "projector" ? "normal" : "projector"))}
          >
            Projector
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => handleFeedback()}
            title="Write feedback"
          >
            Feedback
          </button>
          <button type="button" className="ghost-button" onClick={() => setIsAppHelpOpen(true)}>
            Help
          </button>
          <button type="button" className="ghost-button" onClick={() => setIsSettingsOpen(true)}>
            Settings
          </button>
          {sessionState ? (
            <button type="button" className="ghost-button" onClick={handleExitToMenu}>
              Exit To Main Menu
            </button>
          ) : (
            <button type="button" className="ghost-button" onClick={handleExitGame}>
              Exit Game
            </button>
          )}
        </div>
      </header>

      {isAppHelpOpen ? (
        <HelpModal
          titleId="app-help-title"
          title="Bible Challenge Help"
          eyebrow="Application Help"
          tabs={APP_HELP_CONTENT.tabs}
          onClose={() => setIsAppHelpOpen(false)}
        />
      ) : null}

      {isSettingsOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="setup-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="section-header">
              <div>
                <p className="eyebrow">App Settings</p>
                <h2 id="settings-title">Settings</h2>
              </div>
              <button type="button" className="ghost-button" onClick={() => setIsSettingsOpen(false)}>
                Close
              </button>
            </div>

            <div className="settings-tabs" role="tablist" aria-label="Settings sections">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeSettingsTab === tab.id}
                  aria-controls={`settings-panel-${tab.id}`}
                  className={`settings-tab ${activeSettingsTab === tab.id ? "settings-tab-active" : ""}`}
                  onClick={() => setActiveSettingsTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {settingsWarning ? <p className="settings-help settings-warning">{settingsWarning}</p> : null}

            <div className="settings-panel-wrap">
              {activeSettingsTab === "appearance" ? (
                <div
                  id="settings-panel-appearance"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-appearance"
                >
                  <div className="static-card settings-card">
                    <strong>Color Theme</strong>
                    <div className="theme-grid" role="group" aria-label="Color theme">
                      {APP_THEMES.map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          className={`theme-choice theme-choice-${theme} ${colorTheme === theme ? "theme-choice-active" : ""}`}
                          onClick={() => setColorTheme(theme)}
                        >
                          <span className="theme-swatch" />
                          {theme[0].toUpperCase()}
                          {theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="static-card settings-card">
                    <strong>Display Mode</strong>
                    <div className="toggle-row" role="group" aria-label="Display mode">
                      {DISPLAY_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          className={`toggle-button ${displayMode === mode.id ? "toggle-button-active" : ""}`}
                          onClick={() => setDisplayMode(mode.id)}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    <p className="settings-help">Projector mode enlarges gameplay text and simplifies screen chrome.</p>
                  </div>
                </div>
              ) : null}

              {activeSettingsTab === "players" ? (
                <div
                  id="settings-panel-players"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-players"
                >
                  <div className="static-card settings-card">
                    <strong>Play Mode</strong>
                    <div className="toggle-row">
                      <button
                        type="button"
                        className={`toggle-button ${participantMode === "individual" ? "toggle-button-active" : ""}`}
                        onClick={() => setParticipantMode("individual")}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        className={`toggle-button ${participantMode === "teams" ? "toggle-button-active" : ""}`}
                        onClick={() => setParticipantMode("teams")}
                      >
                        Team Mode
                      </button>
                    </div>

                    {participantMode === "individual" ? (
                      <div className="form-stack participant-editor">
                        {playerNames.map((playerName, index) => (
                          <div key={`${index}-${playerName}`} className="inline-form participant-row">
                            <input
                              className="color-input"
                              type="color"
                              value={playerColors[index] ?? getNextParticipantColor(index)}
                              onChange={(event) => updatePlayerColor(index, event.target.value)}
                              aria-label={`Player ${index + 1} color`}
                            />
                            <input
                              className="text-input"
                              value={playerName}
                              onChange={(event) => updatePlayerName(index, event.target.value)}
                              placeholder={`Player ${index + 1}`}
                            />
                            <button type="button" className="ghost-button" onClick={() => removePlayer(index)}>
                              Remove
                            </button>
                          </div>
                        ))}

                        <div className="inline-form">
                          <input
                            className="text-input"
                            value={newPlayerName}
                            onChange={(event) => setNewPlayerName(event.target.value)}
                            placeholder="Add player"
                          />
                          <button type="button" className="secondary-button" onClick={addPlayer}>
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="team-stack participant-editor">
                        {teams.map((team, teamIndex) => (
                          <article key={`${team.teamName}-${teamIndex}`} className="team-card">
                            <div className="inline-form participant-row">
                              <input
                                className="color-input"
                                type="color"
                                value={team.color ?? getNextParticipantColor(teamIndex)}
                                onChange={(event) => updateTeamColor(teamIndex, event.target.value)}
                                aria-label={`Team ${teamIndex + 1} color`}
                              />
                              <input
                                className="text-input"
                                value={team.teamName}
                                onChange={(event) => updateTeamName(teamIndex, event.target.value)}
                                placeholder={`Team ${teamIndex + 1}`}
                              />
                              <button type="button" className="ghost-button" onClick={() => removeTeam(teamIndex)}>
                                Remove Team
                              </button>
                            </div>

                            <div className="member-grid">
                              {team.members.map((member, memberIndex) => (
                                <div key={`${member}-${memberIndex}`} className="inline-form inline-form-tight">
                                  <input
                                    className="text-input"
                                    value={member}
                                    onChange={(event) => updateTeamMember(teamIndex, memberIndex, event.target.value)}
                                    placeholder={`Member ${memberIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    onClick={() => removeTeamMember(teamIndex, memberIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>

                            <button type="button" className="secondary-button" onClick={() => addTeamMember(teamIndex)}>
                              Add Team Member
                            </button>
                          </article>
                        ))}

                        <button type="button" className="ghost-button" onClick={addTeam}>
                          Add Team
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {activeSettingsTab === "timers" ? (
                <div
                  id="settings-panel-timers"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-timers"
                >
                  <div className="static-card settings-card">
                    <strong>Timer</strong>
                    <div className="toggle-row toggle-row-wrap" role="group" aria-label="Timer preset">
                      {TIMER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`toggle-button ${timerPreset === preset.id ? "toggle-button-active" : ""}`}
                          onClick={() => applyTimerPreset(preset.id)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="timer-grid">
                      {ALL_GAME_IDS.map((mode) => (
                        <label key={mode} className="timer-setting-card">
                          <span>{GAME_LIBRARY[mode].label}</span>
                          <input
                            className="number-input"
                            type="number"
                            min={5}
                            max={1800}
                            step={5}
                            value={challengeTimerSeconds[mode]}
                            disabled={!timerEnabled || (mode === "verse-scramble" && useVerseSecondsPerWord)}
                            onChange={(event) => updateChallengeTimerSeconds(mode, event.target.value)}
                            aria-label={`${GAME_LIBRARY[mode].label} timer seconds`}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="verse-timer-row">
                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={useVerseSecondsPerWord}
                          disabled={!timerEnabled}
                          onChange={(event) => {
                            setTimerPreset("custom");
                            setUseVerseSecondsPerWord(event.target.checked);
                          }}
                        />
                        Verse Scramble per word
                      </label>
                      <input
                        className="number-input"
                        type="number"
                        min={1}
                        max={60}
                        step={1}
                        value={verseScrambleSecondsPerWord}
                        disabled={!timerEnabled || !useVerseSecondsPerWord}
                        onChange={(event) => updateVerseScrambleSecondsPerWord(event.target.value)}
                        aria-label="Verse Scramble seconds per word"
                      />
                      <span className="settings-unit">seconds</span>
                    </div>
                    <p className="settings-help">Editing an individual timer switches the preset to Custom. Off hides gameplay timer badges.</p>
                  </div>
                </div>
              ) : null}

              {activeSettingsTab === "audio" ? (
                <div
                  id="settings-panel-audio"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-audio"
                >
                  <div className="static-card settings-card audio-settings-card">
                    <strong>Audio</strong>
                    <div className="audio-settings-grid">
                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={audioSettings.soundEffectsEnabled}
                          onChange={(event) =>
                            updateAudioSettings((current) => ({
                              ...current,
                              soundEffectsEnabled: event.target.checked
                            }))
                          }
                        />
                        Sound Effects
                      </label>

                      <label className="volume-row">
                        <span>Effects Volume</span>
                        <input
                          className="range-input"
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={audioSettings.soundEffectsVolume}
                          disabled={!audioSettings.soundEffectsEnabled}
                          onChange={(event) =>
                            updateAudioSettings((current) => ({
                              ...current,
                              soundEffectsVolume: Number(event.target.value)
                            }))
                          }
                        />
                        <span className="settings-unit">{audioSettings.soundEffectsVolume}%</span>
                      </label>

                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={audioSettings.backgroundMusicEnabled}
                          disabled={!audioSettings.backgroundMusicFilePath}
                          onChange={(event) =>
                            updateAudioSettings((current) => ({
                              ...current,
                              backgroundMusicEnabled: event.target.checked
                            }))
                          }
                        />
                        Background Music
                      </label>

                      <label className="volume-row">
                        <span>Music Volume</span>
                        <input
                          className="range-input"
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={audioSettings.backgroundMusicVolume}
                          disabled={!audioSettings.backgroundMusicFilePath}
                          onChange={(event) =>
                            updateAudioSettings((current) => ({
                              ...current,
                              backgroundMusicVolume: Number(event.target.value)
                            }))
                          }
                        />
                        <span className="settings-unit">{audioSettings.backgroundMusicVolume}%</span>
                      </label>

                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={audioSettings.backgroundMusicLoop}
                          disabled={!audioSettings.backgroundMusicFilePath}
                          onChange={(event) =>
                            updateAudioSettings((current) => ({
                              ...current,
                              backgroundMusicLoop: event.target.checked
                            }))
                          }
                        />
                        Loop background music
                      </label>
                    </div>

                    <div className="selected-track-row">
                      <span>Selected Track</span>
                      <strong>{audioSettings.backgroundMusicDisplayName ?? "No track selected"}</strong>
                    </div>

                    {audioWarning ? <p className="settings-help settings-warning">{audioWarning}</p> : null}

                    <div className="audio-button-row">
                      <button type="button" className="secondary-button" onClick={handleImportBackgroundMusic}>
                        Import Background Music
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={handleToggleMusicPreview}
                        disabled={!audioSettings.backgroundMusicFilePath}
                      >
                        {isMusicPreviewPlaying ? "Pause" : "Play"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={handleRemoveBackgroundMusic}
                        disabled={!audioSettings.backgroundMusicFilePath}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeSettingsTab === "feedback" ? (
                <div
                  id="settings-panel-feedback"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-feedback"
                >
                  <div className="static-card settings-card">
                    <strong>Feedback & Ratings</strong>
                    <p className="settings-help">
                      {savedRatingCount} rating{savedRatingCount === 1 ? "" : "s"} saved across challenge cards.
                      Manage the feedback form endpoint and clear ratings in the Bible Challenge Admin Console.
                    </p>
                  </div>
                </div>
              ) : null}

              {activeSettingsTab === "content" ? (
                <div
                  id="settings-panel-content"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-content"
                >
                  <div className="static-card settings-card">
                    <strong>Study Notes</strong>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={showStudyNotes}
                        onChange={(event) => setShowStudyNotes(event.target.checked)}
                      />
                      Show Study Notes After Answer
                    </label>
                  </div>

                  <div className="static-card settings-card">
                    <strong>Difficulty</strong>
                    <div className="toggle-row" role="group" aria-label="Difficulty filter">
                      {DIFFICULTY_FILTERS.map((difficulty) => (
                        <button
                          key={difficulty.id}
                          type="button"
                          className={`toggle-button ${difficultyFilter === difficulty.id ? "toggle-button-active" : ""}`}
                          onClick={() => setDifficultyFilter(difficulty.id)}
                        >
                          {difficulty.label}
                        </button>
                      ))}
                    </div>
                    <p className="settings-help">Mixed uses every available question. Specific difficulties are checked before each game starts.</p>
                  </div>

                  <div className="static-card settings-card">
                    <strong>Content Pack</strong>
                    <label className="selected-track-row">
                      <span>Default on launch</span>
                      <select
                        className="text-input"
                        value={defaultContentPackId}
                        onChange={(event) => {
                          const nextPackId = cleanContentPackId(event.target.value);
                          setDefaultContentPackId(nextPackId);
                          setActiveContentPackId(nextPackId);
                        }}
                      >
                        {CONTENT_PACK_IDS.map((packId) => (
                          <option key={packId} value={packId}>
                            {CONTENT_PACKS[packId].label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={activeContentPackId === "all"}
                        onChange={(event) => setActiveContentPackId(event.target.checked ? "all" : defaultContentPackId)}
                      />
                      Show all challenges
                    </label>
                  </div>

                  <div className="static-card settings-card">
                    <strong>Custom Content</strong>
                    <p className="settings-help">
                      {customContentPacks.length === 0
                        ? "No imported custom content packs."
                        : `${customContentPacks.length} custom content pack${customContentPacks.length === 1 ? "" : "s"} loaded.`}{" "}
                      Manage custom content packs in the Bible Challenge Admin Console.
                    </p>
                  </div>
                </div>
              ) : null}

              {activeSettingsTab === "event" ? (
                <div
                  id="settings-panel-event"
                  className="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab-event"
                >
                  <div className="static-card settings-card">
                    <strong>Event Mode</strong>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={eventScoringEnabled}
                        onChange={(event) => handleEventModeChange(event.target.checked)}
                      />
                      Event Mode
                    </label>
                    <input
                      className="text-input"
                      value={eventName}
                      disabled={!eventScoringEnabled}
                      onChange={(event) => setEventName(event.target.value)}
                      aria-label="Event name"
                    />
                    <div className="selected-track-row">
                      <span>Saved Event</span>
                      <select
                        className="text-input"
                        value={selectedSavedEventDefinitionId}
                        disabled={!eventScoringEnabled || savedEventDefinitions.length === 0}
                        onChange={(event) => loadEventDefinition(event.target.value)}
                        aria-label="Saved event definition"
                      >
                        <option value="">Choose saved event</option>
                        {savedEventDefinitions.map((definition) => (
                          <option key={definition.id} value={definition.id}>
                            {definition.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="audio-button-row">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={saveEventDefinition}
                        disabled={!eventScoringEnabled || eventHasStarted || selectedEventGameIds.length === 0}
                      >
                        Save Event Definition
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={deleteEventDefinition}
                        disabled={!eventScoringEnabled || eventHasStarted || !selectedSavedEventDefinitionId}
                      >
                        Delete Saved Event
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={resetEvent}
                        disabled={eventStandings.length === 0 && completedEventGameIds.length === 0}
                      >
                        Reset Event Progress
                      </button>
                    </div>
                    <div className="event-builder-grid">
                      <div className="event-builder-column">
                        <span className="winner-card-label">Available Challenges</span>
                        <div className="event-challenge-grid">
                          {ALL_GAME_IDS.map((mode) => {
                            const isSelected = selectedEventGameIds.includes(mode);
                            const isCompleted = completedEventGameIds.includes(mode);

                            return (
                              <label
                                key={mode}
                                className={`event-challenge-option ${isCompleted ? "event-challenge-completed" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!eventScoringEnabled || eventHasStarted || isCompleted}
                                  onChange={() => toggleEventChallenge(mode)}
                                />
                                <span>{GAME_LIBRARY[mode].label}</span>
                                {isCompleted ? <em>Done</em> : isSelected ? <em>In Event</em> : null}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="event-builder-column">
                        <span className="winner-card-label">Play Order</span>
                        <div className="event-order-list">
                          {selectedEventGameIds.length === 0 ? (
                            <span className="event-score-empty">No challenges selected.</span>
                          ) : (
                            selectedEventGameIds.map((mode, index) => {
                              const isCompleted = completedEventGameIds.includes(mode);
                              return (
                                <div
                                  key={mode}
                                  className={`event-order-row ${isCompleted ? "event-challenge-completed" : ""}`}
                                >
                                  <span className="rank-chip">{index + 1}</span>
                                  <strong>{GAME_LIBRARY[mode].label}</strong>
                                  {isCompleted ? <em>Done</em> : null}
                                  <div className="mini-controls">
                                    <button
                                      type="button"
                                      className="ghost-button icon-button"
                                      onClick={() => moveEventChallenge(mode, "up")}
                                      disabled={!eventScoringEnabled || eventHasStarted || isCompleted || index === 0}
                                    >
                                      ^
                                    </button>
                                    <button
                                      type="button"
                                      className="ghost-button icon-button"
                                      onClick={() => moveEventChallenge(mode, "down")}
                                      disabled={!eventScoringEnabled || eventHasStarted || isCompleted || index + 1 >= selectedEventGameIds.length}
                                    >
                                      v
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="settings-help">Event challenges are played once, in order. Loading a saved event definition resets event progress.</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {ratingGameId ? (
        <RatingModal
          gameId={ratingGameId}
          gameLabel={GAME_LIBRARY[ratingGameId].label}
          ratingLabel={getRatingLabel(challengeRatings[ratingGameId])}
          onClose={() => setRatingGameId(null)}
          onRate={(mode, stars) => {
            submitChallengeRating(mode, stars);
            setRatingGameId(null);
          }}
        />
      ) : null}

      {feedbackDraft ? (
        <div className="modal-backdrop" role="presentation">
          <section className="info-modal feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="section-header">
              <div>
                <p className="eyebrow">Feedback</p>
                <h2 id="feedback-title">
                  {feedbackDraft.gameId ? GAME_LIBRARY[feedbackDraft.gameId].label : "Home Page"}
                </h2>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setFeedbackDraft(null);
                  setFeedbackStatus("");
                }}
              >
                Close
              </button>
            </div>
            <div className="form-stack">
              <div className="feedback-field-grid">
                <input
                  className="text-input"
                  type="text"
                  name="fi-sender-fullName"
                  value={feedbackDraft.name}
                  onChange={(event) =>
                    setFeedbackDraft((current) =>
                      current
                        ? {
                            ...current,
                            name: event.target.value
                          }
                        : current
                    )
                  }
                  placeholder="Name optional"
                />
                <input
                  className="text-input"
                  type="email"
                  name="fi-sender-email"
                  value={feedbackDraft.email}
                  onChange={(event) =>
                    setFeedbackDraft((current) =>
                      current
                        ? {
                            ...current,
                            email: event.target.value
                          }
                        : current
                    )
                  }
                  placeholder="Email optional"
                />
              </div>
              <div className="feedback-rating-row" role="radiogroup" aria-label="Feedback rating">
                {Array.from({ length: 5 }, (_, ratingIndex) => {
                  const rating = ratingIndex + 1;
                  const isSelected = feedbackDraft.rating === rating;

                  return (
                    <button
                      key={rating}
                      type="button"
                      className={`star-button feedback-star-button ${isSelected ? "feedback-star-selected" : ""}`}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                      onClick={() =>
                        setFeedbackDraft((current) =>
                          current
                            ? {
                                ...current,
                                rating
                              }
                            : current
                        )
                      }
                    >
                      {feedbackDraft.rating !== null && rating <= feedbackDraft.rating ? "★" : "☆"}
                    </button>
                  );
                })}
              </div>
              <textarea
                className="text-area feedback-text-area"
                name="fi-text-message"
                value={feedbackDraft.message}
                onChange={(event) =>
                  setFeedbackDraft((current) =>
                    current
                      ? {
                          ...current,
                          message: event.target.value
                        }
                      : current
                  )
                }
                placeholder="Type feedback here"
              />
              {feedbackStatus ? <p className="settings-help">{feedbackStatus}</p> : null}
              <div className="feedback-preview">
                <span className="winner-card-label">Email Text</span>
                <pre>{getFeedbackEmailBody(feedbackDraft)}</pre>
              </div>
            </div>
            <div className="modal-actions feedback-actions">
              <button type="button" className="ghost-button" onClick={copyFeedbackText}>
                Copy Text
              </button>
              <button type="button" className="secondary-button" onClick={sendFeedbackEmail}>
                Open Email
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={submitFeedbackForm}
                disabled={isSubmittingFeedback || !feedbackDraft.message.trim()}
              >
                {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {!sessionState ? <div className={`flash flash-${flashMessage.tone}`}>{flashMessage.text}</div> : null}

      {!sessionState ? (
        <main className="menu-grid">
          <section className="panel panel-wide">
            <div className="section-header">
              <div>
                <p className="eyebrow">Choose Game</p>
                <h2>Select Challenge</h2>
              </div>
              <p className="section-copy">
                {eventScoringEnabled
                  ? "Event mode shows selected challenges in play order. Each one can be played once."
                  : "Every game pulls random content from the full library when you start a new game."}
              </p>
            </div>

            {!eventScoringEnabled ? (
              <div className="content-pack-tabs" role="tablist" aria-label="Content packs">
                {CONTENT_PACK_IDS.map((packId) => (
                  <button
                    key={packId}
                    type="button"
                    role="tab"
                    aria-selected={activeContentPackId === packId}
                    className={`content-pack-tab ${activeContentPackId === packId ? "content-pack-tab-active" : ""}`}
                    style={{ "--pack-accent": CONTENT_PACKS[packId].color } as CSSProperties}
                    onClick={() => setActiveContentPackId(packId)}
                  >
                    {CONTENT_PACKS[packId].label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mode-grid">
              {visibleGameIds.length === 0 ? (
                <div className="static-card empty-event-card">
                  <strong>No event challenges selected.</strong>
                  <p>Open Settings and add challenges to the event play order.</p>
                </div>
              ) : null}
              {visibleGameIds.map((mode, eventIndex) => {
                const info = GAME_LIBRARY[mode];
                const modeRating = challengeRatings[mode];
                const filledStars = getFilledStarCount(modeRating);
                const isEventSelected = selectedEventGameIds.includes(mode);
                const isEventCompleted = completedEventGameIds.includes(mode);
                const hasBeenPlayed = playedSessionGameIds.includes(mode) || isEventCompleted;
                const isOutOfOrder = eventScoringEnabled && eventHasStarted && nextEventGameId !== null && mode !== nextEventGameId;
                const isEventUnavailable =
                  eventScoringEnabled &&
                  (!eventHasStarted || isEventEndedEarly || !isEventSelected || isEventCompleted || isOutOfOrder);
                const cardPackId = activeContentPackId === "all" ? GAME_CONTENT_PACKS[mode][0] : activeContentPackId;
                const cardAccent = eventScoringEnabled ? info.accent : CONTENT_PACKS[cardPackId]?.color ?? info.accent;
                const eventCardStatus = isEventCompleted
                  ? "Completed"
                  : isEventEndedEarly
                    ? "Skipped"
                    : !eventHasStarted
                      ? "Selected"
                      : isOutOfOrder
                        ? "Queued"
                        : "Next";

                return (
                  <article
                    key={mode}
                    className={`mode-card ${hasChosenGame && gameId === mode ? "mode-card-active" : ""} ${
                      isEventUnavailable ? "mode-card-disabled" : ""
                    } ${hasBeenPlayed ? "mode-card-played" : ""}`}
                    style={{ "--card-accent": cardAccent } as CSSProperties}
                  >
                    <button
                      type="button"
                      className="mode-title-button"
                      disabled={isEventUnavailable}
                      onClick={() => handleChooseGame(mode)}
                    >
                      {info.label}
                      {eventScoringEnabled ? <span>{eventIndex + 1}. {eventCardStatus}</span> : hasBeenPlayed ? <span>Played</span> : null}
                      {showChallengeRatings ? <span className="rating-average">{getRatingLabel(modeRating)}</span> : null}
                    </button>
                    <div className="mode-card-actions">
                      <button
                        type="button"
                        className="info-button rating-trigger-button"
                        aria-label={`Rate ${info.label}`}
                        title={`Rate ${info.label}`}
                        onClick={() => setRatingGameId(mode)}
                      >
                        {filledStars > 0 ? "★" : "☆"}
                      </button>
                      <button
                        type="button"
                        className="info-button"
                        aria-label={`${info.label} feedback`}
                        title="Write challenge feedback"
                        onClick={() => handleFeedback(mode)}
                      >
                        @
                      </button>
                      <button
                        type="button"
                        className="info-button"
                        aria-label={`${info.label} information`}
                        onClick={() => setInfoGameId(mode)}
                      >
                        i
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {eventScoringEnabled ? (
              <EventHomeControls
                actionStatus={eventActionStatus}
                actionLabel={eventActionLabel}
                actionDisabled={eventActionDisabled}
                isStartingGame={isStartingGame}
                eventHasStarted={eventHasStarted}
                isEventFinished={isEventFinished}
                eventName={eventName}
                completedChallengeCount={eventChallengeCount}
                selectedChallengeCount={selectedEventChallengeCount}
                standings={eventStandings}
                onStartNext={() => void startNextEventChallenge()}
                onEndEarly={endEventEarly}
              />
            ) : null}
          </section>

          {isSetupOpen ? (
            <div className="modal-backdrop" role="presentation">
              <section className="setup-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Content Pack</p>
                    <h2 id="setup-title">{currentGame.label}</h2>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => setIsSetupOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="static-card">
                  <strong>{currentGame.setupPrompt}</strong>
                  <p>{getSetupDetail(gameId)}</p>
                </div>

                <div className="modal-summary-grid">
                  <div className="static-card">
                    <span className="winner-card-label">Players</span>
                    <strong>{participantMode === "individual" ? playerNames.filter(Boolean).length : teams.length}</strong>
                  </div>
                  <div className="static-card">
                    <span className="winner-card-label">Mode</span>
                    <strong>{participantMode === "individual" ? "Individual" : "Teams"}</strong>
                  </div>
                  <div className="static-card">
                    <span className="winner-card-label">Timer</span>
                    <strong>
                      {timerEnabled
                        ? getChallengeTimerLabel(
                            gameId,
                            challengeTimerSeconds,
                            useVerseSecondsPerWord,
                            verseScrambleSecondsPerWord
                          )
                        : "Off"}
                    </strong>
                  </div>
                  <div className="static-card">
                    <span className="winner-card-label">Difficulty</span>
                    <strong>{DIFFICULTY_FILTERS.find((entry) => entry.id === difficultyFilter)?.label ?? "Mixed"}</strong>
                  </div>
                  <div className="static-card">
                    <span className="winner-card-label">Pack</span>
                    <strong>{eventScoringEnabled ? "Event Mix" : CONTENT_PACKS[activeContentPackId].label}</strong>
                  </div>
                  <div className="static-card">
                    <span className="winner-card-label">Event</span>
                    <strong>{eventScoringEnabled ? eventName.trim() || "Untitled Event" : "Single Challenge"}</strong>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="ghost-button" onClick={() => setIsSetupOpen(false)}>
                    Keep Editing
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void handleStart()}
                    disabled={
                      isStartingGame ||
                      (eventScoringEnabled &&
                        (!selectedEventGameIds.includes(gameId) || completedEventGameIds.includes(gameId)))
                    }
                  >
                    {isStartingGame ? "Starting..." : "Start Game"}
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {infoGameId ? (
            <div className="modal-backdrop" role="presentation">
              <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Game Info</p>
                    <h2 id="info-title">{GAME_LIBRARY[infoGameId].label}</h2>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => setInfoGameId(null)}>
                    Close
                  </button>
                </div>
                <div className="static-card">
                  <strong>{GAME_LIBRARY[infoGameId].shortDescription}</strong>
                  <p>{GAME_LIBRARY[infoGameId].setupPrompt}</p>
                </div>
              </section>
            </div>
          ) : null}
        </main>
      ) : (
        <main className="play-grid">
          <section className="panel score-panel">
            <div className="score-panel-header">
              <div className="score-context">
                <span className="pill pill-muted">{getProgressLabel(sessionState)}</span>
                <h2 className="live-challenge-title">{sessionState.displayName}</h2>
                {showChallengeRatings ? (
                  <span className="pill pill-rating">{getRatingHeadingLabel(challengeRatings[sessionState.gameId])}</span>
                ) : null}
              </div>
              <button type="button" className="secondary-button" onClick={() => setIsGameHelpOpen(true)}>
                Help
              </button>
              <button type="button" className="secondary-button" onClick={() => setIsHostControlsOpen(true)}>
                Host Controls
              </button>
            </div>

            <div className="score-list score-list-horizontal">
              {standings.map((standing, index) => (
                <div
                  key={standing.participant.id}
                  className={`score-row ${index === 0 ? "score-row-lead" : ""} ${
                    currentParticipantId === standing.participant.id ? "score-row-current" : ""
                  }`}
                  style={{ "--participant-color": standing.participant.color } as CSSProperties}
                >
                  <div>
                    <div className="score-name">
                      <span className="rank-chip">{index + 1}</span>
                      {standing.participant.name}
                    </div>
                    {currentParticipantId === standing.participant.id ? (
                      <div className="score-turn-label">
                        {sessionState.participantMode === "teams"
                          ? getCurrentTurnMemberName(sessionState, standing.participant.id)
                          : "Current turn"}
                      </div>
                    ) : null}
                  </div>
                  <div className="score-value-stack">
                    <div className="score-total">{standing.stats.totalScore}</div>
                    {eventScoringEnabled ? (
                      <div className="score-session-total">
                        {getEventScoreLabel(
                          eventScores[getEventParticipantKey(sessionState.participantMode, standing.participant.name)]
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {isHostControlsOpen ? (
            <div className="modal-backdrop" role="presentation">
              <section className="host-controls-modal" role="dialog" aria-modal="true" aria-labelledby="host-controls-title">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Live Game</p>
                    <h2 id="host-controls-title">Host Controls</h2>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => setIsHostControlsOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="host-control-grid">
                  <button type="button" className="secondary-button" onClick={() => setIsTimerPaused((current) => !current)}>
                    {isTimerPaused ? "Resume Timer" : "Pause Timer"}
                  </button>
                  <button type="button" className="ghost-button" onClick={() => adjustCurrentScore(1)}>
                    Add Point
                  </button>
                  <button type="button" className="ghost-button" onClick={() => adjustCurrentScore(-1)}>
                    Subtract Point
                  </button>
                  <button type="button" className="ghost-button" onClick={undoLastSessionAction} disabled={!lastUndoState}>
                    Undo Last Score
                  </button>
                  <button type="button" className="secondary-button" onClick={() => handleAction(() => forceResolveForHost(sessionState), "pass")}>
                    Reveal Answer
                  </button>
                  <button type="button" className="secondary-button" onClick={() => handleAction(() => forceResolveForHost(sessionState), "pass")}>
                    Skip / Pass
                  </button>
                  <button type="button" className="ghost-button" onClick={restartCurrentChallenge} disabled={isStartingGame}>
                    Restart Challenge
                  </button>
                  <button type="button" className="ghost-button" onClick={endCurrentGame}>
                    End Game
                  </button>
                  <button type="button" className="ghost-button" onClick={handleExitToMenu}>
                    Main Menu
                  </button>
                </div>
                <div className="inline-form">
                  <input
                    className="number-input"
                    type="number"
                    min={0}
                    value={manualScoreInput}
                    onChange={(event) => setManualScoreInput(event.target.value)}
                    placeholder="Score"
                    aria-label="Set current score"
                  />
                  <button type="button" className="primary-button" onClick={setCurrentScoreFromInput}>
                    Set Score
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {isGameHelpOpen ? (
            <HelpModal
              titleId="game-help-title"
              title={GAME_LIBRARY[sessionState.gameId].label}
              eyebrow="Game Help"
              tabs={GAME_HELP_CONTENT[sessionState.gameId].tabs}
              onClose={() => setIsGameHelpOpen(false)}
            />
          ) : null}

          {shouldShowStudyNote && studyNoteContent ? (
            <div className="modal-backdrop" role="presentation">
              <section className="study-note-modal" role="dialog" aria-modal="true" aria-labelledby="study-note-title">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">After Answer</p>
                    <h2 id="study-note-title">{studyNoteContent.title}</h2>
                  </div>
                </div>
                <div className="answer-panel answer-panel-correct">
                  <span>Answer</span>
                  <strong>{studyNoteContent.answer}</strong>
                  {studyNoteContent.reference ? <p>{studyNoteContent.reference}</p> : null}
                  {studyNoteContent.verse ? <blockquote>{studyNoteContent.verse}</blockquote> : null}
                  <p>{studyNoteContent.note}</p>
                </div>
                <label className="check-row">
                  <input
                    type="checkbox"
                    onChange={(event) => {
                      if (event.target.checked) {
                        setShowStudyNotes(false);
                      }
                    }}
                  />
                  Don't show study notes again
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setDismissedStudyNoteKey(studyNoteContent.key);
                      handleAction(() => continueGame(sessionState));
                    }}
                  >
                    Continue
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          <section className="stage">
            {sessionState.status === "completed" ? (
              <section className="panel panel-stage">
                {isEventComplete ? (
                  <>
                    <div className="event-splash celebration-splash event-complete-splash">
                      <span className="winner-card-label">Event Complete</span>
                      <h2>{eventName.trim() || "Bible Challenge Event"}</h2>
                      {uniqueEventWinner ? (
                        <>
                          <span className="celebration-kicker">Champion</span>
                          <strong>{uniqueEventWinner.participantName}</strong>
                          <p>{uniqueEventWinner.totalScore} final event points</p>
                        </>
                      ) : eventStandings.length > 0 ? (
                        <p>No unique winner after final event totals.</p>
                      ) : (
                        <p>No event scores were recorded.</p>
                      )}
                    </div>
                    <div className="summary-grid">
                      {eventStandings.map((entry, index) => (
                        <article
                          key={entry.key}
                          className="summary-card"
                          style={{ "--participant-color": entry.color } as CSSProperties}
                        >
                          <div className="rank-chip">{index + 1}</div>
                          <h3>{entry.participantName}</h3>
                          <p>{entry.totalScore} event points</p>
                          <p>{entry.challengesCompleted} challenge{entry.challengesCompleted === 1 ? "" : "s"} completed</p>
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {showChallengeSplash ? (
                      <div className="event-splash celebration-splash challenge-complete-splash">
                        <span className="winner-card-label">Challenge Complete</span>
                        <h2>{sessionState.displayName}</h2>
                        {uniqueWinner ? (
                          <>
                            <span className="celebration-kicker">Winner</span>
                            <strong>{uniqueWinner.participant.name}</strong>
                            <p>{uniqueWinner.stats.totalScore} challenge points</p>
                          </>
                        ) : (
                          <>
                            <span className="celebration-kicker">Tie</span>
                            <strong>No unique winner</strong>
                            <p>Use an extra round if you want a final decider.</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="section-header">
                          <div>
                            <p className="eyebrow">Game Complete</p>
                            <h2>Final Standings</h2>
                          </div>
                        </div>

                        {uniqueWinner ? (
                          <div className="winner-card">
                            <span className="winner-card-label">Winner</span>
                            <strong>{uniqueWinner.participant.name}</strong>
                            <span>{uniqueWinner.stats.totalScore} points</span>
                          </div>
                        ) : (
                          <div className="winner-card winner-card-muted">
                            <span className="winner-card-label">Tie</span>
                            <strong>No unique winner after tie-breakers.</strong>
                            <span>Use an extra round if you want a final decider.</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="summary-grid">
                      {standings.map((standing, index) => (
                        <article
                          key={standing.participant.id}
                          className="summary-card"
                          style={{ "--participant-color": standing.participant.color } as CSSProperties}
                        >
                          <div className="rank-chip">{index + 1}</div>
                          <h3>{standing.participant.name}</h3>
                          <p>{standing.stats.totalScore} challenge points</p>
                          {eventScoringEnabled ? (
                            <p>
                              {getEventScoreLabel(
                                eventScores[getEventParticipantKey(sessionState.participantMode, standing.participant.name)]
                              )}{" "}
                              total points
                            </p>
                          ) : null}
                          <p>{getTieBreakerLabel(sessionState.gameId, standing)}</p>
                        </article>
                      ))}
                    </div>

                    {eventScoringEnabled ? (
                      <div className="event-mode-panel">
                        <div className="section-header section-header-compact">
                          <div>
                            <p className="eyebrow">Event Mode</p>
                            <h3>Event Ranking</h3>
                          </div>
                        </div>
                        <div className="summary-grid">
                          {eventStandings.map((entry, index) => (
                            <article
                              key={entry.key}
                              className="summary-card"
                              style={{ "--participant-color": entry.color } as CSSProperties}
                            >
                              <div className="rank-chip">{index + 1}</div>
                              <h3>{entry.participantName}</h3>
                              <p>{entry.totalScore} event points</p>
                              <p>{entry.challengesCompleted} challenge{entry.challengesCompleted === 1 ? "" : "s"} completed</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}

                <button type="button" className="primary-button" onClick={handleExitToMenu}>
                  Return To Main Menu
                </button>
              </section>
            ) : sessionState.gameId === "five-guesses" ? (
              <FiveGuessesView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onPick={(cardId) => handleAction(() => selectBoardCard(sessionState, cardId))}
                onSubmitGuess={() => handleAction(() => submitBoardGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passBoardGuess(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "initials" ? (
              <InitialsView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onPick={(cardId) => handleAction(() => selectBoardCard(sessionState, cardId))}
                onSubmitGuess={() => handleAction(() => submitBoardGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passBoardGuess(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "scripture-puzzles" ? (
              <ScriptureView
                state={sessionState}
                scriptureLetter={scriptureLetter}
                scriptureSolveText={scriptureSolveText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onScriptureLetterChange={setScriptureLetter}
                onScriptureSolveChange={setScriptureSolveText}
                onSubmitLetter={() => handleAction(() => submitScriptureLetterGuess(sessionState, scriptureLetter))}
                onSubmitSolve={() => handleAction(() => submitScriptureSolve(sessionState, scriptureSolveText))}
                onPass={() => handleAction(() => passScriptureTurn(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "bible-timeline" ? (
              <BibleTimelineView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                onMove={(eventId, direction) => handleAction(() => moveTimelineEvent(sessionState, eventId, direction))}
                onSubmit={() => handleAction(() => submitTimelineOrder(sessionState))}
                onPass={() => handleAction(() => passTimelineRound(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "verse-scramble" ? (
              <VerseScrambleView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                onMoveTile={(tileId, target) => handleAction(() => moveVerseTile(sessionState, tileId, target))}
                onClear={() => handleAction(() => clearVerseAnswer(sessionState))}
                onSubmit={() => handleAction(() => submitVerseScramble(sessionState))}
                onPass={() => handleAction(() => passVerseScramble(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "bible-connections" ? (
              <BibleConnectionsView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                onToggleTile={(tileId) => {
                  audioManager.playEffect("click");
                  handleAction(() => toggleConnectionTile(sessionState, tileId));
                }}
                onSubmit={() => handleAction(() => submitConnectionGroup(sessionState))}
                onPass={() => handleAction(() => passConnectionTurn(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "name-that-book" ? (
              <NameThatBookView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitNameThatBookGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passNameThatBookTurn(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "before-or-after" ? (
              <BeforeOrAfterView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                onAnswer={(answer) => handleAction(() => answerBeforeOrAfter(sessionState, answer))}
                onPass={() => handleAction(() => passBeforeOrAfter(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "reference-rush" ? (
              <ReferenceRushView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitReferenceRushGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passReferenceRush(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "chapter-finder" ? (
              <ChapterFinderView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitChapterFinderGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passChapterFinder(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "who-said-it" ? (
              <WhoSaidItView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitWhoSaidItGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passWhoSaidIt(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "bible-books-relay" ? (
              <BibleBooksRelayView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                onMove={(book, direction) => handleAction(() => moveBibleBook(sessionState, book, direction))}
                onSubmit={() => handleAction(() => submitBibleBooksRelay(sessionState))}
                onPass={() => handleAction(() => passBibleBooksRelay(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "prophecy-match" ? (
              <ProphecyMatchView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onSelect={(cardType, cardId) => {
                  audioManager.playEffect("click");
                  handleAction(() => selectProphecyMatchCard(sessionState, cardType, cardId));
                }}
                onSubmit={() => handleAction(() => submitProphecyMatch(sessionState))}
                onPass={() => handleAction(() => passProphecyMatch(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "messiah-prophecy" ? (
              <MessiahProphecyView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(choice) => handleAction(() => submitMessiahProphecyChoice(sessionState, choice))}
                onPass={() => handleAction(() => passMessiahProphecy(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "prophecy-clue-ladder" ? (
              <ProphecyClueLadderView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitProphecyClueGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passProphecyClue(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "fulfillment-finder" ? (
              <FulfillmentFinderView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(reference) => handleAction(() => submitFulfillmentFinderChoice(sessionState, reference))}
                onPass={() => handleAction(() => passFulfillmentFinder(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "prophecy-categories" ? (
              <ProphecyCategoriesView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onSelectCard={(cardId) => {
                  audioManager.playEffect("click");
                  handleAction(() => selectProphecyCategoryCard(sessionState, cardId));
                }}
                onSelectCategory={(category) => {
                  audioManager.playEffect("click");
                  handleAction(() => selectProphecyCategory(sessionState, category));
                }}
                onSubmit={() => handleAction(() => submitProphecyCategory(sessionState))}
                onPass={() => handleAction(() => passProphecyCategory(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "complete-the-verse" ? (
              <PsalmProverbChoiceView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(choice) => handleAction(() => submitCompleteVerseChoice(sessionState, choice))}
                onPass={() => handleAction(() => passCompleteVerse(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "wisdom-match" ? (
              <PsalmProverbChoiceView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(choice) => handleAction(() => submitWisdomMatchChoice(sessionState, choice))}
                onPass={() => handleAction(() => passWisdomMatch(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "psalm-theme" ? (
              <PsalmProverbChoiceView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(choice) => handleAction(() => submitPsalmThemeChoice(sessionState, choice))}
                onPass={() => handleAction(() => passPsalmTheme(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "proverb-categories" ? (
              <ProverbCategoriesView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onSelectCard={(cardId) => {
                  audioManager.playEffect("click");
                  handleAction(() => selectProverbCategoryCard(sessionState, cardId));
                }}
                onSelectCategory={(category) => {
                  audioManager.playEffect("click");
                  handleAction(() => selectProverbCategory(sessionState, category));
                }}
                onSubmit={() => handleAction(() => submitProverbCategory(sessionState))}
                onPass={() => handleAction(() => passProverbCategory(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "psalm-reference-finder" ? (
              <PsalmProverbChoiceView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(reference) => handleAction(() => submitPsalmReferenceFinderChoice(sessionState, reference))}
                onPass={() => handleAction(() => passPsalmReferenceFinder(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "two-truths-and-a-lie" ? (
              <TwoTruthsView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onChoose={(statementIndex) => handleAction(() => selectTwoTruthsStatement(sessionState, statementIndex))}
                onPass={() => handleAction(() => passTwoTruths(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "relay-verse-build" ? (
              <RelayVerseBuildView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitRelayWord(sessionState, guessText))}
                onSkipWord={() => handleAction(() => passRelayWord(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "verse-typing-race" ? (
              <VerseTypingRaceView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onSubmitResult={(result) => handleAction(() => submitVerseTypingResult(sessionState, result))}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "word-ladder" ? (
              <WordLadderView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitWordLadderStepWithDictionary(sessionState, guessText))}
                onRemoveLastRung={() => handleAction(() => removeLastWordLadderRung(sessionState))}
                onPass={() => handleAction(() => passWordLadderTurn(sessionState))}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "bible-anagrams" ? (
              <BibleAnagramsView
                state={sessionState}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                onMoveTile={(tileId, target) => handleAction(() => moveBibleAnagramTile(sessionState, tileId, target))}
                onClear={() => handleAction(() => clearBibleAnagramAnswer(sessionState))}
                onSubmit={() => handleAction(() => submitBibleAnagram(sessionState))}
                onPass={() => handleAction(() => passBibleAnagram(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : sessionState.gameId === "bible-cryptogram" ? (
              <BibleCryptogramView
                state={sessionState}
                cryptogramLetter={cryptogramLetter}
                cryptogramSolveText={cryptogramSolveText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onCryptogramLetterChange={setCryptogramLetter}
                onCryptogramSolveChange={setCryptogramSolveText}
                onSubmitLetter={() => handleAction(() => submitBibleCryptogramLetterGuess(sessionState, cryptogramLetter))}
                onSubmitSolve={() => handleAction(() => submitBibleCryptogramSolve(sessionState, cryptogramSolveText))}
                onPass={() => handleAction(() => passBibleCryptogramTurn(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            ) : (
              <MissingWordView
                state={sessionState}
                guessText={guessText}
                timerEnabled={timerEnabled}
                timeRemaining={timeRemaining}
                timerDurationSeconds={activeTimerSeconds}
                isTimerExpired={timerEnabled && timeRemaining === 0}
                onGuessChange={setGuessText}
                onSubmit={() => handleAction(() => submitMissingWordGuess(sessionState, guessText))}
                onPass={() => handleAction(() => passMissingWord(sessionState), "pass")}
                onContinue={() => handleAction(() => continueGame(sessionState))}
              />
            )}
          </section>
        </main>
      )}
    </div>
  );
}

function FiveGuessesView(props: {
  state: FiveGuessesState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onPick: (cardId: string) => void;
  onSubmitGuess: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const {
    state,
    guessText,
    timerEnabled,
    timeRemaining,
    timerDurationSeconds,
    isTimerExpired,
    onGuessChange,
    onPick,
    onSubmitGuess,
    onPass,
    onContinue
  } = props;

  if (!state.currentPrompt) {
    const categoryColumns = Array.from(new Set(state.boardCards.map((card) => card.boardCategory))).map((category) => ({
      category,
      cards: state.boardCards
        .filter((card) => card.boardCategory === category)
        .sort((left, right) => left.boardValue - right.boardValue)
    }));

    return (
      <section className="panel panel-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Board Select</p>
            <h2>Choose Any Card</h2>
          </div>
        </div>

        <div className="category-board-grid">
          {categoryColumns.map((column) => (
            <div key={column.category} className="category-column">
              <div className="category-header">{column.category}</div>
              {column.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`pick-tile pick-tile-${card.status}`}
                  disabled={card.status !== "available"}
                  onClick={() => onPick(card.id)}
                >
                  <span className="pick-tile-main">
                    {card.status === "available" ? card.boardValue : card.status === "solved" ? "Solved" : card.status === "unsolved" ? "Missed" : "Live"}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const wasSolved = state.boardCards.find((card) => card.id === prompt.cardId)?.winnerParticipantId != null;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">{prompt.phase === "steal" ? "Steal Attempt" : "Live Card"}</p>
          <h2>{prompt.round.category}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? (
            <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} />
          ) : null}
          <span className="pill pill-accent">{prompt.revealedClues}/5 clues</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
        <span className="pill pill-muted">Pool: {prompt.round.cluePoolSize} clues</span>
      </div>

      <div className="clue-grid">
        {prompt.round.clues.map((clue, index) => (
          <article key={index} className="clue-card">
            <span className="clue-card-label">Clue {index + 1}</span>
            <p>{index < prompt.revealedClues ? clue : "Hidden until the previous guess misses."}</p>
          </article>
        ))}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${wasSolved ? "answer-panel-correct" : ""}`}>
            <span>{wasSolved ? "Correct" : "Answer"}</span>
            <strong>{prompt.round.answer}</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.status === "completed" ? "Show Final Standings" : "Back To Board"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmitGuess, isTimerExpired)}
            placeholder="Enter the answer"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmitGuess} disabled={isTimerExpired}>
            Submit Guess
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function InitialsView(props: {
  state: InitialsState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onPick: (cardId: string) => void;
  onSubmitGuess: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const {
    state,
    guessText,
    timerEnabled,
    timeRemaining,
    timerDurationSeconds,
    isTimerExpired,
    onGuessChange,
    onPick,
    onSubmitGuess,
    onPass,
    onContinue
  } = props;

  if (!state.currentPrompt) {
    return (
      <section className="panel panel-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Random Board</p>
            <h2>Choose Any Card</h2>
          </div>
        </div>

        <div className="random-board-grid">
          {state.boardCards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`pick-tile pick-tile-${card.status}`}
              disabled={card.status !== "available"}
              onClick={() => onPick(card.id)}
            >
              <span className="pick-tile-main">{card.round.initials}</span>
              {card.status !== "available" ? (
                <span className="pick-tile-status">
                  {card.status === "solved" ? "Solved" : card.status === "unsolved" ? "Missed" : "Live"}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const wasSolved = state.boardCards.find((card) => card.id === prompt.cardId)?.winnerParticipantId != null;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">{prompt.phase === "steal" ? "Steal Attempt" : "Live Pick"}</p>
          <h2>{prompt.round.initials}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? (
            <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} />
          ) : null}
          <span className="pill pill-accent">{prompt.revealedClues}/6 clues</span>
        </div>
      </div>

      <div className="initials-hero">{prompt.round.initials}</div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
        <span className="pill pill-muted">Pool: {prompt.round.cluePoolSize} clues</span>
      </div>

      <div className="clue-grid">
        {prompt.round.hints.map((hint, index) => (
          <article key={index} className="clue-card">
            <span className="clue-card-label">Clue {index + 1}</span>
            <p>{index < prompt.revealedClues ? hint : "Hidden until the previous guess misses."}</p>
          </article>
        ))}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${wasSolved ? "answer-panel-correct" : ""}`}>
            <span>{wasSolved ? "Correct" : "Answer"}</span>
            <strong>{prompt.round.answer}</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.status === "completed" ? "Show Final Standings" : "Back To Board"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmitGuess, isTimerExpired)}
            placeholder="Enter the answer"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmitGuess} disabled={isTimerExpired}>
            Submit Guess
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function ScriptureView(props: {
  state: ScriptureState;
  scriptureLetter: string;
  scriptureSolveText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onScriptureLetterChange: (value: string) => void;
  onScriptureSolveChange: (value: string) => void;
  onSubmitLetter: () => void;
  onSubmitSolve: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const {
    state,
    scriptureLetter,
    scriptureSolveText,
    timerEnabled,
    timeRemaining,
    timerDurationSeconds,
    isTimerExpired,
    onScriptureLetterChange,
    onScriptureSolveChange,
    onSubmitLetter,
    onSubmitSolve,
    onPass,
    onContinue
  } = props;

  const isResolved = state.currentPrompt.isComplete;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{state.currentPrompt.round.reference}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? (
            <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} />
          ) : null}
          <span className="pill pill-accent">{state.currentPrompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {state.currentPrompt.round.theme}</span>
      </div>

      <p className="section-copy">{state.currentPrompt.round.contextClue}</p>

      <div className="scripture-screen">
        {buildScriptureBoard(state.currentPrompt.round.verseText ?? "", state.currentPrompt.attemptedLetters)}
      </div>

      <div className="chip-row">
        <span className="pill pill-muted">Remaining hidden letters: {getScriptureRemainingLetters(state)}</span>
        <span className="pill pill-muted">
          Attempted letters:{" "}
          {state.currentPrompt.attemptedLetters.length > 0
            ? state.currentPrompt.attemptedLetters.join(", ").toUpperCase()
            : "none"}
        </span>
      </div>

      {!isResolved ? (
        <>
          {state.currentPrompt.phase === "letter" ? (
            <div className="guess-zone">
              <input
                className="text-input"
                maxLength={1}
                value={scriptureLetter}
                onChange={(event) => onScriptureLetterChange(event.target.value)}
                onKeyDown={(event) => submitOnEnter(event, onSubmitLetter, isTimerExpired)}
                placeholder="A-Z"
                disabled={isTimerExpired}
              />
              <button type="button" className="primary-button" onClick={onSubmitLetter} disabled={isTimerExpired}>
                Submit Letter
              </button>
            </div>
          ) : (
            <div className="solve-zone">
              <textarea
                className="text-area"
                rows={2}
                value={scriptureSolveText}
                onChange={(event) => onScriptureSolveChange(event.target.value)}
                onKeyDown={(event) => submitOnEnter(event, onSubmitSolve, isTimerExpired)}
                placeholder="Enter the full verse text"
                disabled={isTimerExpired}
              />
              <div className="guess-zone">
                <button type="button" className="primary-button" onClick={onSubmitSolve} disabled={isTimerExpired}>
                  Submit Solve
                </button>
                <button type="button" className="secondary-button" onClick={onPass}>
                  Pass
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="answer-panel">{state.currentPrompt.round.verseText}</div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Next Round"}
          </button>
        </>
      )}
    </section>
  );
}

function BibleCryptogramView(props: {
  state: BibleCryptogramState;
  cryptogramLetter: string;
  cryptogramSolveText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onCryptogramLetterChange: (value: string) => void;
  onCryptogramSolveChange: (value: string) => void;
  onSubmitLetter: () => void;
  onSubmitSolve: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const {
    state,
    cryptogramLetter,
    cryptogramSolveText,
    timerEnabled,
    timeRemaining,
    timerDurationSeconds,
    isTimerExpired,
    onCryptogramLetterChange,
    onCryptogramSolveChange,
    onSubmitLetter,
    onSubmitSolve,
    onPass,
    onContinue
  } = props;

  const isResolved = state.currentPrompt.isComplete;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{state.currentPrompt.round.reference}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? (
            <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} />
          ) : null}
          <span className="pill pill-accent">{state.currentPrompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {state.currentPrompt.round.theme}</span>
      </div>

      <div className="scripture-screen">
        {buildCryptogramBoard(state.currentPrompt.round.verseText, state.currentPrompt.cipherMap, state.currentPrompt.attemptedLetters)}
      </div>

      <div className="chip-row">
        <span className="pill pill-muted">Remaining hidden letters: {getBibleCryptogramRemainingLetters(state)}</span>
        <span className="pill pill-muted">
          Solved letters:{" "}
          {state.currentPrompt.attemptedLetters.length > 0
            ? state.currentPrompt.attemptedLetters.join(", ").toUpperCase()
            : "none"}
        </span>
      </div>

      {!isResolved ? (
        <>
          {state.currentPrompt.phase === "letter" ? (
            <div className="guess-zone">
              <input
                className="text-input"
                maxLength={1}
                value={cryptogramLetter}
                onChange={(event) => onCryptogramLetterChange(event.target.value)}
                onKeyDown={(event) => submitOnEnter(event, onSubmitLetter, isTimerExpired)}
                placeholder="A-Z"
                disabled={isTimerExpired}
              />
              <button type="button" className="primary-button" onClick={onSubmitLetter} disabled={isTimerExpired}>
                Submit Letter
              </button>
            </div>
          ) : (
            <div className="solve-zone">
              <textarea
                className="text-area"
                rows={2}
                value={cryptogramSolveText}
                onChange={(event) => onCryptogramSolveChange(event.target.value)}
                onKeyDown={(event) => submitOnEnter(event, onSubmitSolve, isTimerExpired)}
                placeholder="Enter the fully solved text"
                disabled={isTimerExpired}
              />
              <div className="guess-zone">
                <button type="button" className="primary-button" onClick={onSubmitSolve} disabled={isTimerExpired}>
                  Submit Solve
                </button>
                <button type="button" className="secondary-button" onClick={onPass}>
                  Pass
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="answer-panel">{state.currentPrompt.round.verseText}</div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Next Round"}
          </button>
        </>
      )}
    </section>
  );
}

function BibleTimelineView(props: {
  state: BibleTimelineState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  onMove: (eventId: string, direction: "left" | "right") => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, onMove, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const eventById = new Map(prompt.round.events.map((event) => [event.id, event]));
  const arrangedEvents = prompt.arrangedEventIds.map((eventId) => eventById.get(eventId)).filter(Boolean);
  const orderedEvents = [...prompt.round.events].sort((left, right) => left.order - right.order);
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.prompt}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.events.length} events</span>
        </div>
      </div>

      {!isResolved ? (
        <>
          <div className="timeline-row">
            {arrangedEvents.map((event, index) =>
              event ? (
                <article key={event.id} className="timeline-card">
                  <span className="clue-card-label">Slot {index + 1}</span>
                  <strong>{event.label}</strong>
                  {event.clue ? <p>{event.clue}</p> : null}
                  <div className="mini-controls">
                    <button type="button" className="ghost-button icon-button" onClick={() => onMove(event.id, "left")}>
                      {"<"}
                    </button>
                    <button type="button" className="ghost-button icon-button" onClick={() => onMove(event.id, "right")}>
                      {">"}
                    </button>
                  </div>
                </article>
              ) : null
            )}
          </div>
          <div className="guess-zone">
            <button type="button" className="primary-button" onClick={onSubmit}>
              Submit Order
            </button>
            <button type="button" className="secondary-button" onClick={onPass}>
              Pass
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Correct Order</span>
            <strong>{prompt.wasCorrect ? "Solved" : "Revealed"}</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <div className="ordered-list">
            {orderedEvents.map((event, index) => (
              <div key={event.id} className="ordered-item">
                <span>{index + 1}</span>
                <strong>{event.label}</strong>
              </div>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Next Round"}
          </button>
        </>
      )}
    </section>
  );
}

function VerseScrambleView(props: {
  state: VerseScrambleState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  onMoveTile: (tileId: string, target: "answer" | "bank") => void;
  onClear: () => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, onMoveTile, onClear, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const tileById = new Map(prompt.tiles.map((tile) => [tile.id, tile]));
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.reference}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
      </div>

      {!isResolved ? (
        <>
          <div className="answer-drop">
            {prompt.answerTileIds.length === 0 ? (
              <span className="empty-answer">Build the verse here</span>
            ) : (
              prompt.answerTileIds.map((tileId) => {
                const tile = tileById.get(tileId);
                return tile ? (
                  <button key={tile.id} type="button" className="word-tile answer-word" onClick={() => onMoveTile(tile.id, "bank")}>
                    {tile.text}
                  </button>
                ) : null;
              })
            )}
          </div>

          <div className="word-bank">
            {prompt.bankTileIds.map((tileId) => {
              const tile = tileById.get(tileId);
              return tile ? (
                <button key={tile.id} type="button" className="word-tile" onClick={() => onMoveTile(tile.id, "answer")}>
                  {tile.text}
                </button>
              ) : null;
            })}
          </div>

          <div className="guess-zone">
            <button type="button" className="primary-button" onClick={onSubmit}>
              Submit Verse
            </button>
            <button type="button" className="ghost-button" onClick={onClear}>
              Clear
            </button>
            <button type="button" className="secondary-button" onClick={onPass}>
              Pass
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>{prompt.wasCorrect ? "Correct" : "Verse"}</span>
            <strong>{prompt.round.reference}</strong>
            <p>{prompt.round.verseText}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Next Round"}
          </button>
        </>
      )}
    </section>
  );
}

function BibleAnagramsView(props: {
  state: BibleAnagramsState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  onMoveTile: (tileId: string, target: "answer" | "bank") => void;
  onClear: () => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, onMoveTile, onClear, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const tileById = new Map(prompt.tiles.map((tile) => [tile.id, tile]));
  const isResolved = prompt.phase === "resolved";
  const showClue = prompt.round.difficulty !== "hard";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.category}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.difficulty}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
      </div>

      {showClue ? <p>{prompt.round.clue}</p> : null}

      {!isResolved ? (
        <>
          <div className="answer-drop">
            {prompt.answerTileIds.length === 0 ? (
              <span className="empty-answer">Build the answer here</span>
            ) : (
              prompt.answerTileIds.map((tileId) => {
                const tile = tileById.get(tileId);
                return tile ? (
                  <button key={tile.id} type="button" className="word-tile answer-word" onClick={() => onMoveTile(tile.id, "bank")}>
                    {tile.letter}
                  </button>
                ) : null;
              })
            )}
          </div>

          <div className="word-bank">
            {prompt.bankTileIds.map((tileId) => {
              const tile = tileById.get(tileId);
              return tile ? (
                <button key={tile.id} type="button" className="word-tile" onClick={() => onMoveTile(tile.id, "answer")}>
                  {tile.letter}
                </button>
              ) : null;
            })}
          </div>

          <div className="guess-zone">
            <button type="button" className="primary-button" onClick={onSubmit}>
              Submit Answer
            </button>
            <button type="button" className="ghost-button" onClick={onClear}>
              Clear
            </button>
            <button type="button" className="secondary-button" onClick={onPass}>
              Pass
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>{prompt.wasCorrect ? "Correct" : "Answer"}</span>
            <strong>{prompt.round.answer}</strong>
            <p>{prompt.round.teachingNote}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Next Round"}
          </button>
        </>
      )}
    </section>
  );
}

function BibleConnectionsView(props: {
  state: BibleConnectionsState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  onToggleTile: (tileId: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, onToggleTile, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const solvedGroupIds = new Set(prompt.solvedGroups.map((group) => group.groupId));
  const groupColorById = new Map(
    prompt.solvedGroups.map((group, index) => [group.groupId, CONNECTION_GROUP_COLORS[index % CONNECTION_GROUP_COLORS.length]])
  );
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.title}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.solvedGroups.length}/4 groups</span>
        </div>
      </div>

      <div className="solved-groups">
        {prompt.solvedGroups.map((group) => (
          <article
            key={group.groupId}
            className="solved-group"
            style={{ "--group-color": groupColorById.get(group.groupId) } as CSSProperties}
          >
            <strong>{group.category}</strong>
            <span>{group.items.join(", ")}</span>
          </article>
        ))}
      </div>

      <div className="connections-grid">
        {prompt.tiles.map((tile) => {
          const isSolved = solvedGroupIds.has(tile.groupId);
          const isSelected = prompt.selectedTileIds.includes(tile.id);
          const groupColor = groupColorById.get(tile.groupId);

          return (
            <button
              key={tile.id}
              type="button"
              className={`connection-tile ${isSelected ? "connection-tile-selected" : ""} ${isSolved ? "connection-tile-solved" : ""}`}
              style={{ "--group-color": groupColor } as CSSProperties}
              disabled={isSolved || isResolved}
              onClick={() => onToggleTile(tile.id)}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className="answer-panel answer-panel-correct">
            <span>Board Complete</span>
            <strong>All groups found</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Next Round"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="primary-button" onClick={onSubmit}>
            Submit Group
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function NameThatBookView(props: {
  state: NameThatBookState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, guessText, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onGuessChange, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">{prompt.phase === "steal" ? "Steal Attempt" : `Round ${state.roundIndex + 1}`}</p>
          <h2>Name That Book</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.revealedClues}/5 clues</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">{prompt.round.testament}</span>
        <span className="pill pill-muted">{prompt.round.category}</span>
      </div>

      <div className="clue-grid book-clue-grid">
        {prompt.round.clues.map((clue, index) => (
          <article key={index} className="clue-card">
            <span className="clue-card-label">Clue {index + 1}</span>
            <p>{index < prompt.revealedClues ? clue : "Hidden"}</p>
          </article>
        ))}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.winnerParticipantId ? "answer-panel-correct" : ""}`}>
            <span>{prompt.winnerParticipantId ? "Correct" : "Answer"}</span>
            <strong>{prompt.round.book}</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder="Enter the Bible book"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Guess
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function BeforeOrAfterView(props: {
  state: BeforeOrAfterState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  onAnswer: (answer: "left" | "right") => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, onAnswer, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Which Happened First?</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.theme}</span>
        </div>
      </div>

      <div className="before-after-grid">
        <article className={`event-choice ${isResolved && prompt.round.earlierEvent === "left" ? "event-choice-earlier" : ""}`}>
          <span className="clue-card-label">Left</span>
          <strong>{prompt.round.leftEvent}</strong>
        </article>
        <article className={`event-choice ${isResolved && prompt.round.earlierEvent === "right" ? "event-choice-earlier" : ""}`}>
          <span className="clue-card-label">Right</span>
          <strong>{prompt.round.rightEvent}</strong>
        </article>
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>{prompt.wasCorrect ? "Correct" : "Result"}</span>
            <strong>{prompt.round.earlierEvent === "left" ? "Left happened first" : "Right happened first"}</strong>
            <p>{prompt.round.explanation}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="primary-button" onClick={() => onAnswer("left")}>
            Left Happened First
          </button>
          <button type="button" className="primary-button" onClick={() => onAnswer("right")}>
            Right Happened First
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function ReferenceRushView(props: {
  state: ReferenceRushState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, guessText, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onGuessChange, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Reference Rush</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
      </div>

      <blockquote className="verse-card">{prompt.round.verseText}</blockquote>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Correct Reference</span>
            <strong>{prompt.round.reference}</strong>
            <p>{prompt.round.verseText}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder="Enter the scripture reference"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Reference
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function ChapterFinderView(props: {
  state: ChapterFinderState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, guessText, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onGuessChange, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const answer = `${prompt.round.answerBook} ${prompt.round.answerChapter}`;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Chapter Finder</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.theme}</span>
        </div>
      </div>

      <div className="prompt-card">
        <span className="prompt-banner-label">Prompt</span>
        <strong>{prompt.round.prompt}</strong>
        {prompt.round.clue ? <p>{prompt.round.clue}</p> : null}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Correct Answer</span>
            <strong>{answer}</strong>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder="Enter book and chapter"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Answer
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function WhoSaidItView(props: {
  state: WhoSaidItState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, guessText, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onGuessChange, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Who Said It?</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
      </div>

      <blockquote className="verse-card">{prompt.round.quote}</blockquote>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Correct Speaker</span>
            <strong>{prompt.round.speaker}</strong>
            <p>{prompt.round.reference}</p>
            <p>{prompt.round.context}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder="Enter the speaker"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Speaker
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function BibleBooksRelayView(props: {
  state: BibleBooksRelayState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  onMove: (book: string, direction: "left" | "right") => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, onMove, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.title}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.section}</span>
        </div>
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Correct Order</span>
            <strong>{prompt.wasCorrect ? "Solved" : "Revealed"}</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <div className="book-relay-grid">
            {prompt.round.books.map((book, index) => (
              <div key={book} className="book-relay-tile book-relay-answer">
                <span>{index + 1}</span>
                <strong>{book}</strong>
              </div>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <>
          <div className="book-relay-grid">
            {prompt.arrangedBooks.map((book, index) => (
              <div key={book} className="book-relay-tile">
                <span>{index + 1}</span>
                <strong>{book}</strong>
                <div className="mini-controls">
                  <button type="button" className="ghost-button icon-button" onClick={() => onMove(book, "left")}>
                    {"<"}
                  </button>
                  <button type="button" className="ghost-button icon-button" onClick={() => onMove(book, "right")}>
                    {">"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="guess-zone">
            <button type="button" className="primary-button" onClick={onSubmit}>
              Submit Order
            </button>
            <button type="button" className="secondary-button" onClick={onPass}>
              Pass
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function ProphecyMatchView(props: {
  state: ProphecyMatchState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onSelect: (cardType: "prophecy" | "fulfillment", cardId: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onSelect, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const getMatchColorClass = (pairId: string, status: "available" | "selected" | "matched") => {
    if (status !== "matched") {
      return "";
    }

    const matchedIndex = prompt.matchedPairIds.indexOf(pairId);
    return `prophecy-match-color-${Math.max(0, matchedIndex) % PROPHECY_MATCH_COLOR_COUNT}`;
  };

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Match Board</p>
          <h2>Prophecy Match Challenge</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.matchedPairIds.length}/{state.totalPrompts} matched</span>
        </div>
      </div>

      <div className="prophecy-match-layout">
        <div className="prophecy-column">
          <span className="clue-card-label">Prophecy Cards</span>
          <div className="prophecy-card-grid">
            {prompt.prophecyCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`prophecy-card-button prophecy-card-${card.status} ${getMatchColorClass(card.pairId, card.status)}`}
                disabled={isTimerExpired || card.status === "matched" || isResolved}
                onClick={() => onSelect("prophecy", card.id)}
              >
                <strong>{card.reference}</strong>
                <span>{card.summary}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="prophecy-column">
          <span className="clue-card-label">Fulfillment Cards</span>
          <div className="prophecy-card-grid">
            {prompt.fulfillmentCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`prophecy-card-button prophecy-card-${card.status} ${getMatchColorClass(card.pairId, card.status)}`}
                disabled={isTimerExpired || card.status === "matched" || isResolved}
                onClick={() => onSelect("fulfillment", card.id)}
              >
                <strong>{card.reference}</strong>
                <span>{card.summary}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isResolved ? (
        <>
          <div className="answer-panel answer-panel-correct">
            <span>Board Complete</span>
            <strong>All prophecy pairs matched</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            Show Final Standings
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Match
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

type PsalmProverbChoiceState = CompleteVerseState | WisdomMatchState | PsalmThemeState | PsalmReferenceFinderState;

function PsalmProverbChoiceView(props: {
  state: PsalmProverbChoiceState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onChoose: (choice: string) => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onChoose, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";

  let heading = "";
  let label = "";
  let lead = "";
  let detail = "";
  let answerLabel = "";
  let answer = "";
  let answerDetail = "";
  let meta: string[] = [];
  let eliminated: string[] = [];
  let choices: string[] = [];

  if (state.gameId === "complete-the-verse") {
    const round = state.currentPrompt.round;
    heading = "Complete the Verse Challenge";
    label = round.reference;
    lead = round.verseStart;
    detail = "Choose the correct KJV ending.";
    answerLabel = "Verse Ending";
    answer = round.correctEnding;
    answerDetail = `${round.reference}: ${round.verseStart} ${round.correctEnding}`;
    meta = [round.book, round.theme, round.difficulty];
    eliminated = state.currentPrompt.eliminatedChoices;
    choices = round.choices;
  } else if (state.gameId === "wisdom-match") {
    const round = state.currentPrompt.round;
    heading = "Wisdom Match Challenge";
    label = round.reference;
    lead = round.verseTextShort;
    detail = "Choose the matching wisdom theme.";
    answerLabel = "Wisdom Theme";
    answer = round.correctTheme;
    answerDetail = round.reference;
    meta = [round.difficulty];
    eliminated = state.currentPrompt.eliminatedChoices;
    choices = round.choices;
  } else if (state.gameId === "psalm-theme") {
    const round = state.currentPrompt.round;
    heading = "Psalm Theme Challenge";
    label = round.reference;
    lead = round.excerpt;
    detail = "Choose the major Psalm theme.";
    answerLabel = "Psalm Theme";
    answer = round.correctTheme;
    answerDetail = round.reference;
    meta = [round.difficulty];
    eliminated = state.currentPrompt.eliminatedChoices;
    choices = round.choices;
  } else {
    const round = state.currentPrompt.round;
    heading = "Psalm Reference Finder";
    label = "Psalm Excerpt";
    lead = round.excerpt;
    detail = "Choose the correct Psalm reference.";
    answerLabel = "Psalm Reference";
    answer = round.correctReference;
    answerDetail = round.theme;
    meta = [round.theme, round.difficulty];
    eliminated = state.currentPrompt.eliminatedReferences;
    choices = round.choices;
  }

  const possiblePoints = eliminated.length >= 3 ? 1 : 5 - eliminated.length;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{heading}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{possiblePoints} pts available</span>
        </div>
      </div>

      <div className="prophecy-prompt">
        <span className="prompt-banner-label">{label}</span>
        <strong className="fulfillment-verse-text">{lead}</strong>
        <p>{detail}</p>
      </div>

      <div className="chip-row compact-row">
        {meta.map((entry) => (
          <span key={entry} className="pill pill-muted">{entry}</span>
        ))}
      </div>

      <div className="choice-grid">
        {choices.map((choice) => {
          const isEliminated = eliminated.includes(choice);
          return (
            <button
              key={choice}
              type="button"
              className={`choice-button ${state.gameId === "psalm-reference-finder" ? "choice-button-reference" : ""} ${isEliminated ? "choice-button-eliminated" : ""}`}
              disabled={isTimerExpired || isResolved || isEliminated}
              onClick={() => onChoose(choice)}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>{answerLabel}</span>
            <strong>{answer}</strong>
            <p>{answerDetail}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function MessiahProphecyView(props: {
  state: MessiahProphecyState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onChoose: (choice: string) => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onChoose, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const possiblePoints = prompt.eliminatedChoices.length >= 3 ? 1 : 5 - prompt.eliminatedChoices.length;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Messiah Prophecy Challenge</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{possiblePoints} pts available</span>
        </div>
      </div>

      <div className="prophecy-prompt">
        <span className="prompt-banner-label">{prompt.round.prophecyReference}</span>
        <strong>{prompt.round.prophecyTextShort}</strong>
        <p>{prompt.round.prompt}</p>
      </div>
      <div className="chip-row compact-row">
        <span className="pill pill-muted">{prompt.round.theme}</span>
        <span className="pill pill-muted">{prompt.round.difficulty}</span>
      </div>

      <div className="choice-grid">
        {prompt.round.choices.map((choice) => {
          const isEliminated = prompt.eliminatedChoices.includes(choice);
          return (
            <button
              key={choice}
              type="button"
              className={`choice-button ${isEliminated ? "choice-button-eliminated" : ""}`}
              disabled={isTimerExpired || isResolved || isEliminated}
              onClick={() => onChoose(choice)}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Fulfillment</span>
            <strong>{prompt.round.correctAnswer}</strong>
            <p>{prompt.round.fulfillmentReference}: {prompt.round.fulfillmentSummary}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function ProphecyClueLadderView(props: {
  state: ProphecyClueLadderState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, guessText, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onGuessChange, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const inputDisabled = isTimerExpired || prompt.guessingDisabled;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Prophecy Clue Ladder</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.revealedClues}/5 clues</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">{prompt.round.theme}</span>
        <span className="pill pill-muted">{prompt.round.reference}</span>
        <span className="pill pill-muted">{prompt.round.fulfillmentReference}</span>
      </div>

      <div className="clue-grid prophecy-clue-grid">
        {prompt.round.clues.map((clue, index) => (
          <article key={index} className="clue-card">
            <span className="clue-card-label">Clue {index + 1}</span>
            <p>{index < prompt.revealedClues ? clue : "Hidden"}</p>
          </article>
        ))}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Answer</span>
            <strong>{prompt.round.answer}</strong>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, inputDisabled)}
            placeholder={prompt.guessingDisabled ? "Pass to reveal answer" : "Enter answer"}
            disabled={inputDisabled}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={inputDisabled}>
            Submit Guess
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function FulfillmentFinderView(props: {
  state: FulfillmentFinderState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onChoose: (reference: string) => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onChoose, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const possiblePoints = prompt.eliminatedReferences.length >= 3 ? 1 : 5 - prompt.eliminatedReferences.length;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Fulfillment Finder Challenge</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{possiblePoints} pts available</span>
        </div>
      </div>

      <div className="prophecy-prompt">
        <span className="prompt-banner-label">{prompt.round.fulfillmentReference}</span>
        <strong className="fulfillment-verse-text">{prompt.round.fulfillmentText}</strong>
        <p>{prompt.round.fulfillmentSummary}</p>
        <p>{prompt.round.prompt}</p>
      </div>

      <div className="choice-grid">
        {prompt.round.choices.map((choice) => {
          const isEliminated = prompt.eliminatedReferences.includes(choice.reference);
          return (
            <button
              key={choice.reference}
              type="button"
              className={`choice-button choice-button-reference ${isEliminated ? "choice-button-eliminated" : ""}`}
              disabled={isTimerExpired || isResolved || isEliminated}
              onClick={() => onChoose(choice.reference)}
            >
              <strong>{choice.reference}</strong>
              <span>{choice.summary}</span>
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Connected Prophecy</span>
            <strong>{prompt.round.correctProphecyReference}</strong>
            <p>{prompt.round.correctProphecySummary}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function ProphecyCategoriesView(props: {
  state: ProphecyCategoriesState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onSelectCard: (cardId: string) => void;
  onSelectCategory: (category: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onSelectCard, onSelectCategory, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const sortedIds = new Set(prompt.sortedCardIds);

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Sorting Board</p>
          <h2>Prophecy Categories Challenge</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.sortedCardIds.length}/{prompt.cards.length} sorted</span>
        </div>
      </div>

      <div className="category-choice-row">
        {prompt.round.categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-choice ${prompt.selectedCategory === category ? "category-choice-selected" : ""}`}
            disabled={isTimerExpired || isResolved}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="prophecy-category-grid">
        {prompt.cards.map((card) => {
          const isSorted = sortedIds.has(card.cardId);
          return (
            <button
              key={card.cardId}
              type="button"
              className={`prophecy-sort-card ${prompt.selectedCardId === card.cardId ? "prophecy-sort-card-selected" : ""} ${isSorted ? "prophecy-sort-card-sorted" : ""}`}
              disabled={isTimerExpired || isResolved || isSorted}
              onClick={() => onSelectCard(card.cardId)}
            >
              <strong>{card.reference}</strong>
              <span>{card.summary}</span>
              {isSorted ? <em>{card.category}</em> : null}
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className="answer-panel answer-panel-correct">
            <span>Board Complete</span>
            <strong>All cards sorted</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            Show Final Standings
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Category
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function ProverbCategoriesView(props: {
  state: ProverbCategoriesState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onSelectCard: (cardId: string) => void;
  onSelectCategory: (category: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onSelectCard, onSelectCategory, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const sortedIds = new Set(prompt.sortedCardIds);

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Sorting Board</p>
          <h2>Proverb Categories Challenge</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.sortedCardIds.length}/{prompt.cards.length} sorted</span>
        </div>
      </div>

      <div className="category-choice-row">
        {prompt.round.categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-choice ${prompt.selectedCategory === category ? "category-choice-selected" : ""}`}
            disabled={isTimerExpired || isResolved}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="prophecy-category-grid">
        {prompt.cards.map((card) => {
          const isSorted = sortedIds.has(card.cardId);
          return (
            <button
              key={card.cardId}
              type="button"
              className={`prophecy-sort-card ${prompt.selectedCardId === card.cardId ? "prophecy-sort-card-selected" : ""} ${isSorted ? "prophecy-sort-card-sorted" : ""}`}
              disabled={isTimerExpired || isResolved || isSorted}
              onClick={() => onSelectCard(card.cardId)}
            >
              <strong>{card.reference}</strong>
              <span>{card.textShort}</span>
              {isSorted ? <em>{card.category}</em> : null}
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className="answer-panel answer-panel-correct">
            <span>Board Complete</span>
            <strong>All cards sorted</strong>
            {prompt.resolvedMessage ? <p>{prompt.resolvedMessage}</p> : null}
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            Show Final Standings
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Category
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function MissingWordView(props: {
  state: MissingWordState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, guessText, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onGuessChange, onSubmit, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const answer = prompt.round.missingWords.join(" ");

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.reference}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
        <span className="pill pill-muted">{prompt.round.missingWords.length} blank{prompt.round.missingWords.length === 1 ? "" : "s"}</span>
      </div>

      <blockquote className="verse-card verse-card-missing">{buildMissingWordVerse(prompt.round)}</blockquote>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Correct Missing Word</span>
            <strong>{answer}</strong>
            <p>{prompt.round.verseText}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder="Enter missing word or phrase"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Answer
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function TwoTruthsView(props: {
  state: TwoTruthsAndALieState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onChoose: (statementIndex: number) => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onChoose, onPass, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const possiblePoints = prompt.eliminatedIndexes.length >= 3 ? 1 : 5 - prompt.eliminatedIndexes.length;
  const lieStatement = prompt.statements.find((entry) => entry.originalIndex === prompt.round.lieIndex);

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.subject}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{possiblePoints} pts available</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">{prompt.round.subjectType === "person" ? "Person" : "Event"}</span>
        <span className="pill pill-muted">{prompt.round.theme}</span>
        <span className="pill pill-muted">{prompt.round.difficulty}</span>
      </div>

      <p>Which statement is the lie?</p>

      <div className="choice-grid">
        {prompt.statements.map((statement) => {
          const isEliminated = prompt.eliminatedIndexes.includes(statement.originalIndex);
          return (
            <button
              key={statement.originalIndex}
              type="button"
              className={`choice-button ${isEliminated ? "choice-button-eliminated" : ""}`}
              disabled={isTimerExpired || isResolved || isEliminated}
              onClick={() => onChoose(statement.originalIndex)}
            >
              {statement.text}
            </button>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>The Lie</span>
            <strong>{lieStatement?.text ?? prompt.round.statements[prompt.round.lieIndex]}</strong>
            <p>{prompt.round.explanation} ({prompt.round.reference})</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass
          </button>
        </div>
      )}
    </section>
  );
}

function RelayVerseBuildView(props: {
  state: RelayVerseBuildState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onSkipWord: () => void;
  onContinue: () => void;
}) {
  const {
    state,
    guessText,
    timerEnabled,
    timeRemaining,
    timerDurationSeconds,
    isTimerExpired,
    onGuessChange,
    onSubmit,
    onSkipWord,
    onContinue
  } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const displayText = prompt.words
    .map((word, index) => (index < prompt.revealedCount ? word : "▬".repeat(Math.max(3, word.length))))
    .join(" ");

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.reference}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
        <span className="pill pill-muted">
          {prompt.revealedCount} of {prompt.words.length} words
        </span>
      </div>

      <blockquote className="verse-card">{displayText}</blockquote>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Full Verse</span>
            <strong>{prompt.round.verseText}</strong>
            <p>{prompt.round.teachingNote}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder="Type the next word"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Word
          </button>
          <button type="button" className="secondary-button" onClick={onSkipWord}>
            Skip Word
          </button>
        </div>
      )}
    </section>
  );
}

function VerseTypingRaceView(props: {
  state: VerseTypingRaceState;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onSubmitResult: (result: { typedText: string; elapsedMs: number }) => void;
  onContinue: () => void;
}) {
  const { state, timerEnabled, timeRemaining, timerDurationSeconds, isTimerExpired, onSubmitResult, onContinue } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const [typedText, setTypedText] = useState("");
  const startedAtRef = useRef<number | null>(null);
  const activeGuessKey = `${state.gameId}-${state.roundIndex}-${state.turnIndex}`;
  const previousKeyRef = useRef(activeGuessKey);

  if (previousKeyRef.current !== activeGuessKey) {
    previousKeyRef.current = activeGuessKey;
    startedAtRef.current = null;
    if (typedText !== "") {
      setTypedText("");
    }
  }

  const verseText = prompt.round.verseText;

  function handleChange(value: string) {
    if (startedAtRef.current === null && value.length > 0) {
      startedAtRef.current = Date.now();
    }
    setTypedText(value);
  }

  function handleFinish() {
    const elapsedMs = startedAtRef.current ? Date.now() - startedAtRef.current : 1;
    onSubmitResult({ typedText, elapsedMs });
  }

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>{prompt.round.reference}</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.sourceTranslation}</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">Theme: {prompt.round.theme}</span>
      </div>

      <blockquote className="verse-card">
        {Array.from(verseText).map((character, index) => {
          let className = "char-untyped";
          if (index < typedText.length) {
            className = typedText[index] === character ? "char-correct" : "char-incorrect";
          }
          return (
            <span key={index} className={className}>
              {character}
            </span>
          );
        })}
      </blockquote>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>Result</span>
            <strong>
              {prompt.lastResult ? `${Math.round(prompt.lastResult.wpm)} WPM · ${Math.round(prompt.lastResult.accuracy * 100)}% accuracy` : "Recorded"}
            </strong>
            <p>{prompt.round.teachingNote}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <textarea
            className="text-area"
            rows={3}
            value={typedText}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Start typing the verse above"
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={handleFinish} disabled={isTimerExpired}>
            Finish
          </button>
        </div>
      )}
    </section>
  );
}

function WordLadderView(props: {
  state: WordLadderState;
  guessText: string;
  timerEnabled: boolean;
  timeRemaining: number;
  timerDurationSeconds: number;
  isTimerExpired: boolean;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onRemoveLastRung: () => void;
  onPass: () => void;
  onContinue: () => void;
}) {
  const {
    state,
    guessText,
    timerEnabled,
    timeRemaining,
    timerDurationSeconds,
    isTimerExpired,
    onGuessChange,
    onSubmit,
    onRemoveLastRung,
    onPass,
    onContinue
  } = props;
  const prompt = state.currentPrompt;
  const isResolved = prompt.phase === "resolved";
  const canRemoveRung = prompt.chain.length > 1;

  return (
    <section className="panel panel-stage">
      <div className="section-header">
        <div>
          <p className="eyebrow">Round {state.roundIndex + 1}</p>
          <h2>Word Ladder</h2>
        </div>
        <div className="header-status">
          {!isResolved ? <TimerBadge isEnabled={timerEnabled} timeRemaining={timeRemaining} durationSeconds={timerDurationSeconds} /> : null}
          <span className="pill pill-accent">{prompt.round.minSteps} steps to par</span>
        </div>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-muted">{prompt.round.theme}</span>
        <span className="pill pill-muted">{prompt.round.difficulty}</span>
      </div>

      <div className="chip-row compact-row">
        <span className="pill pill-accent">{prompt.round.startWord.toUpperCase()}</span>
        <span>{prompt.round.startFlavorText}</span>
      </div>
      <div className="chip-row compact-row">
        <span className="pill pill-accent">{prompt.round.endWord.toUpperCase()}</span>
        <span>{prompt.round.endFlavorText}</span>
      </div>

      <div className="chip-row compact-row">
        {prompt.chain.map((word, index) => {
          const isLastRung = index === prompt.chain.length - 1;
          const isStartWord = index === 0;

          return (
            <span key={`${word}-${index}`} className="pill pill-muted word-ladder-rung">
              {word.toUpperCase()}
              {!isResolved && isLastRung && !isStartWord ? (
                <button
                  type="button"
                  className="word-ladder-rung-remove"
                  onClick={onRemoveLastRung}
                  aria-label={`Remove "${word}" from the ladder`}
                  title="Remove this rung"
                >
                  ×
                </button>
              ) : null}
            </span>
          );
        })}
      </div>

      {isResolved ? (
        <>
          <div className={`answer-panel ${prompt.wasCorrect ? "answer-panel-correct" : ""}`}>
            <span>{prompt.wasCorrect ? "Ladder Solved" : "Ladder Revealed"}</span>
            <strong>{prompt.round.revealPath.join(" → ").toUpperCase()}</strong>
            <p>{prompt.round.teachingNote}</p>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {state.roundIndex + 1 >= state.totalPrompts ? "Show Final Standings" : "Continue"}
          </button>
        </>
      ) : (
        <div className="guess-zone">
          <input
            className="text-input"
            value={guessText}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmit, isTimerExpired)}
            placeholder={`Enter a ${prompt.round.wordLength}-letter word`}
            disabled={isTimerExpired}
          />
          <button type="button" className="primary-button" onClick={onSubmit} disabled={isTimerExpired}>
            Submit Word
          </button>
          <button type="button" className="secondary-button" onClick={onRemoveLastRung} disabled={!canRemoveRung}>
            Undo Last Rung
          </button>
          <button type="button" className="secondary-button" onClick={onPass}>
            Pass to Next
          </button>
        </div>
      )}
    </section>
  );
}
