import { test, expect } from "../fixtures/apps";

test("launches the challenge app against built dist with the test hook enabled", async ({ challengeApp }) => {
  await expect.poll(() => challengeApp.page.locator("h1").first().textContent()).toBe("Bible Challenge");

  await expect
    .poll(() => challengeApp.page.evaluate(() => window.__bibleChallengeTest?.getScreen()))
    .toBe("menu");

  const settings = await challengeApp.page.evaluate(() => window.__bibleChallengeTest?.getSettings());
  expect(settings?.colorTheme).toBe("classic");
});
