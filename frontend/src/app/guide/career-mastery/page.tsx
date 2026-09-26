import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Award, Flame, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/guide/career-mastery');
  const ogImageUrl = buildOgImageUrl({
    title: '직업 & 일일 WLD 파밍 루틴 마스터 가이드',
    description: '5대 전문 직업 숙련도 레벨링, 10분/70분 가상 경제 시계 활용 및 무자본 일일 WLD 파밍 공략법.',
    type: 'default',
    badge: '커리어 가이드',
  });

  return {
    title: '직업 & 일일 WLD 파밍 루틴 마스터 가이드 — 월덕 머니버스',
    description: '월덕 머니버스 5대 전문 직업(개발자, 트레이더, 광부, 요리사, 보안관) 전직 조건, 숙련도 보너스 및 일일 WLD 파밍 루틴을 총정리했습니다.',
    keywords: [
      '가상 직업 가이드',
      'WLD 파밍',
      '무자본 돈버는 법',
      '직업 숙련도',
      '월덕 머니버스 직업',
      '가상경제 게임 공략',
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
      title: '직업 & 일일 WLD 파밍 루틴 마스터 가이드',
      description: '5대 전문 직업 전직 및 일일 WLD 파밍 최적화 공략',
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function CareerMasteryGuidePage() {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isEn
      ? 'Career Mastery & Daily WLD Farming Routine Guide'
      : '직업 & 일일 WLD 파밍 루틴 마스터 가이드',
    description: isEn
      ? 'Complete breakdown of 5 core professions, mastery leveling mechanics, and daily WLD farming optimization in Woldeok Moneyverse.'
      : '5대 직업 전직 조건, 숙련도 레벨링 공식 및 무자본 일일 WLD 파밍 최적화 가이드.',
    author: {
      '@type': 'Organization',
      name: 'Woldeok Career Development Center',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Woldeok Moneyverse',
    },
  };

  return (
    <div data-page="guide-career-mastery" className="mv-page mv-page--economy grid gap-6 max-w-4xl mx-auto">
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
        eyebrow="CAREER STRATEGY PILLAR"
        title={isEn ? 'Career Mastery & Daily Farming Routine' : '직업 & 일일 WLD 파밍 루틴 마스터 가이드'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Level up across 5 specialized professions, unlock mastery multipliers up to 2.5x, and build an efficient daily zero-cost WLD earning routine.'
            : '초보자도 무자본으로 매일 안정적인 WLD를 획득할 수 있는 5대 전문 직업(개발자, 트레이더, 광부, 요리사, 보안관) 전직과 숙련도 2.5배 배수 성장법을 안내합니다.'}
        </p>
      </PageHeader>

      <div className="grid gap-6">
        {/* Section 1: 5 Core Professions */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Briefcase className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '1. The 5 Specialized Professions' : '1. 5대 전문 직업별 특화 분야와 보상 구조'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Choose the career path that aligns with your economic playstyle.' : '플레이 스타일에 맞는 최적의 직업 선택하기'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="rounded-xl border border-border/70 p-3.5 space-y-1 bg-surface">
              <div className="font-bold text-foreground text-sm flex items-center justify-between">
                <span>💻 소프트웨어 엔지니어</span>
                <Badge variant="outline">안정형</Badge>
              </div>
              <p className="text-muted-foreground">
                서버 배포 및 버그 패치 업무 수행. 매일 일정한 WLD 기본급과 시스템 안정화 기여 보너스 지급.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-3.5 space-y-1 bg-surface">
              <div className="font-bold text-foreground text-sm flex items-center justify-between">
                <span>📈 퀀트 트레이더</span>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">고수익형</Badge>
              </div>
              <p className="text-muted-foreground">
                시장 알고리즘 주문 및 유동성 공급. 거래 수수료 할인 혜택 및 호가창 분석 숙련도 가속.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-3.5 space-y-1 bg-surface">
              <div className="font-bold text-foreground text-sm flex items-center justify-between">
                <span>⛏️ 암호화폐 채굴자</span>
                <Badge variant="outline">성장형</Badge>
              </div>
              <p className="text-muted-foreground">
                블록 검증 연산 태스크 수행. 장비 업그레이드 시 일일 파밍 캡이 비례하여 확장됨.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-3.5 space-y-1 bg-surface">
              <div className="font-bold text-foreground text-sm flex items-center justify-between">
                <span>🛡️ 커뮤니티 보안관</span>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">기여형</Badge>
              </div>
              <p className="text-muted-foreground">
                스팸 감시 및 신고 검토 지원. 매월 국고 지원금 및 관리자 명예 뱃지 추가 보상.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Mastery Leveling */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Award className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '2. Mastery Multiplier (Up to 2.5x)' : '2. 숙련도(Mastery) 레벨링과 최대 2.5배 보상 배수'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Consecutive daily tasks permanently boost task payouts.' : '업무를 지속적으로 완수할수록 보상과 WLD 획득 효율 급상승'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isEn
                ? 'Each completed work task grants Profession EXP. As your mastery advances from Novice (1.0x) to Grandmaster (2.5x), the base WLD reward for every task increases proportionally.'
                : '업무를 1회 완료할 때마다 직업 경험치(EXP)가 누적됩니다. 숙련도가 초보(1.0x) ➡️ 숙련(1.4x) ➡️ 장인(1.8x) ➡️ 그랜드마스터(2.5x)로 승급하면 동일한 시간 대비 2.5배의 WLD를 획득할 수 있습니다.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <Badge variant="secondary">초보: 1.0x</Badge>
              <Badge variant="secondary">숙련: 1.4x</Badge>
              <Badge variant="secondary">장인: 1.8x</Badge>
              <Badge variant="default" className="bg-amber-500 text-black font-bold">그랜드마스터: 2.5x</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Daily Routine */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <Flame className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {isEn ? '3. Optimal 10-Minute Daily Farming Routine' : '3. 1일 10분 완성 최적의 WLD 파밍 루틴'}
                </CardTitle>
                <CardDescription>
                  {isEn ? 'Maximize WLD generation without spending real money.' : '하루 10분 접속으로 최대 15,000 WLD를 확보하는 완벽 루틴'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Step 1: 덕이 펫 쓰다듬기 & 포춘쿠키 쪼개기</b> (+500 ~ +1,000 WLD)
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Step 2: 직업 일일 업무 완수 (3회)</b> (+3,000 ~ +7,500 WLD)
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Step 3: 황금 오리 피버 타임 광클 & 여론 잭팟 투표</b> (+1,000 ~ +5,000 WLD)
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Step 4: 획득한 WLD 전액 중앙은행 예금 예치</b> (일일 복리 이자 시작)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 mt-4">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            {isEn ? 'Ready to start your profession?' : '지금 직업을 선택하고 첫 업무를 시작해보세요'}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEn
              ? 'Zero real money required. 100% fair game economy.'
              : '현금 결제 없이 100% 무료로 시작할 수 있습니다.'}
          </p>
        </div>
        <Button asChild className="shrink-0 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
          <Link href="/work">
            <Briefcase className="size-4 mr-1.5" />
            {isEn ? 'Go to Career Center' : '직업 센터 바로가기'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
