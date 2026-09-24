#!/usr/bin/env node
/**
 * pack-zip.js
 * Упаковка проекта в ZIP архив для скачивания
 * 
 * Использование: node pack-zip.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Упаковка IP-TV Player в ZIP...\n');

const projectName = 'iptv-player';
const timestamp = new Date().toISOString().slice(0, 10);
const zipFileName = `${projectName}-${timestamp}.zip`;

// Файлы и папки для включения
const includePatterns = [
  'src/**/*',
  'electron/**/*',
  'public/**/*',
  'dist/**/*',
  '*.json',
  '*.js',
  '*.md',
  '*.sh',
  '*.bat',
  'index.html',
  'tsconfig.json',
  'vite.config.js',
];

// Файлы и папки для исключения
const excludePatterns = [
  'node_modules',
  'release',
  '.git',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
];

console.log('📋 Включаемые файлы:');
includePatterns.forEach(p => console.log(`   ✓ ${p}`));

console.log('\n🚫 Исключаемые файлы:');
excludePatterns.forEach(p => console.log(`   ✗ ${p}`));

console.log('\n🔨 Создание архива...');

try {
  // Проверяем наличие zip команды
  if (process.platform === 'win32') {
    // Windows — используем PowerShell
    const files = includePatterns.map(p => `"${p}"`).join(' ');
    const excludes = excludePatterns.map(p => `-Exclude "${p}"`).join(' ');
    
    // Создаём временную папку
    const tempDir = path.join(__dirname, `${projectName}-temp`);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Копируем файлы
    console.log('   Копирование файлов...');
    execSync(`xcopy /E /I /Y /EXCLUDE:exclude.txt . "${tempDir}"`, { stdio: 'pipe' });
    
    // Создаём ZIP
    console.log('   Создание ZIP архива...');
    execSync(`powershell Compress-Archive -Path "${tempDir}" -DestinationPath "${zipFileName}" -Force`, { 
      stdio: 'inherit' 
    });
    
    // Удаляем временную папку
    fs.rmSync(tempDir, { recursive: true });
    
  } else {
    // Linux/macOS — используем zip команду
    const includeArgs = includePatterns.map(p => `"${p}"`).join(' ');
    const excludeArgs = excludePatterns.map(p => `-x "${p}"`).join(' ');
    
    const command = `zip -r "${zipFileName}" ${includeArgs} ${excludeArgs}`;
    console.log(`   Выполнение: ${command}`);
    execSync(command, { stdio: 'inherit' });
  }

  // Проверяем размер
  const stats = fs.statSync(zipFileName);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log(`║   ✅ Архив создан: ${zipFileName.padEnd(40)} ║`);
  console.log(`║   📊 Размер: ${(sizeMB + ' MB').padEnd(47)} ║`);
  console.log('║                                                           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                                                           ║');
  console.log('║   📥 Как использовать:                                    ║');
  console.log('║                                                           ║');
  console.log('║   1. Распакуйте архив                                     ║');
  console.log('║   2. Откройте командную строку в папке проекта            ║');
  console.log('║   3. Выполните:                                           ║');
  console.log('║                                                           ║');
  console.log('║      npm install                                          ║');
  console.log('║      node setup-electron.js                               ║');
  console.log('║      npm run electron:build                               ║');
  console.log('║                                                           ║');
  console.log('║   4. Готовый .exe будет в папке release/                  ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

} catch (error) {
  console.error('\n❌ Ошибка создания архива:', error.message);
  console.log('\n💡 Альтернативные способы:');
  console.log('   1. Используйте архиватор (WinRAR, 7-Zip)');
  console.log('   2. Правый клик на папке → "Отправить" → "Сжатая ZIP-папка"');
  console.log('   3. Если проект на GitHub: Code → Download ZIP');
}
