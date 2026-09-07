'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { absAmount } from './coin';
import { CASINO_IDLE, playDiceNumber } from './actions';
import { groupDigits } from '@/lib/money';

const SPIN_SYMBOLS = ['🍒', '🍋', '🔔', '💎', '⭐', '7️⃣'] as const;
const randomSymbol = (): string =>
  SPIN_SYMBOLS[Math.floor(Math.random() * SPIN_SYMBOLS.length)] ?? '❔';

const RESULT_REELS: Record<number, readonly [string, string, string]> = {
  1: ['🍒', '🍋', '🔔'],
  2: ['🍋', '🔔', '💎'],
  3: ['🔔', '💎', '⭐'],
  4: ['💎', '⭐', '🍒'],
  5: ['⭐', '🍒', '🍋'],
  6: ['7️⃣', '7️⃣', '7️⃣'],
};

export function slotReelsForFace(face: number): readonly [string, string, string] | null {
  return RESULT_REELS[face] ?? null;
}

function minAmount(...values: readonly string[]): string {
  return values.reduce((lowest, value) => (BigInt(value) < BigInt(lowest) ? value : lowest));
}

export function LuckySlotsGame({
  minStake,
  maxStake,
  remainingStake,
  exhausted,
  winProbability,
  payoutMultiplier,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  readonly exhausted: boolean;
  readonly winProbability: string;
  readonly payoutMultiplier: string;
}) {
  const [state, formAction, pending] = useActionState(playDiceNumber, CASINO_IDLE);
  const [reels, setReels] = useState<[string, string, string]>(['❔', '❔', '❔']);
  const maxPlayable = minAmount(maxStake, remainingStake);

  useEffect(() => {
    if (pending) {
      const interval = setInterval(() => {
        setReels([randomSymbol(), randomSymbol(), randomSymbol()]);
      }, 90);
      return () => clearInterval(interval);
    }

    if (state.status === 'ok' && state.outcomeFace !== undefined) {
      const result = slotReelsForFace(state.outcomeFace);
      if (result) setReels([...result]);
    }
  }, [pending, state]);

  const resultText =
    state.status === 'ok' && state.outcomeFace !== undefined && state.netAmount
      ? `${state.replayed ? '이미 처리된 판 · ' : ''}서버 결과 ${state.outcomeFace}. ${
          state.result === 'win'
            ? `777 적중, ${groupDigits(absAmount(state.netAmount))} WLD 획득`
            : state.result === 'loss'
              ? `${groupDigits(absAmount(state.netAmount))} WLD 손실`
              : '정산 0 WLD'
        }`
      : null;

  return (
    <Card className="border-amber-500/20 bg-gradient-to-b from-card to-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-amber-500">
          <span>🎰</span> 럭키 777 슬롯
        </CardTitle>
        <CardDescription>
          서버의 주사위 숫자 규칙을 슬롯 테마로 보여줍니다. 서버 결과 6만 777이며 적중 확률{' '}
          {winProbability}%, 적중 시 {payoutMultiplier}배로 정산됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex justify-center gap-3 rounded-xl border border-amber-500/30 bg-black/40 px-4 py-6 shadow-inner">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={
                'grid size-20 select-none place-items-center rounded-lg border border-amber-500/40 bg-surface/90 text-4xl shadow-md transition-transform sm:size-24 sm:text-5xl ' +
                (pending ? 'animate-bounce scale-105' : '')
              }
            >
              {symbol}
            </div>
          ))}
        </div>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="number" value="6" />
          <div className="grid gap-2">
            <Label htmlFor="slot-stake" className="text-sm font-medium">
              베팅할 WLD 금액
            </Label>
            <div className="relative">
              <Input
                id="slot-stake"
                name="stake"
                type="number"
                min={minStake}
                max={maxPlayable}
                defaultValue={minStake}
                required
                disabled={pending || exhausted}
                className="pr-12 text-lg font-mono font-bold"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-muted-foreground">
                WLD
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              한 판 최소 {groupDigits(minStake)} WLD · 현재 한도 기준 최대 {groupDigits(maxPlayable)} WLD
            </p>
          </div>

          <Button type="submit" disabled={pending || exhausted} className="h-12 w-full text-base font-bold">
            {pending ? '서버에서 결과 확인 중…' : exhausted ? '현재 한도로 플레이 불가' : '🎰 777에 베팅하기'}
          </Button>

          {resultText && (
            <div
              role="status"
              className={
                state.result === 'win'
                  ? 'rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300'
                  : 'rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-center text-sm font-semibold text-rose-700 dark:text-rose-300'
              }
            >
              {resultText}
            </div>
          )}
          {state.status === 'error' && state.message && (
            <div role="status" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {state.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
