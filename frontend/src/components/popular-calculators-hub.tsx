import Link from 'next/link';
import { TrendingUp, Calculator, Sparkles, ChevronRight, Coins, Building2, Flame, Receipt, ArrowRightLeft } from 'lucide-react';
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

const POPULAR_REAL_ESTATE_CALCULATORS: readonly HubLinkItem[] = [
  {
    title: '강남 테헤란로 프라임 오피스 월세/임대 수익률',
    desc: '매매가 15억, 월세 650만원 기준 레버리지 ROE 및 Cap Rate 계산',
    href: '/tools/real-estate-calculator/gangnam-office',
    tag: '오피스 1위',
    highlight: true,
  },
  {
    title: '여의도 금융가 펜트하우스 임대수익률',
    desc: '매매가 25억, 월세 1,100만원 하이엔드 주거 월세 수익 모델',
    href: '/tools/real-estate-calculator/yeouido-penthouse',
    tag: '하이엔드',
  },
  {
    title: '판교 테크노밸리 개발자 스튜디오 월세',
    desc: '소액 오피스텔 투자로 공실 없는 IT 직주근접 월세 수령',
    href: '/tools/real-estate-calculator/pangyo-studio',
    tag: '소액 투자',
    highlight: true,
  },
  {
    title: '성수 아뜰리에 팝업 상가 임대수익률',
    desc: 'MZ 핫플레이스 성수동 카페거리 상가 Cap Rate 시뮬레이션',
    href: '/tools/real-estate-calculator/seongsu-atelier',
    tag: '상가/팝업',
  },
];

const POPULAR_KIMCHI_CALCULATORS: readonly HubLinkItem[] = [
  {
    title: '비트코인 (BTC) 실시간 김치프리미엄 계산기',
    desc: '업비트 vs 바이낸스 실시간 시세 격차 및 재정거래 마진',
    href: '/tools/kimchi-premium-calculator/btc',
    tag: '대장주',
    highlight: true,
  },
  {
    title: '이더리움 (ETH) 김프 & 가스비 차감 순차익',
    desc: '국내외 이더리움 가격 차이와 전송 수수료 시뮬레이션',
    href: '/tools/kimchi-premium-calculator/eth',
    tag: '스마트컨트랙트',
  },
  {
    title: '리플 (XRP) 초저수수료 김프 보따리 계산기',
    desc: '해외 송금 대표 코인 리플의 실시간 김프 차익 전송',
    href: '/tools/kimchi-premium-calculator/xrp',
    tag: '초저수수료',
    highlight: true,
  },
  {
    title: '솔라나 (SOL) 김치프리미엄 & 환율 계산기',
    desc: '초고속 L1 솔라나의 국내외 거래소 시세 갭 분석',
    href: '/tools/kimchi-premium-calculator/sol',
    tag: '고속 체인',
  },
];

const POPULAR_TAX_CALCULATORS: readonly HubLinkItem[] = [
  {
    title: '엔비디아 500만원 익절 양도세 & 250만 공제',
    desc: '미국주식 250만원 비과세 적용 후 22% 세금 계산 및 손익상계 팁',
    href: '/tools/capital-gains-tax-calculator/nvda-gain-5m',
    tag: '서학개미 1위',
    highlight: true,
  },
  {
    title: '손익 상계 최적화 (세금 0원 만들기)',
    desc: '물린 손실 종목을 12월에 동시 매도하여 양도세 0원으로 줄이기',
    href: '/tools/capital-gains-tax-calculator/tax-loss-harvesting',
    tag: '필수 절세법',
    highlight: true,
  },
  {
    title: '테슬라 1,000만원 수익 양도소득세 시뮬레이터',
    desc: '1천만원 실현수익에 대한 22% 세액 및 분할 매도 비교',
    href: '/tools/capital-gains-tax-calculator/tsla-gain-10m',
    tag: '천만클럽',
  },
  {
    title: '250만원 비과세 한도 딱 맞추기 계산기',
    desc: '매년 세금 0원으로 미국주식 250만원 비과세 100% 챙기기',
    href: '/tools/capital-gains-tax-calculator/250k-exemption-max',
    tag: '비과세 극대화',
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
    desc: '7일/30일/90일 정기 예적금 일일 복리 이자 수령 시스템',
    href: '/bank',
    tag: '안전자산',
  },
  {
    title: '자산 진단 & 3섹터 분산 투자 분석기',
    desc: '허핀달-허쉬만(HHI) 지수 기반 자산 집중도 진단 및 리밸런싱',
    href: '/stocks/portfolio',
    tag: 'AI 진단',
  },
];

interface PopularCalculatorsHubProps {
  readonly currentPresetSlug?: string | undefined;
  readonly currentCategory?: string | undefined;
  readonly className?: string | undefined;
}

export function PopularCalculatorsHub({
  currentPresetSlug,
  currentCategory,
  className = '',
}: PopularCalculatorsHubProps) {
  return (
    <section className={`space-y-6 pt-6 border-t border-zinc-800/80 ${className}`}>
      {/* 타이틀 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
              🔥 실시간 인기 금융 계산기 & 핀테크 도구 TOP
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            검색 유입 1위 종목별 물타기 시뮬레이터, 복리 이자 계산기, 가상 부동산 및 절세 도구를 무료로 이용하세요.
          </p>
        </div>

        <Link
          href="/tools"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          전체 도구 보기
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5대 섹션 그리드 */}
      <div className="space-y-6">
        {/* 1. 주식 물타기 계산기 TOP 6 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>실시간 인기 주식 물타기 평단가 계산기</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POPULAR_STOCK_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-850 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      item.highlight
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* 2. 신규 롱테일: 가상 부동산 & 오피스 임대수익률 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-3">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>가상 부동산 및 오피스/상가 월세 임대수익률 (Cap Rate & ROE)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POPULAR_REAL_ESTATE_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-850 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      item.highlight
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. 신규 롱테일: 코인 김치프리미엄 & 환율 차익 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-3">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>코인 실시간 김치프리미엄 (업비트 vs 바이낸스) & 보따리 차익</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POPULAR_KIMCHI_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-850 hover:border-amber-500/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      item.highlight
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. 신규 롱테일: 주식 양도소득세 & 250만원 절세 시뮬레이터 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-3">
            <Receipt className="w-3.5 h-3.5 text-cyan-400" />
            <span>해외주식 22% 양도소득세 & 250만원 비과세 절세 시뮬레이터</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POPULAR_TAX_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-850 hover:border-cyan-500/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      item.highlight
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* 5. 복리 예적금 계산기 TOP 4 */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-3">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>목돈 모으기 복리 적금 & 정기예금 이자 계산기</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POPULAR_COMPOUND_CALCULATORS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-850 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      item.highlight
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
