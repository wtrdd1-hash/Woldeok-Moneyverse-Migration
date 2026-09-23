/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useActionState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IDLE } from '@/lib/action-state';
import { deleteStockAlert } from '../alerts/actions';

interface StockAlertDeleteButtonProps {
  readonly alertId: string;
  readonly isEn?: boolean;
}

export function StockAlertDeleteButton({ alertId, isEn = false }: StockAlertDeleteButtonProps) {
  const [deleteState, deleteAction, isPending] = useActionState(deleteStockAlert, IDLE);

  return (
    <form action={deleteAction} className="inline-block">
      <input type="hidden" name="alertId" value={alertId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="h-7 px-2 text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
        title={isEn ? 'Delete this alert' : '이 알림 삭제'}
        aria-label={isEn ? 'Delete alert' : '알림 삭제'}
      >
        <Trash2 className="size-3.5 mr-1" />
        {isPending ? (isEn ? 'Deleting...' : '삭제 중...') : (isEn ? 'Delete' : '삭제')}
      </Button>
    </form>
  );
}
