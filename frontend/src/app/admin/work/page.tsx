import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
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
import type { AdminJobLevel, AdminWorkPolicy, AdminWorkRealtimeStats, AdminWorkTask } from '../types';
import { WorkPolicyTuningCard, WorkTaskTuningTable } from './admin-work-forms';
import { WorkStatsDashboard } from './admin-work-stats';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/work');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

const JOB_LABELS: Readonly<Record<string, string>> = {
  developer: '소프트웨어 개발자',
  trader: '전문 트레이더',
  entertainer: '엔터테이너',
  detective: '경제 탐정',
  miner: '자원 채굴사',
  farmer: '스마트 농부',
  artisan: '명품 장인',
  civil_servant: '행정 공무원',
  carrier: '운반원',
  technician: '기술자',
  merchant: '상인',
};

function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code;
}

export default async function AdminWorkPage() {
  await requireAdminConsole(AREA.href);

  const [console_, stats] = await Promise.all([
    apiOrNull<{
      readonly catalogue: readonly AdminWorkTask[];
      readonly jobLevels: readonly AdminJobLevel[];
      readonly policy: AdminWorkPolicy;
    }>('/api/v1/admin/work'),
    apiOrNull<AdminWorkRealtimeStats>('/api/v1/admin/work/stats'),
  ]);

  return (
    <div data-page="admin-work" className="mv-page mv-page--admin grid gap-6">
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
          {/* 실시간 직업 수행 순위 및 캡 통계 시각화 & 자동 밸런싱 대시보드 */}
          {stats !== null && (
            <section aria-labelledby="work-stats-dashboard" className="grid gap-4">
              <SectionHeader
                eyebrow="WORK STATS & AUTO-TUNING"
                title="직업 수행 통계 시각화 및 자동 밸런싱"
                id="work-stats-dashboard"
              />
              <WorkStatsDashboard stats={stats} />
            </section>
          )}

          {/* 수동 전역 정책 정밀 튜닝 카드 */}
          <section aria-labelledby="work-policy" className="grid gap-4">
            <SectionHeader eyebrow="GLOBAL POLICY" title="보상 정책 수동 설정" id="work-policy" />
            <WorkPolicyTuningCard policy={console_.policy} />
          </section>

          {/* 24시간 실시간 직업 지표 요약 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">직업 보상 및 수행 지표 요약</CardTitle>
              <CardDescription>
                최근 24시간 동안 지급된 총 직업 보상과 참여 인원, 진행 중인 작업 현황입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <dl className="grid gap-2">
                <Figure
                  term="보상 정책 버전"
                  value={
                    console_.policy.policy_id === null
                      ? '적용 중인 버전 없음'
                      : `${console_.policy.policy_id}번 버전 (${formatMoment(console_.policy.effective_at)})`
                  }
                  plain
                />
                <Figure
                  term="일일 / 주간 한도"
                  value={
                    console_.policy.daily_cap === null || console_.policy.daily_cap === '0'
                      ? '무제한 (상한 없음)'
                      : `${groupDigits(console_.policy.daily_cap)} WLD`
                  }
                  plain
                />
                <Figure
                  term="반복 수행 감액률"
                  value={
                    console_.policy.repeat_decay_percent === 0 || console_.policy.repeat_decay_percent === null
                      ? '없음 (0%)'
                      : `${console_.policy.repeat_decay_percent}%`
                  }
                  plain
                />
              </dl>
              <dl className="grid gap-2">
                <Figure term="24시간 총 지급액" value={console_.policy.paid_24h} />
                <Figure
                  term="24시간 지급 인원"
                  value={groupDigits(console_.policy.members_paid_24h)}
                  plain
                />
                <Figure
                  term="진행 중인 작업 건수"
                  value={groupDigits(console_.policy.open_assignment_count)}
                  plain
                />
                <Figure
                  term="검수 대기 건수"
                  value={groupDigits(console_.policy.awaiting_verification_count)}
                  plain
                  hint="제출됐지만 아직 승인·반려되지 않은 건입니다."
                />
              </dl>
            </CardContent>
          </Card>

          {/* 개별 작업 카탈로그 실시간 튜닝 테이블 */}
          <section aria-labelledby="work-catalogue" className="grid gap-3">
            <SectionHeader eyebrow="CATALOGUE TUNING" title="작업 카탈로그 및 보상/한도 정밀 튜닝" id="work-catalogue" />
            <WorkTaskTuningTable tasks={console_.catalogue} />
          </section>

          {/* 직업별 숙련도 및 인원 현황 */}
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
                  <Table className="min-w-[500px]">
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
