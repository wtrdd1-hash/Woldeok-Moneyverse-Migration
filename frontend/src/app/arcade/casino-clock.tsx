import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CasinoClockProps {
  readonly dayIndex: string;
  readonly weekIndex: string;
  readonly dayOfWeek: number;
  readonly realSecondsPerDay: number;
  readonly gameDaysPerWeek: number;
  readonly dayEndsAt: string;
  readonly weekEndsAt: string;
}

function resetTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function CasinoClock({
  dayIndex,
  weekIndex,
  dayOfWeek,
  realSecondsPerDay,
  gameDaysPerWeek,
  dayEndsAt,
  weekEndsAt,
}: CasinoClockProps) {
  const dayMinutes = realSecondsPerDay / 60;
  return (
    <Card className="overflow-hidden border-violet-500/30 bg-gradient-to-r from-violet-950/90 via-slate-950/95 to-amber-950/80 text-white shadow-xl">
      <CardContent className="grid gap-4 p-5 sm:grid-cols-[1.4fr_1fr] sm:items-center">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-violet-500/20 text-violet-100 hover:bg-violet-500/20">SERVER TIME</Badge>
            <Badge variant="outline" className="border-white/20 text-white">
              현실 {dayMinutes}분 = 서버 1일
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">
              서버 {Number(dayIndex) + 1}일 · {Number(weekIndex) + 1}주차 {dayOfWeek}일차
            </p>
            <p className="mt-1 text-sm text-white/70">
              서버 {gameDaysPerWeek}일이 한 주입니다. 작업·상점의 일/주 제한은 이 서버 시간을 기준으로 계산됩니다. 카지노 보호 한도와 자가제외는 현실 시간을 유지합니다.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <dt className="text-xs font-semibold text-white/60">다음 서버 날</dt>
            <dd className="mt-1 font-mono text-lg font-black">{resetTime(dayEndsAt)}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <dt className="text-xs font-semibold text-white/60">다음 서버 주</dt>
            <dd className="mt-1 font-mono text-lg font-black">{resetTime(weekEndsAt)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
