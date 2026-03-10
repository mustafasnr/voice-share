import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIntl } from "react-intl";

import { Mic, Volume2, ChevronDown, Check } from "lucide-react";

function DevicePicker({ devices, selected, onSelect }) {
  const intl = useIntl();
  const selectedDevice = devices.find((d) => d.id === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="p-4 rounded-xl border bg-background/40 hover:bg-background/60 cursor-pointer transition-all flex items-center justify-between h-[56px]">

          {selectedDevice ? (
            <div className="flex items-center gap-3 min-w-0">
              {selectedDevice.is_output ? (
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
              {intl.formatMessage({ id: "listen.selectSpeaker", defaultMessage: "Select device" })}
            </span>
          )}

          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="p-2 rounded-xl max-h-60 overflow-y-auto"
      >
        {devices.map((device) => {
          const active = device.id === selected;
          return (
            <DropdownMenuItem
              key={device.id}
              onClick={() => onSelect(device.id)}
              className={`flex items-center justify-start gap-3 rounded-lg px-3 py-3 cursor-pointer`}
            >
              {device.is_output ? (
                <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <Mic className="w-4 h-4 text-green-400 shrink-0" />
              )}

              <span className="text-sm font-medium truncate min-w-0">
                {device.name}
              </span>
              {active && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DevicePicker;