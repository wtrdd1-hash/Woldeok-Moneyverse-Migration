import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { BondMaturityView, type BondMaturityOverview } from './bond-maturity-view';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '내 가상 채권 만기 현황',
  robots: {index: false, follow: false},
};

export default async function BankBondsPage() {
  await requireMember();
  const [locale, data] = await Promise.all([
    getServerLocale(),
    apiOrNull<BondMaturityOverview>('/api/v1/banking/bonds/maturity-overview'),
  ]);
  return <main className="mx-auto max-w-4xl px-4 py-8"><BondMaturityView data={data} isEn={locale === 'en'} /></main>;
}
