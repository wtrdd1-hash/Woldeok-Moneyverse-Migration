'use client';

import { useActionState } from 'react';
import { Amount } from '@/components/amount';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import type { AdminWorkDailyCapBucket, AdminWorkJobRanking, AdminWorkRealtimeStats, AdminWorkTrendDay } from '../types';
import { autoTuneWorkPolicyAction } from './actions';

const JOB_LABELS: Readonly<Record<string, { label: string; icon: string; color: string }>> = {
  farmer: { label: '농부', icon: 'farmer', color: 'bg-emerald-500' },
  miner: { label: '광부', icon: 'miner', color: 'bg-amber-500' },
  carrier: { label: '운반원', icon: 'carrier', color: 'bg-blue-500' },
  technician: { label: '기술자', icon: 'technician', color: 'bg-indigo-500' },
  merchant: { label: '상인', icon: '🪙', color: 'bg-purple-500' },
};

function getJobMeta(code: string) {
  return JOB_LABELS[code] ?? { label: code, icon: 'briefcase', color: 'bg-neutral-500' };
}

interface WorkStatsProps {
  readonly stats: AdminWorkRealtimeStats;
}

export function WorkStatsDashboard({ stats }: WorkStatsProps) {
  return (
    <div className="grid gap-6">
      {/* 1. 지능형 자동 밸런싱 엔진 및 경제 상태 요약 */}
      <WorkAutoTuneCard stats={stats} />

      {/* 2. 직업별 랭킹 수평 바 차트 & 일일 캡 5단계 게이지 2열 그리드 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkRankingChart rankings={stats.rankings} totalExecutions={stats.total_completions_24h} />
        <WorkDailyCapGaugeCard stats={stats} />
      </div>

      {/* 3. 최근 7일간 직업 수행 트렌드 차트 */}
      <WorkTrendMiniChart trends={stats.trend_7d} />
    </div>
  );
}

export function WorkAutoTuneCard({ stats }: WorkStatsProps) {
  const [state, formAction, isPending] = useActionState(autoTuneWorkPolicyAction, IDLE);

  const statusConfig = {
    stable: {
      label: '경제 안정 (STABLE)',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: '직업 참여도와 보상 지급이 균형 잡힌 상태입니다. 기본 정책이 유지됩니다.',
      recommendation: `일일 캡 ${groupDigits(stats.recommended_daily_cap)} WLD, 감액률 ${stats.recommended_decay_percent}% 유지`,
    },
    active: {
      label: '활동성 높음 (ACTIVE)',
      badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      description: '유저들의 직업 수행 참여율이 활발합니다. 완만한 감액률을 적용할 수 있습니다.',
      recommendation: `일일 캡 ${groupDigits(stats.recommended_daily_cap)} WLD, 반복 감액률 ${stats.recommended_decay_percent}% 권장`,
    },
    overheated: {
      label: '경제 과열 경고 (OVERHEATED)',
      badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      description: '통화 유입량이 급증하거나 다수 유저가 캡에 도달했습니다. 인플레이션 방지를 위해 상한 축소를 권장합니다.',
      recommendation: `일일 캡 ${groupDigits(stats.recommended_daily_cap)} WLD로 축소, 감액률 ${stats.recommended_decay_percent}%로 강화 권장`,
    },
    cooling: {
      label: '참여 냉각 상태 (COOLING)',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      description: '최근 24시간 직업 수행 참여율이 낮습니다. 보상 및 일일 캡을 상향하여 참여를 촉진할 수 있습니다.',
      recommendation: `일일 캡 ${groupDigits(stats.recommended_daily_cap)} WLD로 상향 인센티브 권장`,
    },
  }[stats.economy_health_status] ?? {
    label: stats.economy_health_status,
    badgeClass: 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border-neutral-500/30',
    description: '실시간 경제 지표를 분석 중입니다.',
    recommendation: '모니터링 유지',
  };

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              AI 경제 지표 기반 일일 캡 & 보상 자동 조절 (Auto-Tuning)
            </CardTitle>
            <CardDescription>
              최근 24시간 통화 유출량, 캡 도달 인원 비율, 직업 완료 건수를 실시간 분석하여 최적 밸런스를 자동 산출합니다.
            </CardDescription>
          </div>
          <Badge className={statusConfig.badgeClass}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* 경제 지표 요약 수치 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-muted/40 p-3.5 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">24h 직업 완료 건수</span>
            <span className="font-semibold tabular text-emerald-600 dark:text-emerald-400">
              {groupDigits(stats.total_completions_24h)}건
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">24h 총 보상 지급액</span>
            <span className="font-semibold tabular text-primary">
              <Amount value={stats.total_paid_24h} />
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">평균 캡 소모율</span>
            <span className="font-semibold tabular">
              {stats.average_cap_usage_percent}%
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">일일 캡 100% 도달 유저</span>
            <span className="font-semibold tabular text-amber-600 dark:text-amber-400">
              {groupDigits(stats.capped_users_count)}명 ({stats.total_members_24h > 0 ? Math.round((stats.capped_users_count / stats.total_members_24h) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* AI 추천 의견 안내 */}
        <div className="rounded-md border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">자동 밸런싱 분석 리포트</p>
          <p>{statusConfig.description}</p>
          <p className="mt-1 text-primary/90 font-medium">권장 정책: {statusConfig.recommendation}</p>
        </div>

        {/* 상태 메시지 출력 */}
        {state.status !== 'idle' && state.message && (
          <div
            className={`rounded-md p-3 text-xs ${
              state.status === 'ok'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            }`}
          >
            {state.message}
          </div>
        )}

        {/* 자동 조절 실행 폼 */}
        <form action={formAction} className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            버튼을 누르면 현재 경제 지표 분석 결과(추천 일일 캡: <strong className="text-foreground">{groupDigits(stats.recommended_daily_cap)} WLD</strong>, 감액률: <strong className="text-foreground">{stats.recommended_decay_percent}%</strong>)가 즉시 직업 정책에 반영됩니다.
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? '밸런싱 정책 반영 중...' : '1-클릭 경제 밸런싱 정책 즉시 적용'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function WorkRankingChart({
  rankings,
  totalExecutions,
}: {
  readonly rankings: readonly AdminWorkJobRanking[];
  readonly totalExecutions: number;
}) {
  const rankBadges = ['1위', '2위', '3위', '4위', '5위'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>오늘 가장 많이 수행한 직업 순위</span>
          <span className="text-xs font-normal text-muted-foreground tabular">
            총 완료: {groupDigits(totalExecutions)}건
          </span>
        </CardTitle>
        <CardDescription>
          최근 24시간 동안 유저들이 가장 많이 수행하고 완료한 직업 순위 및 점유율입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rankings.length === 0 ? (
          <p className="text-center py-8 text-xs text-muted-foreground">
            최근 24시간 내 완료된 직업 작업이 없습니다.
          </p>
        ) : (
          <div className="grid gap-3.5">
            {rankings.map((item, index) => {
              const meta = getJobMeta(item.job_type);
              const rankLabel = rankBadges[index] ?? `${index + 1}위`;

              return (
                <div key={item.job_type} className="grid gap-1.5 rounded-md border p-3 bg-muted/20">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant={index < 3 ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                        {rankLabel}
                      </Badge>
                      <span className="font-semibold flex items-center gap-1">
                        <span>{meta.icon}</span> {meta.label}
                      </span>
                      <span className="text-muted-foreground">
                        ({groupDigits(item.members_24h)}명 참여)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 tabular font-medium">
                      <span>{groupDigits(item.completions_24h)}건 완료</span>
                      <span className="text-primary font-semibold">({item.share_percentage}%)</span>
                    </div>
                  </div>

                  {/* 수평 점유율 바 */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all duration-500 ${meta.color}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.share_percentage))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                    <span>누적 지급 보상액</span>
                    <Amount value={item.total_paid_24h} className="font-medium text-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkDailyCapGaugeCard({ stats }: WorkStatsProps) {
  const buckets = stats.cap_buckets;

  const bucketColors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-rose-500',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>⏱️ 일일 캡(Daily Cap) 소모율 5단계 구간 분포</span>
          <span className="text-xs font-normal text-muted-foreground tabular">
            평균 소모율: {stats.average_cap_usage_percent}%
          </span>
        </CardTitle>
        <CardDescription>
          유저들의 오늘 일일 직업 보상 상한(Cap) 도달 현황과 5단계 소모 구간별 인원 분포입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* 5단계 누적 복합 게이지 바 */}
        <div className="grid gap-2">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
            {buckets.map((b: AdminWorkDailyCapBucket, idx: number) => {
              if (b.percentage <= 0) return null;
              return (
                <div
                  key={b.bucket}
                  className={`h-full transition-all duration-500 ${bucketColors[idx % bucketColors.length]}`}
                  style={{ width: `${b.percentage}%` }}
                  title={`${b.label}: ${b.user_count}명 (${b.percentage}%)`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>0% (초기)</span>
            <span>50% (절반)</span>
            <span className="text-rose-500 font-semibold">100% (한도 도달)</span>
          </div>
        </div>

        {/* 구간별 상세 카드 리스트 */}
        <div className="grid gap-2">
          {buckets.map((b: AdminWorkDailyCapBucket, idx: number) => (
            <div
              key={b.bucket}
              className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${bucketColors[idx % bucketColors.length]}`}
                />
                <span className="font-medium">{b.label}</span>
              </div>
              <div className="flex items-center gap-3 tabular">
                <span className="text-muted-foreground">{groupDigits(b.user_count)}명</span>
                <span className="font-semibold w-12 text-right">{b.percentage}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 한도 도달자 강조 박스 */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              오늘 일일 상한 100% 한도 도달자
            </span>
            <span className="tabular font-bold text-amber-700 dark:text-amber-400">
              {groupDigits(stats.capped_users_count)}명
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            한도에 도달한 유저는 내일 자정(00:00 UTC) 전까지 추가 직업 보상 획득이 제한됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkTrendMiniChart({
  trends,
}: {
  readonly trends: readonly AdminWorkTrendDay[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 7일간 일일 직업 수행 추세 (Trend)</CardTitle>
        <CardDescription>
          과거 7일 동안의 일자별 총 직업 완료 건수와 보상 지급 총액 추세입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trends.length === 0 ? (
          <p className="text-center py-6 text-xs text-muted-foreground">
            과거 7일간 수행 이력 데이터가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>일자 (UTC)</TableHead>
                  <TableHead className="text-right">총 완료 건수</TableHead>
                  <TableHead className="text-right">총 보상 지급액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trends.map((day: AdminWorkTrendDay) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium text-xs">{day.date}</TableCell>
                    <TableCell className="tabular text-right text-xs font-semibold">
                      {groupDigits(day.count)}건
                    </TableCell>
                    <TableCell className="tabular text-right text-xs">
                      <Amount value={day.total_paid} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
