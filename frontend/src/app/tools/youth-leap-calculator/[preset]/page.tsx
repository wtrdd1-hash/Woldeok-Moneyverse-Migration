import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, ArrowLeft, CheckCircle2, TrendingUp, PiggyBank, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InArticleAdvertisement } from '@/components/public-advertisement';
import { UserConversionLockInWidget } from '@/components/user-conversion-lockin-widget';
import { PopularCalculatorsHub } from '@/components/popular-calculators-hub';
import { YOUTH_LEAP_PRESETS } from '@/config/pseo-youth-leap.config';

interface Props {
  readonly params: Promise<{ readonly preset: string }>;
}

export async function generateStaticParams() {
  return YOUTH_LEAP_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { preset } = await params;
  const data = YOUTH_LEAP_PRESETS.find((p) => p.slug === preset);
  if (!data) return {};

  const title = `${data.title} | 월덕 머니버스 금융 도구`;
  const description = `월 ${data.monthlyDeposit.toLocaleString()}원 납입 시 5년 만기 총 수령액 ${data.totalPayout.toLocaleString()}원! 정부 기여금과 은행 비과세 이자를 정밀 계산해 드립니다.`;

  return {
    title,
    description,
    keywords: ['청년도약계좌', '청년도약계좌 계산기', '정부기여금', '만기 수령액', '비과세 적금', data.badge],
    alternates: {
      canonical: `https://easy-scraping.com/tools/youth-leap-calculator/${preset}`,
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/youth-leap-calculator/${preset}`,
      type: 'article',
    },
  };
}

export default async function YouthLeapPresetPage({ params }: Props) {
  const { preset } = await params;
  const data = YOUTH_LEAP_PRESETS.find((p) => p.slug === preset);
  if (!data) notFound();

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* 상단 내비게이션 빵부스러기 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/tools">
            <ArrowLeft className="size-4" /> 금융 도구 허브로 돌아가기
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs font-bold">
            <Sparkles className="size-3 mr-1" /> {data.badge}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">5년 비과세 적금</span>
        </div>
      </div>

      {/* 헤더 섹션 */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <PiggyBank className="size-8 text-amber-500 shrink-0" />
          <span>{data.title}</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          월 {data.monthlyDeposit.toLocaleString()}원 저축 시 정부 지원금과 은행 이자를 합산한 5년 만기 실제 수령액 시뮬레이션 결과입니다.
        </p>
      </div>

      {/* 핵심 수치 하이라이트 3열 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 bg-card/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">5년 본인 납입 원금</CardDescription>
            <CardTitle className="text-xl font-black font-mono text-foreground">
              {data.totalPrincipal.toLocaleString()}원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">월 {data.monthlyDeposit.toLocaleString()}원 × 60개월</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">정부 기여금 + 비과세 이자</CardDescription>
            <CardTitle className="text-xl font-black font-mono text-emerald-400">
              +{(data.govContribution + data.bankInterest).toLocaleString()}원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-emerald-400/90 font-medium">기여금 {data.govContribution.toLocaleString()}원 + 이자 {data.bankInterest.toLocaleString()}원</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/40 bg-amber-500/10 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-amber-400 font-semibold">5년 만기 최종 수령액</CardDescription>
            <CardTitle className="text-2xl font-black font-mono text-amber-300">
              {data.totalPayout.toLocaleString()}원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="border-amber-400 bg-amber-400/20 text-amber-300 text-[11px] font-bold">
              총 수익률 {data.yieldPercent}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 고단가 인아티클 네이티브 광고 슬롯 */}
      <InArticleAdvertisement className="my-6" />

      {/* 신규 유저 락인 & 가입 전환 A/B 테스트 위젯 */}
      <UserConversionLockInWidget
        title={data.title}
        summaryLabel="5년 만기 예상 수령액"
        summaryValue={`${data.totalPayout.toLocaleString()}원`}
        toolCategory="savings"
      />

      {/* FAQ 아코디언 */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <h3 className="text-base font-bold text-foreground">자주 묻는 질문 (FAQ)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.faqList.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-border/70 bg-secondary/30 p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-amber-400 shrink-0" />
                {faq.question}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5대 인기 계산기 롱테일 허브 추천 */}
      <PopularCalculatorsHub />
    </div>
  );
}
