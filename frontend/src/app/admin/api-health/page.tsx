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
  title: 'API 목록 및 검증 가능한 인프라 관제 — 관리자',
  description: 'API 도메인 목록과 확인된 데이터베이스 연결·서버 측정값을 구분하여 보여주는 관리자 화면.',
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
        eyebrow={liveData?.isLiveTelemetry ? 'DB CONNECTIVITY SAMPLE' : 'UNVERIFIED TELEMETRY'}
        title={isEn ? 'API Inventory & Verified Health' : 'API 목록 및 검증된 상태 관제'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Domain endpoints are an inventory, not live health checks. Only collected host and database probes are shown as measured. Backup existence does not prove restore readiness.'
            : '도메인별 API 목록은 실제 가동률 측정이 아닙니다. 서버·DB의 확인된 측정값만 실측으로 표시하며, 백업 존재만으로 복구 성공을 보장하지 않습니다.'}
        </p>
      </PageHeader>

      <ApiHealthDashboard initialData={liveData} isEn={isEn} />

      <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="size-4 text-primary animate-pulse" />
          <span>API 목록 참고: <b>docs/API_CATALOG_MASTER.ko.md</b> (실시간 정합성 미검증)</span>
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
