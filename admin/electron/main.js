const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");

// CRITICAL: this must run before any app.getPath("userData") call, anywhere, including
// lazily inside helper functions below. It must match the main BibleChallenge app's
// package.json "productName" exactly, or this app's userData folder will NOT coincide
// with the main app's, and every file this app reads/writes (app-settings.json,
// custom-content/*.json) will silently be a different, empty copy instead of the shared
// one. See the userData-sharing smoke test in scripts/smoke-test-user-data.mjs.
app.setName("Bible Challenge");

// Test mode is on only when BOTH BIBLE_CHALLENGE_E2E=1 and the app is running unpackaged.
// See electron/main.js for why app.isPackaged is the load-bearing check here, and
// specs/automated-testing-spec.md section 4.1.
const isTestMode = process.env.BIBLE_CHALLENGE_E2E === "1" && !app.isPackaged;

// Immediately after app.setName(...) — see the comment above it — so the isolated userData
// directory takes effect before anything (including lazily, inside helpers below) reads
// app.getPath("userData"). Cross-app tests point both apps at the same temp folder.
if (isTestMode && process.env.BIBLE_CHALLENGE_USER_DATA_DIR) {
  app.setPath("userData", process.env.BIBLE_CHALLENGE_USER_DATA_DIR);
}

if (isTestMode) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch("force-device-scale-factor", "1");
  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-gpu-sandbox");
}

const { spawn } = require("node:child_process");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const https = require("node:https");
const path = require("node:path");

const CUSTOM_CONTENT_FILE_EXTENSION = ".json";
const GITHUB_OWNER = "mkunze8187-cmd";
const GITHUB_REPO = "bible-challenge";
// In test mode, BIBLE_CHALLENGE_UPDATES_URL points the update checker at a local fixture
// HTTP server instead of the real GitHub Releases API, so E2E tests never make a real
// network call. Ignored outside test mode. See specs/automated-testing-spec.md section 4.6.
const GITHUB_API_BASE =
  isTestMode && process.env.BIBLE_CHALLENGE_UPDATES_URL
    ? process.env.BIBLE_CHALLENGE_UPDATES_URL
    : `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
// Two installer assets now ship in every release — the main game app and this admin
// console — since packaging decided on two separate NSIS installers published together
// under one release/tag rather than a single fused installer (electron-builder has no
// supported path to one installer for two independent Electron apps).
const INSTALLER_ASSET_PATTERNS = {
  main: /^BibleChallenge-Setup-.*\.exe$/i,
  admin: /^BibleChallengeAdmin-Setup-.*\.exe$/i
};
const HOST_SETTINGS_DEFAULTS = {
  hostControlsEnabled: true,
  requireAdminPinForScoreAdjustment: false,
  allowHostAnswerReveal: true,
  hostTimerIncrements: [15, 30, 60],
  hostUndoDepth: 20,
  answererTimerBehavior: "pause",
  answerClockSeconds: 10
};

function getAppSettingsPath() {
  return path.join(app.getPath("userData"), "app-settings.json");
}

function getCustomContentDirectory() {
  return path.join(app.getPath("userData"), "custom-content");
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

async function exportAppSettings() {
  const result = await dialog.showSaveDialog({
    title: "Export App Settings",
    defaultPath: "bible-challenge-app-settings.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }]
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true, filePath: null };
  }

  const settings = (await readAppSettings()) ?? {};
  await fs.writeFile(result.filePath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return { canceled: false, filePath: result.filePath };
}

async function importAppSettings() {
  const result = await dialog.showOpenDialog({
    title: "Import App Settings",
    properties: ["openFile"],
    filters: [{ name: "JSON Files", extensions: ["json"] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true, filePath: null };
  }

  const filePath = result.filePaths[0];
  const parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("App settings import must be a JSON object.");
  }

  await writeAppSettings(parsed);
  return { canceled: false, filePath };
}

async function clearAppSettings() {
  await fs.rm(getAppSettingsPath(), { force: true });
  return true;
}

function sanitizeJsonFilename(filename) {
  const baseName = path.basename(filename, path.extname(filename)).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${baseName || "custom-content"}${CUSTOM_CONTENT_FILE_EXTENSION}`;
}

function isPathInsideDirectory(candidatePath, parentDirectory) {
  const relative = path.relative(parentDirectory, candidatePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function getPackIdFromContent(pack) {
  return pack && typeof pack === "object" && typeof pack.packId === "string" && pack.packId.trim()
    ? pack.packId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : null;
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

  if (fsSync.existsSync(targetPath)) {
    const historyDirectory = path.join(contentDirectory, ".history");
    await fs.mkdir(historyDirectory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(historyDirectory, `${sanitizeJsonFilename(packId)}.${stamp}.bak`);
    if (isPathInsideDirectory(backupPath, historyDirectory)) {
      await fs.copyFile(targetPath, backupPath);
    }
  }

  await fs.writeFile(targetPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  return readCustomContentPacks();
}

async function removeCustomContentPack(packId) {
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
}

// Reads the whole app-settings.json blob, returns only the two keys the admin console is
// allowed to touch. Never exposes a "save the whole blob" handler — see
// app-settings:clear-stats/clear-ratings below, which mutate exactly one key each and
// write the rest of the blob back untouched, so a careless renderer change here can never
// clobber the main app's live-gameplay settings (players/timers/theme/etc.).
async function getStatsAndRatings() {
  const settings = (await readAppSettings()) ?? {};
  return {
    gameStats: settings.gameStats ?? {},
    challengeRatings: settings.challengeRatings ?? {}
  };
}

async function clearStats() {
  const settings = (await readAppSettings()) ?? {};
  await writeAppSettings({ ...settings, gameStats: {} });
  return getStatsAndRatings();
}

async function clearRatings() {
  const settings = (await readAppSettings()) ?? {};
  await writeAppSettings({ ...settings, challengeRatings: {} });
  return getStatsAndRatings();
}

async function getFeedbackEndpoint() {
  const settings = (await readAppSettings()) ?? {};
  return typeof settings.feedbackEndpoint === "string" ? settings.feedbackEndpoint : "";
}

async function setFeedbackEndpoint(endpoint) {
  if (typeof endpoint !== "string") {
    throw new Error("feedbackEndpoint must be a string.");
  }

  const settings = (await readAppSettings()) ?? {};
  await writeAppSettings({ ...settings, feedbackEndpoint: endpoint });
  return endpoint;
}

function sanitizeHostSettings(input = {}) {
  const increments = Array.isArray(input.hostTimerIncrements)
    ? input.hostTimerIncrements.map((value) => Number(value)).filter((value) => [15, 30, 60].includes(value))
    : HOST_SETTINGS_DEFAULTS.hostTimerIncrements;
  const answererTimerBehavior = ["pause", "answer-clock", "continue"].includes(input.answererTimerBehavior)
    ? input.answererTimerBehavior
    : HOST_SETTINGS_DEFAULTS.answererTimerBehavior;
  const hostUndoDepth = Number.isFinite(Number(input.hostUndoDepth))
    ? Math.min(50, Math.max(1, Math.round(Number(input.hostUndoDepth))))
    : HOST_SETTINGS_DEFAULTS.hostUndoDepth;
  const answerClockSeconds = Number.isFinite(Number(input.answerClockSeconds))
    ? Math.min(120, Math.max(3, Math.round(Number(input.answerClockSeconds))))
    : HOST_SETTINGS_DEFAULTS.answerClockSeconds;

  return {
    hostControlsEnabled:
      typeof input.hostControlsEnabled === "boolean"
        ? input.hostControlsEnabled
        : HOST_SETTINGS_DEFAULTS.hostControlsEnabled,
    requireAdminPinForScoreAdjustment:
      typeof input.requireAdminPinForScoreAdjustment === "boolean"
        ? input.requireAdminPinForScoreAdjustment
        : HOST_SETTINGS_DEFAULTS.requireAdminPinForScoreAdjustment,
    allowHostAnswerReveal:
      typeof input.allowHostAnswerReveal === "boolean"
        ? input.allowHostAnswerReveal
        : HOST_SETTINGS_DEFAULTS.allowHostAnswerReveal,
    hostTimerIncrements: increments.length > 0 ? [...new Set(increments)] : HOST_SETTINGS_DEFAULTS.hostTimerIncrements,
    hostUndoDepth,
    answererTimerBehavior,
    answerClockSeconds
  };
}

async function getHostSettings() {
  const settings = (await readAppSettings()) ?? {};
  return sanitizeHostSettings(settings);
}

async function setHostSettings(hostSettings) {
  const settings = (await readAppSettings()) ?? {};
  const sanitized = sanitizeHostSettings(hostSettings);
  await writeAppSettings({ ...settings, ...sanitized });
  return sanitized;
}

async function getAdminLockState() {
  const settings = (await readAppSettings()) ?? {};
  return { configured: typeof settings.adminPin === "string" && settings.adminPin.length > 0 };
}

async function setAdminPin(pin) {
  if (typeof pin !== "string" || !/^\d{4,12}$/.test(pin)) {
    throw new Error("Admin PIN must be 4 to 12 digits.");
  }

  const settings = (await readAppSettings()) ?? {};
  await writeAppSettings({ ...settings, adminPin: pin });
  return getAdminLockState();
}

async function clearAdminPin() {
  const settings = (await readAppSettings()) ?? {};
  const { adminPin, ...rest } = settings;
  await writeAppSettings(rest);
  return getAdminLockState();
}

async function verifyAdminPin(pin) {
  const settings = (await readAppSettings()) ?? {};
  return !settings.adminPin || settings.adminPin === pin;
}

function getUpdateDirectory() {
  return path.join(app.getPath("userData"), "updates");
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
          "User-Agent": "BibleChallengeAdminUpdater",
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

function getInstallerAsset(release, role) {
  const pattern = INSTALLER_ASSET_PATTERNS[role];
  return Array.isArray(release.assets) ? release.assets.find((asset) => asset && pattern.test(asset.name)) : null;
}

// Compares this release's tag against the ADMIN CONSOLE's own app.getVersion() — per the
// project's version-source-of-truth convention, the admin console's package.json version
// is the single source of truth for "the release version" since both apps' package.json
// versions are asserted to match at release-build time (see release-scripts/build-release.mjs).
async function checkForUpdates() {
  const release = await getLatestRelease();
  const latestVersion = String(release.tag_name || "").replace(/^v/i, "");
  const currentVersion = app.getVersion();
  const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

  const mainAsset = getInstallerAsset(release, "main");
  const adminAsset = getInstallerAsset(release, "admin");

  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    releaseName: release.name || release.tag_name,
    releaseUrl: release.html_url || GITHUB_RELEASES_URL,
    mainInstaller: mainAsset ? { assetName: mainAsset.name, assetSize: mainAsset.size } : null,
    adminInstaller: adminAsset ? { assetName: adminAsset.name, assetSize: adminAsset.size } : null,
    message: hasUpdate
      ? `Version ${latestVersion} is available.`
      : "Bible Challenge and the admin console are up to date."
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
          "User-Agent": "BibleChallengeAdminUpdater",
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

// Downloads and opens ONE installer (role: "main" or "admin"). The renderer's combined
// "Update both apps" action calls this twice — main first, then admin last, since
// launching the admin console's own installer may require this process to exit.
async function downloadAndInstallOne(role) {
  // Hard guard, independent of the update-check URL stub above: in test mode this always
  // throws before downloading or spawning anything, so an E2E test can exercise the button
  // and error path without ever launching a real installer. See
  // specs/automated-testing-spec.md section 4.6.
  if (isTestMode) {
    throw new Error("Installer download and install is disabled in test mode.");
  }

  const release = await getLatestRelease();
  const asset = getInstallerAsset(release, role);
  const latestVersion = String(release.tag_name || "").replace(/^v/i, "");

  if (!asset) {
    throw new Error(`The latest release does not include a ${role === "main" ? "Bible Challenge" : "admin console"} installer.`);
  }

  if (compareVersions(latestVersion, app.getVersion()) <= 0 && role === "admin") {
    return { started: false, message: "The admin console is already up to date." };
  }

  const updateDirectory = getUpdateDirectory();
  await fs.mkdir(updateDirectory, { recursive: true });
  const installerPath = path.join(updateDirectory, asset.name);

  if (!isPathInsideDirectory(installerPath, updateDirectory)) {
    throw new Error("The update installer filename is not safe to download.");
  }

  try {
    await downloadFile(asset.browser_download_url, installerPath);
  } catch (error) {
    const token = await getGitHubAuthToken();
    if (!token) {
      throw error;
    }
    await downloadFile(asset.url, installerPath, token);
  }

  const openError = await shell.openPath(installerPath);
  if (openError) {
    throw new Error(openError);
  }

  return { started: true, installerPath, message: `The ${role === "main" ? "Bible Challenge" : "admin console"} installer was downloaded and opened.` };
}

// Installs the main app's update first, then this admin console's own update last (so this
// process only needs to exit once, right before its own installer takes over).
async function downloadAndInstallBoth() {
  const mainResult = await downloadAndInstallOne("main");
  const adminResult = await downloadAndInstallOne("admin");

  if (adminResult.started) {
    app.quit();
  }

  return { main: mainResult, admin: adminResult };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    show: true,
    autoHideMenuBar: true,
    backgroundColor: "#1f2430",
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
  const query = isTestMode ? "?e2e=1" : "";

  if (devServerUrl) {
    window.loadURL(`${devServerUrl}${query}`);
    return;
  }

  window.loadFile(
    path.join(__dirname, "..", "dist", "index.html"),
    query ? { query: Object.fromEntries(new URLSearchParams(query.slice(1))) } : undefined
  );
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

ipcMain.handle("app-settings:get-stats-and-ratings", async () => {
  return getStatsAndRatings();
});

ipcMain.handle("app-settings:clear-stats", async () => {
  return clearStats();
});

ipcMain.handle("app-settings:clear-ratings", async () => {
  return clearRatings();
});

ipcMain.handle("app-settings:export", async () => {
  return exportAppSettings();
});

ipcMain.handle("app-settings:import", async () => {
  return importAppSettings();
});

ipcMain.handle("app-settings:clear-all", async () => {
  return clearAppSettings();
});

ipcMain.handle("app-settings:get-feedback-endpoint", async () => {
  return getFeedbackEndpoint();
});

ipcMain.handle("app-settings:set-feedback-endpoint", async (_event, endpoint) => {
  return setFeedbackEndpoint(endpoint);
});

ipcMain.handle("app-settings:get-host-settings", async () => {
  return getHostSettings();
});

ipcMain.handle("app-settings:set-host-settings", async (_event, hostSettings) => {
  return setHostSettings(hostSettings);
});

ipcMain.handle("admin-lock:get-state", async () => {
  return getAdminLockState();
});

ipcMain.handle("admin-lock:set-pin", async (_event, pin) => {
  return setAdminPin(pin);
});

ipcMain.handle("admin-lock:clear-pin", async () => {
  return clearAdminPin();
});

ipcMain.handle("admin-lock:verify", async (_event, pin) => {
  return verifyAdminPin(pin);
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
  return removeCustomContentPack(packId);
});

ipcMain.handle("updates:check", async () => {
  return checkForUpdates();
});

ipcMain.handle("updates:download-and-install-both", async () => {
  return downloadAndInstallBoth();
});

// Development/verification-only: lets scripts/smoke-test-user-data.mjs and the main app's
// own equivalent write/read a sentinel value into the shared app-settings.json to prove
// both apps resolve app.getPath("userData") to the same folder. Safe to keep in production
// builds (it only ever touches one throwaway key), but not exposed in any UI.
ipcMain.handle("dev:write-sentinel", async (_event, value) => {
  const settings = (await readAppSettings()) ?? {};
  await writeAppSettings({ ...settings, __userDataSentinel: value });
  return value;
});

ipcMain.handle("dev:read-sentinel", async () => {
  const settings = (await readAppSettings()) ?? {};
  return settings.__userDataSentinel ?? null;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
