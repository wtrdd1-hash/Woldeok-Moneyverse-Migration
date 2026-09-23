/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useActionState, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { absAmount } from './coin';
import { playGem5, playTreasure4, playWheel20 } from './actions';
import { CASINO_IDLE } from './casino-state';
import { synthSound } from '@/lib/audio/synth-sound';

export type ThemeGame = 'wheel' | 'treasure' | 'gems';

interface ThemeConfig {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly action: typeof playWheel20 | typeof playTreasure4 | typeof playGem5;
  readonly defaultChoice: string;
  readonly choices: readonly { readonly value: string; readonly label: string; readonly badge?: string }[];
}

const THEME_CONFIGS: Record<ThemeGame, ThemeConfig> = {
  treasure: {
    icon: '🗝️',
    title: '보물 상자 (Treasure Vault)',
    description: '4개의 비밀 상자 중 황금 보물이 숨겨진 상자 1개를 맞춥니다.',
    action: playTreasure4,
    defaultChoice: '1',
    choices: [
      { value: '1', label: '📦 1번 상자' },
      { value: '2', label: '📦 2번 상자' },
      { value: '3', label: '📦 3번 상자' },
      { value: '4', label: '📦 4번 상자' },
    ],
  },
  gems: {
    icon: '💎',
    title: '럭키 젬 (Gem Match 5)',
    description: '5가지 마법 보석 중 오늘 서버가 추첨할 행운의 보석 1개를 선택합니다.',
    action: playGem5,
    defaultChoice: 'ruby',
    choices: [
      { value: 'ruby', label: '🔴 루비 (빨강)' },
      { value: 'emerald', label: '🟢 에메랄드 (초록)' },
      { value: 'sapphire', label: '🔵 사파이어 (파랑)' },
      { value: 'topaz', label: '🟡 토파즈 (노랑)' },
      { value: 'amethyst', label: '🟣 자수정 (보라)' },
    ],
  },
  wheel: {
    icon: '🎡',
    title: '20구획 휠 (20-Segment Wheel)',
    description: '20개 구획으로 나뉜 휠에서 색상 구획을 선택하여 배당을 노립니다.',
    action: playWheel20,
    defaultChoice: 'blue',
    choices: [
      { value: 'blue', label: '🔵 블루 구획 (10칸)', badge: '50% / 1.90배' },
      { value: 'gold', label: '🟡 골드 구획 (5칸)', badge: '25% / 3.80배' },
      { value: 'violet', label: '🟣 바이올렛 구획 (2칸)', badge: '10% / 9.50배' },
    ],
  },
};

export function themedOutcome(game: ThemeGame | 'wheel' | 'treasure' | 'gems', face: number): string {
  if (game === 'wheel') return face % 2 === 1 ? '황금색' : '푸른색';
  if (game === 'treasure') return `${face}번 상자`;
  return `${face}번 보석`;
}

function minAmount(...values: readonly string[]): string {
  return values.reduce((lowest, value) => (BigInt(value) < BigInt(lowest) ? value : lowest));
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
  const theme = THEME_CONFIGS[game];
  const [state, formAction, pending] = useActionState(theme.action, CASINO_IDLE);
  const [choice, setChoice] = useState(theme.defaultChoice);
  const maxPlayable = minAmount(maxStake, remainingStake);

  useEffect(() => {
    if (state.status === 'ok') {
      const isWon = state.netAmount
        ? !state.netAmount.startsWith('-') && BigInt(state.netAmount) > 0n
        : false;
      if (isWon) {
        synthSound.playWin();
      } else {
        synthSound.playLoss();
      }
    }
  }, [state]);

  const resultText =
    state.status === 'ok' && state.themeOutcome && state.netAmount
      ? `${state.replayed ? '이미 처리된 판 · ' : ''}${state.message}`
      : null;

  return (
    <Card className="rounded-2xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <span>{theme.icon}</span> {theme.title}
        </CardTitle>
        <CardDescription>
          {theme.description} 모든 결과와 WLD 정산은 서버 권위적(authoritative) 원장에서 안전하게 처리됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border/80 px-2.5 py-1 font-medium bg-muted/30">
            적중 확률 {winProbability}%
          </span>
          <span className="rounded-full border border-border/80 px-2.5 py-1 font-medium bg-muted/30">
            적중 시 {payoutMultiplier}배 배당
          </span>
          <span className="rounded-full border border-border/80 px-2.5 py-1 font-medium bg-muted/30">
            RTP 95% 공정성 보장
          </span>
        </div>

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="choice" value={choice} />

          <div className="grid gap-2">
            <Label className="font-semibold text-sm">
              {game === 'wheel' ? '휠 구획 색상 선택' : game === 'treasure' ? '보물 상자 선택' : '보석 선택'}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {theme.choices.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={choice === item.value ? 'default' : 'outline'}
                  onClick={() => setChoice(item.value)}
                  disabled={pending || exhausted}
                  className="h-14 flex flex-col items-center justify-center gap-0.5 text-sm font-semibold rounded-xl"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[11px] opacity-80 font-normal">({item.badge})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${game}-stake`} className="font-semibold text-sm">
              베팅할 WLD 금액
            </Label>
            <div className="relative">
              <Input
                id={`${game}-stake`}
                name="stake"
                type="number"
                min={minStake}
                max={maxPlayable}
                defaultValue={minStake}
                required
                disabled={pending || exhausted}
                className="pr-12 text-lg font-mono font-bold h-12"
              />
              <span className="absolute right-3 top-3 text-xs font-semibold text-muted-foreground">
                WLD
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              한 판 최소 {groupDigits(minStake)} WLD · 현재 한도 기준 최대 {groupDigits(maxPlayable)} WLD
            </p>
          </div>

          <Button
            type="submit"
            disabled={pending || exhausted}
            className="h-12 w-full text-base font-bold rounded-xl"
          >
            {pending ? '서버에서 결과 확인 중…' : exhausted ? '현재 한도로 플레이 불가' : `${theme.icon} 베팅 확정`}
          </Button>

          {resultText && (
            <div
              role="status"
              className={
                state.result === 'win'
                  ? 'rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-700 dark:text-emerald-300'
                  : 'rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm font-bold text-rose-700 dark:text-rose-300'
              }
            >
              {resultText}
            </div>
          )}
          {state.status === 'error' && state.message && (
            <div
              role="status"
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive"
            >
              {state.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
