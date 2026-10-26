import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { BondControlTower } from './bond-control-tower';
import { parseAdminBondTelemetry } from './bond-telemetry';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '기획재정국채 (KTB) 통합 관제 타워 | 관리자 콘솔',
  description: '게임 내 가상 WLD 채권의 검증된 발행 및 쿠폰 정산 데이터를 관리자에게 표시합니다.',
  robots: { index: false, follow: false },
};

export default async function AdminBondsPage() {
  await requireAdminConsole('/admin/bonds');

  let telemetry = null;
  try {
    const [overview, bonds, couponLogs] = await Promise.all([
      api('/api/v1/admin/bonds/overview'),
      api('/api/v1/admin/bonds/list'),
      api('/api/v1/admin/bonds/coupon-logs?limit=30'),
    ]);
    telemetry = parseAdminBondTelemetry({ overview, bonds, couponLogs });
  } catch {
    // Never substitute a financial dashboard's missing API data with invented rates.
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BondControlTower initialTelemetry={telemetry} />
    </div>
  );
}
