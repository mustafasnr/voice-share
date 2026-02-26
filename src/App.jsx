import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { BroadcastView } from './components/BroadcastView';
import { ListenView } from './components/ListenView';
import { SettingsView } from './components/SettingsView';
import { FormattedMessage } from 'react-intl';

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

    // Disable refresh shortcuts (F5, Ctrl+R, Cmd+R, etc.)
    const handleKeyDown = (e) => {
      // F5
      if (e.keyCode === 116) {
        e.preventDefault();
      }
      // Ctrl+R or Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 82) {
        e.preventDefault();
      }
      // Ctrl+Shift+R or Cmd+Shift+R
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey) && e.keyCode === 82) {
        e.preventDefault();
      }
      // F11 (Fullscreen) - Optional: uncomment if you want to block F11 too
      // if (e.keyCode === 122) {
      //   e.preventDefault();
      // }
      // Disable Zoom (Ctrl + Plus, Minus, Zero)
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 107 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189 || e.keyCode === 48)) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    const interval = setInterval(() => {
      refreshPeers();
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex w-full flex-col overflow-hidden">
          {/* HEADER FOR MOBILE & STICKY TRIGGER */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 sm:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-border/40 mx-2 hidden sm:block" />
              <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {activeTab === 'broadcast' && <FormattedMessage id="header.broadcast" />}
                {activeTab === 'listen' && <FormattedMessage id="header.listen" />}
                {activeTab === 'settings' && <FormattedMessage id="header.settings" />}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Optional: Add status badges or user info here */}
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === 'broadcast' && <BroadcastView />}
              {activeTab === 'listen' && <ListenView />}
              {activeTab === 'settings' && <SettingsView />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default App;
