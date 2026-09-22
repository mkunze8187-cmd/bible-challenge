import type { Page } from "playwright";
import type { GameId, SessionState } from "../../../src/lib/gameEngine";

export async function getChallengeScreen(page: Page): Promise<string> {
  return page.evaluate(() => window.__bibleChallengeTest?.getScreen() ?? "unknown");
}

export async function getSessionState(page: Page): Promise<SessionState | null> {
  return page.evaluate(() => window.__bibleChallengeTest?.getSessionState() ?? null);
}

export async function startGameFromMenu(page: Page, gameId: GameId): Promise<void> {
  await page.evaluate((targetGameId) => {
    const hook = window.__bibleChallengeTest;
    if (!hook) {
      throw new Error("Bible Challenge test hook is not available.");
    }

    const button = Array.from(document.querySelectorAll("button")).find((entry) =>
      entry.textContent?.toLowerCase().includes(targetGameId.replace(/-/g, " "))
    );

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Could not find a menu button for ${targetGameId}.`);
    }

    button.click();
  }, gameId);
}
