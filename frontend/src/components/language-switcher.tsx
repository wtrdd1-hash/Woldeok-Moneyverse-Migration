'use client';

import { Check, Coins, Globe2 } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { useCurrency } from '@/components/currency-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale } from '@/lib/locale';
import { ALL_CURRENCIES, CURRENCY_CONFIG, type Currency } from '@/lib/currency';

export const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string; shortLabel: string }> = [
  { value: 'ko', label: '한국어 (Korean)', shortLabel: 'KO' },
  { value: 'en', label: 'English (US)', shortLabel: 'EN' },
  { value: 'ja', label: '日本語 (Japanese)', shortLabel: 'JA' },
  { value: 'zh', label: '简体中文 (Chinese)', shortLabel: 'ZH' },
];

export const DEFAULT_CURRENCY_FOR_LOCALE: Record<Locale, Currency> = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
  zh: 'CNY',
};

export function LanguageSwitcher({
  className = '',
  compact = false,
}: {
  readonly className?: string;
  readonly compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();
  const { currency, setCurrency } = useCurrency();

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    const suggestedCurrency = DEFAULT_CURRENCY_FOR_LOCALE[newLocale];
    if (suggestedCurrency) {
      setCurrency(suggestedCurrency);
    }
  };

  const titleMap: Record<Locale, string> = {
    ko: '언어 및 통화 설정',
    en: 'Language & Currency',
    ja: '言語・通貨設定',
    zh: '语言与货币设置',
  };

  const langLabelMap: Record<Locale, string> = {
    ko: '언어 (Language)',
    en: 'Language',
    ja: '言語 (Language)',
    zh: '语言 (Language)',
  };

  const currencyLabelMap: Record<Locale, string> = {
    ko: '환산 통화 (Currency)',
    en: 'Display Currency',
    ja: '表示通貨 (Currency)',
    zh: '显示货币 (Currency)',
  };

  const ariaMap: Record<Locale, string> = {
    ko: '언어 및 통화 변경',
    en: 'Change language and currency',
    ja: '言語と通貨を変更する',
    zh: '更改语言与货币',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-10 sm:h-11 min-h-[40px] items-center gap-1 sm:gap-1.5 rounded-xl px-2 sm:px-3 text-xs font-black text-foreground border-border/70 hover:bg-secondary/80 transition-all active:scale-[0.98] shrink-0 outline-none ${className}`}
          aria-label={ariaMap[locale] || 'Change language and currency'}
        >
          <Globe2 className="size-4 text-amber-500 shrink-0" />
          <span aria-hidden className="font-mono font-bold tracking-tight">
            {locale.toUpperCase()}
          </span>
          {!compact && (
            <span className="hidden min-[480px]:inline text-[10px] text-muted-foreground font-mono">
              ({CURRENCY_CONFIG[currency]?.symbol || '₩'})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(20rem,calc(100vw-1.5rem))] max-w-[320px] rounded-2xl p-2 shadow-2xl border border-border/80 bg-popover/95 backdrop-blur-xl max-h-[85vh] overflow-y-auto z-50"
      >
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-bold text-foreground">
          {titleMap[locale] || 'Language & Currency'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 1. Language Selection */}
        <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          {langLabelMap[locale] || 'Language'}
        </div>
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handleLanguageChange(option.value)}
            className="min-h-11 rounded-xl px-3 font-medium transition-colors cursor-pointer"
          >
            <span className="grid size-6 place-items-center rounded-full bg-secondary text-[10px] font-black text-foreground">
              {option.shortLabel}
            </span>
            <span className="ml-2 text-xs font-semibold">{option.label}</span>
            {locale === option.value && <Check className="ml-auto size-4 text-amber-500 font-bold" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1.5" />

        {/* 2. Currency Selection */}
        <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          <Coins className="size-3.5 text-amber-500" />
          <span>{currencyLabelMap[locale] || 'Display Currency'}</span>
        </div>
        {ALL_CURRENCIES.map((code: Currency) => {
          const meta = CURRENCY_CONFIG[code];
          const isSelected = currency === code;
          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => setCurrency(code)}
              className="min-h-11 rounded-xl px-3 font-medium transition-colors cursor-pointer"
            >
              <span className="grid size-6 place-items-center rounded-md bg-amber-500/10 font-mono text-xs font-black text-amber-500">
                {meta.symbol}
              </span>
              <span className="ml-2 text-xs font-medium">{meta.name[locale] || meta.name.ko}</span>
              {isSelected && <Check className="ml-auto size-4 text-amber-500 font-bold" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
