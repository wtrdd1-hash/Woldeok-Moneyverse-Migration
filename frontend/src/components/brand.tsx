'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/cn';

/**
 * 월덕(月德, 달의 덕) 머니버스 브랜드 워드마크.
 * 밤하늘에 빛나는 영롱한 황금빛 달(Moon)과 가상 경제 성장을 상징하는 심볼.
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
        'group shrink-0 inline-flex min-h-11 items-center gap-1.5 text-base font-extrabold tracking-[-0.035em] transition-transform hover:scale-[1.02] whitespace-nowrap sm:gap-2.5 sm:text-[19px]',
        tone === 'muted' ? 'text-foreground' : 'text-foreground',
        className,
      )}
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[13px] bg-primary text-primary-foreground shadow-[0_10px_28px_rgba(248,198,92,0.2)] ring-1 ring-primary/40 sm:size-10">
        <svg viewBox="0 0 24 24" fill="none" className="size-4.5 sm:size-5" aria-hidden="true">
          <path
            d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"
            fill="currentColor"
          />
          <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" opacity="0.8" />
        </svg>
      </div>
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs min-[400px]:text-sm sm:text-base font-extrabold">
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
