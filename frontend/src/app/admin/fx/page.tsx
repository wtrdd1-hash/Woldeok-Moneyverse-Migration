import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { getFxStatus } from './actions';
import { FxControlTower } from './fx-control-tower';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '한국은행 외환보유액 & 서울외환시장 관제 타워 | 관리자 콘솔',
  description: '중앙은행 외환보유액(USD), 실시간 환율 궤적 및 외환당국 스무딩 오퍼레이션을 총괄 관제합니다.',
};

export default async function AdminFxPage() {
  await requireAdminConsole('/admin/fx');

  const statusData = await getFxStatus().catch(() => null);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FxControlTower initialData={statusData} />
    </div>
  );
}
