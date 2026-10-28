import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { FxControlTower } from './fx-control-tower';
import { parseFxStatusResponse } from './fx-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '한국은행 외환보유액 & 서울외환시장 관제 타워 | 관리자 콘솔',
  description: '가상 외환시장 관리자 관측 정보를 확인합니다. 검증되지 않은 수치와 금융 집행은 표시하지 않습니다.',
  robots: { index: false, follow: false },
};

export default async function AdminFxPage() {
  await requireAdminConsole('/admin/fx');

  const statusData = parseFxStatusResponse(
    await api<unknown>('/api/v1/admin/fx/status').catch(() => null),
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {statusData === null ? (
        <div role="alert" className="grid gap-3 rounded-xl border border-amber-500/40 p-5 text-sm">
          <strong>가상 외환시장 관측 정보를 확인할 수 없습니다.</strong>
          <p>관리자 API 또는 데이터베이스 조회가 검증되지 않아 환율·보유액·시장 상태를 표시하지 않습니다. 금융 집행도 중단됩니다.</p>
          <a href="/admin/fx" className="inline-flex min-h-11 w-fit items-center rounded-lg border px-4 py-2 font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회</a>
        </div>
      ) : <FxControlTower initialData={statusData} />}
    </div>
  );
}
