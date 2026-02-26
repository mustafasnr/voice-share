import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { useIntl, FormattedMessage } from "react-intl";
import { User, Info, Save, CheckCircle2, Trash2, Github, Globe } from "lucide-react";
import { cn } from "../lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeSelector } from "./ThemeSelector";

export function SettingsView() {
  const { userName, setUserName, userId } = useStore();
  const intl = useIntl();

  const [tempName, setTempName] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveName = () => {
    setUserName(tempName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-5 w-full pb-6">

      {/* HEADER */}
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight truncate">
          <FormattedMessage id="settings.title" />
        </h2>
        <p className="text-muted-foreground text-xs truncate">
          <FormattedMessage id="settings.subtitle" />
        </p>
      </div>

      <div className="space-y-4">

        {/* PROFILE CARD */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate"><FormattedMessage id="settings.profile.title" /></span>
            </CardTitle>
            <CardDescription className="text-xs">
              <FormattedMessage id="settings.profile.description" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FormattedMessage id="settings.profile.label" />
              </label>
              <div className="flex gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={intl.formatMessage({ id: "settings.profile.placeholder" })}
                  className="bg-card/40 h-10 min-w-0"
                />
                <Button
                  onClick={handleSaveName}
                  className="h-10 px-4 font-semibold shrink-0"
                  disabled={isSaved || tempName === userName}
                >
                  {isSaved
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <Save className="w-4 h-4 mr-1.5" />
                  }
                  {isSaved
                    ? <FormattedMessage id="settings.profile.saved" />
                    : <FormattedMessage id="settings.profile.save" />
                  }
                </Button>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-border/40">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FormattedMessage id="settings.profile.userId" />
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="px-3 py-1 font-mono text-xs bg-secondary/50 border border-border/40 break-all">
                  {userId}
                </Badge>
                <span className="text-xs text-muted-foreground italic">
                  <FormattedMessage id="settings.profile.userIdHint" />
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* PREFERENCES CARD */}
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

          </CardContent>
        </Card>

        {/* ABOUT CARD */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate"><FormattedMessage id="settings.about.title" /></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            {[
              { label: <FormattedMessage id="settings.about.version" />, value: "v1.0.0-beta", isBadge: true },
              { label: <FormattedMessage id="settings.about.developer" />, value: "Mustafa Soner" },
              { label: <FormattedMessage id="settings.about.tech" />, value: "Tauri + Rust + React" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-border/40 last:border-0">
                <span className="text-sm text-muted-foreground truncate">{row.label}</span>
                {row.isBadge
                  ? <Badge variant="outline" className="shrink-0">{row.value}</Badge>
                  : <span className="text-sm font-medium shrink-0">{row.value}</span>
                }
              </div>
            ))}

            <div className="pt-2 flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                <Github className="w-3.5 h-3.5" />
                <FormattedMessage id="settings.about.github" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-8 text-red-400 border-red-400/20 hover:bg-red-400/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <FormattedMessage id="settings.about.reset" />
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default SettingsView;
