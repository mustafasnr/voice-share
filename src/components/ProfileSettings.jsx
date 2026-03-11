import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { useIntl, FormattedMessage } from "react-intl";
import { User, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export function ProfileSettings() {
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
  );
}

export default ProfileSettings;
