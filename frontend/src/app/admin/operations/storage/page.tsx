import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireAdminConsole } from '@/lib/session';
import { formatStorageBytes, validateStorageSnapshot } from './storage-view';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Verified Storage Headroom — Admin',
  description: 'Operator-only signed host disk capacity evidence; never a release approval.',
  robots: { index: false, follow: false },
};

export default async function StorageHeadroomPage() {
  await requireAdminConsole('/admin/operations/storage');
  const isEn = (await getServerLocale()) === 'en';
  const raw: unknown = await apiOrNull('/api/v1/admin/operations/storage');
  const snapshot = validateStorageSnapshot(raw);

  return (
    <main data-page="admin-storage-headroom" className="mv-page mv-page--admin mx-auto grid max-w-5xl gap-6">
      <Button asChild variant="ghost" className="w-fit"><Link href="/admin/api-health"><ArrowLeft />{isEn ? 'API health evidence' : 'API 상태 증빙'}</Link></Button>
      <PageHeader eyebrow="HOST-SIGNED · READ ONLY" title={isEn ? 'Verified Storage Headroom' : '검증된 호스트 저장공간 여유량'}>
        <p className="text-sm text-muted-foreground">{isEn
          ? 'This page never cleans files or authorizes a release. Only a fresh signed host snapshot is shown.'
          : '이 화면은 파일을 정리하거나 배포를 승인하지 않습니다. 호스트가 서명한 최신 증거만 표시합니다.'}</p>
      </PageHeader>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link href="/admin/operations/storage?refresh=1"><RefreshCw />{isEn ? 'Refresh' : '새로고침'}</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/api-health">{isEn ? 'View evidence' : '증빙 보기'}</Link></Button>
        <Button asChild variant="outline"><a href="https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170" target="_blank" rel="noopener noreferrer">{isEn ? 'Capacity incident' : '용량 사고 이슈'}</a></Button>
      </div>
      {!snapshot ? (
        <section role="alert" aria-live="assertive" className="rounded-xl border border-destructive p-5">
          <h2 className="font-semibold">UNKNOWN · RELEASE HOLD</h2>
          <p className="text-sm">{isEn ? 'Signed host evidence is missing, invalid or stale. Capacity is unverified.' : '서명된 호스트 증거가 없거나 유효하지 않거나 만료되었습니다. 저장공간 상태를 검증할 수 없습니다.'}</p>
        </section>
      ) : (
        <section aria-live="polite" className="grid gap-4 sm:grid-cols-2">
          {snapshot.mounts.map((mount) => (
            <article key={mount.mountAlias} className="min-w-0 rounded-xl border p-5" aria-label={mount.mountAlias}>
              <h2 className="flex items-center gap-2 font-semibold"><HardDrive aria-hidden="true" />{mount.mountAlias}</h2>
              <p className="mt-3 text-lg font-bold">{mount.severity} · {mount.usedPercent}%</p>
              <dl className="mt-3 grid gap-2 text-sm">
                <div><dt>{isEn ? 'Available to workers' : '일반 작업자 가용 공간'}</dt><dd>{formatStorageBytes(mount.availableBytes)}</dd></div>
                <div><dt>{isEn ? 'Used' : '사용 공간'}</dt><dd>{formatStorageBytes(mount.usedBytes)}</dd></div>
                <div><dt>{isEn ? 'Free inodes' : '남은 inode'}</dt><dd>{mount.inodeAvailable}</dd></div>
              </dl>
            </article>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-2">{isEn ? 'Measured at' : '측정 시각'}: {snapshot.observedAt} · {isEn ? 'Release remains on HOLD pending independent gates.' : '독립 검증 완료 전 배포 HOLD 유지.'}</p>
        </section>
      )}
    </main>
  );
}
