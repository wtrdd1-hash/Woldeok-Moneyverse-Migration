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
  return (
    <footer className="mt-20 bg-paper-dark text-muted-foreground">
      <div className="mx-auto w-full max-w-[1180px] px-6">
        <div className="flex flex-col items-start justify-between gap-6 border-b py-9 sm:flex-row sm:items-center">
          <Brand />
          <nav aria-label={en ? 'Footer menu' : '하단 메뉴'} className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold">
            <Link href="/terms" className="hover:text-forest-soft">
              {en ? 'Terms' : '이용약관'}
            </Link>
            <Link href="/privacy" className="hover:text-forest-soft">
              {en ? 'Privacy' : '개인정보처리방침'}
            </Link>
            <Link href="/status" className="hover:text-forest-soft">
              {en ? 'Service status' : '서비스 상태'}
            </Link>
            <Link href="/announcements" className="hover:text-forest-soft">
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
