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
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[13px] shadow-[0_4px_16px_rgba(168,85,247,0.35)] ring-1 ring-purple-500/30 sm:size-10">
        <img
          src="/images/woldeok-official-icon.png"
          alt="Woldeok Official Logo"
          width={40}
          height={40}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs min-[400px]:text-sm sm:text-base font-extrabold">
        {locale === 'en' ? (
          <>
            <span>Woldeok</span> <strong className="font-black text-primary drop-shadow-sm">Moneyverse</strong>
          </>
        ) : locale === 'ja' ? (
          <>
            <span>ウォルドク</span> <strong className="font-black text-primary drop-shadow-sm">マネーバース</strong>
          </>
        ) : locale === 'zh' ? (
          <>
            <span>月德</span> <strong className="font-black text-primary drop-shadow-sm">Moneyverse</strong>
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
