import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { requireAdministrator } from '@/lib/session';
import {
  ApprovalDecision,
  CorporateActionDialog,
  NewApprovalForm,
  NewSeasonEventForm,
  NewStockForm,
  RestrictionDialog,
  ToggleActive,
} from './admin-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '운영',
  robots: { index: false, follow: false },
};

interface AdminUser {
  readonly user_id: string;
  readonly status: string;
  readonly display_name: string;
  readonly created_at: string;
  readonly restricted_at: string | null;
  readonly restriction_reason: string | null;
}

interface ApprovalRequest {
  readonly approval_request_id: string;
  readonly requester_id: string;
  readonly approver_id: string | null;
  readonly action: string;
  readonly payload: unknown;
  readonly status: string;
  readonly requires_two_person_approval: boolean;
  readonly created_at: string;
  readonly decided_at: string | null;
  readonly decision_reason: string | null;
}

interface AuditEvent {
  readonly audit_id: string;
  readonly actor_user_id: string | null;
  readonly action: string;
  readonly target_id: string | null;
  readonly created_at: string;
  readonly integrity_hash: string;
}

interface OutboxEvent {
  readonly event_id: string;
  readonly event_type: string;
  readonly created_at: string;
  readonly delivered_at: string | null;
  readonly delivery_attempts: number;
  readonly delivery_status: string;
}

interface AdminStock {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly active: boolean;
}

interface AdminBusiness {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly purchase_cost: string;
  readonly daily_revenue: string;
  readonly daily_operating_cost: string;
  readonly active: boolean;
}

interface AdminSeasonEvent {
  readonly id: string;
  readonly season_name: string;
  readonly title: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly active: boolean;
}

interface ReconciliationHealth {
  readonly available: boolean;
  readonly calculatedAt?: string;
  readonly integrity?: {
    readonly ok: boolean;
    readonly ledgerTransactionCount: string;
    readonly unbalancedTransactionCount: string;
    readonly balanceMismatchAccountCount: string;
    readonly balanceTotalDeltaAmount: string;
  };
  readonly supply?: {
    readonly m2Amount: string;
    readonly netMintIssuanceAmount: string;
    readonly sinkAbsorbedAmount: string;
    readonly treasuryBalanceAmount: string;
  };
  readonly treasury24h?: {
    readonly inflowAmount: string;
    readonly outflowAmount: string;
    readonly netFlowAmount: string;
  };
}

export default async function AdminPage() {
  const roles = await requireAdministrator();

  const [users, approvals, audit, outbox, stocks, businesses, events, health] = await Promise.all([
    apiOrNull<{ users: AdminUser[] }>('/api/v1/admin/users'),
    apiOrNull<{ approvals: ApprovalRequest[] }>('/api/v1/admin/approvals'),
    apiOrNull<{ events: AuditEvent[] }>('/api/v1/admin/audit-events'),
    apiOrNull<{ events: OutboxEvent[] }>('/api/v1/admin/discord-outbox-events'),
    apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks'),
    apiOrNull<{ businessTypes: AdminBusiness[] }>('/api/v1/admin/business-types'),
    apiOrNull<{ events: AdminSeasonEvent[] }>('/api/v1/admin/season-events'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliations/latest'),
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WOLDEOK MONEYVERSE · OPERATIONS" title="운영 승인 콘솔">
        모든 작업은 감사 기록에 남고, 데이터베이스가 역할을 다시 확인합니다. 이 화면은 무엇을
        보여 줄지만 정하고, 무엇을 허용할지는 정하지 않습니다.
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">내 운영 역할</CardTitle>
          <CardDescription>보유한 역할에 따라 허용되는 작업이 달라집니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="users">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="users">사용자</TabsTrigger>
            <TabsTrigger value="catalog">게임 카탈로그</TabsTrigger>
            <TabsTrigger value="approvals">승인</TabsTrigger>
            <TabsTrigger value="economy">경제 대사</TabsTrigger>
            <TabsTrigger value="logs">감사·전달</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="grid gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사용자 제한 관리</CardTitle>
              <CardDescription>
                제한과 해제 모두 사유가 필요하고, 최근 본인 확인을 요구합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users === null ? (
                <EmptyState title="사용자 목록을 불러오지 못했어요." />
              ) : users.users.length === 0 ? (
                <EmptyState title="표시할 사용자가 없습니다." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>표시 이름</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.users.map((user) => {
                        const restricted = user.restricted_at !== null;
                        return (
                          <TableRow key={user.user_id}>
                            <TableCell>
                              <span className="block">{user.display_name}</span>
                              <code className="font-mono text-[0.7rem] text-muted-foreground">
                                {user.user_id}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge variant={restricted ? 'destructive' : 'secondary'}>
                                {restricted ? '제한됨' : user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-56 text-xs text-muted-foreground">
                              {user.restriction_reason ?? '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <RestrictionDialog
                                userId={user.user_id}
                                displayName={user.display_name}
                                restricted={restricted}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="grid gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">가상 주식 종목 관리</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <NewStockForm />
              {stocks === null ? (
                <EmptyState title="등록된 종목을 불러오지 못했어요." />
              ) : stocks.stocks.length === 0 ? (
                <EmptyState title="등록된 종목이 없습니다." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>코드</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead className="text-right">현재가</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocks.stocks.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell className="font-mono text-xs">{stock.symbol}</TableCell>
                          <TableCell>{stock.name}</TableCell>
                          <TableCell className="text-right">
                            <Amount value={stock.current_price} />
                          </TableCell>
                          <TableCell>
                            <Badge variant={stock.active ? 'secondary' : 'outline'}>
                              {stock.active ? '거래 중' : '정지'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                              <ToggleActive id={stock.id} active={stock.active} kind="stock" />
                              <CorporateActionDialog stockId={stock.id} symbol={stock.symbol} />
                            </div>
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
              <CardTitle className="text-base">사업 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {businesses === null ? (
                <EmptyState title="사업 목록을 불러오지 못했어요." />
              ) : businesses.businessTypes.length === 0 ? (
                <EmptyState title="등록된 사업이 없습니다." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>코드</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead className="text-right">구입 비용</TableHead>
                        <TableHead className="text-right">일 매출</TableHead>
                        <TableHead className="text-right">일 운영비</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businesses.businessTypes.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell className="font-mono text-xs">{business.symbol}</TableCell>
                          <TableCell>{business.name}</TableCell>
                          <TableCell className="text-right">
                            <Amount value={business.purchase_cost} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Amount value={business.daily_revenue} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Amount value={business.daily_operating_cost} />
                          </TableCell>
                          <TableCell className="text-right">
                            <ToggleActive
                              id={business.id}
                              active={business.active}
                              kind="business"
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
              <CardTitle className="text-base">시즌 이벤트 목록</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <NewSeasonEventForm />
              {events === null ? (
                <EmptyState title="시즌 이벤트를 불러오지 못했어요." />
              ) : events.events.length === 0 ? (
                <EmptyState title="등록된 시즌 이벤트가 없습니다." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>시즌</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead className="text-right">참가비</TableHead>
                        <TableHead className="text-right">점수</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-muted-foreground">
                            {event.season_name}
                          </TableCell>
                          <TableCell>{event.title}</TableCell>
                          <TableCell className="text-right">
                            <Amount value={event.cost_wld} />
                          </TableCell>
                          <TableCell className="tabular text-right">
                            {event.points_per_entry}
                          </TableCell>
                          <TableCell className="text-right">
                            <ToggleActive id={event.id} active={event.active} kind="season" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="grid gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">새 승인 요청</CardTitle>
              <CardDescription>
                두 사람 승인이 필요한 작업은 요청자와 다른 운영자만 결정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewApprovalForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">승인 요청</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {approvals === null ? (
                <EmptyState title="승인 요청을 불러오지 못했어요." />
              ) : approvals.approvals.length === 0 ? (
                <EmptyState title="표시할 승인 요청이 없습니다." />
              ) : (
                approvals.approvals.map((request) => (
                  <div
                    key={request.approval_request_id}
                    className="grid gap-2 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-sm">{request.action}</code>
                      <Badge
                        variant={
                          request.status === 'approved'
                            ? 'secondary'
                            : request.status === 'rejected'
                              ? 'destructive'
                              : 'outline'
                        }
                      >
                        {request.status}
                      </Badge>
                      {request.requires_two_person_approval && (
                        <Badge variant="outline">2인 승인</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatMoment(request.created_at)}
                      </span>
                    </div>
                    <pre className="overflow-x-auto rounded-md border bg-muted p-2 font-mono text-[0.7rem]">
                      {JSON.stringify(request.payload, null, 2)}
                    </pre>
                    {request.decision_reason && (
                      <p className="text-xs text-muted-foreground">
                        사유: {request.decision_reason}
                      </p>
                    )}
                    {request.status === 'pending' && (
                      <ApprovalDecision approvalRequestId={request.approval_request_id} />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">경제 대사</CardTitle>
              <CardDescription>
                {health?.available && health.calculatedAt
                  ? `${formatMoment(health.calculatedAt)} 기준 스냅숏`
                  : '가장 최근 스냅숏'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health === null ? (
                <EmptyState title="대사 현황을 불러오지 못했어요." />
              ) : !health.available || !health.integrity || !health.supply ? (
                <EmptyState
                  title="아직 기록된 대사 스냅숏이 없어요."
                  description="대사 작업이 한 번 이상 실행된 뒤에 표시됩니다."
                />
              ) : (
                <div className="grid gap-4">
                  <Badge variant={health.integrity.ok ? 'secondary' : 'destructive'} className="w-fit">
                    {health.integrity.ok ? '정합성 정상' : '정합성 불일치'}
                  </Badge>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <Metric term="원장 거래 수" value={health.integrity.ledgerTransactionCount} plain />
                    <Metric
                      term="미균형 거래"
                      value={health.integrity.unbalancedTransactionCount}
                      plain
                    />
                    <Metric
                      term="잔액 불일치 계정"
                      value={health.integrity.balanceMismatchAccountCount}
                      plain
                    />
                    <Metric term="잔액 총차" value={health.integrity.balanceTotalDeltaAmount} />
                    <Metric term="통화량(M2)" value={health.supply.m2Amount} />
                    <Metric term="순발행" value={health.supply.netMintIssuanceAmount} />
                    <Metric term="소각 흡수" value={health.supply.sinkAbsorbedAmount} />
                    <Metric term="국고 잔액" value={health.supply.treasuryBalanceAmount} />
                    {health.treasury24h && (
                      <>
                        <Metric term="24시간 유입" value={health.treasury24h.inflowAmount} />
                        <Metric term="24시간 유출" value={health.treasury24h.outflowAmount} />
                        <Metric term="24시간 순흐름" value={health.treasury24h.netFlowAmount} />
                      </>
                    )}
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="grid gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">운영 감사 로그</CardTitle>
              <CardDescription>
                각 항목은 앞 항목의 해시를 포함하는 사슬로 이어집니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {audit === null ? (
                <EmptyState title="감사 이벤트를 불러오지 못했어요." />
              ) : audit.events.length === 0 ? (
                <EmptyState title="기록된 감사 이벤트가 없습니다." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>시각</TableHead>
                        <TableHead>작업</TableHead>
                        <TableHead>대상</TableHead>
                        <TableHead>무결성 해시</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audit.events.map((event) => (
                        <TableRow key={event.audit_id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatMoment(event.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{event.action}</TableCell>
                          <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                            {event.target_id ?? '—'}
                          </TableCell>
                          <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                            {event.integrity_hash.slice(0, 16)}…
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
              <CardTitle className="text-base">Discord 전달 로그</CardTitle>
            </CardHeader>
            <CardContent>
              {outbox === null ? (
                <EmptyState title="Discord 전달 현황을 불러오지 못했어요." />
              ) : outbox.events.length === 0 ? (
                <EmptyState title="전달 기록이 없습니다." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>시각</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">시도</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outbox.events.map((event) => (
                        <TableRow key={event.event_id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatMoment(event.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                event.delivery_status === 'delivered' ? 'secondary' : 'outline'
                              }
                            >
                              {event.delivery_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular text-right">
                            {event.delivery_attempts}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({
  term,
  value,
  plain = false,
}: {
  readonly term: string;
  readonly value: string;
  /** A count, not money: it gets grouping but no currency mark. */
  readonly plain?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-2">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="text-sm">
        <Amount value={value} currency={!plain} />
      </dd>
    </div>
  );
}
