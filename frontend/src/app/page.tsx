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
} from 'lucide-react';
import { GuestQuickstart } from '@/components/guest-quickstart';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';
import { WalletGlance } from '@/components/wallet-glance';
import { Badge } from '@/components/ui/badge';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel, type Locale } from '@/lib/locale';
import { getStockName } from '@/lib/i18n-dictionary';
import { canonicalUrl } from '@/lib/seo';

export const revalidate = 60;

interface StockItem {
  readonly id?: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

const HOME_H1_BY_LOCALE = {
  ko: '월덕 머니버스 — 토스 스타일 차세대 핀테크 가상경제 시뮬레이터',
  en: 'Woldeok Moneyverse — Toss-style Next-Gen FinTech Simulator',
  ja: 'ウォルドク・マネーバース — 次世代フィンテック仮想金融シミュレーター',
  zh: '月德 Moneyverse — Toss风格次世代虚拟金融模拟器',
  vi: 'Woldeok Moneyverse — Mô phỏng Tài chính Kiểu Toss Thế Hệ Mới',
} as const;

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
  vi: {
    title: 'Woldeok Moneyverse — Mô phỏng Tài chính Kiểu Toss Thế Hệ Mới',
    description: 'Thị trường cổ phiếu ảo, máy tính lãi kép và mô phỏng kinh tế trực quan không độ trễ.',
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

export default async function HomePage() {
  const locale = await getServerLocale();
  const marketData = await apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks');

  const rawStocks = marketData?.stocks ?? [];

  const movers = rawStocks
    .map((stock) => {
      const cur = Number.parseInt(stock.current_price, 10);
      const open = Number.parseInt(stock.day_open_price || stock.current_price, 10);
      if (!Number.isFinite(cur) || !Number.isFinite(open) || open <= 0) return null;
      const pct = ((cur - open) / open) * 100;
      return { ...stock, cur, open, pct };
    })
    .filter((stock): stock is NonNullable<typeof stock> => stock !== null)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 4);

  return (
    <div data-page="home" className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8 px-3 sm:px-6 py-2 sm:py-6 pb-28 zero-overflow-shield">
      {/* 0. SEO 메인 시맨틱 H1 태그 (검색 크롤러 및 웹 접근성 표준 인덱싱) */}
      <h1 className="sr-only">
        {HOME_H1_BY_LOCALE[locale] ?? HOME_H1_BY_LOCALE.en}
      </h1>

      {/* 1. 상단 환영 인라인 바 (누런 배너 대신 깔끔한 미니 칩) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            {localeLabel(
              locale,
              '실시간 복식부기 불변 원장 시스템 정상 가동 중',
              'Real-time double-entry immutable ledger operating normally',
              'リアルタイム複式簿記不変元帳システム正常稼働中',
              '实时复式记账不可变账本系统正常运行中',
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-bold px-2 py-0.5">
            Verified Ledger
          </Badge>
          <span className="hidden sm:inline">
            {localeLabel(
              locale,
              '· 100% 안전한 금융 모의 시뮬레이터',
              '· 100% Safe Financial Simulation',
              '· 100%安全な金融模擬シミュレーター',
              '· 100%安全的虚拟金融模拟器',
            )}
          </span>
        </div>
      </div>

      {/* 2. 가입 전 게스트 유저를 위한 퀵 스타트 배너 */}
      <GuestQuickstart locale={locale} />

      {/* 2. PC 와이드 벤토 그리드 (7:5 비대칭 핀테크 레이아웃) */}
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
                <div className="size-9 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center shadow-inner">
                  <Coins className="size-5" />
                </div>
                <div>
                  <h2 id="hero-balance-heading" className="text-sm font-extrabold text-slate-200">
                    {localeLabel(
                      locale,
                      '내 가상 자산 총액',
                      'Total Virtual Assets',
                      '仮想資産総額',
                      '虚拟资产总额',
                    )}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {localeLabel(
                      locale,
                      '활동 현금 + 은행 예치금 실시간 집계',
                      'Live sum of active cash + bank deposits',
                      'アクティブ現金＋銀行預金のリアルタイム集計',
                      '活动现金与银行存款实时汇总',
                    )}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[11px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-semibold px-2.5 py-1 rounded-full">
                {localeLabel(
                  locale,
                  '원장 정합성 100%',
                  '100% Ledger Integrity',
                  '元帳整合性100%',
                  '账本一致性100%',
                )}
              </Badge>
            </div>

            <div className="space-y-1.5 relative z-10 pt-2">
              <div className="text-3xl sm:text-5xl font-black font-fintech text-slate-100 tabular-nums tracking-tight flex items-baseline gap-2">
                <WalletGlance />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {localeLabel(
                  locale,
                  '가상 재화로 즐기는 100% 안전한 금융 모의 시뮬레이션',
                  '100% risk-free simulated financial playground',
                  '仮想資産で体験する100%安全な金融模擬体験',
                  '尽享零风险虚拟金融模拟体验',
                )}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 relative z-10">
              <div className="flex-1 min-w-0">
                <P2PTransferModal triggerText={localeLabel(
                  locale,
                  '1:1 간편 송금',
                  'Instant Transfer',
                  'かんたん送金',
                  '1:1快捷转账',
                )} />
              </div>
              <Link
                href="/wallet"
                className="btn-toss flex-1 min-h-[48px] bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-extrabold border border-slate-700 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>{localeLabel(locale, '내역 조회', 'History', '履歴照会', '明细查询')}</span>
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
                <span className="text-xs sm:text-sm font-black text-slate-100 block">
                  {localeLabel(locale, '주식 거래', 'Stock Trading', '株式取引', '股票交易')}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {localeLabel(locale, '10개 가상 상장사', '10 Listed Companies', '10の上場企業', '10家精选虚拟公司')}
                </span>
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
                <span className="text-xs sm:text-sm font-black text-slate-100 block">
                  {localeLabel(locale, '직업 출근', 'Career Work', '職業出勤', '职场上班')}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {localeLabel(locale, '일일 파밍 보상', 'Daily Farming Rewards', 'デイリーファーミング報酬', '每日工作收益')}
                </span>
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
                <span className="text-xs sm:text-sm font-black text-slate-100 block">
                  {localeLabel(locale, '가상 은행', 'Virtual Bank', '仮想銀行', '虚拟银行')}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {localeLabel(locale, '예금 및 대출', 'Deposits & Loans', '預金＆ローン', '存款与贷款')}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* 우측 서브 칼럼: 실시간 핫 종목 TOP 4 + 경제 무결성 (5/12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 실시간 핫 종목 위젯 */}
          <section className="toss-card p-5 sm:p-6 space-y-4 bg-[#0f1422] border-slate-800/80 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Flame className="size-4.5 text-rose-400 animate-bounce" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                  {localeLabel(locale, '실시간 급등락 상장 종목', 'Live Market Movers', 'リアルタイム急変動銘柄', '实时异动上榜股票')}
                </h3>
              </div>
              <Link
                href="/stocks"
                className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
              >
                <span>{localeLabel(locale, '전체 보기', 'View All', 'すべて見る', '查看全部')}</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {movers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {localeLabel(
                    locale,
                    '시세 자료를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.',
                    'Failed to load stock data. Please check back shortly.',
                    '相場データを読み込めませんでした。しばらくしてからもう一度お試しください。',
                    '行情数据加载失败，请稍后重试。',
                  )}
                </div>
              ) : (
                movers.map((stock) => {
                  const isUp = stock.pct >= 0;
                  const localizedName = getStockName(stock.symbol, locale, stock.name);
                  return (
                    <Link
                      key={stock.symbol}
                      href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200">
                          {stock.symbol}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-primary transition-colors">
                          {localizedName}
                        </span>
                      </div>
                      <div className="text-right font-mono shrink-0 pl-2">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-100 tabular-nums">
                          {stock.cur.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">WLD</span>
                        </div>
                        <div
                          className={`text-xs font-bold tabular-nums flex items-center justify-end gap-0.5 ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          <span>{isUp ? `+${stock.pct.toFixed(1)}%` : `${stock.pct.toFixed(1)}%`}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* 안전 모의 시뮬레이션 안내 카드 */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0f1422] border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>
                {localeLabel(
                  locale,
                  '100% 안전한 가상 금융 시뮬레이션',
                  '100% Safe Virtual Economy',
                  '100%安全な仮想金融シミュレーション',
                  '100%安全的虚拟金融模拟',
                )}
              </span>
            </div>
            <p className="leading-relaxed [word-break:keep-all]">
              {localeLabel(
                locale,
                '월덕 머니버스의 모든 화폐(WLD)와 주식 거래는 실제 현금이나 금융상품이 아닌 게임 내 알고리즘으로 구동되는 안전한 가상 경제입니다.',
                'All WLD currency and stock trades are simulated game data governed by algorithms, not real-world cash or investment products.',
                'ウォルドク・マネーバースのすべての通貨(WLD)と株式取引は、実際の現金や金融商品ではなく、ゲーム内アルゴリズムで動作する安全な仮想経済です。',
                '月德Moneyverse内所有货币(WLD)与股票交易均为基于算法的游戏模拟数据，绝非真实现金或金融投资品。',
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. 하단 벤토 그리드: 12대 실전 금융 계산기 퀵 허브 */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Calculator className="size-4.5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-slate-100">
              {localeLabel(
                locale,
                '실전 금융 계산기 & 시뮬레이터',
                'Financial Calculators & Simulators',
                '実践金融計算機＆シミュレーター',
                '实用金融计算器与模拟器',
              )}
            </h3>
          </div>
          <Link
            href="/tools"
            className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
          >
            <span>
              {localeLabel(
                locale,
                '전체 12종 계산기 보기',
                'View All 12 Tools',
                '全12種ツールを見る',
                '查看全部12款工具',
              )}
            </span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/tools/compound-calculator"
            className="toss-card p-5 bg-[#0f1422] border-slate-800/80 hover:border-emerald-500/50 rounded-2xl transition-all group"
          >
            <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center mb-3 group-hover:scale-105 transition-transform">
              <Percent className="size-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
              {localeLabel(
                locale,
                '복리 예금·적금 계산기',
                'Compound Interest Calculator',
                '複利預金・積立計算機',
                '复利储蓄计算器',
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {localeLabel(
                locale,
                '월 적립식 복리 이자와 72의 법칙 목표 자산 달성 시점 시뮬레이션',
                'Simulate monthly contributions, compound interest, and Rule of 72 targets',
                '毎月積立複利利息と72の法則による資産達成シミュレーション',
                '测算定投复利收益与72法则目标达成时间',
              )}
            </p>
          </Link>

          <Link
            href="/tools/loan-interest-calculator"
            className="toss-card p-5 bg-[#0f1422] border-slate-800/80 hover:border-sky-500/50 rounded-2xl transition-all group"
          >
            <div className="size-10 rounded-xl bg-sky-500/15 text-sky-400 grid place-items-center mb-3 group-hover:scale-105 transition-transform">
              <Scale className="size-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
              {localeLabel(
                locale,
                '대출이자 & 상환 계산기',
                'Loan Repayment Calculator',
                'ローン利息＆返済計算機',
                '贷款利息与还款计算器',
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {localeLabel(
                locale,
                '원리금균등, 원금균등, 만기일시 상환 방식별 총이자 비교',
                'Compare total interest across amortized, equal principal, and lump sum plans',
                '元利均等、元金均等、期日一括返済ごとの総利息比較',
                '等额本息、等额本金与先息后本方案总利息对比',
              )}
            </p>
          </Link>

          <Link
            href="/tools/stock-calculator"
            className="toss-card p-5 bg-[#0f1422] border-slate-800/80 hover:border-amber-500/50 rounded-2xl transition-all group"
          >
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center mb-3 group-hover:scale-105 transition-transform">
              <Coins className="size-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
              {localeLabel(
                locale,
                '주식 물타기·평단가 계산기',
                'Stock Average Down Calculator',
                '株式買増し・平均単価計算機',
                '股票补仓均价计算器',
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {localeLabel(
                locale,
                '추가 매수 시 희석되는 평균 단가 및 탈출 목표가 역산',
                'Calculate revised average price on dips and target break-even exit',
                '買増し時の平均取得単価と損益分岐点脱出価格を逆算',
                '计算加仓后摊薄成本均价与保本解套目标价',
              )}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
