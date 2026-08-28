'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import {
  applyCorporateAction,
  createApproval,
  createSeasonEvent,
  createStock,
  decideApproval,
  deleteStock,
  setBusinessActive,
  setSeasonEventActive,
  setStockActive,
  setStockPrice,
  setUserRestriction,
} from './actions';

/**
 * The operator console's controls.
 *
 * Every destructive or audited act is behind a dialog that asks for the
 * reason the API is going to record. The original asked for some of these
 * with `window.prompt`, which cannot be laid out, cannot be cancelled
 * predictably from the keyboard, and announces nothing to a screen reader.
 */

export function RestrictionDialog({
  userId,
  displayName,
  restricted,
}: {
  readonly userId: string;
  readonly displayName: string;
  readonly restricted: boolean;
}) {
  const [state, action] = useActionState(setUserRestriction, IDLE);
  const next = !restricted;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={next ? 'destructive' : 'outline'} size="sm" className="min-h-11">
          {next ? '이용 제한' : '제한 해제'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="restricted" value={String(next)} />
          <DialogHeader>
            <DialogTitle>{displayName}</DialogTitle>
            <DialogDescription>
              {next
                ? '이 사용자의 서비스 이용을 제한합니다.'
                : '이 사용자의 제한을 해제합니다.'}{' '}
              사유는 감사 기록에 남습니다.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`reason-${userId}`}>사유</FieldLabel>
            <Textarea id={`reason-${userId}`} name="reason" rows={3} maxLength={2000} required />
          </Field>
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton variant={next ? 'destructive' : 'default'}>
              {next ? '제한 적용' : '제한 해제'}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApprovalDecision({ approvalRequestId }: { readonly approvalRequestId: string }) {
  const [state, action] = useActionState(decideApproval, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <input type="hidden" name="approvalRequestId" value={approvalRequestId} />
        <Field>
          <FieldLabel htmlFor={`decision-reason-${approvalRequestId}`} className="text-xs">
            사유 (선택)
          </FieldLabel>
          <Input id={`decision-reason-${approvalRequestId}`} name="reason" maxLength={2000} />
        </Field>
        <SubmitButton name="decision" value="approve" size="sm" className="min-h-11">
          승인
        </SubmitButton>
        <SubmitButton name="decision" value="reject" variant="outline" size="sm" className="min-h-11">
          반려
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function NewApprovalForm() {
  const [state, action] = useActionState(createApproval, IDLE);
  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="approval-action">작업 키</FieldLabel>
        <Input id="approval-action" name="action" maxLength={64} required />
        <FieldDescription>승인 정책이 정의한 작업 키를 그대로 입력합니다.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="approval-payload">payload (JSON)</FieldLabel>
        <Textarea
          id="approval-payload"
          name="payload"
          rows={4}
          spellCheck={false}
          className="font-mono text-xs"
          defaultValue="{}"
        />
        <FieldDescription>객체 형태의 JSON만 받습니다. 비우면 빈 객체로 보냅니다.</FieldDescription>
      </Field>
      <SubmitButton className="w-fit">승인 요청 등록</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}

export function NewStockForm() {
  const [state, action] = useActionState(createStock, IDLE);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="stock-symbol">종목 코드</FieldLabel>
        <Input id="stock-symbol" name="symbol" maxLength={12} required className="font-mono" />
      </Field>
      <Field>
        <FieldLabel htmlFor="stock-name">종목명</FieldLabel>
        <Input id="stock-name" name="name" maxLength={100} required />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="stock-description">설명</FieldLabel>
        <Input id="stock-description" name="description" maxLength={500} />
      </Field>
      <Field>
        <FieldLabel htmlFor="stock-price">시작 가격</FieldLabel>
        <AmountInput id="stock-price" name="price" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="stock-shares">발행 주식 수</FieldLabel>
        <AmountInput id="stock-shares" name="shares" defaultValue="1000000" required />
        {/* The float is the ceiling on how much of this company the members
            can own between them, so it is worth deciding rather than
            inheriting. */}
        <p className="text-xs text-muted-foreground">
          아무도 보유하지 않은 수량만 매수할 수 있어요.
        </p>
      </Field>
      <div className="flex items-end sm:col-span-2">
        <SubmitButton>종목 등록</SubmitButton>
      </div>
      <div className="sm:col-span-2">
        <ActionAlert state={state} />
      </div>
    </form>
  );
}

export function ToggleActive({
  id,
  active,
  kind,
}: {
  readonly id: string;
  readonly active: boolean;
  readonly kind: 'stock' | 'business' | 'season';
}) {
  const handlers = {
    stock: { action: setStockActive, field: 'stockId', on: '거래 재개', off: '거래 정지' },
    business: { action: setBusinessActive, field: 'businessId', on: '판매 재개', off: '판매 중지' },
    season: { action: setSeasonEventActive, field: 'eventId', on: '이벤트 재개', off: '이벤트 중지' },
  } as const;
  const handler = handlers[kind];
  const [state, action] = useActionState(handler.action, IDLE);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name={handler.field} value={id} />
        <input type="hidden" name="active" value={String(!active)} />
        <SubmitButton variant="outline" size="sm" className="min-h-11">
          {active ? handler.off : handler.on}
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function CorporateActionDialog({
  stockId,
  symbol,
}: {
  readonly stockId: string;
  readonly symbol: string;
}) {
  const [state, action] = useActionState(applyCorporateAction, IDLE);
  const [kind, setKind] = useState<'split' | 'reverse_split'>('split');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-11">
          기업 활동
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="stockId" value={stockId} />
          <input type="hidden" name="action" value={kind} />
          <DialogHeader>
            <DialogTitle>{symbol} 기업 활동</DialogTitle>
            <DialogDescription>
              액면분할과 병합은 보유 수량과 가격을 같은 배수로 조정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={kind === 'split' ? 'default' : 'outline'}
              onClick={() => setKind('split')}
              className="min-h-11"
            >
              액면분할
            </Button>
            <Button
              type="button"
              variant={kind === 'reverse_split' ? 'default' : 'outline'}
              onClick={() => setKind('reverse_split')}
              className="min-h-11"
            >
              액면병합
            </Button>
          </div>
          <Field>
            <FieldLabel htmlFor={`factor-${stockId}`}>비율</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id={`factor-${stockId}`}
                name="factor"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                defaultValue={2}
                required
              />
              <InputGroupAddon align="inline-end">배</InputGroupAddon>
            </InputGroup>
          </Field>
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton>적용</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewSeasonEventForm() {
  const [state, action] = useActionState(createSeasonEvent, IDLE);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="event-title">제목</FieldLabel>
        <Input id="event-title" name="title" maxLength={100} required />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="event-description">설명</FieldLabel>
        <Input id="event-description" name="description" maxLength={500} />
      </Field>
      <Field>
        <FieldLabel htmlFor="event-cost">참가비</FieldLabel>
        <AmountInput id="event-cost" name="costWld" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="event-points">회당 점수</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="event-points"
            name="pointsPerEntry"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
          />
          <InputGroupAddon align="inline-end">점</InputGroupAddon>
        </InputGroup>
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton>이벤트 등록</SubmitButton>
      </div>
      <div className="sm:col-span-2">
        <ActionAlert state={state} />
      </div>
    </form>
  );
}


/**
 * Sets a price by hand, behind a confirmation.
 *
 * Not an inline field in the table: this is the one control on the page that
 * changes what every holder's position is worth, and a number that applies as
 * soon as it loses focus is the wrong shape for that.
 */
export function SetPriceDialog({
  stockId,
  symbol,
  currentPrice,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly currentPrice: string;
}) {
  const [state, action] = useActionState(setStockPrice, IDLE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-11">
          주가 조정
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="stockId" value={stockId} />
          <DialogHeader>
            <DialogTitle>{symbol} 주가 조정</DialogTitle>
            <DialogDescription>
              현재가는 {groupDigits(currentPrice)} WLD 입니다. 조정한 가격이 오늘의 시가가 되고,
              시장은 그 가격을 기준으로 다시 움직입니다.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`price-${stockId}`}>조정할 가격</FieldLabel>
            <AmountInput
              id={`price-${stockId}`}
              name="price"
              defaultValue={currentPrice}
              required
            />
          </Field>
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton>주가 적용</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Deletes a stock, when the database will allow it.
 *
 * A stock that has traded cannot be removed — the trades are a ledger — so
 * the button says so before it is pressed rather than after. Retiring one
 * with a history is what 거래 정지 is for, and it is on the same row.
 */
export function DeleteStockDialog({
  stockId,
  symbol,
  holders,
  trades,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly holders: number;
  readonly trades: number;
}) {
  const [state, action] = useActionState(deleteStock, IDLE);
  const blocked = holders > 0 || trades > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-11 text-destructive">
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="stockId" value={stockId} />
          <DialogHeader>
            <DialogTitle>{symbol} 삭제</DialogTitle>
            <DialogDescription>
              {blocked
                ? `보유자 ${holders}명, 거래 기록 ${trades}건이 있어 삭제할 수 없어요. 거래 정지를 사용해 주세요.`
                : '거래 기록도 보유자도 없는 종목입니다. 삭제하면 되돌릴 수 없어요.'}
            </DialogDescription>
          </DialogHeader>
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton variant="destructive" disabled={blocked}>
              삭제 확정
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
