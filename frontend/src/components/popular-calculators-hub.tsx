import Link from 'next/link';
import { TrendingUp, Calculator, Sparkles, ChevronRight, Coins, Building2, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HubLinkItem {
  readonly title: string;
  readonly desc: string;
  readonly href: string;
  readonly tag: string;
  readonly highlight?: boolean;
}

const POPULAR_STOCK_CALCULATORS: readonly HubLinkItem[] = [
  {
    title: '삼성전자 -20% 물타기 평단가 계산기',
    desc: '7.5만원 고점 물림 시 평단가 낮추기 및 손익분기점 시뮬레이션',
    href: '/tools/stock-calculator/samsung-minus-20',
    tag: '국내 1위',
    highlight: true,
  },
  {
    title: '엔비디아 (NVDA) -20% 물타기 계산기',
    desc: 'AI 대장주 분할 매수 평단가 회복 시나리오',
    href: '/tools/stock-calculator/nvda-minus-20',
    tag: '미국 빅테크',
    highlight: true,
  },
  {
    title: '테슬라 (TSLA) -30% 물타기 계산기',
    desc: '변동성 큰 테슬라 주가 반등 시 필요한 추가 매수 금액',
    href: '/tools/stock-calculator/tsla-minus-30',
    tag: '서학개미 최애',
    highlight: true,
  },
  {
    title: 'SK하이닉스 -20% 물타기 계산기',
    desc: 'HBM 반도체 주가 조정기 평단가 탈출 전략',
    href: '/tools/stock-calculator/sk-hynix-minus-20',
    tag: '반도체 대장',
  },
  {
    title: '비트코인 (BTC) -20% 물타기 계산기',
    desc: '디지털 금 9천만원대 분할 매수 평단가 역산',
    href: '/tools/stock-calculator/btc-minus-20',
    tag: '크립토',
  },
  {
    title: 'SOXL (반도체 3배) -50% 반토막 탈출 계산기',
    desc: '3배 레버리지 ETF 극한 하락 시 본전 탈출 필요 매수 수량',
    href: '/tools/stock-calculator/soxl-minus-50',
    tag: '3X 레버리지',
  },
];

const POPULAR_COMPOUND_CALCULATORS: readonly HubLinkItem[] = [
  {
    title: '1억 모으기 월 100만원 5년 복리 계산기',
    desc: '매월 100만원씩 연 7% 복리 적금 시 5년 만기 예상 수령액',
    href: '/tools/compound-calculator/monthly-1m-5y',
    tag: '사회초년생 필수',
    highlight: true,
  },
  {
    title: '1천만원 3년 연 5% 복리 이자 계산기',
    desc: '정기예금 복리 이자와 단리 대비 추가 수익 비교',
    href: '/tools/compound-calculator/10m-3y-5p',
    tag: '예금 비교',
    highlight: true,
  },
  {
    title: '5천만원 5년 연 8% 복리 굴리기 시뮬레이터',
    desc: '목돈 5,000만원을 고배당 복리로 굴렸을 때 자산 증가 그래프',
    href: '/tools/compound-calculator/50m-5y-8p',
    tag: '목돈 굴리기',
  },
  {
    title: '월 50만원 10년 1억 만들기 적금 계산기',
    desc: '소액 적립식 투자로 10년 뒤 1억원 종잣돈 만드는 법',
    href: '/tools/compound-calculator/monthly-500k-10y',
    tag: '장기 적립',
  },
];

const POPULAR_MONEYVERSE_SERVICES: readonly HubLinkItem[] = [
  {
    title: '가상 부동산 메가시티 랜드 분양 거래소',
    desc: '강남, 여의도, 판교 8대 도시 구역 토지 소유 및 실시간 임대료 수령',
    href: '/spaces/real-estate',
    tag: '신규 오픈',
    highlight: true,
  },
  {
    title: 'WDX 가상 주식 거래소 & 호가창',
    desc: '8대 WDX 상장 종목 및 10대 가상 주식 실시간 차트 & 분산 투자',
    href: '/stocks',
    tag: '실시간 거래',
  },
  {
    title: '중앙은행 스마트 복리 포켓 & 국채',
    desc: '7일/30일/90일 만기 정기 예적금 일일 복리 이자 자동 정산',
    href: '/bank',
    tag: '연 12% 만기',
  },
  {
    title: '럭키 777 클래식 슬롯 & 하이로우 20',
    desc: 'Web Audio 사운드와 3D 모션 블러로 즐기는 공정성 검증 아케이드',
    href: '/casino',
    tag: '미니게임',
  },
];

export function PopularCalculatorsHub({ currentCategory }: { readonly currentCategory?: string }) {
  return (
    <section aria-label="실시간 인기 금융 계산기 & 서비스 허브" className="space-y-6 pt-8 border-t border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1">
              <Flame className="size-3.5 text-amber-500" />
              <span>실시간 검색 유입 인기 TOP</span>
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-mono">
              2026 핀테크 무료 도구
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1 flex items-center gap-2">
            <Calculator className="size-6 text-indigo-500" />
            <span>함께 많이 찾는 금융 계산기 & 추천 시뮬레이터</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            복리 예적금 계산기부터 주식/가상자산 물타기 평단가 역산까지 0.1초 만에 무료로 계산하세요.
          </p>
        </div>

        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>전체 금융 도구 허브 보기</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* 3대 그리드 카드 섹션 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* 1. 인기 주식 물타기 계산기 */}
        <Card className="border-border/80 hover:border-amber-500/40 transition-all bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="size-4 text-rose-500" />
              <span>주식·코인 평단가 물타기</span>
            </CardTitle>
            <CardDescription className="text-xs">
              고점 매수 후 반토막 탈출을 위한 필수 평단가 시뮬레이션
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {POPULAR_STOCK_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-xl border border-border/60 bg-muted/30 p-2.5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    {item.title}
                  </span>
                  <Badge variant={item.highlight ? 'default' : 'secondary'} className="text-[10px] shrink-0 font-mono scale-90">
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {item.desc}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* 2. 인기 복리 예적금 계산기 */}
        <Card className="border-border/80 hover:border-indigo-500/40 transition-all bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Coins className="size-4 text-amber-500" />
              <span>목돈 굴리기 & 1억 복리 적금</span>
            </CardTitle>
            <CardDescription className="text-xs">
              월복리 효과와 세후 만기 수령액 실시간 비교
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {POPULAR_COMPOUND_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-xl border border-border/60 bg-muted/30 p-2.5 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {item.title}
                  </span>
                  <Badge variant={item.highlight ? 'default' : 'secondary'} className="text-[10px] shrink-0 font-mono scale-90">
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {item.desc}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* 3. 머니버스 경제 서비스 바로가기 */}
        <Card className="border-border/80 hover:border-emerald-500/40 transition-all bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Building2 className="size-4 text-emerald-500" />
              <span>가상 경제 & 핀테크 서비스</span>
            </CardTitle>
            <CardDescription className="text-xs">
              실제 분산 원장 기반 실시간 가상 주식 및 부동산 시스템
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {POPULAR_MONEYVERSE_SERVICES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-xl border border-border/60 bg-muted/30 p-2.5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                    {item.title}
                  </span>
                  <Badge variant={item.highlight ? 'default' : 'secondary'} className="text-[10px] shrink-0 font-mono scale-90">
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {item.desc}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
