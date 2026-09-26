import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Search, HelpCircle, Check, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/guide/glossary');
  const ogImageUrl = buildOgImageUrl({
    title: '핀테크 & 가상경제 핵심 금융 용어사전',
    description: '스프레드, 슬리피지, M0 통화량, 10-Depth 호가, 코스트 베이시스 등 가상경제 핵심 용어 15선.',
    type: 'default',
    badge: '용어사전',
  });

  return {
    title: '핀테크 & 가상경제 핵심 금융 용어사전 — 월덕 머니버스',
    description: '가상 주식 호가 스프레드, 슬리피지, M0 통화량, 리저브 비율, 매수원가(Cost Basis), 멱등성(Idempotency) 등 가상경제 핵심 용어를 쉽게 설명합니다.',
    keywords: [
      '가상경제 용어사전',
      '호가 스프레드 뜻',
      '슬리피지 의미',
      'M0 통화량',
      '코스트 베이시스',
      '핀테크 용어',
      '월덕 머니버스 용어',
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
      title: '핀테크 & 가상경제 핵심 금융 용어사전',
      description: '가상경제 및 핀테크 핵심 용어 해설집',
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

const GLOSSARY_ITEMS = [
  {
    term: '10-Depth 호가창 (10-Depth Orderbook)',
    en: '10-Depth Orderbook',
    category: '주식/거래',
    summary: '현재 시장 최우선 매수/매도 주문 상위 10개 단계의 가격과 수량을 실시간으로 보여주는 체결창.',
    detail: '거래 참여자들의 대기 주문 분포를 한눈에 파악할 수 있어 단기 매수세/매도세를 가늠하는 핵심 도구입니다.',
  },
  {
    term: '스프레드 (Spread bps)',
    en: 'Bid-Ask Spread',
    category: '주식/거래',
    summary: '최우선 매도 호가(Ask)와 최우선 매수 호가(Bid) 간의 가격 차이.',
    detail: '스프레드가 좁을수록(낮은 bps) 거래 유동성이 풍부하며, 주문 시 가격 손실 없이 즉시 체결될 확률이 높습니다.',
  },
  {
    term: '슬리피지 (Slippage)',
    en: 'Slippage',
    category: '주식/거래',
    summary: '주문 시점의 예상 가격과 실제 시장에서 체결된 최종 가격 간의 괴리.',
    detail: '대량 시장가 주문을 넣을 때 호가 잔량이 얇으면 상위 호가를 갉아먹으며 평균 체결 단가가 불리해집니다.',
  },
  {
    term: '매수원가 환급 (Cost-Basis Settlement)',
    en: 'Cost-Basis Settlement',
    category: '투자자 보호',
    summary: '종목 거래정지 시 시장가가 아닌 실제 유저가 취득한 평균 매입 단가로 100% 원금을 환급하는 시스템.',
    detail: '시장 급변으로 인한 거래정지 발생 시 사용자의 자산 손실을 방지하고 수수료와 세금을 전액 면제합니다.',
  },
  {
    term: 'M0 통화량 (M0 Monetary Base)',
    en: 'M0 Money Supply',
    category: '거시경제',
    summary: '월덕 머니버스 경제 시스템 내에 유통 중인 지갑 및 은행 예치 WLD의 총합.',
    detail: '국고 비축률과 함께 인플레이션 및 디플레이션을 측정하는 척도로 사용되며, AI 중앙은행이 실시간 모니터링합니다.',
  },
  {
    term: '국고 비축률 (Treasury Reserve Ratio)',
    en: 'Reserve Ratio',
    category: '거시경제',
    summary: '총 유통 통화량 대비 중앙은행 금고에 비축된 유동성 자산의 비율.',
    detail: '높은 비축률은 경제 위기 시 경기 부양 보조금 지급 및 주식 거래정지 환급을 안정적으로 지탱합니다.',
  },
  {
    term: '복리 연이율 (Compounding APR)',
    en: 'Annual Percentage Rate',
    category: '은행/금융',
    summary: '발생한 이자가 매일 원금에 가산되어 다시 이자를 발생시키는 연간 환산 수익률.',
    detail: '단리보다 장기 예치 시 자산 증가 속도가 기하급수적으로 빨라지는 금융의 마법입니다.',
  },
  {
    term: '멱등성 (Idempotency)',
    en: 'Idempotency Key',
    category: '보안/엔지니어링',
    summary: '네트워크 장애나 다중 클릭 시 동일한 요청이 여러 번 전송되어도 계좌에서 1회만 처리되도록 보장하는 기술.',
    detail: '송금 및 결제 시 유니크한 멱등키(UUID)를 발급하여 중복 인출 사고를 100% 원천 차단합니다.',
  },
];

export default async function GlossaryPage() {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GLOSSARY_ITEMS.map((item) => ({
      '@type': 'Question',
      name: `${item.term} (${item.en})`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${item.summary} ${item.detail}`,
      },
    })),
  };

  return (
    <div data-page="guide-glossary" className="mv-page mv-page--public grid gap-6 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/guide">
          <ArrowLeft />
          {isEn ? 'Back to guides' : '가이드 센터로 돌아가기'}
        </Link>
      </Button>

      <PageHeader
        eyebrow="FINTECH KNOWLEDGE BASE"
        title={isEn ? 'FinTech & Economy Glossary' : '핀테크 & 가상경제 핵심 금융 용어사전'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Clear, concise definitions for virtual trading, algorithmic economics, and financial safety mechanics in Woldeok Moneyverse.'
            : '가상 주식 호가창, 스프레드, 복리 예금, 통화량, 멱등성 등 가상경제 시뮬레이터에서 사용되는 핵심 금융·엔지니어링 용어를 알기 쉽게 정리했습니다.'}
        </p>
      </PageHeader>

      <div className="grid gap-3.5">
        {GLOSSARY_ITEMS.map((item, index) => (
          <Card key={index} className="border-border/80 bg-card/60">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    {item.term}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-1 space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p className="text-foreground font-medium">{item.summary}</p>
              <p className="text-xs text-muted-foreground/90">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/5 mt-4">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            {isEn ? 'Have more questions?' : '더 궁금한 가상 경제 기능이 있으신가요?'}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEn
              ? 'Visit our beginner guide or ask in the community board.'
              : '초보자 가이드 및 커뮤니티 자유게시판에서 다른 유저들과 토론해보세요.'}
          </p>
        </div>
        <Button asChild className="shrink-0 w-full sm:w-auto">
          <Link href="/guide">
            <HelpCircle className="size-4 mr-1.5" />
            {isEn ? 'Beginner Guide' : '초보자 가이드 메인'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
