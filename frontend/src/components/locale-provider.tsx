'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  DETECTED_LOCALE_COOKIE,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
} from '@/lib/locale';

interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
});

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const entry = document.cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

export function LocaleProvider({ children }: { readonly children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const explicit = readCookie(LOCALE_COOKIE);
    const detected = readCookie(DETECTED_LOCALE_COOKIE);
    const resolved = isLocale(explicit) ? explicit : isLocale(detected) ? detected : DEFAULT_LOCALE;
    updateLocale(resolved);
    document.documentElement.lang = resolved;
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale(nextLocale) {
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
      document.documentElement.lang = nextLocale;
      updateLocale(nextLocale);
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
