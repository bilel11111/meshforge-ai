const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('meshforge', {
  isDesktop: true,
  openModel: () => ipcRenderer.invoke('dialog:open-model'),
  saveFile: (payload) => ipcRenderer.invoke('dialog:save-file', payload),
  getPaths: () => ipcRenderer.invoke('app:get-paths'),
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
});
