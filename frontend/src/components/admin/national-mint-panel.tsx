'use client';

import { useState } from 'react';
import { Award, Coins, Flame, PlusCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface MintBatchItem {
  id: string;
  batchNumber: string;
  amountWld: string;
  denomination: string;
  productionCostWld: string;
  seigniorageWld: string;
  status: 'PENDING_CENTRAL_BANK_ACCEPTANCE' | 'ACCEPTED_BY_CENTRAL_BANK' | 'REJECTED';
  mintReason: string;
  verificationHash: string;
  createdAt: string;
}

export function NationalMintPanel() {
  const [batches, setBatches] = useState<MintBatchItem[]>([
    {
      id: 'mint-001',
      batchNumber: 'MINT-202610-001',
      amountWld: '500,000,000',
      denomination: '10,000 WLD 권종',
      productionCostWld: '10,000',
      seigniorageWld: '499,990,000',
      status: 'ACCEPTED_BY_CENTRAL_BANK',
      mintReason: '창립 본원통화(M0) 초도 주조',
      verificationHash: 'sha256:7f83b165...126d9069',
      createdAt: '2026-10-01',
    },
    {
      id: 'mint-002',
      batchNumber: 'MINT-202610-002',
      amountWld: '50,000,000',
      denomination: '50,000 WLD 권종',
      productionCostWld: '5,000',
      seigniorageWld: '49,995,000',
      status: 'PENDING_CENTRAL_BANK_ACCEPTANCE',
      mintReason: '가상 증시 활성화 통화 공급 증액',
      verificationHash: 'sha256:3a91c784...89ee01b2',
      createdAt: '2026-10-14',
    },
  ]);

  const [amountInput, setAmountInput] = useState('');
  const [costInput, setCostInput] = useState('1000');
  const [reasonInput, setReasonInput] = useState('');

  const handleCreateBatch = () => {
    if (!amountInput || isNaN(Number(amountInput))) return;
    const amt = Number(amountInput);
    const cost = Number(costInput) || 0;
    const seigniorage = Math.max(0, amt - cost);

    const newBatch: MintBatchItem = {
      id: `mint-${Date.now()}`,
      batchNumber: `MINT-202610-00${batches.length + 1}`,
      amountWld: amt.toLocaleString(),
      denomination: '10,000 WLD 권종',
      productionCostWld: cost.toLocaleString(),
      seigniorageWld: seigniorage.toLocaleString(),
      status: 'PENDING_CENTRAL_BANK_ACCEPTANCE',
      mintReason: reasonInput || '시장 유동성 공급 주조',
      verificationHash: `sha256:mock${Date.now().toString(16)}...hash`,
      createdAt: '2026-10-14',
    };

    setBatches([newBatch, ...batches]);
    setAmountInput('');
    setReasonInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold tracking-tight">국가조폐국 (National Mint Bureau)</h2>
          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
            화폐 주조 & 소각 독점 기관
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          국가조폐국은 본원통화(M0)의 물리적·기술적 주조(Minting) 및 영구 소각(Destroy) 증적 발급만을 전담합니다. 
          조폐국은 은행업(예대마진) 및 금리 결정 권한이 없으며, 주조된 화폐는 국가중앙은행의 정식 인수를 거쳐야만 시장에 유통됩니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">총 주조 본원통화 (M0)</CardDescription>
            <CardTitle className="text-2xl font-mono text-amber-600">550,000,000 WLD</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">누적 2개 주조 배치 완료</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">누적 주조차익 (Seigniorage)</CardDescription>
            <CardTitle className="text-2xl font-mono text-emerald-600">549,985,000 WLD</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">액면가 대비 제작비용 제외 국고 이전분</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">누적 영구 소각 (Destroy / Sinks)</CardDescription>
            <CardTitle className="text-2xl font-mono text-rose-600">1,250,000 WLD</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">세금 및 경매 수수료 공인 영구 소각</span>
          </CardContent>
        </Card>
      </div>

      {/* 신규 주조 요청 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-primary" />
            신규 본원통화(M0) 화폐 주조 발행 신청
          </CardTitle>
          <CardDescription>
            주조된 화폐는 즉시 유통되지 않으며, [중앙은행 인수 대기] 상태로 등록된 후 중앙은행 총재 결재 시 국고로 방출됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">주조 수량 (WLD)</label>
              <input
                type="number"
                placeholder="예: 10000000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">제작 원가 (WLD)</label>
              <input
                type="number"
                placeholder="1000"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">주조 사유</label>
              <input
                type="text"
                placeholder="예: 4분기 유동성 보강"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateBatch} className="w-full">
                M0 주조 신청
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주조 배치 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            조폐국 화폐 주조 배치 및 중앙은행 인수 감사 원장
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>배치 번호</TableHead>
                <TableHead>권종</TableHead>
                <TableHead className="text-right">주조 수량</TableHead>
                <TableHead className="text-right">주조차익 (Seigniorage)</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>위변조 검증 해시</TableHead>
                <TableHead>발행일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono font-medium">{b.batchNumber}</TableCell>
                  <TableCell className="text-xs">{b.denomination}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-amber-600">{b.amountWld} WLD</TableCell>
                  <TableCell className="text-right font-mono text-emerald-600">{b.seigniorageWld} WLD</TableCell>
                  <TableCell>
                    {b.status === 'ACCEPTED_BY_CENTRAL_BANK' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                        중앙은행 인수 완료
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 animate-pulse">
                        중앙은행 승인 대기
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.verificationHash}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
