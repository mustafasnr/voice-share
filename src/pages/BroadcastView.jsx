import React from 'react';
import { useStore } from '../store/useStore';
import { Radio, Activity, Power, User, PencilLine } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import DevicePicker from './device-picker';
import { AudioVisualizer } from './AudioVisualizer';

export function BroadcastView() {
  const {
    userName,
    userId,
    inputDevices,
    selectedInput, setSelectedInput,
    isStreaming, startBroadcast, stopBroadcast
  } = useStore();

  const navigate = useNavigate();
  const intl = useIntl();

  const handleToggleBroadcast = () => {
    if (isStreaming) {
      stopBroadcast();
    } else if (selectedInput) {
      startBroadcast(selectedInput);
    }
  };

  return (
    <div className="space-y-5 w-full">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight truncate">
            <FormattedMessage id="broadcast.title" />
          </h2>
          <p className="text-muted-foreground text-xs truncate">
            <FormattedMessage id="broadcast.subtitle" />
          </p>
        </div>

        <Badge
          variant={isStreaming ? "default" : "secondary"}
          className={cn(
            "px-3 py-1 text-[10px] font-bold tracking-wider shrink-0",
            isStreaming && "animate-pulse"
          )}
        >
          {isStreaming ? (
            <FormattedMessage id="broadcast.status.live" />
          ) : (
            <FormattedMessage id="broadcast.status.pause" />
          )}
        </Badge>
      </div>

      {/* MAIN CARD */}
      <Card className="bg-card/60 backdrop-blur border-border/40 overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-6">

          {/* PROFILE & DEVICE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <User className="w-4 h-4 shrink-0" />
              <span className="font-bold uppercase tracking-widest text-[10px]">
                <FormattedMessage id="broadcast.profile" />
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                <FormattedMessage id="broadcast.nameLabel" />
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Input
                    value={userName}
                    disabled
                    className="h-10 bg-background/40 pr-24 cursor-default focus-visible:ring-0"
                    placeholder={intl.formatMessage({ id: "broadcast.namePlaceholder" })}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Badge variant="outline" className="text-[9px] font-mono opacity-50 whitespace-nowrap">
                      ID: {userId.split('-')[1]}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  className="h-10 gap-2 border-primary/20 hover:bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider shrink-0"
                >
                  <PencilLine className="w-3.5 h-3.5" />
                  <FormattedMessage id="broadcast.editName" />
                </Button>
              </div>
            </div>
          </div>

          {/* DEVICE SELECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Radio className={cn("w-4 h-4 shrink-0", isStreaming && "animate-pulse")} />
              <span className="font-bold uppercase tracking-widest text-[10px]">
                <FormattedMessage id="broadcast.sourceLabel" />
              </span>
            </div>
            <DevicePicker
              devices={inputDevices}
              selected={selectedInput}
              onSelect={setSelectedInput}
            />
          </div>

          {/* ACTION AREA */}
          <div className="space-y-4 bg-secondary/10 p-4 rounded-xl border border-border/20">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-primary/90">
                <FormattedMessage id="broadcast.status.streaming" />
              </h3>
              <p className="text-xs text-muted-foreground">
                {isStreaming
                  ? <FormattedMessage id="broadcast.status.activeHint" />
                  : <FormattedMessage id="broadcast.status.inactiveHint" />}
              </p>
            </div>

            <Button
              disabled={!selectedInput}
              onClick={handleToggleBroadcast}
              className={cn(
                "h-12 w-full text-sm font-bold transition-all shadow-xl hover:scale-[1.01] active:scale-95",
                isStreaming
                  ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                  : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {isStreaming ? (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  <FormattedMessage id="broadcast.status.stop" />
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  <FormattedMessage id="broadcast.status.start" />
                </>
              )}
            </Button>

            {isStreaming && (
              <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  <FormattedMessage id="broadcast.status.liveNote" />
                </span>
              </div>
            )}
          </div>

          {/* VISUALIZER */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <FormattedMessage id="broadcast.monitor" />
            </span>
            <div className="bg-black/20 rounded-xl p-3 border border-border/10 backdrop-blur-sm h-20">
              <AudioVisualizer
                level={useStore(s => s.audioLevel)}
                isStreaming={isStreaming}
                color="#60a5fa"
                barCount={50}
              />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}