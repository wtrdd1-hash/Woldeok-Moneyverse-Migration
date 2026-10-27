import type { Metadata } from 'next';
import Link from 'next/link';
import { IpBlockDialog, LiftIpBlockDialog } from '../security-abuse-forms';
import { AdminBack } from '../admin-back';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { parseAdminIpBlocks } from './ip-block-evidence';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '계정 정지 · IP 차단', robots: { index: false, follow: false } };

export default async function AdminSecurityPage() {
  await requireAdminConsole('/admin/security');
  const raw = await apiOrNull<unknown>('/api/v1/admin/security/ip-blocks');
  const blocks = parseAdminIpBlocks(raw);

  return (
    <div data-page="admin-security" className="mv-page mv-page--admin grid gap-5">
      <AdminBack href="/admin" label="관리자 홈으로" />
      <PageHeader eyebrow="ABUSE SECURITY" title="계정 정지 · IP 차단">
        이상 요청의 계정과 네트워크를 서버 진입부에서 관리합니다. 모든 변경은 감사 로그에 남습니다.
      </PageHeader>
      {blocks !== null ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-muted-foreground">
            서버에서 확인한 최근 최대 100건의 차단 기록입니다. 전체 차단 건수는 아닙니다.
          </p>
          <IpBlockDialog />
        </div>
      ) : (
        <div role="alert" aria-live="assertive" className="rounded-xl border border-destructive/50 p-4 text-sm">
          <p className="font-semibold">차단 기록을 확인할 수 없습니다.</p>
          <p className="mt-1 text-muted-foreground">서버 조회 또는 응답 검증에 실패했습니다. 확인 전에는 차단·해제 작업을 진행하지 않습니다.</p>
          <Link href="/admin/security" className="mt-3 inline-flex min-h-11 items-center rounded-lg border px-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
            차단 기록 다시 조회
          </Link>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>IP/CIDR 차단 기록</CardTitle>
          <CardDescription>현재 차단과 과거 해제 기록을 함께 표시합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {blocks === null ? (
            <p className="text-sm text-muted-foreground">검증된 차단 목록이 없어 표시할 수 없습니다.</p>
          ) : blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">차단 기록이 없습니다.</p>
          ) : blocks.map((block) => (
            <div key={block.block_id} className="grid gap-2 rounded-xl border p-4 md:grid-cols-[1fr_2fr_auto] md:items-center">
              <div className="min-w-0">
                <strong className="break-all font-mono text-sm">{block.network}</strong>
                <div className="mt-1">
                  <Badge variant={block.active ? 'destructive' : 'secondary'}>{block.active ? '차단 중' : '해제됨 또는 만료됨'}</Badge>
                </div>
              </div>
              <div className="min-w-0 break-words text-sm">
                <p>{block.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  차단 {formatMoment(block.blocked_at)}
                  {block.lifted_at ? ` · 해제 ${formatMoment(block.lifted_at)}` : ''}
                  {block.expires_at ? ` · 만료 ${formatMoment(block.expires_at)}` : ''}
                </p>
              </div>
              {block.active ? <LiftIpBlockDialog blockId={block.block_id} network={block.network} /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
