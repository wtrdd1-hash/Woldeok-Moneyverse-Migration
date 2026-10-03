'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Smile,
  Frown,
  AlertCircle,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  loadTradeDiaryEntries,
  saveTradeDiaryEntry,
  deleteTradeDiaryEntry,
  type TradeDiaryEntry,
  type TradeReasonTag,
  type TradeEmotionTag,
} from '@/lib/trade-diary';
import { formatWld, formatMoment } from '@/lib/money';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { TranslatedText as T } from '@/components/translated-text';

const REASON_OPTIONS: readonly TradeReasonTag[] = [
  '공시/호재',
  '기술적돌파',
  '물타기/평단관리',
  '수익실현',
  '손절매',
  '섹터분산',
  '뇌동매매',
];

const EMOTION_OPTIONS: readonly TradeEmotionTag[] = [
  '냉정/계획적',
  '자신감',
  '차분함',
  '불안/초조',
  '패닉/공포',
];

export function TradeDiaryDrawer() {
  const [entries, setEntries] = useState<readonly TradeDiaryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState('WDG');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('1450');
  const [quantity, setQuantity] = useState('10');
  const [reasonTag, setReasonTag] = useState<TradeReasonTag>('공시/호재');
  const [emotionTag, setEmotionTag] = useState<TradeEmotionTag>('냉정/계획적');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    setEntries(loadTradeDiaryEntries());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !price || !quantity) return;

    saveTradeDiaryEntry({
      symbol: symbol.toUpperCase(),
      side,
      price,
      quantity,
      executedAt: new Date().toISOString(),
      reasonTag,
      emotionTag,
      reviewNote: reviewNote.trim() || '매매 계획에 따른 원칙 실행.',
    });

    setEntries(loadTradeDiaryEntries());
    setReviewNote('');
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTradeDiaryEntry(id);
    setEntries(loadTradeDiaryEntries());
  };

  return (
    <section aria-labelledby="trade-diary-heading" className="w-full">
      <div className="rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 shadow-sm backdrop-blur-md space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 id="trade-diary-heading" className="text-base font-extrabold text-foreground flex items-center gap-2">
                <T korean="투자 거래일지 & 매매 복기 다이어리" english="Trade Diary & Execution Review" />
                <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] font-bold">
                  +75 XP
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                <T
                  korean="매매 근거, 심리 상태 및 복기 노트를 기록하여 뇌동매매를 방지하고 시장 숙련도를 높이세요."
                  english="Record entry rationale and emotional discipline to cultivate consistent profitability."
                />
              </p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-primary text-primary-foreground shadow-xs">
                <PlusCircle className="size-4" />
                <T korean="새 거래일지 작성" english="New Trade Log" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl p-6 bg-card border-border shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="size-4 text-amber-500" />
                  <T korean="매매 복기 및 거래일지 기록" english="Record Trade Review" />
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSave} className="space-y-3.5 pt-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      <T korean="종목 티커" english="Symbol" />
                    </label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      required
                      className="w-full h-9 px-3 text-xs font-mono font-bold rounded-xl border border-border bg-background text-foreground uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      <T korean="매매 구분" english="Side" />
                    </label>
                    <select
                      value={side}
                      onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
                      className="w-full h-9 px-2 text-xs font-bold rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="buy">매수 (BUY)</option>
                      <option value="sell">매도 (SELL)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      <T korean="체결 단가 (WLD)" english="Price" />
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="1"
                      className="w-full h-9 px-3 text-xs font-mono font-bold rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      <T korean="수량 (주)" english="Quantity" />
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      min="1"
                      className="w-full h-9 px-3 text-xs font-mono font-bold rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      <T korean="매매 근거" english="Reason Tag" />
                    </label>
                    <select
                      value={reasonTag}
                      onChange={(e) => setReasonTag(e.target.value as TradeReasonTag)}
                      className="w-full h-9 px-2 text-xs rounded-xl border border-border bg-background text-foreground"
                    >
                      {REASON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      <T korean="심리 상태" english="Emotion Tag" />
                    </label>
                    <select
                      value={emotionTag}
                      onChange={(e) => setEmotionTag(e.target.value as TradeEmotionTag)}
                      className="w-full h-9 px-2 text-xs rounded-xl border border-border bg-background text-foreground"
                    >
                      {EMOTION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    <T korean="매매 복기 및 자기 피드백 (필수)" english="Review Note & Self-Feedback" />
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="왜 이 타이밍에 진입/청산했는지, 계획대로 실행되었는지 기록하세요..."
                    rows={3}
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-background text-foreground resize-none leading-relaxed"
                  />
                </div>

                <DialogFooter className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="rounded-xl text-xs">
                    <T korean="취소" english="Cancel" />
                  </Button>
                  <Button type="submit" size="sm" className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
                    <T korean="일지 저장하기" english="Save Entry" />
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Entries Timeline List */}
        {entries.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed border-border/80">
            <p className="text-xs text-muted-foreground">
              <T korean="작성된 거래일지가 없습니다. 우측 상단 버튼을 눌러 첫 거래일지를 기록해 보세요." english="No diary entries yet. Record your first trade reflection." />
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry) => {
              const isBuy = entry.side === 'buy';
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline" className="font-mono font-bold text-foreground">
                        {entry.symbol}
                      </Badge>
                      <Badge
                        className={`font-bold text-[10px] ${
                          isBuy ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isBuy ? '매수 BUY' : '매도 SELL'} · {formatWld(entry.price)} ({entry.quantity}주)
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-medium text-amber-400">
                        #{entry.reasonTag}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-medium text-muted-foreground">
                        {entry.emotionTag}
                      </Badge>
                    </div>

                    <p className="text-xs text-foreground font-medium leading-relaxed [word-break:keep-all]">
                      {entry.reviewNote}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                      <Calendar className="size-3" />
                      <span>{formatMoment(entry.executedAt)}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-500 self-end sm:self-auto shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
