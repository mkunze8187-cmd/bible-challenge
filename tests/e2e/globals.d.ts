import type { SessionState } from "../../src/lib/gameEngine";

declare global {
  interface Window {
    __bibleChallengeTest?: {
      getSessionState(): SessionState | null;
      getScreen(): string;
      getSettings(): Record<string, unknown>;
    };
    __bibleChallengeAdminTest?: {
      getActiveTab(): string;
      isLocked(): boolean;
    };
  }
}

export {};
