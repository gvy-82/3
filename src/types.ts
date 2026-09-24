export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  epgId?: string;
  protocol: 'http' | 'udp' | 'hls' | 'rtmp';
  settings?: ChannelSettings;
}

export interface ChannelSettings {
  volume: number;
  aspectRatio: 'auto' | '16:9' | '4:3' | '21:9';
  deinterlace: boolean;
  audioTrack?: number;
  subtitleTrack?: number;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  url?: string;
  lastUpdated?: Date;
}

export interface EPGProgram {
  channelId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: string;
}

export interface RecordingTask {
  id: string;
  channelId: string;
  channelName: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'recording' | 'completed' | 'failed';
  filename?: string;
}

export interface SchedulerEntry {
  id: string;
  channelId: string;
  channelName: string;
  startTime: Date;
  endTime: Date;
  type: 'record' | 'watch';
  enabled: boolean;
}

export interface AppState {
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
  osdTimeout: number | null;
}
