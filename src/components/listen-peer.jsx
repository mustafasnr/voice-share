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
  const volume = peerVolumes[peer.user_id] ?? 1.0;
  const level = useStore(s => s.peerLevels[peer.user_id] || 0);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all  duration-300 border-border/40 bg-card/40 backdrop-blur-sm hover:shadow-xl py-0",
        isListening ? "ring-1 ring-primary/50 bg-primary/5" : "hover:border-primary/20"
      )}
    >
      <CardContent className="flex flex-col p-4 gap-2">
        {/* TOP ROW: AVATAR, INFO & CONTROLS */}
        <div className="flex items-start justify-between w-full">
          {/* LEFT: AVATAR & INFO */}
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm transition-all duration-500 shrink-0",
              isListening ? "bg-primary text-primary-foreground shadow-primary/20 scale-105" : "bg-primary/10 text-primary"
            )}>
              {peer.user_name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="flex flex-col min-w-0 justify-center h-14">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-extrabold truncate text-lg sm:text-xl leading-none">{peer.user_name || "İsimsiz"}</h4>
                <Badge variant="outline" className="inline-flex sm:hidden lg:inline-flex text-xs h-4.5 px-1.5 font-mono leading-none border-border/60 bg-background/50">
                  {peer.user_id.split("-")[1]}
                </Badge>
              </div>

              {/* Device Info (Very Compact) */}
              <div className="flex sm:hidden xl:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded-md border border-border/10 w-fit">
                {peer.is_output ? (
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-green-400" />
                )}
                <span className="truncate font-medium">{peer.device_name}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS (Horizontal Slider & Button) */}
          <div className="flex items-center gap-4 h-14">
            {/* Horizontal Volume Slider */}
            <div className="hidden sm:flex flex-col items-end gap-1.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary/70 uppercase tracking-tighter">Volume</span>
                <span className="text-xs font-mono font-bold text-primary">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={volume}
                onChange={(e) => setPeerVolume(peer.user_id, parseFloat(e.target.value))}
                className="w-32 h-1.5 bg-secondary/30 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            <Button
              onClick={() => toggleListen(peer, selectedOutput)}
              disabled={!selectedOutput}
              size="icon"
              variant={isListening ? "destructive" : "default"}
              className={cn(
                "size-12 rounded-xl transition-all duration-300",
                isListening ? "shadow-lg shadow-destructive/20" : "hover:bg-primary/20 hover:text-primary"
              )}
            >
              {isListening ? (
                <StopCircle className="size-6" />
              ) : (
                <Play className="size-6" />
              )}
            </Button>
          </div>
        </div>

        {/* BOTTOM: AUDIO VISUALIZER (Full Width) */}
        <div className="h-8 w-full relative mt-1 overflow-hidden rounded-lg">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}
          >
            <AudioVisualizer
              level={level}
              isStreaming={isListening}
              color={isListening ? "#3b82f6" : "#64748b"}
              mode="bars"
              barCount={100}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ListenPeer;