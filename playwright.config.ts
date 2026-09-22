import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "challenge",
      testMatch: /challenge\/.*\.spec\.ts/
    },
    {
      name: "admin",
      testMatch: /admin\/.*\.spec\.ts/
    },
    {
      name: "cross-app",
      testMatch: /cross-app\/.*\.spec\.ts/
    },
    {
      name: "visual",
      testMatch: /visual\/.*\.spec\.ts/
    }
  ],
  outputDir: "test-results"
});
