'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoment, groupDigits } from '@/lib/money';
import type { WorkSummary } from './work';
import { progressPercent, remaining } from './work';

interface WorkQuotaDashboardProps {
  readonly summary: WorkSummary;
  readonly isEn: boolean;
}

export function WorkQuotaDashboard({ summary, isEn }: WorkQuotaDashboardProps) {
  const dailyRemaining = remaining(summary.daily_paid, summary.daily_cap);
  const weeklyRemaining = remaining(summary.weekly_paid, summary.weekly_cap);
  const dailyPercent = progressPercent(summary.daily_paid, summary.daily_cap);
  const weeklyPercent = progressPercent(summary.weekly_paid, summary.weekly_cap);

  const isDailyCapped = dailyRemaining === '0' || dailyPercent >= 100;
  const isWeeklyCapped = weeklyRemaining === '0' || weeklyPercent >= 100;

  return (
    <section aria-labelledby="work-quota-title" className="grid gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 id="work-quota-title" className="text-xl font-bold flex items-center gap-2">
            <span>⏱️</span> {isEn ? 'Reward limits & server resets' : '일일·주간 보상 한도 및 초기화'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEn
              ? 'These counters use the authoritative Moneyverse game clock. The API and payout engine use the same day/week window.'
              : '권위 있는 머니버스 게임시간을 기준으로 하며, 자정(00:00)에 일일 한도가 자동으로 초기화됩니다.'}
          </p>
        </div>
      </div>

      {/* 100% 한도 도달 시 경고 배너 */}
      {isDailyCapped && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-bold">
                {isEn ? 'Daily reward cap reached (100%)' : '오늘 일일 보상 한도(100%)에 도달했습니다'}
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                {isEn
                  ? 'Additional work completions today will not yield WLD rewards. Resets at UTC 00:00.'
                  : '오늘의 일일 상한에 도달하여 추가 보상 획득이 제한됩니다. 내일 자정(00:00)에 다시 시작하세요.'}
              </p>
            </div>
          </div>
          <Badge className="bg-amber-600 text-white shrink-0">
            {isEn ? 'Capped' : '한도 도달'}
          </Badge>
        </div>
      )}

      {/* 2열 쿼터 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 일간 직업 보상 카드 */}
        <Card className={`transition-all ${isDailyCapped ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/80'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-primary">
                GAME DAY RESET
              </CardDescription>
              <Badge variant={isDailyCapped ? 'destructive' : 'secondary'} className="text-[10px] px-2">
                {isDailyCapped ? (isEn ? '100% Capped' : '100% 한도 소모') : `${dailyPercent}% 소모`}
              </Badge>
            </div>
            <CardTitle className="text-lg">{isEn ? 'Daily work reward' : '일간 직업 보상'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <span className="font-mono text-xl font-black">
                {groupDigits(summary.daily_paid)} / {summary.daily_cap === '0' || summary.daily_cap === null ? '∞' : `${groupDigits(summary.daily_cap)} WLD`}
              </span>
              <span className={`text-xs font-semibold ${isDailyCapped ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isEn ? `${dailyRemaining} WLD left` : `${dailyRemaining} WLD 남음`}
              </span>
            </div>

            <Progress
              value={dailyPercent}
              className={`h-2.5 ${isDailyCapped ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
              aria-label={isEn ? 'Daily work reward usage' : '일간 직업 보상 사용량'}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>{isEn ? 'Next reset' : '다음 초기화'}</span>
              <strong className="text-foreground">{formatMoment(summary.day_ends_at)}</strong>
            </div>
          </CardContent>
        </Card>

        {/* 주간 직업 보상 카드 */}
        <Card className={`transition-all ${isWeeklyCapped ? 'border-rose-500/40 bg-rose-500/5' : 'border-border/80'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-primary">
                GAME WEEK RESET
              </CardDescription>
              <Badge variant={isWeeklyCapped ? 'destructive' : 'secondary'} className="text-[10px] px-2">
                {isWeeklyCapped ? (isEn ? 'Weekly Capped' : '주간 한도 도달') : `${weeklyPercent}% 소모`}
              </Badge>
            </div>
            <CardTitle className="text-lg">{isEn ? 'Weekly work reward' : '주간 직업 보상'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <span className="font-mono text-xl font-black">
                {groupDigits(summary.weekly_paid)} / {summary.weekly_cap === '0' || summary.weekly_cap === null ? '∞' : `${groupDigits(summary.weekly_cap)} WLD`}
              </span>
              <span className={`text-xs font-semibold ${isWeeklyCapped ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
                {isEn ? `${weeklyRemaining} WLD left` : `${weeklyRemaining} WLD 남음`}
              </span>
            </div>

            <Progress
              value={weeklyPercent}
              className={`h-2.5 ${isWeeklyCapped ? '[&>div]:bg-rose-500' : '[&>div]:bg-primary'}`}
              aria-label={isEn ? 'Weekly work reward usage' : '주간 직업 보상 사용량'}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>{isEn ? 'Next reset' : '다음 초기화'}</span>
              <strong className="text-foreground">{formatMoment(summary.week_ends_at)}</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
