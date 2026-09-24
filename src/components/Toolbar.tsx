import { useStore } from '../store';
import {
  List,
  Calendar,
  Clock,
  Settings,
  HelpCircle,
  Smartphone,
  Circle,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Maximize,
  Minimize,
} from 'lucide-react';
import { useState } from 'react';

export default function Toolbar() {
  const {
    currentChannel,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    toggleChannelList,
    toggleEPG,
    toggleScheduler,
    toggleSettings,
    toggleHelp,
    toggleRemoteInfo,
    isRecording,
    setIsRecording,
    navigateChannel,
  } = useStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleRecording = () => {
    if (!currentChannel) return;
    if (!isRecording) {
      useStore.getState().addRecording({
        id: `rec-${Date.now()}`,
        channelId: currentChannel.id,
        channelName: currentChannel.name,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // 1 hour
        status: 'recording',
        filename: `${currentChannel.name}_${new Date().toISOString().slice(0, 10)}.ts`,
      });
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-40">
      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleChannelList}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Список каналов (L)"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={toggleEPG}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Телепрограмма (E)"
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button
            onClick={toggleScheduler}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Планировщик (T)"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>

        {/* Center - channel info */}
        <div className="text-center hidden sm:block">
          {currentChannel && (
            <div className="flex items-center gap-2">
              {currentChannel.logo && (
                <img src={currentChannel.logo} alt="" className="w-6 h-6 rounded object-contain" />
              )}
              <span className="text-white font-medium text-sm">{currentChannel.name}</span>
              {isRecording && (
                <span className="flex items-center gap-1 text-red-500 text-xs animate-pulse">
                  <Circle className="w-3 h-3 fill-current" />
                  REC
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateChannel('prev')}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Предыдущий канал (←)"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Пауза (Space)"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => navigateChannel('next')}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Следующий канал (→)"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded hover:bg-white/10 text-white transition-colors"
              title="Звук (M)"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 bg-gray-600 rounded appearance-none cursor-pointer hidden sm:block"
            />
          </div>

          <button
            onClick={toggleRecording}
            className={`p-2 rounded transition-colors ${
              isRecording ? 'bg-red-600 text-white animate-pulse' : 'hover:bg-white/10 text-white'
            }`}
            title="Запись (R)"
          >
            <Circle className={`w-5 h-5 ${isRecording ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Полный экран (F)"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleRemoteInfo}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Пульт управления"
          >
            <Smartphone className="w-5 h-5" />
          </button>

          <button
            onClick={toggleSettings}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Настройки (S)"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={toggleHelp}
            className="p-2 rounded hover:bg-white/10 text-white transition-colors"
            title="Справка (H)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
