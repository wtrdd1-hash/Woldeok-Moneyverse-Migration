'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/cn';

/**
 * ?붾뜒(?덂쓿, ?ъ쓽 ?? 癒몃땲踰꾩뒪 釉뚮옖???뚮뱶留덊겕.
 * 諛ㅽ븯?섏뿉 鍮쏅굹???곷”???⑷툑鍮???Moon)怨?媛??寃쎌젣 ?먯옣???곸쭠?섎뒗 ?щ낵.
 */
export function Brand({
  className,
  tone = 'default',
}: {
  readonly className?: string;
  readonly tone?: 'default' | 'muted';
}) {
  const { locale } = useLocale();
  return (
    <Link
      href="/"
      aria-label={locale === 'en' ? 'Woldeok Moneyverse home' : '월덕 머니버스 홈'}
      className={cn(
        'group shrink-0 inline-flex items-center gap-2 sm:gap-2.5 text-base sm:text-[19px] font-extrabold tracking-[-0.03em] sm:tracking-[-0.045em] transition-transform hover:scale-[1.02] whitespace-nowrap',
        tone === 'muted' ? 'text-foreground' : 'text-foreground',
        className,
      )}
    >
      <div className="relative flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-primary/30">
        <svg viewBox="0 0 24 24" fill="none" className="size-4.5 sm:size-5" aria-hidden="true">
          <path
            d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"
            fill="currentColor"
          />
          <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" opacity="0.8" />
        </svg>
      </div>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {locale === 'en' ? (
          <>
            <span>Woldeok</span> <strong className="font-black text-primary drop-shadow-sm">Moneyverse</strong>
          </>
        ) : (
          <>
            <span className="font-bold">월덕</span>{' '}
            <strong className="font-black text-primary drop-shadow-sm">
              머니버스
            </strong>
          </>
        )}
      </span>
    </Link>
  );
}
