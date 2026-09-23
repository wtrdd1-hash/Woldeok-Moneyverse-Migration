'use client';

import { useActionState, useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Lock,
  Sliders,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function QuickStakeButtons({
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
  const [betLimit, setBetLimit] = useState<string>('0');
  const [lossLimit, setLossLimit] = useState<string>('0');
  const [lock, setLock] = useState<string>('none');
  const [showTimeLockAlert, setShowTimeLockAlert] = useState<boolean>(false);

  const betLimitNum = Number.parseInt(betLimit.replaceAll(',', '') || '0', 10);
  const lossLimitNum = Number.parseInt(lossLimit.replaceAll(',', '') || '0', 10);

  const handleQuickTimeLock = () => {
    setLock('1');
    setShowTimeLockAlert(true);
  };

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="lock" value={lock} />

      {/* 건전 게임 보호(RG) 배너 */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <span>책임감 있는 게임(RG) 자가 보호 가이드</span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                자율 규제 준수
              </span>
            </p>
            <p className="[word-break:keep-all]">
              하루 동안 사용할 수 있는 최대 베팅액과 손실 한도를 미리 정해두세요. 설정한 한도에 도달하면
              자정이 지날 때까지 추가 베팅이 시스템에 의해 안전하게 차단됩니다.
            </p>
          </div>
        </div>
      </div>

      <FieldGroup className="gap-6 sm:grid-cols-2">
        {/* 1. 하루 베팅 한도 (토스형 슬라이더 + 직접 입력) */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="casino-bet-limit" className="text-sm font-bold flex items-center gap-1.5">
              <Sliders className="size-3.5 text-primary" />
              <span>하루 베팅 한도</span>
            </FieldLabel>
            <span className="font-mono text-xs font-bold text-primary">
              {betLimitNum === 0 ? '무제한 (0 WLD)' : `${groupDigits(betLimitNum.toString())} WLD`}
            </span>
          </div>

          <AmountInput
            id="casino-bet-limit"
            name="dailyBetLimit"
            value={betLimit}
            onChange={setBetLimit}
            placeholder="0 (무제한)"
            className="min-h-11 rounded-xl font-mono text-base font-bold"
            required
          />

          {/* 슬라이더 컨트롤 (0 ~ 2,000 WLD) */}
          <div className="space-y-1.5 pt-1">
            <input
              type="range"
              min={0}
              max={2000}
              step={50}
              value={Math.min(2000, isNaN(betLimitNum) ? 0 : betLimitNum)}
              onChange={(e) => setBetLimit(e.target.value)}
              className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
              aria-label="하루 베팅 한도 슬라이더"
            />
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>0 (무제한)</span>
              <span>1,000 WLD</span>
              <span>2,000 WLD</span>
            </div>
          </div>

          {/* 퀵 프리셋 버튼 */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setBetLimit('0')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              무제한
            </button>
            <button
              type="button"
              onClick={() => setBetLimit('500')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              500 WLD
            </button>
            <button
              type="button"
              onClick={() => setBetLimit('1000')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              1,000 WLD
            </button>
            <button
              type="button"
              onClick={() => setBetLimit('2000')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              2,000 WLD
            </button>
          </div>
        </div>

        {/* 2. 하루 손실 한도 (토스형 슬라이더 + 직접 입력) */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="casino-loss-limit" className="text-sm font-bold flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-rose-500" />
              <span>하루 손실 한도</span>
            </FieldLabel>
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              {lossLimitNum === 0 ? '무제한 (0 WLD)' : `${groupDigits(lossLimitNum.toString())} WLD`}
            </span>
          </div>

          <AmountInput
            id="casino-loss-limit"
            name="dailyLossLimit"
            value={lossLimit}
            onChange={setLossLimit}
            placeholder="0 (무제한)"
            className="min-h-11 rounded-xl font-mono text-base font-bold"
            required
          />

          {/* 슬라이더 컨트롤 (0 ~ 1,000 WLD) */}
          <div className="space-y-1.5 pt-1">
            <input
              type="range"
              min={0}
              max={1000}
              step={50}
              value={Math.min(1000, isNaN(lossLimitNum) ? 0 : lossLimitNum)}
              onChange={(e) => setLossLimit(e.target.value)}
              className="w-full h-2 rounded-lg bg-muted accent-rose-500 cursor-pointer"
              aria-label="하루 손실 한도 슬라이더"
            />
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>0 (무제한)</span>
              <span>500 WLD</span>
              <span>1,000 WLD</span>
            </div>
          </div>

          {/* 퀵 프리셋 버튼 */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setLossLimit('0')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              무제한
            </button>
            <button
              type="button"
              onClick={() => setLossLimit('200')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              200 WLD
            </button>
            <button
              type="button"
              onClick={() => setLossLimit('500')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              500 WLD
            </button>
            <button
              type="button"
              onClick={() => setLossLimit('1000')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
            >
              1,000 WLD
            </button>
          </div>
        </div>
      </FieldGroup>

      {/* 3. 플레이 잠금 (자가 제외) 및 원터치 24시간 쿨다운 */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <FieldLabel htmlFor="casino-lock" className="text-sm font-bold flex items-center gap-1.5">
              <Lock className="size-3.5 text-amber-500" />
              <span>플레이 잠금 (자가 제외 장치)</span>
            </FieldLabel>
            <FieldDescription className="text-xs text-muted-foreground mt-0.5">
              잠금을 설정하면 지정 기간 동안 카지노 플레이가 차단되며 한도도 다시 완화할 수 없습니다.
            </FieldDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickTimeLock}
            className="h-9 gap-1.5 text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shrink-0"
          >
            <Clock className="size-3.5" />
            <span>24시간 원터치 휴식 (Time Lock)</span>
          </Button>
        </div>

        <Select value={lock} onValueChange={setLock}>
          <SelectTrigger id="casino-lock" className="min-h-11 w-full sm:w-72 rounded-xl">
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

        {showTimeLockAlert && lock === '1' && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 animate-in fade-in duration-300">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">24시간 플레이 잠금이 선택되었습니다.</p>
              <p className="mt-0.5 leading-relaxed [word-break:keep-all]">
                아래 [한도 저장] 버튼을 누르면 즉시 24시간 동안 카지노 입장이 차단되며, 
                관리자도 이를 조기 해제할 수 없습니다. 계속 진행하시려면 저장하세요.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted-foreground">
          0으로 저장하면 해당 자가 한도를 사용하지 않습니다. 한도는 한국 표준시(KST) 자정마다 초기화됩니다.
        </p>
        <SubmitButton className="min-h-11 rounded-xl px-8 font-bold shadow-md">
          자가 보호 한도 저장
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
