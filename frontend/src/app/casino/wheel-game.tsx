'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { Sparkles, RotateCw, Flame, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { groupDigits } from '@/lib/money';
import { playWheel20 } from './actions';
import { CASINO_IDLE } from './casino-state';
import type { CasinoPlayState } from './casino-state';

// 20개 구획 정의 (1..20)
// 1..10: Blue (50%, 1.90배)
// 11..15: Gold (25%, 3.80배)
// 16..17: Violet (10%, 9.50배)
// 18..20: Neutral (15%, 0배)
interface WheelSegmentDef {
  readonly index: number; // 1..20
  readonly type: 'blue' | 'gold' | 'violet' | 'neutral';
  readonly color: string;
  readonly textColor: string;
  readonly label: string;
}

const SEGMENTS: readonly WheelSegmentDef[] = Array.from({ length: 20 }, (_, i) => {
  const index = i + 1;
  if (index <= 10) {
    return { index, type: 'blue', color: '#2563eb', textColor: '#ffffff', label: `${index}` };
  } else if (index <= 15) {
    return { index, type: 'gold', color: '#eab308', textColor: '#000000', label: `${index}` };
  } else if (index <= 17) {
    return { index, type: 'violet', color: '#9333ea', textColor: '#ffffff', label: `${index}` };
  } else {
    return { index, type: 'neutral', color: '#475569', textColor: '#ffffff', label: `${index}` };
  }
});

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', x, y, 'L', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
}

export function WheelGame({
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
  const [state, formAction, pending] = useActionState<CasinoPlayState, FormData>(playWheel20, CASINO_IDLE);
  const [choice, setChoice] = useState<'blue' | 'gold' | 'violet'>('blue');
  const [stakeAmount, setStakeAmount] = useState<number>(Number(minStake));
  const [rotationDegree, setRotationDegree] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [history, setHistory] = useState<readonly { seg: number; type: string; isWin: boolean }[]>([
    { seg: 7, type: 'blue', isWin: true },
    { seg: 14, type: 'gold', isWin: true },
    { seg: 2, type: 'blue', isWin: false },
    { seg: 19, type: 'neutral', isWin: false },
    { seg: 16, type: 'violet', isWin: true },
  ]);

  const maxPlayable = Math.min(Number(maxStake), Number(remainingStake));
  const spinCounter = useRef(0);

  // 서버 응답 수신 시 정확한 각도로 회전
  useEffect(() => {
    if (state.status === 'ok' && state.themeOutcome) {
      const [segStr, clsStr] = state.themeOutcome.split(':');
      const segmentNum = parseInt(segStr ?? '1', 10);
      const segmentClass = clsStr ?? 'neutral';

      // 1번 세그먼트는 0도..18도 (중심 9도)
      // 12시 방향(0도)에 세그먼트 중심이 위치하려면 반대 회전 적용
      // 구획 중심 각도: (segmentNum - 1) * 18 + 9
      const segmentAngle = (segmentNum - 1) * 18 + 9;
      spinCounter.current += 1;
      const extraSpins = 5 + (spinCounter.current % 3); // 5~7바퀴 회전
      const targetDegree = extraSpins * 360 - segmentAngle;

      setIsSpinning(true);
      setRotationDegree((prev) => {
        // 직전 회전 누적치에서 연속 회전
        const base = Math.ceil(prev / 360) * 360;
        return base + targetDegree;
      });

      const timer = setTimeout(() => {
        setIsSpinning(false);
        setHistory((prev) => [
          { seg: segmentNum, type: segmentClass, isWin: state.result === 'win' },
          ...prev.slice(0, 9),
        ]);
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleAddStake = (amount: number) => {
    setStakeAmount((prev) => Math.min(maxPlayable, Math.max(Number(minStake), prev + amount)));
  };

  const handleMaxStake = () => {
    setStakeAmount(maxPlayable);
  };

  return (
    <Card className="rounded-2xl border-border/80 shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                🎡
              </span>
              <span>20-구획 룰렛 휠 (20-Segment Wheel)</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              공정성 검증 완료 20-구획 가상 휠에서 색상 구획을 선택하고 실시간 스핀 배당을 획득하세요.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono text-xs">
              <Sparkles className="size-3" />
              <span>최대 9.50x 고배당</span>
            </Badge>
            <Badge variant="outline" className="border-border/80 text-muted-foreground font-mono text-xs">
              RTP 95%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-4 sm:p-6">
        {/* 최근 10회 결과 히스토리 스트립 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="flex items-center gap-1 font-bold text-muted-foreground shrink-0 text-[11px]">
            <History className="size-3.5" />
            <span>최근 결과:</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {history.map((h, idx) => (
              <span
                key={idx}
                className={cn(
                  'px-2 py-0.5 rounded-full font-bold font-mono text-[11px] border',
                  h.type === 'blue' && 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
                  h.type === 'gold' && 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
                  h.type === 'violet' && 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
                  h.type === 'neutral' && 'bg-muted text-muted-foreground border-border/80'
                )}
              >
                #{h.seg} {h.type.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* 휠 스핀 인터페이스 서피스 */}
        <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-card to-muted/30 border border-border/70 shadow-inner">
          {/* 상단 핀 포인터 */}
          <div className="absolute top-2 z-20 flex flex-col items-center drop-shadow-md">
            <div className="w-4 h-6 bg-red-600 rounded-b-md shadow-lg transform -translate-y-1" />
            <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[14px] border-t-red-600 transform -translate-y-1" />
          </div>

          {/* 원형 SVG 휠 */}
          <div className="relative size-64 sm:size-72 p-2 flex items-center justify-center">
            <svg
              viewBox="0 0 300 300"
              className="size-full filter drop-shadow-xl"
              style={{
                transform: `rotate(${rotationDegree}deg)`,
                transition: isSpinning ? 'transform 3.2s cubic-bezier(0.12, 0.85, 0.18, 1.0)' : 'none',
              }}
            >
              {/* 바깥 림 */}
              <circle cx="150" cy="150" r="146" fill="#1e293b" stroke="#334155" strokeWidth="6" />

              {/* 20개 구획 조각 */}
              {SEGMENTS.map((seg, idx) => {
                const startAngle = idx * 18;
                const endAngle = (idx + 1) * 18;
                const pathData = describeArc(150, 150, 140, startAngle, endAngle);

                // 라벨 좌표 (반지름 115)
                const textPos = polarToCartesian(150, 150, 115, startAngle + 9);
                const textRotate = startAngle + 9;

                return (
                  <g key={seg.index}>
                    <path
                      d={pathData}
                      fill={seg.color}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      fill={seg.textColor}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotate}, ${textPos.x}, ${textPos.y})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}

              {/* 중앙 허브 엠블럼 */}
              <circle cx="150" cy="150" r="38" fill="#0f172a" stroke="#475569" strokeWidth="3" />
              <circle cx="150" cy="150" r="28" fill="#1e293b" />
              <text
                x="150"
                y="150"
                fill="#f59e0b"
                fontSize="12"
                fontWeight="900"
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
              >
                WLD
              </text>
            </svg>
          </div>

          {/* 스핀 중 상태 오버레이 */}
          {isSpinning && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-2xl">
              <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-1.5 shadow-lg border border-primary/30 text-xs font-black animate-pulse text-primary">
                <RotateCw className="size-3.5 animate-spin" />
                <span>휠 회전 중…</span>
              </div>
            </div>
          )}
        </div>

        {/* 베팅 조작 폼 */}
        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="choice" value={choice} />

          {/* 1. 구획 색상 선택 버튼 */}
          <div className="grid gap-2">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>휠 배당 구획 선택</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {choice === 'blue' ? '10칸 (50% 확률)' : choice === 'gold' ? '5칸 (25% 확률)' : '2칸 (10% 확률)'}
              </span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChoice('blue')}
                disabled={pending || isSpinning || exhausted}
                className={cn(
                  'h-16 flex flex-col items-center justify-center rounded-xl border p-2 transition-all text-xs font-bold',
                  choice === 'blue'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30 shadow-sm'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div className="flex items-center gap-1 font-black">
                  <span className="size-2.5 rounded-full bg-blue-500" />
                  <span>블루 (10칸)</span>
                </div>
                <span className="text-[11px] font-mono mt-1 font-semibold text-foreground">
                  1.90x 배당
                </span>
              </button>

              <button
                type="button"
                onClick={() => setChoice('gold')}
                disabled={pending || isSpinning || exhausted}
                className={cn(
                  'h-16 flex flex-col items-center justify-center rounded-xl border p-2 transition-all text-xs font-bold',
                  choice === 'gold'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30 shadow-sm'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div className="flex items-center gap-1 font-black">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  <span>골드 (5칸)</span>
                </div>
                <span className="text-[11px] font-mono mt-1 font-semibold text-foreground">
                  3.80x 배당
                </span>
              </button>

              <button
                type="button"
                onClick={() => setChoice('violet')}
                disabled={pending || isSpinning || exhausted}
                className={cn(
                  'h-16 flex flex-col items-center justify-center rounded-xl border p-2 transition-all text-xs font-bold',
                  choice === 'violet'
                    ? 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/30 shadow-sm'
                    : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div className="flex items-center gap-1 font-black">
                  <span className="size-2.5 rounded-full bg-purple-500" />
                  <span>바이올렛 (2칸)</span>
                </div>
                <span className="text-[11px] font-mono mt-1 font-semibold text-foreground">
                  9.50x 대박
                </span>
              </button>
            </div>
          </div>

          {/* 2. 베팅 금액 입력 및 퀵 프리셋 버튼 */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <Label htmlFor="wheel-stake" className="text-foreground">베팅 WLD 금액</Label>
              <span className="text-muted-foreground font-mono">
                잔여 한도: {groupDigits(maxPlayable.toString())} WLD
              </span>
            </div>

            <div className="relative">
              <Input
                id="wheel-stake"
                name="stake"
                type="number"
                min={minStake}
                max={maxPlayable}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                required
                disabled={pending || isSpinning || exhausted}
                className="pr-14 text-lg font-mono font-extrabold h-12 rounded-xl"
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-muted-foreground">
                WLD
              </span>
            </div>

            {/* 퀵 베팅 프리셋 버튼 그리드 */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddStake(1000)}
                disabled={pending || isSpinning || exhausted}
                className="h-8 text-xs font-mono font-bold rounded-lg"
              >
                +1,000
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddStake(5000)}
                disabled={pending || isSpinning || exhausted}
                className="h-8 text-xs font-mono font-bold rounded-lg"
              >
                +5,000
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddStake(10000)}
                disabled={pending || isSpinning || exhausted}
                className="h-8 text-xs font-mono font-bold rounded-lg"
              >
                +10,000
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleMaxStake}
                disabled={pending || isSpinning || exhausted}
                className="h-8 text-xs font-mono font-black text-primary rounded-lg"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* 베팅 실행 버튼 */}
          <Button
            type="submit"
            disabled={pending || isSpinning || exhausted}
            className="h-12 w-full text-base font-extrabold rounded-xl shadow-md gap-2"
          >
            {isSpinning || pending ? (
              <>
                <RotateCw className="size-4 animate-spin" />
                <span>휠 회전 중… 결과 확인 대기</span>
              </>
            ) : exhausted ? (
              '오늘 이용 한도 초과'
            ) : (
              <>
                <Flame className="size-4 text-amber-400" />
                <span>{groupDigits(stakeAmount.toString())} WLD 스핀 시작</span>
              </>
            )}
          </Button>

          {/* 결과 안내 배너 */}
          {!isSpinning && state.status === 'ok' && state.message && (
            <div
              role="status"
              className={cn(
                'rounded-xl p-4 text-center text-sm font-bold border transition-all animate-in fade-in zoom-in-95',
                state.result === 'win'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
              )}
            >
              {state.message}
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
