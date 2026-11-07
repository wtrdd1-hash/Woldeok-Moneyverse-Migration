import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 예측 마켓 | 거래 중단 안내',
  description: '월덕 머니버스 예측 마켓은 실제 거래·정산 근거가 검증되기 전까지 이용할 수 없습니다.',
  robots: { index: false, follow: false },
};

/** The backend deliberately refuses both market reads and orders until ledger receipts exist. */
export default function PredictionPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-amber-500/40 bg-card p-5 shadow-sm sm:p-9">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <ShieldAlert aria-hidden="true" className="size-5" />
          거래 검증 대기
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">월덕 가상 예측 마켓</h1>
        <div role="status" aria-live="polite" className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <h2 className="font-semibold">예측 거래 이용이 중단되었습니다.</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              검증된 예측 마켓 목록, 체결 기록 및 WLD 원장 정산 영수증을 제공할 수 없어
              현재 매수와 정산을 진행하지 않습니다. 표시할 수 있는 실제 시장 가격이나
              배당률도 없습니다. 이전 화면의 예시 수치와 체결 안내는 실제 거래 기록이 아닙니다.
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              이 화면에서 WLD가 차감되거나 예측 지분이 생성되지 않습니다.
              거래 기능은 원장 기반 체결·환급 검증을 완료한 뒤 별도 안내할 예정입니다.
            </p>
          </div>
        </div>
        <nav aria-label="다른 서비스" className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/stocks" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            주식 시장 <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/help" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            도움말
          </Link>
        </nav>
      </div>
    </main>
  );
}
