'use client';

import { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Info,
  Lock,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';

// Lucide SVG 기반 릴 기호 매핑 (이모지 글리치 및 텍스트 렌더링 결함 방지)
interface ReelSymbolInfo {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly color: string;
  readonly payout: string;
}

const REEL_SYMBOLS: readonly ReelSymbolInfo[] = [
  { id: 'seven', name: '777 잭팟', label: '7', color: 'text-amber-500 border-amber-500/50 bg-amber-500/10', payout: '10.0배' },
  { id: 'star', name: '골든 스타', label: '★', color: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10', payout: '5.0배' },
  { id: 'diamond', name: '다이아몬드', label: '◆', color: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10', payout: '3.0배' },
  { id: 'bell', name: '리버티 벨', label: '▲', color: 'text-blue-400 border-blue-400/50 bg-blue-400/10', payout: '2.0배' },
  { id: 'cherry', name: '럭키 체리', label: '●', color: 'text-rose-500 border-rose-500/50 bg-rose-500/10', payout: '1.5배' },
  { id: 'lemon', name: '스위트 레몬', label: '■', color: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10', payout: '1.2배' },
];

export function LuckySlotsGame({
  minStake,
  maxStake,
  remainingStake,
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
  const [reels, setReels] = useState<[ReelSymbolInfo, ReelSymbolInfo, ReelSymbolInfo]>([
    REEL_SYMBOLS[0]!,
    REEL_SYMBOLS[1]!,
    REEL_SYMBOLS[2]!,
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    won: boolean;
    symbol: string;
    multiplier: string;
  } | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [totalDemoSpins, setTotalDemoSpins] = useState(0);

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
        multiplier = '10.0배';
      } else if (rng < 0.35) {
        // 스타 매칭
        finalReels = [REEL_SYMBOLS[1]!, REEL_SYMBOLS[1]!, REEL_SYMBOLS[1]!];
        won = true;
        winningSymbol = '골든 스타 트리오';
        multiplier = '5.0배';
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
      }

      setReels(finalReels);
      setIsSpinning(false);
      setTotalDemoSpins((prev) => prev + 1);
      setDemoResult({
        won,
        symbol: winningSymbol,
        multiplier,
      });
    }, 1200);
  };

  return (
    <Card className="border-amber-500/20 bg-gradient-to-b from-card to-amber-500/5 shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-amber-500">
            <Sparkles className="size-5 text-amber-500" />
            <span>럭키 777 클래식 슬롯</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Scale className="size-3.5" />
              연령등급 심의 준비 중 (실베팅 차단)
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm leading-relaxed [word-break:keep-all]">
          기획서 제6절(Slots deferred) 규정에 따라 게임물관리위원회(GRAC) 19+ 청소년 보호 심의 완료 시점까지{' '}
          <strong className="text-foreground">실제 WLD 베팅이 엄격히 차단</strong>됩니다. 
          현재 모드는 0 WLD 가상 시뮬레이션 및 배당률 공시 검증용으로만 안전하게 구동됩니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* 슬롯 릴 디스플레이 스테이지 */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-black/60 p-6 shadow-inner">
          <div className="flex justify-center gap-3 sm:gap-4">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={
                  'flex size-20 sm:size-24 select-none flex-col items-center justify-center rounded-xl border-2 font-mono shadow-lg transition-transform ' +
                  symbol.color +
                  (isSpinning ? ' animate-pulse scale-95' : ' scale-100')
                }
              >
                <span className="text-3xl sm:text-4xl font-black">{symbol.label}</span>
                <span className="mt-1 text-[10px] font-bold tracking-tight opacity-80">{symbol.name}</span>
              </div>
            ))}
          </div>

          {/* 심의 안전 워터마크 라벨 */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>데모 스핀 안전 모드 · 실제 잔액 차감 없음 (0 WLD)</span>
          </div>
        </div>

        {/* 데모 결과 피드백 */}
        {demoResult && (
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

        {/* 액션 컨트롤 패널 */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={handleDemoSpin}
            disabled={isSpinning}
            className="h-12 w-full gap-2 rounded-xl text-base font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
          >
            {isSpinning ? (
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
            <span>심의 규정 및 배당률 공시 확인</span>
          </Button>
        </div>

        {/* 실베팅 잠금 안내 배너 */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <Lock className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-foreground">실제 WLD 베팅 잠금 (P0 심의 대기 상태)</p>
              <p className="leading-relaxed [word-break:keep-all]">
                정규 베팅 한도({groupDigits(minStake)} ~ {groupDigits(maxStake)} WLD) 및 잔여 한도({groupDigits(remainingStake)} WLD)가
                부여되어 있으나, 건전 게임 심의 요건 충족 전까지는 베팅 호출 API가 봉인됩니다.
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
              <span>슬롯머신 규제 심의 및 배당률 공시 명세</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              머니버스 사행성 방지 및 청소년 보호 규격 준수 현황 보고서
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* 1. 심의 진행 상태 */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="size-4" />
                  게임물관리위원회 심의 번호 (예정)
                </span>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  GRAC-2026-P0-DEFERRED
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed [word-break:keep-all]">
                본 게임은 청소년 이용불가(19+) 등급 심의 및 가상 자산 베팅 적합성 검토 대상입니다. 
                현재 이용자 보호를 위해 실베팅 파이프라인이 fail-closed 잠금 상태로 유지됩니다.
              </p>
            </div>

            {/* 2. 기호별 배당률 공시 테이블 */}
            <div className="space-y-2">
              <div className="font-bold text-foreground flex items-center justify-between">
                <span>기호별 일치 배당률 공시 (RTP: {winProbability}%)</span>
                <span className="font-mono text-muted-foreground">최대 {payoutMultiplier}배</span>
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
