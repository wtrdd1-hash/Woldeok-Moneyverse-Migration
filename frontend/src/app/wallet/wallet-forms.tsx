'use client';

import Link from 'next/link';
import { useActionState, useState, useEffect } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Amount } from '@/components/amount';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { TranslatedText as T } from '@/components/translated-text';
import { IDLE } from '@/lib/action-state';
import type { ActionState } from '@/lib/action-state';
import { formatDay } from '@/lib/money';
import { borrow, claimDaily, moveBank, repay, transfer } from './actions';

export interface RewardAvailability {
  readonly dailyAvailable: boolean;
  readonly dailyNextEligibleAt: string | null;
  readonly workAvailable: boolean;
  readonly workNextEligibleAt: string | null;
}

function unavailableHint(nextEligibleAt: string | null): string {
  if (!nextEligibleAt) return '지금은 보상을 받을 수 없어요.';
  const value = new Date(nextEligibleAt);
  if (Number.isNaN(value.valueOf())) return '지금은 보상을 받을 수 없어요.';
  return `다음 수령 가능: ${new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(value)}`;
}

export function RewardButtons({ availability }: { readonly availability: RewardAvailability | null }) {
  const [dailyState, daily] = useActionState(claimDaily, IDLE);
  const dailyClaimed = dailyState.status === 'ok' || availability?.dailyAvailable === false;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <form action={daily}>
          <SubmitButton disabled={dailyClaimed}>
            <Sparkles className="size-4 text-amber-500 mr-1.5" /> <T korean="오늘의 보상 받기" english="Claim Daily Reward" />
          </SubmitButton>
        </form>
        <Button asChild variant="outline">
          <Link href="/work">
            ◈ <T korean="직업 업무 수행하기" english="Do Career Work" />
          </Link>
        </Button>
      </div>
      {availability?.dailyAvailable === false && (
        <p className="text-xs text-muted-foreground">
          <T korean="오늘의 보상" english="Daily Reward" /> · {unavailableHint(availability.dailyNextEligibleAt)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        <T
          korean="작업 보상은 이제 직업별 업무를 완료하는 즉시 WLD와 숙련도 EXP로 지급됩니다."
          english="Work rewards are now paid immediately as WLD and proficiency EXP when you complete career tasks."
        />
      </p>
      <ActionAlert state={dailyState} />
    </div>
  );
}

const PENDING_TRANSFER_STORAGE = 'moneyverse:wallet:pending-transfer:v1';
const TRANSFER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type TransferAttempt = NonNullable<ActionState['transferAttempt']>;

function validTransferAttempt(value: unknown): value is TransferAttempt {
  if (!value || typeof value !== 'object') return false;
  const attempt = value as Partial<TransferAttempt>;
  return typeof attempt.recipientUserId === 'string' && TRANSFER_UUID.test(attempt.recipientUserId)
    && typeof attempt.idempotencyKey === 'string' && TRANSFER_UUID.test(attempt.idempotencyKey)
    && typeof attempt.amount === 'string' && /^[1-9][0-9]*$/.test(attempt.amount);
}

export function TransferForm({ currency, userId }: { readonly currency: string; readonly userId: string }) {
  const storageKey = `${PENDING_TRANSFER_STORAGE}:${userId}`;
  const [state, action] = useActionState(transfer, IDLE);
  const [recipientUserId, setRecipientUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [requestKey, setRequestKey] = useState('');
  const [pendingAttempt, setPendingAttempt] = useState<TransferAttempt | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [validationError, setValidationError] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      const restored: unknown = stored ? JSON.parse(stored) : null;
      if (validTransferAttempt(restored)) {
        setRecipientUserId(restored.recipientUserId);
        setAmount(restored.amount);
        setRequestKey(restored.idempotencyKey);
        setPendingAttempt(restored);
      } else {
        if (stored) sessionStorage.removeItem(storageKey);
        setPendingAttempt(null);
        setRecipientUserId('');
        setAmount('');
        setValidationError(false);
        setRequestKey(crypto.randomUUID());
      }
    } catch {
      // No persistent request identity means a lost response could be retried
      // with a new key after navigation. Fail closed instead.
      setStorageError(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (state.status === 'ok') {
      try { sessionStorage.removeItem(storageKey); } catch { setStorageError(true); }
      setPendingAttempt(null);
      setRecipientUserId('');
      setAmount('');
      setRequestKey(crypto.randomUUID());
    } else if (state.errorCode === 'transfer_verification_pending' && state.transferAttempt) {
      setPendingAttempt(state.transferAttempt);
      try { sessionStorage.setItem(storageKey, JSON.stringify(state.transferAttempt)); }
      catch { setStorageError(true); }
    } else if (state.status === 'error') {
      setPendingAttempt(null);
      try { sessionStorage.removeItem(storageKey); } catch { setStorageError(true); }
    }
  }, [state, storageKey]);

  const addAmount = (num: number) => {
    if (pendingAttempt) return;
    const cur = parseInt(amount, 10) || 0;
    setAmount(String(cur + num));
    setValidationError(false);
    setRequestKey(crypto.randomUUID());
  };

  const submitTransfer = (event: React.FormEvent<HTMLFormElement>) => {
    const canonicalAmount = amount.replace(/^0+(?=\d)/, '');
    const attempt = {
      recipientUserId: recipientUserId.trim(), amount: canonicalAmount, idempotencyKey: requestKey,
    };
    if (storageError || !validTransferAttempt(attempt)) {
      event.preventDefault();
      if (!storageError) setValidationError(true);
      return;
    }
    setValidationError(false);
    try {
      // Persist before dispatch, not only after an error response: the browser
      // may never receive that response or may be reloaded during the request.
      sessionStorage.setItem(storageKey, JSON.stringify(attempt));
      setPendingAttempt(attempt);
    } catch {
      event.preventDefault();
      setStorageError(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <T korean="WLD 보내기" english="Transfer WLD" />
        </CardTitle>
        <CardDescription>
          <T korean="활동 지갑에서만 전송됩니다." english="Transferred exclusively from your active cash balance." />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} onSubmit={submitTransfer} className="grid gap-4">
          <input type="hidden" name="idempotencyKey" value={requestKey} />
          <FieldGroup className="gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="recipientUserId">
                <T korean="받는 사람의 머니버스 ID" english="Recipient's Moneyverse ID" />
              </FieldLabel>
              <Input
                id="recipientUserId"
                name="recipientUserId"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={36}
                placeholder="UUID"
                required
                readOnly={Boolean(pendingAttempt)}
                aria-readonly={Boolean(pendingAttempt)}
                value={recipientUserId}
                onChange={(event) => {
                  if (pendingAttempt) return;
                  setRecipientUserId(event.target.value);
                  setValidationError(false);
                  setRequestKey(crypto.randomUUID());
                }}
                className="min-h-11"
              />
              <FieldDescription>
                <T
                  korean="이름·이메일·Discord ID로는 찾을 수 없어요. 상대가 공유한 정확한 ID를 입력해 주세요."
                  english="Cannot search by name or Discord tag. Please enter the recipient's exact 36-char ID."
                />
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="transfer-amount">
                <T korean="보낼" english="Amount in" /> {currency}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="transfer-amount"
                  name="amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="0"
                  value={amount}
                  readOnly={Boolean(pendingAttempt)}
                  aria-readonly={Boolean(pendingAttempt)}
                  onChange={(event) => {
                    if (pendingAttempt) return;
                    setAmount(event.target.value);
                    setValidationError(false);
                    setRequestKey(crypto.randomUUID());
                  }}
                  required
                  className="min-h-11"
                />
                <InputGroupAddon align="inline-end">{currency}</InputGroupAddon>
              </InputGroup>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {[1000, 5000, 10000, 50000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={Boolean(pendingAttempt)}
                    className="h-7 text-xs px-2"
                    onClick={() => addAmount(val)}
                  >
                    +{val.toLocaleString()}
                  </Button>
                ))}
              </div>
              <FieldDescription>
                <T
                  korean="송금 즉시 지갑에서 전송돼요. 받는 사람과 보낼 금액을 한 번 더 확인해 주세요."
                  english="Recorded directly to the ledger upon sending. Double check the recipient and amount."
                />
              </FieldDescription>
            </Field>
          </FieldGroup>

          {pendingAttempt && (
            <div role="status" aria-live="polite" className="rounded-md border border-amber-500/60 bg-amber-500/10 p-3 text-sm">
              <p className="font-semibold">송금 처리 여부 확인 중 — 동일한 요청만 다시 보낼 수 있습니다.</p>
              <p className="mt-1">이전 요청이 아직 처리되지 않았다면 같은 키로 다시 보내는 동작이 실제 송금을 실행할 수 있습니다. 새 송금을 시작하지 말고 <Link className="underline" href="/wallet/activity">원장 내역</Link>을 확인하세요.</p>
            </div>
          )}
          {storageError && (
            <p role="alert" className="text-sm text-destructive">브라우저가 송금 요청을 안전하게 보관할 수 없어 송금이 차단되었습니다. 저장 기능을 확인한 뒤 다시 열어 주세요.</p>
          )}
          {validationError && (
            <p role="alert" className="text-sm text-destructive">정확한 머니버스 ID와 1 이상의 정수 금액을 입력해 주세요.</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              <T korean={`1 ${currency} 이상 정수만 보낼 수 있어요.`} english={`Only whole integers of 1 ${currency} or more can be sent.`} />
            </p>
            <SubmitButton disabled={storageError || !requestKey} className="min-h-11 font-bold">
              {pendingAttempt ? '동일 요청 다시 보내기' : <T korean="돈 보내기" english="Send WLD" />}
            </SubmitButton>
          </div>
          <ActionAlert state={state} />
        </form>
      </CardContent>
    </Card>
  );
}

export function BankPanel() {
  const [moveState, moveAction] = useActionState(moveBank, IDLE);
  const [borrowState, borrowAction] = useActionState(borrow, IDLE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <T korean="보관과 대출" english="Vault Savings & Loans" />
        </CardTitle>
        <CardDescription>
          <T
            korean="가상 경제 안에서 유연하게 활용할 수 있어요. (고정 연이율 5%)"
            english="Loans are used strictly inside the in-game economy with 5% fixed interest."
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <form action={moveAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="bank-move-amount">
              <T korean="입출금 WLD" english="Vault Deposit / Withdraw" />
            </FieldLabel>
            <AmountInput id="bank-move-amount" name="amount" placeholder="0" required />
          </Field>
          <div className="flex flex-wrap gap-2">
            <SubmitButton name="direction" value="deposit">
              <T korean="은행에 넣기" english="Deposit to Bank" />
            </SubmitButton>
            <SubmitButton name="direction" value="withdraw" variant="outline">
              <T korean="은행에서 꺼내기" english="Withdraw from Bank" />
            </SubmitButton>
          </div>
          <ActionAlert state={moveState} />
        </form>

        <form action={borrowAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="loan-principal">
              <T korean="대출 WLD (100~500,000)" english="Borrow WLD (100–500,000)" />
            </FieldLabel>
            <AmountInput id="loan-principal" name="principalAmount" placeholder="0" required />
            <FieldDescription>
              <T korean="대출 원금에 5% 이자가 더해집니다." english="5% fixed interest is added to the principal amount." />
            </FieldDescription>
          </Field>
          <SubmitButton className="w-fit">
            <T korean="대출금 받기" english="Apply for Loan" />
          </SubmitButton>
          <ActionAlert state={borrowState} />
        </form>
      </CardContent>
    </Card>
  );
}

export interface LoanView {
  readonly loanId: string;
  readonly principalAmount: string;
  readonly interestAmount: string;
  readonly outstandingAmount: string;
  readonly status: 'active' | 'repaid' | 'overdue';
  readonly issuedAt: string;
  readonly repaidAt: string | null;
}

export function LoanList({ loans }: { readonly loans: readonly LoanView[] }) {
  const [state, action] = useActionState(repay, IDLE);

  return (
    <div className="grid gap-3">
      {loans.map((loan) => (
        <div key={loan.loanId} className="grid gap-2 border-b pb-3 last:border-b-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="grid gap-0.5">
              <p className="text-sm">
                <T korean="남은 상환액" english="Outstanding Balance" /> <Amount value={loan.outstandingAmount} className="font-medium" currency />
              </p>
              <p className="text-xs text-muted-foreground">
                <T korean="원금" english="Principal" /> <Amount value={loan.principalAmount} /> · <T korean="이자" english="Interest" />{' '}
                <Amount value={loan.interestAmount} /> · {formatDay(loan.issuedAt)}
              </p>
            </div>
            <Badge variant={loan.status === 'overdue' ? 'destructive' : loan.status === 'repaid' ? 'outline' : 'secondary'}>
              {loan.status === 'active' && <T korean="상환 중" english="Active" />}
              {loan.status === 'overdue' && <T korean="연체" english="Overdue" />}
              {loan.status === 'repaid' && <T korean="상환 완료" english="Repaid" />}
            </Badge>
          </div>

          {loan.status !== 'repaid' && (
            <form action={action} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="loanId" value={loan.loanId} />
              <AmountInput
                name="amount"
                className="w-40"
                placeholder="0"
                ariaLabel="상환할 WLD"
                required
              />
              <SubmitButton variant="outline">
                <T korean="상환" english="Repay" />
              </SubmitButton>
            </form>
          )}
        </div>
      ))}
      <ActionAlert state={state} />
    </div>
  );
}

export function MoneyverseId({ userId }: { readonly userId: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-2">
      <code className="overflow-x-auto rounded-md border bg-muted px-3 py-2 font-mono text-xs">
        {userId}
      </code>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-fit"
        onClick={() => {
          void navigator.clipboard
            ?.writeText(userId)
            .then(() => setCopied(true))
            .catch(() => setCopied(false));
        }}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? <T korean="복사했어요" english="Copied!" /> : <T korean="ID 복사" english="Copy ID" />}
      </Button>
      <p aria-live="polite" className="sr-only">
        {copied ? '머니버스 ID를 복사했습니다.' : ''}
      </p>
    </div>
  );
}