import { useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { BroadcastView } from './pages/BroadcastView';
import { ListenView } from './pages/ListenView';
import { SettingsView } from './pages/SettingsView';
import { PageTitle } from './components/PageTitle';


function App() {
  const { initUser, startDiscovery, refreshDevices, refreshPeers } = useStore();

  useEffect(() => {
    initUser();
    startDiscovery();
    refreshDevices();

    const handleKeyDown = (e) => {
      if (e.keyCode === 116) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 82) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 82) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && [107, 109, 187, 189, 48].includes(e.keyCode)) e.preventDefault();
    };

    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    const interval = setInterval(() => refreshPeers(), 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <MemoryRouter initialEntries={['/broadcast']}>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">

            {/* HEADER */}
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/40 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-30">
              <SidebarTrigger className="-ml-1 shrink-0" />
              <div className="h-4 w-px bg-border/40 shrink-0" />
              <h1 className="text-xs font-bold uppercase tracking-widest text-muted-foreground truncate">
                <PageTitle />
              </h1>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto">
              <div className="w-full max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Routes>
                  <Route path="/" element={<Navigate to="/broadcast" replace />} />
                  <Route path="/broadcast" element={<BroadcastView />} />
                  <Route path="/listen" element={<ListenView />} />
                  <Route path="/settings" element={<SettingsView />} />
                </Routes>
              </div>
            </main>

          </SidebarInset>
        </div>
      </SidebarProvider>
    </MemoryRouter>
  );
}

export default App;
