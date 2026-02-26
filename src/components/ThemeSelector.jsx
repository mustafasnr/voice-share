import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormattedMessage } from "react-intl";
import { ChevronDown } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "system", label: <FormattedMessage id="settings.preferences.themeSystem" />, icon: Monitor },
    { id: "light", label: <FormattedMessage id="settings.preferences.themeLight" />, icon: Sun },
    { id: "dark", label: <FormattedMessage id="settings.preferences.themeDark" />, icon: Moon },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-full p-4 rounded-xl border bg-background/40 hover:bg-background/60 cursor-pointer transition-all flex items-center justify-between h-[56px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {currentTheme.label}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="p-2 rounded-xl min-w-(--radix-dropdown-menu-trigger-width)"
      >
        {themes.map((t) => {
          const active = t.id === theme;
          const TIcon = t.icon;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-3 cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <TIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate min-w-0">
                  {t.label}
                </span>
              </div>
              {active && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
