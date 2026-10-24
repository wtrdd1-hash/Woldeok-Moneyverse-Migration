import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits, formatMoment } from '@/lib/money';

/** Actual owner postings of one ledger type, NOT all taxes or budget allocation. */
export interface TreasuryOutflowSummary {
  readonly source: 'posted_owner_ledger';
  readonly transactionType: 'USER_TO_TREASURY';
  readonly currency: 'WLD';
  readonly totalOutflowAmount: string;
  readonly transactionCount: string;
  readonly lastOccurredAt: string | null;
  readonly isTaxTotal: false;
}

export function TreasuryLedgerSummary({ summary }: { readonly summary: TreasuryOutflowSummary | null }) {
  const verified = summary?.source === 'posted_owner_ledger'
    && summary.transactionType === 'USER_TO_TREASURY'
    && summary.currency === 'WLD'
    && summary.isTaxTotal === false
    && /^(0|[1-9][0-9]*)$/.test(summary.totalOutflowAmount)
    && /^(0|[1-9][0-9]*)$/.test(summary.transactionCount);
  return (
    <Card data-testid="treasury-ledger-summary">
      <CardHeader><CardTitle>내 국고 이동 기록 · 원장 확인</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {!verified || !summary ? (
          <p role="status">현재 국고 이동 기록을 확인할 수 없어요. 실제 원장 조회가 가능해지면 표시합니다.</p>
        ) : (
          <>
            <p className="text-2xl font-semibold tabular-nums">{groupDigits(summary.totalOutflowAmount)} WLD</p>
            <p className="text-sm">국고 이동 {groupDigits(summary.transactionCount)}건</p>
            <p className="text-sm text-muted-foreground">마지막 원장 기록: {summary.lastOccurredAt ? formatMoment(summary.lastOccurredAt) : '기록 없음'}</p>
          </>
        )}
        <p className="text-sm text-muted-foreground">
          이 값은 내 현금·은행 계정에서 국고로 나간 USER_TO_TREASURY 원장 기록만 합산합니다.
          세금 전체 납부액이나 실제 목적별 예산 배분·배당 지급액을 뜻하지 않습니다.
        </p>
      </CardContent>
    </Card>
  );
}
