import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { adminArea } from '../../areas';
import { LogsSubNav } from '../logs-sub-nav';
import { ErrorLogsViewer } from './error-logs-viewer';
import { fetchStructuredErrorLogsAction } from './actions';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs');

export const metadata: Metadata = {
  title: `오류 & 장애 원장 - ${AREA.title}`,
  robots: { index: false, follow: false },
};

export default async function AdminErrorLogsPage() {
  await requireAdminConsole('/admin/logs/errors');

  const initialRes = await fetchStructuredErrorLogsAction('ALL', 'ALL', '', '', 'desc');

  const fallbackData = {
    logs: [],
    totalCount: 0,
    availableDates: [],
    availableCodes: [],
    availableRoutes: [],
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <AdminBack />

      <PageHeader
        eyebrow="장애 관제"
        title="🚨 화면 로드 & 시스템 장애 로그 원장"
      >
        클라이언트 화면 로드 실패, 런타임 크래시 및 시스템 장애 기록을 시간별, 날짜별, 오류 코드별로 정밀하게 필터링하고 분석합니다.
      </PageHeader>

      <LogsSubNav current="errors" />

      <ErrorLogsViewer initialData={initialRes.data ?? fallbackData} />
    </div>
  );
}
