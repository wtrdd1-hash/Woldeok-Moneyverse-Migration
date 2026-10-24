import { formatWld } from '@/lib/money';

export interface RecentInsightsView {
  readonly scope: 'recent';
  readonly requestedLimit: number;
  readonly sampledCount: number;
  readonly incomingAmount: string;
  readonly outgoingAmount: string;
  readonly netAmount: string;
  readonly neutralCount: number;
}

/** Server-confirmed summary of the same owner-scoped rows shown below. */
export function RecentLedgerInsights({ insights }: { readonly insights: RecentInsightsView }) {
  if (insights.scope !== 'recent' || !Number.isSafeInteger(insights.requestedLimit)
    || insights.requestedLimit < 1 || insights.requestedLimit > 50
    || !Number.isSafeInteger(insights.sampledCount) || insights.sampledCount < 0
    || insights.sampledCount > insights.requestedLimit) return null;

  return (
    <section aria-label="최근 지갑 거래 요약" className="mb-5 rounded-lg border bg-muted/30 p-4">
      <h2 className="font-semibold">최근 최대 {insights.requestedLimit}건 거래 요약</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        조회된 {insights.sampledCount}건만 계산했습니다. 전체 기간 합계가 아닙니다.
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div><dt className="text-sm text-muted-foreground">입금 합계</dt><dd className="break-all font-semibold tabular-nums">{formatWld(insights.incomingAmount)}</dd></div>
        <div><dt className="text-sm text-muted-foreground">출금 합계</dt><dd className="break-all font-semibold tabular-nums">{formatWld(insights.outgoingAmount)}</dd></div>
        <div><dt className="text-sm text-muted-foreground">순변동</dt><dd className="break-all font-semibold tabular-nums">{formatWld(insights.netAmount)}</dd></div>
        <div><dt className="text-sm text-muted-foreground">내부 이동·순변동 0</dt><dd className="font-semibold tabular-nums">{insights.neutralCount}건</dd></div>
      </dl>
    </section>
  );
}
