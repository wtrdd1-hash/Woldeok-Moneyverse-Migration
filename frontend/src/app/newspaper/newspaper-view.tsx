'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Building2,
  Sparkles,
  BookOpen,
  Vote,
  ShieldAlert,
  ArrowRight,
  Clock,
  Landmark,
  Briefcase,
  Share2,
  Activity,
} from 'lucide-react';
import { WeeklyWorldBrief, type WeeklyBriefData } from './weekly-world-brief';
import { SocialShareToolbar } from '@/components/social-share-toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { formatMoment, groupDigits } from '@/lib/money';
import { cn } from '@/lib/cn';

export interface MarketEvent {
  readonly id: string;
  readonly stock_id: string | null;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly direction: 'up' | 'down';
  readonly strength: number;
  readonly headline: string;
  readonly body: string;
  readonly source: string;
  readonly starts_at: string;
  readonly ends_at: string;
}

export interface StockTickerItem {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

interface NewspaperViewProps {
  readonly events: readonly MarketEvent[];
  readonly stocks: readonly StockTickerItem[];
  readonly weeklyBrief?: WeeklyBriefData | undefined;
  readonly eventsAvailable?: boolean | undefined;
  readonly stocksAvailable?: boolean | undefined;
  readonly initialTab?: 'brief' | 'live' | undefined;
}

const STRENGTH_LABEL: Readonly<Record<number, { ko: string; en: string; ja: string; zh: string; vi?: string }>> = {
  1: { ko: '소폭 영향', en: 'Mild Impact', ja: '小幅影響', zh: '轻微影响' },
  2: { ko: '보통 영향', en: 'Moderate Impact', ja: '通常影響', zh: '中度影响' },
  3: { ko: '강력 영향', en: 'Major Impact', ja: '強力影響', zh: '重大影响' },
};

function StockTickerPopover({
  symbol,
  name,
  stocks,
}: {
  readonly symbol: string;
  readonly name?: string | null;
  readonly stocks: readonly StockTickerItem[];
}) {
  const stock = stocks.find((s) => s.symbol === symbol);
  const currentPrice = stock ? BigInt(stock.current_price || '0') : null;
  const openPrice = stock ? BigInt(stock.day_open_price || '0') : null;
  const diff = currentPrice !== null && openPrice !== null ? currentPrice - openPrice : BigInt(0);
  const isUp = diff > BigInt(0);
  const isDown = diff < BigInt(0);
  const diffRate =
    openPrice && openPrice > BigInt(0)
      ? ((Number(diff) / Number(openPrice)) * 100).toFixed(2)
      : '0.00';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Building2 className="size-3.5" />
          <span>{symbol}</span>
          {name && <span className="opacity-90">· {name}</span>}
          {stock && (
            <span
              className={cn(
                'ml-1 text-[10px] font-extrabold',
                isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-muted-foreground'
              )}
            >
              {isUp ? '▲' : isDown ? '▼' : '−'}
              {Math.abs(Number(diffRate))}%
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl p-4 shadow-xl border-border/80 bg-card">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {symbol.slice(0, 2)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{name || symbol}</h4>
                <p className="font-mono text-[11px] text-muted-foreground">{symbol} · 가상 상장사</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              서버 조회 시세
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground">마지막 서버 가격</div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xl font-extrabold text-foreground">
                {stock ? groupDigits(stock.current_price) : '—'}{' '}
                <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </span>
              {stock && (
                <span
                  className={cn(
                    'font-mono text-xs font-bold flex items-center gap-0.5',
                    isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-muted-foreground'
                  )}
                >
                  {isUp ? <TrendingUp className="size-3.5" /> : isDown ? <TrendingDown className="size-3.5" /> : null}
                  {isUp ? '+' : ''}{diffRate}%
                </span>
              )}
            </div>
          </div>

          <p role="note" className="rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">
            체결 시계열 데이터가 없어 가격 추세 그래프는 표시하지 않습니다. 마지막 서버 조회값이며 실시간 호가가 아닙니다.
          </p>

          <Button asChild size="sm" className="w-full h-9 rounded-xl font-bold text-xs gap-1.5 shadow-sm">
            <Link href={`/stocks/${symbol}`}>
              <span>거래소에서 종목 확인</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NewspaperView({
  events,
  stocks = [],
  weeklyBrief,
  eventsAvailable = true,
  stocksAvailable = true,
  initialTab = 'live',
}: NewspaperViewProps) {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<'brief' | 'live'>(initialTab);
  // Sentiment metrics computation
  const upEvents = events.filter((e) => e.direction === 'up');
  const downEvents = events.filter((e) => e.direction === 'down');
  const totalEvents = events.length;
  const bullRatio = totalEvents > 0 ? Math.round((upEvents.length / totalEvents) * 100) : 0;
  const bearRatio = totalEvents > 0 ? 100 - bullRatio : 0;

  const leadEvent = events.find((e) => e.strength === 3) || events[0];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-3.5 sm:px-6 py-6 overflow-x-clip">
      {/* 1. Masthead (신문 제호부) */}
      <header className="border-b-2 border-primary/20 pb-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="font-bold text-foreground">WOLDEOK MONEYVERSE</span>
            <span>·</span>
            <span>{localeLabel(locale, '시장 정보 안내', 'Market Source Brief', '市場情報', '市场资讯')}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {localeLabel(locale, '서버 조회 시장 정보', 'Server Market Snapshot', 'サーバー市場情報', '服务器市场快照')}
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground border-border/80">
              {localeLabel(locale, '가상 경제 100% 시뮬레이션', '100% Virtual Economy', '100% 仮想経済シミュレーション', '100% 虚拟经济模拟')}
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              {localeLabel(
                locale,
                '월덕 주간 경제 브리프 & 월드 펄스',
                'Woldeok Weekly World Brief',
                'ウォルドク 週刊経済ブリーフ',
                '月德 每周经济快报',
              )}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground [word-break:keep-all]">
              {localeLabel(
                locale,
                '가상 시장의 흐름을 빠르게 짚고, 이번 주 세계가 주목하는 핵심 사건과 금융 개념을 전달합니다.',
                'Authoritative insights into virtual market dynamics, AI scenarios, and core economic wisdom.',
                '仮想市場の動向を素早く把握し、今週の世界が注目する重要イベントと経済概念をお届けします。',
                '快速把握虚拟市场动向，汇集本周备受瞩目的核心事件与金融知识。',
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 shrink-0">
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
              <Link href="/stocks">
                <TrendingUp className="size-3.5 text-emerald-500" />
                {localeLabel(locale, '가상 거래소', 'Stock Market', '取引所', '交易市场')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
              <Link href="/bank">
                <Landmark className="size-3.5 text-amber-500" />
                {localeLabel(locale, '중앙 은행', 'Virtual Bank', '銀行', '中央银行')}
              </Link>
            </Button>
            <SocialShareToolbar
              compact
              title="월덕 머니버스 주간 경제 브리프 & 실시간 AI 시황"
              description="실시간 AI 경제 사건 및 가상 시장 펄스 분석 보고서"
              url="/newspaper"
            />
          </div>
        </div>

        {/* Game-Only Disclaimer Callout */}
        <div className="mt-4 rounded-lg bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
          <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="[word-break:keep-all] leading-relaxed">
            {localeLabel(
              locale,
              '안내: 본 지면의 모든 기사, 시세, 사건 및 시나리오는 게임 내 가상 통화(WLD/WDX) 기반 시뮬레이션이며 현실 금융 투자 권유가 아닙니다.',
              'Disclaimer: All articles, prices, and scenarios herein are game-only simulations based on virtual WLD/WDX and do not constitute financial advice.',
              'ご案内：本紙に掲載されているすべての記事、相場、イベントおよびシナリオはゲーム内仮想通貨(WLD/WDX)に基づくシミュレーションであり、現実の投資勧誘ではありません。',
              '提示：本快报中所有文章、行情、事件及情景均为基于游戏内虚拟货币(WLD/WDX)的模拟，不构成任何现实金融投资建议。',
            )}
          </p>
        </div>
      </header>

      {/* 주간 경제 브리프 vs 실시간 속보 탭 네비게이션 */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <Button
          variant={activeTab === 'brief' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('brief')}
          className="h-10 px-4 rounded-xl text-xs sm:text-sm font-bold gap-2"
        >
          <BookOpen className="size-4" />
          <span>주간 경제 브리프 (Weekly Brief)</span>
        </Button>
        <Button
          variant={activeTab === 'live' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('live')}
          className="h-10 px-4 rounded-xl text-xs sm:text-sm font-bold gap-2"
        >
          <Activity className="size-4 text-emerald-500" />
          <span>실시간 시장 속보 & 심리 지수 (Live News)</span>
        </Button>
      </div>

      {activeTab === 'brief' ? (
        <WeeklyWorldBrief data={weeklyBrief} />
      ) : (
        <>

      {(!eventsAvailable || !stocksAvailable) && (
        <section role="alert" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          {!eventsAvailable && <p>시장 사건 자료를 확인할 수 없습니다. 조회 장애는 사건이 없다는 뜻이 아닙니다.</p>}
          {!stocksAvailable && <p>종목 시세를 확인할 수 없습니다. 검증되지 않은 가격을 표시하지 않습니다.</p>}
          <Link href="/newspaper" className="mt-2 inline-flex min-h-11 items-center rounded-lg border px-4 focus-visible:outline-2 focus-visible:outline-offset-2">시장 정보 다시 조회</Link>
        </section>
      )}
      {eventsAvailable && totalEvents === 0 && (
        <p role="status" className="rounded-xl border p-4 text-sm">확인된 진행 중인 시장 사건이 없습니다. 이 결과만으로 시장 안정이나 거래 정상 작동을 보증하지 않습니다.</p>
      )}

      {/* 2. Realtime Market Sentiment Bar */}
      {eventsAvailable && totalEvents > 0 && <section aria-labelledby="sentiment-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="sentiment-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            {localeLabel(locale, '시장 사건 방향 비율', 'Market Event Direction Ratio', 'リアルタイム市場センチメント', '实时市场情绪指数')}
          </h2>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            {localeLabel(locale, `진행 중인 사건: ${totalEvents}건`, `Active Catalysts: ${totalEvents}`, `進行中のイベント: ${totalEvents}件`, `进行中事件: ${totalEvents}件`)}
          </span>
        </div>

        <Card className="rounded-xl border-border/80 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-muted-foreground">
                  {localeLabel(locale, '시장 심리 진단', 'Market Sentiment State', '市場心理診断', '市场情绪诊断')}
                </span>
                <p className="text-lg font-bold text-foreground">
                  {bullRatio >= 60
                    ? localeLabel(locale, '🟢 낙관 우세 (Bullish Leaning)', '🟢 Bullish Leaning', '🟢 強気優勢', '🟢 看多情绪占优')
                    : bullRatio <= 40
                    ? localeLabel(locale, '🔴 관망 및 조정 (Bearish Leaning)', '🔴 Bearish Leaning', '🔴 弱気警戒', '🔴 谨慎回调偏向')
                    : localeLabel(locale, '🟡 중립 횡보 (Neutral Balance)', '🟡 Neutral Balance', '🟡 中立均衡', '🟡 中性震荡')}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="size-3.5" />
                  {localeLabel(locale, `호재 ${bullRatio}%`, `Bullish ${bullRatio}%`, `好材料 ${bullRatio}%`, `利好 ${bullRatio}%`)}
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <TrendingDown className="size-3.5" />
                  {localeLabel(locale, `악재 ${bearRatio}%`, `Bearish ${bearRatio}%`, `悪材料 ${bearRatio}%`, `利空 ${bearRatio}%`)}
                </span>
              </div>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-muted/60 rounded-full h-3 flex overflow-hidden">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${bullRatio}%` }}
                title={`호재: ${bullRatio}%`}
              />
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${bearRatio}%` }}
                title={`악재: ${bearRatio}%`}
              />
            </div>
          </CardContent>
        </Card>
      </section>}

      {/* 2.5. Realtime Stocks Ticker Rail */}
      {stocks.length > 0 && (
        <section aria-labelledby="stocks-rail-heading" className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 id="stocks-rail-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="size-3.5 text-primary" />
              <span>{localeLabel(locale, '관련 가상 상장사 마지막 서버 조회 가격', 'Virtual Market Stocks Pulse', '上場銘柄の最終サーバー価格', '挂牌企业服务器最近报价')}</span>
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">총 {stocks.length}개 종목</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {stocks.map((s) => (
              <StockTickerPopover key={s.id} symbol={s.symbol} name={s.name} stocks={stocks} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Lead Feature Story & Bento Feed */}
      <section aria-labelledby="lead-story-heading" className="space-y-4">
        <h2 id="lead-story-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Newspaper className="size-4 text-primary" />
          {localeLabel(locale, '1면 헤드라인 & 조회된 사건', 'Front Page & Server Events', '1面トップ記事・リアルタイム速報', '头版头条与实时快讯')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Card (2 cols) */}
          <Card className="lg:col-span-2 rounded-2xl border-primary/20 bg-gradient-to-br from-card via-card to-muted/30 shadow-md flex flex-col justify-between">
            <CardHeader className="p-5 sm:p-7 pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {leadEvent && <Badge className={cn('font-bold', leadEvent.direction === 'up' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-rose-600 hover:bg-rose-600')}>
                  {leadEvent?.direction === 'up' ? '▲ ' + localeLabel(locale, '핵심 호재', 'Key Catalyst', '主要好材料', '核心利好') : '▼ ' + localeLabel(locale, '주요 악재', 'Market Headwind', '主要悪材料', '重大利空')}
                </Badge>}
                {leadEvent && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {STRENGTH_LABEL[leadEvent.strength]?.[locale as 'ko'|'en'|'ja'|'zh'] ?? '보통'}
                  </Badge>
                )}
                {leadEvent?.symbol && (
                  <StockTickerPopover
                    symbol={leadEvent.symbol}
                    name={leadEvent.name}
                    stocks={stocks}
                  />
                )}
                {leadEvent?.ends_at && (
                  <span className="ml-auto text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatMoment(leadEvent.ends_at)} {localeLabel(locale, '종료 예정', 'expiration', '終了予定', '预计结束')}
                  </span>
                )}
              </div>

              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight [word-break:keep-all] text-foreground leading-snug">
                {leadEvent ? leadEvent.headline : localeLabel(locale, '현재 확인된 시장 사건 정보가 없습니다.', 'No verified market event information is available.', '確認された市場イベント情報はありません。', '暂无已确认的市场事件信息。')}
              </CardTitle>

              <CardDescription className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground [word-break:keep-all]">
                {leadEvent ? leadEvent.body : localeLabel(locale, '시장 사건 조회 결과만으로 원장 거래 또는 시장의 정상 운영을 판단할 수 없습니다.', 'Market event data alone cannot certify ledger transactions or market operations.', '市場イベントの結果だけでは取引の正常性を保証できません。', '市场事件结果不能证明交易或市场运营正常。')}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-7 pt-0">
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {leadEvent?.source ? `출처: ${leadEvent.source}` : '시장 사건 원본 미제공'}
                </span>
                {leadEvent?.symbol ? (
                  <Button asChild size="sm" className="gap-1 text-xs font-semibold">
                    <Link href={`/stocks/${leadEvent.symbol}`}>
                      {localeLabel(locale, '해당 종목 시세 보기', 'View Stock Quote', '該当銘柄の株価を見る', '查看该股票行情')}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="gap-1 text-xs font-semibold">
                    <Link href="/stocks">
                      {localeLabel(locale, '거래소 전체 보기', 'View Exchange', '取引所一覧', '查看全部交易所')}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Side Briefs Stream (1 col) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider">
              {localeLabel(locale, '조회된 시장 사건', 'Server Event Feed', '速報ストリーム', '实时快讯流')}
            </div>

            {events.length > 1 ? (
              events.slice(1, 4).map((evt) => (
                <Card key={evt.id} className="p-4 rounded-xl border-border/80 bg-card hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-xs font-mono">
                    <span className={cn('font-bold', evt.direction === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                      {evt.direction === 'up' ? '▲ 호재' : '▼ 악재'}
                    </span>
                    {evt.symbol ? (
                      <StockTickerPopover symbol={evt.symbol} name={evt.name} stocks={stocks} />
                    ) : (
                      <span className="text-muted-foreground truncate">시장 전체</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold [word-break:keep-all] text-foreground leading-snug">
                    {evt.headline}
                  </h4>
                  {evt.body && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 [word-break:keep-all]">
                      {evt.body}
                    </p>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-4 rounded-xl border-dashed border-border/80 bg-muted/20 text-center py-8">
                <p className="text-xs text-muted-foreground [word-break:keep-all]">
                  {localeLabel(
                    locale,
                    '추가 확인된 시장 사건이 없습니다. 거래 정상 여부는 별도 확인이 필요합니다.',
                    'No additional scenarios currently active.',
                    '追加のイベントはありません。',
                    '暂无其他生效中的事件。',
                  )}
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* 콘텐츠 내 자동 삽입 광고 (In-Article Native Fluid Ad) */}
      <InArticleAdvertisement className="my-6" />

      {/* 4. Weekly Financial Concept & Lore Corner */}
      <section aria-labelledby="lore-heading" className="space-y-4">
        <h2 id="lore-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BookOpen className="size-4 text-amber-500" />
          {localeLabel(locale, '이번 주 금융 개념 배움터', 'Weekly Economic Lore & Wisdom', '今週の金融概念アカデミー', '本周金融知识讲堂')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-xl border-border/80 bg-card p-5 space-y-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-foreground [word-break:keep-all]">
              {localeLabel(locale, '복리 예금 vs 주식 배당의 시간 가치', 'Compounding Interest vs Dividends', '複利預金 vs 配当の複利効果', '复利储蓄与股票分红的时间价值')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
              {localeLabel(
                locale,
                '중앙은행 복리 예금은 변동성 없이 안전하게 자산을 불려주며, 가상 주식 배당은 기업 성장에 따른 추가 WLD 현금 흐름을 창출합니다. 분산 투자가 핵심입니다.',
                'Virtual bank compound deposits offer safe growth, while stock dividends yield extra WLD cash flows. Diversification is key.',
                '中央銀行の複利預金は安定した資産形成を支え、株式配当は企業の成長に応じた追加WLDキャッシュフローを生み出します。',
                '中央银行复利存款提供稳定的资产增值，虚拟股票分红则随企业成长带来额外的WLD现金流。分散投资至关重要。',
              )}
            </p>
          </Card>

          <Card className="rounded-xl border-border/80 bg-card p-5 space-y-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-foreground [word-break:keep-all]">
              {localeLabel(locale, '시장 유동성과 호가 스프레드의 이해', 'Market Liquidity & Spread Dynamics', '市場流動性とスプレッドの仕組み', '市场流动性与买卖价差解析')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
              {localeLabel(
                locale,
                '유동성이 풍부한 종목은 매수/매도 호가 차이(스프레드)가 좁아 대량 주문에도 체결 슬리피지가 적습니다. AI 시나리오 발표 시 거래량이 급증합니다.',
                'High liquidity narrows the bid-ask spread, reducing slippage on large orders. AI scenario releases trigger sudden volume surges.',
                '流動性が高い銘柄は買気配・売気配の差（スプレッド）が狭く、大口注文でも有利に約定します。AIニュース発表時に出来高が急増します。',
                '高流动性股票的买卖价差较小，大单交易滑点低。AI事件发布时交易量往往大幅激增。',
              )}
            </p>
          </Card>

          <Card className="rounded-xl border-border/80 bg-card p-5 space-y-2.5">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-foreground [word-break:keep-all]">
              {localeLabel(locale, '직업 숙련도 보조금과 경제 순환', 'Career Mastery Subsidies & Velocity', '職業熟練度と経済循環の加速', '职业熟练度补贴与经济循环')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
              {localeLabel(
                locale,
                '유저들이 직업 업무를 수행해 획득한 WLD는 상점 소비 및 주식 매수로 이어지며 머니버스 전체 통화 유통 속도(Velocity)를 높입니다.',
                'WLD earned from career tasks flows into shops and stocks, driving the velocity of currency throughout the Moneyverse.',
                'ユーザーが職業活動で得たWLDはショップや株式市場へ循環し、マネーバース全体の通貨流通速度を高めます。',
                '玩家通过职业任务获得的WLD流入商店消费与股市投资，推动整个月德经济体货币流通速度提升。',
              )}
            </p>
          </Card>
        </div>
      </section>

      {/* A durable backend poll/receipt does not exist; never simulate community participation. */}
      <section aria-labelledby="poll-heading" className="space-y-4">
        <h2 id="poll-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Vote aria-hidden="true" className="size-4 text-primary" />
          {localeLabel(locale, '독자 시장 전망 투표', 'Community Market Sentiment Poll', '市場見通し投票', '市场展望投票')}
        </h2>
        <Card className="rounded-2xl border-border/80 bg-card">
          <CardHeader>
            <CardTitle>시장 전망 투표는 현재 이용할 수 없습니다</CardTitle>
            <CardDescription role="status" aria-live="polite">
              투표 결과를 검증할 수 없어 참여 인원과 비율을 표시하지 않습니다. 서버 저장 및 중복 투표 방지 기능이 준비되기 전까지 투표를 접수하지 않습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* 멀티플렉스 추천 콘텐츠 광고 (Multiplex Matched Content Ad) */}
      <MultiplexAdvertisement className="my-6" />

      {/* 원클릭 소셜 공유 바 */}
      <SocialShareToolbar
        title="월덕 머니버스 주간 경제 브리프 & 실시간 AI 시황"
        description="가상 시장 펄스, 이번 주 세계가 주목하는 핵심 금융 사건 및 AI 시나리오 분석"
        url="/newspaper"
        hashtags={['월덕머니버스', 'AI시황뉴스', '가상경제', '주식브리프']}
      />

      {/* 6. Action Dock */}
      <footer className="rounded-2xl border border-border/80 bg-muted/30 p-6 text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">
          {localeLabel(locale, '가상 경제 생태계 둘러보기', 'Explore the Virtual Ecosystem', '仮想経済エコシステムを探検', '探索虚拟经济生态')}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" className="h-10 text-xs font-semibold">
            <Link href="/stocks">
              <TrendingUp className="size-4 mr-1.5 text-emerald-500" />
              {localeLabel(locale, '주식 거래소', 'Stock Market', '株式取引所', '股票市场')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 text-xs font-semibold">
            <Link href="/bank">
              <Landmark className="size-4 mr-1.5 text-amber-500" />
              {localeLabel(locale, '가상 은행', 'Bank & Savings', '仮想銀行', '虚拟银行')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 text-xs font-semibold">
            <Link href="/work">
              <Briefcase className="size-4 mr-1.5 text-blue-500" />
              {localeLabel(locale, '직업 잡보드', 'Career Board', '職業ボード', '职业中心')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 text-xs font-semibold">
            <Link href="/chat">
              <Share2 className="size-4 mr-1.5 text-purple-500" />
              {localeLabel(locale, '1:1 쪽지함', 'Private Chat', 'メッセージ', '私信聊天')}
            </Link>
          </Button>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}
