'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck2, ShieldAlert } from 'lucide-react';

type AttendanceStatus = {
  signedIn: boolean;
  checkedInToday: boolean;
  streakDays: number;
  lastAttendedDate: string | null;
  claimAvailable: false;
};

export function DailyAttendanceRoulette() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/attendance/status', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Attendance read unavailable');
        const value: unknown = await response.json();
        if (!value || typeof value !== 'object' || typeof (value as AttendanceStatus).signedIn !== 'boolean') {
          throw new Error('Invalid attendance response');
        }
        if ((value as AttendanceStatus).signedIn && (
          !Number.isInteger((value as AttendanceStatus).streakDays)
          || (value as AttendanceStatus).streakDays < 0
          || (value as AttendanceStatus).streakDays > 7
          || typeof (value as AttendanceStatus).checkedInToday !== 'boolean'
        )) throw new Error('Invalid attendance data');
        if (!controller.signal.aborted) {
          setStatus(value as AttendanceStatus);
          setState('ready');
        }
      } catch {
        if (!controller.signal.aborted) setState('unavailable');
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="verified-attendance-heading" className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
      <h2 id="verified-attendance-heading" className="flex items-center gap-2 text-xl font-bold">
        <CalendarCheck2 aria-hidden="true" className="h-5 w-5 text-amber-400" />
        출석 기록 확인
      </h2>
      {state === 'loading' && <p role="status" className="mt-3 text-zinc-300">출석 기록을 확인하는 중입니다.</p>}
      {state === 'unavailable' && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-amber-300">
          <ShieldAlert aria-hidden="true" className="h-4 w-4" />
          출석 기록을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}
      {state === 'ready' && !status?.signedIn && (
        <p className="mt-3 text-zinc-300">로그인 후 본인의 출석 기록을 확인할 수 있습니다.</p>
      )}
      {state === 'ready' && status?.signedIn && (
        <div role="status" className="mt-3 space-y-2 text-zinc-200">
          <p>{status.streakDays}일 연속 출석 기록</p>
          <p>{status.checkedInToday ? '오늘 출석 기록이 확인되었습니다.' : '오늘 출석 기록이 확인되지 않았습니다.'}</p>
          {status.lastAttendedDate && <p className="text-sm">최근 기록: {status.lastAttendedDate}</p>}
        </div>
      )}
      <p className="mt-4 text-sm text-amber-200">
        출석 보상과 룰렛 WLD 지급은 금융 원장 정산 검증 전까지 중단되어 있습니다. 이 화면은 지급 영수증이 아닙니다.
      </p>
    </section>
  );
}
