import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Landmark, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 예금보호 상태 안내',
  robots: { index: false, follow: false },
};

/** The public backend refuses insurance claims until a verifiable ledger contract exists. */
export default function KdicPortalPage() {
  return (
    <main data-page="kdic" className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <ShieldAlert className="size-5" aria-hidden="true" /> 가상경제 안전 안내
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">가상 예금보호 정보</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          월덕 머니버스의 WLD는 게임 내 가상 단위이며 대한민국의 법정통화나 실제 예금이 아닙니다.
          이 서비스는 대한민국 예금보험공사(KDIC) 또는 정부의 공식 서비스가 아닙니다.
        </p>
      </header>

      <section role="status" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="font-semibold">보호 한도와 지급 준비 상태를 확인할 수 없습니다</h2>
            <p className="text-sm leading-6">
              예금보호 기금, 금융기관 건전성, 회원별 보상액과 지급 영수증이 금융 원장으로 검증되지 않아
              보호 금액 계산 및 보장 정보를 제공하지 않습니다. 미확인 값을 0 또는 정상 상태로 표시하지 않습니다.
            </p>
            <p className="text-sm leading-6">
              관련 조회 API는 검증 가능한 계약이 준비되기 전까지 HTTP 503으로 응답합니다.
              WLD에 대한 법적 예금보호, 자동 대위변제 또는 확정 지급을 약속하지 않습니다.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Landmark className="size-5" aria-hidden="true" /> 가상 은행 현황</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">실제 회원별 가상 은행 정보는 은행 화면에서 별도로 확인할 수 있습니다. 해당 화면의 잔액은 예금보험 가입 증명이 아닙니다.</p>
            <Link href="/bank" className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              은행 화면으로 이동 <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">문의 및 도움말</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">가상 금융 기능의 상태가 불분명하면 운영 지원을 통해 문의해 주세요. 법적 보호를 전제로 거래하지 마세요.</p>
            <Link href="/help" className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              도움말 확인 <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
