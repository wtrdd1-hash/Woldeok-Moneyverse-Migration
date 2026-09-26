import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, BarChart3, ShieldCheck, Zap, BookOpen, Layers } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/guide/stock-trading');
  const ogImageUrl = buildOgImageUrl({
    title: '가상 주식 실전 매매 & 호가창 분석 가이드',
    description: '10-Depth 실시간 호가창 보는 법부터 AI 뉴스 감성 지표 활용, 지정가/시장가 분할 매매 전략까지 완벽 정리.',
    type: 'default',
    badge: '가상 거래소 가이드',
  });

  return {
    title: '가상 주식 실전 매매 & 호가창 분석 가이드 — 월덕 머니버스',
    description: '10-Depth 실시간 호가창 해석, 체결 틱 분석, AI 시장 감성 지표(Greed & Fear) 활용법 및 가상 주식 분할 매매 전략을 안내합니다.',
    keywords: [
      '가상 주식 매매',
      '호가창 보는 법',
      '10-Depth 호가',
      '주식 차트 보는 법',
      '모의투자 가이드',
      '월덕 머니버스 주식',
      '가상 거래소 팁',
    ],
    alternates: {
      canonical: url,
      languages: {
        ko: url,
        en: url,
        ja: url,
        zh: url,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: '가상 주식 실전 매매 & 호가창 분석 가이드',
      description: '실시간 호가창 해석 및 분할 매매 전략 가이드',
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function StockTradingGuidePage() {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isEn
      ? 'Virtual Stock Trading & Orderbook Mastery Guide'
      : '가상 주식 실전 매매 & 호가창 분석 가이드',
    description: isEn
      ? 'Comprehensive guide to reading 10-Depth orderbooks, interpreting market sentiment, and applying limit order strategies in Woldeok Moneyverse.'
      : '10-Depth 실시간 호가창 해석, AI 뉴스 감성 지표 활용법 및 가상 주식 분할 매매 전략 가이드.',
    author: {
      '@type': 'Organization',
      name: 'Woldeok Moneyverse Finance Lab',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Woldeok Moneyverse',
    },
  };

  return (
    <div data-page="guide-stock-trading" className="mv-page mv-page--finance grid gap-6 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/guide">
          <ArrowLeft />
          {isEn ? 'Back to guides' : '가이드 센터로 돌아가기'}
        </Link>
      </Button>

      <PageHeader
        eyebrow="FINANCE STRATEGY PILLAR"
        title={isEn ? 'Virtual Stock Trading & Orderbook Mastery' : '가상 주식 실전 매매 & 호가창 분석 가이드'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Master the virtual financial markets with real-time 10-Depth orderbook analysis, spread monitoring, and AI-driven market sentiment indicators.'
            : '실시간 10-Depth 호가창의 매수·매도 잔량 불균형 분석부터 스프레드 추적, AI 뉴스 감성 지수 활용법까지 가상 시장에서 안정적인 WLD 수익을 창출하는 핵심 전략을 소개합니다.'}
        </p>
      </PageHeader>

      <div className="grid gap-6">
        {/* Section 1: 10-Depth Orderbook */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Layers className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '1. Understanding the 10-Depth Orderbook' : '1. 10-Depth 실시간 호가창 구조와 매매 압력 해석'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'How bid/ask imbalances reveal short-term momentum.' : '매수/매도 잔량 비율(Imbalance)을 통해 가격 변동 방향성 포착하기'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'The 10-Depth orderbook visualizes pending buy (bid) and sell (ask) orders across 10 distinct price tiers. By inspecting the depth bar, traders can gauge whether buyers or sellers dominate the market.'
                : '월덕 머니버스의 가상 주식 거래소는 상위 10단계 매수(Bid, 녹색) 및 매도(Ask, 적색) 호가 잔량을 실시간으로 시각화합니다. 호가창 상단의 매수/매도 압력 바(Pressure Bar)를 통해 시장 참여자들의 즉각적인 매수세와 매도세를 비교할 수 있습니다.'}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <TrendingUp className="size-4" />
                  {isEn ? 'Strong Bid Support' : '매수 우위 (Bid Domination)'}
                </div>
                <p className="text-xs text-foreground/80">
                  {isEn
                    ? 'When total bid volume significantly exceeds ask volume (e.g. >65%), price tends to resist downward pressure and rally.'
                    : '총 매수 잔량이 매도 잔량보다 65% 이상 많을 경우, 하락 지지선이 견고하게 형성되어 단기 반등 확률이 높아집니다.'}
                </p>
              </div>
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <BarChart3 className="size-4" />
                  {isEn ? 'Spread & Slippage Shield' : '스프레드(Spread) 관리'}
                </div>
                <p className="text-xs text-foreground/80">
                  {isEn
                    ? 'Narrow spread (low bps) ensures minimal transaction friction when executing large position entries.'
                    : '최우선 매수가와 매도가 간격(Spread bps)이 좁을 때 대량 주문을 체결해야 슬리피지(체결 오차) 손실을 최소화할 수 있습니다.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: AI Market Sentiment */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Zap className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '2. AI Market Sentiment Index (Greed & Fear)' : '2. AI 뉴스 감성 지수 (Greed & Fear) 공략법'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Translating algorithmic news events into profitable trades.' : 'AI 경제신문 발행 속보와 시장 탐욕/공포 점수의 상관관계'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'AI Council generates real-time market events ranging from corporate earnings shocks to macro interest rate shifts. The Market Sentiment Gauge quantifies these events into a 0-100 score.'
                : '로컬 AI 엔진이 10대 상장 가상기업(CHIPS, DUCKS, BIO 등)의 실적 발표, 신제품 출시, 규제 이벤트 등을 실시간 뉴스로 발행합니다. 시장 감성 지수는 이를 종합하여 0~100점의 수치로 산출합니다.'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-foreground/90 pl-1">
              <li>
                <b className="text-rose-500">0~25 (극단적 공포, Extreme Fear):</b> 악재 과열 구간으로 저평가 종목 분할 매수 적기.
              </li>
              <li>
                <b className="text-muted-foreground">46~55 (중립, Neutral):</b> 호가 스프레드가 안정적이며 추세 돌파 방향 관망 구간.
              </li>
              <li>
                <b className="text-cyan-500">76~100 (극단적 탐욕, Extreme Greed):</b> 호재 단기 선반영 구간으로 단계적 차익 실현 권장.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3: Cost-Basis Settlement Protection */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '3. 100% Cost-Basis Settlement & Compliance' : '3. 거래정지 시 매수원가(Cost-Basis) 100% 보장 시스템'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Zero-loss player protection on halted assets.' : '거래정지 이벤트 발생 시 원금 전액 원자적 환급 보호'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'Unlike unfair market crashes, Woldeok Moneyverse features an automated Cost-Basis Settlement engine. If a stock undergoes a mandatory halt, all held positions are refunded at 100% of your average acquisition cost.'
                : '가상 종목에 시스템 거래정지(Halt) 조치가 발동될 경우, 사용자가 손실을 보지 않도록 보유 주식의 평균 매입 단가(Average Cost Basis) 기준 100% 원금을 국고 비축 금고에서 수수료/세금 면제로 즉시 전액 환급합니다.'}
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-xs">
              <span>수수료·세금 면제: <b>0 WLD</b></span>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/40">
                100% 원금 환급 보장
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/5 mt-4">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            {isEn ? 'Ready to explore the live market?' : '지금 10대 가상 주식 실시간 시세를 확인해보세요'}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEn
              ? 'Check real-time prices and orderbooks without login.'
              : '로그인 없이도 실시간 10-Depth 호가창과 차트를 즉시 열람할 수 있습니다.'}
          </p>
        </div>
        <Button asChild className="shrink-0 w-full sm:w-auto">
          <Link href="/stocks">
            <BookOpen className="size-4 mr-1.5" />
            {isEn ? 'Go to Stock Hub' : '가상 주식 거래소 가기'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
