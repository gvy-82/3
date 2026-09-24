import { useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { useStore } from '../store';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { currentChannel, volume, isMuted, isPlaying } = useStore();

  const loadStream = useCallback(() => {
    const video = videoRef.current;
    if (!video || !currentChannel) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = currentChannel.url;

    if (currentChannel.protocol === 'hls' || url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data.type);
          }
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(() => {});
      }
    } else if (currentChannel.protocol === 'http' || currentChannel.protocol === 'rtmp') {
      video.src = url;
      video.play().catch(() => {});
    } else if (currentChannel.protocol === 'udp') {
      // UDP multicast is not supported in browsers
      // Show a message about this limitation
      console.warn('UDP multicast is not supported in web browsers. Use a native player for UDP streams.');
    }
  }, [currentChannel]);

  useEffect(() => {
    loadStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [loadStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  if (!currentChannel) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📺</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">IP-TV Player</h2>
          <p className="text-gray-500 max-w-md">
            Выберите канал из списка или импортируйте плейлист M3U для начала просмотра
          </p>
        </div>
      </div>
    );
  }

  if (currentChannel.protocol === 'udp') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-lg p-6">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-xl font-bold text-yellow-400 mb-2">UDP Multicast</h2>
          <p className="text-gray-400 mb-4">
            Протокол UDP (мультикаст) не поддерживается веб-браузерами.
            Для просмотра UDP потоков используйте нативное приложение плеера.
          </p>
          <div className="bg-gray-800 rounded p-3 text-left">
            <p className="text-gray-300 text-sm">
              <strong>Канал:</strong> {currentChannel.name}<br />
              <strong>URL:</strong> {currentChannel.url}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain bg-black"
      playsInline
      autoPlay
      controls={false}
    />
  );
}
