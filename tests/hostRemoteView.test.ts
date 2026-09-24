import { describe, expect, it } from "vitest";
import {
  createSessionState,
  getPromptId,
  selectBoardCard,
  setCurrentActor,
  type FiveGuessesState,
  type ProphecyMatchState,
  type ScriptureState
} from "../src/lib/gameEngine";
import { guardHostCommand, toHostRemoteView } from "../src/lib/hostRemoteView";
import { setRandomSeed } from "../src/lib/random";

describe("host remote command guard", () => {
  it("rejects stale prompt and stale version commands", () => {
    expect(guardHostCommand({ type: "mark-correct", promptId: "old" }, { currentPromptId: "new", stateVersion: 4 }))
      .toBe("stale-prompt");
    expect(guardHostCommand({ type: "mark-correct", stateVersion: 3 }, { currentPromptId: "new", stateVersion: 4 }))
      .toBe("stale-version");
    expect(guardHostCommand({ type: "mark-correct", promptId: "new", stateVersion: 4 }, { currentPromptId: "new", stateVersion: 4 }))
      .toBeNull();
  });
});

describe("toHostRemoteView", () => {
  it("projects a board-game host view with answer key, score, timer, undo, prompt id, and state version", async () => {
    setRandomSeed(10);
    const state = (await createSessionState({
      gameId: "five-guesses",
      participantMode: "individual",
      individualNames: ["Anna", "Ben"],
      maxPrompts: 1
    })) as FiveGuessesState;
    const card = state.boardCards.find((entry) => entry.status === "available");
    if (!card) {
      throw new Error("Expected an available board card.");
    }

    const selectedState = selectBoardCard(state, card.id).nextState as FiveGuessesState;
    const activeState = setCurrentActor(selectedState, "player-ben-2").nextState as FiveGuessesState;
    const view = toHostRemoteView(activeState, {
      stateVersion: 7,
      timeRemaining: 42,
      timerEnabled: true,
      isTimerPaused: false,
      answerClockRemaining: 9,
      selectedAnswererId: "player-ben-2",
      undoLabel: "Ben selected"
    });

    expect(view).toMatchObject({
      v: 1,
      gameId: "five-guesses",
      stateVersion: 7,
      promptId: getPromptId(activeState),
      timer: { enabled: true, paused: false, remainingSeconds: 42, answerClockSeconds: 9 },
      currentParticipantId: "player-ben-2",
      selectedAnswererId: "player-ben-2",
      undoLabel: "Ben selected"
    });
    expect(view.host?.answer).toBe(card.round.answer);
    expect(view.scoreboard).toHaveLength(2);
    expect(view.selectedAwardPoints).toBe(card.boardValue);
    expect(JSON.stringify(view).length).toBeLessThan(16_384);
  });

  it("projects scripture and matching-game host notes without exposing full app settings", async () => {
    setRandomSeed(20);
    const scripture = (await createSessionState({
      gameId: "scripture-puzzles",
      participantMode: "individual",
      individualNames: ["Anna"],
      maxPrompts: 1
    })) as ScriptureState;
    const scriptureView = toHostRemoteView(scripture, {
      stateVersion: 1,
      timeRemaining: 60,
      timerEnabled: true,
      isTimerPaused: true,
      answerClockRemaining: 0,
      selectedAnswererId: null,
      undoLabel: null
    });

    expect(scriptureView.host?.answer).toContain(scripture.currentPrompt.round.reference);
    expect(scriptureView.host?.verse).toBeTruthy();
    expect(scriptureView).not.toHaveProperty("settings");
    expect(scriptureView).not.toHaveProperty("contentPacks");

    const prophecy = (await createSessionState({
      gameId: "prophecy-match",
      participantMode: "individual",
      individualNames: ["Anna"],
      maxPrompts: 1
    })) as ProphecyMatchState;
    const prophecyView = toHostRemoteView(prophecy, {
      stateVersion: 2,
      timeRemaining: 75,
      timerEnabled: true,
      isTimerPaused: false,
      answerClockRemaining: 0,
      selectedAnswererId: null,
      undoLabel: null
    });

    expect(prophecyView.promptId).toBe(getPromptId(prophecy));
    expect(prophecyView.buzzTurnPolicy).toBe("buzz-replaces-turn");
    expect(JSON.stringify(prophecyView).length).toBeLessThan(16_384);
  });
});
