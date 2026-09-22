import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import packageJson from "../package.json";
import { GAME_LIBRARY, type SessionState } from "../src/lib/gameEngine";
import { loadGameContent } from "../src/lib/content";
import type { GameId } from "../src/types/gameData";
import {
  GAME_PLAYERS,
  assertBasicInvariants,
  createCustomContentSession,
  createSingleRoundCustomSession,
  createTestSession,
  gameIds,
  playToCompletion
} from "./helpers/gamePlayers";

function stableSessionShape(state: SessionState) {
  return {
    gameId: state.gameId,
    status: state.status,
    totalPrompts: state.totalPrompts,
    resolvedPrompts: state.resolvedPrompts,
    sessionTitle: state.sessionTitle,
    sessionTheme: state.sessionTheme
  };
}

describe("Layer 1 game play-through coverage", () => {
  it("has a GamePlayer for every registered game", () => {
    expect(Object.keys(GAME_PLAYERS).sort()).toEqual(Object.keys(GAME_LIBRARY).sort());
  });

  it.each(gameIds())("plays %s start-to-finish with all-correct actions", async (gameId) => {
    const state = await createTestSession(gameId, { maxPrompts: undefined });
    assertBasicInvariants(state);

    const finalState = await playToCompletion(state);

    expect(finalState.status).toBe("completed");
    expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
    expect(finalState.activityLog[0]?.text.trim()).toBeTruthy();
    expect(Object.values(finalState.stats).some((stats) => stats.totalScore > 0 || stats.roundWins > 0)).toBe(true);
  });

  const passResolvableGameIds = gameIds().filter(
    (gameId) => !["bible-connections", "scripture-puzzles", "bible-cryptogram"].includes(gameId)
  );

  it.each(passResolvableGameIds)("plays %s start-to-finish with all-pass actions", async (gameId) => {
    const state = await createTestSession(gameId, { individualNames: ["Anna"], maxPrompts: 2 });

    const finalState = await playToCompletion(state, "pass");

    expect(finalState.status).toBe("completed");
    expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
    expect(Object.values(finalState.stats).every((stats) => stats.totalScore === 0)).toBe(true);
  });

  it.each(gameIds())("plays %s start-to-finish with a short session", async (gameId) => {
    const state = await createTestSession(gameId, { maxPrompts: 2 });

    expect(state.totalPrompts).toBeLessThanOrEqual(2);

    const finalState = await playToCompletion(state);

    expect(finalState.status).toBe("completed");
    expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
  });

  it.each(gameIds())(
    "plays %s start-to-finish with mixed correct and pass actions",
    async (gameId) => {
      const state = await createTestSession(gameId, { maxPrompts: 3 });

      const finalState = await playToCompletion(state, "mixed");

      expect(finalState.status).toBe("completed");
      expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
      expect(Object.values(finalState.stats).some((stats) => stats.totalScore > 0)).toBe(true);
    }
  );

  it.each(gameIds())(
    "plays %s start-to-finish in team mode",
    async (gameId) => {
      const state = await createTestSession(gameId, { participantMode: "teams", maxPrompts: 1 });
      expect(state.participantMode).toBe("teams");
      expect(state.participants).toHaveLength(2);

      const finalState = await playToCompletion(state);

      expect(finalState.status).toBe("completed");
      expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
    }
  );

  it.each(gameIds())("plays %s start-to-finish with custom content only", async (gameId) => {
    const state = await createCustomContentSession(gameId);

    const finalState = await playToCompletion(state);

    expect(finalState.status).toBe("completed");
    expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
  });

  const isolatedRoundGameIds = gameIds().filter((gameId) => !["five-guesses", "initials"].includes(gameId));

  it.each(isolatedRoundGameIds)("accepts every built-in %s answer through its game player", async (gameId) => {
    const pack = await loadGameContent(gameId);
    const rounds = (pack.sessions as Array<{ rounds: unknown[] }>).flatMap((session) => session.rounds);

    for (const round of rounds) {
      const state = await createSingleRoundCustomSession(gameId, round);
      const finalState = await playToCompletion(state);

      expect(finalState.status).toBe("completed");
      expect(finalState.resolvedPrompts).toBe(finalState.totalPrompts);
      expect(Object.values(finalState.stats).some((stats) => stats.totalScore > 0 || stats.roundWins > 0)).toBe(true);
    }
  });

  it.each(gameIds())("creates deterministic %s sessions from the same seed", async (gameId) => {
    const first = await createTestSession(gameId, { seed: 12345 });
    const second = await createTestSession(gameId, { seed: 12345 });

    expect(stableSessionShape(second)).toEqual(stableSessionShape(first));
  });

  it("keeps the admin app name aligned with the packaged product name", async () => {
    const adminMain = await readFile("admin/electron/main.js", "utf8");
    const setNameMatch = adminMain.match(/app\.setName\(\s*["']([^"']+)["']\s*\)/);

    expect(setNameMatch?.[1]).toBe(packageJson.build.productName);
  });
});
