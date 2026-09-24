import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, List, Tv, ChevronRight } from 'lucide-react';

export default function ChannelList() {
  const { playlists, activePlaylistId, currentChannel, setCurrentChannel, showChannelList } = useStore();
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const channels = activePlaylist?.channels || [];

  const groups = useMemo(() => {
    const g = new Set<string>();
    channels.forEach((ch) => {
      if (ch.group) g.add(ch.group);
    });
    return Array.from(g).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const matchesSearch = ch.name.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = !selectedGroup || ch.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [channels, search, selectedGroup]);

  if (!showChannelList) return null;

  return (
    <div className="absolute inset-y-0 left-0 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 z-50 flex flex-col animate-slide-in">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <List className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-bold">Каналы</h2>
          <span className="text-gray-400 text-sm ml-auto">
            {filteredChannels.length}/{channels.length}
          </span>
        </div>

        {playlists.length > 1 && (
          <select
            className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 mb-2 border border-gray-600"
            value={activePlaylistId || ''}
            onChange={(e) => useStore.getState().setActivePlaylist(e.target.value)}
          >
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name} ({pl.channels.length})
              </option>
            ))}
          </select>
        )}

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск канала..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded pl-8 pr-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {groups.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <button
              className={`px-2 py-0.5 text-xs rounded ${!selectedGroup ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setSelectedGroup(null)}
            >
              Все
            </button>
            {groups.map((g) => (
              <button
                key={g}
                className={`px-2 py-0.5 text-xs rounded ${selectedGroup === g ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setSelectedGroup(selectedGroup === g ? null : g)}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChannels.map((channel) => (
          <button
            key={channel.id}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-800 transition-colors ${
              currentChannel?.id === channel.id ? 'bg-blue-900/50 border-l-2 border-blue-500' : ''
            }`}
            onClick={() => setCurrentChannel(channel)}
          >
            {channel.logo ? (
              <img
                src={channel.logo}
                alt=""
                className="w-8 h-8 rounded object-contain bg-gray-800 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).outerHTML = '<div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center"><span class="text-xs">📺</span></div>';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Tv className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{channel.name}</p>
              {channel.group && (
                <p className="text-gray-500 text-xs truncate">{channel.group}</p>
              )}
            </div>
            {currentChannel?.id === channel.id && (
              <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
          </button>
        ))}

        {filteredChannels.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            {channels.length === 0 ? 'Нет каналов. Импортируйте плейлист.' : 'Каналы не найдены'}
          </div>
        )}
      </div>
    </div>
  );
}
