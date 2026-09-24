# 📺 IP-TV Player — Сборка Windows .exe

## ⚡ Быстрая сборка (5 минут)

### Требования
- **Windows 10/11** (x64)
- **Node.js 18+** — [скачать](https://nodejs.org/)
- **Git** — [скачать](https://git-scm.com/)

### Шаг 1: Клонировать проект

```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd iptv-player
```

Или скачайте ZIP и распакуйте.

### Шаг 2: Установить зависимости

```bash
npm install
npm install --save-dev electron electron-builder concurrently wait-on cross-env
npm install --save electron-store
```

### Шаг 3: Обновить package.json

Откройте `package.json` и добавьте/измените следующие поля:

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
    "electron:build": "npm run build && electron-builder --win --x64",
    "electron:build:portable": "npm run build && electron-builder --win portable",
    "electron:preview": "npm run build && electron ."
  }
}
```

### Шаг 4: Создать иконку (опционально)

Создайте файл `public/icon.ico` (256x256 или 512x512).

**Без иконки** — Electron использует стандартную.

**С иконкой** — конвертируйте PNG в ICO:
```bash
# Онлайн конвертер: https://convertio.co/png-ico/
# Или через ImageMagick:
magick convert public/icon.png -define icon:auto-resize=256,128,64,48,32,16 public/icon.ico
```

### Шаг 5: Собрать .exe

```bash
npm run electron:build
```

**Результат:** `release/IP-TV Player Setup 1.0.0.exe` (~80-120 MB)

### Шаг 6: Установить

Запустите `release/IP-TV Player Setup 1.0.0.exe`

---

## 🎯 Альтернативы

### Portable версия (без установки)

```bash
npm run electron:build:portable
```

**Результат:** `release/IP-TV Player 1.0.0.exe` — запускается без установки.

### Тестирование без сборки

```bash
npm run electron:dev
```

Откроется окно приложения с hot-reload.

---

## 📦 Что входит в сборку

| Компонент | Размер | Назначение |
|-----------|--------|-----------|
| Electron runtime | ~70 MB | Chromium + Node.js |
| React приложение | ~5 MB | Ваш UI |
| Нативные модули | ~5 MB | Запись, UDP, EPG |
| **Итого** | **~80-120 MB** | |

---

## 🔧 Решение проблем

### Ошибка: "electron not found"

```bash
npm install --save-dev electron
```

### Ошибка: "electron-builder not found"

```bash
npm install --save-dev electron-builder
```

### Ошибка сборки на Windows

```bash
# Очистить кэш
rmdir /s /q node_modules
rmdir /s /q release
npm install
npm run electron:build
```

### Антивирус блокирует .exe

Добавьте папку `release/` в исключения антивируса или подпишите код:

```bash
# В electron-builder.json добавьте:
"win": {
  "signingHashAlgorithms": ["sha256"],
  "sign": "./sign.js"
}
```

### Большой размер .exe

```bash
# Удалить ненужные файлы из node_modules
npm prune --production

# Использовать electron-packager вместо electron-builder
npm install --save-dev @electron/packager
npx electron-packager . IP-TV-Player --platform=win32 --arch=x64 --overwrite
```

---

## 🚀 Автоматическая сборка (GitHub Actions)

Создайте файл `.github/workflows/build.yml`:

```yaml
name: Build Desktop

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm install
        npm install --save-dev electron electron-builder concurrently wait-on cross-env
        npm install --save electron-store
    
    - name: Build
      run: npm run electron:build
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: windows-installer
        path: release/*.exe
```

**Теперь при создании тега `v1.0.0`** — GitHub автоматически соберёт `.exe`.

---

## 📝 Чеклист перед публикацией

- [ ] Протестировано на чистой Windows VM
- [ ] Все функции работают (запись, EPG, пульт)
- [ ] Иконка отображается корректно
- [ ] Антивирус не блокирует (или код подписан)
- [ ] Создан CHANGELOG.md
- [ ] Обновлён README.md
- [ ] Добавлен LICENSE

---

## 🎬 Что дальше?

После сборки `.exe`:

1. **Протестируйте** на разных Windows версиях
2. **Подпишите код** (опционально, для доверия)
3. **Опубликуйте** на GitHub Releases
4. **Настройте автообновления** через electron-updater

### Публикация на GitHub Releases

```bash
# Установите GitHub CLI
winget install GitHub.cli

# Войдите
gh auth login

# Создайте релиз
gh release create v1.0.0 release/*.exe --title "IP-TV Player v1.0.0" --notes "Первый релиз"
```

---

## 💡 Альтернативы Electron

Если нужен **меньший размер** (~10 MB вместо ~100 MB):

### Tauri (Rust + WebView)

```bash
npm install --save-dev @tauri-apps/cli @tauri-apps/api
npx tauri init
npx tauri build
```

**Минусы для IP-TV:**
- ❌ Нет UDP multicast из коробки
- ❌ Нужен Rust backend
- ✅ Размер ~10 MB
- ✅ Быстрый запуск

### NW.js

```bash
npm install --save-dev nw
```

Проще чем Electron, но меньше сообщество.

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте Node.js версию: `node -v` (должна быть 18+)
2. Удалите `node_modules` и переустановите
3. Проверьте логи в `release/*.log`
4. Создайте issue в репозитории

---

**Готово!** Теперь у вас есть всё для сборки Windows .exe.
