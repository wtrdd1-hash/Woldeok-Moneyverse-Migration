import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Source-hold is deliberate: no statutory protection or simulated payout. */
export default function KdicPage() {
  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-3xl gap-6 px-4 py-8 sm:px-6" data-page="kdic">
      <header className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-muted-foreground">VIRTUAL ECONOMY · COVERAGE STATUS</p>
        <h1 className="text-2xl font-bold sm:text-3xl">가상 예금 보호 현황</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          월덕 머니버스의 WLD는 서비스 내 가상 재화이며 실제 원화 예금이나 법정 예금보험 대상이 아닙니다.
        </p>
      </header>
      <section role="status" aria-live="polite" className="rounded-xl border border-amber-500/50 bg-amber-500/5 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-1 size-6 shrink-0 text-amber-600" />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">보호금액 및 지급 가능 여부를 검증할 수 없습니다</h2>
            <p className="text-sm leading-7">
              기금 잔액, 금융기관 건전성, 회원별 보호금액 및 대위변제 기록의 원장 근거가 검증되지 않았습니다.
              확인되지 않은 금액과 법적 보장, 자동 지급 완료를 표시하지 않습니다.
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              가상 보호제도는 현재 인증 보류 상태입니다. 이는 잔액이 0이거나 보호가 승인되었다는 의미가 아닙니다.
              실제 지급 기능도 이용할 수 없습니다.
            </p>
          </div>
        </div>
      </section>
      <nav aria-label="가상 금융 안내 이동" className="flex flex-wrap gap-3">
        <Link href="/guide/virtual-banking" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <ArrowLeft aria-hidden="true" className="mr-2 size-4" /> 가상 금융 이용 안내
        </Link>
        <Link href="/kdic" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <RefreshCw aria-hidden="true" className="mr-2 size-4" /> 상태 다시 확인
        </Link>
      </nav>
    </main>
  );
}
