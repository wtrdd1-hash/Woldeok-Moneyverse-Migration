import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {   Sparkles, Scale, Info } from 'lucide-react';

interface LimitPolicyItem {
  readonly title: string;
  readonly mode: 'unlimited' | 'protection' | 'budget';
  readonly value: string;
  readonly category: 'UNLIMITED_DEFAULT' | 'MARKET_INTEGRITY' | 'SYSTEM_SAFETY' | 'CONTENT_BUDGET';
  readonly reasonCode: string;
  readonly description: string;
}

const POLICIES: readonly LimitPolicyItem[] = [
  {
    title: '계정당 미체결 주문 상한',
    mode: 'unlimited',
    value: '무제한 (null)',
    category: 'UNLIMITED_DEFAULT',
    reasonCode: 'SYSTEM_SAFETY',
    description: '과거 20개 하드캡을 완전 배제하고 큐 백프레셔 및 동시성 락으로 안전성 보장.',
  },
  {
    title: '단일 주문 금액 한도',
    mode: 'protection',
    value: '동적 유동성 가드',
    category: 'MARKET_INTEGRITY',
    reasonCode: 'MARKET_INTEGRITY',
    description: '임의 자산 20% 캡 대신 종목별 일일 거래량(ADV), 스프레드, 서킷브레이커에 연동.',
  },
  {
    title: '종목 거래정지 및 상장폐지',
    mode: 'protection',
    value: '매수원가(Cost Basis) 자동환급',
    category: 'MARKET_INTEGRITY',
    reasonCode: 'SETTLEMENT_INTEGRITY',
    description: '거래정지 종목 발생 시 100% 매수원가 WLD 원자적 환급 영수증 발행 및 원장 보존.',
  },
  {
    title: '시즌 토큰 및 재화 이월',
    mode: 'unlimited',
    value: '비율 전환 무제한',
    category: 'UNLIMITED_DEFAULT',
    reasonCode: 'UNLIMITED_DEFAULT',
    description: '과거 100 ST 고정 상한을 배제하고 전체 공개 전환비율 기반 자유 이월 허용.',
  },
];

export function LimitPolicyGuardCard() {
  return (
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Scale className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">기본 무제한 & 시장 무결성 보호 정책</CardTitle>
              <CardDescription className="text-xs">
                LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC 기반 정책 정합성 및 안전 가드
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs font-mono font-medium gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            <Sparkles className="size-3" />
            DEFAULT UNLIMITED VERIFIED
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {POLICIES.map((policy) => (
            <div
              key={policy.title}
              className="rounded-xl border border-border/60 bg-card p-3.5 transition-colors hover:bg-muted/10 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm text-foreground">{policy.title}</span>
                <Badge
                  variant={policy.mode === 'unlimited' ? 'default' : 'secondary'}
                  className="shrink-0 text-[11px] font-mono"
                >
                  {policy.value}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {policy.description}
              </p>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground font-mono">
                <span className="rounded bg-muted/60 px-1.5 py-0.5 font-medium text-foreground">
                  {policy.category}
                </span>
                <span>•</span>
                <span className="text-muted-foreground">{policy.reasonCode}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0 text-primary" />
          <span>
            모든 정상적인 유효 플레이는 <strong>상한 없음(null)</strong>을 기본으로 하며,
            시세조작 및 인프라 과부하 방지 가드만 서버 권위 조건으로 정밀 제한됩니다.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
