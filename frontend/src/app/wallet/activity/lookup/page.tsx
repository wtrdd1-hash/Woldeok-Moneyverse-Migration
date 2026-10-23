import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'WLD 거래 조회', robots: { index: false, follow: false }, other: { referrer: 'no-referrer' } };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function WalletHistoricalLookup({
  searchParams,
}: { searchParams: Promise<{ transactionId?: string | string[] }> }) {
  await requireMember();
  const { transactionId } = await searchParams;
  if (typeof transactionId !== 'string' || !UUID.test(transactionId)) notFound();
  redirect(`/wallet/activity/${encodeURIComponent(transactionId.toLowerCase())}`);
}
