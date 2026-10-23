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
  ArrowUpRight,
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
    .slice(0, 4);

  return (
    <div data-page="home" className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8 px-4 sm:px-6 py-2 sm:py-6 pb-28 zero-overflow-shield">
      {/* 1. 상단 온보딩 가이드 */}
      <GuestQuickstart locale={locale} />

      {/* 2. PC 와이드 벤토 그리드 (모바일에서는 1열 스택) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* 좌측 메인 칼럼: 자산 대시보드 + 3대 퀵 액션 (7/12) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 토스형 초대형 자산 카드 */}
          <section
            aria-labelledby="hero-balance-heading"
            className="toss-card toss-card-primary p-6 sm:p-8 space-y-6 bg-gradient-to-br from-[#121929] via-[#0d131f] to-[#090d14] border border-slate-700/60 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center shadow-inner">
                  <Coins className="size-4.5" />
                </div>
                <div>
                  <h2 id="hero-balance-heading" className="text-sm font-extrabold text-slate-200">
                    내 가상 자산
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">실시간 복식부기 안전 보관</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[11px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-semibold px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
                원장 정합성 100%
              </Badge>
            </div>

            <div className="space-y-1.5 relative z-10 pt-2">
              <div className="text-3xl sm:text-4xl font-black font-fintech text-slate-100 tabular-nums tracking-tight flex items-baseline gap-2">
                <WalletGlance />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                가상 재화로 즐기는 100% 안전한 금융 모의 시뮬레이션
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 relative z-10">
              <div className="flex-1 min-w-0">
                <P2PTransferModal triggerText="1:1 간편 송금" />
              </div>
              <Link
                href="/wallet"
                className="btn-toss flex-1 min-h-[48px] bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-extrabold border border-slate-700 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>내역 조회</span>
                <ArrowRight className="size-4 opacity-70" />
              </Link>
            </div>
          </section>

          {/* 3대 퀵 액션 카드 (주식 거래 / 직업 출근 / 가상 은행) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Link
              href="/stocks"
              className="toss-card p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2.5 hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[88px] sm:min-h-[105px] bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-lg group"
            >
              <div className="size-11 sm:size-12 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center group-hover:scale-110 transition-transform shadow-xs">
                <TrendingUp className="size-5.5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-100 block">주식 거래</span>
                <span className="text-[10px] text-slate-400 hidden sm:block">10개 가상 상장사</span>
              </div>
            </Link>

            <Link
              href="/work"
              className="toss-card p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2.5 hover:border-sky-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[88px] sm:min-h-[105px] bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-lg group"
            >
              <div className="size-11 sm:size-12 rounded-2xl bg-sky-500/15 text-sky-400 grid place-items-center group-hover:scale-110 transition-transform shadow-xs">
                <Briefcase className="size-5.5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-100 block">직업 출근</span>
                <span className="text-[10px] text-slate-400 hidden sm:block">일일 파밍 보상</span>
              </div>
            </Link>

            <Link
              href="/bank"
              className="toss-card p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2.5 hover:border-amber-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[88px] sm:min-h-[105px] bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-lg group"
            >
              <div className="size-11 sm:size-12 rounded-2xl bg-amber-500/15 text-amber-400 grid place-items-center group-hover:scale-110 transition-transform shadow-xs">
                <Landmark className="size-5.5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-100 block">가상 은행</span>
                <span className="text-[10px] text-slate-400 hidden sm:block">예금 및 대출</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 우측 보조 칼럼: 실시간 인기 주식 TOP 4 + 필수 금융 계산기 (5/12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 실시간 인기 주식 스트립 */}
          <div className="toss-card p-5 sm:p-6 space-y-3.5 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="size-4.5 text-emerald-400 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-black text-slate-100 tracking-tight">실시간 급상승 종목</h2>
              </div>
              <Link href="/stocks" className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
                <span>전체보기</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {movers.length === 0 ? (
                <p className="py-6 text-xs text-slate-400 text-center font-medium">시세 자료를 불러오지 못했습니다.</p>
              ) : (
                movers.map((item) => {
                  const isPositive = item.pct >= 0;
                  return (
                    <Link
                      key={item.symbol}
                      href={`/stocks/${item.symbol}`}
                      className="flex items-center justify-between py-3 hover:bg-slate-800/40 px-2 rounded-xl transition-all group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs sm:text-sm font-black text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </div>
                        <span className="text-[10px] font-fintech text-slate-400 uppercase font-semibold">
                          {item.symbol}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-fintech font-black text-xs sm:text-sm text-slate-100 tabular-nums">
                          {item.cur.toLocaleString()} WLD
                        </div>
                        <div className={`font-fintech text-xs font-black tabular-nums flex items-center justify-end gap-0.5 ${
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

          {/* 필수 금융 계산기 4선 */}
          <div className="toss-card p-5 sm:p-6 space-y-3.5 bg-[#0f1422] dark:bg-[#0d121c] border border-slate-800 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="size-4.5 text-sky-400" />
                <h2 className="text-xs sm:text-sm font-black text-slate-100 tracking-tight">필수 금융 도구</h2>
              </div>
              <Link href="/tools" className="text-xs font-bold text-slate-400 hover:text-sky-400 flex items-center gap-0.5 transition-colors">
                <span>전체 20종</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/tools/compound-calculator"
                className="p-3 sm:p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-all space-y-1.5 group"
              >
                <div className="size-7 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <Percent className="size-3.5" />
                </div>
                <span className="block text-xs font-black text-slate-100 truncate">복리 수익률</span>
                <span className="block text-[11px] text-slate-400 truncate">적립식 계산</span>
              </Link>

              <Link
                href="/tools/stock-calculator"
                className="p-3 sm:p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-sky-500/50 hover:bg-slate-800/40 transition-all space-y-1.5 group"
              >
                <div className="size-7 rounded-xl bg-sky-500/15 text-sky-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <TrendingDown className="size-3.5" />
                </div>
                <span className="block text-xs font-black text-slate-100 truncate">주식 물타기</span>
                <span className="block text-[11px] text-slate-400 truncate">평단가 탈출</span>
              </Link>

              <Link
                href="/tools/dividend-tax-calculator"
                className="p-3 sm:p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all space-y-1.5 group"
              >
                <div className="size-7 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <Coins className="size-3.5" />
                </div>
                <span className="block text-xs font-black text-slate-100 truncate">배당소득세</span>
                <span className="block text-[11px] text-slate-400 truncate">실수령 계산</span>
              </Link>

              <Link
                href="/tools/loan-interest-calculator"
                className="p-3 sm:p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-rose-500/50 hover:bg-slate-800/40 transition-all space-y-1.5 group"
              >
                <div className="size-7 rounded-xl bg-rose-500/15 text-rose-400 grid place-items-center group-hover:scale-110 transition-transform">
                  <Scale className="size-3.5" />
                </div>
                <span className="block text-xs font-black text-slate-100 truncate">대출 상환 이자</span>
                <span className="block text-[11px] text-slate-400 truncate">원리금 균등</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 하단 신뢰 메타 & 커뮤니티 통계 */}
      <HomeAdvertisement />
      <LobbyCount />
    </div>
  );
}
