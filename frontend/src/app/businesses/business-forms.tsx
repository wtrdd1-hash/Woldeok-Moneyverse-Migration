'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { purchaseBusiness, settleBusiness } from './actions';

export function PurchaseButton({ businessTypeId }: { readonly businessTypeId: string }) {
  const [state, action] = useActionState(purchaseBusiness, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="businessTypeId" value={businessTypeId} />
        <SubmitButton>사업권 구입</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function SettleButton({ ownershipId }: { readonly ownershipId: string }) {
  const [state, action] = useActionState(settleBusiness, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="ownershipId" value={ownershipId} />
        <SubmitButton variant="outline">오늘 정산하기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
