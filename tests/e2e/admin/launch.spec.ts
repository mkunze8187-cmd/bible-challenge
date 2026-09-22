import { test, expect } from "../fixtures/apps";

test("launches the admin console against built dist with the test hook enabled", async ({ adminApp }) => {
  await expect.poll(() => adminApp.page.locator("h1").first().textContent()).toBe("Bible Challenge Admin Console");

  await expect
    .poll(() => adminApp.page.evaluate(() => window.__bibleChallengeAdminTest?.getActiveTab()))
    .toBe("content");

  await expect.poll(() => adminApp.page.evaluate(() => window.__bibleChallengeAdminTest?.isLocked())).toBe(false);
});
