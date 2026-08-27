import type { Metadata } from 'next';
import { Plate, Unavailable } from '@/components/ui/plate';
import { publicApi } from '@/lib/api';
import { STATUS_LABEL, asStatusState } from '@/lib/status';

export const revalidate = 30;

export const metadata: Metadata = {
  title: '서버 상태',
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

const TONE: Readonly<Record<string, string>> = {
  operational: 'text-[var(--foreground)]',
  degraded: 'text-[var(--color-rise)]',
  outage: 'text-[var(--color-rise)]',
  maintenance: 'text-[var(--muted)]',
  unknown: 'text-[var(--muted)]',
};

export default async function StatusPage() {
  const data = await publicApi<{ status: StatusRow[] }>('/api/v1/status', 30);

  return (
    <div className="grid gap-4">
      <h1 className="pt-4 text-2xl font-bold">서버 상태</h1>
      <p className="text-sm text-[var(--muted)]">
        기록된 상태만 표시합니다. 확인되지 않은 항목은 추정하지 않고 확인 중으로 둡니다.
      </p>

      {data === null ? (
        <Unavailable>지금은 상태를 불러올 수 없어요.</Unavailable>
      ) : data.status.length === 0 ? (
        <Unavailable>아직 기록된 상태가 없어요.</Unavailable>
      ) : (
        <Plate>
          <dl className="grid gap-3">
            {data.status.map((row) => {
              const state = asStatusState(row.state);
              return (
                <div
                  key={row.sourceKey}
                  className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <dt className="text-sm font-medium">{row.displayName}</dt>
                    {row.detail && (
                      <dd className="text-xs text-[var(--muted)]">{row.detail}</dd>
                    )}
                    {row.observedAt && (
                      <dd className="text-xs text-[var(--muted)]">
                        <time dateTime={row.observedAt}>
                          {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.observedAt))}
                        </time>{' '}
                        기준
                      </dd>
                    )}
                  </div>
                  <span className={`shrink-0 text-sm font-medium ${TONE[state]}`}>
                    {STATUS_LABEL[state]}
                  </span>
                </div>
              );
            })}
          </dl>
        </Plate>
      )}
    </div>
  );
}
