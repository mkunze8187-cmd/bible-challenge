import type { ElectronApplication } from "playwright";

export interface DialogFixtures {
  queueOpenDialog(app: ElectronApplication, filePaths: string[]): Promise<void>;
  queueSaveDialog(app: ElectronApplication, filePath: string): Promise<void>;
  getOpenExternalCalls(app: ElectronApplication): Promise<string[]>;
}

export const dialogs: DialogFixtures = {
  async queueOpenDialog(app, filePaths) {
    await app.evaluate(({ dialog }, queuedPaths) => {
      const globalState = globalThis as typeof globalThis & { __dialogOpenQueue?: string[][] };
      globalState.__dialogOpenQueue ??= [];
      globalState.__dialogOpenQueue.push(queuedPaths);
      dialog.showOpenDialog = async () => {
        const nextPaths = globalState.__dialogOpenQueue?.shift() ?? [];
        return { canceled: nextPaths.length === 0, filePaths: nextPaths };
      };
    }, filePaths);
  },

  async queueSaveDialog(app, filePath) {
    await app.evaluate(({ dialog }, queuedPath) => {
      const globalState = globalThis as typeof globalThis & { __dialogSaveQueue?: string[] };
      globalState.__dialogSaveQueue ??= [];
      globalState.__dialogSaveQueue.push(queuedPath);
      dialog.showSaveDialog = async () => {
        const nextPath = globalState.__dialogSaveQueue?.shift();
        return { canceled: !nextPath, filePath: nextPath ?? "" };
      };
    }, filePath);
  },

  async getOpenExternalCalls(app) {
    return app.evaluate(({ shell }) => {
      const globalState = globalThis as typeof globalThis & { __openExternalCalls?: string[] };
      globalState.__openExternalCalls ??= [];
      shell.openExternal = async (url: string) => {
        globalState.__openExternalCalls?.push(url);
      };
      return [...globalState.__openExternalCalls];
    });
  }
};
