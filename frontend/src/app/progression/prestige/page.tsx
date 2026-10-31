import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';
import { requireMember } from '@/lib/session';

/** Prestige has no ledger-backed burn, insurance or relic ownership contract. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '프레스티지 환생 — 거래 준비 중',
  description: '가상 프레스티지 환생은 원장 정산과 보상 지급 검증이 완료될 때까지 이용할 수 없습니다.',
  robots: { index: false, follow: false },
};

export default async function PrestigePage() {
  await requireMember();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6" data-page="prestige">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">PROGRESSION / PRESTIGE</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">프레스티지 환생</h1>
        <p className="text-sm text-muted-foreground">
          게임 내 자산 소각, 환생 등급 및 유물 장착은 확인된 원장 기록으로만 안내합니다.
        </p>
      </header>
      <section aria-labelledby="prestige-hold-title" className="space-y-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 size-6 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="space-y-2">
            <h2 id="prestige-hold-title" className="text-lg font-bold">프레스티지 거래를 현재 제공하지 않습니다</h2>
            <p role="status" className="text-sm leading-relaxed">
              소각 영수증, 환생 등급, 영구 배수, 유물 소유권 및 보험 적용 근거가 검증되지 않았습니다.
              따라서 현재 자산, 예상 소각액, 환생 성공 여부를 임의로 표시하지 않습니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-border bg-background/80 p-4 text-sm">
          <LockKeyhole className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>환생 및 유물 장착 요청은 서버에서도 차단됩니다. 이 화면에서 WLD가 소각되거나 보상이 지급되지 않습니다.</p>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>서비스 제공 전까지 기존 회원 자산과 성장 기록은 이 기능으로 변경되지 않습니다.</p>
        </div>
      </section>
      <Link href="/progression" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2">
        <ArrowLeft className="size-4" aria-hidden="true" /> 성장 단계로 돌아가기
      </Link>
    </main>
  );
}
