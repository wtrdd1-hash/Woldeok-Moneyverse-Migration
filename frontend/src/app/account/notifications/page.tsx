import type { Metadata } from 'next';
import Link from 'next/link';
import { BellRing, CheckCircle2, ChevronLeft, Goal, ShieldCheck } from 'lucide-react';
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
  const enabled = board?.notifications_enabled === true;
  return <div data-page="account-notifications" className="mv-page mv-page--member grid gap-6">
    <PageHeader eyebrow="ACCOUNT · NOTIFICATIONS" title="알림 설정">중요한 목표와 주문 소식만 받을지 직접 정할 수 있습니다.</PageHeader>
    {params.saved === '1' ? <Alert><CheckCircle2 className="size-4"/><AlertDescription>알림 설정을 저장했습니다. 퀘스트 화면에도 바로 적용됩니다.</AlertDescription></Alert> : null}
    {params.error ? <Alert variant="destructive"><AlertDescription>알림 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.</AlertDescription></Alert> : null}

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 border-b bg-muted/25">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-background"><BellRing className="size-5" aria-hidden="true"/></div>
          <div><CardTitle>게임 진행 알림</CardTitle><CardDescription className="mt-1">목표 달성 기회와 NPC 주문 변화를 놓치지 않도록 알려드립니다.</CardDescription></div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          {board === null ? <Alert variant="destructive"><AlertDescription>현재 설정을 불러오지 못했습니다. 설정을 바꾸지 않았으니 잠시 후 다시 확인해 주세요.</AlertDescription></Alert> : <>
            <div className="flex items-start gap-3 rounded-xl border p-4"><Goal className="mt-0.5 size-5 shrink-0" aria-hidden="true"/><div><p className="font-medium">목표·NPC 주문</p><p className="mt-1 text-sm text-muted-foreground">현재 상태: <strong className="text-foreground">{enabled ? '알림 받는 중' : '알림 꺼짐'}</strong></p></div></div>
            <form action={saveGoalNotifications} className="grid gap-3 sm:grid-cols-2" aria-label="목표 및 NPC 주문 알림 설정">
              <Button name="notificationsEnabled" value="true" type="submit" aria-pressed={enabled} variant={enabled ? 'default' : 'outline'} className="min-h-12 w-full">알림 받기</Button>
              <Button name="notificationsEnabled" value="false" type="submit" aria-pressed={!enabled} variant={!enabled ? 'default' : 'outline'} className="min-h-12 w-full">알림 받지 않기</Button>
            </form>
          </>}
        </CardContent>
      </Card>

      <Card><CardHeader><ShieldCheck className="size-5" aria-hidden="true"/><CardTitle className="text-base">설정 적용 범위</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm text-muted-foreground"><p>이 설정은 서버에 저장되어 다른 기기에서도 동일하게 적용됩니다.</p><p>끄더라도 계정 보안처럼 서비스 이용에 꼭 필요한 안내까지 차단되지는 않습니다.</p></CardContent></Card>
    </div>
    <Button asChild variant="ghost" className="min-h-11 w-fit"><Link href="/account"><ChevronLeft className="size-4" aria-hidden="true"/>내 계정으로 돌아가기</Link></Button>
  </div>;
}
