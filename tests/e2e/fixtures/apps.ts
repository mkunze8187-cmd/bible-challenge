import { test as base, expect, type Page } from "@playwright/test";
import { _electron as electron, type ElectronApplication } from "playwright";
import path from "node:path";
import { createConsoleGuard, type ConsoleGuard } from "./consoleGuard";
import { dialogs, type DialogFixtures } from "./dialogs";
import { startFixtureServer, type FixtureServer } from "./fixtureServer";
import { createUserDataDir, removeUserDataDir } from "./userData";

export interface LaunchedElectronApp {
  app: ElectronApplication;
  page: Page;
  userDataDir: string;
  consoleGuard: ConsoleGuard;
}

const electronExecutablePath = require("electron") as string;

interface WorkerFixtures {
  fixtureServer: FixtureServer;
}

interface TestFixtures {
  profileName: string;
  userDataDir: string;
  challengeApp: LaunchedElectronApp;
  adminApp: LaunchedElectronApp;
  dialogs: DialogFixtures;
}

function e2eEnv(userDataDir: string, fixtureServer: FixtureServer): Record<string, string> {
  const inheritedKeys = [
    "PATH",
    "Path",
    "PATHEXT",
    "SystemRoot",
    "WINDIR",
    "TEMP",
    "TMP",
    "USERPROFILE",
    "LOCALAPPDATA",
    "APPDATA",
    "ComSpec",
    "PROCESSOR_ARCHITECTURE"
  ];
  const env: Record<string, string> = {};
  for (const key of inheritedKeys) {
    const value = process.env[key];
    if (typeof value === "string") {
      env[key] = value;
    }
  }

  return {
    ...env,
    BIBLE_CHALLENGE_E2E: "1",
    BIBLE_CHALLENGE_E2E_SEED: "8187",
    BIBLE_CHALLENGE_E2E_MAX_PROMPTS: "2",
    BIBLE_CHALLENGE_USER_DATA_DIR: userDataDir,
    BIBLE_CHALLENGE_UPDATES_URL: fixtureServer.baseUrl,
    BIBLE_CHALLENGE_FEEDBACK_URL: `${fixtureServer.baseUrl}/feedback`
  };
}

async function installExternalLinkStub(app: ElectronApplication): Promise<void> {
  await app.evaluate(({ shell }) => {
    const globalState = globalThis as typeof globalThis & { __openExternalCalls?: string[] };
    globalState.__openExternalCalls ??= [];
    shell.openExternal = async (url: string) => {
      globalState.__openExternalCalls?.push(url);
    };
  });
}

async function launchBuiltApp(options: {
  appName: "challenge" | "admin";
  appRoot: string;
  userDataDir: string;
  fixtureServer: FixtureServer;
}): Promise<LaunchedElectronApp> {
  const app = await electron.launch({
    executablePath: electronExecutablePath,
    args: ["--disable-gpu", "--disable-gpu-sandbox", "--no-sandbox", options.appRoot],
    cwd: options.appRoot,
    env: e2eEnv(options.userDataDir, options.fixtureServer)
  });
  const page = await waitForAppWindow(app, options.appName);
  const consoleGuard = createConsoleGuard(options.appName, app);
  consoleGuard.attach(page);
  await installExternalLinkStub(app);

  return { app, page, userDataDir: options.userDataDir, consoleGuard };
}

async function waitForAppWindow(app: ElectronApplication, appName: "challenge" | "admin"): Promise<Page> {
  const expectedPath = appName === "admin" ? "/admin/dist/index.html" : "/dist/index.html";
  const page = await app.firstWindow({ timeout: 15_000 });
  await page.waitForLoadState("domcontentloaded", { timeout: 15_000 });
  await expect.poll(() => page.url().replace(/\\/g, "/")).toContain(expectedPath);
  return page;
}

async function closeLaunchedApp(launched: LaunchedElectronApp): Promise<void> {
  try {
    await launched.page.waitForTimeout(250);
    launched.consoleGuard.assertClean();
  } finally {
    try {
      await launched.app.close();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/Target (closed|crashed)/i.test(message)) {
        throw error;
      }
    }
  }
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  profileName: ["clean", { option: true }],

  fixtureServer: [
    async ({}, use) => {
      const server = await startFixtureServer();
      try {
        await use(server);
      } finally {
        await server.close();
      }
    },
    { scope: "worker" }
  ],

  userDataDir: async ({ profileName }, use, testInfo) => {
    const dir = await createUserDataDir(profileName);
    try {
      await use(dir);
    } finally {
      if (testInfo.status === testInfo.expectedStatus) {
        await removeUserDataDir(dir);
      }
    }
  },

  dialogs: async ({}, use) => {
    await use(dialogs);
  },

  challengeApp: async ({ userDataDir, fixtureServer }, use) => {
    const launched = await launchBuiltApp({
      appName: "challenge",
      appRoot: path.resolve("."),
      userDataDir,
      fixtureServer
    });
    try {
      await use(launched);
    } finally {
      await closeLaunchedApp(launched);
    }
  },

  adminApp: async ({ userDataDir, fixtureServer }, use) => {
    const launched = await launchBuiltApp({
      appName: "admin",
      appRoot: path.resolve("admin"),
      userDataDir,
      fixtureServer
    });
    try {
      await use(launched);
    } finally {
      await closeLaunchedApp(launched);
    }
  }
});

export { expect };
