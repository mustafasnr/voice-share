import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export const useStore = create((set, get) => ({
  userName: localStorage.getItem('userName') || '',
  userId: localStorage.getItem('userId') || '',
  inputDevices: [],
  outputDevices: [],
  selectedInput: null,
  selectedOutput: null,
  peers: [],
  isStreaming: false,
  audioLevel: 0,
  listeningTo: [], // user_ids of peers being listened to
  peerVolumes: {}, // { user_id: 1.0 }
  peerLevels: {}, // { user_id: 0.0 }
  locale: localStorage.getItem('locale') || (navigator.language.split(/[-_]/)[0] === 'tr' ? 'tr' : 'en'),

  setLocale: (locale) => {
    localStorage.setItem('locale', locale);
    set({ locale });
  },
  setSelectedInput: (id) => set({ selectedInput: id }),
  setSelectedOutput: (id) => set({ selectedOutput: id }),

  setPeerVolume: async (userId, volume) => {
    try {
      await invoke('set_peer_volume', { userId, volume });
      set((state) => ({
        peerVolumes: { ...state.peerVolumes, [userId]: volume }
      }));
    } catch (err) {
      console.error('Failed to set peer volume:', err);
    }
  },

  setUserName: (name) => {
    localStorage.setItem('userName', name);
    set({ userName: name });
  },

  initUser: () => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = `user-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', id);
    }
    set({ userId: id });

    // Setup listeners
    listen('audio-level', (event) => {
      set({ audioLevel: event.payload });
    });

    listen('peer-audio-level', (event) => {
      const { user_id, level } = event.payload;
      set((state) => ({
        peerLevels: { ...state.peerLevels, [user_id]: level }
      }));
    });

    return id;
  },

  refreshDevices: async () => {
    try {
      const inputs = await invoke('get_input_devices');
      const outputs = await invoke('get_output_devices');
      set({ inputDevices: inputs, outputDevices: outputs });
    } catch (err) {
      console.error('Failed to refresh devices:', err);
    }
  },

  refreshPeers: async () => {
    try {
      const peers = await invoke('get_peers');
      set({ peers });
    } catch (err) {
      console.error('Failed to refresh peers:', err);
    }
  },

  startDiscovery: async () => {
    try {
      await invoke('init_discovery');
    } catch (err) {
      console.error('Failed to init discovery:', err);
    }
  },

  startBroadcast: async (deviceName) => {
    const { userId, userName } = get();
    try {
      await invoke('start_broadcast', { deviceName, userId, userName });
      set({ isStreaming: true });
    } catch (err) {
      console.error('Failed to start broadcast:', err);
    }
  },

  stopBroadcast: async () => {
    const { userId } = get();
    try {
      await invoke('stop_broadcast', { userId });
      set({ isStreaming: false });
    } catch (err) {
      console.error('Failed to stop broadcast:', err);
    }
  },

  toggleListen: async (peer, outputDevice) => {
    const { listeningTo } = get();
    const isListening = listeningTo.includes(peer.user_id);

    try {
      if (isListening) {
        await invoke('stop_listen', { userId: peer.user_id });
        set({ listeningTo: listeningTo.filter(id => id !== peer.user_id) });
      } else {
        const volume = get().peerVolumes[peer.user_id] ?? 1.0;
        await invoke('start_listen', {
          userId: peer.user_id,
          multicastIp: peer.multicast_ip,
          port: peer.port,
          deviceName: outputDevice,
          sampleRate: peer.sample_rate,
          channels: peer.channels,
          volume
        });
        set({ listeningTo: [...listeningTo, peer.user_id] });
      }
    } catch (err) {
      console.error('Failed to toggle listen:', err);
    }
  }
}));
