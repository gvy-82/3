import { useStore } from '../store';
import { Circle, Square, Clock, HardDrive } from 'lucide-react';

export default function RecordingPanel() {
  const { recordings, isRecording, removeRecording, currentChannel } = useStore();

  const activeRecordings = recordings.filter((r) => r.status === 'recording');
  const completedRecordings = recordings.filter((r) => r.status === 'completed');
  const scheduledRecordings = recordings.filter((r) => r.status === 'scheduled');

  if (activeRecordings.length === 0 && !isRecording) return null;

  return (
    <div className="absolute top-14 right-3 z-40">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 p-3 min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-red-400" />
          <span className="text-white text-sm font-semibold">Запись</span>
          {isRecording && (
            <span className="flex items-center gap-1 text-red-500 text-xs animate-pulse ml-auto">
              <Circle className="w-3 h-3 fill-current" />
              LIVE
            </span>
          )}
        </div>

        {activeRecordings.length > 0 && (
          <div className="space-y-1">
            {activeRecordings.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between bg-gray-800 rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
                  <span className="text-white text-xs">{rec.channelName}</span>
                </div>
                <button
                  onClick={() => removeRecording(rec.id)}
                  className="text-gray-400 hover:text-red-400"
                  title="Остановить"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}

        {currentChannel && isRecording && activeRecordings.length === 0 && (
          <div className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1">
            <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
            <span className="text-white text-xs">{currentChannel.name}</span>
          </div>
        )}

        {(completedRecordings.length > 0 || scheduledRecordings.length > 0) && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            {completedRecordings.length > 0 && (
              <p className="text-gray-400 text-xs">
                ✓ Завершено: {completedRecordings.length}
              </p>
            )}
            {scheduledRecordings.length > 0 && (
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Запланировано: {scheduledRecordings.length}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
