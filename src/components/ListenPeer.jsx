import { useState, useEffect } from "react";
import { Mic, Volume2, Play, StopCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { AudioVisualizer } from "./AudioVisualizer";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

function ListenPeer({ peer }) {
  const {
    listeningTo,
    toggleListen,
    selectedOutput,
    peerVolumes,
    setPeerVolume
  } = useStore();

  const isListening = listeningTo.includes(peer.user_id);
  const storeVolume = peerVolumes[peer.user_id] ?? 1.0;
  const level = useStore(s => s.peerLevels[peer.user_id] || 0);

  // Local state for smooth slider dragging — avoids Tauri IPC on every frame
  const [localVolume, setLocalVolume] = useState(storeVolume);

  // Keep local in sync if store is updated externally
  useEffect(() => {
    setLocalVolume(storeVolume);
  }, [storeVolume]);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 border-border/40 bg-card/40 backdrop-blur-sm py-0",
        isListening
          ? "ring-1 ring-primary/50 bg-primary/5"
          : "hover:border-primary/20 hover:shadow-md"
      )}
    >
      <CardContent className="flex flex-col p-3 gap-2">

        {/* TOP ROW */}
        <div className="flex items-center gap-3 w-full min-w-0">

          {/* AVATAR */}
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl shadow-sm transition-all duration-500 shrink-0",
            isListening
              ? "bg-primary text-primary-foreground shadow-primary/20 scale-105"
              : "bg-primary/10 text-primary"
          )}>
            {peer.user_name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* INFO */}
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-extrabold truncate text-sm leading-none">
                {peer.user_name || "İsimsiz"}
              </h4>
              <Badge
                variant="outline"
                className="shrink-0 text-[9px] h-4 px-1 font-mono leading-none border-border/60 bg-background/50"
              >
                {peer.user_id.split("-")[1]}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-fit max-w-full">
              {peer.is_output
                ? <Volume2 className="w-3 h-3 text-blue-400 shrink-0" />
                : <Mic className="w-3 h-3 text-green-400 shrink-0" />
              }
              <span className="truncate text-[11px]">{peer.device_name}</span>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Volume Slider */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                  Vol
                </span>
                <span className="text-[10px] font-mono font-bold text-primary">
                  {Math.round(localVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={localVolume}
                onChange={(e) => setLocalVolume(parseFloat(e.target.value))}
                onPointerUp={(e) => setPeerVolume(peer.user_id, parseFloat(e.target.value))}
                className="w-24 h-1 bg-secondary/30 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Play/Stop Button */}
            <Button
              onClick={() => toggleListen(peer, selectedOutput)}
              disabled={!selectedOutput}
              size="icon"
              variant={isListening ? "destructive" : "default"}
              className={cn(
                "size-10 rounded-xl transition-all duration-300 shrink-0",
                isListening
                  ? "shadow-lg shadow-destructive/20"
                  : "hover:bg-primary/20 hover:text-primary"
              )}
            >
              {isListening
                ? <StopCircle className="size-5" />
                : <Play className="size-5" />
              }
            </Button>
          </div>
        </div>

        {/* AUDIO VISUALIZER */}
        <div className="h-7 w-full relative overflow-hidden rounded-md">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
            }}
          >
            <AudioVisualizer
              level={level}
              isStreaming={isListening}
              color={isListening ? "#3b82f6" : "#64748b"}
              mode="bars"
              barCount={80}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

export default ListenPeer;