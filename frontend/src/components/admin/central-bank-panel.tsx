'use client';

import { useState } from 'react';
import { Landmark, TrendingUp, Percent, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CentralBankPanel() {
  const [baseRate, setBaseRate] = useState('3.25');
  const [targetInflation, setTargetInflation] = useState('2.0');
  const [reserveRatio, setReserveRatio] = useState('7.0');

  const [rateInput, setRateInput] = useState('3.25');
  const [ratioInput, setRatioInput] = useState('7.0');
  const [pendingAcceptance, setPendingAcceptance] = useState(true);

  const handleUpdateRate = () => {
    if (!rateInput || isNaN(Number(rateInput))) return;
    setBaseRate(Number(rateInput).toFixed(2));
  };

  const handleUpdateRatio = () => {
    if (!ratioInput || isNaN(Number(ratioInput))) return;
    setReserveRatio(Number(ratioInput).toFixed(1));
  };

  const handleAcceptBatch = () => {
    setPendingAcceptance(false);
  };

  // 테일러 룰 추정: 중립금리 2.0% + 목표인플레 2.0% = 3.50%
  const taylorRate = (2.0 + Number(targetInflation) + 0.5 * (Number(targetInflation) - 2.0)).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold tracking-tight">국가중앙은행 (Woldeok Central Bank)</h2>
          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30">
            통화 신용 정책 & 기준금리 최고 결정 기구
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          국가중앙은행은 화폐를 임의로 직접 찍어내지 않으며, 조폐국이 주조한 본원통화(M0)를 인수 승인하여 국고와 시중에 유통시킵니다.
          금융통화위원회를 통해 기준금리(Base Rate)와 시중은행 지급준비율을 결정하여 시중 M1/M2 유동성을 총괄 통제합니다.
        </p>
      </div>

      {/* M0, M1, M2 통화량 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">M0 (본원통화 인수량)</CardDescription>
            <CardTitle className="text-2xl font-mono text-amber-600">548,750,000 WLD</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">조폐국 주조 인수 총액 (소각 차감)</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">M1 (협의통화 / 현금+요구불)</CardDescription>
            <CardTitle className="text-2xl font-mono text-blue-600">987,750,000 WLD</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">즉시 결제 가능한 시중 유동성</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">M2 (광의통화 / 예적금 포함)</CardDescription>
            <CardTitle className="text-2xl font-mono text-indigo-600">2,370,600,000 WLD</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">시중 총 신용 창조 통화량</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">통화 승수 (Multiplier)</CardDescription>
            <CardTitle className="text-2xl font-mono text-emerald-600">4.32 배</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">M2 / M0 신용 창조 배율</span>
          </CardContent>
        </Card>
      </div>

      {/* 조폐국 화폐 인수 승인 (2단계 견제) */}
      <Card className="border-blue-200 dark:border-blue-900/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            국가조폐국 주조 화폐 인수 승인 (2단계 상호 견제 결재)
          </CardTitle>
          <CardDescription>
            조폐국이 신청한 신규 화폐 주조분을 중앙은행에서 심사하고 인수 승인하여 국고로 정식 편입합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAcceptance ? (
            <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-muted/40 rounded-lg border gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">인수 대기 번호: MINT-202610-002</Badge>
                  <span className="font-mono font-bold text-amber-600">50,000,000 WLD</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  사유: 가상 증시 활성화 통화 공급 증액 | 권종: 50,000 WLD | 신청처: 국가조폐국 인쇄창
                </p>
              </div>
              <Button onClick={handleAcceptBatch} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                <CheckCircle2 className="h-4 w-4 mr-1" /> 중앙은행 공식 인수 및 국고 방출 승인
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              모든 대기 주조 배치가 중앙은행에 공식 인수 승인되었습니다. 현재 미결재 주조 건 없음.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통화 신용 정책: 기준금리 & 지급준비율 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 기준금리 패널 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              국가 기준금리 (Base Interest Rate) 공시
            </CardTitle>
            <CardDescription>
              시중 상업은행의 예금/대출 우대금리 산출의 기준이 되는 최고 정책 금리입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded border">
              <div>
                <span className="text-xs text-muted-foreground block">현재 공시 기준금리</span>
                <span className="text-2xl font-mono font-bold text-primary">{baseRate}%</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">테일러 룰 추정 적정금리</span>
                <span className="text-lg font-mono text-emerald-600">{taylorRate}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.25"
                placeholder="예: 3.25"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
              />
              <Button onClick={handleUpdateRate} variant="outline">
                기준금리 변경 공시
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 지급준비율 패널 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              시중 상업은행 법정 지급준비율 (Reserve Requirement)
            </CardTitle>
            <CardDescription>
              상업은행(Bank)이 고객 예금 중 중앙은행 계좌에 의무 예치해야 하는 비율입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded border">
              <div>
                <span className="text-xs text-muted-foreground block">현재 법정 지급준비율</span>
                <span className="text-2xl font-mono font-bold text-indigo-600">{reserveRatio}%</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">시중은행 유동성 완충액</span>
                <span className="text-sm font-mono text-muted-foreground">약 69,142,500 WLD</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.5"
                placeholder="예: 7.0"
                value={ratioInput}
                onChange={(e) => setRatioInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
              />
              <Button onClick={handleUpdateRatio} variant="outline">
                지준율 규제 적용
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
