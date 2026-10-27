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
  title: '14대 도메인 API 측정 증빙 — 관리자',
  description: 'PostgreSQL 읽기 전용 상태 검사와 호스트 지표만 실측하며, 도메인별 API 가용성·지연·성공률은 별도 검증 전 미측정으로 표시합니다.',
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
        eyebrow={liveData?.dbProbe?.status === 'OPERATIONAL' ? 'DATABASE PROBE MEASURED · API ROUTES UNMEASURED' : 'API ROUTES UNMEASURED'}
        title={isEn ? '14-Domain API Measurement Evidence' : '14대 도메인 API 측정 증빙'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Only the read-only database probe and host statistics are measured. Route-level availability, latency and success rates are unmeasured; this dashboard is not release approval evidence.'
            : '읽기 전용 DB 상태 검사와 호스트 통계만 실측합니다. 14개 도메인의 API 경로별 가용성·지연·성공률은 측정되지 않았으며, 이 화면을 배포 승인 근거로 사용할 수 없습니다.'}
        </p>
      </PageHeader>

      <ApiHealthDashboard initialData={liveData} isEn={isEn} />

      <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="size-4 text-primary" />
          <span>API 명세서 참조: <b>docs/API_CATALOG_MASTER.ko.md</b> (실시간 검증 아님)</span>
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
