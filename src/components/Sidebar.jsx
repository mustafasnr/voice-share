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
    <div className="w-64 border-r border-border/40 bg-card/30 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Radio className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight">VoiceShare</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full justify-start gap-3 h-11 px-4 transition-all duration-200",
                activeTab === item.id
                  ? "bg-primary/10 text-primary font-medium hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto flex flex-col items-center">
        <div className="text-[10px] text-muted-foreground/50 font-medium tracking-widest uppercase">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
