'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { TranslatedText as T } from '@/components/translated-text';
import { useLocale } from '@/components/locale-provider';
import { withdrawPendingPhoto } from './actions';

export function WithdrawPendingPhotoForm({
  photoId, idempotencyKey,
}: {
  readonly photoId: string;
  readonly idempotencyKey: string;
}) {
  const [state, action] = useActionState(withdrawPendingPhoto, IDLE);
  const { locale } = useLocale();
  return (
    <form action={action} className="grid gap-2" onSubmit={(event) => {
      if (!window.confirm(locale === 'ko'
        ? '검토 중인 사진을 철회할까요? 철회해도 오늘의 제출 횟수는 복원되지 않아요.'
        : 'Withdraw this pending photo? Today’s submission quota will not be restored.')) {
        event.preventDefault();
      }
    }}>
      <input type="hidden" name="photoId" value={photoId} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <SubmitButton variant="outline" size="sm">
        <T korean="제출 철회" english="Withdraw Pending Photo" />
      </SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
