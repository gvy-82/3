/**
 * Хук для интеграции с Electron API
 * Используется в React-компонентах для вызова нативных функций
 */

import { useState, useEffect, useCallback } from 'react';

// Определяем, запущены ли мы в Electron
export const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

// Типизация Electron API
interface ElectronAPI {
  recording: {
    start: (options: { url: string; channelName: string; format?: string }) => Promise<{ success: boolean; filepath?: string; error?: string }>;
    stop: () => Promise<{ success: boolean }>;
    status: () => Promise<{ isRecording: boolean; count: number; recordings: any[] }>;
  };
  dialog: {
    openFile: (options?: { filters?: any[] }) => Promise<{ canceled: boolean; filePaths: string[] }>;
    saveFile: (options?: { defaultPath?: string; filters?: any[] }) => Promise<{ canceled: boolean; filePath?: string }>;
  };
  epg: {
    parse: (options: { filepath: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
  paths: {
    recordings: () => Promise<string>;
    userData: () => Promise<string>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
  remote: {
    start: () => Promise<string>;
    stop: () => Promise<void>;
  };
  udp: {
    join: (options: { address: string; port: number }) => Promise<{ success: boolean; error?: string }>;
  };
  onShortcut: (callback: (action: string) => void) => void;
  onMenuAction: (callback: (action: string) => void) => void;
  onRemoteCommand: (callback: (command: any) => void) => void;
  platform: string;
  isElectron: boolean;
}

export function useElectron() {
  const [api, setApi] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    if (isElectron) {
      setApi((window as any).electronAPI);
    }
  }, []);

  return { api, isElectron };
}

/**
 * Хук для записи потока
 */
export function useRecording() {
  const { api, isElectron } = useElectron();
  const [isRecording, setIsRecording] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const startRecording = useCallback(async (url: string, channelName: string) => {
    if (!isElectron || !api) {
      console.warn('Recording is only available in Electron');
      return { success: false, error: 'Not in Electron environment' };
    }

    const result = await api.recording.start({ url, channelName, format: 'ts' });
    if (result.success) {
      setIsRecording(true);
      setCurrentFile(result.filepath || null);
    }
    return result;
  }, [api, isElectron]);

  const stopRecording = useCallback(async () => {
    if (!isElectron || !api) return { success: false };
    const result = await api.recording.stop();
    if (result.success) {
      setIsRecording(false);
      setCurrentFile(null);
    }
    return result;
  }, [api, isElectron]);

  return { isRecording, currentFile, startRecording, stopRecording };
}

/**
 * Хук для импорта файлов через нативный диалог
 */
export function useFileDialog() {
  const { api, isElectron } = useElectron();

  const openPlaylist = useCallback(async () => {
    if (!isElectron || !api) return null;
    const result = await api.dialog.openFile({
      filters: [
        { name: 'Плейлисты M3U', extensions: ['m3u', 'm3u8'] },
        { name: 'Текстовые файлы', extensions: ['txt'] },
        { name: 'Все файлы', extensions: ['*'] },
      ],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  }, [api, isElectron]);

  const openEPG = useCallback(async () => {
    if (!isElectron || !api) return null;
    const result = await api.dialog.openFile({
      filters: [
        { name: 'EPG файлы', extensions: ['xml', 'jtv', 'txt', 'gz', 'zip'] },
        { name: 'Все файлы', extensions: ['*'] },
      ],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  }, [api, isElectron]);

  return { openPlaylist, openEPG };
}

/**
 * Хук для пульта управления
 */
export function useRemoteControl() {
  const { api, isElectron } = useElectron();
  const [address, setAddress] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(async () => {
    if (!isElectron || !api) return null;
    const addr = await api.remote.start();
    setAddress(addr);
    setIsRunning(true);
    return addr;
  }, [api, isElectron]);

  const stop = useCallback(async () => {
    if (!isElectron || !api) return;
    await api.remote.stop();
    setAddress(null);
    setIsRunning(false);
  }, [api, isElectron]);

  return { address, isRunning, start, stop };
}

/**
 * Хук для обработки команд от пульта
 */
export function useRemoteCommands(onCommand: (command: any) => void) {
  const { api, isElectron } = useElectron();

  useEffect(() => {
    if (!isElectron || !api) return;
    
    api.onRemoteCommand(onCommand);
    api.onShortcut((action) => onCommand({ type: 'shortcut', action }));
    api.onMenuAction((action) => onCommand({ type: 'menu', action }));
  }, [api, isElectron, onCommand]);
}
