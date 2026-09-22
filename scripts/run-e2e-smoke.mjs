import { spawn } from "node:child_process";
import path from "node:path";

const playwrightCli = path.resolve("node_modules", "playwright", "cli.js");

const smokeRuns = [
  ["--project=challenge", "tests/e2e/challenge/launch.spec.ts"],
  ["--project=admin", "tests/e2e/admin/launch.spec.ts"],
  ["--project=cross-app", "tests/e2e/cross-app/shared-user-data.spec.ts"]
];

function runPlaywright(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [playwrightCli, "test", ...args], {
      stdio: "inherit",
      env: {
        ...process.env,
        DEBUG: process.env.DEBUG || "pw:browser,pw:api",
        DEBUG_COLORS: process.env.DEBUG_COLORS || "0"
      }
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Playwright exited with code ${code ?? "null"} signal ${signal ?? "null"}.`));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (const args of smokeRuns) {
  await delay(1_500);
  await runPlaywright(args);
}
