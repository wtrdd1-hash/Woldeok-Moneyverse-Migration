'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionState } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { playDiceNumber, playDiceParity } from './actions';

type ThemeGame = 'wheel' | 'treasure' | 'gems';

const THEMES = {
  wheel: {
    icon: '🎡',
    title: '컬러 휠',
    description: '황금색(홀수) 또는 푸른색(짝수)을 고르는 50:50 서버 게임입니다.',
    mode: 'parity',
  },
  treasure: {
    icon: '🗝️',
    title: '보물 상자',
    description: '여섯 상자 중 보물이 든 하나를 고르는 서버 게임입니다.',
    mode: 'number',
  },
  gems: {
    icon: '💎',
    title: '럭키 젬',
    description: '여섯 보석 중 오늘의 행운 보석 하나를 고르는 서버 게임입니다.',
    mode: 'number',
  },
} as const;

export function ThemeGameCard({
  game,
  minStake,
  maxStake,
  exhausted,
}: {
  readonly game: ThemeGame;
  readonly minStake: string;
  readonly maxStake: string;
  readonly exhausted: boolean;
}) {
  const theme = THEMES[game];
  const action = theme.mode === 'parity' ? playDiceParity : playDiceNumber;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {
    status: 'idle',
  });
  const [choice, setChoice] = useState('1');
  const choices =
    theme.mode === 'parity'
      ? [
          { value: 'odd', label: '🟡 황금색' },
          { value: 'even', label: '🔵 푸른색' },
        ]
      : Array.from({ length: 6 }, (_, index) => ({
          value: String(index + 1),
          label: `${theme.icon} ${index + 1}`,
        }));

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span>{theme.icon}</span>
          {theme.title}
        </CardTitle>
        <CardDescription>
          {theme.description} 모든 결과와 WLD 정산은 서버에서 처리됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          <input
            type="hidden"
            name={theme.mode === 'parity' ? 'parity' : 'number'}
            value={choice}
          />
          <div
            className={
              theme.mode === 'parity'
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-3 gap-2 sm:grid-cols-6'
            }
          >
            {choices.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={choice === item.value ? 'default' : 'outline'}
                disabled={pending || exhausted}
                onClick={() => setChoice(item.value)}
                className="min-w-0 px-2"
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${game}-stake`}>베팅할 WLD</Label>
            <Input
              id={`${game}-stake`}
              name="stake"
              type="number"
              min={minStake}
              max={maxStake}
              defaultValue={minStake}
              disabled={pending || exhausted}
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">
              한 판에 {groupDigits(minStake)}~{groupDigits(maxStake)} WLD
            </p>
          </div>
          <Button
            type="submit"
            disabled={pending || exhausted}
            className="min-h-12 w-full font-bold"
          >
            {pending
              ? '서버에서 결과 확인 중…'
              : exhausted
                ? '설정한 오늘 한도 소진'
                : `${theme.icon} 선택 결과 보기`}
          </Button>
          {state.status !== 'idle' ? (
            <p
              role="status"
              className={
                state.status === 'ok'
                  ? 'rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600'
                  : 'rounded-lg bg-destructive/10 p-3 text-sm text-destructive'
              }
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
