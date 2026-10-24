'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MembershipTierCard } from '@/components/membership-tier-card';
import { subscribePlusMembership, cancelPlusMembership } from './actions';

interface ShopMembershipSectionProps {
  readonly userBalance: string;
  readonly isPlusMember: boolean;
}

export function ShopMembershipSection({
  userBalance,
  isPlusMember,
}: ShopMembershipSectionProps) {
  const router = useRouter();

  const handleSubscribe = async (): Promise<boolean> => {
    const res = await subscribePlusMembership();
    if (!res.success) {
      throw new Error(res.message);
    }
    router.refresh();
    return true;
  };

  const handleCancel = async (): Promise<boolean> => {
    const res = await cancelPlusMembership();
    if (!res.success) {
      throw new Error(res.message);
    }
    router.refresh();
    return true;
  };

  return (
    <MembershipTierCard
      userBalance={userBalance}
      isPlusMember={isPlusMember}
      onSubscribe={handleSubscribe}
      onCancel={handleCancel}
    />
  );
}
