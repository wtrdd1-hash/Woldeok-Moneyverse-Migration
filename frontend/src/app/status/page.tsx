import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { LobbyCount } from '@/components/lobby-count';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { StatusDot } from '@/components/status-dot';
import { TimeAgo } from '@/components/time-ago';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { OVERALL_HEADLINE, STATUS_LABEL, asStatusState, overallState } from '@/lib/status';
import type { StatusState } from '@/lib/status';

/**
 * Thirty seconds, matching the collector's own interval: a page cached longer
 * than the data behind it changes would report a state that had already moved.
 */
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
  const rows = data?.status ?? [];
  const overall = overallState(rows.map((row) => asStatusState(row.state)));

  return (
    <div className="grid gap-6">
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
        수집기가 남긴 최근 기록만 표시합니다. 확인되지 않은 항목은 추정하지 않고 확인 중으로
        둡니다.
      </PageHeader>

      {/* The headline is worst-first and never better than the worst row: a
          page that averaged an outage away would be worse than no page. */}
      <Card className="border-l-4 border-l-forest">
        <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusDot state={overall} />
          <p className="text-lg font-bold">{OVERALL_HEADLINE[overall]}</p>
          <p className="ml-auto text-xs text-muted-foreground">
            {rows.length > 0 ? `${rows.length}개 항목 관측 중` : '관측 중인 항목 없음'}
          </p>
        </CardContent>
      </Card>

      <section aria-labelledby="status-list-title" className="grid gap-3">
        <SectionHeader
          eyebrow="CURRENT SNAPSHOTS"
          title="연결 상태"
          id="status-list-title"
          action={
            <Link href="/announcements" className="shrink-0 text-sm font-extrabold text-clay-ink">
              점검 공지 보기 →
            </Link>
          }
        />

        {data === null ? (
          <EmptyState title="지금은 상태를 불러올 수 없어요." />
        ) : rows.length === 0 ? (
          <EmptyState title="아직 기록된 상태가 없어요." />
        ) : (
          <Card>
            <CardContent>
              <dl className="grid gap-3">
                {rows.map((row) => {
                  const state = asStatusState(row.state);
                  return (
                    <div
                      key={row.sourceKey}
                      className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="grid gap-0.5">
                        <dt className="font-bold">{row.displayName}</dt>
                        {/* The collector writes what it measured here — a
                            round trip in milliseconds, or the status code it
                            was refused with. */}
                        {row.detail && (
                          <dd className="text-xs text-muted-foreground">{row.detail}</dd>
                        )}
                        {row.observedAt && (
                          <dd className="text-xs text-muted-foreground">
                            <time dateTime={row.observedAt}>
                              {formatMoment(row.observedAt)}
                            </time>{' '}
                            기준 · <TimeAgo at={row.observedAt} />
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
      </section>

      <section aria-labelledby="status-live-title" className="grid gap-3">
        <SectionHeader eyebrow="RIGHT NOW" title="지금 이 순간" id="status-live-title" />
        <Card>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {/* Not a snapshot: this one arrives over the lobby's own socket
                and changes while the page is open. */}
            <Figure term="웹 로비 접속자" value={<LobbyCount />} />
            <Figure
              term="상태 수집 주기"
              value={<span className="tabular">30초</span>}
              detail="이보다 오래된 기록은 확인 중으로 표시됩니다."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Figure({
  term,
  value,
  detail,
}: {
  readonly term: string;
  readonly value: React.ReactNode;
  readonly detail?: string;
}) {
  return (
    <div className="rounded-[12px] border bg-surface p-3">
      <p className="text-xs text-muted-foreground">{term}</p>
      <p className="text-lg font-bold">{value}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}
