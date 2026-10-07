'use client';

import Link from 'next/link';
import { Brand } from '@/components/brand';
import { useLocale } from '@/components/locale-provider';
import { useCurrency } from '@/components/currency-context';
import { localeLabel, type Locale } from '@/lib/locale';
import { LanguageSwitcher, DEFAULT_CURRENCY_FOR_LOCALE } from '@/components/language-switcher';
import { Globe2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * The standing footer with 4-language support, compliance disclaimer, and global language switcher.
 */
export function SiteFooter() {
  const { locale, setLocale } = useLocale();
  const { setCurrency } = useCurrency();
  const linkClass = 'inline-flex min-h-11 items-center px-2 hover:text-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  const footerAria = localeLabel(locale, '하단 메뉴', 'Footer menu', 'フッターメニュー', '页脚菜单');
  const searchLabel = localeLabel(locale, '통합 검색', 'Search', '統合検索', '综合搜索');
  const termsLabel = localeLabel(locale, '이용약관', 'Terms of Service', '利用規約', '服务条款');
  const privacyLabel = localeLabel(locale, '개인정보처리방침', 'Privacy Policy', 'プライバシーポリシー', '隐私政策');
  const statusLabel = localeLabel(locale, '서비스 상태', 'Service Status', 'サービス状態', '服务状态');
  const updatesLabel = localeLabel(locale, '운영 소식', 'Announcements', '運営ニュース', '官方公告');
  const seoAuditLabel = localeLabel(locale, 'SEO 수집 감사', 'SEO Audit', 'SEO監査', 'SEO审计');
  const disclaimer = localeLabel(
    locale,
    '모든 화폐와 보상은 게임 안에서만 쓰는 가상 데이터입니다.',
    'All currency and rewards are virtual data used only in the game.',
    'すべての通貨と報酬はゲーム内でのみ使用される仮想データです。',
    '所有货币与奖励均为仅在游戏内使用的虚拟数据。',
  );

  const handleSelectLang = (newLocale: Locale) => {
    setLocale(newLocale);
    const suggested = DEFAULT_CURRENCY_FOR_LOCALE[newLocale];
    if (suggested) {
      setCurrency(suggested);
    }
  };

  const languages: Array<{ code: Locale; label: string }> = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '简体中文' },
  ];

  return (
    <footer className="moneyverse-site-footer mt-16 text-muted-foreground sm:mt-24 pb-24 lg:pb-8 border-t border-border/60 bg-muted/10 w-full max-w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 sm:px-6 lg:px-8">
        {/* 모바일 & 데스크톱 4개 국어 퀵 선택 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Globe2 className="size-4 text-amber-500" />
            <span>{localeLabel(locale, '글로벌 언어 설정', 'Global Language', 'グローバル言語設定', '全球语言设置')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectLang(item.code)}
                className={cn(
                  'min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer',
                  locale === item.code
                    ? 'bg-amber-500 text-amber-950 font-black shadow-xs'
                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-b border-border/70 py-7 sm:flex-row sm:items-center">
          <Brand />
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label={footerAria} className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold sm:gap-x-3">
              <Link href="/search" className={linkClass}>
                {searchLabel}
              </Link>
              <Link href="/terms" className={linkClass}>
                {termsLabel}
              </Link>
              <Link href="/privacy" className={linkClass}>
                {privacyLabel}
              </Link>
              <Link href="/status" className={linkClass}>
                {statusLabel}
              </Link>
              <Link href="/announcements" className={linkClass}>
                {updatesLabel}
              </Link>
              <Link href="/admin/seo-audit" className={cn(linkClass, 'text-emerald-500 hover:text-emerald-400')}>
                {seoAuditLabel}
              </Link>
            </nav>
            <div className="pl-2 border-l border-border/60">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-start sm:items-center gap-3 py-5 pb-7 text-[10px] sm:flex-row w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 max-w-full min-w-0">
            <p className="break-words">{disclaimer}</p>
            <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
              <ShieldCheck className="w-3 h-3" />
              IndexNow 100% Active
            </span>
          </div>
          <p className="shrink-0">© 2026 Woldeok Moneyverse</p>
        </div>
      </div>
    </footer>
  );
}
