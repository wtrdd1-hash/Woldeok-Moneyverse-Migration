import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { BondControlTower } from './bond-control-tower';
import { parseBondEvidence, type BondEvidence } from './bond-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '기획재정국채 (KTB) 통합 관제 타워 | 관리자 콘솔',
  robots: { index: false, follow: false },
  description: '가상 국채 상품 및 정산 내역의 서버 조회 상태를 확인합니다.',
};

export default async function AdminBondsPage() {
  await requireAdminConsole('/admin/bonds');

  let evidence: BondEvidence | null = null;
  try {
    const [overview, bonds, couponLogs] = await Promise.all([
      api<unknown>('/api/v1/admin/bonds/overview'),
      api<unknown>('/api/v1/admin/bonds/list'),
      api<unknown>('/api/v1/admin/bonds/coupon-logs?limit=30'),
    ]);
    evidence = parseBondEvidence({ overview, bonds, couponLogs });
  } catch {
    // A failed read is not an empty financial inventory.
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BondControlTower
        initialOverview={evidence?.overview ?? null}
        initialBonds={evidence?.bonds ?? []}
        initialLogs={evidence?.couponLogs ?? []}
      />
    </div>
  );
}
