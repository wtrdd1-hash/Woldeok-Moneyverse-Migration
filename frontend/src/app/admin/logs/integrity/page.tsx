import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { adminArea } from '../../areas';
import type {
  AuditDisposition,
  AuditRetentionCategory,
  ChainVerificationHistory,
} from '../../types';
import {
  DispositionForm,
  RetentionPolicyDialog,
  VerificationBadge,
  VerifyChainForm,
} from './integrity-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs/integrity');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

/**
 * The trail's own accounting: is it intact, how long is it kept, and what was
 * done with what is past that.
 *
 * A hash chain nobody recomputes proves nothing — it only proves something
 * once somebody has recomputed it and the result is on record, which is why
 * every verification is written down here rather than printed and forgotten.
 *
 * Retention and disposition sit on the same page because they are the same
 * obligation seen from two ends: the published notice promises a period, and
 * this is where an operator says what happened when one ended. Nothing here
 * deletes an audit row — the application holds no privilege to — so a
 * disposition is a person's statement about work done elsewhere, with an
 * evidence hash over the rows it names.
 */
export default async function AdminAuditIntegrityPage() {
  await requireAdminConsole(AREA.href);

  const [verifications, retention, dispositions] = await Promise.all([
    apiOrNull<{ verifications: ChainVerificationHistory[] }>(
      '/api/v1/admin/audit/verifications',
    ),
    apiOrNull<{ categories: AuditRetentionCategory[] }>('/api/v1/admin/audit/retention'),
    apiOrNull<{ dispositions: AuditDisposition[] }>('/api/v1/admin/audit/dispositions'),
  ]);

  const categories = retention?.categories.map((entry) => entry.category) ?? [];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-1">
        <AdminBack />
        <Button asChild variant="ghost" className="w-fit text-muted-foreground">
          <Link href="/admin/logs">감사 로그</Link>
        </Button>
      </div>
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">체인 검증</CardTitle>
          <CardDescription>
            지정한 구간의 해시를 다시 계산해 기록된 값과 맞춰 봅니다. 결과는 실행할 때마다
            검증 이력으로 남습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyChainForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 검증 이력</CardTitle>
          <CardDescription>경고 열은 사슬 끊김 / 내용 불일치 / 컬럼 불일치 순입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {verifications === null ? (
            <EmptyState title="검증 이력을 불러오지 못했어요." />
          ) : verifications.verifications.length === 0 ? (
            <EmptyState title="아직 실행한 검증이 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>완료 시각</TableHead>
                    <TableHead>구간</TableHead>
                    <TableHead className="text-right">검사</TableHead>
                    <TableHead className="text-right">일치</TableHead>
                    <TableHead className="text-right">구버전</TableHead>
                    <TableHead className="text-right">경고</TableHead>
                    <TableHead>결과</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.verifications.map((row) => (
                    <TableRow key={row.verification_id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatMoment(row.completed_at)}
                      </TableCell>
                      <TableCell className="tabular font-mono text-[0.7rem]">
                        {row.from_sequence} – {row.to_sequence}
                      </TableCell>
                      <TableCell className="tabular text-right">{row.checked_count}</TableCell>
                      <TableCell className="tabular text-right">{row.verified_count}</TableCell>
                      <TableCell className="tabular text-right text-muted-foreground">
                        {row.legacy_count}
                      </TableCell>
                      <TableCell className="tabular text-right">
                        <Alarms row={row} />
                      </TableCell>
                      <TableCell>
                        <VerificationBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="audit-retention" className="grid gap-3">
        <SectionHeader eyebrow="RETENTION" title="보존과 파기" id="audit-retention" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">보존 정책 현황</CardTitle>
            <CardDescription>
              공개된 개인정보처리방침이 약속하는 기간과 같아야 합니다. 인증·권한 거부 기록은
              90일, 관리자·경제 감사 기록은 1년으로 065가 심어 둔 값입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {retention === null ? (
              <EmptyState title="보존 정책을 불러오지 못했어요." />
            ) : retention.categories.length === 0 ? (
              <EmptyState title="등록된 보존 정책이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>구분</TableHead>
                      <TableHead className="text-right">보존 기간</TableHead>
                      <TableHead>기준 시각</TableHead>
                      <TableHead className="text-right">전체</TableHead>
                      <TableHead className="text-right">기간 지남</TableHead>
                      <TableHead>지난 구간</TableHead>
                      <TableHead>최근 처리</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retention.categories.map((row) => (
                      <TableRow key={row.category}>
                        <TableCell className="font-mono text-xs">{row.category}</TableCell>
                        <TableCell className="tabular text-right">{row.retention_days}일</TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatMoment(row.cutoff_at)}
                        </TableCell>
                        <TableCell className="tabular text-right">{row.total_rows}</TableCell>
                        <TableCell
                          className={`tabular text-right ${row.expired_rows === '0' ? '' : 'font-bold text-clay-ink'}`}
                        >
                          {row.expired_rows}
                        </TableCell>
                        <TableCell className="tabular font-mono text-[0.7rem] text-muted-foreground">
                          {row.oldest_expired_sequence === null
                            ? '—'
                            : `${row.oldest_expired_sequence} – ${row.newest_expired_sequence}`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.last_disposition === null
                            ? '없음'
                            : `${row.last_disposition} · ${formatMoment(row.last_disposition_at)}`}
                        </TableCell>
                        <TableCell>
                          <RetentionPolicyDialog
                            category={row.category}
                            retentionDays={row.retention_days}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">파기·보관 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {dispositions === null ? (
              <EmptyState title="처리 기록을 불러오지 못했어요." />
            ) : dispositions.dispositions.length === 0 ? (
              <EmptyState title="아직 남긴 처리 기록이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시각</TableHead>
                      <TableHead>구분</TableHead>
                      <TableHead>구간</TableHead>
                      <TableHead className="text-right">행 수</TableHead>
                      <TableHead>방법</TableHead>
                      <TableHead>비고</TableHead>
                      <TableHead>증거 해시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispositions.dispositions.map((row) => (
                      <TableRow key={row.record_id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatMoment(row.performed_at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.category}</TableCell>
                        <TableCell className="tabular font-mono text-[0.7rem]">
                          {row.from_sequence} – {row.to_sequence}
                        </TableCell>
                        <TableCell className="tabular text-right">{row.row_count}</TableCell>
                        <TableCell className="font-mono text-[0.7rem]">{row.method}</TableCell>
                        <TableCell className="max-w-56 text-xs text-muted-foreground [word-break:keep-all]">
                          {row.note === '' ? '—' : row.note}
                        </TableCell>
                        <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                          {row.evidence_hash === null ? '—' : `${row.evidence_hash.slice(0, 16)}…`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">처리 기록 남기기</CardTitle>
            <CardDescription>
              보존 기간이 지난 구간을 어떻게 했는지 적습니다. 이 화면은 기록만 남기고 감사 행을
              지우지 않습니다 — 애플리케이션에는 그럴 권한이 없습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState title="보존 정책을 먼저 불러와야 처리 기록을 남길 수 있어요." />
            ) : (
              <DispositionForm categories={categories} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Alarms({ row }: { readonly row: ChainVerificationHistory }) {
  const raised =
    row.mismatch_count !== '0' || row.link_break_count !== '0' || row.column_drift_count !== '0';
  return (
    <span className={raised ? 'font-bold text-destructive' : 'text-muted-foreground'}>
      {row.link_break_count} / {row.mismatch_count} / {row.column_drift_count}
    </span>
  );
}
