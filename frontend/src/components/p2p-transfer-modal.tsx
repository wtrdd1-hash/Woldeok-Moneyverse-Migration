'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Search, CheckCircle2, User, Heart, Sparkles, AlertCircle } from 'lucide-react';

interface Recipient {
  userId: string;
  displayName: string;
}

const STICKERS = [
  { id: 'cheer', label: '🎉 축하해' },
  { id: 'coffee', label: '☕ 커피 한잔' },
  { id: 'debt', label: '💸 빚 청산' },
  { id: 'rocket', label: '🚀 떡상 기원' },
  { id: 'thanks', label: '❤️ 고마워' },
  { id: 'pizza', label: '🍕 맛있는 밥' },
];

export function P2PTransferModal({ triggerText = '스마트 P2P 송금' }: { triggerText?: string }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    recipientName: string;
    amount: string;
    message?: string | undefined;
    sticker?: string | undefined;
    txId: string;
  } | null>(null);


  // 수취인 검색 디바운스
  useEffect(() => {
    if (!searchQuery.trim() || selectedRecipient) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/transfers/search?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.recipients || []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedRecipient]);

  const handleTransfer = async () => {
    if (!selectedRecipient || !amount || Number(amount) <= 0) {
      setErrorMsg('수취인과 송금 금액(1 WLD 이상)을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/transfers/p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: selectedRecipient.userId,
          amount,
          message: message.trim() || undefined,
          sticker: selectedSticker || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || '송금 처리에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      setReceipt({
        recipientName: selectedRecipient.displayName,
        amount,
        message: message.trim() || undefined,
        sticker: selectedSticker || undefined,
        txId: data.transactionId || 'TX-' + Math.random().toString(36).slice(2, 9),
      });
    } catch (err: any) {
      setErrorMsg(err?.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedRecipient(null);
    setSearchQuery('');
    setAmount('');
    setMessage('');
    setSelectedSticker(null);
    setErrorMsg(null);
    setReceipt(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) handleReset(); }}>
      <DialogTrigger asChild>
        <Button className="h-10 px-4 font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10">
          <Send className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-border/60 bg-card/95 backdrop-blur-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">1:1 P2P 스마트 안심 송금</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                수수료 0원! 감사 메모와 귀여운 스티커를 동봉해 마음을 전하세요.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {receipt ? (
          /* 송금 완료 영수증 */
          <div className="py-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">송금 완료!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              수취인에게 실시간 알림이 발송되었습니다.
            </p>

            <div className="w-full mt-5 p-4 rounded-xl border border-border/50 bg-muted/20 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">받는 분</span>
                <span className="font-semibold text-foreground">{receipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">보낸 금액</span>
                <span className="font-mono font-bold text-primary text-base">{receipt.amount} WLD</span>
              </div>
              {receipt.message && (
                <div className="flex justify-between pt-1 border-t border-border/30">
                  <span className="text-muted-foreground text-xs">동봉 메시지</span>
                  <span className="text-xs font-medium text-foreground">{receipt.message}</span>
                </div>
              )}
              {receipt.sticker && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">스티커</span>
                  <Badge variant="outline" className="text-xs">{receipt.sticker}</Badge>
                </div>
              )}
            </div>

            <Button onClick={handleReset} className="w-full mt-6 h-11 rounded-xl font-bold">
              새로운 송금하기
            </Button>
          </div>
        ) : (
          /* 송금 폼 */
          <div className="space-y-4 pt-2">
            {/* 1. 수취인 검색 / 선택 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>받는 사람 (닉네임)</span>
                {selectedRecipient && (
                  <button
                    onClick={() => { setSelectedRecipient(null); setSearchQuery(''); }}
                    className="text-xs text-primary underline"
                  >
                    변경
                  </button>
                )}
              </label>

              {selectedRecipient ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-primary/40 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{selectedRecipient.displayName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{selectedRecipient.userId.slice(0, 8)}...</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    인증됨
                  </Badge>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="수취인 닉네임을 검색하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                  />
                  {/* 검색 결과 드롭다운 */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-44 overflow-y-auto rounded-xl border border-border/60 bg-popover/95 p-1 shadow-xl backdrop-blur-md">
                      {searchResults.map((user) => (
                        <button
                          key={user.userId}
                          type="button"
                          onClick={() => { setSelectedRecipient(user); setSearchResults([]); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="font-semibold text-foreground">{user.displayName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{user.userId.slice(0, 6)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isSearching && (
                    <div className="absolute right-3 top-3 text-[11px] text-muted-foreground animate-pulse">
                      검색 중...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. 금액 입력 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">송금 금액 (WLD)</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 font-mono text-base font-bold pr-14 rounded-xl"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-muted-foreground">WLD</span>
              </div>
              {/* 퀵 프리셋 버튼 */}
              <div className="flex gap-1.5 pt-1">
                {[10, 50, 100, 500].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(String(preset))}
                    className="h-7 text-xs px-2.5 rounded-lg border-border/40 font-mono"
                  >
                    +{preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* 3. 감사 메모 (선택) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">감사 메모 (선택)</label>
                <span className="text-[10px] text-muted-foreground">{message.length}/30자</span>
              </div>
              <Input
                placeholder="도박 빚 갚는다! / 커피 맛있게 마셔"
                maxLength={30}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            {/* 4. 스티커 동봉 (선택) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">감정 스티커 동봉</label>
              <div className="grid grid-cols-3 gap-1.5">
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => setSelectedSticker(selectedSticker === stk.label ? null : stk.label)}
                    className={`px-2 py-1.5 rounded-lg border text-xs text-center transition-all ${
                      selectedSticker === stk.label
                        ? 'border-blue-500 bg-blue-500/15 text-blue-400 font-bold ring-1 ring-blue-500/30'
                        : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    {stk.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 송금 버튼 */}
            <Button
              onClick={handleTransfer}
              disabled={isSubmitting || !selectedRecipient || !amount}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-2 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? '안심 송금 처리 중...' : `${amount ? Number(amount).toLocaleString() : 0} WLD 즉시 송금하기`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
