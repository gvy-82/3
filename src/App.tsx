import { useEffect, useCallback, useRef } from 'react';
import { useStore } from './store';
import VideoPlayer from './components/VideoPlayer';
import OSD from './components/OSD';
import ChannelList from './components/ChannelList';
import Toolbar from './components/Toolbar';
import Settings from './components/Settings';
import EPG from './components/EPG';
import Scheduler from './components/Scheduler';
import Help from './components/Help';
import RemoteControl from './components/RemoteControl';
import RecordingPanel from './components/RecordingPanel';

export default function App() {
  const {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    toggleMute,
    setShowOSD,
    toggleChannelList,
    toggleHelp,
    toggleSettings,
    toggleEPG,
    toggleScheduler,
    navigateChannel,
    playlists,
    activePlaylistId,
    setCurrentChannel,
    isRecording,
    setIsRecording,
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const osdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showOSD = useCallback(() => {
    setShowOSD(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => setShowOSD(false), 3000);
  }, [setShowOSD]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle keys if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          showOSD();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 5);
          showOSD();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 5);
          showOSD();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateChannel('next');
          showOSD();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateChannel('prev');
          showOSD();
          break;
        case 'm':
        case 'M':
        case 'ь':
        case 'Ь':
          toggleMute();
          showOSD();
          break;
        case 'f':
        case 'F':
        case 'а':
        case 'А':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case 'l':
        case 'L':
        case 'д':
        case 'Д':
          toggleChannelList();
          break;
        case 'e':
        case 'E':
        case 'у':
        case 'У':
          toggleEPG();
          break;
        case 'r':
        case 'R':
        case 'к':
        case 'К':
          if (!isRecording) {
            const state = useStore.getState();
            if (state.currentChannel) {
              state.addRecording({
                id: `rec-${Date.now()}`,
                channelId: state.currentChannel.id,
                channelName: state.currentChannel.name,
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                status: 'recording',
                filename: `${state.currentChannel.name}_${new Date().toISOString().slice(0, 10)}.ts`,
              });
            }
          }
          setIsRecording(!isRecording);
          showOSD();
          break;
        case 'i':
        case 'I':
        case 'ш':
        case 'Ш':
          showOSD();
          break;
        case 'h':
        case 'H':
        case 'р':
        case 'Р':
          toggleHelp();
          break;
        case 's':
        case 'S':
        case 'ы':
        case 'Ы':
          toggleSettings();
          break;
        case 't':
        case 'T':
        case 'е':
        case 'Е':
          toggleScheduler();
          break;
        case 'Escape':
          const state = useStore.getState();
          if (state.showHelp) toggleHelp();
          else if (state.showSettings) toggleSettings();
          else if (state.showEPG) toggleEPG();
          else if (state.showScheduler) toggleScheduler();
          else if (state.showRemoteInfo) state.toggleRemoteInfo();
          else if (state.showChannelList) toggleChannelList();
          else if (document.fullscreenElement) document.exitFullscreen();
          break;
        default:
          // Number keys 1-9 for quick channel switch
          const num = parseInt(e.key);
          if (num >= 1 && num <= 9) {
            const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
            if (activePlaylist && activePlaylist.channels[num - 1]) {
              setCurrentChannel(activePlaylist.channels[num - 1]);
              showOSD();
            }
          }
          break;
      }
    },
    [
      isPlaying,
      volume,
      isRecording,
      playlists,
      activePlaylistId,
      setIsPlaying,
      setVolume,
      toggleMute,
      setShowOSD,
      toggleChannelList,
      toggleHelp,
      toggleSettings,
      toggleEPG,
      toggleScheduler,
      navigateChannel,
      setCurrentChannel,
      setIsRecording,
      showOSD,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Show OSD on volume change
  useEffect(() => {
    showOSD();
  }, [volume]);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-black relative overflow-hidden select-none"
      tabIndex={0}
    >
      {/* Video Player */}
      <div className="absolute inset-0">
        <VideoPlayer />
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* OSD */}
      <OSD />

      {/* Channel List */}
      <ChannelList />

      {/* Recording Panel */}
      <RecordingPanel />

      {/* Modals */}
      <Settings />
      <EPG />
      <Scheduler />
      <Help />
      <RemoteControl />

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-50" />
    </div>
  );
}
