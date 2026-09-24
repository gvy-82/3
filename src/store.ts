import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Channel, Playlist, RecordingTask, SchedulerEntry, EPGProgram } from './types';

interface StoreState {
  playlists: Playlist[];
  activePlaylistId: string | null;
  currentChannel: Channel | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  showOSD: boolean;
  showChannelList: boolean;
  isRecording: boolean;
  recordings: RecordingTask[];
  scheduler: SchedulerEntry[];
  epgData: Record<string, EPGProgram[]>;
  showHelp: boolean;
  showSettings: boolean;
  showEPG: boolean;
  showScheduler: boolean;
  showRemoteInfo: boolean;

  // Actions
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: string) => void;
  setActivePlaylist: (id: string) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setShowOSD: (show: boolean) => void;
  toggleChannelList: () => void;
  setIsRecording: (recording: boolean) => void;
  addRecording: (task: RecordingTask) => void;
  removeRecording: (id: string) => void;
  updateRecordingStatus: (id: string, status: RecordingTask['status']) => void;
  addSchedulerEntry: (entry: SchedulerEntry) => void;
  removeSchedulerEntry: (id: string) => void;
  toggleSchedulerEntry: (id: string) => void;
  setEPGData: (data: Record<string, EPGProgram[]>) => void;
  toggleHelp: () => void;
  toggleSettings: () => void;
  toggleEPG: () => void;
  toggleScheduler: () => void;
  toggleRemoteInfo: () => void;
  navigateChannel: (direction: 'next' | 'prev') => void;
  importM3U: (content: string, name: string) => void;
}

function parseM3U(content: string): Channel[] {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const epgMatch = line.match(/tvg-id="([^"]*)"/);

      currentChannel = {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : undefined,
        epgId: epgMatch ? epgMatch[1] : undefined,
      };
    } else if (line && !line.startsWith('#')) {
      let protocol: Channel['protocol'] = 'http';
      if (line.startsWith('udp://')) protocol = 'udp';
      else if (line.includes('.m3u8')) protocol = 'hls';
      else if (line.startsWith('rtmp://')) protocol = 'rtmp';

      channels.push({
        id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: currentChannel.name || 'Unknown',
        url: line,
        logo: currentChannel.logo,
        group: currentChannel.group,
        epgId: currentChannel.epgId,
        protocol,
      });
      currentChannel = {};
    }
  }

  return channels;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      playlists: [],
      activePlaylistId: null,
      currentChannel: null,
      isPlaying: false,
      volume: 80,
      isMuted: false,
      showOSD: false,
      showChannelList: false,
      isRecording: false,
      recordings: [],
      scheduler: [],
      epgData: {},
      showHelp: false,
      showSettings: false,
      showEPG: false,
      showScheduler: false,
      showRemoteInfo: false,

      addPlaylist: (playlist) =>
        set((state) => ({
          playlists: [...state.playlists, playlist],
          activePlaylistId: state.activePlaylistId || playlist.id,
        })),

      removePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
          activePlaylistId:
            state.activePlaylistId === id
              ? state.playlists.find((p) => p.id !== id)?.id || null
              : state.activePlaylistId,
        })),

      setActivePlaylist: (id) => set({ activePlaylistId: id }),

      setCurrentChannel: (channel) => set({ currentChannel: channel, isPlaying: !!channel }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      setShowOSD: (show) => set({ showOSD: show }),

      toggleChannelList: () => set((state) => ({ showChannelList: !state.showChannelList })),

      setIsRecording: (recording) => set({ isRecording: recording }),

      addRecording: (task) =>
        set((state) => ({ recordings: [...state.recordings, task] })),

      removeRecording: (id) =>
        set((state) => ({ recordings: state.recordings.filter((r) => r.id !== id) })),

      updateRecordingStatus: (id, status) =>
        set((state) => ({
          recordings: state.recordings.map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      addSchedulerEntry: (entry) =>
        set((state) => ({ scheduler: [...state.scheduler, entry] })),

      removeSchedulerEntry: (id) =>
        set((state) => ({ scheduler: state.scheduler.filter((e) => e.id !== id) })),

      toggleSchedulerEntry: (id) =>
        set((state) => ({
          scheduler: state.scheduler.map((e) =>
            e.id === id ? { ...e, enabled: !e.enabled } : e
          ),
        })),

      setEPGData: (data) => set({ epgData: data }),

      toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
      toggleEPG: () => set((state) => ({ showEPG: !state.showEPG })),
      toggleScheduler: () => set((state) => ({ showScheduler: !state.showScheduler })),
      toggleRemoteInfo: () => set((state) => ({ showRemoteInfo: !state.showRemoteInfo })),

      navigateChannel: (direction) => {
        const state = get();
        const activePlaylist = state.playlists.find((p) => p.id === state.activePlaylistId);
        if (!activePlaylist || activePlaylist.channels.length === 0) return;

        const currentIndex = state.currentChannel
          ? activePlaylist.channels.findIndex((c) => c.id === state.currentChannel?.id)
          : -1;

        let nextIndex: number;
        if (direction === 'next') {
          nextIndex = (currentIndex + 1) % activePlaylist.channels.length;
        } else {
          nextIndex = currentIndex <= 0 ? activePlaylist.channels.length - 1 : currentIndex - 1;
        }

        set({ currentChannel: activePlaylist.channels[nextIndex], isPlaying: true });
      },

      importM3U: (content, name) => {
        const channels = parseM3U(content);
        const playlist: Playlist = {
          id: `pl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          channels,
          lastUpdated: new Date(),
        };
        get().addPlaylist(playlist);
      },
    }),
    {
      name: 'iptv-player-storage',
      partialize: (state) => ({
        playlists: state.playlists,
        activePlaylistId: state.activePlaylistId,
        volume: state.volume,
        scheduler: state.scheduler,
      }),
    }
  )
);
