const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopHost", {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node
  },
  exitApp: () => ipcRenderer.invoke("app:exit"),
  openExternal: (url) => ipcRenderer.invoke("app:open-external", url),
  getAppSettings: () => ipcRenderer.invoke("app:get-settings"),
  saveAppSettings: (settings) => ipcRenderer.invoke("app:save-settings", settings),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  downloadAndInstallUpdate: () => ipcRenderer.invoke("updates:download-and-install"),
  listCustomContentPacks: () => ipcRenderer.invoke("custom-content:list"),
  chooseCustomContentJson: () => ipcRenderer.invoke("custom-content:choose-json"),
  saveCustomContentPack: (pack) => ipcRenderer.invoke("custom-content:save", pack),
  removeCustomContentPack: (packId) => ipcRenderer.invoke("custom-content:remove", packId)
});

contextBridge.exposeInMainWorld("audioHost", {
  getAudioSettings: () => ipcRenderer.invoke("audio:get-settings"),
  saveAudioSettings: (settings) => ipcRenderer.invoke("audio:save-settings", settings),
  importBackgroundMusic: () => ipcRenderer.invoke("audio:import-background-music"),
  removeBackgroundMusic: () => ipcRenderer.invoke("audio:remove-background-music")
});
