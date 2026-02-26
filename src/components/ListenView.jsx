import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Volume2, Users, Search, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import DevicePicker from "./device-picker";
import ListenPeer from "./listen-peer";

export function ListenView() {
  const {
    peers,
    refreshPeers,
    userId,
    outputDevices,
    selectedOutput,
    setSelectedOutput,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPeers = peers.filter(
    (p) =>
      p.user_id !== userId &&
      (p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 w-full pb-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-xl font-bold tracking-tight truncate">Yayınları Dinle</h2>
          <p className="text-muted-foreground text-xs truncate">
            Yerel ağdaki aktif yayıncıları keşfet
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={refreshPeers}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Yayıncı veya ID ara..."
          className="pl-9 h-9 bg-card/40"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* OUTPUT DEVICE CARD */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden py-0">
        <div className="flex items-center justify-between p-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Çıkış Cihazı</p>
              <p className="text-xs text-muted-foreground truncate">Hoparlör seçin</p>
            </div>
          </div>

          <div className="w-48 shrink-0">
            <DevicePicker
              devices={outputDevices}
              selected={selectedOutput}
              onSelect={setSelectedOutput}
            />
          </div>
        </div>
      </Card>

      {/* PEERS LIST */}
      <div className="space-y-3">
        {filteredPeers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/40 rounded-xl bg-card/20 backdrop-blur-sm px-6">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center border border-border/40 shrink-0">
              <Users className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="max-w-xs min-w-0">
              <h3 className="text-base font-bold">Aktif Yayın Bulunamadı</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Şu an ağda kimse yayın yapmıyor.
              </p>
            </div>
            <Badge variant="secondary" className="animate-pulse bg-primary/5 text-primary border-primary/20">
              Ağ Taranıyor...
            </Badge>
          </div>
        ) : (
          filteredPeers.map((peer) => (
            <ListenPeer key={peer.user_id} peer={peer} />
          ))
        )}
      </div>
    </div>
  );
}

export default ListenView;