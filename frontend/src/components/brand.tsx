'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/cn';

/**
 * 월덕(月德, 달의 덕) 머니버스 브랜드 워드마크.
 * 밤하늘에 빛나는 영롱한 황금빛 달(Moon)과 가상 경제 원장을 상징하는 심볼.
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
        'group inline-flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-0.045em] transition-transform hover:scale-[1.02]',
        tone === 'muted' ? 'text-foreground' : 'text-foreground',
        className,
      )}
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30">
        <svg viewBox="0 0 24 24" fill="none" className="size-5 text-slate-950" aria-hidden="true">
          <path
            d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"
            fill="currentColor"
          />
          <circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" />
        </svg>
      </div>
      <span className="flex items-center gap-1">
        {locale === 'en' ? (
          <>
            Woldeok <strong className="font-black text-amber-500 drop-shadow-sm">Moneyverse</strong>
          </>
        ) : (
          <>
            <span className="font-bold">월덕</span>{' '}
            <strong className="font-black bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
              머니버스
            </strong>
          </>
        )}
      </span>
    </Link>
  );
}