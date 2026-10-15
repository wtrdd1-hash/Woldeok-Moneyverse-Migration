import type { Metadata } from 'next';
import { Landmark, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국고 재정 검증 현황 | Woldeok Moneyverse',
  description: '국고 금고, 자동 재정운용, 시민 지원금 및 복식부기 검증 진행 현황을 안내합니다. 검증 전 지급 실적은 공개하지 않습니다.',
  robots: { index: false, follow: false },
};

export default function TreasuryPage() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6 pb-24">
      <PageHeader
        eyebrow="Treasury accounting review · 국고 회계 검증"
        title="대국민 국고 재정 검증 현황"
      >
        국고 자금의 출처, 실제 지급 영수증 및 복식부기 대사가 확인되기 전까지
        지급액과 수혜 실적을 확정 수치로 제공하지 않습니다.
      </PageHeader>
      <section
        role="status"
        aria-label="국고 재정 검증 상태"
        className="rounded-2xl border border-amber-500/40 bg-card p-5 sm:p-7 space-y-4"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert aria-hidden="true" className="size-5 text-amber-500" />
          국고 재정 검증 중 / Financial reconciliation pending
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          세금·기부·국부펀드·국채·연금·시민배당·창업 지원금은 실제 경제 원장의 재원과
          지급 증빙이 확인될 때까지 신청 및 자동 지급을 보류합니다.
          과거 화면의 예시 수치와 지급 기록은 실제 지급 증명이 아닙니다.
        </p>
        <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-4 text-sm">
          <Landmark aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          <span>
            표시 가능한 검증된 공시 잔액·가용 잉여금·지급 내역이 현재 없습니다.
            이는 국고 잔액이 0 WLD라는 뜻이 아닙니다.
            검증된 공개 원장 조회 기능이 준비되면 이 페이지에서 공시합니다.
          </span>
        </div>
      </section>
    </main>
  );
}
