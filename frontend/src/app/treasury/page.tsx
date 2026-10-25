import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Landmark } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국고 공개 데이터 검증 중 | 월덕 머니버스',
  description: '월덕 머니버스의 국고 잔액·지출 원장은 공개 검증 계약이 준비될 때까지 조회할 수 없습니다. 임의의 재정 수치나 지급 영수증은 표시하지 않습니다.',
  robots: { index: false, follow: false },
};

export default async function TreasuryPage() {
  return (
    <main className="container mx-auto max-w-4xl space-y-6 px-4 py-6 pb-20 sm:py-8">
      <PageHeader eyebrow="가상경제 국고 공개" title="국고 공개 데이터 검증 중">
        <span>실제 WLD 원장으로 확인되지 않은 잔액·지출·수혜 자격은 공개하지 않습니다.</span>
      </PageHeader>
      <section
        role="status"
        aria-live="polite"
        aria-labelledby="treasury-verification-title"
        className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-7"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-6 shrink-0 text-amber-500" aria-hidden="true" />
          <div className="min-w-0 space-y-3">
            <h2 id="treasury-verification-title" className="text-lg font-bold text-foreground">
              국고 재정 공시를 일시 보류합니다
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              공개용 서버·PostgreSQL 조회 및 원장 영수증의 검증이 완료되지 않았습니다.
              따라서 국고 잔액, 수혜자 수, 최근 지출 내역, 지원금 수령 자격을 임의의 수치로 표시하지 않습니다.
              현재 이 화면에서는 지원금 수령·창업 그랜트 신청·예산 투표를 처리하지 않습니다.
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              기존 회원의 실제 거래 내역은 로그인 후 본인 지갑에서 확인할 수 있습니다.
              WLD는 서비스 내 가상 단위이며 실제 법정화폐나 정부 지원금이 아닙니다.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/wallet/activity"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Landmark className="size-4" aria-hidden="true" />
                본인 지갑 거래 내역
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/support"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
