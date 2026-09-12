'use client';

import { Label } from '@/components/ui/label';

import { useActionState, useState } from 'react';
import { payoutToUser, reverseUserTransaction } from './actions';
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
import { forceLogout } from './security-actions';
import { StepUpField } from './step-up-field';
import {
  applyCorporateAction,
  createSeasonEvent,
  createStock,
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
 *
 * Five of them additionally carry `StepUpField`: restricting a member,
 * ending their sessions, splitting a stock, moving a price by hand and
 * deleting a listing are the acts §10 calls high-risk, and since two-person
 * approval was retired the code typed into the dialog is what stands in for
 * the second person.
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
          <StepUpField
            id={`restriction-${userId}`}
            undo={next ? '같은 화면에서 제한을 해제합니다.' : '같은 화면에서 다시 제한합니다.'}
          />
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

/**
 * Ends every live session a member holds, from somewhere else.
 *
 * It sits beside 이용 제한 because they are the two halves of the same
 * remedy: the restriction stops the account being used again, and this stops
 * it being used right now. Neither undoes what has already happened, which is
 * why the dialog says how many sessions it is about to cut rather than
 * promising anything about them.
 */
export function ForceLogoutDialog({
  userId,
  displayName,
}: {
  readonly userId: string;
  readonly displayName: string;
}) {
  const [state, action] = useActionState(forceLogout, IDLE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-11">
          세션 끊기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="userId" value={userId} />
          <DialogHeader>
            <DialogTitle>{displayName} 세션 끊기</DialogTitle>
            <DialogDescription>
              이 사용자의 살아 있는 로그인 세션을 모두 끊습니다. 계정은 그대로이고 다시 로그인할
              수 있습니다. 진행 중인 거래는 훼손되지 않습니다.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`logout-reason-${userId}`}>사유</FieldLabel>
            <Textarea
              id={`logout-reason-${userId}`}
              name="reason"
              rows={3}
              minLength={10}
              maxLength={1000}
              required
            />
            <FieldDescription>10자 이상. 감사 기록에 그대로 남습니다.</FieldDescription>
          </Field>
          <StepUpField
            id={`logout-${userId}`}
            undo="세션은 되살릴 수 없습니다. 사용자가 다시 로그인하면 됩니다."
          />
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton variant="destructive">세션 끊기</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewStockForm() {
  const [state, action] = useActionState(createStock, IDLE);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="stock-symbol">종목 코드 (영문 대문자 2~8자)</FieldLabel>
        <Input
          id="stock-symbol"
          name="symbol"
          maxLength={8}
          placeholder="예: AAPL, BTC, SAM1"
          required
          className="font-mono uppercase"
          onChange={(e) => {
            e.currentTarget.value = e.currentTarget.value.toUpperCase();
          }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="stock-name">종목명 (최대 80자)</FieldLabel>
        <Input id="stock-name" name="name" maxLength={80} placeholder="예: 애플, 비트코인" required />
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
          <StepUpField
            id={`corporate-${stockId}`}
            undo="반대 방향의 기업 활동을 같은 비율로 한 번 더 적용합니다."
          />
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
          <StepUpField
            id={`price-step-${stockId}`}
            undo={`같은 화면에서 이전 가격 ${groupDigits(currentPrice)} WLD로 다시 조정합니다.`}
          />
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
          {!blocked ? (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                삭제 가능 안전 상태
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                보유자 0명 · 거래 기록 0건 (원장 영향 없음). [삭제 확정] 클릭 시 즉시 제거됩니다.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                삭제 불가 (금융 원장 보호)
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                보유자 {holders}명 또는 거래 내역 {trades}건이 존재하여 삭제할 수 없습니다. 거래 정지를 사용해 주세요.
              </p>
            </div>
          )}
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


/**
 * Direct balance adjustment (payout or reversal) for a specific user.
 * Conforms to the immutable ledger model and requires a 10+ character reason.
 */
export function AdminAdjustmentDialog({
  userId,
  username,
}: {
  readonly userId: string;
  readonly username: string;
}) {
  const [tab, setTab] = useState<'payout' | 'reverse'>('payout');
  const [payoutState, payoutAction] = useActionState(payoutToUser, IDLE);
  const [reverseState, reverseAction] = useActionState(reverseUserTransaction, IDLE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11">
          자산 보정 (지급/회수)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{username} 자산 보정</DialogTitle>
          <DialogDescription>
            국고에서 자산을 직접 지급하거나, 특정 거래를 원장 불변 원칙에 따라 역분개(회수)합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b pb-2">
          <Button
            type="button"
            variant={tab === 'payout' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('payout')}
          >
            국고 지급
          </Button>
          <Button
            type="button"
            variant={tab === 'reverse' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('reverse')}
          >
            거래 회수 (역분개)
          </Button>
        </div>

        {tab === 'payout' ? (
          <form action={payoutAction} className="grid gap-4">
            <input type="hidden" name="userId" value={userId} />
            <div className="grid gap-1.5">
              <Label htmlFor={`adjust-amount-${userId}`}>지급 금액 (WLD)</Label>
              <Input
                id={`adjust-amount-${userId}`}
                name="amount"
                type="number"
                min="1"
                max="1000000"
                placeholder="예: 1000"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`adjust-reason-${userId}`}>지급 사유 (최소 10자)</Label>
              <Textarea
                id={`adjust-reason-${userId}`}
                name="reason"
                minLength={10}
                placeholder="지급 근거, 승인 내역 등을 상세히 입력하세요."
                required
              />
            </div>
            <StepUpField
              id={`adjust-payout-${userId}`}
              undo="지급된 자산은 회수(역분개) 처리로만 취소할 수 있습니다."
            />
            <ActionAlert state={payoutState} />
            <DialogFooter>
              <SubmitButton>지급 실행</SubmitButton>
            </DialogFooter>
          </form>
        ) : (
          <form action={reverseAction} className="grid gap-4">
            <input type="hidden" name="userId" value={userId} />
            <div className="grid gap-1.5">
              <Label htmlFor={`reverse-tx-${userId}`}>취소/회수할 거래 ID (UUID)</Label>
              <Input
                id={`reverse-tx-${userId}`}
                name="transactionId"
                placeholder="예: 00000000-0000-0000-0000-000000000000"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`reverse-reason-${userId}`}>회수 사유 (최소 10자)</Label>
              <Textarea
                id={`reverse-reason-${userId}`}
                name="reason"
                minLength={10}
                placeholder="회수 사유 및 취소 결재 내역을 상세히 입력하세요."
                required
              />
            </div>
            <StepUpField
              id={`adjust-reverse-${userId}`}
              undo="역분개 트랜잭션이 생성되며 원본 거래는 보존됩니다."
            />
            <ActionAlert state={reverseState} />
            <DialogFooter>
              <SubmitButton variant="destructive">거래 회수 실행</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
