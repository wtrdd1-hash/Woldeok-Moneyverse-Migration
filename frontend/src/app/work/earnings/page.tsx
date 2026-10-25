import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { WorkEarningsView, type VerifiedWorkEarnings } from '../work-earnings-view';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '원장 확인 업무 보상 내역',
  robots: { index: false, follow: false },
};

export default async function WorkEarningsPage() {
  await requireMember();
  const isEn = (await getServerLocale()) === 'en';
  const earnings = await apiOrNull<VerifiedWorkEarnings>('/api/v1/work/earnings');
  return <div data-page="work-earnings" className="mv-page mv-page--finance grid gap-5 pb-10">
    <Link href="/work" className="inline-flex min-h-11 w-fit items-center rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {isEn ? '← Back to work' : '← 업무로 돌아가기'}
    </Link>
    <PageHeader eyebrow="WORK · LEDGER" title={isEn ? 'Verified work earnings' : '원장 확인 업무 보상'}>
      {isEn ? 'Only actual owner-ledger credits count as paid WLD.' : '본인 금융 원장에 실제로 기록된 업무 보상만 지급액으로 계산합니다.'}
    </PageHeader>
    <WorkEarningsView earnings={earnings} isEn={isEn} />
  </div>;
}
