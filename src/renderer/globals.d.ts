export {};

interface AudioSettings {
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  backgroundMusicEnabled: boolean;
  backgroundMusicVolume: number;
  backgroundMusicLoop: boolean;
  backgroundMusicFilePath: string | null;
  backgroundMusicDisplayName: string | null;
}

interface AudioImportResult {
  canceled: boolean;
  settings: AudioSettings;
  error?: string;
}

interface CustomContentGame {
  gameId: string;
  gameTitle: string;
  gameType: string;
  description: string;
  rounds: unknown[];
}

interface CustomContentPack {
  packId: string;
  packName: string;
  accentColor: string;
  games: CustomContentGame[];
}

interface CustomContentImportResult {
  canceled: boolean;
  pack: unknown | null;
  error?: string;
}

interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName?: string;
  releaseUrl: string;
  assetName?: string;
  assetSize?: number;
  message: string;
}

interface AppUpdateInstallResult {
  started: boolean;
  installerPath?: string;
  message: string;
}

declare global {
  interface Window {
    audioHost?: {
      getAudioSettings: () => Promise<AudioSettings>;
      saveAudioSettings: (settings: AudioSettings) => Promise<AudioSettings>;
      importBackgroundMusic: () => Promise<AudioImportResult>;
      removeBackgroundMusic: () => Promise<AudioSettings>;
    };
  }

  interface Window {
    desktopHost?: {
      platform: string;
      versions: {
        chrome: string;
        electron: string;
        node: string;
      };
      exitApp: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      getAppSettings: () => Promise<unknown>;
      saveAppSettings: (settings: unknown) => Promise<unknown>;
      checkForUpdates: () => Promise<AppUpdateInfo>;
      downloadAndInstallUpdate: () => Promise<AppUpdateInstallResult>;
      listCustomContentPacks: () => Promise<unknown>;
      chooseCustomContentJson: () => Promise<CustomContentImportResult>;
      saveCustomContentPack: (pack: unknown) => Promise<unknown>;
      removeCustomContentPack: (packId: string) => Promise<unknown>;
    };
  }
}

declare module "*.wav" {
  const src: string;
  export default src;
}
