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

const OPTIONS = [
  { value: 'ko', label: '한국어', shortLabel: 'KO' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
] as const;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const title = locale === 'en' ? 'Language' : '언어';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 rounded-full px-3 text-xs font-extrabold text-muted-foreground"
          aria-label={locale === 'en' ? 'Change language' : '언어 변경'}
        >
          <Globe2 className="size-4" />
          <span aria-hidden>{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52 rounded-[16px] p-2 shadow-raised">
        <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setLocale(option.value)}
            className="min-h-11 rounded-[10px] px-3 font-bold"
          >
            <span className="grid size-7 place-items-center rounded-full bg-secondary text-[10px] font-black">
              {option.shortLabel}
            </span>
            <span>{option.label}</span>
            {locale === option.value && <Check className="ml-auto size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
