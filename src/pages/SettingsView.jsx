import React from "react";
import { FormattedMessage } from "react-intl";
import ProfileSettings from "../components/ProfileSettings";
import PreferenceSettings from "../components/PreferenceSettings";
import AboutSettings from "../components/AboutSettings";

export function SettingsView() {
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
        <ProfileSettings />

        {/* PREFERENCES CARD */}
        <PreferenceSettings />

        {/* ABOUT CARD */}
        <AboutSettings />
      </div>
    </div>
  );
}

export default SettingsView;
