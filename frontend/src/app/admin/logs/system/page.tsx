import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { adminArea } from '../../areas';
import { LogsSubNav } from '../logs-sub-nav';
import { SystemLogsViewer } from './system-logs-viewer';
import type { SystemLogData } from './actions';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/logs');

export const metadata: Metadata = {
  title: `시스템 런타임 로그 - ${AREA.title}`,
  robots: { index: false, follow: false },
};

export default async function AdminSystemLogsPage() {
  await requireAdminConsole();

  const initialData = await apiOrNull<SystemLogData>('/api/v1/admin/logs/system?source=NGINX_ERROR&lines=100');

  const fallbackData: SystemLogData = {
    source: 'nginx-error',
    sourceName: 'NGINX_ERROR',
    lines: [],
    totalCount: 0,
    truncated: false,
    timestamp: new Date().toISOString(),
    status: 'EMPTY',
  };

  return (
    <div className="space-y-6">
      <AdminBack />

      <PageHeader
        eyebrow="런타임 관제"
        title="🖥️ 시스템 & 런타임 로그"
      >
        Nginx 웹서버 오류/접속 로그, 코어 API 백엔드 및 Next.js 프론트엔드의 실시간 런타임 로그를 모니터링합니다.
      </PageHeader>

      <LogsSubNav current="system" />

      <SystemLogsViewer initialData={initialData ?? fallbackData} />
    </div>
  );
}
