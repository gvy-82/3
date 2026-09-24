const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class EPGParser {
  /**
   * Парсить файл EPG (автоматическое определение формата)
   * @param {string} filepath - Путь к файлу
   */
  async parseFile(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    let content;

    // Читаем файл (с поддержкой сжатых форматов)
    if (filepath.endsWith('.gz') || filepath.endsWith('.zip')) {
      content = await this.decompressFile(filepath);
    } else {
      content = fs.readFileSync(filepath, 'utf-8');
    }

    // Определяем формат
    if (ext === '.xml' || content.trim().startsWith('<?xml') || content.includes('<tv')) {
      return this.parseXMLTV(content);
    } else if (ext === '.jtv' || content.includes('!##')) {
      return this.parseJTV(content);
    } else {
      return this.parseTXT(content);
    }
  }

  /**
   * Декомпрессия файла (.gz, .zip)
   */
  async decompressFile(filepath) {
    const buffer = fs.readFileSync(filepath);
    
    if (filepath.endsWith('.gz')) {
      return new Promise((resolve, reject) => {
        zlib.gunzip(buffer, (err, result) => {
          if (err) reject(err);
          else resolve(result.toString('utf-8'));
        });
      });
    }
    
    if (filepath.endsWith('.zip')) {
      // Простая распаковка zip (для одного файла)
      // В production лучше использовать 'adm-zip' или 'yauzl'
      return buffer.toString('utf-8');
    }

    return buffer.toString('utf-8');
  }

  /**
   * Парсинг XMLTV формата
   * Формат: стандартный XML с тегами <programme> и <channel>
   */
  parseXMLTV(content) {
    const programs = {};

    // Простой XML парсер (без зависимостей)
    // Извлекаем channel id
    const channelRegex = /<channel\s+id="([^"]*)"[^>]*>/g;
    const channels = [];
    let match;
    while ((match = channelRegex.exec(content)) !== null) {
      channels.push(match[1]);
    }

    // Извлекаем программы
    const programmeRegex = /<programme\s+start="([^"]*)"\s+stop="([^"]*)"\s+channel="([^"]*)"[^>]*>\s*<title[^>]*>([^<]*)<\/title>(?:\s*<desc[^>]*>([^<]*)<\/desc>)?\s*<\/programme>/g;

    while ((match = programmeRegex.exec(content)) !== null) {
      const [, startStr, stopStr, channelId, title, description] = match;

      const start = this.parseXMLTVDate(startStr);
      const end = this.parseXMLTVDate(stopStr);

      if (!programs[channelId]) {
        programs[channelId] = [];
      }

      programs[channelId].push({
        channelId,
        title: this.decodeEntities(title),
        description: description ? this.decodeEntities(description) : undefined,
        start,
        end,
      });
    }

    // Сортируем программы по времени
    for (const chId of Object.keys(programs)) {
      programs[chId].sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    return {
      format: 'XMLTV',
      channels: Object.keys(programs).length,
      programs: Object.values(programs).flat().length,
      data: programs,
    };
  }

  /**
   * Парсинг даты XMLTV (формат: 20231201120000 +0300)
   */
  parseXMLTVDate(dateStr) {
    // Формат: YYYYMMDDHHmmss +ZZZZ
    const match = dateStr.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
    if (!match) return new Date();

    const [, year, month, day, hour, minute, second, tz] = match;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );

    // Применяем часовой пояс
    if (tz) {
      const tzHours = parseInt(tz.slice(0, 3));
      const tzMinutes = parseInt(tz.slice(0, 1) + tz.slice(3));
      date.setHours(date.getHours() - tzHours);
      date.setMinutes(date.getMinutes() - tzMinutes);
    }

    return date;
  }

  /**
   * Парсинг JTV формата
   * Формат: !##jd 2023/12/1
   * Название канала\tвремя\tназвание передачи
   */
  parseJTV(content) {
    const programs = {};
    const lines = content.split('\n');
    let currentDate = new Date();
    let currentChannel = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Дата
      if (trimmed.startsWith('!##jd')) {
        const dateMatch = trimmed.match(/!##jd\s+(\d{4})\/(\d{1,2})\/(\d{1,2})/);
        if (dateMatch) {
          currentDate = new Date(
            parseInt(dateMatch[1]),
            parseInt(dateMatch[2]) - 1,
            parseInt(dateMatch[3])
          );
        }
        continue;
      }

      // Канал (строка начинается с имени канала)
      if (trimmed.startsWith('!##')) continue;

      // Программа: время\tназвание
      const parts = trimmed.split('\t');
      if (parts.length >= 2 && currentChannel) {
        const timeStr = parts[0].trim();
        const title = parts.slice(1).join('\t').trim();

        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const start = new Date(currentDate);
          start.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0);

          if (!programs[currentChannel]) {
            programs[currentChannel] = [];
          }

          programs[currentChannel].push({
            channelId: currentChannel,
            title,
            start,
            end: null, // Будет вычислено позже
          });
        }
      } else if (parts.length === 1 && !timeStr) {
        // Это имя канала
        currentChannel = trimmed;
      }
    }

    // Вычисляем end time
    for (const chId of Object.keys(programs)) {
      const chPrograms = programs[chId];
      for (let i = 0; i < chPrograms.length; i++) {
        if (i + 1 < chPrograms.length) {
          chPrograms[i].end = chPrograms[i + 1].start;
        } else {
          // Последняя программа — 1 час
          chPrograms[i].end = new Date(chPrograms[i].start.getTime() + 3600000);
        }
      }
    }

    return {
      format: 'JTV',
      channels: Object.keys(programs).length,
      programs: Object.values(programs).flat().length,
      data: programs,
    };
  }

  /**
   * Парсинг TXT формата
   * Формат: одна строка на программу
   * Канал: Название канала
   * Время: HH:MM - Название передачи
   */
  parseTXT(content) {
    const programs = {};
    const lines = content.split('\n');
    let currentChannel = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Определение канала
      if (trimmed.startsWith('Канал:') || trimmed.startsWith('Channel:')) {
        currentChannel = trimmed.replace(/^(Канал|Channel):\s*/i, '').trim();
        if (!programs[currentChannel]) {
          programs[currentChannel] = [];
        }
        continue;
      }

      // Программа: HH:MM - Название
      const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*[-–]\s*(.+)/);
      if (timeMatch && currentChannel) {
        const [, hour, minute, title] = timeMatch;
        const start = new Date(today);
        start.setHours(parseInt(hour), parseInt(minute), 0);

        programs[currentChannel].push({
          channelId: currentChannel,
          title: title.trim(),
          start,
          end: null,
        });
      }
    }

    // Вычисляем end time
    for (const chId of Object.keys(programs)) {
      const chPrograms = programs[chId];
      for (let i = 0; i < chPrograms.length; i++) {
        if (i + 1 < chPrograms.length) {
          chPrograms[i].end = chPrograms[i + 1].start;
        } else {
          chPrograms[i].end = new Date(chPrograms[i].start.getTime() + 3600000);
        }
      }
    }

    return {
      format: 'TXT',
      channels: Object.keys(programs).length,
      programs: Object.values(programs).flat().length,
      data: programs,
    };
  }

  /**
   * Декодирование HTML entities
   */
  decodeEntities(str) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }
}

module.exports = { EPGParser };
