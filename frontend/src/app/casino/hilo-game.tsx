'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { playDiceParity } from './actions';
import type { ActionState } from '@/lib/action-state';

export function HiLoCardGame({
  minStake,
  maxStake,
  exhausted,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly exhausted: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(playDiceParity, {
    status: 'idle',
  });
  const [choice, setChoice] = useState<'odd' | 'even'>('odd');

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-b from-card to-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-indigo-400">
          <span>🃏</span> 하이 앤 로우 카드 게임
        </CardTitle>
        <CardDescription>
          주사위 홀짝 서버 규칙을 카드 화면으로 표현합니다. High는 홀수, Low는 짝수이며 적중 시 1.9배로 정산됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex justify-center items-center gap-6 py-6 px-4 rounded-xl bg-black/30 border border-indigo-500/20">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">테마 기준 카드</span>
            <div className="grid size-20 sm:size-24 place-items-center rounded-xl bg-card border-2 border-indigo-400/50 shadow-lg text-3xl sm:text-4xl font-bold text-foreground">
              ♠️ 7
            </div>
          </div>

          <div className="text-2xl font-bold text-muted-foreground">VS</div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">서버 판정</span>
            <div className={`grid size-20 sm:size-24 place-items-center rounded-xl bg-indigo-950/40 border-2 border-dashed border-indigo-400/50 shadow-inner text-3xl sm:text-4xl font-bold text-indigo-300 ${pending ? 'animate-pulse' : ''}`}>
              {pending ? '❓' : state.status === 'ok' ? '🎯' : '🂠'}
            </div>
          </div>
        </div>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="parity" value={choice} />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={choice === 'odd' ? 'default' : 'outline'}
              onClick={() => setChoice('odd')}
              disabled={pending || exhausted}
              className={`h-14 text-base font-bold transition-all ${
                choice === 'odd' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md ring-2 ring-indigo-400' : ''
              }`}
            >
              🔺 High (더 높음)
            </Button>
            <Button
              type="button"
              variant={choice === 'even' ? 'default' : 'outline'}
              onClick={() => setChoice('even')}
              disabled={pending || exhausted}
              className={`h-14 text-base font-bold transition-all ${
                choice === 'even' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md ring-2 ring-indigo-400' : ''
              }`}
            >
              🔻 Low (더 낮음)
            </Button>
          </div>

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
            className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
          >
            {pending ? '카드 확인 중...' : exhausted ? '오늘 한도 소진' : choice === 'odd' ? '🔺 High에 베팅하기' : '🔻 Low에 베팅하기'}
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
