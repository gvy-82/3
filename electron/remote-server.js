const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

class RemoteServer {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.server = null;
    this.port = 8080;
  }

  /**
   * Запустить HTTP сервер для пульта управления
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          this.port++;
          this.server.listen(this.port);
        } else {
          reject(err);
        }
      });

      this.server.listen(this.port, '0.0.0.0', () => {
        const address = this.getLocalAddress();
        console.log(`Remote server started at http://${address}:${this.port}`);
        resolve(`http://${address}:${this.port}`);
      });
    });
  }

  /**
   * Остановить сервер
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Получить локальный IP адрес
   */
  getLocalAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  /**
   * Обработка HTTP запросов
   */
  handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (pathname) {
      case '/':
        this.serveRemoteUI(res);
        break;
      case '/api/status':
        this.handleStatus(res);
        break;
      case '/api/channels':
        this.handleChannels(res);
        break;
      case '/api/play':
        this.handlePlay(req, res);
        break;
      case '/api/command':
        this.handleCommand(req, res);
        break;
      case '/api/volume':
        this.handleVolume(req, res);
        break;
      default:
        res.writeHead(404);
        res.end('Not found');
    }
  }

  /**
   * Отдать HTML интерфейс пульта
   */
  serveRemoteUI(res) {
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>IP-TV Remote</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, sans-serif;
      background: #1a1a2e;
      color: #fff;
      min-height: 100vh;
      padding: 20px;
      touch-action: manipulation;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header h1 {
      font-size: 1.5em;
      color: #4a9eff;
    }
    .channel-name {
      text-align: center;
      font-size: 1.2em;
      color: #ccc;
      margin: 10px 0;
      min-height: 1.5em;
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      max-width: 300px;
      margin: 20px auto;
    }
    .btn {
      background: #2a2a4a;
      border: 1px solid #3a3a5a;
      border-radius: 12px;
      padding: 20px;
      color: #fff;
      font-size: 1.5em;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: all 0.1s;
    }
    .btn:active {
      background: #4a4a6a;
      transform: scale(0.95);
    }
    .btn-primary {
      background: #4a9eff;
      border-color: #4a9eff;
    }
    .btn-danger {
      background: #ff4a4a;
      border-color: #ff4a4a;
    }
    .volume-control {
      margin: 20px auto;
      max-width: 300px;
    }
    .volume-slider {
      width: 100%;
      height: 8px;
      -webkit-appearance: none;
      appearance: none;
      background: #2a2a4a;
      border-radius: 4px;
      outline: none;
    }
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      background: #4a9eff;
      border-radius: 50%;
      cursor: pointer;
    }
    .bottom-controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 30px;
    }
    .bottom-btn {
      background: #2a2a4a;
      border: 1px solid #3a3a5a;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.2em;
      cursor: pointer;
    }
    .bottom-btn:active {
      background: #4a4a6a;
    }
    .channel-list {
      margin-top: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    .channel-item {
      padding: 12px;
      border-bottom: 1px solid #2a2a4a;
      cursor: pointer;
    }
    .channel-item:active {
      background: #2a2a4a;
    }
    .channel-item.active {
      background: #1a3a5a;
      border-left: 3px solid #4a9eff;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📺 IP-TV Remote</h1>
  </div>
  
  <div class="channel-name" id="channelName">—</div>

  <div class="controls">
    <div></div>
    <button class="btn" onclick="sendCommand('channel-up')">▲</button>
    <div></div>
    <button class="btn" onclick="sendCommand('channel-prev')">◄</button>
    <button class="btn btn-primary" onclick="sendCommand('ok')">OK</button>
    <button class="btn" onclick="sendCommand('channel-next')">►</button>
    <div></div>
    <button class="btn" onclick="sendCommand('channel-down')">▼</button>
    <div></div>
  </div>

  <div class="volume-control">
    <input type="range" class="volume-slider" min="0" max="100" value="80"
      oninput="setVolume(this.value)">
  </div>

  <div class="bottom-controls">
    <button class="bottom-btn" onclick="sendCommand('mute')">🔇</button>
    <button class="bottom-btn" onclick="sendCommand('play-pause')">⏯</button>
    <button class="bottom-btn btn-danger" onclick="sendCommand('record')">⏺</button>
    <button class="bottom-btn" onclick="sendCommand('list')">☰</button>
    <button class="bottom-btn" onclick="sendCommand('fullscreen')">⛶</button>
  </div>

  <div class="channel-list" id="channelList"></div>

  <script>
    async function sendCommand(cmd) {
      try {
        await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd }),
        });
        updateStatus();
      } catch(e) { console.error(e); }
    }

    async function setVolume(val) {
      try {
        await fetch('/api/volume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volume: parseInt(val) }),
        });
      } catch(e) { console.error(e); }
    }

    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        document.getElementById('channelName').textContent = data.currentChannel || '—';
      } catch(e) {}
    }

    async function loadChannels() {
      try {
        const res = await fetch('/api/channels');
        const data = await res.json();
        const list = document.getElementById('channelList');
        list.innerHTML = data.channels.map(ch =>
          '<div class="channel-item" onclick="playChannel(\\'' + ch.id + '\\')">' + ch.name + '</div>'
        ).join('');
      } catch(e) {}
    }

    async function playChannel(id) {
      try {
        await fetch('/api/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: id }),
        });
        updateStatus();
      } catch(e) {}
    }

    updateStatus();
    loadChannels();
    setInterval(updateStatus, 3000);
  </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  /**
   * API: Получить статус плеера
   */
  handleStatus(res) {
    this.mainWindow?.webContents.executeJavaScript(`
      (function() {
        const store = window.__ZUSTAND_STORE__;
        return {
          currentChannel: store?.getState()?.currentChannel?.name || null,
          isPlaying: store?.getState()?.isPlaying || false,
          volume: store?.getState()?.volume || 0,
          isRecording: store?.getState()?.isRecording || false,
        };
      })()
    `).then((status) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status || {}));
    }).catch(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({}));
    });
  }

  /**
   * API: Получить список каналов
   */
  handleChannels(res) {
    this.mainWindow?.webContents.executeJavaScript(`
      (function() {
        const store = window.__ZUSTAND_STORE__;
        const state = store?.getState();
        const playlist = state?.playlists?.find(p => p.id === state.activePlaylistId);
        return {
          channels: (playlist?.channels || []).map(c => ({ id: c.id, name: c.name, group: c.group }))
        };
      })()
    `).then((data) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data || { channels: [] }));
    }).catch(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ channels: [] }));
    });
  }

  /**
   * API: Воспроизвести канал
   */
  handlePlay(req, res) {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const { channelId } = JSON.parse(body);
      this.mainWindow?.webContents.send('remote-command', { action: 'play', channelId });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  }

  /**
   * API: Отправить команду
   */
  handleCommand(req, res) {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const { command } = JSON.parse(body);
      this.mainWindow?.webContents.send('remote-command', { action: 'command', command });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  }

  /**
   * API: Установить громкость
   */
  handleVolume(req, res) {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const { volume } = JSON.parse(body);
      this.mainWindow?.webContents.send('remote-command', { action: 'volume', volume });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  }
}

module.exports = { RemoteServer };
