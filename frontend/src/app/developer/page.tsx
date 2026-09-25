import type { Metadata } from 'next';
import { DeveloperPortalView } from './developer-portal-view';
import { appApiContract } from '@/lib/app-gateway';
import { requireAdministrator } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '개발자 포털 & API 센터 (관리자 전용) | Woldeok Moneyverse',
  description:
    '월덕 머니버스 전 도메인 RESTful API 규격, OpenAPI 3.0 명세, 실시간 스트림 규격 및 브라우저 라이브 API 샌드박스 테스터를 제공합니다.',
  robots: { index: false, follow: false },
};

export default async function DeveloperPage() {
  await requireAdministrator();
  const origin = process.env.APP_BASE_URL || 'https://easy-scraping.com';
  const contract = appApiContract(origin);

  return <DeveloperPortalView contract={contract} />;
}
