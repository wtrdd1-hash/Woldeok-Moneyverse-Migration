import type { Metadata } from 'next';
import Link from 'next/link';
import { IpBlockDialog, LiftIpBlockDialog } from '../security-abuse-forms';
import { AdminBack } from '../admin-back';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { parseAdminIpBlocks } from './security-evidence';

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
      {blocks === null ? (
        <div role="alert" className="grid gap-3 rounded-xl border border-destructive/40 p-4">
          <p className="font-semibold">IP 차단 기록을 검증하지 못했습니다.</p>
          <p className="text-sm text-muted-foreground">조회 실패 또는 응답 오류입니다. 실제 차단 기록이 0건이라는 뜻이 아니며, 관리자 변경 기능을 잠시 사용할 수 없습니다.</p>
          <Button asChild variant="outline" className="min-h-11 w-fit"><Link href="/admin/security">다시 조회</Link></Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end"><IpBlockDialog /></div>
          <Card>
            <CardHeader><CardTitle>IP/CIDR 차단 기록</CardTitle><CardDescription>검증된 최근 최대 100건의 차단과 해제 기록입니다. 전체 기록 수를 뜻하지 않습니다.</CardDescription></CardHeader>
            <CardContent className="grid gap-3">
              {blocks.length === 0 ? <p className="text-sm text-muted-foreground">조회한 범위에 차단 기록이 없습니다.</p> : blocks.map((block) => (
                <div key={block.block_id} className="grid gap-2 rounded-xl border p-4 md:grid-cols-[1fr_2fr_auto] md:items-center">
                  <div><strong className="break-all font-mono text-sm">{block.network}</strong><div className="mt-1"><Badge variant={block.active ? 'destructive' : 'secondary'}>{block.active ? '차단 중' : '해제됨'}</Badge></div></div>
                  <div className="min-w-0 break-words text-sm"><p>{block.reason}</p><p className="mt-1 text-xs text-muted-foreground">차단 {formatMoment(block.blocked_at)}{block.lifted_at ? ` · 해제 ${formatMoment(block.lifted_at)}` : ''}</p></div>
                  {block.active ? <LiftIpBlockDialog blockId={block.block_id} network={block.network} /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
