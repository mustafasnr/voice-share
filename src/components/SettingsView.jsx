import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { useIntl, FormattedMessage } from "react-intl";
import {
  User,
  Info,
  Save,
  CheckCircle2,
  Trash2,
  Github,
  Globe
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeSelector } from "./ThemeSelector";

export function SettingsView() {
  const {
    userName,
    setUserName,
    userId,
  } = useStore();
  const intl = useIntl();

  const [tempName, setTempName] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveName = () => {
    setUserName(tempName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 w-full max-w-3xl mx-auto pb-10 px-1">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          <FormattedMessage id="settings.title" />
        </h2>
        <p className="text-muted-foreground text-sm">
          <FormattedMessage id="settings.subtitle" />
        </p>
      </div>

      <div className="space-y-6">
        {/* PROFILE CARD */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <FormattedMessage id="settings.profile.title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage id="settings.profile.description" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                <FormattedMessage id="settings.profile.label" />
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={intl.formatMessage({ id: "settings.profile.placeholder" })}
                  className="bg-card/40 h-11"
                />
                <Button
                  onClick={handleSaveName}
                  className="h-11 px-6 font-semibold shrink-0"
                  disabled={isSaved || tempName === userName}
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaved ? <FormattedMessage id="settings.profile.saved" /> : <FormattedMessage id="settings.profile.save" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                <FormattedMessage id="settings.profile.userId" />
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1.5 font-mono text-xs bg-secondary/50 border border-border/40">
                  {userId}
                </Badge>
                <span className="text-xs text-muted-foreground italic">
                  <FormattedMessage id="settings.profile.userIdHint" />
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* LANGUAGE SETTINGS */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <FormattedMessage id="settings.preferences.title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage id="settings.preferences.description" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {/* LANGUAGE SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  <FormattedMessage id="settings.preferences.language" />
                </label>
                <div className="w-full">
                  <LanguageSelector />
                </div>
              </div>

              {/* THEME SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  <FormattedMessage id="settings.preferences.theme" />
                </label>
                <div className="w-full">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* APPLICATION INFO */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <FormattedMessage id="settings.about.title" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-sm"><FormattedMessage id="settings.about.version" /></span>
              <Badge variant="outline">v1.0.0-beta</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-sm"><FormattedMessage id="settings.about.developer" /></span>
              <span className="text-sm font-medium">Mustafa Soner</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground"><FormattedMessage id="settings.about.tech" /></span>
              <span className="text-sm font-medium">Tauri + Rust + React</span>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Github className="w-4 h-4" />
                <FormattedMessage id="settings.about.github" />
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs text-red-400 border-red-400/20 hover:bg-red-400/10">
                <Trash2 className="w-4 h-4" />
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
