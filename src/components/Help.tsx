import { useStore } from '../store';
import { X, Keyboard } from 'lucide-react';

export default function Help() {
  const { showHelp, toggleHelp } = useStore();

  if (!showHelp) return null;

  const shortcuts = [
    { keys: 'Space', action: 'Пауза / Воспроизведение' },
    { keys: '↑ / ↓', action: 'Громкость +/-' },
    { keys: '← / →', action: 'Предыдущий / Следующий канал' },
    { keys: 'M', action: 'Вкл/Выкл звук' },
    { keys: 'F', action: 'Полноэкранный режим' },
    { keys: 'L', action: 'Список каналов' },
    { keys: 'E', action: 'Телепрограмма (EPG)' },
    { keys: 'R', action: 'Начать/Остановить запись' },
    { keys: 'I', action: 'Показать OSD' },
    { keys: 'H', action: 'Справка' },
    { keys: 'S', action: 'Настройки' },
    { keys: 'T', action: 'Планировщик' },
    { keys: '1-9', action: 'Быстрый переход на канал (1-9)' },
    { keys: 'Esc', action: 'Закрыть окно / Выйти из полноэкранного' },
  ];

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">Краткая справка</h2>
          </div>
          <button onClick={toggleHelp} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-blue-400 font-semibold mb-3">⌨️ Управление с клавиатуры</h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-800">
                <span className="text-gray-300 text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-white font-mono">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">📺 О плеере</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                IP-TV Player — это универсальный плеер для просмотра открытых (незашифрованных)
                потоков IP-телевидения. Поддерживает протоколы HTTP, HLS (m3u8), RTMP.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">📋 Возможности</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Просмотр потоков UDP, HTTP, HLS, RTMP</li>
                <li>• Переключение между несколькими плейлистами</li>
                <li>• Индивидуальные настройки для каждого канала</li>
                <li>• Запись потока в файл</li>
                <li>• OSD — громкость, название канала, индикатор записи</li>
                <li>• Телепрограмма (XMLTV, JTV, TXT)</li>
                <li>• Планировщик записи/просмотра</li>
                <li>• Фоновая запись каналов</li>
                <li>• Смартфон как пульт управления</li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">⚠️ Важная информация</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Мы не оказываем услуг IP-телевидения</li>
                <li>• Плеер для просмотра услуги вашего провайдера или открытых источников</li>
                <li>• Не предназначен для просмотра российских каналов из-за границы</li>
                <li>• Не может показывать зашифрованные (DRM, CAS, X-KEY) каналы</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
