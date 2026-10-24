import { formatWld } from '@/lib/money';

export interface DailyActivityView {
  readonly scope: 'latest-50';
  readonly inspectedTransactions: number;
  readonly days: readonly {
    readonly date: string;
    readonly transactionCount: number;
    readonly incomingAmount: string;
    readonly outgoingAmount: string;
    readonly netAmount: string;
    readonly internalTransferCount: number;
  }[];
}

/** A sampled ledger summary, not complete per-day turnover or a financial statement. */
export function WalletDailyActivity({ data }: { readonly data: DailyActivityView | null }) {
  return (
    <section aria-labelledby="wallet-daily-title" className="grid gap-3">
      <h2 id="wallet-daily-title" className="text-lg font-semibold">날짜별 최근 거래 요약</h2>
      <p className="text-sm text-muted-foreground">
        최근 최대 50건의 원장 거래만 날짜별로 묶었습니다. UTC 기준이며 하루 전체 거래 합계가 아닐 수 있습니다.
      </p>
      {!data ? (
        <p role="status">지금은 날짜별 기록을 불러올 수 없어요.</p>
      ) : data.days.length === 0 ? (
        <p role="status">최근 거래가 없어요.</p>
      ) : (
        <ul className="grid gap-3" aria-label="최근 거래 날짜별 요약">
          {data.days.map((day) => (
            <li key={day.date} className="rounded-lg border border-border p-4">
              <h3 className="font-semibold"><time dateTime={day.date}>{day.date} UTC</time></h3>
              <p className="text-sm text-muted-foreground">{day.transactionCount}건 · 내부 이동 {day.internalTransferCount}건</p>
              <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
                <div><dt>유입</dt><dd>{formatWld(day.incomingAmount)}</dd></div>
                <div><dt>유출</dt><dd>{formatWld(day.outgoingAmount)}</dd></div>
                <div><dt>순변동</dt><dd>{formatWld(day.netAmount)}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
