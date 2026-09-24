import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Volume2, VolumeX, Radio, Circle } from 'lucide-react';

export default function OSD() {
  const { currentChannel, volume, isMuted, isRecording, showOSD, setShowOSD } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showOSD && currentChannel) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setShowOSD(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showOSD, currentChannel, volume, isMuted]);

  if (!visible || !currentChannel) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pointer-events-none animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentChannel.logo && (
            <img
              src={currentChannel.logo}
              alt=""
              className="w-8 h-8 rounded object-contain bg-gray-800"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div>
            <h3 className="text-white font-bold text-lg">{currentChannel.name}</h3>
            {currentChannel.group && (
              <p className="text-gray-400 text-sm">{currentChannel.group}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-1 text-red-500 animate-pulse">
              <Circle className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">REC</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              />
            </div>
            <span className="text-white text-sm w-8">{isMuted ? 0 : volume}%</span>
          </div>

          <div className="flex items-center gap-1 text-green-400">
            <Radio className="w-4 h-4" />
            <span className="text-sm">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
