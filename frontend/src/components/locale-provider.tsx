'use client';

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  DETECTED_LOCALE_COOKIE,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
  detectBrowserLocale,
} from '@/lib/locale';

export type { Locale };

interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
});

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = name + '=';
  const entry = document.cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  readonly children: React.ReactNode;
  readonly initialLocale?: Locale;
}) {
  const router = useSafeRouter();
  const [, startTransition] = useTransition();
  const [locale, updateLocale] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  useEffect(() => {
    if (initialLocale) {
      updateLocale(initialLocale);
      document.documentElement.lang = initialLocale;
      document.documentElement.setAttribute('data-locale', initialLocale);
      return;
    }

    const explicit = readCookie(LOCALE_COOKIE);
    const detected = readCookie(DETECTED_LOCALE_COOKIE);
    const resolved = isLocale(explicit)
      ? explicit
      : isLocale(detected)
      ? detected
      : detectBrowserLocale();

    updateLocale(resolved);
    document.documentElement.lang = resolved;
    document.documentElement.setAttribute('data-locale', resolved);
  }, [initialLocale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale(nextLocale) {
      document.cookie = LOCALE_COOKIE + '=' + nextLocale + '; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
      document.documentElement.lang = nextLocale;
      document.documentElement.setAttribute('data-locale', nextLocale);
      updateLocale(nextLocale);
      startTransition(() => {
        router?.refresh();
      });
    },
  }), [locale, router]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
