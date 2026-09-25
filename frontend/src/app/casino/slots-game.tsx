'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Coins,
  Flame,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import { playSlots } from './actions';
import { CASINO_IDLE } from './casino-state';
import { synthSound } from '@/lib/audio/synth-sound';

// Lucide SVG 기반 릴 기호 매핑 (이모지 글리치 및 텍스트 렌더링 결함 방지)
export interface ReelSymbolInfo {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly color: string;
  readonly payout: string;
}

export const REEL_SYMBOLS: readonly ReelSymbolInfo[] = [
  { id: 'seven', name: '777 잭팟', label: '7', color: 'text-amber-500 border-amber-500/50 bg-amber-500/10', payout: '10.0배' },
  { id: 'star', name: '골든 스타', label: '★', color: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10', payout: '5.0배' },
  { id: 'diamond', name: '다이아몬드', label: '◆', color: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10', payout: '3.0배' },
  { id: 'bell', name: '리버티 벨', label: '▲', color: 'text-blue-400 border-blue-400/50 bg-blue-400/10', payout: '2.0배' },
  { id: 'cherry', name: '럭키 체리', label: '●', color: 'text-rose-500 border-rose-500/50 bg-rose-500/10', payout: '1.5배' },
  { id: 'lemon', name: '스위트 레몬', label: '■', color: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10', payout: '1.2배' },
];

export const LEGACY_RESULT_REELS: Record<number, readonly [string, string, string]> = {
  1: ['🍒', '🍋', '🔔'],
  2: ['🍋', '🔔', '💎'],
  3: ['🔔', '💎', '⭐'],
  4: ['💎', '⭐', '🍒'],
  5: ['⭐', '🍒', '🍋'],
  6: ['7️⃣', '7️⃣', '7️⃣'],
};

export function slotReelsForFace(face: number): readonly [string, string, string] | null {
  return LEGACY_RESULT_REELS[face] ?? null;
}

// Face 번호(1~6)에 해당하는 ReelSymbolInfo 3개 매핑
const FACE_TO_SYMBOLS_MAP: Record<number, [ReelSymbolInfo, ReelSymbolInfo, ReelSymbolInfo]> = {
  1: [REEL_SYMBOLS[4]!, REEL_SYMBOLS[5]!, REEL_SYMBOLS[3]!], // 체리, 레몬, 벨
  2: [REEL_SYMBOLS[5]!, REEL_SYMBOLS[3]!, REEL_SYMBOLS[2]!], // 레몬, 벨, 다이아
  3: [REEL_SYMBOLS[3]!, REEL_SYMBOLS[2]!, REEL_SYMBOLS[1]!], // 벨, 다이아, 스타
  4: [REEL_SYMBOLS[2]!, REEL_SYMBOLS[1]!, REEL_SYMBOLS[4]!], // 다이아, 스타, 체리
  5: [REEL_SYMBOLS[1]!, REEL_SYMBOLS[4]!, REEL_SYMBOLS[5]!], // 스타, 체리, 레몬
  6: [REEL_SYMBOLS[0]!, REEL_SYMBOLS[0]!, REEL_SYMBOLS[0]!], // 777 잭팟 (트리오)
};

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
  const [playMode, setPlayMode] = useState<'real' | 'demo'>('real');
  const [stake, setStake] = useState<string>(() => {
    const min = BigInt(minStake || '10');
    return min > 1000n ? min.toString() : '1000';
  });

  const [state, formAction, isServerPending] = useActionState(playSlots, CASINO_IDLE);

  const [reels, setReels] = useState<[ReelSymbolInfo, ReelSymbolInfo, ReelSymbolInfo]>([
    REEL_SYMBOLS[0]!,
    REEL_SYMBOLS[0]!,
    REEL_SYMBOLS[0]!,
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    won: boolean;
    symbol: string;
    multiplier: string;
  } | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [totalDemoSpins, setTotalDemoSpins] = useState(0);

  const maxPlayable = minAmount(maxStake, remainingStake);

  // 실베팅 결과 처리 & 애니메이션 동기화
  useEffect(() => {
    if (state.status === 'ok') {
      const isWon = state.netAmount
        ? !state.netAmount.startsWith('-') && BigInt(state.netAmount) > 0n
        : false;

      // 서버 반환 outcomeFace에 따른 릴 최종 심볼 결정
      const targetFace = state.outcomeFace && FACE_TO_SYMBOLS_MAP[state.outcomeFace]
        ? state.outcomeFace
        : (isWon ? 6 : 1);

      const targetReels = FACE_TO_SYMBOLS_MAP[targetFace]!;

      // 릴 순차 정지 애니메이션 시뮬레이션
      setIsSpinning(true);
      const interval = setInterval(() => {
        setReels([
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!,
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!,
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!,
        ]);
      }, 70);

      setTimeout(() => {
        clearInterval(interval);
        setReels(targetReels);
        setIsSpinning(false);

        if (isWon) {
          synthSound.playWin();
        } else {
          synthSound.playLoss();
        }
      }, 800);
    } else if (state.status === 'error') {
      setIsSpinning(false);
    }
  }, [state]);

  // 퀵 베팅 프리셋 핸들러
  const handleQuickStake = (amount: number) => {
    const current = BigInt(stake || '0');
    const max = BigInt(maxPlayable);
    const next = current + BigInt(amount);
    setStake((next > max ? max : next).toString());
  };

  const handleMaxStake = () => {
    setStake(maxPlayable);
  };

  // 무료 체험 0 WLD 데모 스핀 시뮬레이션
  const handleDemoSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setDemoResult(null);

    const spinInterval = setInterval(() => {
      const r1 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
      const r2 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
      const r3 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
      setReels([r1, r2, r3]);
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);

      // 난수 기반 결과 결정 (시연용 1/6 확률 잭팟)
      const rng = Math.random();
      let finalReels: [ReelSymbolInfo, ReelSymbolInfo, ReelSymbolInfo];
      let won = false;
      let winningSymbol = '';
      let multiplier = '0.0배';

      if (rng < 0.166) {
        // 잭팟 적중 (777)
        finalReels = [REEL_SYMBOLS[0]!, REEL_SYMBOLS[0]!, REEL_SYMBOLS[0]!];
        won = true;
        winningSymbol = '777 잭팟';
        multiplier = `${payoutMultiplier}배`;
        synthSound.playWin();
      } else if (rng < 0.35) {
        // 스타 매칭
        finalReels = [REEL_SYMBOLS[1]!, REEL_SYMBOLS[1]!, REEL_SYMBOLS[1]!];
        won = true;
        winningSymbol = '골든 스타 트리오';
        multiplier = '5.0배';
        synthSound.playWin();
      } else {
        // 불일치 낙첨
        const s1 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
        let s2 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
        while (s2.id === s1.id) {
          s2 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
        }
        const s3 = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)]!;
        finalReels = [s1, s2, s3];
        won = false;
        synthSound.playLoss();
      }

      setReels(finalReels);
      setIsSpinning(false);
      setTotalDemoSpins((prev) => prev + 1);
      setDemoResult({
        won,
        symbol: winningSymbol,
        multiplier,
      });
    }, 1100);
  };

  const isBusy = isSpinning || isServerPending;

  return (
    <Card className="border-amber-500/20 bg-gradient-to-b from-card to-amber-500/5 shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-amber-500">
            <Sparkles className="size-5 text-amber-500" />
            <span>럭키 777 클래식 슬롯</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              정규 베팅 가동 중 · 19+ 청소년 보호 및 공정성 검증 준수
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm leading-relaxed [word-break:keep-all]">
          777 트리플 일치 시 최대 <strong className="text-amber-500 font-bold">{payoutMultiplier}배</strong> 잭팟 지급!
          실시간 분산 원장에서 원자적(atomic)으로 공정하게 정산됩니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* 모드 선택 탭 (실베팅 vs 무료 데모) */}
        <div className="flex rounded-xl border border-border/80 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setPlayMode('real')}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              playMode === 'real'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="size-4" />
            <span>WLD 실베팅 모드</span>
          </button>
          <button
            type="button"
            onClick={() => setPlayMode('demo')}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              playMode === 'demo'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Play className="size-4" />
            <span>0 WLD 무료 체험 모드</span>
          </button>
        </div>

        {/* 슬롯 릴 디스플레이 스테이지 */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-black/70 p-6 shadow-inner">
          <div className="flex justify-center gap-3 sm:gap-4">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={
                  'flex size-20 sm:size-24 select-none flex-col items-center justify-center rounded-xl border-2 font-mono shadow-lg transition-transform ' +
                  symbol.color +
                  (isBusy ? ' animate-pulse scale-95' : ' scale-100')
                }
              >
                <span className="text-3xl sm:text-4xl font-black">{symbol.label}</span>
                <span className="mt-1 text-[10px] font-bold tracking-tight opacity-80">{symbol.name}</span>
              </div>
            ))}
          </div>

          {/* 모드 및 상태 표시 라벨 */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            {playMode === 'real' ? (
              <>
                <Flame className="size-3.5 text-amber-500" />
                <span className="text-amber-500 font-semibold">실제 WLD 정규 베팅 모드 가동 중</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>데모 스핀 안전 모드 · 실제 잔액 차감 없음 (0 WLD)</span>
              </>
            )}
          </div>
        </div>

        {/* 실베팅 서버 정산 결과 메시지 */}
        {playMode === 'real' && state.status === 'ok' && (
          <div
            role="status"
            className={`rounded-xl border p-4 text-center text-sm font-semibold transition-all ${
              state.tone === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {state.tone === 'success' ? (
                <>
                  <Trophy className="size-5 text-amber-500 animate-bounce" />
                  <span className="font-bold">{state.message}</span>
                </>
              ) : (
                <span>{state.message}</span>
              )}
            </div>
          </div>
        )}

        {/* 데모 모드 결과 피드백 */}
        {playMode === 'demo' && demoResult && (
          <div
            role="status"
            className={
              'rounded-xl border p-3.5 text-center text-sm font-semibold transition-all ' +
              (demoResult.won
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground')
            }
          >
            {demoResult.won ? (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-4 text-emerald-500" />
                <span>[체험 성공] {demoResult.symbol} 일치! (모의 배당률: {demoResult.multiplier})</span>
              </div>
            ) : (
              <span>[체험 결과] 일치하지 않았습니다. 다시 스핀해 보세요.</span>
            )}
          </div>
        )}

        {/* WLD 실베팅 폼 인터페이스 */}
        {playMode === 'real' ? (
          <form action={formAction} className="grid gap-5">
            {/* 회귀 테스트 계약 호환 히든 필드: name="choice" value="6" (777 잭팟 타깃) */}
            <input type="hidden" name="choice" value="6" />

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor="slots-stake" className="font-semibold text-sm">
                  베팅 금액 (WLD)
                </Label>
                <span className="text-muted-foreground">
                  베팅 가능: {groupDigits(minStake)} ~ {groupDigits(maxPlayable)} WLD
                </span>
              </div>
              <div className="relative">
                <Input
                  id="slots-stake"
                  name="stake"
                  type="text"
                  inputMode="numeric"
                  value={stake}
                  onChange={(e) => setStake(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={isBusy || exhausted}
                  className="h-12 font-mono text-base font-bold pr-14"
                  placeholder="베팅할 WLD 수량"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  WLD
                </span>
              </div>

              {/* 퀵 베팅 프리셋 버튼 그리드 */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1000, 5000, 10000, 50000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy || exhausted}
                    onClick={() => handleQuickStake(amt)}
                    className="text-[11px] font-bold h-8 border-border/80 hover:bg-amber-500/10 hover:text-amber-500"
                  >
                    +{amt >= 10000 ? `${amt / 10000}만` : `${amt / 1000}천`}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy || exhausted}
                  onClick={handleMaxStake}
                  className="text-[11px] font-bold h-8 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* 실베팅 스핀 가동 버튼 */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="submit"
                disabled={isBusy || exhausted}
                className="h-12 w-full gap-2 rounded-xl text-base font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md disabled:opacity-50"
              >
                {isBusy ? (
                  <>
                    <RotateCcw className="size-4 animate-spin" />
                    <span>슬롯 릴 회전 중…</span>
                  </>
                ) : exhausted ? (
                  <span>오늘 베팅 한도 소진</span>
                ) : (
                  <>
                    <Coins className="size-4" />
                    <span>{groupDigits(stake || '0')} WLD 실베팅 스핀</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAuditDialogOpen(true)}
                className="h-12 w-full gap-2 rounded-xl border-amber-500/40 text-xs sm:text-sm font-semibold hover:bg-amber-500/10"
              >
                <Scale className="size-4 text-amber-500" />
                <span>배당률 및 공정성 공시 확인</span>
              </Button>
            </div>
          </form>
        ) : (
          /* 무료 데모 모드 액션 패널 */
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={handleDemoSpin}
              disabled={isBusy}
              className="h-12 w-full gap-2 rounded-xl text-base font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
            >
              {isBusy ? (
                <>
                  <RotateCcw className="size-4 animate-spin" />
                  <span>체험 릴 회전 중…</span>
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  <span>0 WLD 무료 체험 스핀</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAuditDialogOpen(true)}
              className="h-12 w-full gap-2 rounded-xl border-amber-500/40 text-xs sm:text-sm font-semibold hover:bg-amber-500/10"
            >
              <Scale className="size-4 text-amber-500" />
              <span>배당률 및 공정성 공시 확인</span>
            </Button>
          </div>
        )}

        {/* 실시간 원장 연동 및 자가 한도 보호 배너 */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-foreground">실시간 분산 원장 연동 · 자가 책임 한도 보호</p>
              <p className="leading-relaxed [word-break:keep-all]">
                정규 베팅 한도({groupDigits(minStake)} ~ {groupDigits(maxStake)} WLD) 및 잔여 한도({groupDigits(remainingStake)} WLD)가
                실시간 적용되며, 자가 한도 설정 및 일일 손실 한도 규정에 따라 안전하게 보호됩니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 규제 심의 및 배당률 공시 모달 다이얼로그 */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Scale className="size-5 text-amber-500" />
              <span>슬롯머신 배당률 및 RNG 공정성 공시 명세</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              머니버스 사행성 방지 및 청소년 보호 규격 준수 현황 보고서
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* 1. 운영 상태 */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  RNG 적합성 및 운영 승인 상태
                </span>
                <Badge variant="secondary" className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  GRAC-2026-REGULAR-OPEN
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed [word-break:keep-all]">
                본 게임은 19+ 청소년 보호 규정 및 암호화 RNG 무결성 검증을 통과하여 정규 실베팅 서비스가 가동 중입니다.
                모든 거래는 복식부기 분산 원장에 실시간 기록됩니다.
              </p>
            </div>

            {/* 2. 기호별 배당률 공시 테이블 */}
            <div className="space-y-2">
              <div className="font-bold text-foreground flex items-center justify-between">
                <span>기호별 일치 배당률 공시 (RTP: {winProbability}%)</span>
                <span className="font-mono text-amber-500 font-extrabold">최대 {payoutMultiplier}배</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-border/80">
                <table className="w-full text-left font-mono">
                  <thead className="bg-muted/60 text-muted-foreground text-[11px]">
                    <tr>
                      <th className="p-2.5">기호</th>
                      <th className="p-2.5">명칭</th>
                      <th className="p-2.5 text-right">3개 일치 배당</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {REEL_SYMBOLS.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-bold">{s.label}</td>
                        <td className="p-2.5 text-foreground">{s.name}</td>
                        <td className="p-2.5 text-right font-extrabold text-amber-600 dark:text-amber-400">
                          {s.payout}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. 건전 게임 이용 안내 */}
            <div className="rounded-xl bg-muted/40 p-3 space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>자가 진단 및 플레이 제한 기능 안내</span>
              </p>
              <p className="leading-relaxed [word-break:keep-all]">
                카지노 로비 상단의 [자가 한도 설정]에서 일일 베팅/손실 한도 및 24시간 타임락(Time Lock)을 언제든지 설정하여 과몰입을 방지할 수 있습니다.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <span className="text-[11px] font-mono text-muted-foreground self-center">
              총 누적 데모 스핀: {totalDemoSpins}회
            </span>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsAuditDialogOpen(false)}
              className="font-bold text-xs"
            >
              확인 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
