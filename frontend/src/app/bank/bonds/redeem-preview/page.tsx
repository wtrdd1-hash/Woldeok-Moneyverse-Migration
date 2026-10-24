import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { BondRedemptionPreview, type BondRedemptionQuote } from '../../bond-redemption-preview';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '가상 채권 수령 미리보기',
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function BondRedemptionPreviewPage({ searchParams }: { readonly searchParams: Promise<{ bondId?: string }> }) {
  await requireMember();
  const { bondId } = await searchParams;
  const locale = await getServerLocale();
  const preview = bondId && UUID.test(bondId)
    ? await apiOrNull<BondRedemptionQuote>(`/api/v1/banking/bonds/${encodeURIComponent(bondId)}/redemption-preview`)
    : null;
  if (!preview || preview.bondId !== bondId || preview.previewOnly !== true || preview.payoutGuaranteed !== false) {
    return <EmptyState title={locale === 'en' ? 'Verified bond preview unavailable' : '확인된 채권 미리보기를 불러올 수 없습니다.'} description={locale === 'en' ? 'Check your holdings in the virtual bank.' : '가상 은행에서 본인 보유 채권을 다시 확인해 주세요.'} />;
  }
  return <BondRedemptionPreview preview={preview} locale={locale} />;
}
