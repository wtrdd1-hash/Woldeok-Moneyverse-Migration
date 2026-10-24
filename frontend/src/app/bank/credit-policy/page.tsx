import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { VerifiedCreditPolicyCard, type VerifiedCreditPolicy } from '../verified-credit-policy-card';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '검증된 가상 은행 신용 정책',
  description: '회원 본인의 현재 게임 신용 정책과 대출 신청 조건을 확인합니다.',
  robots: { index: false, follow: false },
};

export default async function CreditPolicyPage() {
  await requireMember();
  const policy = await apiOrNull<VerifiedCreditPolicy>('/api/v1/banking/credit-policy');
  return (
    <main data-page="bank-credit-policy" className="mx-auto max-w-3xl space-y-4 pb-24">
      <h1 className="text-2xl font-bold">내 가상 은행 신용 정책</h1>
      <VerifiedCreditPolicyCard policy={policy} details />
    </main>
  );
}
