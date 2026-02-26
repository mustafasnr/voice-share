import React from "react";
import { IntlProvider } from "react-intl";
import { useStore } from "../store/useStore";
import { getMessages } from "../lib/i18n";

export function LanguageProvider({ children }) {
  const locale = useStore((state) => state.locale);
  const messages = getMessages(locale);

  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}
