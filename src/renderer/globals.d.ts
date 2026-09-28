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

interface ProjectorDisplay {
  id: number;
  label: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  primary: boolean;
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
      getAppVersion: () => Promise<string>;
      getAppSettings: () => Promise<unknown>;
      saveAppSettings: (settings: unknown) => Promise<unknown>;
      listCustomContentPacks: () => Promise<unknown>;
      chooseCustomContentJson: () => Promise<CustomContentImportResult>;
      saveCustomContentPack: (pack: unknown) => Promise<unknown>;
      removeCustomContentPack: (packId: string) => Promise<unknown>;
      getProjectorDisplays: () => Promise<ProjectorDisplay[]>;
      openProjectorWindow: (displayId: number | null) => Promise<ProjectorDisplay[]>;
      closeProjectorWindow: () => Promise<void>;
      updateProjectorState: (state: unknown) => void;
      enableHostRemote: (options?: unknown) => Promise<unknown>;
      disableHostRemote: () => Promise<unknown>;
      getHostRemoteStatus: () => Promise<unknown>;
      approveHostRemotePairing: () => Promise<unknown>;
      denyHostRemotePairing: () => Promise<unknown>;
      revokeHostRemote: () => Promise<unknown>;
      updateHostRemoteView: (view: unknown) => void;
      onHostRemoteStatus: (callback: (status: unknown) => void) => () => void;
      onHostRemoteCommand: (callback: (command: unknown) => Promise<unknown> | unknown) => () => void;
      onProjectorState: (callback: (state: unknown) => void) => () => void;
      onProjectorWindowStatus: (callback: (status: { isOpen?: boolean }) => void) => () => void;
    };
  }
}

declare module "*.wav" {
  const src: string;
  export default src;
}
