# IP-TV Player — Десктопная версия

## Упаковка в Desktop-приложение (Electron)

### 📋 Что потребуется

- Node.js 18+
- npm или yarn

### 🚀 Быстрый старт

```bash
# 1. Установить зависимости для Electron
npm install --save-dev electron electron-builder concurrently wait-on
npm install --save electron-store node-ssdp multicast-dns

# 2. Запустить dev-режим (Vite + Electron)
npm run electron:dev

# 3. Собрать установщик
npm run electron:build
```

### 📦 Доступные форматы сборки

| ОС      | Формат                  | Команда                          |
|---------|-------------------------|----------------------------------|
| Windows | `.exe` (NSIS)          | `npm run electron:build:win`    |
| macOS   | `.dmg` / `.app`        | `npm run electron:build:mac`    |
| Linux   | `.deb` / `.AppImage`   | `npm run electron:build:linux`  |

### 🔧 Ручная настройка

Если вы хотите настроить сборку вручную, добавьте в `package.json`:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "build": {
    "appId": "com.iptv-player.app",
    "productName": "IP-TV Player",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/icon.icns",
      "category": "public.app-category.entertainment"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/icon.png",
      "category": "AudioVideo"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 🎯 Почему Electron?

Для IP-TV плеера Electron — оптимальный выбор, потому что:

1. **UDP Multicast** — нужен node.js для приёма UDP потоков (браузер не умеет)
2. **Запись в файл** — прямой доступ к файловой системе
3. **HTTP-сервер пульта** — встроенный сервер для управления со смартфона
4. **Нативные уведомления** — OSD, планировщик
5. **Автозапуск** — фоновая запись при старте системы
6. **Системный трей** — сворачивание в трей при фоновой записи

### 🔄 Альтернативы

| Решение    | Плюсы                          | Минусы                              |
|------------|--------------------------------|-------------------------------------|
| **Electron** | Полная функциональность, npm  | Размер ~150MB, потребление RAM     |
| **Tauri**    | Малый размер ~10MB, Rust     | Нет прямого UDP, сложнее с нативным |
| **NW.js**    | Простая интеграция           | Меньше сообщество                   |

### 📁 Структура проекта

```
iptv-player/
├── electron/
│   ├── main.js          # Главный процесс Electron
│   ├── preload.js       # Preload скрипт (IPC мост)
│   ├── recorder.js      # Модуль записи потоков
│   ├── remote-server.js # HTTP сервер для пульта
│   └── epg-parser.js    # Парсер XMLTV/JTV
├── src/                 # React приложение (фронтенд)
├── public/
│   ├── icon.png         # Иконка приложения
│   └── icon.ico         # Иконка Windows
├── package.json
└── README.md
```

### ⚡ Оптимизация размера

```bash
# Уменьшить размер Electron-приложения
npm install --save-dev electron-builder

# Использовать electron-packager для минимальной сборки
npm install --save-dev @electron/packager

# Сборка только для текущей платформы
npx electron-builder --linux --x64

# Убрать отладочные символы
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
```

### 🔐 Подпись и дистрибуция

**Windows:**
- Получить код-подписывающий сертификат (EV recommended)
- `electron-builder --win --config.win.signAndEditExecutable=true`

**macOS:**
- Apple Developer Account ($99/год)
- Notarization через `@electron/notarize`

**Linux:**
- Подпись через GPG
- Публикация в Snap Store / Flathub

### 🧩 Нативные модули для IP-TV

```bash
# Для UDP multicast
npm install multicast-dns node-ssdp

# Для записи потоков
npm install fluent-ffmpeg

# Для системного трея (уже в Electron)
# Для автозапуска
npm install auto-launch

# Для глобальных горячих клавиш
# Уже встроено в Electron (globalShortcut)
```
