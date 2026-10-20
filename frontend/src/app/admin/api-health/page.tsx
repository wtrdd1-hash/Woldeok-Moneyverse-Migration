import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { getServerLocale } from '@/lib/locale-server';
import { requireAdminConsole } from '@/lib/session';
import { apiOrNull } from '@/lib/api';
import { ApiHealthDashboard, type ApiHealthResponse } from './api-health-dashboard';

export const metadata: Metadata = {
  title: 'API 도메인 목록 및 실측 DB 상태 — 관리자',
  description: '관리자 전용 API 경로 카탈로그와 실측 데이터베이스·호스트 상태. 미측정 API 가용성은 명확히 구분합니다.',
  robots: { index: false, follow: false },
};

export default async function AdminApiHealthPage() {
  await requireAdminConsole('/admin/api-health');
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const liveData = await apiOrNull<ApiHealthResponse>('/api/v1/admin/api-health/status');

  return (
    <div data-page="admin-api-health" className="mv-page mv-page--admin grid gap-6 max-w-6xl mx-auto">
      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/admin">
          <ArrowLeft />
          {isEn ? 'Back to Admin Console' : '관리자 콘솔로 돌아가기'}
        </Link>
      </Button>

      <PageHeader
        eyebrow={'API CATALOG / MEASURED DB STATUS'}
        title={isEn ? 'API Domain Catalog & Measured DB Health' : '14대 API 도메인 목록 및 DB 실측 상태'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'View the listed API domains, measured database and host telemetry, and backup status. API availability and success rates are not measured.'
            : '14대 API 도메인 경로 목록과 실제 DB·호스트 측정값, 백업 상태를 확인합니다. API 가용성·성공률은 별도 측정하지 않습니다.'}
        </p>
      </PageHeader>

      <ApiHealthDashboard initialData={liveData} isEn={isEn} />

      <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="size-4 text-primary animate-pulse" />
          <span>공식 마스터 API 명세서: <b>docs/API_CATALOG_MASTER.ko.md</b> 동기화 완료</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/developer">
            개발자 포털 바로가기
          </Link>
        </Button>
      </div>
    </div>
  );
}
