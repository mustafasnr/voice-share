import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Volume2,
  Users,
  Search,
  RefreshCw,
} from "lucide-react";

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
      <Card className="border-border/40 bg-card/40 py-0 backdrop-blur-md overflow-hidden border-0 sm:border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
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
      <div className="grid grid-cols-1 sm:gap-6 px-1 sm:px-0">
        {filteredPeers.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/40 rounded-xl bg-card/20 backdrop-blur-sm px-6">
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
          filteredPeers.map((peer) => (
            <ListenPeer key={peer.user_id} peer={peer} />
          ))
        )}
      </div>
    </div>
  );
}

export default ListenView;