'use client';

import React, { useState } from 'react';
import { Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioShareCardModal } from './portfolio-share-card-modal';

interface PortfolioShareTriggerProps {
  readonly nickname?: string | undefined;
  readonly totalAssetValue: number;
  readonly totalProfitAmount: number;
  readonly profitRatePct: number;
  readonly topStockSymbol?: string | undefined;
  readonly holdingCount: number;
}

export function PortfolioShareTrigger({
  nickname,
  totalAssetValue,
  totalProfitAmount,
  profitRatePct,
  topStockSymbol,
  holdingCount,
}: PortfolioShareTriggerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md hover:shadow-emerald-500/20 gap-1.5 transition-all active:scale-[0.98]"
      >
        <Sparkles className="size-3.5 sm:size-4" />
        <span>1초 진단서 카드 공유</span>
      </Button>

      <PortfolioShareCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        nickname={nickname}
        totalAssetValue={totalAssetValue}
        totalProfitAmount={totalProfitAmount}
        profitRatePct={profitRatePct}
        topStockSymbol={topStockSymbol}
        holdingCount={holdingCount}
      />
    </>
  );
}
