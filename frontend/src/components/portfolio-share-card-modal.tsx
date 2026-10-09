'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Share2, Download, Copy, Check, Sparkles, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PortfolioShareCardModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly nickname?: string | undefined;
  readonly totalAssetValue: number;
  readonly totalProfitAmount: number;
  readonly profitRatePct: number;
  readonly topStockSymbol?: string | undefined;
  readonly holdingCount: number;
}

export function PortfolioShareCardModal({
  isOpen,
  onClose,
  nickname = '월덕 트레이더',
  totalAssetValue,
  totalProfitAmount,
  profitRatePct,
  topStockSymbol = 'WDG',
  holdingCount,
}: PortfolioShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [rendering, setRendering] = useState(true);

  const isProfit = profitRatePct >= 0;
  const grade = profitRatePct >= 20 ? 'S+' : profitRatePct >= 10 ? 'A' : profitRatePct >= 0 ? 'B' : 'C';

  useEffect(() => {
    if (!isOpen) return;
    setRendering(true);

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 800 x 960 고해상도 카드 렌더링
      const width = 800;
      const height = 960;
      canvas.width = width;
      canvas.height = height;

      // 1. 딥 옵시디언 배경
      ctx.fillStyle = '#090A0F';
      ctx.fillRect(0, 0, width, height);

      // 2. 미묘한 그리드 패턴 & 헤어라인 테두리
      ctx.strokeStyle = '#181C28';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 카드 외곽 헤어라인 보더
      ctx.strokeStyle = '#272E44';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // 상단 브랜드 바
      ctx.fillStyle = '#0F131E';
      ctx.fillRect(22, 22, width - 44, 90);
      ctx.strokeStyle = '#22283C';
      ctx.beginPath();
      ctx.moveTo(22, 112);
      ctx.lineTo(width - 22, 112);
      ctx.stroke();

      // 브랜드 로고 & 타이틀
      ctx.fillStyle = '#00F59B';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('WOLDEOK MONEYVERSE', 50, 75);

      ctx.fillStyle = '#8E9BB0';
      ctx.font = '14px monospace';
      ctx.fillText('OFFICIAL PORTFOLIO RECEIPT // 2026', 490, 75);

      // 중앙 사용자 프로필 영역
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(nickname, 50, 180);

      ctx.fillStyle = '#65738E';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`보유 종목수: ${holdingCount}개  ·  주력 종목: ${topStockSymbol}`, 50, 215);

      // 등급 뱃지
      ctx.fillStyle = isProfit ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 46, 91, 0.15)';
      ctx.fillRect(width - 150, 145, 100, 80);
      ctx.strokeStyle = isProfit ? '#00F59B' : '#FF2E5B';
      ctx.lineWidth = 2;
      ctx.strokeRect(width - 150, 145, 100, 80);

      ctx.fillStyle = isProfit ? '#00F59B' : '#FF2E5B';
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(grade, width - 100, 203);
      ctx.textAlign = 'left';

      // 구분선
      ctx.strokeStyle = '#1F2436';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 260);
      ctx.lineTo(width - 50, 260);
      ctx.stroke();

      // 핵심 메트릭 박스 1: 수익률
      ctx.fillStyle = '#111522';
      ctx.fillRect(50, 290, width - 100, 200);
      ctx.strokeStyle = '#272E44';
      ctx.strokeRect(50, 290, width - 100, 200);

      ctx.fillStyle = '#8E9BB0';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('PORTFOLIO YIELD RATE (수익률)', 80, 340);

      ctx.fillStyle = isProfit ? '#00F59B' : '#FF2E5B';
      ctx.font = 'bold 64px monospace';
      const profitRateStr = `${isProfit ? '+' : ''}${profitRatePct.toFixed(2)}%`;
      ctx.fillText(profitRateStr, 80, 420);

      // 핵심 메트릭 박스 2: 평가 금액 & 실현 손익
      ctx.fillStyle = '#111522';
      ctx.fillRect(50, 520, (width - 120) / 2, 170);
      ctx.strokeRect(50, 520, (width - 120) / 2, 170);

      ctx.fillStyle = '#8E9BB0';
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('총 평가 자산', 75, 565);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`${totalAssetValue.toLocaleString('ko-KR')} WLD`, 75, 625);

      ctx.fillStyle = '#111522';
      ctx.fillRect(width / 2 + 10, 520, (width - 120) / 2, 170);
      ctx.strokeRect(width / 2 + 10, 520, (width - 120) / 2, 170);

      ctx.fillStyle = '#8E9BB0';
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('평가 손익', width / 2 + 35, 565);

      ctx.fillStyle = isProfit ? '#00F59B' : '#FF2E5B';
      ctx.font = 'bold 28px monospace';
      const profitStr = `${totalProfitAmount >= 0 ? '+' : ''}${totalProfitAmount.toLocaleString('ko-KR')} WLD`;
      ctx.fillText(profitStr, width / 2 + 35, 625);

      // 인증 및 서명 구역
      ctx.fillStyle = '#0B0E17';
      ctx.fillRect(50, 720, width - 100, 110);
      ctx.strokeStyle = '#1D2336';
      ctx.strokeRect(50, 720, width - 100, 110);

      ctx.fillStyle = '#5A6882';
      ctx.font = '13px monospace';
      ctx.fillText('VERIFIED BY WOLDEOK INSTITUTIONAL LEDGER ENGINE', 75, 760);
      ctx.fillText(`BLOCK TIMESTAMP: ${new Date().toISOString()}  // HASH: 0x9f4a...b77f`, 75, 795);

      // 하단 푸터
      ctx.fillStyle = '#505E78';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('https://easy-scraping.com/stocks  ·  가상 주식 모의투자 거래소', 50, 895);

      setRendering(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, nickname, totalAssetValue, totalProfitAmount, profitRatePct, topStockSymbol, holdingCount]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `woldeok_pnl_receipt_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('포트폴리오 수익률 진단서 이미지를 다운로드했습니다.');
  };

  const handleCopyClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        toast.success('진단서 이미지가 클립보드에 복사되었습니다! SNS나 채팅방에 바로 붙여넣기(Ctrl+V)하세요.');
        setTimeout(() => setCopied(false), 2500);
      });
    } catch {
      handleDownload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-6 bg-[#090A0F] border border-zinc-800 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              1초 포트폴리오 수익률 진단서 공유
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            내 투자 성과와 보유 종목 분석을 담은 고해상도 인증 카드를 이미지로 생성했습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 캔버스 미리보기 */}
        <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex justify-center p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[460px] object-contain rounded-lg shadow-lg"
          />
          {rendering && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-zinc-400">
              진단서 렌더링 중...
            </div>
          )}
        </div>

        {/* 하단 버튼 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>월덕 거래소 원장 공인 인증</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyClipboard}
              className="text-xs h-9 px-3 gap-1.5 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copied ? '복사됨' : '이미지 복사'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              className="text-xs h-9 px-3.5 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
            >
              <Download className="size-3.5" />
              <span>PNG 다운로드</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
