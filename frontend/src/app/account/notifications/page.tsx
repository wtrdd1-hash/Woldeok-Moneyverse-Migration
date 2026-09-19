import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { saveGoalNotifications } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '알림 설정', robots: { index: false, follow: false } };

export default async function NotificationSettingsPage({ searchParams }: { readonly searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  await requireMember();
  const params = await searchParams;
  const board = await apiOrNull<{ notifications_enabled: boolean }>('/api/v1/engagement');
  return <div data-page="account-notifications" className="mv-page mv-page--member grid gap-6">
    <PageHeader eyebrow="NOTIFICATIONS" title="알림 설정">목표와 NPC 주문 알림 수신 여부를 계정에서 관리합니다.</PageHeader>
    {params.saved === '1' ? <Alert><AlertDescription>알림 설정을 저장했습니다.</AlertDescription></Alert> : null}
    {params.error ? <Alert variant="destructive"><AlertDescription>알림 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.</AlertDescription></Alert> : null}
    <Card><CardHeader><CardTitle className="text-base">목표·주문 알림</CardTitle><CardDescription>퀘스트 화면과 같은 서버 설정을 사용하므로 어느 화면에서 바꿔도 동일하게 적용됩니다.</CardDescription></CardHeader>
      <CardContent>{board === null ? <p className="text-sm text-muted-foreground">현재 설정을 불러오지 못했습니다.</p> :
        <form action={saveGoalNotifications} className="flex flex-wrap gap-2">
          <Button name="notificationsEnabled" value="true" type="submit" variant={board.notifications_enabled ? 'default' : 'outline'} className="min-h-11">알림 받기</Button>
          <Button name="notificationsEnabled" value="false" type="submit" variant={!board.notifications_enabled ? 'default' : 'outline'} className="min-h-11">알림 받지 않기</Button>
        </form>}
      </CardContent></Card>
    <Button asChild variant="ghost" className="min-h-11 w-fit"><Link href="/account">내 계정으로 돌아가기</Link></Button>
  </div>;
}
