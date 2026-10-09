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
  title: '14대 도메인 API 헬스체크 & 실시간 관제 — 관리자',
  description: '월덕 머니버스 전 도메인 300+개 REST API의 실시간 가동률, 지연 시간(Latency), 성공률 및 인프라 관제.',
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
        eyebrow={liveData?.isLiveTelemetry ? 'LIVE SYSTEM TELEMETRY (실측)' : 'SYSTEM TELEMETRY'}
        title={isEn ? '14-Domain API Real-Time Health Tower' : '14대 도메인 API 실시간 관제 타워'}
      >
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isEn
            ? 'Authoritative real-time telemetry across all 14 active domains, Cloudflare R2 automated backups, and 300+ REST API endpoints verified for healthy entertainment standards.'
            : '건전한 엔터테인먼트 아케이드 및 14대 핵심 도메인 300여 개 엔드포인트의 실시간 응답 지연(Latency), 시스템 부하 및 Cloudflare R2 무료 자동 백업 재해 복구 관제입니다.'}
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
