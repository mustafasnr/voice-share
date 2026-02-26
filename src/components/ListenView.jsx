import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Volume2,
  Users,
  Search,
  RefreshCw,
  Wifi,
  Mic,
} from "lucide-react";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import DevicePicker from "./device-picker";
import { AudioVisualizer } from "./AudioVisualizer";

export function ListenView() {
  const {
    peers,
    refreshPeers,
    userId,
    outputDevices,
    selectedOutput,
    setSelectedOutput,
    listeningTo,
    toggleListen,
    peerVolumes,
    setPeerVolume,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPeers = peers.filter(
    (p) =>
      p.user_id !== userId &&
      (p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 sm:space-y-10 w-full max-w-7xl mx-auto pb-10">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Yayınları Dinle</h2>
          <p className="text-muted-foreground text-sm">
            Yerel ağdaki aktif yayıncıları keşfet
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Yayıncı veya ID ara..."
              className="pl-9 h-10 bg-card/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={refreshPeers}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* OUTPUT CONFIG CARD */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden border-0 sm:border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Çıkış Cihazı</p>
              <p className="text-xs text-muted-foreground">Hoparlör seçin</p>
            </div>
          </div>

          <div className="w-full sm:w-1/2 md:w-1/3">
            <DevicePicker
              devices={outputDevices}
              selected={selectedOutput}
              onSelect={setSelectedOutput}
            />
          </div>
        </div>
      </Card>

      {/* PEERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-0">
        {filteredPeers.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/40 rounded-3xl bg-card/20 backdrop-blur-sm px-6">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center border border-border/40">
              <Users className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-lg font-bold">Aktif Yayın Bulunamadı</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Şu an ağda kimse yayın yapmıyor.
              </p>
            </div>
            <Badge variant="secondary" className="animate-pulse bg-primary/5 text-primary border-primary/20">
              Ağ Taranıyor...
            </Badge>
          </div>
        ) : (
          filteredPeers.map((peer) => {
            const isListening = listeningTo.includes(peer.user_id);
            const volume = peerVolumes[peer.user_id] ?? 1.0;

            return (
              <Card
                key={peer.user_id}
                className={`group relative overflow-hidden transition-all duration-300 border-border/40 bg-card/60 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5
                  ${isListening ? "ring-2 ring-primary border-transparent" : "hover:border-primary/30"}
                `}
              >
                <CardContent className="p-5 sm:p-6 space-y-6">
                  {/* Peer Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-primary font-bold text-xl shadow-inner transition-colors
                      ${isListening ? "bg-primary text-primary-foreground" : "bg-primary/10"}
                    `}>
                      {peer.user_name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold truncate text-base">{peer.user_name || "İsimsiz"}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[10px] h-4 font-mono leading-none border-border/60">
                          {peer.user_id.split("-")[1]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Wifi className="w-2.5 h-2.5 text-green-500" />
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device Tag */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground bg-secondary/30 px-3 py-2 rounded-xl border border-border/20">
                    {peer.is_output ? (
                      <Volume2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    )}
                    <span className="truncate flex-1">{peer.device_name}</span>
                  </div>

                  {/* Audio Visualizer */}
                  {isListening && (
                    <div className="h-4 w-full bg-secondary/20 rounded-full overflow-hidden border border-border/10">
                      <AudioVisualizer
                        level={useStore(s => s.peerLevels[peer.user_id] || 0)}
                        isStreaming={isListening}
                        color="#60a5fa"
                        mode="compact"
                      />
                    </div>
                  )}

                  {/* Volume Control (Compact Design) */}
                  {isListening && (
                    <div className="animate-in zoom-in-95 fade-in duration-200 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Ses Gücü</span>
                        <span className="text-primary font-mono">{Math.round(volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setPeerVolume(peer.user_id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  )}

                  {/* Listen Button */}
                  <Button
                    onClick={() => toggleListen(peer, selectedOutput)}
                    disabled={!selectedOutput}
                    variant={isListening ? "default" : "secondary"}
                    className={`w-full h-11 sm:h-12 rounded-xl font-bold transition-all
                      ${isListening
                        ? "shadow-lg shadow-primary/20"
                        : "hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"}
                    `}
                  >
                    {isListening ? "Bağlantıyı Kes" : "Dinlemeye Başla"}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ListenView;