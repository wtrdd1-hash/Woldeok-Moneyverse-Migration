'use client';

import { useLocale } from '@/components/locale-provider';
import { lookupText, t } from '@/lib/i18n-dictionary';

export interface TranslatedTextProps {
  readonly korean?: string;
  readonly english?: string;
  readonly japanese?: string;
  readonly chinese?: string;
  readonly token?: string;
  readonly fallback?: string;
}

export function TranslatedText({
  korean = '',
  english = '',
  japanese,
  chinese,
  token,
  fallback,
}: TranslatedTextProps) {
  const { locale } = useLocale();

  if (token) {
    return <>{t(token, locale, fallback || korean || english)}</>;
  }

  // Explicit override props
  if (locale === 'ja' && japanese) return <>{japanese}</>;
  if (locale === 'zh' && chinese) return <>{chinese}</>;
  if (locale === 'en' && english) return <>{english}</>;
  if (locale === 'ko' && korean) return <>{korean}</>;

  // Automatic 4-language reverse dictionary lookup
  const sourceText = korean || english;
  const translated = lookupText(sourceText, locale, english || korean || fallback);
  return <>{translated}</>;
}

