const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { spawn } = require("node:child_process");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const https = require("node:https");
const path = require("node:path");

const SUPPORTED_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);
const CUSTOM_CONTENT_FILE_EXTENSION = ".json";
const GITHUB_OWNER = "mkunze8187-cmd";
const GITHUB_REPO = "bible-challenge";
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
const INSTALLER_ASSET_PATTERN = /^BibleChallenge-Setup-.*\.exe$/i;
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

function compareVersions(left, right) {
  const leftParts = String(left).replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = String(right).replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;

    if (leftPart !== rightPart) {
      return leftPart > rightPart ? 1 : -1;
    }
  }

  return 0;
}

function getUpdateDirectory() {
  return path.join(app.getPath("userData"), "updates");
}

function getGitHubTokenFromGitCredentialManager() {
  return new Promise((resolve) => {
    const git = spawn("git", ["credential", "fill"], {
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true
    });
    let output = "";

    git.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    git.on("error", () => resolve(null));
    git.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }

      const passwordLine = output.split(/\r?\n/).find((line) => line.startsWith("password="));
      resolve(passwordLine ? passwordLine.replace(/^password=/, "").trim() : null);
    });

    git.stdin.end("protocol=https\nhost=github.com\n\n");
  });
}

async function getGitHubAuthToken() {
  if (process.env.BIBLE_CHALLENGE_GITHUB_TOKEN) {
    return process.env.BIBLE_CHALLENGE_GITHUB_TOKEN;
  }

  return getGitHubTokenFromGitCredentialManager();
}

function requestJson(url, token = null) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "BibleChallengeUpdater",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk.toString();
        });

        response.on("end", () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            const error = new Error(`GitHub returned ${response.statusCode}.`);
            error.statusCode = response.statusCode;
            reject(error);
            return;
          }

          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error("GitHub returned an unreadable release response."));
          }
        });
      }
    );

    request.on("error", reject);
    request.setTimeout(30000, () => {
      request.destroy(new Error("The update check timed out."));
    });
  });
}

async function getLatestRelease() {
  try {
    return await requestJson(`${GITHUB_API_BASE}/releases/latest`);
  } catch (error) {
    if (error.statusCode !== 401 && error.statusCode !== 403 && error.statusCode !== 404) {
      throw error;
    }
  }

  const token = await getGitHubAuthToken();
  if (!token) {
    throw new Error("GitHub access is required to check private releases. Sign in with Git Credential Manager or set BIBLE_CHALLENGE_GITHUB_TOKEN.");
  }

  return requestJson(`${GITHUB_API_BASE}/releases/latest`, token);
}

function getInstallerAsset(release) {
  return Array.isArray(release.assets)
    ? release.assets.find((asset) => asset && INSTALLER_ASSET_PATTERN.test(asset.name))
    : null;
}

async function checkForUpdates() {
  const release = await getLatestRelease();
  const asset = getInstallerAsset(release);
  const latestVersion = String(release.tag_name || "").replace(/^v/i, "");
  const currentVersion = app.getVersion();

  if (!asset) {
    return {
      currentVersion,
      latestVersion,
      hasUpdate: false,
      releaseUrl: release.html_url || GITHUB_RELEASES_URL,
      message: "The latest release does not include a Windows installer."
    };
  }

  const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    releaseName: release.name || release.tag_name,
    releaseUrl: release.html_url || GITHUB_RELEASES_URL,
    assetName: asset.name,
    assetSize: asset.size,
    message: hasUpdate ? `Version ${latestVersion} is available.` : "Bible Challenge is up to date."
  };
}

function downloadFile(url, targetPath, token = null) {
  return new Promise((resolve, reject) => {
    const file = fsSync.createWriteStream(targetPath);
    const request = https.get(
      url,
      {
        headers: {
          Accept: "application/octet-stream",
          "User-Agent": "BibleChallengeUpdater",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          fsSync.rmSync(targetPath, { force: true });
          downloadFile(response.headers.location, targetPath, token).then(resolve, reject);
          return;
        }

        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          file.close();
          fsSync.rmSync(targetPath, { force: true });
          reject(new Error(`Installer download returned ${response.statusCode}.`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(targetPath));
        });
      }
    );

    request.on("error", (error) => {
      file.close();
      fsSync.rmSync(targetPath, { force: true });
      reject(error);
    });
    request.setTimeout(120000, () => {
      request.destroy(new Error("The installer download timed out."));
    });
  });
}

async function downloadAndInstallUpdate() {
  const release = await getLatestRelease();
  const asset = getInstallerAsset(release);
  const latestVersion = String(release.tag_name || "").replace(/^v/i, "");

  if (!asset) {
    throw new Error("The latest release does not include a Windows installer.");
  }

  if (compareVersions(latestVersion, app.getVersion()) <= 0) {
    return {
      started: false,
      message: "Bible Challenge is already up to date."
    };
  }

  const updateDirectory = getUpdateDirectory();
  await fs.mkdir(updateDirectory, { recursive: true });
  const installerPath = path.join(updateDirectory, asset.name);

  if (!isPathInsideDirectory(installerPath, updateDirectory)) {
    throw new Error("The update installer filename is not safe to download.");
  }

  let token = null;
  try {
    await downloadFile(asset.browser_download_url, installerPath);
  } catch (error) {
    token = await getGitHubAuthToken();
    if (!token) {
      throw error;
    }
    await downloadFile(asset.url, installerPath, token);
  }

  const openError = await shell.openPath(installerPath);
  if (openError) {
    throw new Error(openError);
  }

  app.quit();
  return {
    started: true,
    installerPath,
    message: "The installer was downloaded and opened."
  };
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

function createWindow() {
  const window = new BrowserWindow({
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

  window.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(`Renderer failed to load: ${errorCode} ${errorDescription}`);
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    window.loadURL(devServerUrl);
    return;
  }

  window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
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

ipcMain.handle("app:get-settings", async () => {
  return readAppSettings();
});

ipcMain.handle("app:save-settings", async (_event, settings) => {
  return writeAppSettings(settings);
});

ipcMain.handle("updates:check", async () => {
  return checkForUpdates();
});

ipcMain.handle("updates:download-and-install", async () => {
  return downloadAndInstallUpdate();
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
