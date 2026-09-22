import { test, expect } from "../fixtures/apps";

test("visual project can launch the challenge app", async ({ challengeApp }) => {
  await expect.poll(() => challengeApp.page.locator("h1").first().textContent()).toBe("Bible Challenge");
});
