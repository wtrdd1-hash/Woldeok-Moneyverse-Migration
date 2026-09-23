import { Flame, ShieldAlert, Sparkles, Trash2, Vault } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MARKET_TAX_RATE, MAX_MARKET_TAX_WLD } from '@/app/marketplace/market-tax';

export function EconomySinkCard() {
  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">OSRS형 2% 마켓 거래세 & 자동 소각 관제 (Item & Coin Sink)</CardTitle>
              <CardDescription className="text-xs">
                인플레이션 방어를 위한 2% 거래세 원천징수 및 50/50 소각·국고 자동 매수 파괴 엔진
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-500/30 text-amber-500">
            가상 경제 거버넌스 P0
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 정책 핵심 수치 그리드 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-background/60 p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="h-3 w-3 text-red-500" /> 기본 거래세율
            </span>
            <div className="mt-1 text-lg font-bold tracking-tight text-red-500">
              {(MARKET_TAX_RATE * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-muted-foreground">체결 시 판매자 원천징수</span>
          </div>

          <div className="rounded-lg border bg-background/60 p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-amber-500" /> 1회 거래세 상한
            </span>
            <div className="mt-1 text-lg font-bold tracking-tight text-amber-500">
              {MAX_MARKET_TAX_WLD.toLocaleString()} WLD
            </div>
            <span className="text-[11px] text-muted-foreground">대규모 고래 거래 캡</span>
          </div>

          <div className="rounded-lg border bg-background/60 p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Trash2 className="h-3 w-3 text-rose-500" /> 영구 통화 소각 (50%)
            </span>
            <div className="mt-1 text-lg font-bold tracking-tight text-rose-500">
              Coin Sink
            </div>
            <span className="text-[11px] text-muted-foreground">시중 WLD 통화량 영구 감소</span>
          </div>

          <div className="rounded-lg border bg-background/60 p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Vault className="h-3 w-3 text-blue-500" /> 아이템 파괴 풀 (50%)
            </span>
            <div className="mt-1 text-lg font-bold tracking-tight text-blue-500">
              Item Sink
            </div>
            <span className="text-[11px] text-muted-foreground">국고 적립 후 최저가 매수 파괴</span>
          </div>
        </div>

        {/* 2단계 소각 메커니즘 인포스트립 */}
        <div className="rounded-md border border-amber-500/10 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Grand Exchange Automated Item Sink 알고리즘 가동 상태</span>
          </div>
          <p className="mt-1">
            마켓플레이스 거래가 체결될 때마다 징수된 2% 세금 중 50%는 원장에서 즉시 소각(Burn)되고,
            나머지 50%는 국고(Treasury)에 적립되어 시장 내 등록된 최저가 잉여 장비/아이템을 시스템이 자동 매입하여 영구 파괴 처리합니다.
            이를 통해 통화 가치와 아이템 가치가 동반 보존됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
