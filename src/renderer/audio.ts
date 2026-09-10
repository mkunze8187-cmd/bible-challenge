import timerExpiredSound from "./assets/audio/timer-expired.wav";
import correctSound from "./assets/audio/correct.wav";
import wrongSound from "./assets/audio/wrong.wav";
import roundStartSound from "./assets/audio/round-start.wav";
import gameOverSound from "./assets/audio/game-over.wav";
import passSound from "./assets/audio/pass.wav";
import clickSound from "./assets/audio/click.wav";

export interface AudioSettings {
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  backgroundMusicEnabled: boolean;
  backgroundMusicVolume: number;
  backgroundMusicLoop: boolean;
  backgroundMusicFilePath: string | null;
  backgroundMusicDisplayName: string | null;
}

export type SoundEffectName =
  | "timerExpired"
  | "correct"
  | "wrong"
  | "roundStart"
  | "gameOver"
  | "pass"
  | "click";

const EFFECT_SOURCES: Record<SoundEffectName, string> = {
  timerExpired: timerExpiredSound,
  correct: correctSound,
  wrong: wrongSound,
  roundStart: roundStartSound,
  gameOver: gameOverSound,
  pass: passSound,
  click: clickSound
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEffectsEnabled: true,
  soundEffectsVolume: 70,
  backgroundMusicEnabled: false,
  backgroundMusicVolume: 35,
  backgroundMusicLoop: true,
  backgroundMusicFilePath: null,
  backgroundMusicDisplayName: null
};

function clampVolume(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeAudioSettings(settings: Partial<AudioSettings> | null | undefined): AudioSettings {
  return {
    soundEffectsEnabled:
      typeof settings?.soundEffectsEnabled === "boolean"
        ? settings.soundEffectsEnabled
        : DEFAULT_AUDIO_SETTINGS.soundEffectsEnabled,
    soundEffectsVolume: clampVolume(settings?.soundEffectsVolume ?? DEFAULT_AUDIO_SETTINGS.soundEffectsVolume),
    backgroundMusicEnabled:
      typeof settings?.backgroundMusicEnabled === "boolean"
        ? settings.backgroundMusicEnabled
        : DEFAULT_AUDIO_SETTINGS.backgroundMusicEnabled,
    backgroundMusicVolume: clampVolume(settings?.backgroundMusicVolume ?? DEFAULT_AUDIO_SETTINGS.backgroundMusicVolume),
    backgroundMusicLoop:
      typeof settings?.backgroundMusicLoop === "boolean"
        ? settings.backgroundMusicLoop
        : DEFAULT_AUDIO_SETTINGS.backgroundMusicLoop,
    backgroundMusicFilePath:
      typeof settings?.backgroundMusicFilePath === "string" && settings.backgroundMusicFilePath
        ? settings.backgroundMusicFilePath
        : null,
    backgroundMusicDisplayName:
      typeof settings?.backgroundMusicDisplayName === "string" && settings.backgroundMusicDisplayName
        ? settings.backgroundMusicDisplayName
        : null
  };
}

function toLocalFileUrl(filePath: string): string | null {
  if (/^[a-z][a-z\d+.-]*:/i.test(filePath) && !/^[a-z]:[\\/]/i.test(filePath)) {
    return null;
  }

  const normalizedPath = filePath.replace(/\\/g, "/");
  const fileUrl = normalizedPath.startsWith("/") ? `file://${normalizedPath}` : `file:///${normalizedPath}`;
  return encodeURI(fileUrl);
}

export class AudioManager {
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;
  private effectCache = new Map<SoundEffectName, HTMLAudioElement>();
  private backgroundAudio: HTMLAudioElement;
  private backgroundSource: string | null = null;
  private backgroundErrorHandler: ((message: string) => void) | null = null;
  private lastEffectPlayedAt = new Map<SoundEffectName, number>();

  constructor() {
    this.backgroundAudio = new Audio();
    this.backgroundAudio.preload = "auto";
    this.backgroundAudio.addEventListener("error", () => {
      this.backgroundErrorHandler?.("Background music could not be played. Import another local audio file.");
    });
  }

  setBackgroundErrorHandler(handler: ((message: string) => void) | null) {
    this.backgroundErrorHandler = handler;
  }

  updateSettings(settings: AudioSettings) {
    this.settings = normalizeAudioSettings(settings);
    const effectVolume = this.settings.soundEffectsVolume / 100;

    this.effectCache.forEach((audio) => {
      audio.volume = effectVolume;
    });

    this.backgroundAudio.volume = this.settings.backgroundMusicVolume / 100;
    this.backgroundAudio.loop = this.settings.backgroundMusicLoop;
  }

  playEffect(effectName: SoundEffectName) {
    if (!this.settings.soundEffectsEnabled || this.settings.soundEffectsVolume <= 0) {
      return;
    }

    const now = Date.now();
    const minimumGapMs = effectName === "click" ? 120 : 70;
    const lastPlayedAt = this.lastEffectPlayedAt.get(effectName) ?? 0;

    if (now - lastPlayedAt < minimumGapMs) {
      return;
    }

    this.lastEffectPlayedAt.set(effectName, now);

    const audio = this.getEffect(effectName).cloneNode(true) as HTMLAudioElement;
    audio.volume = this.settings.soundEffectsVolume / 100;
    void audio.play().catch(() => undefined);
  }

  updateBackgroundPlayback(shouldPlay: boolean, forcePlay = false) {
    this.backgroundAudio.volume = this.settings.backgroundMusicVolume / 100;
    this.backgroundAudio.loop = this.settings.backgroundMusicLoop;

    const source = this.settings.backgroundMusicFilePath
      ? toLocalFileUrl(this.settings.backgroundMusicFilePath)
      : null;

    if (!source) {
      this.backgroundAudio.pause();
      this.backgroundAudio.removeAttribute("src");
      this.backgroundSource = null;
      return;
    }

    if (this.backgroundSource !== source) {
      this.backgroundAudio.pause();
      this.backgroundAudio.src = source;
      this.backgroundSource = source;
      this.backgroundAudio.load();
    }

    if (!shouldPlay || (!forcePlay && !this.settings.backgroundMusicEnabled) || this.settings.backgroundMusicVolume <= 0) {
      this.backgroundAudio.pause();
      return;
    }

    void this.backgroundAudio.play().catch(() => {
      this.backgroundErrorHandler?.("Background music could not be played. Import another local audio file.");
    });
  }

  toggleBackgroundPreview(): boolean {
    if (!this.settings.backgroundMusicFilePath) {
      return false;
    }

    this.backgroundAudio.volume = this.settings.backgroundMusicVolume / 100;
    this.backgroundAudio.loop = this.settings.backgroundMusicLoop;

    const source = toLocalFileUrl(this.settings.backgroundMusicFilePath);

    if (!source) {
      return false;
    }

    if (this.backgroundSource !== source) {
      this.backgroundAudio.pause();
      this.backgroundAudio.src = source;
      this.backgroundSource = source;
      this.backgroundAudio.load();
    }

    if (!this.backgroundAudio.paused) {
      this.backgroundAudio.pause();
      return false;
    }

    void this.backgroundAudio.play().catch(() => {
      this.backgroundErrorHandler?.("Background music could not be played. Import another local audio file.");
    });
    return true;
  }

  pauseBackground() {
    this.backgroundAudio.pause();
  }

  isBackgroundPlaying(): boolean {
    return !this.backgroundAudio.paused;
  }

  private getEffect(effectName: SoundEffectName): HTMLAudioElement {
    const cached = this.effectCache.get(effectName);

    if (cached) {
      return cached;
    }

    const audio = new Audio(EFFECT_SOURCES[effectName]);
    audio.preload = "auto";
    audio.volume = this.settings.soundEffectsVolume / 100;
    this.effectCache.set(effectName, audio);
    return audio;
  }
}
