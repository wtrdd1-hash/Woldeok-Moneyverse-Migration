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
import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';
import { IDLE } from '@/lib/action-state';
import type { ActionState } from '@/lib/action-state';
import { formatDay } from '@/lib/money';
import { borrow, claimDaily, moveBank, repay, transfer } from './actions';
import { COPY, INTL_LOCALE, fill } from './copy';

/** The picker every component here uses: one locale, read once per render. */
function useCopy() {
  const { locale } = useLocale();
  return { locale, t: (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy) };
}

export interface RewardAvailability {
  readonly dailyAvailable: boolean;
  readonly dailyNextEligibleAt: string | null;
  readonly workAvailable: boolean;
  readonly workNextEligibleAt: string | null;
}

function unavailableHint(nextEligibleAt: string | null, locale: Locale): string {
  if (!nextEligibleAt) return pick(locale, COPY.rewardUnavailable);
  const value = new Date(nextEligibleAt);
  if (Number.isNaN(value.valueOf())) return pick(locale, COPY.rewardUnavailable);
  return fill(pick(locale, COPY.nextEligible), {
    at: new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(value),
  });
}

export function RewardButtons({ availability }: { readonly availability: RewardAvailability | null }) {
  const [dailyState, daily] = useActionState(claimDaily, IDLE);
  const { locale, t } = useCopy();
  const dailyClaimed = dailyState.status === 'ok' || availability?.dailyAvailable === false;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <form action={daily}>
          <SubmitButton disabled={dailyClaimed}>
            <Sparkles className="size-4 text-amber-500 mr-1.5" /> {t(COPY.claimDaily)}
          </SubmitButton>
        </form>
        <Button asChild variant="outline">
          <Link href="/work">
            ◈ {t(COPY.doWork)}
          </Link>
        </Button>
      </div>
      {availability?.dailyAvailable === false && (
        <p className="text-xs text-muted-foreground">
          {t(COPY.dailyReward)} · {unavailableHint(availability.dailyNextEligibleAt, locale)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t(COPY.workRewardNote)}
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
  const { t } = useCopy();
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
          {t(COPY.transferTitle)}
        </CardTitle>
        <CardDescription>
          {t(COPY.transferDescription)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} onSubmit={submitTransfer} className="grid gap-4">
          <input type="hidden" name="idempotencyKey" value={requestKey} />
          <FieldGroup className="gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="recipientUserId">
                {t(COPY.recipientLabel)}
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
                {t(COPY.recipientHint)}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="transfer-amount">
                {fill(t(COPY.amountLabel), { currency })}
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
                {t(COPY.amountHint)}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {pendingAttempt && (
            <div role="status" aria-live="polite" className="rounded-md border border-amber-500/60 bg-amber-500/10 p-3 text-sm">
              <p className="font-semibold">{t(COPY.pendingTitle)}</p>
              <p className="mt-1">{t(COPY.pendingBodyBefore)}<Link className="underline" href="/wallet/activity">{t(COPY.pendingBodyLink)}</Link>{t(COPY.pendingBodyAfter)}</p>
            </div>
          )}
          {storageError && (
            <p role="alert" className="text-sm text-destructive">{t(COPY.storageError)}</p>
          )}
          {validationError && (
            <p role="alert" className="text-sm text-destructive">{t(COPY.validationError)}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {fill(t(COPY.wholeOnly), { currency })}
            </p>
            <SubmitButton disabled={storageError || !requestKey} className="min-h-11 font-bold">
              {pendingAttempt ? t(COPY.resendSame) : t(COPY.sendWld)}
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
  const { t } = useCopy();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t(COPY.bankTitle)}
        </CardTitle>
        <CardDescription>
          {t(COPY.bankDescription)}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <form action={moveAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="bank-move-amount">
              {t(COPY.bankMoveLabel)}
            </FieldLabel>
            <AmountInput id="bank-move-amount" name="amount" placeholder="0" required />
          </Field>
          <div className="flex flex-wrap gap-2">
            <SubmitButton name="direction" value="deposit">
              {t(COPY.deposit)}
            </SubmitButton>
            <SubmitButton name="direction" value="withdraw" variant="outline">
              {t(COPY.withdraw)}
            </SubmitButton>
          </div>
          <ActionAlert state={moveState} />
        </form>

        <form action={borrowAction} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="loan-principal">
              {t(COPY.loanLabel)}
            </FieldLabel>
            <AmountInput id="loan-principal" name="principalAmount" placeholder="0" required />
            <FieldDescription>
              {t(COPY.loanHint)}
            </FieldDescription>
          </Field>
          <SubmitButton className="w-fit">
            {t(COPY.applyLoan)}
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
  const { t } = useCopy();

  return (
    <div className="grid gap-3">
      {loans.map((loan) => (
        <div key={loan.loanId} className="grid gap-2 border-b pb-3 last:border-b-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="grid gap-0.5">
              <p className="text-sm">
                {t(COPY.outstanding)} <Amount value={loan.outstandingAmount} className="font-medium" currency />
              </p>
              <p className="text-xs text-muted-foreground">
                {t(COPY.principal)} <Amount value={loan.principalAmount} /> · {t(COPY.interest)}{' '}
                <Amount value={loan.interestAmount} /> · {formatDay(loan.issuedAt)}
              </p>
            </div>
            <Badge variant={loan.status === 'overdue' ? 'destructive' : loan.status === 'repaid' ? 'outline' : 'secondary'}>
              {loan.status === 'active' && t(COPY.statusActive)}
              {loan.status === 'overdue' && t(COPY.statusOverdue)}
              {loan.status === 'repaid' && t(COPY.statusRepaid)}
            </Badge>
          </div>

          {loan.status !== 'repaid' && (
            <form action={action} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="loanId" value={loan.loanId} />
              <AmountInput
                name="amount"
                className="w-40"
                placeholder="0"
                ariaLabel={t(COPY.repayAria)}
                required
              />
              <SubmitButton variant="outline">
                {t(COPY.repay)}
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
  const { t } = useCopy();

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
        {copied ? t(COPY.copied) : t(COPY.copyId)}
      </Button>
      <p aria-live="polite" className="sr-only">
        {copied ? t(COPY.copiedAnnouncement) : ''}
      </p>
    </div>
  );
}