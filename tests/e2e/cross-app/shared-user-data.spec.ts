import { test, expect } from "../fixtures/apps";

test("launches both apps against the same isolated userData directory", async ({ challengeApp, adminApp, userDataDir }) => {
  expect(challengeApp.userDataDir).toBe(userDataDir);
  expect(adminApp.userDataDir).toBe(userDataDir);

  await expect.poll(() => challengeApp.page.locator("h1").first().textContent()).toBe("Bible Challenge");
  await expect.poll(() => adminApp.page.locator("h1").first().textContent()).toBe("Bible Challenge Admin Console");
});
