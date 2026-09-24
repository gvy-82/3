#!/bin/bash
# build-desktop.sh — Скрипт для сборки Desktop-версии IP-TV Player
# Использование: ./build-desktop.sh [win|mac|linux|all]

set -e

PLATFORM=${1:-all}
echo "🚀 Сборка IP-TV Player Desktop..."
echo "Платформа: $PLATFORM"

# Проверка зависимостей
check_deps() {
  echo "📦 Проверка зависимостей..."
  
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите: https://nodejs.org"
    exit 1
  fi
  
  if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен."
    exit 1
  fi

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
  fi
  
  echo "✅ Node.js $(node -v)"
}

# Установка Electron зависимостей
install_deps() {
  echo "📦 Установка Electron зависимостей..."
  npm install --save-dev electron electron-builder concurrently wait-on cross-env
  npm install --save electron-store
}

# Сборка React приложения
build_react() {
  echo "🔨 Сборка React приложения..."
  npm run build
}

# Сборка для Windows
build_win() {
  echo "🪟 Сборка для Windows..."
  npx electron-builder --win --x64
  echo "✅ Windows сборка завершена! Файлы в release/"
}

# Сборка для macOS
build_mac() {
  echo "🍎 Сборка для macOS..."
  npx electron-builder --mac --x64 --arm64
  echo "✅ macOS сборка завершена! Файлы в release/"
}

# Сборка для Linux
build_linux() {
  echo "🐧 Сборка для Linux..."
  npx electron-builder --linux --x64
  echo "✅ Linux сборка завершена! Файлы в release/"
}

# Основная логика
check_deps

if [ ! -d "node_modules/electron" ]; then
  install_deps
fi

build_react

case $PLATFORM in
  win|windows)
    build_win
    ;;
  mac|macos|darwin)
    build_mac
    ;;
  linux)
    build_linux
    ;;
  all)
    echo "🌍 Сборка для всех платформ..."
    build_win
    build_mac
    build_linux
    ;;
  *)
    echo "❌ Неизвестная платформа: $PLATFORM"
    echo "Использование: ./build-desktop.sh [win|mac|linux|all]"
    exit 1
    ;;
esac

echo ""
echo "🎉 Готово! Дистрибутивы находятся в папке release/"
echo ""
echo "📋 Структура:"
ls -la release/ 2>/dev/null || echo "(папка release будет создана при сборке)"
