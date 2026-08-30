import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AdminRoleAssignment, EconomyPolicyVersion, FeatureSwitch } from '../types';
import {
  ActivateDuePoliciesForm,
  FeatureSwitchDialog,
  NewPolicyVersionForm,
  PolicyRollbackDialog,
  RoleDesignationForm,
  SwitchStateBadge,
} from './controls-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/controls');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

interface ControlsOverview {
  readonly featureSwitches: FeatureSwitch[];
  readonly policies: EconomyPolicyVersion[];
  readonly roles: AdminRoleAssignment[];
}

/**
 * What used to be the approval queue.
 *
 * Two-person approval was retired with migrations 057-058, so nothing here is
 * requested and then decided by somebody else — it is decided once, by the
 * superadmin, with a reason and a code. What the screen owes in return is
 * the thing the second person used to provide: it says what the value is now,
 * what it is about to become, and how to put it back.
 *
 * The three stage-3 features arrive disabled and stay that way in production
 * until the conditions printed under each of them have been met on the test
 * server. Those conditions are stored on the row, not written in a document,
 * so they are in front of whoever is about to flip the switch.
 */
export default async function AdminControlsPage() {
  await requireAdminConsole();
  const overview = await apiOrNull<ControlsOverview>('/api/v1/admin/controls');

  const active = overview?.policies.find((policy) => policy.status === 'active') ?? null;
  const previous =
    overview?.policies.find(
      (policy) => policy.status === 'superseded' && policy.superseded_by === active?.version,
    ) ?? null;

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기능 스위치</CardTitle>
          <CardDescription>
            중지는 새 요청만 막고 진행 중인 처리는 훼손하지 않습니다. 3단계 기능은 아래 조건이
            테스트 서버에서 확인되기 전까지 운영에서 켜지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {overview === null ? (
            <EmptyState title="기능 스위치를 불러오지 못했어요." />
          ) : overview.featureSwitches.length === 0 ? (
            <EmptyState title="등록된 기능 스위치가 없습니다." />
          ) : (
            overview.featureSwitches.map((feature) => (
              <div
                key={feature.feature_key}
                className="grid gap-2 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <b>{feature.title}</b>
                  <code className="font-mono text-[0.7rem] text-muted-foreground">
                    {feature.feature_key}
                  </code>
                  <SwitchStateBadge state={feature.state} />
                  <span className="text-xs text-muted-foreground">
                    {formatMoment(feature.updated_at)}
                  </span>
                </div>
                {feature.reason && (
                  <p className="text-xs text-muted-foreground [word-break:keep-all]">
                    사유: {feature.reason}
                  </p>
                )}
                {feature.activation_preconditions.length > 0 && (
                  <ul className="grid gap-1 text-xs text-muted-foreground">
                    {feature.activation_preconditions.map((condition) => (
                      <li key={condition}>· {condition}</li>
                    ))}
                  </ul>
                )}
                <FeatureSwitchDialog feature={feature} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="policy-versions" className="grid gap-3">
        <SectionHeader eyebrow="ECONOMY POLICY" title="정책 버전" id="policy-versions" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">지금 적용 중</CardTitle>
            <CardDescription>
              정책은 고쳐 쓰지 않고 새 버전으로 저장합니다. 이전 버전은 그대로 남고, 되돌리기는
              그 버전을 다시 적용하는 것입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <dl className="grid gap-1 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">현재 버전</dt>
                <dd className="tabular font-bold">{active?.version ?? '없음'}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">되돌릴 이전 버전</dt>
                <dd className="tabular">{previous?.version ?? '없음'}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <PolicyRollbackDialog
                activeVersion={active?.version ?? null}
                previousVersion={previous?.version ?? null}
              />
            </div>
            <ActivateDuePoliciesForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">새 버전</CardTitle>
          </CardHeader>
          <CardContent>
            <NewPolicyVersionForm activeVersion={active?.version ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">버전 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {overview === null ? (
              <EmptyState title="정책 버전을 불러오지 못했어요." />
            ) : overview.policies.length === 0 ? (
              <EmptyState title="아직 만든 정책 버전이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>버전</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>발효 시각</TableHead>
                      <TableHead>사유</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.policies.map((policy) => (
                      <TableRow key={policy.policy_id}>
                        <TableCell className="font-mono text-[0.75rem]">{policy.version}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              policy.status === 'active'
                                ? 'secondary'
                                : policy.status === 'rolled_back'
                                  ? 'destructive'
                                  : 'outline'
                            }
                          >
                            {policy.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatMoment(policy.effective_at)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground [word-break:keep-all]">
                          {policy.reason}
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

      <section aria-labelledby="admin-roles" className="grid gap-3">
        <SectionHeader eyebrow="AUTHORITY" title="운영 역할" id="admin-roles" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">지금 부여된 역할</CardTitle>
            <CardDescription>
              최고관리자는 한 명뿐이고, 회수가 아니라 다른 계정으로 넘기는 방식으로만 바뀝니다.
              비어 있다면 최고관리자만 이 목록을 볼 수 있기 때문입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview === null ? (
              <EmptyState title="역할 목록을 불러오지 못했어요." />
            ) : overview.roles.length === 0 ? (
              <EmptyState title="표시할 역할이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>부여 시각</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.roles.map((row) => (
                      <TableRow key={`${row.user_id}:${row.role}`}>
                        <TableCell>
                          <span className="grid gap-0.5">
                            <span>{row.display_name}</span>
                            <code className="font-mono text-[0.7rem] text-muted-foreground">
                              {row.user_id}
                            </code>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.role === 'superadmin' ? 'secondary' : 'outline'}>
                            {row.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatMoment(row.granted_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">역할 부여</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleDesignationForm operation="grant" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">역할 회수</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleDesignationForm operation="revoke" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
