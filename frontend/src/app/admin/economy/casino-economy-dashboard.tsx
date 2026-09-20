'use client';

import { Amount } from '@/components/amount';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';

export function CasinoEconomyDashboard() {
  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span>🎲</span> 카지노 자금 흐름 & 환수율 (RTP / House Edge)
            </CardTitle>
            <CardDescription>
              암호학적 공정성(Provably Fair) 기반 3종 게임(코인토스, 홀짝, 주사위)의 일일 통화 흡수율(Sink)을 모니터링합니다.
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            하우스 엣지: 2.5% ~ 5.0%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-muted/40 p-3.5 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">암호학적 검증 방식</span>
            <span className="font-semibold text-primary">SHA-256 Seeded</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">이론 환수율 (RTP)</span>
            <span className="font-semibold tabular text-emerald-600 dark:text-emerald-400">
              95.0% ~ 97.5%
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">자가 한도 보호 (책임도박)</span>
            <span className="font-semibold tabular">활성화 (ACTIVE)</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">싱크(소각) 기여도</span>
            <span className="font-semibold tabular text-indigo-600 dark:text-indigo-400">
              안정적 순흡수
            </span>
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">🎰 경제 싱크(Sink) 건전성 분석</p>
          <p>
            카지노 시스템은 직업 보상(Faucet)으로 풀린 WLD 통화를 안전하게 회수하는 핵심 디플레이션 창구로 기능합니다.
            자가 한도(책임도박) 정책과 정밀 난수 생성으로 유저 신뢰와 통화 밸런스를 동시에 유지하고 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
