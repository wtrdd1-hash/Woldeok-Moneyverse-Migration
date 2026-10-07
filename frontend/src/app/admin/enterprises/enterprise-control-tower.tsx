'use client';

import { useState } from 'react';
import {
  Building2,
  Coins,
  TrendingUp,
  Zap,
  Globe2,
  Landmark,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { groupDigits } from '@/lib/money';

export interface StateEnterpriseItem {
  id: string;
  code: string;
  name: string;
  category: string;
  ceo_name: string;
  total_assets_wld: string;
  operating_revenue_hourly_wld: string;
  operating_cost_hourly_wld: string;
  net_profit_hourly_wld: string;
  dividend_rate_bps: number;
  eval_grade: string;
  eval_score: number;
  status: string;
  description: string;
}

export interface PrivateEnterpriseItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  stage: string;
  valuation_wld: string;
  revenue_hourly_wld: string;
  corporate_tax_rate_bps: number;
  tax_paid_total_wld: string;
  dividends_paid_total_wld: string;
  active: boolean;
}

export interface DividendLogItem {
  id: string;
  enterprise_id: string;
  enterprise_code: string;
  enterprise_name: string;
  dividend_amount_wld: string;
  revenue_wld: string;
  net_profit_wld: string;
  eval_grade: string;
  created_at: string;
}

export interface StateHoldingOverviewItem {
  holding_name: string;
  holding_code: string;
  total_soe_assets_wld: string;
  hourly_soe_revenue_wld: string;
  hourly_soe_profit_wld: string;
  hourly_soe_dividends_wld: string;
  total_private_enterprises: number;
  total_private_valuation_wld: string;
  hourly_corporate_tax_wld: string;
  governance_model: string;
}

interface Props {
  initialOverview: StateHoldingOverviewItem;
  initialSoes: StateEnterpriseItem[];
  initialPrivate: PrivateEnterpriseItem[];
  initialDividendLogs: DividendLogItem[];
}

function getGradeBadge(grade: string) {
  switch (grade) {
    case 'S':
      return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs">S등급 (최우수)</Badge>;
    case 'A':
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs">A등급 (우수)</Badge>;
    case 'B':
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs">B등급 (보통)</Badge>;
    case 'C':
      return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs">C등급 (개선권고)</Badge>;
    case 'D':
      return <Badge className="bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs">D등급 (경고)</Badge>;
    default:
      return <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs">E등급 (비상)</Badge>;
  }
}

function getStageBadge(stage: string) {
  switch (stage) {
    case 'IPO_LISTED':
      return <Badge className="bg-emerald-600/90 text-white text-[11px] font-mono">📈 WDX 상장</Badge>;
    case 'SERIES_B':
      return <Badge className="bg-blue-600/90 text-white text-[11px] font-mono">스케일업 B</Badge>;
    case 'SERIES_A':
      return <Badge className="bg-teal-600/90 text-white text-[11px] font-mono">시리즈 A</Badge>;
    default:
      return <Badge variant="outline" className="text-[11px] font-mono">초기 시드</Badge>;
  }
}

export function EnterpriseControlTower({
  initialOverview,
  initialSoes,
  initialPrivate,
  initialDividendLogs,
}: Props) {
  const [overview] = useState<StateHoldingOverviewItem>(initialOverview);
  const [soes, setSoes] = useState<StateEnterpriseItem[]>(initialSoes);
  const [privateEnterprises] = useState<PrivateEnterpriseItem[]>(initialPrivate);
  const [dividendLogs, setDividendLogs] = useState<DividendLogItem[]>(initialDividendLogs);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const handleHarvestDividends = async () => {
    setIsHarvesting(true);
    try {
      const res = await fetch('/api/admin/enterprises/harvest', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '배당 수취 실패');

      toast.success(
        `🏛️ 공기업 법정 배당금 수취 완료: +${Number(data.total_dividends_collected).toLocaleString('ko-KR')} WLD (국고 잔액: ${Number(data.treasury_balance_after).toLocaleString('ko-KR')} WLD)`,
      );

      // 즉시 로그 갱신
      const updatedLogs: DividendLogItem[] = soes.map((s) => ({
        id: crypto.randomUUID(),
        enterprise_id: s.id,
        enterprise_code: s.code,
        enterprise_name: s.name,
        dividend_amount_wld: ((BigInt(s.net_profit_hourly_wld) * BigInt(s.dividend_rate_bps)) / BigInt(10000)).toString(),
        revenue_wld: s.operating_revenue_hourly_wld,
        net_profit_wld: s.net_profit_hourly_wld,
        eval_grade: s.eval_grade,
        created_at: new Date().toISOString(),
      }));
      setDividendLogs((prev) => [...updatedLogs, ...prev].slice(0, 20));
    } catch (err: any) {
      toast.error(err.message || '공기업 배당금 수취 중 오류가 발생했습니다.');
    } finally {
      setIsHarvesting(false);
    }
  };

  const handleToggleStatus = async (soe: StateEnterpriseItem) => {
    const nextStatus = soe.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setLoadingCode(soe.code);
    try {
      const res = await fetch('/api/admin/enterprises/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: soe.code, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '상태 변경 실패');

      setSoes((prev) =>
        prev.map((item) => (item.code === soe.code ? { ...item, status: nextStatus } : item)),
      );
      toast.success(`${soe.name} 상태가 [${nextStatus}]로 변경되었습니다.`);
    } catch (err: any) {
      toast.error(err.message || '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setLoadingCode(null);
    }
  };

  return (
    <div className="grid gap-6">
      {/* 1. 월덱 국가투자공사(WSHC) 총괄 지배구조 헤더 배너 */}
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono text-[11px] text-primary border-primary/30">
                  {overview.holding_code}
                </Badge>
                <CardTitle className="text-lg font-bold tracking-tight">
                  {overview.holding_name}
                </CardTitle>
                <Badge className="bg-emerald-600 text-white text-[11px]">테마섹 하이브리드 모델</Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                정부 지분 100% 보유 국가투자공사가 공기업 및 전략 지분을 전문 경영하며, 정치적 개입 없이 배당 수익을 극대화하여 국고와 시민에게 환원합니다.
              </CardDescription>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground font-semibold"
                onClick={handleHarvestDividends}
                disabled={isHarvesting}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isHarvesting ? 'animate-spin' : ''}`} />
                공기업 배당 국고 즉시 수취
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-muted-foreground text-[11px]">공기업 총 운용 자산</div>
              <div className="mt-1 font-mono font-bold text-base text-foreground">
                {groupDigits(overview.total_soe_assets_wld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-muted-foreground text-[11px]">시간당 공기업 순이익</div>
              <div className="mt-1 font-mono font-bold text-base text-emerald-600">
                +{groupDigits(overview.hourly_soe_profit_wld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-muted-foreground text-[11px]">시간당 국고 배당 납입 (30%)</div>
              <div className="mt-1 font-mono font-bold text-base text-primary">
                +{groupDigits(overview.hourly_soe_dividends_wld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-muted-foreground text-[11px]">민간 기업 법인세 (15%)</div>
              <div className="mt-1 font-mono font-bold text-base text-blue-600">
                +{groupDigits(overview.hourly_corporate_tax_wld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 3대 국가 기간 공기업 (SOE) 카드 그리드 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">3대 국가 기간 공기업 (Core State-Owned Enterprises)</h3>
            <p className="text-xs text-muted-foreground">
              국가 인프라를 책임지는 에너지, 통신망, 국책은행 3대 공기업의 실시간 경영 지표 및 경영평가 현황
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {soes.length}개 공기업 가동 중
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {soes.map((soe) => {
            const hourlyDividend = (BigInt(soe.net_profit_hourly_wld) * BigInt(soe.dividend_rate_bps)) / BigInt(10000);
            return (
              <Card key={soe.code} className="border shadow-xs bg-card flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-mono font-medium text-muted-foreground">{soe.code}</span>
                    {getGradeBadge(soe.eval_grade)}
                  </div>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    {soe.code === 'SOE_POWER' && <Zap className="h-4 w-4 text-amber-500" />}
                    {soe.code === 'SOE_NET' && <Globe2 className="h-4 w-4 text-blue-500" />}
                    {soe.code === 'SOE_BANK' && <Landmark className="h-4 w-4 text-emerald-500" />}
                    {soe.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {soe.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="space-y-1.5 text-xs bg-muted/20 p-2.5 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">대표 경영관</span>
                      <span className="font-medium text-foreground">{soe.ceo_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">총 자산 규모</span>
                      <span className="font-mono font-semibold text-foreground">{groupDigits(soe.total_assets_wld)} WLD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">시간당 매출 / 순익</span>
                      <span className="font-mono text-emerald-600 font-semibold">
                        +{groupDigits(soe.operating_revenue_hourly_wld)} / +{groupDigits(soe.net_profit_hourly_wld)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-border/40">
                      <span className="text-muted-foreground">법정 국고 배당률</span>
                      <span className="font-mono font-bold text-primary">
                        {(soe.dividend_rate_bps / 100).toFixed(1)}% (+{groupDigits(hourlyDividend.toString())} WLD)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">운영 상태:</span>
                      <Badge
                        variant={soe.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={`text-[10px] ${soe.status === 'ACTIVE' ? 'bg-emerald-600' : ''}`}
                      >
                        {soe.status}
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5 gap-1"
                      onClick={() => handleToggleStatus(soe)}
                      disabled={loadingCode === soe.code}
                    >
                      <ShieldAlert className="h-3 w-3" />
                      {soe.status === 'ACTIVE' ? '일시 정지' : '정상 재가동'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. 민간 벤처 스타트업 및 WDX 상장 기업 포트폴리오 */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">민간 기업 및 벤처 스케일업 생태계 (Private Enterprises)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                AI 및 유저 창업가가 설립한 스타트업들이 성장하여 WDX 거래소에 자동 상장(IPO)되고, 법인세를 국고에 성실 납부합니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="font-mono">
                총 {privateEnterprises.length}개 기업 활동 중
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-5 sm:pt-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">심볼</TableHead>
                  <TableHead>기업명</TableHead>
                  <TableHead className="w-[110px]">섹터</TableHead>
                  <TableHead className="w-[110px]">성장 단계</TableHead>
                  <TableHead className="text-right w-[130px]">기업가치 (Valuation)</TableHead>
                  <TableHead className="text-right w-[120px]">시간당 매출</TableHead>
                  <TableHead className="text-right w-[110px]">법인세율</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {privateEnterprises.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {item.symbol}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.sector}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStageBadge(item.stage)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-xs text-foreground">
                      {groupDigits(item.valuation_wld)} WLD
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600 font-medium">
                      +{groupDigits(item.revenue_hourly_wld)} WLD
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {(item.corporate_tax_rate_bps / 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. 최근 공기업 법정 배당 국고 귀속 이력 */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 sm:p-5">
          <CardTitle className="text-base font-semibold">공기업 법정 배당 국고 귀속 감사 이력 (Authoritative Dividend Logs)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            3대 공기업이 당기순이익의 30%를 국가 중앙 금고(VAULT_MAIN)로 실시간 납입한 불변 이력 명세
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-5 sm:pt-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]">공기업 코드</TableHead>
                  <TableHead>공기업명</TableHead>
                  <TableHead className="w-[100px]">경영평가</TableHead>
                  <TableHead className="text-right w-[140px]">당기순이익</TableHead>
                  <TableHead className="text-right w-[140px]">국고 귀속 배당금</TableHead>
                  <TableHead className="text-right w-[140px]">일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividendLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      기록된 공기업 배당 이력이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  dividendLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs font-semibold">{log.enterprise_code}</TableCell>
                      <TableCell className="text-xs font-medium">{log.enterprise_name}</TableCell>
                      <TableCell>{getGradeBadge(log.eval_grade)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {groupDigits(log.net_profit_wld)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-primary">
                        +{groupDigits(log.dividend_amount_wld)} WLD
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono">
                        {new Date(log.created_at).toLocaleString('ko-KR', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
