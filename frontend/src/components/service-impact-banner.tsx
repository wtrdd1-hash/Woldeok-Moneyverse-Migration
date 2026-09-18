import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { serviceImpact } from '@/lib/service-impact';
import type { ServiceStatusRow } from '@/lib/service-impact';

const MESSAGE = {
  degraded: '일부 서비스의 응답이 느려지고 있습니다.',
  outage: '일부 서비스에 장애가 발생했습니다.',
  maintenance: '일부 서비스가 점검 중입니다.',
  unknown: '서비스 상태의 최신 확인이 필요합니다.',
  operational: '서비스가 정상입니다.',
} as const;

export async function ServiceImpactBanner() {
  const data = await publicApi<{ status: ServiceStatusRow[] }>('/api/v1/status', 30);
  if (!data) return null;
  const impact = serviceImpact(data.status ?? [], Date.now());
  if (!impact) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="서비스 상태 알림"
      className="border-b border-amber-300/70 bg-amber-50 px-4 py-2 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <strong>{MESSAGE[impact.state]}</strong>
        {impact.staleCount > 0 ? (
          <span className="text-xs opacity-80">{impact.staleCount}개 항목 최신 확인 필요</span>
        ) : null}
        <Link
          href="/status"
          className="ml-auto min-h-11 content-center font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          상태 자세히 보기
        </Link>
      </div>
    </aside>
  );
}
