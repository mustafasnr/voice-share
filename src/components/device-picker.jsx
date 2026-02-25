import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Mic, Volume2, ChevronDown } from "lucide-react";

function DevicePicker({ devices, selected, onSelect }) {
  const selectedDevice = devices.find((d) => d.name === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="p-4 rounded-xl border bg-background/40 hover:bg-background/60 cursor-pointer transition-all flex items-center justify-between h-[56px]">

          {selectedDevice ? (
            <div className="flex items-center gap-3 min-w-0">
              {selectedDevice.is_loopback ? (
                <Volume2 className="w-5 h-5 text-blue-400 shrink-0" />
              ) : (
                <Mic className="w-5 h-5 text-green-400 shrink-0" />
              )}

              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {selectedDevice.name}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground truncate">
              Ses kaynağı seç
            </span>
          )}

          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="p-2 rounded-xl max-h-60 overflow-y-auto"
      >
        {devices.map((device, idx) => {
          const active = device.name === selected;
          console.warn(device)
          return (
            <DropdownMenuItem
              key={idx}
              onClick={() => onSelect(device.name)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer
                ${active ? "bg-primary/10" : ""}
              `}
            >
              {device.is_loopback ? (
                <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <Mic className="w-4 h-4 text-green-400 shrink-0" />
              )}

              <span className="text-sm font-medium truncate min-w-0">
                {device.name}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DevicePicker;