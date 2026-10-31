import type { Metadata } from 'next';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { parseRoadmapMarketEvidence } from './roadmap-evidence';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '머니버스 시작 가이드 | 가입·직업·가상 주식 탐색',
  description: '월덕 머니버스의 가입, 직업과 가상 주식 시장을 탐색하는 입문 안내입니다. 보상, 금리, 거래 가능 여부는 각 기능의 실제 서버 상태를 확인하세요.',
  alternates: {
    canonical: 'https://easy-scraping.com/roadmap',
    languages: {
      'ko-KR': 'https://easy-scraping.com/roadmap',
      'en-US': 'https://easy-scraping.com/en/roadmap',
      'ja-JP': 'https://easy-scraping.com/ja/roadmap',
      'zh-CN': 'https://easy-scraping.com/zh/roadmap',
      'x-default': 'https://easy-scraping.com/roadmap',
    },
  },
};

const STEPS = [
  {
    number: '01',
    title: '계정 만들기',
    detail: '이용 약관과 개인정보 안내를 확인한 뒤 회원가입을 진행하세요. 가입만으로 특정 WLD 보상이 보장되지는 않습니다.',
    href: '/register',
    label: '회원가입 안내 열기',
  },
  {
    number: '02',
    title: '직업과 과제 알아보기',
    detail: '현재 제공되는 직업과 과제의 참여 조건을 확인하세요. 지급 금액과 완료 여부는 실제 서버 영수증이 기준입니다.',
    href: '/work',
    label: '직업 화면 열기',
  },
  {
    number: '03',
    title: '가상 주식 시장 살펴보기',
    detail: '시장 화면에서 종목과 거래 조건을 확인하세요. 예시 수익률이나 특정 기간 내 자산 증식을 약속하지 않습니다.',
    href: '/stocks',
    label: '가상 주식 화면 열기',
  },
] as const;

export default async function RoadmapPage() {
  // Nest GET /api/v1/stocks reads the scoped stock_market_overview() SQL function.
  // This is public, read-only evidence; no session or financial write is required.
  const evidence = parseRoadmapMarketEvidence(await publicApi<unknown>('/api/v1/stocks', 0));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Woldeok Moneyverse · Quickstart</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">머니버스 시작 가이드</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          가입부터 직업, 가상 주식 시장 탐색까지 순서대로 알아보세요. 이 안내는 게임 내 기능의 이용 경로를 설명하며
          일정 기간의 WLD 수익, 무료 보상, 예금 금리 또는 부동산 임대료를 보장하지 않습니다.
        </p>
      </header>

      <section aria-labelledby="roadmap-market-source" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 id="roadmap-market-source" className="text-lg font-semibold">가상 주식 시장 자료 확인</h2>
        <div role="status" aria-live="polite" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {evidence.kind === 'unavailable'
            ? '시장 정보를 확인할 수 없습니다. 서버 연결 또는 응답 형식을 다시 확인해야 합니다. 종목이 0개라는 뜻은 아닙니다.'
            : evidence.count === 0
              ? '서버 응답은 확인했지만 현재 표시할 종목이 없습니다.'
              : `서버 응답에서 ${evidence.count}개 종목을 확인했습니다. 시세 갱신 시각과 거래 가능 여부는 이 안내에서 검증되지 않습니다.`}
        </div>
        <Link href="/stocks" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          시장 화면에서 다시 확인하기 →
        </Link>
      </section>

      <nav aria-label="머니버스 시작 순서">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.number} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <span className="text-xs font-bold text-primary">STEP {step.number}</span>
              <h2 className="text-lg font-bold">{step.title}</h2>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              <Link href={step.href} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {step.label} →
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <p className="text-xs leading-relaxed text-muted-foreground">WLD는 서비스 안에서만 사용하는 가상 재화입니다. 실제 화폐·예금·증권이 아니며, 게임의 기능 제공 여부와 보상 정책은 변경될 수 있습니다.</p>
    </div>
  );
}
