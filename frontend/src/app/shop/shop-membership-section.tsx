'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MembershipTierCard, type MembershipPass } from '@/components/membership-tier-card';
import { subscribePlusMembership, cancelPlusMembership } from './actions';

interface ShopMembershipSectionProps {
  readonly userBalance: string | null;
  readonly isPlusMember: boolean;
  readonly pass: MembershipPass | null;
}

export function ShopMembershipSection({
  userBalance,
  isPlusMember,
  pass,
}: ShopMembershipSectionProps) {
  const router = useRouter();

  const handleSubscribe = async (catalogId: string): Promise<boolean> => {
    const res = await subscribePlusMembership(catalogId);
    if (!res.success) {
      throw new Error(res.message);
    }
    router.refresh();
    return true;
  };

  const handleCancel = async (): Promise<boolean> => {
    // The card explains an unconfirmed cancellation in the member's locale.
    const res = await cancelPlusMembership();
    if (!res.success) return false;
    router.refresh();
    return true;
  };

  return (
    <MembershipTierCard
      userBalance={userBalance}
      isPlusMember={isPlusMember}
      pass={pass}
      onSubscribe={handleSubscribe}
      onCancel={handleCancel}
    />
  );
}
