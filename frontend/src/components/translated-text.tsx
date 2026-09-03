'use client';

import { useLocale } from '@/components/locale-provider';

export function TranslatedText({ korean, english }: { readonly korean: string; readonly english: string }) {
  const { locale } = useLocale();
  return <>{locale === 'en' ? english : korean}</>;
}
