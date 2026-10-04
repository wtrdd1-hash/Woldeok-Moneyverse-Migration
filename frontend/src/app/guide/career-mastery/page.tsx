import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Award,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Landmark,
  Building2,
  Cpu,
  Coins,
  ShieldCheck,
  Newspaper,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { getServerLocale } from '@/lib/locale-server';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CareerStepByStepGuide } from './career-step-by-step-guide';
import { LegacyVisitorBanner } from './legacy-visitor-banner';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/guide/career-mastery');
  const ogImageUrl = buildOgImageUrl({
    title: '8대 전문 직업 2.0 & 실전 WLD 급여 파밍 완벽 가이드',
    description: '직업 선택부터 업무 수락, 쿨다운 타이머, 급여 수령, 7대 승진 티어 및 자격증 보너스까지 총정리.',
    type: 'default',
    badge: '전문 직업 2.0',
  });

  return {
    title: '8대 전문 직업 2.0 & 일일 WLD 급여 파밍 완벽 가이드 — 월덕 머니버스',
    description: '월덕 머니버스 8대 전문 직업(핀테크 개발자, 퀀트 트레이더, 중앙은행가, 부동산 재벌, AI 연구원, 벤처 투자가, 보안 감사관, 언론 기자) 전직, 4단계 업무 수행법 및 3배 숙련도 승진 공략집.',
    keywords: [
      '가상 직업 가이드',
      'WLD 파밍',
      '무자본 돈버는 법',
      '직업 숙련도',
      '월덕 머니버스 직업',
      '가상경제 직업 2.0',
      '핀테크 개발자',
      '퀀트 트레이더',
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
      title: '8대 전문 직업 2.0 & 일일 WLD 급여 파밍 완벽 가이드',
      description: '8대 전문 직업 전직 및 실전 4단계 업무 수행, 숙련도 3배 승진 완벽 공략집',
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
      ? '8 Professional Careers 2.0 & Daily WLD Farming Master Guide'
      : '8대 전문 직업 2.0 & 일일 WLD 급여 파밍 완벽 가이드',
    description: isEn
      ? 'Complete breakdown of 8 core professions, 4-step work lifecycle, mastery tier progression, and daily WLD farming optimization in Woldeok Moneyverse.'
      : '8대 전문 직업 전직 조건, 4단계 업무 수행법, 7대 숙련도 승진 공식 및 무자본 일일 WLD 파밍 최적화 가이드.',
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
    <div data-page="guide-career-mastery" className="mv-page mv-page--economy grid gap-8 max-w-4xl mx-auto pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground hover:text-white">
          <Link href="/guide">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {isEn ? 'Back to Guide Center' : '가이드 센터로 돌아가기'}
          </Link>
        </Button>

        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/20 font-mono text-xs">
          CAREER SYSTEM 2.0
        </Badge>
      </div>

      <PageHeader
        eyebrow="CAREER & WORKFORCE MASTERCLASS"
        title={isEn ? '8 Professional Careers & Daily Farming Master Guide' : '8대 전문 직업 2.0 & 실전 급여 파밍 완벽 가이드'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Start with zero capital, choose from 8 specialized careers, complete work assignments, and level up to a 3.0x Grandmaster payout multiplier.'
            : '투자금 0원으로 시작하는 머니버스 공식 기본소득 엔진! 8대 전문 직업군으로 자유롭게 전직하고, 4단계 업무를 완수하여 매일 최대 100,000 WLD 이상의 급여와 3배 숙련도 보너스를 획득하세요.'}
        </p>
      </PageHeader>

      {/* 레거시 기술 블로그 검색 유입자 환영 및 개발자 직업 전직 전환 배너 */}
      <LegacyVisitorBanner />

      {/* 핵심 4대 탭 인터랙티브 시뮬레이터 & 도감 */}
      <CareerStepByStepGuide />

      {/* 콘텐츠 내 자동 삽입 광고 (In-Article Native Fluid Ad) */}
      <InArticleAdvertisement className="my-4" />

      {/* Section: 4단계 실전 업무 수칙 & 급여 쿼터 관리 */}
      <div className="grid gap-6">
        <Card className="border-border/80 bg-zinc-950/90 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Percent className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  {isEn ? 'Daily & Weekly Earnings Quota System' : '일일 및 주간 급여 상한 쿼터(Quota) 관리'}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  {isEn ? 'Fair economy cap preventing bot inflation while rewarding active players.' : '가상 경제 인플레이션을 방어하고 모든 유저에게 공정한 기본소득을 보장하는 스마트 쿼터'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-zinc-300">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>📅 일일 급여 한도 (Daily Cap)</span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">기본 50,000 WLD</Badge>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  매일 자정(00:00 KST)에 초기화되며, 숙련도 레벨이 오를수록 일일 한도가 최대 150,000 WLD까지 자동 확장됩니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                <div className="font-bold text-cyan-400 flex items-center justify-between">
                  <span>📊 주간 누적 한도 (Weekly Cap)</span>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300">기본 300,000 WLD</Badge>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  매주 월요일 자정에 리셋되며, 주간 목표 쿼터를 달성하면 중앙은행에서 주간 성과급 보너스 국채가 지급됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section: 무자본 유저를 위한 10분 일일 파밍 루틴 */}
        <Card className="border-border/80 bg-zinc-950/90 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <Flame className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  {isEn ? 'Optimal 10-Minute Daily Farming Routine' : '무자본 1일 10분 완성 최적의 WLD 파밍 루틴'}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  {isEn ? 'Maximize WLD generation without spending real money.' : '하루 10분 접속으로 최대 30,000 WLD를 확보하는 실전 경제 성장 사이클'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <div>
                <b className="text-white">접속 직후 무료 룰렛 돌리기</b> (<span className="text-emerald-400">+500 ~ +10,000 WLD</span>)
                <p className="text-zinc-400 text-[11px] mt-0.5">카지노에서 24시간마다 1회 무료 행운 보너스를 획득합니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <div>
                <b className="text-white">전문 직업 업무 3회 완수</b> (<span className="text-emerald-400">+4,500 ~ +15,000 WLD</span>)
                <p className="text-zinc-400 text-[11px] mt-0.5">30초~60초 쿨다운 업무를 수락하고 완료하여 급여와 경험치를 수령합니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <div>
                <b className="text-white">AI 투자 성향 진단 & 퀘스트 보너스</b> (<span className="text-emerald-400">+20,000 WLD</span>)
                <p className="text-zinc-400 text-[11px] mt-0.5">30초 퀴즈로 내 성향을 확인하고 포트폴리오 진단 리워드를 받습니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                4
              </span>
              <div>
                <b className="text-white">수령한 급여 전액 중앙은행 스마트 복리 포켓 예치</b> (<span className="text-amber-400">일일 복리 이자 개시</span>)
                <p className="text-zinc-400 text-[11px] mt-0.5">벌어들인 WLD를 놀리지 않고 복리 포켓에 넣어두면 매일 자정에 이자가 불어납니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 멀티플렉스 추천 콘텐츠 광고 (Multiplex Matched Content Ad) */}
      <MultiplexAdvertisement className="my-6" />

      {/* CTA 하단 배너 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 shadow-2xl">
        <div className="space-y-1">
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isEn ? 'Ready to choose your first career?' : '지금 직업을 선택하고 첫 급여를 수령해보세요!'}
          </h4>
          <p className="text-xs text-zinc-400">
            {isEn
              ? 'Zero real money required. 100% fair and free virtual economy.'
              : '현금 결제 전혀 없이 100% 무료로 시작할 수 있습니다.'}
          </p>
        </div>

        <Button asChild className="shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-6 shadow-lg">
          <Link href="/work">
            <Briefcase className="size-4 mr-2" />
            {isEn ? 'Go to Career Center' : '전문 직업 센터 바로가기'}
          </Link>
        </Button>
      </div>
    </div>
  );
}

