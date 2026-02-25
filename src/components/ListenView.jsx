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
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPeers = peers.filter(
    (p) =>
      p.user_id !== userId &&
      (p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yayınları Dinle</h2>
          <p className="text-muted-foreground text-sm">
            Yerel ağdaki aktif yayıncıları keşfet
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Yayın ara..."
              className="pl-9 h-11 w-[220px] bg-card/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={refreshPeers}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* OUTPUT DEVICE CARD */}
      <Card className="border-border/40 bg-card/60 backdrop-blur p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Volume2 className="w-5 h-5 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold">Çıkış Cihazı</p>
              <p className="text-xs text-muted-foreground">
                Sesin çalınacağı hoparlörü seç
              </p>
            </div>
          </div>

          <div className="w-1/2">
            <DevicePicker
              devices={outputDevices}
              selected={selectedOutput}
              onSelect={setSelectedOutput}
            />
          </div>

        </div>
      </Card>

      {/* PEERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {filteredPeers.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/40 rounded-xl bg-card/20">

            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-lg font-medium">
                Aktif yayın bulunamadı
              </h3>
              <p className="text-sm text-muted-foreground">
                Ağ taranıyor veya kimse yayın yapmıyor
              </p>
            </div>

            <Badge variant="secondary" className="animate-pulse">
              Ağ Taranıyor...
            </Badge>
          </div>
        ) : (
          filteredPeers.map((peer) => {
            const isListening = listeningTo.includes(peer.user_id);

            return (
              <Card
                key={peer.user_id}
                className={`relative overflow-hidden transition-all border-border/40 bg-card/60 backdrop-blur
                  ${isListening
                    ? "ring-2 ring-primary"
                    : "hover:border-primary/40"
                  }
                `}
              >
                <CardContent className="p-6 space-y-5">

                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-primary font-bold text-lg">
                      {peer.user_name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">
                        {peer.user_name || "İsimsiz"}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 font-mono"
                        >
                          {peer.user_id.split("-")[1]}
                        </Badge>

                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Wifi className="w-2.5 h-2.5 text-green-500" />
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md">
                    <Mic className="w-3.5 h-3.5" />
                    <span className="truncate">{peer.device_name}</span>
                  </div>

                  {/* Listen Button */}
                  <Button
                    onClick={() => toggleListen(peer, selectedOutput)}
                    disabled={!selectedOutput}
                    className={`w-full h-11 font-semibold transition-all
                      ${isListening
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-secondary hover:bg-primary/10"
                      }
                    `}
                  >
                    {isListening ? "Dinleniyor" : "Dinle"}
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