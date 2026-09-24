import { useState } from 'react';
import { useStore } from '../store';
import { X, Upload, Trash2, Plus, Tv, Cog } from 'lucide-react';

export default function Settings() {
  const { showSettings, toggleSettings, playlists, addPlaylist, removePlaylist, importM3U, volume, setVolume } = useStore();
  const [playlistName, setPlaylistName] = useState('');
  const [m3uContent, setM3uContent] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [showImport, setShowImport] = useState(false);

  if (!showSettings) return null;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const name = file.name.replace(/\.[^/.]+$/, '');
      importM3U(content, playlistName || name);
      setM3uContent('');
      setPlaylistName('');
      setShowImport(false);
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    if (!m3uContent.trim()) return;
    importM3U(m3uContent, playlistName || 'Импортированный плейлист');
    setM3uContent('');
    setPlaylistName('');
    setShowImport(false);
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) return;
    try {
      const response = await fetch(importUrl);
      const content = await response.text();
      importM3U(content, playlistName || 'Плейлист по URL');
      setImportUrl('');
      setPlaylistName('');
      setShowImport(false);
    } catch {
      alert('Не удалось загрузить плейлист по URL. Проверьте адрес и CORS-политику.');
    }
  };

  const loadDemoPlaylist = () => {
    const demoM3U = `#EXTM3U
#EXTINF:-1 tvg-id="test1" group-title="Тестовые" tvg-logo="",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-id="test2" group-title="Тестовые" tvg-logo="",Sintel
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
#EXTINF:-1 tvg-id="test3" group-title="Тестовые" tvg-logo="",Tears of Steel
https://demo.unified-streaming.com/kvs/tears-of-steel/tears-of-steel.m3u8
#EXTINF:-1 tvg-id="test4" group-title="Новости" tvg-logo="",Test Pattern
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8`;
    importM3U(demoM3U, 'Демо плейлист');
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Cog className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold text-lg">Настройки</h2>
          </div>
          <button onClick={toggleSettings} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Volume */}
          <div>
            <h3 className="text-white font-semibold mb-2">Громкость по умолчанию</h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white w-10 text-right">{volume}%</span>
            </div>
          </div>

          {/* Playlists */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Плейлисты</h3>
              <button
                onClick={() => setShowImport(!showImport)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Импорт
              </button>
            </div>

            {showImport && (
              <div className="bg-gray-800 rounded-lg p-4 mb-3 space-y-3">
                <input
                  type="text"
                  placeholder="Название плейлиста"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                />

                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">Загрузить файл M3U/M3U8</span>
                    <input type="file" accept=".m3u,.m3u8,.txt" onChange={handleFileImport} className="hidden" />
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="URL плейлиста"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                    />
                    <button
                      onClick={handleUrlImport}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Загрузить
                    </button>
                  </div>

                  <textarea
                    placeholder="Или вставьте содержимое M3U..."
                    value={m3uContent}
                    onChange={(e) => setM3uContent(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 h-24 resize-y"
                  />
                  <button
                    onClick={handleTextImport}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Импортировать текст
                  </button>
                </div>

                <button
                  onClick={loadDemoPlaylist}
                  className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  🎬 Загрузить демо-плейлист
                </button>
              </div>
            )}

            <div className="space-y-2">
              {playlists.map((pl) => (
                <div key={pl.id} className="flex items-center justify-between bg-gray-800 rounded p-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{pl.name}</p>
                      <p className="text-gray-400 text-xs">{pl.channels.length} каналов</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removePlaylist(pl.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {playlists.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Нет плейлистов. Импортируйте M3U файл или загрузите демо.
                </p>
              )}
            </div>
          </div>

          {/* Supported formats info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Поддерживаемые протоколы</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-300">HTTP/HTTPS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-300">HLS (m3u8)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-gray-300">RTMP (ограниченно)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-gray-300">UDP (нативное приложение)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
