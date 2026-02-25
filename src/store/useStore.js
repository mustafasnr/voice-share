import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export const useStore = create((set, get) => ({
  activeTab: 'broadcast', // 'broadcast' | 'listen' | 'settings'
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

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedInput: (id) => set({ selectedInput: id }),
  setSelectedOutput: (id) => set({ selectedOutput: id }),

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
    const { userId } = get();
    try {
      await invoke('init_discovery', { userId });
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
    try {
      await invoke('stop_broadcast');
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
        await invoke('start_listen', {
          userId: peer.user_id,
          multicastIp: peer.multicast_ip,
          port: peer.port,
          deviceName: outputDevice
        });
        set({ listeningTo: [...listeningTo, peer.user_id] });
      }
    } catch (err) {
      console.error('Failed to toggle listen:', err);
    }
  }
}));
