'use client';

import Link from 'next/link';
import { Brand } from '@/components/brand';
import { useLocale } from '@/components/locale-provider';

/**
 * The standing footer, in the original's shape: the wordmark and the policy
 * links on a darker band of paper, then the disclaimer.
 *
 * The disclaimer's wording is the product's, not this rewrite's — WLD is game
 * data and the service offers no exchange for money — and it appeared on
 * every original view.
 */
export function SiteFooter() {
  const { locale } = useLocale();
  const en = locale === 'en';
  const linkClass = 'inline-flex min-h-11 items-center px-2 hover:text-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  return (
    <footer className="moneyverse-site-footer mt-16 text-muted-foreground sm:mt-24">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border/70 py-9 sm:flex-row sm:items-center">
          <Brand />
          <nav aria-label={en ? 'Footer menu' : '하단 메뉴'} className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold sm:gap-x-3">
            <Link href="/search" className={linkClass}>
              {en ? 'Search' : '통합 검색'}
            </Link>
            <Link href="/terms" className={linkClass}>
              {en ? 'Terms' : '이용약관'}
            </Link>
            <Link href="/privacy" className={linkClass}>
              {en ? 'Privacy' : '개인정보처리방침'}
            </Link>
            <Link href="/status" className={linkClass}>
              {en ? 'Service status' : '서비스 상태'}
            </Link>
            <Link href="/announcements" className={linkClass}>
              {en ? 'Updates' : '운영 소식'}
            </Link>
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-2 py-5 pb-7 text-[10px] sm:flex-row">
          <p>{en ? 'All currency and rewards are virtual data used only in the game.' : '모든 화폐와 보상은 게임 안에서만 쓰는 가상 데이터입니다.'}</p>
          <p>© 2026 Woldeok Moneyverse</p>
        </div>
      </div>
    </footer>
  );
}
