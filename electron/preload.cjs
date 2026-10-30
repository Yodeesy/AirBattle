const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadProfile: () => ipcRenderer.invoke('save:loadProfile'),
  saveProfile: (profile) => ipcRenderer.invoke('save:saveProfile', profile),
  getSavePath: () => ipcRenderer.invoke('save:getSavePath'),
  isDesktop: true
});
