'use client';

import { useActionState } from 'react';
import { Star } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { useLocale } from '@/components/locale-provider';
import { saveWorkFavoriteAction } from './work-favorite-actions';

export function FavoriteTaskButton({ taskId, saved }: { readonly taskId: string; readonly saved: boolean }) {
  const [state, action] = useActionState(saveWorkFavoriteAction, IDLE);
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const label = saved ? (isEn ? 'Remove from saved tasks' : '저장한 업무에서 제거') : (isEn ? 'Save this task' : '이 업무 저장');
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="saved" value={saved ? 'false' : 'true'} />
      <SubmitButton variant="outline" size="sm" className="min-h-11 gap-1" >
        <Star aria-hidden="true" className={saved ? 'size-4 fill-amber-500' : 'size-4'} />
        <span>{label}</span>
      </SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
