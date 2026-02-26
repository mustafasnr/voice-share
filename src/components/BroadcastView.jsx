import React from 'react';
import { useStore } from '../store/useStore';
import {
  Radio,
  Activity,
  Power,
  User,
} from 'lucide-react';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { Badge } from './ui/badge';
import DevicePicker from './device-picker';
import { AudioVisualizer } from './AudioVisualizer';

export function BroadcastView() {
  const {
    userName, setUserName,
    userId,
    inputDevices,
    selectedInput, setSelectedInput,
    isStreaming, startBroadcast, stopBroadcast
  } = useStore();

  const handleToggleBroadcast = () => {
    if (isStreaming) {
      stopBroadcast();
    } else if (selectedInput) {
      startBroadcast(selectedInput);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ses Yayını</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Yerel ağdaki cihazlara gerçek zamanlı ses aktarımı
          </p>
        </div>

        <Badge variant={isStreaming ? "default" : "secondary"}
          className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold tracking-wider ${isStreaming ? "animate-pulse" : ""}`}>
          {isStreaming ? "CANLI" : "PAUSE"}
        </Badge>
      </div>

      {/* MAIN CONTAINER */}
      <Card className="bg-card/60 backdrop-blur border-border/40 transition-all overflow-hidden border-0 sm:border">
        <CardContent className="p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-10">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT: PROFILE & DEVICE */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Yayıncı Profili</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium ml-1">Görünen Ad</label>
                  <div className="relative group">
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-11 sm:h-12 bg-background/40 group-hover:bg-background/60 transition-colors"
                      placeholder="İsminiz..."
                    />
                    <div className="absolute right-3 top-3 sm:top-3.5">
                      <Badge variant="outline" className="text-[8px] sm:text-[9px] font-mono opacity-50">ID: {userId.split('-')[1]}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Radio className={`w-4 h-4 sm:w-5 sm:h-5 ${isStreaming ? "animate-pulse" : ""}`} />
                  <span className="font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Cihaz Seçimi</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium ml-1">Ses Kaynağı</label>
                  <DevicePicker
                    devices={inputDevices}
                    selected={selectedInput}
                    onSelect={setSelectedInput}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: ACTION & STATUS */}
            <div className="flex flex-col justify-center space-y-6 sm:space-y-8 bg-secondary/10 p-5 sm:p-8 rounded-2xl border border-border/20">
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg sm:text-xl text-primary/90">Yayın Durumu</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {isStreaming
                    ? "Sesiniz şu an yerel ağda paylaşılıyor."
                    : "Yayını başlatmak için bir cihaz seçin."}
                </p>
              </div>

              <Button
                disabled={!selectedInput}
                onClick={handleToggleBroadcast}
                className={`h-14 sm:h-16 w-full text-base sm:text-lg font-bold transition-all shadow-xl hover:scale-[1.01] active:scale-95
                  ${isStreaming
                    ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                  }`}
              >
                {isStreaming ? (
                  <>
                    <Power className="w-5 h-5 mr-3" />
                    Yayını Durdur
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 mr-3" />
                    Yayını Başlat
                  </>
                )}
              </Button>

              {isStreaming && (
                <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Canlı Aktarım Devam Ediyor</span>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM: VISUALIZER */}
          <div className="pt-8 sm:pt-10 border-t border-border/40 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sinyal Monitörü</span>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 border border-border/10 backdrop-blur-sm">
              <AudioVisualizer />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}