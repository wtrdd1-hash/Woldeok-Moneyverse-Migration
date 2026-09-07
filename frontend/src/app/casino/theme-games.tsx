'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { absAmount } from './coin';
import { CASINO_IDLE, playDiceNumber, playDiceParity } from './actions';

type ThemeGame = 'wheel' | 'treasure' | 'gems';

const THEMES = {
  wheel: {
    icon: '🎡',
    title: '컬러 휠',
    description: '황금색(홀수) 또는 푸른색(짝수)을 고르는 서버 게임입니다.',
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

function minAmount(...values: readonly string[]): string {
  return values.reduce((lowest, value) => (BigInt(value) < BigInt(lowest) ? value : lowest));
}

export function themedOutcome(game: ThemeGame, face: number): string {
  if (game === 'wheel') return face % 2 === 1 ? '황금색' : '푸른색';
  if (game === 'treasure') return `${face}번 상자`;
  return `${face}번 보석`;
}

export function ThemeGameCard({
  game,
  minStake,
  maxStake,
  remainingStake,
  exhausted,
  winProbability,
  payoutMultiplier,
}: {
  readonly game: ThemeGame;
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  readonly exhausted: boolean;
  readonly winProbability: string;
  readonly payoutMultiplier: string;
}) {
  const theme = THEMES[game];
  const action = theme.mode === 'parity' ? playDiceParity : playDiceNumber;
  const [state, formAction, pending] = useActionState(action, CASINO_IDLE);
  const [choice, setChoice] = useState(theme.mode === 'parity' ? 'odd' : '1');
  const maxPlayable = minAmount(maxStake, remainingStake);
  const choices =
    theme.mode === 'parity'
      ? [
          { value: 'odd', label: '🟡 황금색' },
          { value: 'even', label: '🔵 푸른색' },
        ]
      : Array.from({ length: 6 }, (_, index) => ({
          value: String(index + 1),
          label: game === 'treasure' ? `상자 ${index + 1}` : `보석 ${index + 1}`,
        }));

  const resultText =
    state.status === 'ok' && state.outcomeFace !== undefined && state.netAmount
      ? `${state.replayed ? '이미 처리된 판 · ' : ''}서버 결과 ${themedOutcome(
          game,
          state.outcomeFace,
        )}. ${
          state.result === 'win'
            ? `${groupDigits(absAmount(state.netAmount))} WLD 획득`
            : state.result === 'loss'
              ? `${groupDigits(absAmount(state.netAmount))} WLD 손실`
              : '정산 0 WLD'
        }`
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span>{theme.icon}</span> {theme.title}
        </CardTitle>
        <CardDescription>
          {theme.description} 모든 결과와 WLD 정산은 서버에서 처리됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2.5 py-1">적중 확률 {winProbability}%</span>
          <span className="rounded-full border px-2.5 py-1">적중 시 {payoutMultiplier}배 배당</span>
          <span className="rounded-full border px-2.5 py-1">서버 원장 정산</span>
        </div>

        <form action={formAction} className="grid gap-5">
          <input
            type="hidden"
            name={theme.mode === 'parity' ? 'parity' : 'number'}
            value={choice}
          />

          <div className="grid gap-2">
            <Label>{theme.mode === 'parity' ? '색상 선택' : '번호 선택'}</Label>
            <div className="flex flex-wrap gap-2">
              {choices.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={choice === item.value ? 'default' : 'outline'}
                  onClick={() => setChoice(item.value)}
                  disabled={pending || exhausted}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${game}-stake`}>베팅할 WLD 금액</Label>
            <Input
              id={`${game}-stake`}
              name="stake"
              type="number"
              min={minStake}
              max={maxPlayable}
              defaultValue={minStake}
              required
              disabled={pending || exhausted}
            />
            <p className="text-xs text-muted-foreground">
              한 판 최소 {groupDigits(minStake)} WLD · 현재 한도 기준 최대 {groupDigits(maxPlayable)} WLD
            </p>
          </div>

          <Button type="submit" disabled={pending || exhausted} className="h-12 w-full font-bold">
            {pending ? '서버에서 결과 확인 중…' : exhausted ? '현재 한도로 플레이 불가' : `${theme.icon} 플레이`}
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
