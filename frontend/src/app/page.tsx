import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Calculator, Landmark, Megaphone, ScrollText, ShoppingBag, TrendingUp } from 'lucide-react';
import { GuestQuickstart } from '@/components/guest-quickstart';
import { WalletGlance } from '@/components/wallet-glance';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { ServerClockPill } from '@/components/server-clock-pill';
import { G1PageHero } from '@/components/g1/page-hero';
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

export default async function HomePage() {
  const locale = await getServerLocale();
  const [marketData, notices] = await Promise.all([
    apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks'),
    apiOrNull<{ announcements: Announcement[] }>('/api/v1/announcements'),
  ]);

  const movers = (marketData?.stocks ?? [])
    .map((stock) => ({ stock, bp: moveBasisPoints(stock) }))
    .filter((row): row is { stock: StockItem; bp: bigint } => row.bp !== null)
    .sort((a, b) => {
      const left = a.bp < 0n ? -a.bp : a.bp;
      const right = b.bp < 0n ? -b.bp : b.bp;
      return left === right ? 0 : left > right ? -1 : 1;
    })
    .slice(0, 5);

  const announcements = (notices?.announcements ?? []).slice(0, 3);

  return (
    <div data-page="home" className="flex flex-col gap-4">
      <h1 className="sr-only">
        {HOME_H1_BY_LOCALE[locale] ?? HOME_H1_BY_LOCALE.en}
      </h1>

      <G1PageHero heading="h2" title="길드 홀" lead="오늘의 월덕 시장과 내 길드 진행 상황을 한 화면에서 확인합니다." scene="skyline">
        <ServerClockPill className="w-fit" />
      </G1PageHero>

      <GuestQuickstart locale={locale} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="hero-balance-heading" className="g1-panel flex flex-col gap-3">
          <h2 id="hero-balance-heading" className="text-lg text-[var(--g1-ink)]">내 자산</h2>
          <p className="flex items-baseline gap-3">
            <span aria-hidden className="size-8 shrink-0 self-center rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--g1-moon),var(--g1-gold)_55%,var(--g1-gold-deep))]" />
            <span className="g1-num text-3xl text-[var(--g1-gold)]">
              <WalletGlance />
            </span>
          </p>
          <p className="text-sm text-[var(--g1-muted)]">원장에 기록된 사용 가능 잔액입니다. 거래 내역은 지갑에서 확인하세요.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/wallet" prefetch={false} className="g1-cta">지갑 열기</Link>
            {/* Restored: the member-to-member transfer the pre-v10 home offered. */}
            <P2PTransferModal triggerText="WLD 보내기" />
          </div>
        </section>

        <section aria-labelledby="home-notices-heading" className="g1-panel flex flex-col gap-2">
          <h2 id="home-notices-heading" className="flex items-center gap-2 text-lg text-[var(--g1-ink)]">
            <Megaphone className="size-4 text-[var(--g1-gold)]" aria-hidden />
            길드 공지
          </h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-[var(--g1-muted)]">지금 게시된 공지가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-[var(--g1-line)]">
              {announcements.map((notice) => (
                <li key={notice.announcementId}>
                  <Link
                    href={`/announcements/${encodeURIComponent(notice.announcementId)}`}
                    prefetch={false}
                    className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm text-[var(--g1-body)] hover:text-[var(--g1-ink)]"
                  >
                    <span className="line-clamp-1">{notice.title}</span>
                    {notice.isPinned && <span className="shrink-0 text-xs text-[var(--g1-gold)]">고정</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/announcements" prefetch={false} className="mt-auto text-sm text-[var(--g1-gold)] hover:underline">
            공지 전체 보기
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="home-market-heading" className="g1-panel">
          <h2 id="home-market-heading" className="mb-2 text-lg text-[var(--g1-ink)]">오늘 크게 움직인 종목</h2>
          {movers.length === 0 ? (
            <p className="py-6 text-sm text-[var(--g1-muted)]">시세 자료를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--g1-line)] text-left text-xs text-[var(--g1-muted)]">
                  <th className="py-2 font-medium">종목</th>
                  <th className="py-2 text-right font-medium">현재가</th>
                  <th className="py-2 text-right font-medium">오늘 등락</th>
                </tr>
              </thead>
              <tbody>
                {movers.map(({ stock, bp }) => {
                  const pct = changePercent(stock.current_price, stock.day_open_price);
                  const tone = bp > 0n ? 'text-[var(--g1-ember)]' : bp < 0n ? 'text-[var(--g1-rare-rare)]' : 'text-[var(--g1-muted)]';
                  return (
                    <tr key={stock.symbol} className="border-b border-[var(--g1-line)] last:border-0">
                      <td className="py-2">
                        <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`} prefetch={false} className="block hover:text-[var(--g1-gold)]">
                          <span className="font-semibold text-[var(--g1-ink)]">{getStockName(stock.symbol, locale, stock.name)}</span>
                          <span className="block text-xs text-[var(--g1-muted)]">{stock.symbol}</span>
                        </Link>
                      </td>
                      <td className="g1-num py-2 text-right">{groupDigits(stock.current_price)}</td>
                      <td className={`g1-num py-2 text-right ${tone}`}>{pct === null ? '—' : `${pct}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <Link href="/stocks" prefetch={false} className="mt-3 inline-block text-sm text-[var(--g1-gold)] hover:underline">
            거래소로 이동
          </Link>
        </section>

        <section aria-labelledby="home-routes-heading" className="g1-panel">
          <h2 id="home-routes-heading" className="mb-2 text-lg text-[var(--g1-ink)]">어디로 갈까요</h2>
          <ul className="grid gap-2">
            {QUICK_LINKS.map(({ href, label, note, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  prefetch={false}
                  className="flex min-h-11 items-center gap-3 rounded-lg bg-[var(--g1-plum-2)] px-3 py-2 transition-transform duration-150 ease-out active:scale-[0.97] hover:bg-[var(--g1-plum-3)]"
                >
                  <Icon className="size-5 shrink-0 text-[var(--g1-gold)]" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--g1-ink)]">{label}</span>
                    <span className="block text-xs text-[var(--g1-muted)]">{note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
