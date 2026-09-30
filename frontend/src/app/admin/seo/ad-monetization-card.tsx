'use client';

import { useState, useMemo } from 'react';
import { DollarSign, ShieldCheck, Target, TrendingUp, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface RpmPreset {
  label: string;
  rpm: number;
  description: string;
}

const RPM_PRESETS: RpmPreset[] = [
  { label: '보수적 금융/포털', rpm: 2.5, description: '일반 포털/유틸리티 기본 단가' },
  { label: '한국 금융 계산기 평균', rpm: 5.0, description: '복리/주식/예금 계산기 타깃 단가' },
  { label: '고단가 재테크/투자', rpm: 12.0, description: '주식/증권/절세 고단가 키워드' },
  { label: '초고단가 FIRE/세무', rpm: 25.0, description: '세무/절세/은퇴설계 최고단가 타깃' },
];

export function AdMonetizationCard({ totalHits24h }: { totalHits24h: number }) {
  const [rpm, setRpm] = useState<number>(5.0);
  const [monthlyTargetKrw, setMonthlyTargetKrw] = useState<number>(1000000);
  const [exchangeRate, setExchangeRate] = useState<number>(1350);

  const stats = useMemo(() => {
    const curRpm = Math.max(0.1, rpm || 0.1);
    const target = Math.max(10000, monthlyTargetKrw || 10000);
    const fx = Math.max(1000, exchangeRate || 1350);

    // 1,000 PV당 원화 수익
    const krwPerThousandPv = curRpm * fx;

    // 월 목표 달성을 위한 필요 월간 PV
    const requiredMonthlyPv = Math.round((target / krwPerThousandPv) * 1000);

    // 일간 필요 PV
    const requiredDailyPv = Math.round(requiredMonthlyPv / 30);

    // 현재 24시간 실측 PV 기준 월간 예상 수익
    const estimatedDailyKrw = (totalHits24h / 1000) * krwPerThousandPv;
    const estimatedMonthlyKrw = Math.round(estimatedDailyKrw * 30);

    // 현재 달성률 %
    const achievementRate = Math.min(100, Number(((totalHits24h / (requiredDailyPv || 1)) * 100).toFixed(1)));

    return {
      krwPerThousandPv: Math.round(krwPerThousandPv),
      requiredMonthlyPv,
      requiredDailyPv,
      estimatedMonthlyKrw,
      achievementRate,
    };
  }, [rpm, monthlyTargetKrw, exchangeRate]);

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <DollarSign className="size-4" />
              </div>
              <CardTitle className="text-sm font-bold text-foreground">
                Google AdSense 광고 수익화 & 트래픽 관제 타워
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              v487 권위 기획서: 광고 전용 수익화(Ad-Only) 모델 및 월 100만 원 목표 시뮬레이터
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[11px] font-bold w-fit">
            순수 광고수익 모델 (유료재화/구독 0원 차단)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Preset Chips */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>산업군별 Page RPM 프리셋:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {RPM_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setRpm(p.rpm)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  rpm === p.rpm
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm'
                    : 'border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>${p.rpm.toFixed(2)}</span>
                <span className="font-normal opacity-80">({p.label})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rpmInput" className="text-xs font-semibold text-foreground">
              예상/실측 Page RPM ($)
            </Label>
            <Input
              id="rpmInput"
              type="number"
              min={0.1}
              max={100}
              step={0.5}
              value={rpm || ''}
              onChange={(e) => setRpm(Number(e.target.value))}
              className="font-mono h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetInput" className="text-xs font-semibold text-foreground">
              월간 목표 광고 수익 (KRW)
            </Label>
            <Input
              id="targetInput"
              type="number"
              min={10000}
              step={100000}
              value={monthlyTargetKrw || ''}
              onChange={(e) => setMonthlyTargetKrw(Number(e.target.value))}
              className="font-mono h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fxInput" className="text-xs font-semibold text-foreground">
              적용 환율 (USD/KRW)
            </Label>
            <Input
              id="fxInput"
              type="number"
              min={1000}
              step={10}
              value={exchangeRate || ''}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="font-mono h-9 text-xs"
            />
          </div>
        </div>

        {/* Results 4 Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1 text-center">
            <span className="text-[11px] text-muted-foreground font-semibold">1,000 PV당 수익</span>
            <div className="font-mono text-base sm:text-lg font-black text-foreground">
              {stats.krwPerThousandPv.toLocaleString()} <span className="text-xs font-normal">원</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              (${rpm.toFixed(2)} RPM 기준)
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1 text-center">
            <span className="text-[11px] text-emerald-500 font-semibold">월 100만 원 필요 월간 PV</span>
            <div className="font-mono text-base sm:text-lg font-black text-emerald-500">
              {stats.requiredMonthlyPv.toLocaleString()} <span className="text-xs font-normal">PV</span>
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">
              (일일 약 {stats.requiredDailyPv.toLocaleString()} PV)
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1 text-center">
            <span className="text-[11px] text-muted-foreground font-semibold">현재 24h 실측 트래픽</span>
            <div className="font-mono text-base sm:text-lg font-black text-foreground">
              {totalHits24h.toLocaleString()} <span className="text-xs font-normal">Hits</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              (크롤러 및 방문자 집계)
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1 text-center">
            <span className="text-[11px] text-amber-500 font-semibold">월 100만 원 트래픽 달성률</span>
            <div className="font-mono text-base sm:text-lg font-black text-amber-500">
              {stats.achievementRate}%
            </div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">
              (현재 트래픽 기준 예상: 월 {stats.estimatedMonthlyKrw.toLocaleString()}원)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>목표 트래픽 진행률 (일일 필요 PV {stats.requiredDailyPv.toLocaleString()} 대비)</span>
            <span className="text-emerald-500">{stats.achievementRate}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
              style={{ width: `${stats.achievementRate}%` }}
            />
          </div>
        </div>

        {/* Sensitive Route Fail-Closed Isolation Status */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span className="text-xs font-bold text-foreground">
                광고 안전 가드레일 (Fail-Closed Enforcement) 격리 현황
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              100% 완전 격리 중
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/60 border border-border/50 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>지갑/송금 (/wallet): <strong>차단</strong></span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/60 border border-border/50 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>은행/대출 (/bank): <strong>차단</strong></span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/60 border border-border/50 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>주식 매매 콘솔: <strong>차단</strong></span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/60 border border-border/50 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>카지노 7대 게임: <strong>차단</strong></span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/60 border border-border/50 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>관리자 관제 (/admin): <strong>차단</strong></span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>5대 계산기 & 가이드: <strong>노출 활성</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
