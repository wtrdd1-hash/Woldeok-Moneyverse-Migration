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
import { verifiedIpBlocks } from './ip-block-inventory';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '계정 정지 · IP 차단', robots: { index: false, follow: false } };

export default async function AdminSecurityPage() {
  await requireAdminConsole('/admin/security');
  const response = await apiOrNull<unknown>('/api/v1/admin/security/ip-blocks');
  const blocks = verifiedIpBlocks(response);

  return (
    <div data-page="admin-security" className="mv-page mv-page--admin grid gap-5">
      <AdminBack href="/admin" label="관리자 홈으로" />
      <PageHeader eyebrow="ABUSE SECURITY" title="계정 정지 · IP 차단">
        이상 요청의 계정과 네트워크를 서버 진입부에서 관리합니다. 모든 변경은 감사 로그에 남습니다.
      </PageHeader>
      {blocks !== null && (
        <div className="flex justify-end">
          <IpBlockDialog />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>IP/CIDR 차단 기록</CardTitle>
          <CardDescription>현재 차단과 과거 해제 기록을 함께 표시합니다. 서버에서 확인된 기록만 보여 줍니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {blocks === null ? (
            <div role="alert" className="grid gap-3 rounded-xl border border-destructive/40 p-4 text-sm">
              <p className="font-semibold">차단 기록을 확인할 수 없습니다.</p>
              <p className="text-muted-foreground">서버 응답을 확인하지 못했습니다. 차단 현황을 조회한 뒤 작업해 주세요.</p>
              <Button asChild variant="outline" className="min-h-11 w-full sm:w-fit">
                <Link href="/admin/security">다시 조회</Link>
              </Button>
            </div>
          ) : blocks.length === 0 ? (
            <p role="status" className="text-sm text-muted-foreground">차단 기록이 없습니다.</p>
          ) : blocks.map((block) => (
            <div key={block.block_id} className="grid min-w-0 gap-2 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] md:items-center">
              <div className="min-w-0">
                <strong className="break-all font-mono text-sm">{block.network}</strong>
                <div className="mt-1">
                  <Badge variant={block.active ? 'destructive' : 'secondary'}>{block.active ? '차단 중' : '해제됨'}</Badge>
                </div>
              </div>
              <div className="min-w-0 text-sm">
                <p className="break-words">{block.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">차단 {formatMoment(block.blocked_at)}{block.lifted_at ? ` · 해제 ${formatMoment(block.lifted_at)}` : ''}</p>
              </div>
              {block.active ? <LiftIpBlockDialog blockId={block.block_id} network={block.network} /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
