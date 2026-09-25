const { app, BrowserWindow, dialog, ipcMain, screen, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createLanServer } = require("./lan/server");

// Test mode is on only when BOTH BIBLE_CHALLENGE_E2E=1 and the app is running unpackaged.
// This must be checked with app.isPackaged, not NODE_ENV or similar — isPackaged is the one
// signal that can't be set inside a shipped installer, so an installed build can never enter
// test mode no matter what environment variables are present on the machine that runs it.
// See specs/automated-testing-spec.md section 4.1.
const isTestMode = process.env.BIBLE_CHALLENGE_E2E === "1" && !app.isPackaged;

// In test mode, an isolated userData directory keeps tests from touching the developer's
// real settings, stats, and custom content. Must run before any app.getPath("userData")
// call, anywhere — including lazily inside helper functions below — so every path derived
// from it (audio-settings.json, app-settings.json, custom-content/) resolves inside the
// isolated folder from the very first read or write.
if (isTestMode && process.env.BIBLE_CHALLENGE_USER_DATA_DIR) {
  app.setPath("userData", process.env.BIBLE_CHALLENGE_USER_DATA_DIR);
}

// Keeps Windows display scaling from changing screenshot sizes between machines, so visual
// regression baselines stay comparable. Must be set before app.whenReady().
if (isTestMode) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch("force-device-scale-factor", "1");
  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-gpu-sandbox");
}

const SUPPORTED_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);
const CUSTOM_CONTENT_FILE_EXTENSION = ".json";
const AUDIO_SETTINGS_DEFAULTS = {
  soundEffectsEnabled: true,
  soundEffectsVolume: 70,
  backgroundMusicEnabled: false,
  backgroundMusicVolume: 35,
  backgroundMusicLoop: true,
  backgroundMusicFilePath: null,
  backgroundMusicDisplayName: null
};

function getSettingsPath() {
  return path.join(app.getPath("userData"), "audio-settings.json");
}

function getAppSettingsPath() {
  return path.join(app.getPath("userData"), "app-settings.json");
}

function getBackgroundMusicDirectory() {
  return path.join(app.getPath("userData"), "background-music");
}

function getCustomContentDirectory() {
  return path.join(app.getPath("userData"), "custom-content");
}

function clampVolume(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function sanitizeSettings(input = {}, existing = AUDIO_SETTINGS_DEFAULTS, options = {}) {
  const allowFileFields = options.allowFileFields === true;
  const nextSettings = {
    soundEffectsEnabled:
      typeof input.soundEffectsEnabled === "boolean" ? input.soundEffectsEnabled : existing.soundEffectsEnabled,
    soundEffectsVolume: clampVolume(input.soundEffectsVolume, existing.soundEffectsVolume),
    backgroundMusicEnabled:
      typeof input.backgroundMusicEnabled === "boolean"
        ? input.backgroundMusicEnabled
        : existing.backgroundMusicEnabled,
    backgroundMusicVolume: clampVolume(input.backgroundMusicVolume, existing.backgroundMusicVolume),
    backgroundMusicLoop:
      typeof input.backgroundMusicLoop === "boolean" ? input.backgroundMusicLoop : existing.backgroundMusicLoop,
    backgroundMusicFilePath: existing.backgroundMusicFilePath,
    backgroundMusicDisplayName: existing.backgroundMusicDisplayName
  };

  if (allowFileFields) {
    nextSettings.backgroundMusicFilePath =
      typeof input.backgroundMusicFilePath === "string" && input.backgroundMusicFilePath
        ? input.backgroundMusicFilePath
        : null;
    nextSettings.backgroundMusicDisplayName =
      typeof input.backgroundMusicDisplayName === "string" && input.backgroundMusicDisplayName
        ? input.backgroundMusicDisplayName
        : null;
  }

  return nextSettings;
}

async function readAudioSettings() {
  try {
    const raw = await fs.readFile(getSettingsPath(), "utf8");
    return sanitizeSettings(JSON.parse(raw), AUDIO_SETTINGS_DEFAULTS, { allowFileFields: true });
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      console.warn("Unable to read audio settings:", error);
    }

    return { ...AUDIO_SETTINGS_DEFAULTS };
  }
}

async function writeAudioSettings(settings) {
  const nextSettings = sanitizeSettings(settings, AUDIO_SETTINGS_DEFAULTS, { allowFileFields: true });
  await fs.mkdir(path.dirname(getSettingsPath()), { recursive: true });
  await fs.writeFile(getSettingsPath(), `${JSON.stringify(nextSettings, null, 2)}\n`, "utf8");
  return nextSettings;
}

async function readAppSettings() {
  try {
    const raw = await fs.readFile(getAppSettingsPath(), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      console.warn("Unable to read app settings:", error);
    }

    return null;
  }
}

async function writeAppSettings(settings) {
  await fs.mkdir(path.dirname(getAppSettingsPath()), { recursive: true });
  await fs.writeFile(getAppSettingsPath(), `${JSON.stringify(settings ?? {}, null, 2)}\n`, "utf8");
  return settings ?? {};
}

function sanitizeFilename(filename) {
  const extension = path.extname(filename);
  const baseName = path.basename(filename, extension).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${baseName || "background-music"}${extension.toLowerCase()}`;
}

function sanitizeJsonFilename(filename) {
  const baseName = path.basename(filename, path.extname(filename)).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${baseName || "custom-content"}${CUSTOM_CONTENT_FILE_EXTENSION}`;
}

function isPathInsideDirectory(candidatePath, parentDirectory) {
  const relative = path.relative(parentDirectory, candidatePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function readCustomContentPacks() {
  const contentDirectory = getCustomContentDirectory();

  try {
    const entries = await fs.readdir(contentDirectory, { withFileTypes: true });
    const packs = [];

    for (const entry of entries) {
      if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== CUSTOM_CONTENT_FILE_EXTENSION) {
        continue;
      }

      const filePath = path.join(contentDirectory, entry.name);
      if (!isPathInsideDirectory(filePath, contentDirectory)) {
        continue;
      }

      try {
        packs.push(JSON.parse(await fs.readFile(filePath, "utf8")));
      } catch (error) {
        console.warn(`Unable to read custom content pack ${entry.name}:`, error);
      }
    }

    return packs;
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      console.warn("Unable to list custom content packs:", error);
    }

    return [];
  }
}

function getPackIdFromContent(pack) {
  return pack && typeof pack === "object" && typeof pack.packId === "string" && pack.packId.trim()
    ? pack.packId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : null;
}

async function writeCustomContentPack(pack) {
  const packId = getPackIdFromContent(pack);

  if (!packId) {
    throw new Error("Custom content packId is required.");
  }

  const contentDirectory = getCustomContentDirectory();
  await fs.mkdir(contentDirectory, { recursive: true });
  const targetPath = path.join(contentDirectory, sanitizeJsonFilename(packId));

  if (!isPathInsideDirectory(targetPath, contentDirectory)) {
    throw new Error("That custom content pack cannot be saved safely.");
  }

  await fs.writeFile(targetPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  return readCustomContentPacks();
}

let mainWindow = null;
let projectorWindow = null;
let projectorState = null;
let hostRemoteCommandSeq = 0;
const hostRemoteCommandResults = new Map();
let pendingHostRemoteView = null;
let hostRemoteViewTimer = null;

const lanServer = createLanServer({
  onHostCommand: sendHostRemoteCommandToRenderer,
  onHostRemoteStatus: (status) => sendToMainWindow("lan:host-remote-status", status),
  onStatus: (status) => sendToMainWindow("lan:status", status),
  onSecurityEvent: (eventName) => console.warn(`LAN security event: ${eventName}`)
});

function sendToMainWindow(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

function sendHostRemoteCommandToRenderer(command) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return Promise.resolve({ ok: false, reason: "no-session" });
  }

  const requestId = `host-remote-command-${++hostRemoteCommandSeq}`;
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      hostRemoteCommandResults.delete(requestId);
      resolve({ ok: false, reason: "timeout" });
    }, 5_000);
    hostRemoteCommandResults.set(requestId, (result) => {
      clearTimeout(timeout);
      resolve(result && typeof result === "object" ? result : { ok: false, reason: "bad-result" });
    });
    mainWindow.webContents.send("host-remote:command", { requestId, command });
  });
}

// In test mode, adds e2e=1 (and seed/maxPrompts/feedbackEndpoint when set) to a window's query
// string so the renderer can read them at startup. Merges with any query the caller already
// built (for example the projector window's own "?projector=1"), rather than overwriting it.
function withTestModeQuery(query = "") {
  if (!isTestMode) {
    return query;
  }

  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  params.set("e2e", "1");

  if (process.env.BIBLE_CHALLENGE_E2E_SEED) {
    params.set("seed", process.env.BIBLE_CHALLENGE_E2E_SEED);
  }

  if (process.env.BIBLE_CHALLENGE_E2E_MAX_PROMPTS) {
    params.set("maxPrompts", process.env.BIBLE_CHALLENGE_E2E_MAX_PROMPTS);
  }

  if (process.env.BIBLE_CHALLENGE_FEEDBACK_URL) {
    params.set("feedbackEndpoint", process.env.BIBLE_CHALLENGE_FEEDBACK_URL);
  }

  return `?${params.toString()}`;
}

function loadAppWindow(window, query = "") {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const fullQuery = withTestModeQuery(query);

  if (devServerUrl) {
    window.loadURL(`${devServerUrl}${fullQuery}`);
    return;
  }

  window.loadFile(path.join(__dirname, "..", "dist", "index.html"), fullQuery ? { query: Object.fromEntries(new URLSearchParams(fullQuery.slice(1))) } : undefined);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    resizable: false,
    show: true,
    autoHideMenuBar: true,
    backgroundColor: "#efe3ce",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(`Renderer failed to load: ${errorCode} ${errorDescription}`);
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (projectorWindow) {
      projectorWindow.close();
    }
  });

  loadAppWindow(mainWindow);
}

function getDisplaySummaries() {
  const primaryDisplayId = screen.getPrimaryDisplay().id;

  return screen.getAllDisplays().map((display, index) => ({
    id: display.id,
    label: `${display.label || `Display ${index + 1}`} (${display.size.width} x ${display.size.height})${display.id === primaryDisplayId ? " (Primary)" : ""}`,
    bounds: display.bounds,
    primary: display.id === primaryDisplayId
  }));
}

function notifyMainWindowProjectorStatus(isOpen) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("projector:window-status", { isOpen });
  }
}

function openProjectorWindow(displayId) {
  const displays = screen.getAllDisplays();
  const selectedDisplay = displays.find((display) => display.id === Number(displayId)) ?? displays.find((display) => display.id !== screen.getPrimaryDisplay().id) ?? screen.getPrimaryDisplay();

  if (projectorWindow && !projectorWindow.isDestroyed()) {
    projectorWindow.setBounds(selectedDisplay.bounds);
    projectorWindow.setFullScreen(true);
    projectorWindow.focus();
    notifyMainWindowProjectorStatus(true);
    return getDisplaySummaries();
  }

  projectorWindow = new BrowserWindow({
    x: selectedDisplay.bounds.x,
    y: selectedDisplay.bounds.y,
    width: selectedDisplay.bounds.width,
    height: selectedDisplay.bounds.height,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: "#efe3ce",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  projectorWindow.webContents.on("did-finish-load", () => {
    if (projectorState) {
      projectorWindow.webContents.send("projector:state", projectorState);
    }
  });

  projectorWindow.on("closed", () => {
    projectorWindow = null;
    notifyMainWindowProjectorStatus(false);
  });

  loadAppWindow(projectorWindow, "?projector=1");
  return getDisplaySummaries();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  lanServer.stop();
});

ipcMain.handle("app:exit", () => {
  app.quit();
});

ipcMain.handle("app:open-external", async (_event, url) => {
  if (typeof url !== "string" || !/^(mailto|https?):/i.test(url)) {
    throw new Error("Only mailto, http, and https links can be opened.");
  }

  await shell.openExternal(url);
});

ipcMain.handle("app:get-version", () => {
  return app.getVersion();
});

ipcMain.handle("projector:get-displays", () => {
  return getDisplaySummaries();
});

ipcMain.handle("projector:open", (_event, displayId) => {
  return openProjectorWindow(displayId);
});

ipcMain.handle("projector:close", () => {
  if (projectorWindow && !projectorWindow.isDestroyed()) {
    projectorWindow.close();
  } else {
    notifyMainWindowProjectorStatus(false);
  }
});

ipcMain.on("projector:update-state", (_event, state) => {
  projectorState = state ?? null;
  if (projectorWindow && !projectorWindow.isDestroyed()) {
    projectorWindow.webContents.send("projector:state", projectorState);
  }
});

ipcMain.handle("lan:host-remote-enable", async (_event, options = {}) => {
  return lanServer.startFeature("host-remote", options);
});

ipcMain.handle("lan:host-remote-disable", () => {
  return lanServer.stopFeature("host-remote");
});

ipcMain.handle("lan:host-remote-status", () => {
  return lanServer.getStatus().hostRemote;
});

ipcMain.handle("lan:host-remote-approve-pairing", () => {
  return lanServer.approveHostRemotePairing();
});

ipcMain.handle("lan:host-remote-deny-pairing", () => {
  return lanServer.denyHostRemotePairing();
});

ipcMain.handle("lan:host-remote-revoke", () => {
  return lanServer.revokeHostRemote();
});

ipcMain.on("host-remote:view", (_event, view) => {
  pendingHostRemoteView = view;
  if (hostRemoteViewTimer) {
    return;
  }

  hostRemoteViewTimer = setTimeout(() => {
    hostRemoteViewTimer = null;
    lanServer.sendHostRemoteView(pendingHostRemoteView);
  }, 100);
});

ipcMain.handle("host-remote:command-result", (_event, requestId, result) => {
  const resolve = hostRemoteCommandResults.get(requestId);
  if (!resolve) {
    return;
  }

  hostRemoteCommandResults.delete(requestId);
  resolve(result);
});

ipcMain.handle("app:get-settings", async () => {
  return readAppSettings();
});

ipcMain.handle("app:save-settings", async (_event, settings) => {
  return writeAppSettings(settings);
});

ipcMain.handle("custom-content:list", async () => {
  return readCustomContentPacks();
});

ipcMain.handle("custom-content:choose-json", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import Custom Content Pack",
    properties: ["openFile"],
    filters: [
      {
        name: "JSON Files",
        extensions: ["json"]
      }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return {
      canceled: true,
      pack: null
    };
  }

  const selectedPath = result.filePaths[0];
  if (path.extname(selectedPath).toLowerCase() !== CUSTOM_CONTENT_FILE_EXTENSION) {
    return {
      canceled: false,
      pack: null,
      error: "Choose a local JSON content pack."
    };
  }

  try {
    const raw = await fs.readFile(selectedPath, "utf8");
    return {
      canceled: false,
      pack: JSON.parse(raw)
    };
  } catch (error) {
    return {
      canceled: false,
      pack: null,
      error: error instanceof Error ? error.message : "The selected JSON file could not be read."
    };
  }
});

ipcMain.handle("custom-content:save", async (_event, pack) => {
  return writeCustomContentPack(pack);
});

ipcMain.handle("custom-content:remove", async (_event, packId) => {
  if (typeof packId !== "string" || !packId.trim()) {
    throw new Error("Custom content packId is required.");
  }

  const contentDirectory = getCustomContentDirectory();
  const targetPath = path.join(contentDirectory, sanitizeJsonFilename(packId));
  if (!isPathInsideDirectory(targetPath, contentDirectory)) {
    throw new Error("That custom content pack cannot be removed safely.");
  }

  await fs.rm(targetPath, { force: true });
  return readCustomContentPacks();
});

ipcMain.handle("audio:get-settings", async () => {
  return readAudioSettings();
});

ipcMain.handle("audio:save-settings", async (_event, settings) => {
  const existingSettings = await readAudioSettings();
  return writeAudioSettings(sanitizeSettings(settings, existingSettings));
});

ipcMain.handle("audio:import-background-music", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import Background Music",
    properties: ["openFile"],
    filters: [
      {
        name: "Audio Files",
        extensions: ["mp3", "wav", "ogg", "m4a", "aac", "flac"]
      }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return {
      canceled: true,
      settings: await readAudioSettings()
    };
  }

  const selectedPath = result.filePaths[0];
  const extension = path.extname(selectedPath).toLowerCase();

  if (!SUPPORTED_AUDIO_EXTENSIONS.has(extension)) {
    return {
      canceled: false,
      error: "Choose an MP3, WAV, OGG, M4A, AAC, or FLAC audio file.",
      settings: await readAudioSettings()
    };
  }

  const musicDirectory = getBackgroundMusicDirectory();
  await fs.mkdir(musicDirectory, { recursive: true });

  const safeName = sanitizeFilename(path.basename(selectedPath));
  const copiedPath = path.join(musicDirectory, `${Date.now()}-${safeName}`);

  if (!isPathInsideDirectory(copiedPath, musicDirectory)) {
    return {
      canceled: false,
      error: "That audio filename cannot be imported safely.",
      settings: await readAudioSettings()
    };
  }

  await fs.copyFile(selectedPath, copiedPath);

  const existingSettings = await readAudioSettings();
  const nextSettings = await writeAudioSettings({
    ...existingSettings,
    backgroundMusicFilePath: copiedPath,
    backgroundMusicDisplayName: path.basename(selectedPath)
  });

  return {
    canceled: false,
    settings: nextSettings
  };
});

ipcMain.handle("audio:remove-background-music", async () => {
  const existingSettings = await readAudioSettings();
  const musicDirectory = getBackgroundMusicDirectory();

  if (
    existingSettings.backgroundMusicFilePath &&
    isPathInsideDirectory(existingSettings.backgroundMusicFilePath, musicDirectory)
  ) {
    try {
      await fs.rm(existingSettings.backgroundMusicFilePath, { force: true });
    } catch (error) {
      console.warn("Unable to remove imported background music:", error);
    }
  }

  return writeAudioSettings({
    ...existingSettings,
    backgroundMusicEnabled: false,
    backgroundMusicFilePath: null,
    backgroundMusicDisplayName: null
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
