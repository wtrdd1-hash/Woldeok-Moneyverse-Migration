'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { playDiceNumber } from './actions';
import type { ActionState } from '@/lib/action-state';

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣', '⭐'];
const randomSymbol = (): string => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? '7️⃣';

export function LuckySlotsGame({
  minStake,
  maxStake,
  exhausted,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly exhausted: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(playDiceNumber, {
    status: 'idle',
  });
  const [reels, setReels] = useState<[string, string, string]>(['7️⃣', '7️⃣', '7️⃣']);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (pending) {
      setSpinning(true);
      const interval = setInterval(() => {
        setReels([randomSymbol(), randomSymbol(), randomSymbol()]);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setSpinning(false);
      if (state.status === 'ok') {
        setReels(['7️⃣', '7️⃣', '7️⃣']);
      }
    }
  }, [pending, state.status]);

  return (
    <Card className="border-amber-500/20 bg-gradient-to-b from-card to-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-amber-500">
          <span>🎰</span> 럭키 777 슬롯머신
        </CardTitle>
        <CardDescription>
          주사위 숫자 맞추기 서버 규칙을 슬롯 화면으로 표현합니다. 6번 적중 시 5.7배로 정산됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex justify-center gap-3 py-6 px-4 rounded-xl bg-black/40 border border-amber-500/30 shadow-inner">
          {reels.map((symbol, i) => (
            <div
              key={i}
              className={
                'grid size-20 sm:size-24 place-items-center rounded-lg bg-surface/90 border border-amber-500/40 text-4xl sm:text-5xl shadow-md select-none transition-transform ' +
                (spinning ? 'animate-bounce scale-105' : '')
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
                max={maxStake}
                defaultValue={minStake}
                disabled={pending || exhausted}
                className="pr-12 text-lg font-mono font-bold"
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">
                WLD
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              최소 {groupDigits(minStake)} ~ 최대 {groupDigits(maxStake)} WLD까지 베팅할 수 있습니다.
            </p>
          </div>

          <Button
            type="submit"
            disabled={pending || exhausted}
            className="w-full h-12 text-base font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all"
          >
            {pending ? '릴 회전 중...' : exhausted ? '오늘 한도 소진' : '🎰 슬롯 레버 당기기'}
          </Button>

          {state.status === 'ok' && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center font-medium text-sm">
              🎉 {state.message}
            </div>
          )}
          {state.status === 'error' && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center font-medium text-sm">
              {state.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
