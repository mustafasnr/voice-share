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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative bg-background/95">
        <div className="mx-auto w-full max-w-6xl min-h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'broadcast' && <BroadcastView />}
            {activeTab === 'listen' && <ListenView />}
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p>Ayarlar sayfası yakında eklenecek.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
