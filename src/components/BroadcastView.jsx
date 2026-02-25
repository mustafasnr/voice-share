import React from 'react';
import { useStore } from '../store/useStore';
import {
  Radio,
  Mic,
  Volume2,
  Activity,
  Power,
  User,
  Shield,
  Wifi
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import DevicePicker from './device-picker';

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
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">

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



            <div className="flex items-end gap-4 w-full">

              {/* DEVICE SELECT */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs text-muted-foreground">
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
                className={`h-[56px] px-6 text-base font-semibold whitespace-nowrap transition-all
      ${isStreaming
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary"
                  }`}
              >
                {isStreaming ? (
                  <>
                    <Power className="w-5 h-5 mr-2" />
                    Yayını Durdur
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 mr-2" />
                    Yayını Başlat
                  </>
                )}
              </Button>

            </div>




            {/* AUDIO LEVEL */}
            {isStreaming && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-primary animate-pulse uppercase">
                  Ses Seviyesi
                </div>
                <Progress value={65} className="h-2" />
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}