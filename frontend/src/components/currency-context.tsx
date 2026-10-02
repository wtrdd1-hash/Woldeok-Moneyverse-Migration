'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  type Currency,
  getLocaleDefaultCurrency,
  isCurrency,
} from '@/lib/currency';
import { useLocale } from './locale-provider';

interface CurrencyContextValue {
  readonly currency: Currency;
  readonly setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
});

export function CurrencyProvider({
  children,
  initialCurrency,
}: {
  readonly children: ReactNode;
  readonly initialCurrency?: Currency | undefined;
}) {
  const { locale } = useLocale();
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (initialCurrency && isCurrency(initialCurrency)) return initialCurrency;
    return getLocaleDefaultCurrency(locale);
  });

  // Keep currency in sync with locale if user hasn't explicitly overridden it
  useEffect(() => {
    const defaultForLocale = getLocaleDefaultCurrency(locale);
    // Check if there is an explicit cookie
    const cookies = document.cookie.split(';');
    const saved = cookies
      .find((c) => c.trim().startsWith(`${CURRENCY_COOKIE}=`))
      ?.split('=')[1];

    if (saved && isCurrency(saved)) {
      setCurrencyState(saved);
    } else {
      setCurrencyState(defaultForLocale);
    }
  }, [locale]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    // Persist to cookie (1 year expiry)
    document.cookie = `${CURRENCY_COOKIE}=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
