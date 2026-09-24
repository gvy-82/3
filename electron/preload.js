const { contextBridge, ipcRenderer } = require('electron');

// Безопасный мост между Electron (Node.js) и React (браузер)
contextBridge.exposeInMainWorld('electronAPI', {
  // Запись
  recording: {
    start: (options) => ipcRenderer.invoke('recording:start', options),
    stop: () => ipcRenderer.invoke('recording:stop'),
    status: () => ipcRenderer.invoke('recording:status'),
  },

  // Диалоги
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  },

  // EPG
  epg: {
    parse: (options) => ipcRenderer.invoke('epg:parse', options),
  },

  // Пути
  paths: {
    recordings: () => ipcRenderer.invoke('paths:recordings'),
    userData: () => ipcRenderer.invoke('paths:userData'),
  },

  // Окно
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // Пульт управления
  remote: {
    start: () => ipcRenderer.invoke('remote:start'),
    stop: () => ipcRenderer.invoke('remote:stop'),
  },

  // UDP
  udp: {
    join: (options) => ipcRenderer.invoke('udp:join', options),
  },

  // События от главного процесса
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut', (_, action) => callback(action));
  },
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_, action) => callback(action));
  },
  onUDPData: (callback) => {
    ipcRenderer.on('udp-data', (_, data) => callback(data));
  },
  onRemoteCommand: (callback) => {
    ipcRenderer.on('remote-command', (_, command) => callback(command));
  },

  // Платформа
  platform: process.platform,
  isElectron: true,
});
