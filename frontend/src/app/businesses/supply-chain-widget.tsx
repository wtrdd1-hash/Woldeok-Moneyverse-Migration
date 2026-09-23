'use client';

import React, { useState } from 'react';
import { Package, TrendingUp, Warehouse, CheckCircle2 } from 'lucide-react';

interface SupplyChainWidgetProps {
  businessId?: string | undefined;
  businessName?: string | undefined;
  businessSymbol?: string | undefined;
}

export function SupplyChainWidget({
  businessName = '스마트 편의점',
  businessSymbol = 'CVS',
}: SupplyChainWidgetProps) {
  const [procureOpen, setProcureOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<'RAW_PACKAGED' | 'RAW_ENERGY'>('RAW_PACKAGED');
  const [procureQty, setProcureQty] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    materialName: string;
    quantity: number;
    totalCost: number;
    fee: number;
    newStock: number;
  } | null>(null);

  // Supply metrics simulation based on confirmed decisions
  const isPerishable = businessSymbol === 'CVS' || businessSymbol === 'FARM' || businessSymbol === 'KIOSK';
  const freshness = isPerishable ? 94 : 100;
  const storageCap = 500;
  const currentUsed = 140;
  const usagePercent = Math.min(100, Math.round((currentUsed / storageCap) * 100));

  const handleProcureSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const unitPrice = selectedMaterial === 'RAW_ENERGY' ? 120 : 50;
      const totalCost = unitPrice * procureQty;
      const fee = Math.floor(totalCost * 0.02); // 2% Hard Sink
      setLastReceipt({
        materialName: selectedMaterial === 'RAW_ENERGY' ? '운영 연료 및 전력 팩' : '포장 상품 및 부자재',
        quantity: procureQty,
        totalCost,
        fee,
        newStock: (selectedMaterial === 'RAW_ENERGY' ? 60 : 80) + procureQty,
      });
      setProcureOpen(false);
      setReceiptOpen(true);
    }, 600);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card/95 via-card/80 to-card/60 p-4 sm:p-6 shadow-sm backdrop-blur-md mb-6">
      {/* 앰비언트 글로우 배경 */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />

      {/* 헤더 섹션 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              B2B 실시간 공급망 루프
            </span>
            <span className="text-xs text-muted-foreground">KST 04:00 갱신</span>
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-bold tracking-tight text-foreground">
            {businessName} 원자재 조달 및 창고 현황
          </h3>
        </div>

        {/* 퀵 액션 버튼 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProcureOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all min-h-[44px]"
          >
            <Package className="h-4 w-4" />
            원자재 조달
          </button>
        </div>
      </div>

      {/* 3열 대시보드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 카드 1: 창고 보관 용량 */}
        <div className="rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Warehouse className="h-3.5 w-3.5 text-sky-500" />
              창고 보관 용량
            </span>
            <span className="font-semibold text-foreground">{usagePercent}% 점유</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">{currentUsed}</span>
            <span className="text-xs text-muted-foreground font-medium">/ {storageCap} SKU</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            용량 초과 시 엄격 차단 (Fail-Closed) 정책 적용 중
          </p>
        </div>

        {/* 카드 2: 주요 재고 품목 및 신선도 */}
        <div className="rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Package className="h-3.5 w-3.5 text-emerald-500" />
              품목별 보유 재고
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              신선도 {freshness}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                포장 상품/부자재
              </span>
              <span className="font-bold text-foreground">80개 (단가 50 WLD)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                운영 연료/전력 팩
              </span>
              <span className="font-bold text-foreground">60개 (단가 120 WLD)</span>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {isPerishable ? '72시간 경과 후 선택적 10~20% 감가상각 적용' : '공산품 영구 신선도 100% 보존'}
          </p>
        </div>

        {/* 카드 3: 도시/시즌 수요 계수 */}
        <div className="rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              도시·시즌 유효 수요
            </span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">+15.5% 활황</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">1.155×</span>
            <span className="text-xs text-muted-foreground font-medium">수요 배율</span>
          </div>
          {/* 미니 SVG 스파크라인 트렌드 차트 */}
          <div className="h-7 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,18 Q20,14 40,16 T80,8 T100,5 L100,24 L0,24 Z"
                fill="url(#demandGrad)"
              />
              <path
                d="M0,18 Q20,14 40,16 T80,8 T100,5"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            새벽 04:00 거시 지표 리셋 및 1시간 완만 반영
          </p>
        </div>
      </div>

      {/* 조달 팝업 모달 */}
      {procureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h4 className="text-base font-bold text-foreground">시스템 NPC 도매처 원자재 조달</h4>
              </div>
              <button
                type="button"
                onClick={() => setProcureOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  조달 품목 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial('RAW_PACKAGED')}
                    className={`rounded-xl border p-3 text-left transition-all min-h-[44px] ${
                      selectedMaterial === 'RAW_PACKAGED'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border/60 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="text-xs font-semibold">포장 상품/부자재</div>
                    <div className="text-xs text-muted-foreground mt-0.5">단가 50 WLD</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial('RAW_ENERGY')}
                    className={`rounded-xl border p-3 text-left transition-all min-h-[44px] ${
                      selectedMaterial === 'RAW_ENERGY'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border/60 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="text-xs font-semibold">운영 연료/전력 팩</div>
                    <div className="text-xs text-muted-foreground mt-0.5">단가 120 WLD</div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-muted-foreground">조달 수량</span>
                  <span className="text-foreground">{procureQty}개</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={procureQty}
                  onChange={(e) => setProcureQty(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>5개</span>
                  <span>50개</span>
                  <span>100개</span>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-3.5 space-y-1.5 text-xs border border-border/40">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 예정 WLD</span>
                  <span className="font-bold text-foreground">
                    {((selectedMaterial === 'RAW_ENERGY' ? 120 : 50) * procureQty).toLocaleString()} WLD
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>통화량 소각 (2% Hard Sink)</span>
                  <span className="font-semibold">
                    {Math.floor(((selectedMaterial === 'RAW_ENERGY' ? 120 : 50) * procureQty) * 0.02).toLocaleString()} WLD
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                  <span>조달 후 예상 재고</span>
                  <span>
                    {(selectedMaterial === 'RAW_ENERGY' ? 60 : 80) + procureQty} / {storageCap} SKU
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProcureOpen(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs sm:text-sm font-semibold hover:bg-muted min-h-[44px]"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcureSubmit}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 min-h-[44px]"
              >
                {isProcessing ? '처리 중...' : '원자재 조달 확정'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스풍 핀테크 영수증 슬라이드업 모달 */}
      {receiptOpen && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            {/* 상단 샴페인 골드 축하 아이콘 */}
            <div className="flex flex-col items-center text-center pb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                조달 결제 및 입고 완료
              </span>
              <h4 className="text-xl font-extrabold text-foreground mt-1">
                {lastReceipt.totalCost.toLocaleString()} WLD
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lastReceipt.materialName} {lastReceipt.quantity}개가 안전하게 창고에 입고되었습니다.
              </p>
            </div>

            {/* 영수증 명세 카드 */}
            <div className="rounded-2xl bg-muted/40 border border-border/50 p-4 space-y-2 text-xs mb-5">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">조달 품목</span>
                <span className="font-semibold text-foreground">{lastReceipt.materialName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">입고 수량</span>
                <span className="font-semibold text-foreground">{lastReceipt.quantity}개</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">영구 소각세 (2% Hard Sink)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {lastReceipt.fee.toLocaleString()} WLD
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">창고 총 보유 재고</span>
                <span className="font-extrabold text-foreground">{lastReceipt.newStock}개</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReceiptOpen(false)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 min-h-[44px]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
