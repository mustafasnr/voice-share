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
import { Progress } from './ui/progress';
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

  const selectedDevice = inputDevices.find(d => d.name === selectedInput);

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ses Yayını</h2>
          <p className="text-muted-foreground text-sm">
            Yerel ağdaki cihazlara gerçek zamanlı ses aktarımı
          </p>
        </div>

        <Badge variant={isStreaming ? "default" : "secondary"}
          className={`px-4 py-1 text-xs tracking-wider ${isStreaming ? "animate-pulse" : ""}`}>
          {isStreaming ? "CANLI" : "PASİF"}
        </Badge>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PROFILE */}
        {/* BROADCAST PANEL */}
        <Card className="col-span-full bg-card/60 backdrop-blur border-border/40 transition-all">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil

            </div>
            <div>
              <label className="text-xs text-muted-foreground">Görünen Ad (ID: {userId})</label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Radio className={isStreaming ? "animate-pulse text-primary" : ""} />
              Yayın Kontrolü
            </div>



            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 w-full">

              {/* DEVICE SELECT */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <label className="text-xs text-muted-foreground font-medium ml-1">
                  Ses Kaynağı
                </label>

                <DevicePicker
                  devices={inputDevices}
                  selected={selectedInput}
                  onSelect={setSelectedInput}
                />
              </div>

              {/* START / STOP BUTTON */}
              <Button
                disabled={!selectedInput}
                onClick={handleToggleBroadcast}
                className={`h-[56px] px-8 text-base font-bold whitespace-nowrap transition-all shadow-lg
      ${isStreaming
                    ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                  }`}
              >
                {isStreaming ? (
                  <>
                    <Power className="w-5 h-5 mr-2" />
                    Durdur
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 mr-2" />
                    Yayını Başlat
                  </>
                )}
              </Button>

            </div>




            {/* AUDIO VISUALIZER / STEAM STYLE GRAPH */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Aktif Yayın Sinyali
                </div>
                {isStreaming && (
                  <div className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[9px] font-bold text-primary/80">YAYINLANIYOR</span>
                  </div>
                )}
              </div>

              <AudioVisualizer />
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}