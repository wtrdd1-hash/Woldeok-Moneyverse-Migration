import type { Metadata } from 'next';
import { IpBlockDialog, LiftIpBlockDialog } from '../security-abuse-forms';
import { AdminBack } from '../admin-back';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '계정 정지 · IP 차단', robots: { index: false, follow: false } };

type Block = { id: string; network: string; reason: string; blocked_at: string; expires_at: string | null; lifted_at: string | null; active: boolean };

export default async function AdminSecurityPage() {
  await requireAdminConsole('/admin/security');
  const result = await apiOrNull<{ blocks: Block[] }>('/api/v1/admin/security/ip-blocks');
  const blocks = result?.blocks ?? [];
  return <div data-page="admin-security" className="mv-page mv-page--admin grid gap-5"><AdminBack href="/admin" label="관리자 홈으로"/><PageHeader eyebrow="ABUSE SECURITY" title="계정 정지 · IP 차단">이상 요청의 계정과 네트워크를 서버 진입부에서 관리합니다. 모든 변경은 감사 로그에 남습니다.</PageHeader><div className="flex justify-end"><IpBlockDialog/></div><Card><CardHeader><CardTitle>IP/CIDR 차단 기록</CardTitle><CardDescription>현재 차단과 과거 해제 기록을 함께 표시합니다.</CardDescription></CardHeader><CardContent className="grid gap-3">{blocks.length === 0 ? <p className="text-sm text-muted-foreground">차단 기록이 없습니다.</p> : blocks.map((block) => <div key={block.id} className="grid gap-2 rounded-xl border p-4 md:grid-cols-[1fr_2fr_auto] md:items-center"><div><strong className="font-mono text-sm">{block.network}</strong><div className="mt-1"><Badge variant={block.active ? 'destructive' : 'secondary'}>{block.active ? '차단 중' : '해제됨'}</Badge></div></div><div className="text-sm"><p>{block.reason}</p><p className="mt-1 text-xs text-muted-foreground">차단 {formatMoment(block.blocked_at)}{block.lifted_at ? ` · 해제 ${formatMoment(block.lifted_at)}` : ''}</p></div>{block.active ? <LiftIpBlockDialog blockId={block.id} network={block.network}/> : null}</div>)}</CardContent></Card></div>;
}
