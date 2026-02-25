import React from 'react';
import { useStore } from '../store/useStore';
import { Radio, Volume2, Settings, Home, Wifi, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { activeTab, setActiveTab } = useStore();

  const menuItems = [
    { id: 'broadcast', label: 'Yayınla', icon: Radio },
    { id: 'listen', label: 'Dinle', icon: Volume2 },
    // { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div className="w-20 sm:w-64 border-r border-border/40 bg-card/30 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out">
      <div className="p-4 sm:p-6 flex items-center justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-9 sm:h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
          <Radio className="w-6 h-6 sm:w-5 sm:h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight hidden sm:block bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          VoiceShare
        </span>
      </div>

      <nav className="flex-1 px-3 sm:px-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full justify-center sm:justify-start gap-0 sm:gap-3.5 h-12 sm:h-11 px-0 sm:px-4 transition-all duration-200 border border-transparent",
                isActive
                  ? "bg-primary/10 text-primary font-semibold border-primary/20 shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6 sm:w-5 sm:h-5 shrink-0 transition-transform duration-200", isActive && "scale-110")} />
              <span className="hidden sm:block truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 sm:p-6 mt-auto flex flex-col items-center">
        <div className="text-[10px] text-muted-foreground/30 font-bold tracking-widest uppercase hidden sm:block">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
