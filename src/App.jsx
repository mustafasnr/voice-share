import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { BroadcastView } from './components/BroadcastView';
import { ListenView } from './components/ListenView';

function App() {
  const {
    initUser,
    startDiscovery,
    refreshDevices,
    refreshPeers,
    activeTab
  } = useStore();

  useEffect(() => {
    initUser();
    startDiscovery();
    refreshDevices();

    const interval = setInterval(() => {
      refreshPeers();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-8 py-8 max-w-6xl">
          {activeTab === 'broadcast' && <BroadcastView />}
          {activeTab === 'listen' && <ListenView />}
          {activeTab === 'settings' && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p>Ayarlar sayfası yakında eklenecek.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
