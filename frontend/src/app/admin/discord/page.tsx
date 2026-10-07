import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
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
import { formatMoment, groupDigits } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { Figure } from '../economy/economy-parts';
import type { AdminDiscordRoute, AdminOutboxHealth } from '../types';

import { AdminDiscordDmTestButton } from './admin-discord-dm-test-button';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/discord');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminDiscordPage() {
  await requireAdminConsole(AREA.href);
  const console_ = await apiOrNull<{
    readonly outbox: AdminOutboxHealth;
    readonly routes: readonly AdminDiscordRoute[];
    readonly adminAlertInfo?: {
      readonly adminUserId: string;
      readonly configured: boolean;
    };
  }>('/api/v1/admin/discord');

  const stuck = console_ === null ? 0 : Number(console_.outbox.stuck_count);
  const adminUserId = console_?.adminAlertInfo?.adminUserId || '886478189520637992';
  const isConfigured = console_?.adminAlertInfo?.configured ?? true;

  return (
    <div data-page="admin-discord" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {console_ === null ? (
        <EmptyState
          title="전달 현황을 불러오지 못했어요."
          description="잠시 후 다시 확인해 주세요."
        />
      ) : (
        <>
          <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-background to-background">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-500 text-indigo-400">
                    관리자 다이렉트 알림 (DM)
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    {isConfigured ? '봇 연동 활성 (ACTIVE)' : '토큰 미설정'}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">중요 정보 1:1 디스코드 DM 실시간 전송</CardTitle>
                <CardDescription>
                  경제 원장 불일치, 비허용 음수 잔액, 감사 체인 변조, 긴급 관리자 경보 등 시스템 치명적 이벤트 발생 시 관리자 디스코드 ID로 다이렉트 DM이 실시간 발송됩니다.
                </CardDescription>
              </div>
              <div className="shrink-0">
                <AdminDiscordDmTestButton adminUserId={adminUserId} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                <div>
                  <span className="font-semibold text-foreground">수신 관리자 Discord ID:</span>{' '}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-indigo-300">
                    {adminUserId}
                  </code>
                </div>
                <div>
                  <span className="font-semibold text-foreground">자동 발송 대상:</span>{' '}
                  <span>원장 대사 불일치, 비허용 음수 잔액, 감사 변조, 긴급 경보</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">전달 상태</CardTitle>
              <CardDescription>
                운영 콘솔 첫 화면의 &lsquo;실패한 outbox&rsquo;와 같은 기준입니다. 아직 나가지
                않았고 만들어진 지 한 시간이 넘은 건을 셉니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <dl className="grid gap-2">
                <Figure
                  term="밀린 건"
                  value={groupDigits(console_.outbox.stuck_count)}
                  plain
                  hint={
                    stuck > 0
                      ? `가장 오래된 미전달 ${formatMoment(
                          console_.outbox.oldest_undelivered_at,
                          '없음',
                        )}`
                      : '한 시간 넘게 밀린 건은 없습니다.'
                  }
                />
                <Figure term="대기" value={groupDigits(console_.outbox.pending_count)} plain />
                <Figure
                  term="재시도 대기"
                  value={groupDigits(console_.outbox.retry_pending_count)}
                  plain
                />
                <Figure
                  term="전송 중"
                  value={groupDigits(console_.outbox.delivering_count)}
                  plain
                  hint="다른 프로세스가 잠금을 쥐고 있는 건입니다."
                />
              </dl>
              <dl className="grid gap-2">
                <Figure
                  term="24시간 전달"
                  value={groupDigits(console_.outbox.delivered_24h_count)}
                  plain
                  hint={`마지막 전달 ${formatMoment(console_.outbox.last_delivered_at, '없음')}`}
                />
                <Figure
                  term="전달 포기"
                  value={groupDigits(console_.outbox.dead_letter_count)}
                  plain
                  hint={`마지막 실패 ${formatMoment(console_.outbox.last_failure_at, '없음')}`}
                />
                <Figure
                  term="발송 안 함"
                  value={groupDigits(console_.outbox.suppressed_count)}
                  plain
                  hint="경로가 꺼져 있어 알리지 않기로 한 건입니다."
                />
                <Figure
                  term="경로 없는 유형"
                  value={groupDigits(console_.outbox.unrouted_type_count)}
                  plain
                  hint="경로가 없으면 영원히 전송되지 않습니다."
                />
              </dl>
            </CardContent>
          </Card>

          <section aria-labelledby="discord-routes" className="grid gap-3">
            <SectionHeader eyebrow="ROUTING" title="이벤트 경로" id="discord-routes" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">어떤 사건이 어디로 나가는가</CardTitle>
                <CardDescription>
                  채널 키는 배포마다 실제 채널로 연결되는 이름입니다. 경로가 없는 유형이 위에
                  옵니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {console_.routes.length === 0 ? (
                  <EmptyState title="등록된 경로도, 쌓인 사건도 없습니다." />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이벤트 유형</TableHead>
                          <TableHead>채널 키</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead className="text-right">대기</TableHead>
                          <TableHead className="text-right">포기</TableHead>
                          <TableHead className="text-right">발송 안 함</TableHead>
                          <TableHead className="text-right">24시간</TableHead>
                          <TableHead className="text-right">누적</TableHead>
                          <TableHead>마지막 전달</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {console_.routes.map((route) => (
                          <TableRow key={route.event_type}>
                            <TableCell>
                              <span className="grid gap-0.5">
                                <span className="font-mono text-xs">{route.event_type}</span>
                                {route.note && (
                                  <span className="text-xs text-muted-foreground">
                                    {route.note}
                                  </span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {route.channel_key ?? '—'}
                            </TableCell>
                            <TableCell>
                              {!route.routed ? (
                                <Badge variant="destructive">경로 없음</Badge>
                              ) : (
                                <Badge variant={route.enabled ? 'secondary' : 'outline'}>
                                  {route.enabled ? '알림' : '끔'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(route.pending_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(route.dead_letter_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(route.suppressed_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(route.delivered_24h_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(route.total_count)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatMoment(route.last_delivered_at, '없음')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
