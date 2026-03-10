import React, { useEffect } from "react";
import { IntlProvider, useIntl } from "react-intl";
import { useStore } from "../store/useStore";
import { getMessages } from "../lib/i18n";
import { invoke } from "@tauri-apps/api/core";

function TrayManager() {
  const intl = useIntl();
  const locale = useStore((state) => state.locale);

  useEffect(() => {
    const quitText = intl.formatMessage({ id: "listen.stop" }); // Reusing a 'Stop' or 'Quit' equivalent, or I should add a specific one.
    // Let's use a better one if possible, but for now listen.stop is "Bağlantıyı Kes" or similar.
    // Better to add a dedicated one or use something general like 'Kapat'.
    // The user has 'listen.stop' which is 'Bağlantıyı Kes' and 'broadcast.status.stop' which is 'Yayını Durdur'.
    // I will use a custom ID in locales.
    const text = intl.formatMessage({ id: "settings.about.quit", defaultMessage: "Kapat" });
    invoke("update_tray_menu", { quitText: text }).catch(console.error);
  }, [locale, intl]);

  return null;
}

export function LanguageProvider({ children }) {
  const locale = useStore((state) => state.locale);
  const messages = getMessages(locale);

  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      <TrayManager />
      {children}
    </IntlProvider>
  );
}
