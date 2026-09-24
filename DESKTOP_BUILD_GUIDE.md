# 📺 IP-TV Player — Полная инструкция по сборке Desktop-версии

## 🎯 Обзор

Данный проект — веб-приложение на React + Vite + Tailwind CSS.
Для создания Desktop-версии используется **Electron**, который оборачивает веб-приложение в нативное окно с доступом к системным API.

---

## 📦 Пошаговая инструкция

### Шаг 1: Установка зависимостей

```bash
# Основные Electron-зависимости
npm install --save-dev electron electron-builder concurrently wait-on

# Нативные модули для IP-TV функциональности
npm install --save electron-store
```

### Шаг 2: Модификация package.json

Добавьте в ваш `package.json` следующие поля:

```json
{
  "name": "iptv-player",
  "version": "1.0.0",
  "description": "IP-TV Player — просмотр потокового телевидения",
  "main": "electron/main.js",
  "author": "Your Name",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win --x64",
    "electron:build:mac": "npm run build && electron-builder --mac --x64 --arm64",
    "electron:build:linux": "npm run build && electron-builder --linux --x64",
    "electron:preview": "npm run build && electron ."
  }
}
```

### Шаг 3: Установка cross-env (для Windows)

```bash
npm install --save-dev cross-env
```

### Шаг 4: Создание иконок

Создайте иконки в папке `public/`:
- `icon.png` — 512x512 (Linux)
- `icon.ico` — Windows (можно сгенерировать из PNG)
- `icon.icns` — macOS

**Генерация .ico из .png (Linux/macOS):**
```bash
# Установить ImageMagick
sudo apt install imagemagick  # Linux
brew install imagemagick      # macOS

# Конвертация
convert public/icon.png -define icon:auto-resize=256,128,64,48,32,16 public/icon.ico
```

**Генерация .icns (macOS):**
```bash
mkdir icon.iconset
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
iconutil -c icns icon.iconset -o public/icon.icns
```

### Шаг 5: Запуск в режиме разработки

```bash
npm run electron:dev
```

Это запустит Vite dev server и откроет Electron окно с hot-reload.

### Шаг 6: Сборка дистрибутива

```bash
# Для текущей платформы
npm run electron:build

# Только Windows
npm run electron:build:win

# Только macOS
npm run electron:build:mac

# Только Linux
npm run electron:build:linux
```

Результат появится в папке `release/`.

---

## 🖥️ Результат сборки

### Windows
```
release/
├── IP-TV Player-1.0.0-Windows-x64.exe    # Установщик NSIS
├── IP-TV Player-1.0.0-Windows-x64.exe    # Portable версия
└── latest.yml                            # Для автообновлений
```

### macOS
```
release/
├── IP-TV Player-1.0.0-macOS-x64.dmg     # Intel
├── IP-TV Player-1.0.0-macOS-arm64.dmg   # Apple Silicon
└── latest-mac.yml
```

### Linux
```
release/
├── IP-TV-Player-1.0.0-Linux-x64.AppImage  # Universal
├── iptv-player_1.0.0_amd64.deb            # Debian/Ubuntu
├── iptv-player-1.0.0.x86_64.rpm           # Fedora/CentOS
└── latest-linux.yml
```

---

## 🔧 Расширенная конфигурация

### Автозапуск при старте системы

Добавьте в `electron/main.js`:

```javascript
const AutoLaunch = require('auto-launch');

const autoLauncher = new AutoLaunch({
  name: 'IP-TV Player',
  path: app.getPath('exe'),
  isHidden: true, // Запускать свёрнутым в трей
});

// Включить автозапуск
autoLauncher.enable();
```

### Глобальные горячие клавиши

Уже реализовано в `electron/main.js`:
- `MediaPlayPause` — пауза/воспроизведение
- `MediaNextTrack` — следующий канал
- `MediaPreviousTrack` — предыдущий канал
- `Ctrl+Shift+R` — начать/остановить запись

### Системный трей

Уже реализовано — при закрытии окна во время записи приложение сворачивается в трей.

### Обновления (autoUpdater)

```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-available');
});
```

---

## 📊 Размеры дистрибутивов

| Платформа | Формат | Примерный размер |
|-----------|--------|------------------|
| Windows | .exe (NSIS) | ~80-120 MB |
| Windows | .exe (Portable) | ~80-120 MB |
| macOS | .dmg | ~100-150 MB |
| Linux | .AppImage | ~80-100 MB |
| Linux | .deb | ~70-90 MB |

### Уменьшение размера

```bash
# Использовать electron-lite (без ненужных модулей)
npm install --save-dev electron@latest

# Удалить неиспользуемые файлы
# В electron-builder.json:
"files": [
  "dist/**/*",
  "electron/**/*",
  "!**/node_modules/*/{CHANGELOG.md,README.md,readme.md,README*,test,*test*}"
]
```

---

## 🐛 Отладка

### Просмотр логов

```bash
# Запустить с логами
npm run electron:dev

# Или с отладкой Chromium
electron . --remote-debugging-port=9222
```

### DevTools в production

Добавьте в `electron/main.js`:
```javascript
if (process.env.DEBUG) {
  mainWindow.webContents.openDevTools();
}
```

---

## 🔄 Альтернатива: Tauri (лёгкий вариант)

Если нужен минимальный размер (~10 MB вместо ~100 MB):

```bash
# Установка Tauri
npm install --save-dev @tauri-apps/cli @tauri-apps/api

# Инициализация
npx tauri init

# Сборка
npx tauri build
```

**Ограничения Tauri для IP-TV:**
- ❌ Нет прямого UDP multicast
- ❌ Нужен Rust backend для записи
- ❌ Сложнее с нативными модулями
- ✅ Малый размер
- ✅ Быстрый запуск

---

## 📝 Чеклист перед публикацией

- [ ] Созданы иконки для всех платформ
- [ ] Протестирована запись потоков
- [ ] Проверен UDP multicast (если используется)
- [ ] Работает HTTP-сервер пульта
- [ ] Настроены глобальные горячие клавиши
- [ ] Добавлен автозапуск (опционально)
- [ ] Подписан код (Windows/macOS)
- [ ] Настроены автообновления
- [ ] Создан CHANGELOG.md
- [ ] Добавлен LICENSE

---

## 🚀 Публикация

### GitHub Releases

```bash
# Установить GitHub CLI
gh auth login

# Создать релиз
GH_TOKEN=your_token npm run electron:build -- --publish always
```

### Scoop (Windows)

Создайте манифест `iptv-player.json` в scoop bucket.

### Homebrew (macOS)

Создайте Cask в custom tap.

### AUR (Arch Linux)

Создайте PKGBUILD:
```bash
pkgname=iptv-player
pkgver=1.0.0
pkgrel=1
pkgdesc="IP-TV Player"
arch=('x86_64')
url="https://github.com/your/repo"
source=("https://github.com/your/repo/releases/download/v$pkgver/IP-TV-Player-$pkgver-Linux-x64.AppImage")
sha256sums=('...')

package() {
  install -Dm755 "$srcdir/IP-TV-Player-$pkgver-Linux-x64.AppImage" "$pkgdir/usr/bin/iptv-player"
}
```
