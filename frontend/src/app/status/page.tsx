import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { STATUS_LABEL, asStatusState } from '@/lib/status';
import type { StatusState } from '@/lib/status';

export const revalidate = 30;

export const metadata: Metadata = {
  title: '서비스 상태',
  description: '월덕 머니버스가 기록한 서비스 상태',
  alternates: { canonical: '/status' },
};

interface StatusRow {
  readonly sourceKey: string;
  readonly displayName: string;
  readonly state: string;
  readonly detail: string | null;
  readonly observedAt: string | null;
}

/**
 * The badge variant per state. `outage` is the only destructive one; a
 * degraded service is still serving, and reporting both in the same red would
 * flatten a distinction the operator recorded deliberately.
 */
const VARIANT: Readonly<Record<StatusState, 'default' | 'secondary' | 'destructive' | 'outline'>> =
  {
    operational: 'default',
    degraded: 'secondary',
    outage: 'destructive',
    maintenance: 'outline',
    unknown: 'outline',
  };

export default async function StatusPage() {
  const data = await publicApi<{ status: StatusRow[] }>('/api/v1/status', 30);

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="LIVE SERVICE STATUS"
        title={
          <>
            추측하지 않고,
            <br />
            <Accent>기록으로 확인해요.</Accent>
          </>
        }
      >
        기록된 상태만 표시합니다. 확인되지 않은 항목은 추정하지 않고 확인 중으로 둡니다.
      </PageHeader>

      {data === null ? (
        <EmptyState title="지금은 상태를 불러올 수 없어요." />
      ) : data.status.length === 0 ? (
        <EmptyState title="아직 기록된 상태가 없어요." />
      ) : (
        <Card>
          <CardContent>
            <dl className="grid gap-3">
              {data.status.map((row) => {
                const state = asStatusState(row.state);
                return (
                  <div
                    key={row.sourceKey}
                    className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="grid gap-0.5">
                      <dt className="text-sm font-medium">{row.displayName}</dt>
                      {row.detail && (
                        <dd className="text-xs text-muted-foreground">{row.detail}</dd>
                      )}
                      {row.observedAt && (
                        <dd className="text-xs text-muted-foreground">
                          <time dateTime={row.observedAt}>{formatMoment(row.observedAt)}</time> 기준
                        </dd>
                      )}
                    </div>
                    <dd className="shrink-0">
                      <Badge variant={VARIANT[state]}>{STATUS_LABEL[state]}</Badge>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
