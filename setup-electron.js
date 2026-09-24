#!/usr/bin/env node
/**
 * setup-electron.js
 * Автоматическая настройка проекта для сборки Desktop .exe
 * 
 * Использование: node setup-electron.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 IP-TV Player — Настройка Desktop сборки\n');

// 1. Читаем package.json
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

console.log('📦 Обновление package.json...');

// 2. Добавляем необходимые поля
pkg.main = 'electron/main.js';
pkg.description = pkg.description || 'IP-TV Player — просмотр потокового телевидения';
pkg.author = pkg.author || 'IP-TV Player Team';
pkg.license = pkg.license || 'MIT';

// 3. Добавляем scripts
pkg.scripts = {
  ...pkg.scripts,
  'electron:dev': 'concurrently "npm run dev" "wait-on http://localhost:5173 && cross-env NODE_ENV=development electron ."',
  'electron:build': 'npm run build && electron-builder --win --x64',
  'electron:build:portable': 'npm run build && electron-builder --win portable',
  'electron:build:all': 'npm run build && electron-builder --win --mac --linux',
  'electron:preview': 'npm run build && electron .',
};

// 4. Добавляем build конфигурацию для electron-builder
pkg.build = {
  appId: 'com.iptv-player.desktop',
  productName: 'IP-TV Player',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
  ],
  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'portable', arch: ['x64'] },
    ],
    icon: 'public/icon.ico',
    artifactName: '${productName}-${version}-Windows-${arch}.${ext}',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'IP-TV Player',
  },
  mac: {
    target: ['dmg'],
    icon: 'public/icon.icns',
    category: 'public.app-category.entertainment',
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'public/icon.png',
    category: 'AudioVideo;Video;Player',
  },
};

// 5. Сохраняем package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('✅ package.json обновлён\n');

// 6. Устанавливаем зависимости
console.log('📥 Установка Electron зависимостей...');
try {
  execSync('npm install --save-dev electron electron-builder concurrently wait-on cross-env', { 
    stdio: 'inherit' 
  });
  execSync('npm install --save electron-store', { 
    stdio: 'inherit' 
  });
  console.log('✅ Зависимости установлены\n');
} catch (error) {
  console.error('❌ Ошибка установки зависимостей:', error.message);
  console.log('\nПопробуйте вручную:');
  console.log('  npm install --save-dev electron electron-builder concurrently wait-on cross-env');
  console.log('  npm install --save electron-store\n');
}

// 7. Создаём папку public если не существует
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('📁 Создана папка public/');
}

// 8. Создаём placeholder для иконки
const iconPath = path.join(publicDir, 'icon.ico');
if (!fs.existsSync(iconPath)) {
  console.log('💡 Иконка не найдена. Создайте public/icon.ico (256x256 или 512x512)');
  console.log('   Или используйте онлайн конвертер: https://convertio.co/png-ico/\n');
}

// 9. Создаём .gitignore для Electron
const gitignorePath = path.join(__dirname, '.gitignore');
let gitignore = '';
if (fs.existsSync(gitignorePath)) {
  gitignore = fs.readFileSync(gitignorePath, 'utf-8');
}

const electronIgnores = `
# Electron
release/
dist/
node_modules/
*.log
.DS_Store
Thumbs.db
`;

if (!gitignore.includes('# Electron')) {
  fs.writeFileSync(gitignorePath, gitignore + electronIgnores);
  console.log('✅ .gitignore обновлён\n');
}

// 10. Финальные инструкции
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║   ✅ Настройка завершена!                                 ║');
console.log('║                                                           ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║                                                           ║');
console.log('║   🚀 Следующие шаги:                                      ║');
console.log('║                                                           ║');
console.log('║   1. Тестирование:                                        ║');
console.log('║      npm run electron:dev                                 ║');
console.log('║                                                           ║');
console.log('║   2. Сборка .exe:                                         ║');
console.log('║      npm run electron:build                               ║');
console.log('║                                                           ║');
console.log('║   3. Portable версия:                                     ║');
console.log('║      npm run electron:build:portable                      ║');
console.log('║                                                           ║');
console.log('║   📁 Результат в папке: release/                          ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');
