import { useState } from 'react';
import { useStore } from '../store';
import { X, Clock, Plus, Trash2, Video, Eye, Calendar } from 'lucide-react';

export default function Scheduler() {
  const { showScheduler, toggleScheduler, scheduler, addSchedulerEntry, removeSchedulerEntry, toggleSchedulerEntry, playlists, activePlaylistId } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<'record' | 'watch'>('record');

  if (!showScheduler) return null;

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const channels = activePlaylist?.channels || [];

  const handleAdd = () => {
    if (!channelId || !startTime || !endTime) return;
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return;

    addSchedulerEntry({
      id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      channelName: channel.name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      enabled: true,
    });

    setShowAdd(false);
    setChannelId('');
    setStartTime('');
    setEndTime('');
  };

  const sortedEntries = [...scheduler].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">Планировщик</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
            <button onClick={toggleScheduler} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {showAdd && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
              >
                <option value="">Выберите канал</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  className={`flex-1 px-3 py-2 rounded text-sm ${type === 'record' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setType('record')}
                >
                  <Video className="w-4 h-4 inline mr-1" />
                  Запись
                </button>
                <button
                  className={`flex-1 px-3 py-2 rounded text-sm ${type === 'watch' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setType('watch')}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Просмотр
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 text-xs">Начало</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Конец</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Добавить в планировщик
              </button>
            </div>
          )}

          {sortedEntries.length > 0 ? (
            <div className="space-y-2">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded border ${
                    entry.enabled ? 'bg-gray-800 border-gray-700' : 'bg-gray-800/50 border-gray-800 opacity-60'
                  }`}
                >
                  <button
                    onClick={() => toggleSchedulerEntry(entry.id)}
                    className={`w-3 h-3 rounded-full ${entry.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {entry.type === 'record' ? (
                        <Video className="w-4 h-4 text-red-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white text-sm font-medium">{entry.channelName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {entry.startTime.toLocaleDateString('ru-RU')} {entry.startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {entry.endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSchedulerEntry(entry.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Нет запланированных задач</p>
              <p className="text-gray-500 text-sm mt-1">
                Добавьте запись или просмотр по расписанию
              </p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700">
          <p className="text-gray-500 text-xs">
            📹 Фоновая запись не ограничена по количеству каналов (ограничивается провайдером)
          </p>
        </div>
      </div>
    </div>
  );
}
