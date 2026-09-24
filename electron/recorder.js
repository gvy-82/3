const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const url = require('url');
const dgram = require('dgram');

class Recorder {
  constructor(recordingsPath) {
    this.recordingsPath = recordingsPath;
    this.activeRecordings = new Map();
    this.mainRecording = null;
  }

  /**
   * Начать запись потока
   * @param {string} streamUrl - URL потока
   * @param {string} outputPath - Путь для сохранения
   * @param {Object} options - Дополнительные опции
   */
  async start(streamUrl, outputPath, options = {}) {
    const id = options.id || `rec-${Date.now()}`;
    const protocol = url.parse(streamUrl).protocol;

    let writeStream;
    let sourceStream;

    // Создать директорию если не существует
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    writeStream = fs.createWriteStream(outputPath);

    switch (protocol) {
      case 'http:':
      case 'https:':
        sourceStream = await this.recordHTTP(streamUrl, writeStream);
        break;
      case 'udp:':
        sourceStream = await this.recordUDP(streamUrl, writeStream);
        break;
      case 'rtmp:':
        sourceStream = await this.recordRTMP(streamUrl, writeStream);
        break;
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }

    const recording = {
      id,
      url: streamUrl,
      outputPath,
      startTime: new Date(),
      sourceStream,
      writeStream,
      bytesWritten: 0,
      status: 'recording',
    };

    // Отслеживать размер записи
    writeStream.on('finish', () => {
      recording.bytesWritten = writeStream.bytesWritten;
      recording.endTime = new Date();
      recording.status = 'completed';
    });

    this.activeRecordings.set(id, recording);
    this.mainRecording = recording;

    return recording;
  }

  /**
   * Запись HTTP/HTTPS потока
   */
  recordHTTP(streamUrl, writeStream) {
    return new Promise((resolve, reject) => {
      const client = streamUrl.startsWith('https') ? https : http;
      
      const request = client.get(streamUrl, {
        headers: {
          'User-Agent': 'IP-TV-Player/1.0',
          'Accept': '*/*',
        },
      }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(writeStream);
        response.on('error', reject);
        resolve(response);
      });

      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Connection timeout'));
      });
    });
  }

  /**
   * Запись UDP multicast потока
   */
  recordUDP(streamUrl, writeStream) {
    return new Promise((resolve, reject) => {
      const parsed = url.parse(streamUrl);
      const address = parsed.hostname;
      const port = parseInt(parsed.port) || 1234;

      const socket = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true,
      });

      socket.on('error', reject);

      socket.bind(port, () => {
        socket.addMembership(address);
        
        socket.on('message', (msg) => {
          writeStream.write(msg);
        });

        resolve(socket);
      });
    });
  }

  /**
   * Запись RTMP потока (через ffmpeg если доступен)
   */
  async recordRTMP(streamUrl, writeStream) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      // Проверяем наличие ffmpeg
      const ffmpeg = spawn('ffmpeg', [
        '-i', streamUrl,
        '-c', 'copy',
        '-f', 'mpegts',
        'pipe:1',
      ]);

      ffmpeg.stdout.pipe(writeStream);

      ffmpeg.on('error', (err) => {
        reject(new Error('FFmpeg not found. Install FFmpeg for RTMP recording.'));
      });

      ffmpeg.stderr.on('data', (data) => {
        // FFmpeg логи
        console.log('[FFmpeg]', data.toString());
      });

      resolve(ffmpeg);
    });
  }

  /**
   * Остановить конкретную запись
   */
  async stop(id) {
    const recordingId = id || (this.mainRecording && this.mainRecording.id);
    if (!recordingId) return;

    const recording = this.activeRecordings.get(recordingId);
    if (!recording) return;

    return new Promise((resolve) => {
      if (recording.sourceStream) {
        if (recording.sourceStream.close) {
          recording.sourceStream.close();
        } else if (recording.sourceStream.destroy) {
          recording.sourceStream.destroy();
        } else if (recording.sourceStream.kill) {
          recording.sourceStream.kill();
        }
      }

      recording.writeStream.end(() => {
        recording.status = 'completed';
        recording.endTime = new Date();
        this.activeRecordings.delete(recordingId);
        
        if (this.mainRecording && this.mainRecording.id === recordingId) {
          this.mainRecording = null;
        }
        
        resolve(recording);
      });
    });
  }

  /**
   * Остановить все записи
   */
  async stopAll() {
    const promises = [];
    for (const id of this.activeRecordings.keys()) {
      promises.push(this.stop(id));
    }
    await Promise.all(promises);
  }

  /**
   * Получить статус записи
   */
  getStatus() {
    const recordings = Array.from(this.activeRecordings.values()).map((r) => ({
      id: r.id,
      url: r.url,
      outputPath: r.outputPath,
      startTime: r.startTime,
      bytesWritten: r.writeStream.bytesWritten,
      status: r.status,
    }));

    return {
      isRecording: this.activeRecordings.size > 0,
      count: this.activeRecordings.size,
      recordings,
    };
  }

  /**
   * Проверка идёт ли запись
   */
  isRecording() {
    return this.activeRecordings.size > 0;
  }
}

module.exports = { Recorder };
