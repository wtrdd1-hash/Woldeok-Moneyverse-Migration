'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { absAmount } from './coin';
import { playHiLo20 } from './actions';
import { CASINO_IDLE } from './casino-state';

function minAmount(...values: readonly string[]): string {
  return values.reduce((lowest, value) => (BigInt(value) < BigInt(lowest) ? value : lowest));
}

export function HiLoCardGame({
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
  const [state, formAction, pending] = useActionState(playHiLo20, CASINO_IDLE);
  const [choice, setChoice] = useState<'high' | 'low'>('high');
  const maxPlayable = minAmount(maxStake, remainingStake);

  const outcomeFace = state.themeOutcome ? Number(state.themeOutcome) : null;
  const serverSide =
    outcomeFace === null ? null : outcomeFace >= 11 ? 'High (11~20)' : 'Low (1~10)';
  const resultText =
    state.status === 'ok' && outcomeFace !== null && state.netAmount
      ? `${state.replayed ? '이미 처리된 판 · ' : ''}서버 숫자 ${outcomeFace} → ${serverSide}. ${
          state.result === 'win'
            ? `${groupDigits(absAmount(state.netAmount))} WLD 획득`
            : state.result === 'loss'
              ? `${groupDigits(absAmount(state.netAmount))} WLD 손실`
              : '정산 0 WLD'
        }`
      : null;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-b from-card to-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-indigo-500 font-bold">
          <span>🃏</span> 하이 / 로우 20 (High / Low 20)
        </CardTitle>
        <CardDescription>
          서버가 1부터 20까지의 균등 난수를 추첨합니다. High는 11~20, Low는 1~10이며 적중 확률{' '}
          {winProbability}%, 적중 시 {payoutMultiplier}배 배당으로 정산됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={choice === 'high' ? 'default' : 'outline'}
            onClick={() => setChoice('high')}
            disabled={pending || exhausted}
            className="h-16 text-base font-bold"
          >
            🔺 High (11~20)
          </Button>
          <Button
            type="button"
            variant={choice === 'low' ? 'default' : 'outline'}
            onClick={() => setChoice('low')}
            disabled={pending || exhausted}
            className="h-16 text-base font-bold"
          >
            🔻 Low (1~10)
          </Button>
        </div>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="choice" value={choice} />
          <div className="grid gap-2">
            <Label htmlFor="hilo-stake" className="text-sm font-medium">
              베팅할 WLD 금액
            </Label>
            <div className="relative">
              <Input
                id="hilo-stake"
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
            {pending
              ? '서버에서 결과 확인 중…'
              : exhausted
                ? '현재 한도로 플레이 불가'
                : choice === 'high'
                  ? '🔺 High (11~20)에 베팅하기'
                  : '🔻 Low (1~10)에 베팅하기'}
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
