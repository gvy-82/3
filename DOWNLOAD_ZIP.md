# 📥 Как скачать проект в ZIP

## Вариант 1: Если проект на GitHub

### Через веб-интерфейс:

1. Откройте страницу репозитория в браузере
2. Нажмите зелёную кнопку **"Code"** (вверху справа)
3. В выпадающем меню выберите **"Download ZIP"**
4. Сохраните файл `iptv-player-main.zip`
5. Распакуйте архив

![GitHub Download](https://docs.github.com/assets/cb-62538/mw-1440/images/help/repository/code-button.universal.dev.png)

### Через GitHub CLI:

```bash
# Установите GitHub CLI (если нет)
winget install GitHub.cli

# Войдите
gh auth login

# Скачайте репозиторий
gh repo clone username/iptv-player

# Или скачайте ZIP
gh repo download username/iptv-player
```

---

## Вариант 2: Создание ZIP из локальных файлов

### Windows (PowerShell):

```powershell
# Откройте PowerShell в папке проекта
cd C:\path\to\iptv-player

# Создайте ZIP архив
Compress-Archive -Path src,electron,public,dist,*.json,*.js,*.md,*.sh,*.bat,index.html -DestinationPath iptv-player.zip -Force

# Или используйте 7-Zip (лучшее сжатие)
# Скачать: https://www.7-zip.org/
& "C:\Program Files\7-Zip\7z.exe" a -tzip iptv-player.zip src electron public dist *.json *.js *.md *.sh *.bat index.html -xr!node_modules -xr!release
```

### Windows (через проводник):

1. Откройте папку **выше** проекта
2. Выделите папку `iptv-player`
3. Правый клик → **"Отправить"** → **"Сжатая ZIP-папка"**
4. Готово! Файл `iptv-player.zip` создан

### Linux/macOS (терминал):

```bash
# Перейдите в папку проекта
cd /path/to/iptv-player

# Создайте ZIP (исключая node_modules и release)
zip -r iptv-player.zip . -x "node_modules/*" -x "release/*" -x ".git/*" -x "*.log"

# Или используйте tar.gz (лучше для Linux)
tar -czvf iptv-player.tar.gz --exclude='node_modules' --exclude='release' --exclude='.git' .
```

### Автоматическая упаковка (Node.js скрипт):

```bash
# Запустите скрипт упаковки
node pack-zip.js
```

Создаст файл `iptv-player-YYYY-MM-DD.zip` автоматически.

---

## Вариант 3: Git clone + архивирование

```bash
# Клонируйте репозиторий
git clone https://github.com/username/iptv-player.git

# Перейдите в папку
cd iptv-player

# Создайте ZIP (исключая .git)
zip -r ../iptv-player.zip . -x ".git/*" -x "node_modules/*" -x "release/*"
```

---

## 📦 Что должно быть в ZIP

После распаковки структура должна быть:

```
iptv-player/
├── src/                    # React приложение
├── electron/               # Electron файлы
├── public/                 # Иконки, ресурсы
├── dist/                   # Собранный билд (опционально)
├── package.json            # Зависимости
├── index.html              # Точка входа
├── setup-electron.js       # Настройка Desktop
├── pack-zip.js             # Скрипт упаковки
├── BUILD_WINDOWS.md        # Инструкция сборки
├── README.md               # Документация
└── ... другие файлы
```

**НЕ должны быть включены:**
- ❌ `node_modules/` (установится через `npm install`)
- ❌ `release/` (создаётся при сборке)
- ❌ `.git/` (если не нужен git)
- ❌ `*.log` (логи)

---

## 🚀 После скачивания ZIP

### Шаг 1: Распаковать

**Windows:**
- Правый клик на ZIP → "Извлечь всё..."
- Или используйте 7-Zip / WinRAR

**Linux/macOS:**
```bash
unzip iptv-player.zip
cd iptv-player
```

### Шаг 2: Установить зависимости

```bash
npm install
```

### Шаг 3: Настроить Desktop

```bash
node setup-electron.js
```

### Шаг 4: Собрать .exe

```bash
npm run electron:build
```

**Результат:** `release/IP-TV Player Setup 1.0.0.exe`

---

## 💡 Альтернативные способы получения проекта

### 1. Git clone (рекомендуется)

```bash
git clone https://github.com/username/iptv-player.git
cd iptv-player
```

**Плюсы:**
- ✅ Всегда актуальная версия
- ✅ Можно обновлять через `git pull`
- ✅ Видна история изменений

### 2. Скачать конкретный релиз

Если опубликованы релизы:
1. Перейдите на страницу **Releases**
2. Найдите нужный版本 (например, v1.0.0)
3. В секции **Assets** скачайте `Source code (zip)`

### 3. SVN checkout (если нет Git)

```bash
svn export https://github.com/username/iptv-player/trunk iptv-player
```

### 4. Через файловый менеджер

Если проект на облаке (Google Drive, Dropbox):
1. Откройте папку проекта
2. Нажмите "Скачать"
3. Облако автоматически создаст ZIP

---

## 🔧 Решение проблем

### Ошибка: "zip command not found" (Linux/macOS)

```bash
# Ubuntu/Debian
sudo apt install zip

# macOS
brew install zip

# CentOS/RHEL
sudo yum install zip
```

### Ошибка: "Compress-Archive not found" (Windows)

Обновите PowerShell или используйте 7-Zip:
```powershell
# Установите 7-Zip
winget install 7zip.7zip

# Используйте 7z вместо Compress-Archive
& "C:\Program Files\7-Zip\7z.exe" a iptv-player.zip * -xr!node_modules
```

### Архив слишком большой

Исключите ненужные файлы:
```bash
# Исключить node_modules и release
zip -r iptv-player.zip . -x "node_modules/*" -x "release/*" -x "dist/*"
```

### Ошибка распаковки

Попробуйте другой архиватор:
- **Windows:** 7-Zip (бесплатный) — https://www.7-zip.org/
- **macOS:** The Unarchiver — https://theunarchiver.com/
- **Linux:** unzip (обычно предустановлен)

---

## 📊 Размеры архивов

| Содержимое | Размер ZIP | Размер после распаковки |
|------------|-----------|------------------------|
| Только исходники (без node_modules) | ~2-5 MB | ~5-10 MB |
| С node_modules | ~50-80 MB | ~200-300 MB |
| С dist (собранный билд) | ~3-6 MB | ~8-15 MB |
| Полный проект (всё включено) | ~100-150 MB | ~300-500 MB |

**Рекомендация:** Не включайте `node_modules` в ZIP — они установятся через `npm install`.

---

## ✅ Чеклист перед отправкой ZIP

- [ ] Исключены `node_modules/`
- [ ] Исключены `release/`
- [ ] Исключены `.git/` (если не нужен)
- [ ] Добавлен `README.md`
- [ ] Добавлен `package.json`
- [ ] Проверена структура папок
- [ ] Архив открывается без ошибок
- [ ] Размер разумный (< 10 MB для исходников)

---

## 🎯 Быстрый старт (TL;DR)

### Скачать с GitHub:
```
Code → Download ZIP → Распаковать
```

### Создать ZIP локально:
```bash
# Windows PowerShell
Compress-Archive -Path src,electron,public,*.json,*.js,*.md -DestinationPath iptv-player.zip

# Linux/macOS
zip -r iptv-player.zip . -x "node_modules/*" -x "release/*"

# Или через скрипт
node pack-zip.js
```

### После скачивания:
```bash
npm install
node setup-electron.js
npm run electron:build
```

**Готово!** 🎉
