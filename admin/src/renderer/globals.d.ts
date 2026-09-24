import type { CustomContentPack } from "../lib/content";
import type { StatsAndRatings } from "../lib/statsTypes";
import type { UpdateCheckResult, UpdateInstallBothResult } from "../lib/updateTypes";

interface CustomContentImportResult {
  canceled: boolean;
  pack: unknown | null;
  error?: string;
}

interface FileDialogResult {
  canceled: boolean;
  filePath: string | null;
}

interface AdminLockState {
  configured: boolean;
}

interface HostSettings {
  hostControlsEnabled: boolean;
  requireAdminPinForScoreAdjustment: boolean;
  allowHostAnswerReveal: boolean;
  hostTimerIncrements: number[];
  hostUndoDepth: number;
  answererTimerBehavior: "pause" | "answer-clock" | "continue";
  answerClockSeconds: number;
}

declare global {
  interface Window {
    adminHost?: {
      platform: string;
      versions: {
        chrome: string;
        electron: string;
        node: string;
      };
      exitApp: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      getStatsAndRatings: () => Promise<StatsAndRatings>;
      clearStats: () => Promise<StatsAndRatings>;
      clearRatings: () => Promise<StatsAndRatings>;
      exportAppSettings: () => Promise<FileDialogResult>;
      importAppSettings: () => Promise<FileDialogResult>;
      clearAppSettings: () => Promise<boolean>;
      getFeedbackEndpoint: () => Promise<string>;
      setFeedbackEndpoint: (endpoint: string) => Promise<string>;
      getHostSettings: () => Promise<HostSettings>;
      setHostSettings: (settings: HostSettings) => Promise<HostSettings>;
      getAdminLockState: () => Promise<AdminLockState>;
      setAdminPin: (pin: string) => Promise<AdminLockState>;
      clearAdminPin: () => Promise<AdminLockState>;
      verifyAdminPin: (pin: string) => Promise<boolean>;
      listCustomContentPacks: () => Promise<CustomContentPack[]>;
      chooseCustomContentJson: () => Promise<CustomContentImportResult>;
      saveCustomContentPack: (pack: CustomContentPack) => Promise<CustomContentPack[]>;
      removeCustomContentPack: (packId: string) => Promise<CustomContentPack[]>;
      checkForUpdates: () => Promise<UpdateCheckResult>;
      downloadAndInstallBothUpdates: () => Promise<UpdateInstallBothResult>;
      writeSentinel: (value: string) => Promise<string>;
      readSentinel: () => Promise<string | null>;
    };
  }
}

export {};
