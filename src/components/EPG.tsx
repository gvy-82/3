import { useStore } from '../store';
import { X, Calendar, Clock } from 'lucide-react';

export default function EPG() {
  const { showEPG, toggleEPG, currentChannel, epgData } = useStore();

  if (!showEPG) return null;

  const channelPrograms = currentChannel ? epgData[currentChannel.epgId || currentChannel.id] || [] : [];

  const now = new Date();
  const currentProgram = channelPrograms.find((p) => p.start <= now && p.end > now);
  const nextPrograms = channelPrograms
    .filter((p) => p.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 10);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">Телепрограмма</h2>
          </div>
          <button onClick={toggleEPG} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {currentChannel ? (
            <>
              <div className="mb-4">
                <h3 className="text-blue-400 font-semibold">{currentChannel.name}</h3>
                {currentProgram && (
                  <div className="mt-2 bg-green-900/30 border border-green-700 rounded p-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                      <Clock className="w-3 h-3" />
                      <span>СЕЙЧАС</span>
                    </div>
                    <p className="text-white font-medium">{currentProgram.title}</p>
                    <p className="text-gray-400 text-sm">
                      {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
                    </p>
                    {currentProgram.description && (
                      <p className="text-gray-300 text-sm mt-1">{currentProgram.description}</p>
                    )}
                  </div>
                )}
              </div>

              {nextPrograms.length > 0 ? (
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Далее</h4>
                  <div className="space-y-1">
                    {nextPrograms.map((prog, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-gray-800">
                        <div className="text-gray-400 text-sm whitespace-nowrap w-20">
                          {formatTime(prog.start)}
                        </div>
                        <div>
                          <p className="text-white text-sm">{prog.title}</p>
                          {prog.category && (
                            <span className="text-xs bg-gray-700 text-gray-300 px-1 rounded">
                              {prog.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">Телепрограмма не доступна</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Загрузите EPG в форматах XMLTV, JTV или TXT в настройках
                  </p>
                </div>
              )}

              {channelPrograms.length === 0 && (
                <div className="mt-4 bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-sm">
                    💡 Для отображения телепрограммы загрузите XMLTV файл.
                    Форматы: XMLTV (.xml), JTV (.jtv), TXT
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Выберите канал для просмотра программы</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700">
          <p className="text-gray-500 text-xs">
            📅 Поддержка форматов: XMLTV, JTV, TXT • Автоматическая загрузка и распаковка
          </p>
        </div>
      </div>
    </div>
  );
}
