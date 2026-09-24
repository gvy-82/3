const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { Recorder } = require('./recorder');
const { RemoteServer } = require('./remote-server');
const { EPGParser } = require('./epg-parser');

let mainWindow = null;
let tray = null;
let recorder = null;
let remoteServer = null;
let epgParser = null;

// Пути для данных приложения
const userDataPath = app.getPath('userData');
const recordingsPath = path.join(userDataPath, 'Recordings');
const configPath = path.join(userDataPath, 'config.json');

// Создать папку для записей
if (!fs.existsSync(recordingsPath)) {
  fs.mkdirSync(recordingsPath, { recursive: true });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 450,
    backgroundColor: '#000000',
    title: 'IP-TV Player',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Для HLS потоков
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset', // macOS
    frame: process.platform !== 'darwin',
  });

  // В dev-режиме загружаем с Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // В production загружаем собранный билд
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Обработка закрытия окна — сворачиваем в трей
  mainWindow.on('close', (event) => {
    if (recorder && recorder.isRecording()) {
      event.preventDefault();
      mainWindow.hide();
      // Уведомление о фоновой записи
      if (tray) {
        tray.setToolTip('IP-TV Player — запись в фоне');
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);
  } else {
    // Используем дефолтную иконку
    tray = new Tray(path.join(__dirname, 'tray-icon.png'));
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Показать окно',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Запись',
      submenu: [
        {
          label: 'Начать запись',
          click: () => mainWindow?.webContents.send('menu-action', 'start-recording'),
        },
        {
          label: 'Остановить запись',
          click: () => mainWindow?.webContents.send('menu-action', 'stop-recording'),
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Открыть папку записей',
      click: () => {
        const { shell } = require('electron');
        shell.openPath(recordingsPath);
      },
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        if (recorder) recorder.stopAll();
        app.exit(0);
      },
    },
  ]);

  tray.setToolTip('IP-TV Player');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function registerGlobalShortcuts() {
  // Глобальные горячие клавиши (работают даже когда окно не в фокусе)
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('shortcut', 'toggle-play');
  });

  globalShortcut.register('MediaStop', () => {
    mainWindow?.webContents.send('shortcut', 'stop');
  });

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow?.webContents.send('shortcut', 'next-channel');
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow?.webContents.send('shortcut', 'prev-channel');
  });

  // Ctrl+Shift+R — быстрая запись
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow?.webContents.send('shortcut', 'toggle-recording');
  });
}

// IPC обработчики
function setupIPC() {
  // Запись потока
  ipcMain.handle('recording:start', async (event, { url, channelName, format }) => {
    if (!recorder) recorder = new Recorder(recordingsPath);
    const filename = `${channelName}_${new Date().toISOString().replace(/[:.]/g, '-')}.${format || 'ts'}`;
    const filepath = path.join(recordingsPath, filename);
    
    try {
      await recorder.start(url, filepath);
      return { success: true, filepath, filename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('recording:stop', async () => {
    if (recorder) {
      await recorder.stop();
      return { success: true };
    }
    return { success: false, error: 'No active recording' };
  });

  ipcMain.handle('recording:status', () => {
    return recorder ? recorder.getStatus() : { isRecording: false };
  });

  // Открыть диалог выбора файла
  ipcMain.handle('dialog:openFile', async (event, { filters }) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: filters || [
        { name: 'Плейлисты', extensions: ['m3u', 'm3u8', 'txt'] },
        { name: 'Все файлы', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });
    return result;
  });

  // Открыть диалог сохранения
  ipcMain.handle('dialog:saveFile', async (event, { defaultPath, filters }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: filters || [
        { name: 'Video', extensions: ['ts', 'mp4', 'mkv'] },
      ],
    });
    return result;
  });

  // EPG парсинг
  ipcMain.handle('epg:parse', async (event, { filepath }) => {
    if (!epgParser) epgParser = new EPGParser();
    try {
      const data = await epgParser.parseFile(filepath);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Получить путь к записям
  ipcMain.handle('paths:recordings', () => recordingsPath);
  ipcMain.handle('paths:userData', () => userDataPath);

  // Управление окном
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.hide());

  // Запуск HTTP сервера для пульта
  ipcMain.handle('remote:start', async () => {
    if (!remoteServer) {
      remoteServer = new RemoteServer(mainWindow);
    }
    const address = await remoteServer.start();
    return address;
  });

  ipcMain.handle('remote:stop', async () => {
    if (remoteServer) {
      await remoteServer.stop();
    }
  });

  // UDP Multicast (нативная поддержка через node.js)
  ipcMain.handle('udp:join', async (event, { address, port }) => {
    const dgram = require('dgram');
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    
    return new Promise((resolve) => {
      socket.bind(port, () => {
        socket.addMembership(address);
        socket.on('message', (msg) => {
          mainWindow?.webContents.send('udp:data', { address, port, data: msg.toString('base64') });
        });
        resolve({ success: true });
      });
      socket.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  });
}

// Запуск приложения
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();
  setupIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (recorder) recorder.stopAll();
  if (remoteServer) remoteServer.stop();
});

// Запретить второй экземпляр
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
