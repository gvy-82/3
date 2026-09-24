import { useStore } from '../store';
import { X, Smartphone, Wifi, QrCode } from 'lucide-react';

export default function RemoteControl() {
  const { showRemoteInfo, toggleRemoteInfo } = useStore();

  if (!showRemoteInfo) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">Пульт управления</h2>
          </div>
          <button onClick={toggleRemoteInfo} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-gray-300 text-sm">
              Отсканируйте QR-код смартфоном для подключения к плееру
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-400" />
              Как подключить
            </h3>
            <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
              <li>Убедитесь, что смартфон и компьютер в одной сети Wi-Fi</li>
              <li>Откройте камеру смартфона или приложение для сканирования QR-кодов</li>
              <li>Отсканируйте QR-код, показанный выше</li>
              <li>Или введите адрес вручную в браузере смартфона</li>
            </ol>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">📱 Возможности пульта</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Переключение каналов</li>
              <li>• Регулировка громкости</li>
              <li>• Управление воспроизведением</li>
              <li>• Поиск каналов</li>
              <li>• Просмотр телепрограммы</li>
              <li>• Управление записью</li>
              <li>• Навигация по меню</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">🔧 Настройка сервера пульта</h3>
            <p className="text-gray-300 text-sm">
              Для работы пульта управления необходимо запустить встроенный HTTP-сервер.
              Сервер автоматически генерирует QR-код с IP-адресом компьютера в локальной сети.
            </p>
            <div className="mt-2 bg-gray-900 rounded p-2 font-mono text-xs text-green-400">
              http://192.168.1.100:8080/remote
            </div>
            <p className="text-gray-500 text-xs mt-2">
              * Адрес определяется автоматически при запуске
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">🎮 Интерфейс пульта</h3>
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              <div></div>
              <button className="bg-gray-700 rounded p-2 text-center text-xs text-white">▲</button>
              <div></div>
              <button className="bg-gray-700 rounded p-2 text-center text-xs text-white">◄</button>
              <button className="bg-gray-600 rounded p-2 text-center text-xs text-white">OK</button>
              <button className="bg-gray-700 rounded p-2 text-center text-xs text-white">►</button>
              <div></div>
              <button className="bg-gray-700 rounded p-2 text-center text-xs text-white">▼</button>
              <div></div>
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              <button className="bg-red-700 rounded px-3 py-1 text-xs text-white">REC</button>
              <button className="bg-gray-700 rounded px-3 py-1 text-xs text-white">CH-</button>
              <button className="bg-gray-700 rounded px-3 py-1 text-xs text-white">CH+</button>
              <button className="bg-gray-700 rounded px-3 py-1 text-xs text-white">MUTE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
