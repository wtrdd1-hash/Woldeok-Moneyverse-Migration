import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Percent,
  Banknote,
  Coins,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Flame,
  Landmark,
  Building,
  GraduationCap,
  PiggyBank,
} from 'lucide-react';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { canonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: '17종 금융 계산기 & 절세 시뮬레이터 종합 센터 | 월덕 머니버스',
  description: '복리 계산기, 주식 평단가 물타기, 연봉 실수령액, 대출이자, 배당소득세, 양도소득세, ISA, IRP 연금저축, FIRE 조기은퇴 계산기 등 대한민국 필수 금융 계산기 17종 무료 제공.',
  alternates: {
    canonical: canonicalUrl('/calculators'),
  },
  openGraph: {
    title: '17종 금융 계산기 & 절세 시뮬레이터 종합 센터 | 월덕 머니버스',
    description: '복리부터 주식 물타기, 세금, 대출, 연금까지 한번에 계산하는 대한민국 1등 무료 금융 도구 포털.',
    url: canonicalUrl('/calculators'),
    siteName: '월덕 머니버스',
    locale: 'ko_KR',
    type: 'website',
  },
};

const CALCULATOR_ITEMS = [
  {
    category: '주식 & 투자',
    icon: TrendingUp,
    color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30',
    items: [
      {
        name: '주식 물타기 / 평단가 계산기',
        href: '/tools/stock-calculator',
        desc: '현재 보유 수량/단가와 추가 매수량에 따른 최종 평단가를 즉시 산출합니다.',
        badge: '인기 1위',
      },
      {
        name: '복리 수익률 & 적립식 계산기',
        href: '/tools/compound-calculator',
        desc: '월 적립액, 기대 수익률, 투자 기간에 따른 복리 마법을 그래프로 확인합니다.',
        badge: '필수',
      },
      {
        name: '배당소득세 & 배당률 계산기',
        href: '/tools/dividend-tax-calculator',
        desc: '국내/해외 주식 15.4% 원천징수 후 세후 실수령 배당금 및 월 배당 파이프라인 분석.',
        badge: '배당주 추천',
      },
      {
        name: '주식 양도소득세 계산기',
        href: '/tools/capital-gains-tax-calculator',
        desc: '해외주식 250만원 기본공제 및 22% 양도소득세 과세표준 절세 전략 수립.',
        badge: '해외주식 필수',
      },
    ],
  },
  {
    category: '월급 & 절세 & 은퇴',
    icon: Banknote,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    items: [
      {
        name: '연봉 실수령액 계산기',
        href: '/tools/salary-calculator',
        desc: '2026년 최신 4대 보험요율(국민연금, 건보료, 장기요양, 고용) 및 근로소득세 반영.',
        badge: '직장인 필수',
      },
      {
        name: 'ISA 개인종합자산관리계좌 계산기',
        href: '/tools/isa-calculator',
        desc: '일반형/서민형 비과세 한도 초과 시 9.9% 분리과세 절세 혜택 완벽 비교.',
        badge: '절세 끝판왕',
      },
      {
        name: '연금저축 & IRP 세액공제 계산기',
        href: '/tools/pension-tax-calculator',
        desc: '연간 최대 900만원 한도 13.2%~16.5% 연말정산 환급금 및 은퇴 후 연금소득세.',
        badge: '연말정산',
      },
      {
        name: '조기은퇴 FIRE족 목표 자산 계산기',
        href: '/tools/fire-calculator',
        desc: '트리니티 스터디 4% 안전인출률 기반 은퇴에 필요한 순자산과 저축 목표.',
        badge: 'FIRE족',
      },
      {
        name: '국민연금 예상 수령액 계산기',
        href: '/tools/retirement-calculator',
        desc: '가입 기간과 기준소득월액 기반 만 65세 이후 예상 노령연금 모의 계산.',
        badge: '노후 대비',
      },
      {
        name: '종합소득세 간이 계산기',
        href: '/tools/tax-calculator',
        desc: '프리랜서, 개인사업자 과세표준 구간별 세율 및 누진공제 간이 계산.',
        badge: 'N잡러',
      },
      {
        name: '증여세 자동 계산기',
        href: '/tools/gift-tax-calculator',
        desc: '배우자 6억, 직계존비속 5천만원 공제 한도 적용 및 세액 공제 산출.',
        badge: '자산 승계',
      },
    ],
  },
  {
    category: '부동산 & 대출 & 청년지원',
    icon: Building,
    color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    items: [
      {
        name: '대출 이자 & 상환 스케줄 계산기',
        href: '/tools/loan-interest-calculator',
        desc: '원리금균등, 원금균등, 만기일시 상환 방식별 월 상환액과 총 대출이자 비교.',
        badge: '대출 비교',
      },
      {
        name: '부동산 중개보수 & 취득세 계산기',
        href: '/tools/real-estate-calculator',
        desc: '주택 매매/임대차 법정 중개수수료 상한요율 및 취득세율 즉시 조회.',
        badge: '부동산',
      },
      {
        name: '청년도약계좌 만기 수령액 계산기',
        href: '/tools/youth-leap-calculator',
        desc: '5년 만기 시 정부 기여금 매칭 + 비과세 혜택으로 최대 5,000만원 목돈 마련.',
        badge: '청년 혜택',
      },
    ],
  },
  {
    category: '가상자산 & 시뮬레이션',
    icon: Coins,
    color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
    items: [
      {
        name: '김치 프리미엄 & 환율 차익 계산기',
        href: '/tools/kimchi-premium-calculator',
        desc: '국내 거래소 vs 해외 거래소 간 실시간 암호화폐 시세 괴리율 및 차익 추정.',
        badge: '코인 필수',
      },
      {
        name: '암호화폐 APY 복리 예치 계산기',
        href: '/tools/crypto-apy-calculator',
        desc: '일복리/월복리 스테이킹 보상과 예치 기간에 따른 최종 자산 증식 계산.',
        badge: '스테이킹',
      },
      {
        name: '머니버스 가상 채굴 ROI 계산기',
        href: '/tools/farming-calculator',
        desc: '가상 채굴기 전력 효율, 일일 채굴량 및 투자 원금 회수 일수 시뮬레이션.',
        badge: '플랫폼 독점',
      },
    ],
  },
];

export default function CalculatorsHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://easy-scraping.com/calculators',
        'url': 'https://easy-scraping.com/calculators',
        'name': '17종 금융 계산기 & 절세 시뮬레이터 종합 센터',
        'isPartOf': {
          '@type': 'WebSite',
          '@id': 'https://easy-scraping.com/#website',
          'name': '월덕 머니버스',
          'url': 'https://easy-scraping.com',
        },
        'description': '복리, 주식 평단가, 연봉 실수령액, 대출이자, 세금, 연금 등 대한민국 17종 금융 계산기 모음.',
      },
      {
        '@type': 'SoftwareApplication',
        'name': '월덕 머니버스 금융 계산기 수트',
        'operatingSystem': 'All',
        'applicationCategory': 'FinanceApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'KRW',
        },
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '월덕 머니버스 금융 계산기는 무료인가요?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': '네, 17종의 모든 금융 공학 계산기와 시뮬레이션 도구는 별도의 회원가입 없이 누구나 100% 무료로 이용하실 수 있습니다.',
            },
          },
          {
            '@type': 'Question',
            'name': '주식 물타기 계산기는 어떻게 작동하나요?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': '현재 보유하고 계신 주식의 매수 평단가와 수량, 그리고 추가로 매수할 단가와 수량을 입력하시면 가중평균 방식을 통해 최종 매수 평단가와 총 매수 필요 금액을 즉시 산출해 드립니다.',
            },
          },
          {
            '@type': 'Question',
            'name': '2026년 최신 4대 보험 요율이 반영되어 있나요?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': '네, 연봉 실수령액 계산기 및 소득세 계산기는 대한민국 최신 국민연금, 건강보험, 장기요양보험, 고용보험 요율과 간이세액표를 기준으로 정밀하게 계산됩니다.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>대한민국 1위 무료 금융 솔루션</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            17종 금융 계산기 & 절세 시뮬레이터
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            복리 투자부터 주식 물타기, 연봉 실수령액, 대출이자, 배당소득세, 절세 연금까지.
            검증된 알고리즘으로 자산 증식과 절세 전략을 수립해 보세요.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/stock-calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              <span>주식 물타기 계산기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tools/compound-calculator"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <span>복리 수익률 계산기</span>
            </Link>
            <Link
              href="/tools/salary-calculator"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <span>연봉 실수령액 계산기</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Banner Advertisement */}
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <PublicAdvertisement slot="home-header-banner" />
      </div>

      {/* Main Categories Grid */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {CALCULATOR_ITEMS.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <section key={cat.category} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className={`rounded-xl border p-2.5 bg-gradient-to-br ${cat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 sm:text-2xl">{cat.category}</h2>
                  <p className="text-xs text-slate-400">총 {cat.items.length}개 금융 공학 도구</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900/90 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                          {tool.badge}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-100 group-hover:text-emerald-300">
                        {tool.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {tool.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {idx === 1 && (
                <div className="pt-4">
                  <PublicAdvertisement slot="blog-in-article" />
                </div>
              )}
            </section>
          );
        })}

        {/* Bottom Multiplex Ad */}
        <div className="pt-8">
          <PublicAdvertisement slot="blog-bottom-multiplex" />
        </div>

        {/* FAQ Section with Schema Support */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <HelpCircle className="h-5 w-5" />
            <h2 className="text-xl font-bold text-slate-100">자주 묻는 질문 (FAQ)</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200">Q. 계산 결과를 신뢰할 수 있나요?</h3>
              <p className="mt-1 text-slate-400 text-xs sm:text-sm leading-relaxed">
                모든 계산기는 대한민국 세법, 금융위원회 공시 기준 및 표준 복리 수식을 준수하여 설계되었습니다. 단, 개인별 비과세 감면 여부 및 금융사별 세부 약관에 따라 소액의 오차가 발생할 수 있으므로 최종 결정 시 금융기관 확인을 권장합니다.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200">Q. 개인정보나 입력한 금액 데이터가 서버에 저장되나요?</h3>
              <p className="mt-1 text-slate-400 text-xs sm:text-sm leading-relaxed">
                아닙니다. 모든 계산 로직은 고객님의 웹 브라우저(클라이언트) 내부에서 즉시 처리되며, 입력하신 자산 규모나 소득 정보는 외부 서버에 절대 전송되거나 기록되지 않습니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
