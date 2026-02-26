import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  User,
  Info,
  Save,
  CheckCircle2,
  Trash2,
  Github
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export function SettingsView() {
  const {
    userName,
    setUserName,
    userId,
    // Future toggles can go here
  } = useStore();

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
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground text-sm">
          Uygulama tercihlerini ve profilini yönet
        </p>
      </div>

      <div className="space-y-6">
        {/* PROFILE CARD */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil
            </CardTitle>
            <CardDescription>Ağdaki diğer kullanıcılar seni bu bilgilerle görecek.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Görünen İsim
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="İisminizi girin..."
                  className="bg-card/40 h-11"
                />
                <Button
                  onClick={handleSaveName}
                  className="h-11 px-6 font-semibold shrink-0"
                  disabled={isSaved || tempName === userName}
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaved ? "Kaydedildi" : "Kaydet"}
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Benzersiz Kimlik (User ID)
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1.5 font-mono text-xs bg-secondary/50 border border-border/40">
                  {userId}
                </Badge>
                <span className="text-[10px] text-muted-foreground italic">
                  *Bu kimlik sistem tarafından otomatik atanır.
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* APPLICATION INFO */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Hakkında
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-sm">Versiyon</span>
              <Badge variant="outline">v1.0.0-beta</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-sm">Geliştirici</span>
              <span className="text-sm font-medium">Mustafa Soner</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Teknoloji</span>
              <span className="text-sm font-medium">Tauri + Rust + React</span>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Github className="w-4 h-4" />
                GitHub Projesi
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs text-red-400 border-red-400/20 hover:bg-red-400/10">
                <Trash2 className="w-4 h-4" />
                Verileri Sıfırla
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsView;
