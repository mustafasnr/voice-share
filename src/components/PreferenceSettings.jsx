import React, { useState, useEffect } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeSelector } from "./ThemeSelector";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function PreferenceSettings() {
  const intl = useIntl();
  const [autostartEnabled, setAutostartEnabled] = useState(false);

  useEffect(() => {
    isEnabled().then(setAutostartEnabled).catch(console.error);
  }, []);

  const handleAutostartChange = async (checked) => {
    try {
      if (checked) {
        await enable();
      } else {
        await disable();
      }
      setAutostartEnabled(checked);
    } catch (err) {
      console.error("Autostart error:", err);
    }
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate"><FormattedMessage id="settings.preferences.title" /></span>
        </CardTitle>
        <CardDescription className="text-xs">
          <FormattedMessage id="settings.preferences.description" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <FormattedMessage id="settings.preferences.language" />
          </label>
          <LanguageSelector />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <FormattedMessage id="settings.preferences.theme" />
          </label>
          <ThemeSelector />
        </div>

        <div className="space-y-1.5 pt-2">
          <Label
            htmlFor="autostart"
            className="flex items-center justify-between border rounded-lg p-3 bg-muted/40 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {intl.formatMessage({ id: "settings.preferences.autostart" })}
              </span>
            </div>
            <Switch
              id="autostart"
              checked={autostartEnabled}
              className={"cursor-pointer!"}
              onCheckedChange={handleAutostartChange}
            />
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

export default PreferenceSettings;
