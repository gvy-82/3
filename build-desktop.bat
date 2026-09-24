@echo off
REM build-desktop.bat — Скрипт для сборки Desktop-версии IP-TV Player на Windows
REM Использование: build-desktop.bat [win|portable]

echo.
echo  ==========================================
echo    IP-TV Player — Desktop Build Script
echo  ==========================================
echo.

set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=win

echo  Платформа: %PLATFORM%
echo.

REM Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [ОШИБКА] Node.js не установлен!
    echo  Скачайте с https://nodejs.org
    pause
    exit /b 1
)

echo  [OK] Node.js найден
node -v

echo.
echo  Установка зависимостей...
call npm install --save-dev electron electron-builder concurrently wait-on cross-env
call npm install --save electron-store

echo.
echo  Сборка React приложения...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo  [ОШИБКА] Сборка React не удалась!
    pause
    exit /b 1
)

echo.
echo  Сборка Electron приложения...

if "%PLATFORM%"=="win" (
    echo  Создание установщика NSIS...
    call npx electron-builder --win --x64
) else if "%PLATFORM%"=="portable" (
    echo  Создание portable версии...
    call npx electron-builder --win portable
) else (
    echo  Создание всех Windows сборок...
    call npx electron-builder --win
)

if %ERRORLEVEL% neq 0 (
    echo  [ОШИБКА] Сборка Electron не удалась!
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo    ГОТОВО!
echo  ==========================================
echo.
echo  Дистрибутивы в папке release\
echo.
dir /b release\*.exe 2>nul

pause
