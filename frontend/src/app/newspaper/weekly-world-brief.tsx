import Link from 'next/link';
import { Activity, ArrowRight, BookOpen, Landmark, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeeklyBriefData } from './weekly-brief-contract';

export type { WeeklyBriefData } from './weekly-brief-contract';

export function WeeklyWorldBrief({ data }: { readonly data?: WeeklyBriefData | undefined }) {
  if (!data) {
    return (
      <section role="status" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div className="space-y-2">
            <h2 className="font-bold">주간 경제 브리프를 확인할 수 없습니다.</h2>
            <p>서버에서 검증된 경제 통계를 받지 못했습니다. 이전 예시 수치나 가상 순위는 표시하지 않습니다.</p>
            <Link href="/stocks" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
              가상 주식 거래소 보기 <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const formatted = BigInt(data.balanceSnapshotWld).toLocaleString('en-US');
  const observedAt = new Date(data.asOf).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <section aria-labelledby="verified-newspaper-heading" className="grid gap-5">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"><Activity aria-hidden="true" className="size-4" /> VERIFIED BALANCE SNAPSHOT</div>
        <h2 id="verified-newspaper-heading" className="mt-2 text-xl font-bold">검증된 가상경제 잔액 현황</h2>
        <p className="mt-2 text-sm text-muted-foreground">현재 서버가 확인한 회원 계정의 현금·예금 가용 잔액 합계입니다. 주간 거래량·수익률·소각량은 집계되지 않았습니다.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Landmark aria-hidden="true" className="size-5" /> 회원 현금·예금 잔액 합계</CardTitle>
          <CardDescription>활성 USER_CASH 및 USER_BANK 계정의 조회 시점 합계</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="break-all font-mono text-xl font-bold tabular-nums sm:text-2xl">{formatted} WLD</p>
          <p className="text-xs text-muted-foreground">집계 시각: <time dateTime={data.asOf}>{observedAt} (KST)</time></p>
          <p className="text-xs text-muted-foreground">M0 통화량이 아닌 회원 계정 잔액 일부의 현재 스냅샷입니다. 전체 발행량, 물가, 주간 변동률 또는 투자 수익률을 뜻하지 않습니다.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen aria-hidden="true" className="size-5" /> 금융 학습: 수치의 출처 확인하기</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>현재 잔액 합계만으로 지난주 거래량이나 통화 팽창률을 추론할 수 없습니다. 비교 지표는 동일한 기준과 기간의 검증된 기록이 필요합니다.</p>
          <Link href="/stocks" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
            실제 가상 주식 조회하기 <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
