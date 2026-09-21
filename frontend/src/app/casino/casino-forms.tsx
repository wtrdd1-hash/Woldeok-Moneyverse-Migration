'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { LOCK_CHOICES } from './coin';
import { DIE_FACES, PARITY_CHOICES } from './dice';
import { playCoin, playDiceNumber, playDiceParity, setSelfLimit } from './actions';
import { CASINO_IDLE } from './casino-state';

export function QuickStakeButtons({
  onAdd,
  onMax,
}: {
  readonly onAdd: (amount: number) => void;
  readonly onMax: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <button
        type="button"
        onClick={() => onAdd(1000)}
        className="min-h-9 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
      >
        +1,000
      </button>
      <button
        type="button"
        onClick={() => onAdd(5000)}
        className="min-h-9 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
      >
        +5,000
      </button>
      <button
        type="button"
        onClick={() => onAdd(10000)}
        className="min-h-9 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
      >
        +10,000
      </button>
      <button
        type="button"
        onClick={() => onAdd(50000)}
        className="min-h-9 px-3 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
      >
        +50,000
      </button>
      <button
        type="button"
        onClick={onMax}
        className="min-h-9 px-3 py-1 text-xs font-bold rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
      >
        MAX
      </button>
    </div>
  );
}

export function CoinPlayForm({
  minStake,
  maxStake,
  remainingStake,
  exhausted,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  readonly exhausted: boolean;
}) {
  const [state, action, pending] = useActionState(playCoin, CASINO_IDLE);
  const [stake, setStake] = useState(minStake);

  const handleQuickAdd = (add: number) => {
    const cur = BigInt((stake || '0').replace(/,/g, ''));
    const nxt = cur + BigInt(add);
    const max = BigInt((remainingStake || '0').replace(/,/g, ''));
    if (max > BigInt(0) && nxt > max) {
      setStake(max.toString());
    } else {
      setStake(nxt.toString());
    }
  };

  const handleMax = () => {
    setStake(remainingStake);
  };

  return (
    <form action={action} className="grid gap-4">
      <div className="casino-coin-stage" aria-live="polite">
        <div
          className={`casino-coin ${pending ? 'casino-coin--spinning' : ''} ${
            state.coinOutcome === 'tails' ? 'casino-coin--tails' : 'casino-coin--heads'
          }`}
          aria-hidden="true"
        >
          <span className="casino-coin__face casino-coin__face--front">W</span>
          <span className="casino-coin__face casino-coin__face--back">D</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-extrabold">
            {pending
              ? '동전이 서버 결과를 기다리며 회전 중…'
              : state.coinOutcome === 'heads'
                ? '앞면 결과'
                : state.coinOutcome === 'tails'
                  ? '뒷면 결과'
                  : '앞면 또는 뒷면을 선택해 동전을 던져보세요'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            결과는 애니메이션이 아니라 서버 영수증으로 결정됩니다.
          </p>
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="casino-stake">걸 WLD</FieldLabel>
        <AmountInput
          id="casino-stake"
          name="stake"
          value={stake}
          onChange={setStake}
          placeholder="0"
          className="min-h-11 rounded-xl text-base"
          required
        />
        <QuickStakeButtons onAdd={handleQuickAdd} onMax={handleMax} />
        <FieldDescription>
          한 판에 {groupDigits(minStake)} ~ {groupDigits(maxStake)} WLD를 걸 수 있어요. 오늘 남은
          베팅 한도는 {groupDigits(remainingStake)} WLD예요.
        </FieldDescription>
      </Field>

      <div className="flex flex-wrap gap-2">
        <SubmitButton name="choice" value="heads" disabled={exhausted} className="min-h-11 rounded-xl font-bold px-6">
          🪙 앞면에 걸기
        </SubmitButton>
        <SubmitButton name="choice" value="tails" variant="outline" disabled={exhausted} className="min-h-11 rounded-xl font-bold px-6">
          🪙 뒷면에 걸기
        </SubmitButton>
      </div>

      {exhausted && (
        <p className="text-sm text-muted-foreground">
          오늘 걸 수 있는 보호 한도를 모두 사용했어요. 다음 현실 날짜에 다시 열려요.
        </p>
      )}

      <ActionAlert state={state} />
    </form>
  );
}

export function SelfLimitForm() {
  const [state, action] = useActionState(setSelfLimit, IDLE);
  const [lock, setLock] = useState<string>('none');

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="lock" value={lock} />

      <FieldGroup className="gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="casino-bet-limit">하루 베팅 한도</FieldLabel>
          <AmountInput
            id="casino-bet-limit"
            name="dailyBetLimit"
            placeholder="0 (무제한)"
            className="min-h-11 rounded-xl"
            required
          />
          <FieldDescription>원할 때만 설정하세요. 0은 무제한입니다.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="casino-loss-limit">하루 손실 한도</FieldLabel>
          <AmountInput
            id="casino-loss-limit"
            name="dailyLossLimit"
            placeholder="0 (무제한)"
            className="min-h-11 rounded-xl"
            required
          />
          <FieldDescription>원할 때만 설정하세요. 0은 무제한입니다.</FieldDescription>
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="casino-lock">플레이 잠금 (자가 제외)</FieldLabel>
        <Select value={lock} onValueChange={setLock}>
          <SelectTrigger id="casino-lock" className="min-h-11 w-full sm:w-64 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCK_CHOICES.map((choice) => (
              <SelectItem key={choice.value} value={choice.value}>
                {choice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          잠가 두면 그 기간이 끝날 때까지 카지노 플레이가 차단되고 한도도 다시 바꿀 수 없어요.
          스스로 쉬어 가기 위한 자가 제외 장치입니다.
        </FieldDescription>
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted-foreground">
          시스템 제한은 없으며 0으로 저장하면 해당 자가 한도를 사용하지 않습니다.
        </p>
        <SubmitButton className="min-h-11 rounded-xl px-6 font-bold">
          한도 저장
        </SubmitButton>
      </div>

      <ActionAlert state={state} />
    </form>
  );
}

function DiceStage({
  state,
  pending,
  mode,
}: {
  readonly state: typeof CASINO_IDLE;
  readonly pending: boolean;
  readonly mode: 'parity' | 'number';
}) {
  const face = state.outcomeFace ?? 1;
  const glyph = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][face - 1] ?? '⚀';
  const idleTitle =
    mode === 'parity'
      ? '홀 또는 짝을 선택해 주사위를 굴려보세요'
      : '1부터 6까지 숫자를 골라 주사위를 굴려보세요';

  return (
    <div className="casino-dice-stage" aria-live="polite">
      <div className={`casino-die ${pending ? 'casino-die--rolling' : ''}`} aria-hidden="true">
        {glyph}
      </div>
      <div className="text-center">
        <p className="text-sm font-extrabold">
          {pending
            ? '서버가 주사위 결과를 확정하는 중…'
            : state.outcomeFace
              ? `서버 결과: ${state.outcomeFace}`
              : idleTitle}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          결과와 당첨 여부는 화면 효과가 아니라 서버 영수증으로 결정됩니다.
        </p>
      </div>
    </div>
  );
}

export function DiceParityForm({
  minStake,
  maxStake,
  remainingStake,
  exhausted,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  readonly exhausted: boolean;
}) {
  const [state, action, pending] = useActionState(playDiceParity, CASINO_IDLE);
  const [stake, setStake] = useState(minStake);

  const handleQuickAdd = (add: number) => {
    const cur = BigInt((stake || '0').replace(/,/g, ''));
    const nxt = cur + BigInt(add);
    const max = BigInt((remainingStake || '0').replace(/,/g, ''));
    if (max > BigInt(0) && nxt > max) {
      setStake(max.toString());
    } else {
      setStake(nxt.toString());
    }
  };

  const handleMax = () => {
    setStake(remainingStake);
  };

  return (
    <form action={action} className="grid gap-4">
      <DiceStage state={state} pending={pending} mode="parity" />

      <Field>
        <FieldLabel htmlFor="dice-parity-stake">걸 WLD</FieldLabel>
        <AmountInput
          id="dice-parity-stake"
          name="stake"
          value={stake}
          onChange={setStake}
          placeholder="0"
          className="min-h-11 rounded-xl text-base"
          required
        />
        <QuickStakeButtons onAdd={handleQuickAdd} onMax={handleMax} />
        <FieldDescription>
          한 판에 {groupDigits(minStake)} ~ {groupDigits(maxStake)} WLD를 걸 수 있어요. 오늘 남은
          베팅 한도는 {groupDigits(remainingStake)} WLD예요. 세 게임이 현실 하루 보호 한도를 함께
          씁니다.
        </FieldDescription>
      </Field>

      <div className="flex flex-wrap gap-2">
        {PARITY_CHOICES.map((choice, index) => (
          <SubmitButton
            key={choice.value}
            name="choice"
            value={choice.value}
            disabled={exhausted}
            className="min-h-11 rounded-xl font-bold px-6"
            {...(index === 0 ? {} : { variant: 'outline' as const })}
          >
            {choice.label}에 걸기
          </SubmitButton>
        ))}
      </div>

      {exhausted && (
        <p className="text-sm text-muted-foreground">
          오늘 걸 수 있는 보호 한도를 모두 사용했어요. 다음 현실 날짜에 다시 열려요.
        </p>
      )}

      <ActionAlert state={state} />
    </form>
  );
}

export function DiceNumberForm({
  minStake,
  maxStake,
  remainingStake,
  exhausted,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  readonly exhausted: boolean;
}) {
  const [state, action, pending] = useActionState(playDiceNumber, CASINO_IDLE);
  const [stake, setStake] = useState(minStake);

  const handleQuickAdd = (add: number) => {
    const cur = BigInt((stake || '0').replace(/,/g, ''));
    const nxt = cur + BigInt(add);
    const max = BigInt((remainingStake || '0').replace(/,/g, ''));
    if (max > BigInt(0) && nxt > max) {
      setStake(max.toString());
    } else {
      setStake(nxt.toString());
    }
  };

  const handleMax = () => {
    setStake(remainingStake);
  };

  return (
    <form action={action} className="grid gap-4">
      <DiceStage state={state} pending={pending} mode="number" />

      <Field>
        <FieldLabel htmlFor="dice-number-stake">걸 WLD</FieldLabel>
        <AmountInput
          id="dice-number-stake"
          name="stake"
          value={stake}
          onChange={setStake}
          placeholder="0"
          className="min-h-11 rounded-xl text-base"
          required
        />
        <QuickStakeButtons onAdd={handleQuickAdd} onMax={handleMax} />
        <FieldDescription>
          한 판에 {groupDigits(minStake)} ~ {groupDigits(maxStake)} WLD를 걸 수 있어요. 오늘 남은
          베팅 한도는 {groupDigits(remainingStake)} WLD예요. 세 게임이 현실 하루 보호 한도를 함께
          씁니다.
        </FieldDescription>
      </Field>

      <div className="flex flex-wrap gap-2">
        {DIE_FACES.map((face) => (
          <SubmitButton
            key={face}
            name="choice"
            value={face}
            variant="outline"
            disabled={exhausted}
            className="min-h-11 rounded-xl font-bold px-5"
          >
            {face}에 걸기
          </SubmitButton>
        ))}
      </div>

      {exhausted && (
        <p className="text-sm text-muted-foreground">
          오늘 걸 수 있는 보호 한도를 모두 사용했어요. 다음 현실 날짜에 다시 열려요.
        </p>
      )}

      <ActionAlert state={state} />
    </form>
  );
}
