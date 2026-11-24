import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Calculator, Landmark, Megaphone, ScrollText, ShoppingBag, TrendingUp } from 'lucide-react';
import { GuestQuickstart } from '@/components/guest-quickstart';
import { PageHeader } from '@/components/page-header';
import { StatRow } from '@/components/d180/primitives';
import { WalletGlance } from '@/components/wallet-glance';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { GuestOnly, MemberOnly } from '@/components/g1/viewer-gate';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { getStockName } from '@/lib/i18n-dictionary';
import { changePercent, groupDigits } from '@/lib/money';
import { canonicalUrl } from '@/lib/seo';

/**
 * G1 "Guild Hall" home (docs/design/game-ui-v2026.11.24.G1/previews/home.png).
 *
 * Static with a one-minute revalidate so crawlers get finished HTML; nothing
 * per-member is read here. The balance arrives after hydration through
 * WalletGlance and the HUD. Every figure on this page comes from a public API
 * response; when one is missing the panel says so instead of drawing samples.
 */
export const revalidate = 60;

interface StockItem {
  readonly id?: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly publishedAt?: string | null;
  readonly isPinned?: boolean;
}

const HOME_H1_BY_LOCALE = {
  ko: '월덕 머니버스 — 가상경제 게임과 금융 계산기',
  en: 'Woldeok Moneyverse — Virtual Economy Game and Finance Tools',
  ja: 'ウォルドク・マネーバース — 仮想経済ゲームと金融計算ツール',
  zh: '月德 Moneyverse — 虚拟经济游戏与金融计算工具',
  vi: 'Woldeok Moneyverse — Trò chơi kinh tế ảo và công cụ tài chính',
} as const;

const HOME_META_BY_LOCALE = {
  en: {
    title: 'Woldeok Moneyverse — Virtual Economy Game and Finance Tools',
    description: 'A fictional community economy: virtual-company stock simulation, a guild-style quest board and finance calculators. WLD is game currency, not real money.',
    canonical: '/en',
  },
  ko: {
    title: '월덕 머니버스 — 가상경제 게임과 금융 계산기',
    description: '커뮤니티 가상경제에서 가상 기업 주식, 퀘스트, 금융 계산기를 체험하세요. WLD는 실제 돈이 아닌 게임 재화입니다.',
    canonical: '/',
  },
  ja: {
    title: 'ウォルドク・マネーバース — 仮想経済ゲームと金融計算ツール',
    description: '架空のコミュニティ経済で仮想企業の株式シミュレーションと金融計算を体験。WLDはゲーム内通貨です。',
    canonical: '/ja',
  },
  zh: {
    title: '月德 Moneyverse — 虚拟经济游戏与金融计算工具',
    description: '在虚构的社区经济中体验虚拟公司股票模拟与金融计算。WLD 是游戏货币，不是真实货币。',
    canonical: '/zh',
  },
  vi: {
    title: 'Woldeok Moneyverse — Trò chơi kinh tế ảo và công cụ tài chính',
    description: 'Kinh tế cộng đồng hư cấu: mô phỏng cổ phiếu công ty ảo và máy tính tài chính. WLD là tiền trong trò chơi.',
    canonical: '/vi',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = HOME_META_BY_LOCALE[locale] ?? HOME_META_BY_LOCALE.en;
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/'),
        'en-US': canonicalUrl('/en'),
        'ja-JP': canonicalUrl('/ja'),
        'zh-CN': canonicalUrl('/zh'),
      },
    },
  };
}

/** Basis points of the day's move, as a BigInt so prices are never Number()ed. */
function moveBasisPoints(stock: StockItem): bigint | null {
  if (!/^\d+$/.test(stock.current_price) || !/^\d+$/.test(stock.day_open_price)) return null;
  const open = BigInt(stock.day_open_price);
  if (open === 0n) return null;
  return ((BigInt(stock.current_price) - open) * 10_000n) / open;
}

const QUICK_LINKS = [
  { href: '/quests', label: '퀘스트 게시판', note: '오늘 받을 수 있는 퀘스트와 보상', icon: ScrollText },
  { href: '/stocks', label: '거래소', note: '가상 기업 호가와 체결', icon: TrendingUp },
  { href: '/work', label: '직업 의뢰', note: '일하고 원장에 기록되는 보상 받기', icon: Briefcase },
  { href: '/bank', label: '은행 금고', note: '예금 계약과 대출', icon: Landmark },
  { href: '/shop', label: '상점', note: '프레임과 꾸미기 아이템', icon: ShoppingBag },
  { href: '/tools/compound-calculator', label: '복리 계산기', note: '원금과 이율로 미래 금액 계산', icon: Calculator },
  { href: '/tools/stock-calculator', label: '주식 수익률 계산기', note: '매수가와 매도가로 손익 계산', icon: Calculator },
] as const;

function noticeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Fixed zone so server and browser render the same text.
  return date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' });
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const [marketData, notices, macro] = await Promise.all([
    apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks'),
    apiOrNull<{ announcements: Announcement[] }>('/api/v1/announcements'),
    apiOrNull<{ baseInterestRatePct?: unknown }>('/api/v1/economy/macro-pulse'),
  ]);

  const priced = (marketData?.stocks ?? [])
    .map((stock) => ({ stock, bp: moveBasisPoints(stock) }))
    .filter((row): row is { stock: StockItem; bp: bigint } => row.bp !== null);
  const movers = [...priced]
    .sort((a, b) => {
      const left = a.bp < 0n ? -a.bp : a.bp;
      const right = b.bp < 0n ? -b.bp : b.bp;
      return left === right ? 0 : left > right ? -1 : 1;
    })
    .slice(0, 5);
  const rising = priced.filter((row) => row.bp > 0n).length;
  const falling = priced.filter((row) => row.bp < 0n).length;
  const baseRate =
    typeof macro?.baseInterestRatePct === 'number' && Number.isFinite(macro.baseInterestRatePct)
      ? `${macro.baseInterestRatePct.toFixed(2)}%`
      : null;

  const announcements = (notices?.announcements ?? []).slice(0, 4);
  const panel = 'min-w-0 rounded-lg border border-[var(--g1-line)] bg-[var(--g1-plum)]';
  const panelHead = 'flex min-h-11 items-center justify-between gap-3';
  const link = 'inline-flex min-h-11 items-center text-xs text-[var(--g1-violet)] hover:underline';

  return (
    <div data-page="home" className="flex flex-col gap-5">
      <h1 className="sr-only">
        {HOME_H1_BY_LOCALE[locale] ?? HOME_H1_BY_LOCALE.en}
      </h1>

      {/* DESIGN180 page head (no hero banner: guild-home QA GH-01). The SEO h1
          above stays; this visible title is the page name. */}
      <PageHeader
        title="길드 홀"
        titleAs="h2"
        action={
          <>
            <Link href="/quests" prefetch={false} className="inline-flex min-h-11 items-center rounded-md border border-[var(--g1-line)] px-4 text-sm font-semibold text-[var(--g1-ink)] hover:border-[var(--g1-violet)]">퀘스트 보기</Link>
            <MemberOnly fallback={<Link href="/login" prefetch={false} className="g1-cta">로그인</Link>}>
              <Link href="/wallet" prefetch={false} className="g1-cta">지갑 열기</Link>
            </MemberOnly>
          </>
        }
      >
        오늘의 월덕 시장과 길드 소식입니다.
      </PageHeader>

      {/* QA GH-03: guests keep the no-signup entry; members never see it. */}
      <GuestOnly>
        <GuestQuickstart locale={locale} />
      </GuestOnly>

      <section aria-labelledby="hero-balance-heading">
        <h2 id="hero-balance-heading" className="sr-only">오늘의 요약</h2>
        <StatRow
          label="오늘의 요약"
          items={[
            {
              label: '사용 가능 잔액',
              // QA GH-04: WalletGlance keeps its signed-out / unreadable / balance states.
              value: <MemberOnly fallback={<Link href="/login" prefetch={false} className="text-base font-medium text-[var(--g1-violet)] hover:underline">로그인 후 표시</Link>}><WalletGlance /></MemberOnly>,
              note: '원장 기준',
            },
            {
              label: '오늘 시장',
              value: priced.length === 0 ? null : (
                <span>
                  <span className="text-[var(--g1-ember)]">상승 {rising}</span>
                  <span className="text-[var(--g1-faint)]"> / </span>
                  <span className="text-[var(--g1-rare-rare)]">하락 {falling}</span>
                </span>
              ),
              note: '개장가 대비 종목 수',
            },
            { label: '기준금리', value: baseRate, note: '중앙은행 발표' },
          ]}
        />
      </section>

      <MemberOnly>
        <div className="max-w-xs">
          <P2PTransferModal triggerText="WLD 보내기" />
        </div>
      </MemberOnly>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(270px,1fr)]">
        <section aria-labelledby="home-market-heading" className={`${panel} overflow-hidden`}>
          <div className={`${panelHead} px-[22px] pt-5`}>
            <h2 id="home-market-heading" className="text-lg font-bold text-[var(--g1-ink)]">오늘 크게 움직인 종목</h2>
            <Link href="/stocks" prefetch={false} className={link}>거래소</Link>
          </div>
          {movers.length === 0 ? (
            <p className="px-[22px] py-6 text-sm text-[var(--g1-muted)]">시세 자료를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>
          ) : (
            <table className="mt-3 w-full text-[13px]">
              <thead>
                <tr className="bg-[var(--g1-night-2)] text-left text-xs text-[var(--g1-muted)]">
                  <th className="px-[22px] py-3 font-medium">종목</th>
                  <th className="px-4 py-3 text-right font-medium">현재가</th>
                  <th className="px-[22px] py-3 text-right font-medium">오늘 등락</th>
                </tr>
              </thead>
              <tbody>
                {movers.map(({ stock, bp }) => {
                  const pct = changePercent(stock.current_price, stock.day_open_price);
                  const tone = bp > 0n ? 'text-[var(--g1-ember)]' : bp < 0n ? 'text-[var(--g1-rare-rare)]' : 'text-[var(--g1-muted)]';
                  return (
                    <tr key={stock.symbol} className="border-t border-[var(--g1-line)]">
                      <td className="px-[22px] py-2">
                        <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`} prefetch={false} className="block min-h-11 py-1 hover:text-[var(--g1-violet)]">
                          <span className="block font-semibold text-[var(--g1-ink)]">{getStockName(stock.symbol, locale, stock.name)}</span>
                          <span className="block text-[11px] text-[var(--g1-muted)]">{stock.symbol}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums">{groupDigits(stock.current_price)}</td>
                      <td className={`px-[22px] py-2 text-right font-semibold tabular-nums ${tone}`}>{pct === null ? '확인 불가' : `${pct}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <div className="grid min-w-0 gap-5">
          {/* QA GH-05: real titles with dates, height follows the list. */}
          <section aria-labelledby="home-notices-heading" className={`${panel} px-[22px] py-5`}>
            <div className={panelHead}>
              <h2 id="home-notices-heading" className="flex items-center gap-2 text-lg font-bold text-[var(--g1-ink)]">
                <Megaphone className="size-4 text-[var(--g1-muted)]" aria-hidden />
                길드 공지
              </h2>
              <Link href="/announcements" prefetch={false} className={link}>전체 보기</Link>
            </div>
            {announcements.length === 0 ? (
              <p className="py-3 text-sm text-[var(--g1-muted)]">지금 게시된 공지가 없습니다.</p>
            ) : (
              <ul className="divide-y divide-[var(--g1-line)]">
                {announcements.map((notice) => (
                  <li key={notice.announcementId}>
                    <Link
                      href={`/announcements/${encodeURIComponent(notice.announcementId)}`}
                      prefetch={false}
                      className="flex min-h-11 items-center justify-between gap-3 py-2 text-[13px] text-[var(--g1-body)] hover:text-[var(--g1-ink)]"
                    >
                      <span className="line-clamp-1">{notice.isPinned ? '[고정] ' : ''}{notice.title}</span>
                      {noticeDate(notice.publishedAt) && (
                        <span className="shrink-0 text-[11px] tabular-nums text-[var(--g1-muted)]">{noticeDate(notice.publishedAt)}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="home-routes-heading" className={`${panel} px-[22px] py-5`}>
            <h2 id="home-routes-heading" className="mb-1 text-lg font-bold text-[var(--g1-ink)]">다음 할 일</h2>
            <ul className="divide-y divide-[var(--g1-line)]">
              {QUICK_LINKS.map(({ href, label, note, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} prefetch={false} className="group flex min-h-11 items-center gap-3 py-3">
                    <span className="grid size-[38px] shrink-0 place-items-center rounded-lg bg-[var(--g1-plum-2)] text-[var(--g1-violet)]">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--g1-ink)] group-hover:text-[var(--g1-violet)]">{label}</span>
                      <span className="block text-xs text-[var(--g1-muted)]">{note}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Policy: ads only after the page's primary content on public routes. */}
      <PublicAdvertisement variant="display" />
    </div>
  );
}
