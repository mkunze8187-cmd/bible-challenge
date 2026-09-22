import type { ElectronApplication, Page } from "playwright";

export interface ConsoleGuard {
  errors: string[];
  attach(page: Page): void;
  assertClean(): void;
}

export function createConsoleGuard(appName: string, app: ElectronApplication): ConsoleGuard {
  const errors: string[] = [];

  app.on("window", (page) => {
    guard.attach(page);
  });

  app.process().once("exit", (code, signal) => {
    if (code !== 0 && signal !== "SIGTERM") {
      errors.push(`[${appName}] main process exited unexpectedly: code=${code ?? "null"} signal=${signal ?? "null"}`);
    }
  });

  const guard: ConsoleGuard = {
    errors,
    attach(page) {
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(`[${appName}] console.error: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => {
        errors.push(`[${appName}] page error: ${error.message}`);
      });
      page.on("crash", () => {
        errors.push(`[${appName}] renderer process crashed: ${page.url()}`);
      });
    },
    assertClean() {
      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }
    }
  };

  return guard;
}
