'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CardAspect,
  drawViralCardToCanvas,
  downloadViralCardPng,
  copyViralCardToClipboard,
  ViralCardPayload,
} from '@/lib/viral-share-card';
import { Download, Copy, Share2, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ViralShareCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: ViralCardPayload;
}

export function ViralShareCardDialog({
  open,
  onOpenChange,
  payload,
}: ViralShareCardDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspect, setAspect] = useState<CardAspect>('square');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      drawViralCardToCanvas(canvasRef.current, payload, aspect);
    }
  }, [open, payload, aspect]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const safeTitle = payload.title.replace(/[^a-zA-Z0-9가-힣]/g, '_').slice(0, 20);
    await downloadViralCardPng(canvasRef.current, `moneyverse_${safeTitle}_card.png`);
    toast.success('진단 카드 이미지가 다운로드되었습니다.');
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const ok = await copyViralCardToClipboard(canvasRef.current);
    if (ok) {
      setIsCopied(true);
      toast.success('카드 이미지가 클립보드에 복사되었습니다. 카카오톡/디스코드에 붙여넣기(Ctrl+V)하세요!');
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      // 대체 다운로드 안내
      handleDownload();
    }
  };

  const handleCopyLink = () => {
    const url = payload.shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://easy-scraping.com');
    navigator.clipboard.writeText(url);
    setIsLinkCopied(true);
    toast.success('1초 무료 진단 링크가 복사되었습니다.');
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    const url = payload.shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://easy-scraping.com');
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: `[월덕 머니버스] ${payload.title} - ${payload.keyMetricLabel}: ${payload.keyMetricValue}`,
          url,
        });
      } catch {
        // 무시
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-zinc-950/95 border-zinc-800 text-zinc-100 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <DialogTitle className="text-lg font-bold">1초 진단 결과 바이럴 카드</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            오픈채팅, 카카오톡, 인스타그램, 디스코드에 공유하여 실시간 투자/자산 진단 결과를 자랑해 보세요.
          </DialogDescription>
        </DialogHeader>

        {/* 탭: 인스타/카톡 1:1 vs 오픈채팅/디스코드 16:9 */}
        <div className="flex items-center justify-between mt-2">
          <Tabs
            value={aspect}
            onValueChange={(val) => setAspect(val as CardAspect)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 bg-zinc-900 border border-zinc-800 h-9 p-1">
              <TabsTrigger value="square" className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
                인스타/카톡 (1:1 정사각)
              </TabsTrigger>
              <TabsTrigger value="wide" className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
                오픈채팅/디스코드 (16:9 와이드)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Canvas 프리뷰 컨테이너 */}
        <div className="relative my-3 rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900/50 flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[340px] object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* 하단 액션 버튼 그룹 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <Button
            onClick={handleCopyImage}
            variant="outline"
            className="h-10 text-xs font-semibold bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-100 flex items-center justify-center gap-1.5"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? '이미지 복사됨!' : '이미지 복사'}
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
            className="h-10 text-xs font-semibold bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-100 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            PNG 다운로드
          </Button>

          <Button
            onClick={handleNativeShare}
            className="col-span-2 sm:col-span-1 h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {isLinkCopied ? '링크 복사됨!' : '오픈채팅 공유'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
