const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("adminHost", {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node
  },
  exitApp: () => ipcRenderer.invoke("app:exit"),
  openExternal: (url) => ipcRenderer.invoke("app:open-external", url),
  getStatsAndRatings: () => ipcRenderer.invoke("app-settings:get-stats-and-ratings"),
  clearStats: () => ipcRenderer.invoke("app-settings:clear-stats"),
  clearRatings: () => ipcRenderer.invoke("app-settings:clear-ratings"),
  exportAppSettings: () => ipcRenderer.invoke("app-settings:export"),
  importAppSettings: () => ipcRenderer.invoke("app-settings:import"),
  clearAppSettings: () => ipcRenderer.invoke("app-settings:clear-all"),
  getFeedbackEndpoint: () => ipcRenderer.invoke("app-settings:get-feedback-endpoint"),
  setFeedbackEndpoint: (endpoint) => ipcRenderer.invoke("app-settings:set-feedback-endpoint", endpoint),
  getHostSettings: () => ipcRenderer.invoke("app-settings:get-host-settings"),
  setHostSettings: (settings) => ipcRenderer.invoke("app-settings:set-host-settings", settings),
  getAdminLockState: () => ipcRenderer.invoke("admin-lock:get-state"),
  setAdminPin: (pin) => ipcRenderer.invoke("admin-lock:set-pin", pin),
  clearAdminPin: () => ipcRenderer.invoke("admin-lock:clear-pin"),
  verifyAdminPin: (pin) => ipcRenderer.invoke("admin-lock:verify", pin),
  listCustomContentPacks: () => ipcRenderer.invoke("custom-content:list"),
  chooseCustomContentJson: () => ipcRenderer.invoke("custom-content:choose-json"),
  saveCustomContentPack: (pack) => ipcRenderer.invoke("custom-content:save", pack),
  removeCustomContentPack: (packId) => ipcRenderer.invoke("custom-content:remove", packId),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  downloadAndInstallBothUpdates: () => ipcRenderer.invoke("updates:download-and-install-both"),
  writeSentinel: (value) => ipcRenderer.invoke("dev:write-sentinel", value),
  readSentinel: () => ipcRenderer.invoke("dev:read-sentinel")
});
