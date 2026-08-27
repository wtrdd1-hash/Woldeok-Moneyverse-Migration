'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { IDLE } from '@/lib/action-state';
import { useViewer } from '@/lib/use-viewer';
import { purchaseItem } from './actions';

/**
 * The buy control for one catalogue item.
 *
 * The confirmation step is carried over from the original, which asked with a
 * `window.confirm` before spending anyone's balance. It says the price the
 * page is showing *and* that the server will re-check it, because those are
 * different claims and only the second one is binding.
 */
export function PurchaseControl({
  itemId,
  itemName,
  price,
}: {
  readonly itemId: string;
  readonly itemName: string;
  readonly price: string;
}) {
  const viewer = useViewer();
  const [state, action] = useActionState(purchaseItem, IDLE);

  if (!viewer) return <Skeleton className="h-11 w-32" />;

  if (!viewer.signedIn) {
    return (
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/login">로그인 후 구매 →</Link>
      </Button>
    );
  }

  return (
    <div className="grid gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="min-h-11">구매하기 →</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{itemName}을(를) 구매할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              표시 가격은 <Amount value={price} currency /> 입니다. 결제 시점에 서버가 상품과
              가격을 다시 확인합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">취소</AlertDialogCancel>
            <form action={action}>
              <input type="hidden" name="itemId" value={itemId} />
              <AlertDialogAction asChild>
                <SubmitButton>구매 확정</SubmitButton>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ActionAlert state={state} />
    </div>
  );
}
