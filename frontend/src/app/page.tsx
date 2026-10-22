import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  Briefcase,
  Landmark,
  ChevronRight,
  Calculator,
  Flame,
  Coins,
  Percent,
  Scale,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { GuestQuickstart } from '@/components/guest-quickstart';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { WalletGlance } from '@/components/wallet-glance';
import { TranslatedText as T } from '@/components/translated-text';
import { Badge } from '@/components/ui/badge';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';

export const revalidate = 60;

interface StockItem {
  readonly id?: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

const HOME_META_BY_LOCALE = {
  en: {
    title: 'Woldeok Moneyverse — Toss-style Next-Gen FinTech Simulator',
    description: 'Ultra-clean virtual stocks, compound interest calculators, and macro simulations with effortless clarity.',
    canonical: '/en',
  },
  ko: {
    title: '월덕 머니버스 — 토스 스타일 차세대 핀테크 가상경제',
    description: '군더더기 없는 극초간결 가상 자산, 모의 주식 거래, 복리 및 대출 계산기.',
    canonical: '/',
  },
  ja: {
    title: 'ウォルドク・マネーバース — 次世代フィンテック仮想金融シミュレーター',
    description: '直感的でシンプルな仮想株式相場や複利計算を体験。',
    canonical: '/ja',
  },
  zh: {
    title: '月德 Moneyverse — Toss风格次世代虚拟金融模拟器',
    description: '极简直观的虚拟股票交易与复利金融计算工具。',
    canonical: '/zh',
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

export default async function HomePage() {
  const locale = await getServerLocale();
  const marketData = await apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks');

  const rawStocks = marketData?.stocks ?? [];

  const movers = rawStocks
    .map((stock) => {
      const cur = Number.parseInt(stock.current_price, 10);
      const open = Number.parseInt(stock.day_open_price, 10);
      if (!Number.isFinite(cur) || !Number.isFinite(open) || open <= 0) return null;
      const pct = ((cur - open) / open) * 100;
      return { ...stock, cur, open, pct };
    })
    .filter((stock): stock is NonNullable<typeof stock> => stock !== null)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 3);

  return (
    <div data-page="home" className="mx-auto w-full max-w-xl space-y-4 sm:space-y-6 px-3 sm:px-0 py-2 sm:py-4 pb-24 zero-overflow-shield">
      {/* 1. Toss Style Clean Onboarding */}
      <GuestQuickstart locale={locale} />

      {/* 2. Toss 2026 Hero Balance Card */}
      <section aria-labelledby="hero-balance-heading" className="toss-card p-6 sm:p-8 space-y-5 bg-[#0f1422] dark:bg-[#0d121c] border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center">
              <Coins className="size-3.5" />
            </div>
            <h2 id="hero-balance-heading" className="text-xs sm:text-sm font-bold text-slate-300">내 가상 자산</h2>
          </div>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-fintech px-2 py-0.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
            실시간 원장 보관
          </Badge>
        </div>

        <div className="space-y-1">
          <WalletGlance />
          <p className="text-xs text-slate-400 font-fintech">
            가상 재화로 즐기는 100% 안전한 금융 모의 시뮬레이션
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <P2PTransferModal triggerText="1:1 간편 송금" />
          </div>
          <Link
            href="/wallet"
            className="btn-toss flex-1 min-h-[48px] bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700/60"
          >
            내역 조회
          </Link>
        </div>
      </section>

      {/* 3. Toss Style 3 Core Action Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Link
          href="/stocks"
          className="toss-card p-3 sm:p-5 flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/50 btn-interactive min-h-[88px] sm:min-h-[96px] bg-[#0f1422] dark:bg-[#0d121c] border-slate-800/80"
        >
          <div className="size-10 sm:size-11 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-100">주식 거래</span>
        </Link>

        <Link
          href="/work"
          className="toss-card p-3 sm:p-5 flex flex-col items-center justify-center text-center gap-2 hover:border-sky-500/50 btn-interactive min-h-[88px] sm:min-h-[96px] bg-[#0f1422] dark:bg-[#0d121c] border-slate-800/80"
        >
          <div className="size-10 sm:size-11 rounded-2xl bg-sky-500/15 text-sky-400 grid place-items-center">
            <Briefcase className="size-5" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-100">직업 출근</span>
        </Link>

        <Link
          href="/bank"
          className="toss-card p-3 sm:p-5 flex flex-col items-center justify-center text-center gap-2 hover:border-amber-500/50 btn-interactive min-h-[88px] sm:min-h-[96px] bg-[#0f1422] dark:bg-[#0d121c] border-slate-800/80"
        >
          <div className="size-10 sm:size-11 rounded-2xl bg-amber-500/15 text-amber-400 grid place-items-center">
            <Landmark className="size-5" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-100">가상 은행</span>
        </Link>
      </div>

      {/* 4. 실시간 인기 주식 TOP 3 스트립 */}
      <div className="toss-card p-5 sm:p-6 space-y-3.5 bg-[#0f1422] dark:bg-[#0d121c] border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-100">실시간 인기 주식 TOP 3</h2>
          </div>
          <Link href="/stocks" className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-0.5">
            <span>더보기</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60">
          {movers.length === 0 ? (
            <p className="py-5 text-xs text-slate-400 text-center">시세 자료를 불러오지 못했습니다.</p>
          ) : (
            movers.map((item) => {
              const isPositive = item.pct >= 0;
              return (
                <Link
                  key={item.symbol}
                  href={`/stocks/${item.symbol}`}
                  className="flex items-center justify-between py-3.5 hover:opacity-80 transition-opacity btn-interactive"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">{item.name}</div>
                    <span className="text-[10px] font-fintech text-slate-400 uppercase font-semibold">{item.symbol}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-fintech font-black text-xs sm:text-sm text-slate-100 tabular-nums">
                      {item.cur.toLocaleString()} WLD
                    </div>
                    <div className={`font-fintech text-xs font-extrabold tabular-nums flex items-center justify-end gap-0.5 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      <span>{isPositive ? `+${item.pct.toFixed(1)}%` : `${item.pct.toFixed(1)}%`}</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* 5. 필수 금융 계산기 4선 */}
      <div className="toss-card p-5 sm:p-6 space-y-3.5 bg-[#0f1422] dark:bg-[#0d121c] border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-sky-400" />
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-100">필수 금융 계산기 4선</h2>
          </div>
          <Link href="/tools" className="text-xs font-bold text-slate-400 hover:text-sky-400 flex items-center gap-0.5">
            <span>전체 10종</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/tools/compound-calculator"
            className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-emerald-500/50 transition-colors btn-interactive space-y-1"
          >
            <div className="size-7 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center">
              <Percent className="size-3.5" />
            </div>
            <span className="block text-xs font-extrabold text-slate-100">복리 수익률</span>
            <span className="block text-[11px] text-slate-400">적립식 시뮬레이션</span>
          </Link>

          <Link
            href="/tools/stock-calculator"
            className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-sky-500/50 transition-colors btn-interactive space-y-1"
          >
            <div className="size-7 rounded-xl bg-sky-500/15 text-sky-400 grid place-items-center">
              <TrendingDown className="size-3.5" />
            </div>
            <span className="block text-xs font-extrabold text-slate-100">주식 물타기</span>
            <span className="block text-[11px] text-slate-400">평단가 탈출 계산</span>
          </Link>

          <Link
            href="/tools/dividend-tax-calculator"
            className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-amber-500/50 transition-colors btn-interactive space-y-1"
          >
            <div className="size-7 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center">
              <Coins className="size-3.5" />
            </div>
            <span className="block text-xs font-extrabold text-slate-100">배당소득세</span>
            <span className="block text-[11px] text-slate-400">15.4% 세후 실수령</span>
          </Link>

          <Link
            href="/tools/loan-interest-calculator"
            className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-rose-500/50 transition-colors btn-interactive space-y-1"
          >
            <div className="size-7 rounded-xl bg-rose-500/15 text-rose-400 grid place-items-center">
              <Scale className="size-3.5" />
            </div>
            <span className="block text-xs font-extrabold text-slate-100">대출 상환 이자</span>
            <span className="block text-[11px] text-slate-400">원리금 균등 상환</span>
          </Link>
        </div>
      </div>

      {/* 6. Footer Clean Meta */}
      <HomeAdvertisement />
      <LobbyCount />
    </div>
  );
}
