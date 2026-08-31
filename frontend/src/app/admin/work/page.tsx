import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
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
import type { AdminJobLevel, AdminWorkPolicy, AdminWorkTask } from '../types';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/work');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

/**
 * The work loop seen from the other side.
 *
 * `/work` answers "what may I take", and every read model behind it filters by
 * the member asking. Nothing answered "what is the catalogue paying" -- the
 * caps, the decay and the daily limits were all set by 066 and 095 and only
 * ever visible one member at a time. This is the screen 14.9 asks for under
 * 작업·직업, and it is a read: the caps are changed as an economy policy
 * version on /admin/controls, where the reason and the step-up already are.
 *
 * The catalogue table prints the base reward and the paid total side by side
 * on purpose. They are supposed to differ -- 068 decays a repeat and clamps to
 * the caps -- and how far they differ is the number that says whether the
 * caps are doing something or strangling the loop.
 */

/**
 * `public.work_job_type` (066), in Korean. A local copy rather than an import
 * from the member work screen: that module is the member's vocabulary and
 * this is the console's, and a job this build has not been taught renders as
 * itself either way.
 */
const JOB_LABELS: Readonly<Record<string, string>> = {
  farmer: '농부',
  miner: '광부',
  carrier: '운반원',
  technician: '기술자',
  merchant: '상인',
};

function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code;
}

function durationLabel(seconds: number): string {
  return seconds < 60 ? `${seconds}초` : `${Math.round(seconds / 60)}분`;
}

export default async function AdminWorkPage() {
  await requireAdminConsole();
  const console_ = await apiOrNull<{
    readonly catalogue: readonly AdminWorkTask[];
    readonly jobLevels: readonly AdminJobLevel[];
    readonly policy: AdminWorkPolicy;
  }>('/api/v1/admin/work');

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {console_ === null ? (
        <EmptyState
          title="작업 현황을 불러오지 못했어요."
          description="숫자를 추정해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">지금 적용 중인 보상 정책</CardTitle>
              <CardDescription>
                한도와 감소율은 작업 화면에 표시되는 예상 보상액을 그대로 결정합니다. 바꾸려면
                기능 스위치 · 정책 버전 화면에서 새 버전을 만드세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <dl className="grid gap-2">
                <Figure
                  term="일 지급 한도"
                  value={console_.policy.daily_cap ?? '0'}
                  hint={
                    console_.policy.policy_id === null
                      ? '적용 중인 정책 버전이 없습니다. 지금은 작업 보상이 지급되지 않습니다.'
                      : `${console_.policy.policy_id}번 버전 · ${formatMoment(
                          console_.policy.effective_at,
                          '적용 시각 없음',
                        )}부터`
                  }
                />
                <Figure term="주 지급 한도" value={console_.policy.weekly_cap ?? '0'} />
                <Figure
                  term="반복 감소율"
                  value={`${console_.policy.repeat_decay_percent ?? 0}%`}
                  plain
                  hint="같은 작업을 하루에 다시 할 때마다 이만큼 깎입니다."
                />
              </dl>
              <dl className="grid gap-2">
                <Figure term="24시간 지급액" value={console_.policy.paid_24h} />
                <Figure
                  term="24시간 지급 인원"
                  value={groupDigits(console_.policy.members_paid_24h)}
                  plain
                />
                <Figure
                  term="진행 중인 작업"
                  value={groupDigits(console_.policy.open_assignment_count)}
                  plain
                />
                <Figure
                  term="검수 대기"
                  value={groupDigits(console_.policy.awaiting_verification_count)}
                  plain
                  hint="제출됐지만 아직 승인·반려되지 않은 건입니다."
                />
              </dl>
            </CardContent>
          </Card>

          <section aria-labelledby="work-catalogue" className="grid gap-3">
            <SectionHeader eyebrow="CATALOGUE" title="작업 카탈로그" id="work-catalogue" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">작업별 현황</CardTitle>
                <CardDescription>
                  기본 보상은 카탈로그에 적힌 값이고, 24시간 지급액은 한도와 반복 감소를 거쳐 실제로
                  나간 금액입니다. 두 값이 크게 벌어지면 한도가 걸리고 있다는 뜻입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {console_.catalogue.length === 0 ? (
                  <EmptyState title="등록된 작업이 없습니다." />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>작업</TableHead>
                          <TableHead>직업</TableHead>
                          <TableHead className="text-right">난이도</TableHead>
                          <TableHead className="text-right">기본 보상</TableHead>
                          <TableHead className="text-right">경험치</TableHead>
                          <TableHead className="text-right">최소 수행</TableHead>
                          <TableHead className="text-right">일일 한도</TableHead>
                          <TableHead className="text-right">진행 중</TableHead>
                          <TableHead className="text-right">검수 대기</TableHead>
                          <TableHead className="text-right">24시간 승인</TableHead>
                          <TableHead className="text-right">24시간 지급액</TableHead>
                          <TableHead>상태</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {console_.catalogue.map((task) => (
                          <TableRow key={task.task_id}>
                            <TableCell>
                              <span className="grid gap-0.5">
                                <b>{task.name}</b>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {task.code}
                                </span>
                              </span>
                            </TableCell>
                            <TableCell>{jobLabel(task.job_type)}</TableCell>
                            <TableCell className="tabular text-right">{task.difficulty}</TableCell>
                            <TableCell className="text-right">
                              <Amount value={task.base_reward} />
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(task.base_experience)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {durationLabel(task.minimum_duration_seconds)}
                            </TableCell>
                            <TableCell className="tabular text-right">{task.daily_limit}</TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(task.open_assignment_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(task.awaiting_verification_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(task.approved_24h)}
                              {task.rejected_24h !== '0' && (
                                <span className="text-muted-foreground">
                                  {' '}
                                  / 반려 {groupDigits(task.rejected_24h)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={task.paid_24h} />
                            </TableCell>
                            <TableCell>
                              <Badge variant={task.active ? 'secondary' : 'outline'}>
                                {task.active ? '제공 중' : '중지'}
                              </Badge>
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

          <section aria-labelledby="work-jobs" className="grid gap-3">
            <SectionHeader eyebrow="JOB PROGRESSION" title="직업별 숙련도" id="work-jobs" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">직업 다섯 종</CardTitle>
                <CardDescription>
                  아무도 고르지 않은 직업도 0으로 표시합니다. 최근 7일은 그 직업으로 보상을 받은
                  인원입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>직업</TableHead>
                        <TableHead className="text-right">인원</TableHead>
                        <TableHead className="text-right">평균 레벨</TableHead>
                        <TableHead className="text-right">최고 레벨</TableHead>
                        <TableHead className="text-right">누적 경험치</TableHead>
                        <TableHead className="text-right">최근 7일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {console_.jobLevels.map((job) => (
                        <TableRow key={job.job_type}>
                          <TableCell>{jobLabel(job.job_type)}</TableCell>
                          <TableCell className="tabular text-right">
                            {groupDigits(job.member_count)}
                          </TableCell>
                          <TableCell className="tabular text-right">{job.average_level}</TableCell>
                          <TableCell className="tabular text-right">{job.top_level}</TableCell>
                          <TableCell className="tabular text-right">
                            {groupDigits(job.total_experience)}
                          </TableCell>
                          <TableCell className="tabular text-right">
                            {groupDigits(job.active_7d_count)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
