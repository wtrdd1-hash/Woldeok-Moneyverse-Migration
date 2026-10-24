import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { getServerLocale } from '@/lib/locale-server';
import { requireAdminConsole } from '@/lib/session';
import { apiOrNull } from '@/lib/api';
import { ApiHealthDashboard, type ApiHealthResponse } from './api-health-dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '서버·데이터베이스 실측 상태 — 관리자',
  description: '관리자 전용 백엔드 프로세스 및 PostgreSQL 상태 측정',
  robots: { index: false, follow: false },
};

export default async function AdminApiHealthPage() {
  await requireAdminConsole('/admin/api-health');
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const data = await apiOrNull<ApiHealthResponse>('/api/v1/admin/api-health/status');

  return (
    <div data-page="admin-api-health" className="mv-page mv-page--admin mx-auto grid max-w-6xl gap-6">
      <Button asChild variant="ghost" className="-ml-3 min-h-11 w-fit text-muted-foreground">
        <Link href="/admin">
          <ArrowLeft aria-hidden="true" />
          {isEn ? 'Back to Admin Console' : '관리자 콘솔로 돌아가기'}
        </Link>
      </Button>

      <PageHeader eyebrow="MEASURED BACKEND TELEMETRY"
        title={isEn ? 'Backend & PostgreSQL Measurements' : '백엔드·PostgreSQL 실측 관제'}>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {isEn
            ? 'Read-only measurements from the backend process and one PostgreSQL ping. This is not a per-route uptime monitor or a backup verification.'
            : '백엔드 프로세스와 PostgreSQL 단일 응답을 읽기 전용으로 확인합니다. 개별 API 가동률이나 백업 검증을 의미하지 않습니다.'}
        </p>
      </PageHeader>

      <ApiHealthDashboard initialData={data} isEn={isEn} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="size-4" aria-hidden="true" />
          {isEn ? 'Endpoint coverage is not verified by this view.' : '개별 API 정상 여부는 별도 회귀 테스트로 확인해야 합니다.'}
        </div>
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/admin">{isEn ? 'Admin Console' : '관리자 콘솔'}</Link>
        </Button>
      </div>
    </div>
  );
}
