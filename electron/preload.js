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
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  getAppSettings: () => ipcRenderer.invoke("app:get-settings"),
  saveAppSettings: (settings) => ipcRenderer.invoke("app:save-settings", settings),
  listCustomContentPacks: () => ipcRenderer.invoke("custom-content:list"),
  chooseCustomContentJson: () => ipcRenderer.invoke("custom-content:choose-json"),
  saveCustomContentPack: (pack) => ipcRenderer.invoke("custom-content:save", pack),
  removeCustomContentPack: (packId) => ipcRenderer.invoke("custom-content:remove", packId),
  getProjectorDisplays: () => ipcRenderer.invoke("projector:get-displays"),
  openProjectorWindow: (displayId) => ipcRenderer.invoke("projector:open", displayId),
  closeProjectorWindow: () => ipcRenderer.invoke("projector:close"),
  updateProjectorState: (state) => ipcRenderer.send("projector:update-state", state),
  onProjectorState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("projector:state", listener);
    return () => ipcRenderer.removeListener("projector:state", listener);
  },
  onProjectorWindowStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("projector:window-status", listener);
    return () => ipcRenderer.removeListener("projector:window-status", listener);
  }
});

contextBridge.exposeInMainWorld("audioHost", {
  getAudioSettings: () => ipcRenderer.invoke("audio:get-settings"),
  saveAudioSettings: (settings) => ipcRenderer.invoke("audio:save-settings", settings),
  importBackgroundMusic: () => ipcRenderer.invoke("audio:import-background-music"),
  removeBackgroundMusic: () => ipcRenderer.invoke("audio:remove-background-music")
});
