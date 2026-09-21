'use client';

import { Check, Globe2 } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
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

const OPTIONS: Array<{ value: Locale; label: string; shortLabel: string }> = [
  { value: 'ko', label: '한국어 (Korean)', shortLabel: 'KO' },
  { value: 'en', label: 'English (US)', shortLabel: 'EN' },
  { value: 'ja', label: '日本語 (Japanese)', shortLabel: 'JA' },
  { value: 'zh', label: '简体中文 (Chinese)', shortLabel: 'ZH' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const titleMap: Record<Locale, string> = {
    ko: '언어 선택',
    en: 'Select Language',
    ja: '言語選択',
    zh: '选择语言',
  };

  const ariaMap: Record<Locale, string> = {
    ko: '언어 변경',
    en: 'Change language',
    ja: '言語を変更する',
    zh: '更改语言',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 rounded-full px-3 text-xs font-extrabold text-muted-foreground transition-transform active:scale-[0.98]"
          aria-label={ariaMap[locale] || 'Change language'}
        >
          <Globe2 className="size-4 text-amber-500" />
          <span aria-hidden>{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-[16px] p-2 shadow-raised border border-border/40">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          {titleMap[locale] || 'Select Language'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setLocale(option.value)}
            className="min-h-11 rounded-[10px] px-3 font-medium transition-colors cursor-pointer"
          >
            <span className="grid size-7 place-items-center rounded-full bg-secondary text-[10px] font-black text-foreground">
              {option.shortLabel}
            </span>
            <span className="ml-2">{option.label}</span>
            {locale === option.value && <Check className="ml-auto size-4 text-amber-500 font-bold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
