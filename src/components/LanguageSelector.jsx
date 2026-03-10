import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useStore } from "../store/useStore";
import { useIntl } from "react-intl";

const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "/tr.svg" },
  { code: "en", label: "English", flag: "/en.svg" },
  { code: "de", label: "Deutsch", flag: "/de.svg" },
  { code: "es", label: "Español", flag: "/es.svg" },
  { code: "fr", label: "Français", flag: "/fr.svg" },
  { code: "it", label: "Italiano", flag: "/it.svg" },
  { code: "ru", label: "Русский", flag: "/ru.svg" },
  { code: "cn", label: "中文", flag: "/cn.svg" },
  { code: "ind", label: "हिन्दी", flag: "/ind.svg" },
  { code: "jp", label: "日本語", flag: "/jp.svg" },
];

export function LanguageSelector() {
  const { locale, setLocale } = useStore();
  const intl = useIntl();
  const selectedLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-full p-4 rounded-xl border bg-background/40 hover:bg-background/60 cursor-pointer transition-all flex items-center justify-between h-[56px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10">
              <img
                src={selectedLang.flag}
                alt={selectedLang.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if flags are not yet added
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {selectedLang.label}
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
        {LANGUAGES.map((lang) => {
          const active = lang.code === locale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-3 cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={lang.flag}
                    alt={lang.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-sm font-medium truncate min-w-0">
                  {lang.label}
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
