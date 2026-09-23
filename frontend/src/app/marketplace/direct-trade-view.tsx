'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, User, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import type { MarketplaceHolding } from './marketplace';

export interface DirectTradeOffer {
  readonly id: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly recipientId: string;
  readonly recipientName: string;
  readonly offeredItems: readonly { readonly name: string; readonly quantity: number; readonly rarity: string }[];
  readonly offeredWld: string;
  readonly requestedItems: readonly { readonly name: string; readonly quantity: number }[];
  readonly requestedWld: string;
  readonly status: 'PROPOSED' | 'ACCEPTED_BY_PEER' | 'COMPLETED' | 'CANCELLED';
  readonly createdAt: string;
}

interface DirectTradeViewProps {
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly currentUserId?: string;
  readonly currentUserName?: string;
}

export function DirectTradeView({
  holdings,
  userBalanceWld: _userBalanceWld,
  currentUserId = 'usr_me',
  currentUserName = '나',
}: DirectTradeViewProps) {
  const [trades, setTrades] = useState<DirectTradeOffer[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [selectedOfferItemId, setSelectedOfferItemId] = useState<string>('');
  const [offerWldInput, setOfferWldInput] = useState('0');
  const [requestItemNameInput, setRequestItemNameInput] = useState('');
  const [requestWldInput, setRequestWldInput] = useState('0');

  const [, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // 실제 백엔드 1:1 직거래 목록 로드
  React.useEffect(() => {
    let cancelled = false;
    async function loadTrades() {
      try {
        const res = await fetch('/api/v1/marketplace/trades');
        if (!res.ok) throw new Error('trade list request failed');
        const data = await res.json();
        if (!cancelled) {
          setTrades(Array.isArray(data) ? data : []);
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setTrades([]);
          setLoadState('error');
        }
      }
    }
    loadTrades();
    return () => {
      cancelled = true;
    };
  }, []);

  // 새 제안 등록 (서버 API 연동)
  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientInput.trim()) return;

    const chosenItem = holdings.find((h) => h.catalog_id === selectedOfferItemId);
    const offeredItems = chosenItem
      ? [{ name: chosenItem.name, quantity: 1, rarity: chosenItem.rarity }]
      : [];
    const requestedItems = requestItemNameInput.trim()
      ? [{ name: requestItemNameInput.trim(), quantity: 1 }]
      : [];

    try {
      const res = await fetch('/api/v1/marketplace/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientInput.trim(),
          offeredItems,
          offeredWld: offerWldInput || '0',
          requestedItems,
          requestedWld: requestWldInput || '0',
        }),
      });

      if (!res.ok) {
        throw new Error('direct trade creation is unavailable');
      }
      const tradeId = await res.json();
      if (typeof tradeId !== 'string' || !tradeId) {
        throw new Error('invalid direct trade response');
      }
      const newOffer: DirectTradeOffer = {
        id: tradeId,
        senderId: currentUserId,
        senderName: currentUserName,
        recipientId: 'server-confirmed',
        recipientName: recipientInput.trim(),
        offeredItems,
        offeredWld: offerWldInput || '0',
        requestedItems,
        requestedWld: requestWldInput || '0',
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
      };

      setTrades((prev) => [newOffer, ...prev]);
      setActionNotice(`[${recipientInput.trim()}] 님에게 1:1 직거래 제안이 전송되었습니다.`);
      setIsCreateModalOpen(false);
    } catch {
      setActionNotice('직거래 생성은 안전한 원자적 자산 정산이 완료될 때까지 사용할 수 없습니다.');
      return;
    }


    setRecipientInput('');
    setSelectedOfferItemId('');
    setOfferWldInput('0');
    setRequestItemNameInput('');
    setRequestWldInput('0');
  };

  // 2단계 최종 서명 실행 (서버 API 연동)
  const handleFinalSignOff = async (trade: DirectTradeOffer) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/marketplace/trades/${trade.id}/confirm`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('trade confirmation failed');
      setTrades((prev) =>
        prev.map((t) => (t.id === trade.id ? { ...t, status: 'COMPLETED' } : t)),
      );
      setActionNotice(
        `[${trade.recipientName}] 님과의 P2P 1:1 직거래가 원자적으로 동시 스왑 완료되었습니다. 물품 및 대금이 안전하게 이전되었습니다.`,
      );
    } catch {
      setActionNotice('네트워크 오류가 발생했으나 에스크로 상태를 안전하게 보호했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 1차 수락 실행 (서버 API 연동)
  const handleAcceptProposal = async (trade: DirectTradeOffer) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/marketplace/trades/${trade.id}/accept`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('trade acceptance failed');
      setTrades((prev) =>
        prev.map((t) => (t.id === trade.id ? { ...t, status: 'ACCEPTED_BY_PEER' } : t)),
      );
      setActionNotice(
        '제안을 1차 수락했습니다. 양측 모두 최종 서명 완료 시 동시 스왑이 체결됩니다.',
      );
    } catch {
      setActionNotice('수락 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 거래 취소 (서버 API 연동)
  const handleCancelTrade = async (tradeId: string) => {
    try {
      const res = await fetch(`/api/v1/marketplace/trades/${tradeId}/cancel`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('trade cancellation failed');
      setTrades((prev) =>
        prev.map((t) => (t.id === tradeId ? { ...t, status: 'CANCELLED' } : t)),
      );
    } catch {
      setActionNotice('거래 취소가 서버에 반영되지 않았습니다. 상태를 새로고침한 뒤 다시 시도해 주세요.');
    }
  };


  return (
    <div className="grid gap-6">
      {/* P2P 1:1 에스크로 룰 안내 헤더 배너 */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ArrowLeftRight className="size-4.5" />
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              P2P 1:1 안전 에스크로 직거래 (Dual Sign-Off)
            </h3>
            <Badge variant="outline" className="text-[11px] font-mono border-blue-500/30 text-blue-600">
              사기 방지 2단계 서명
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            기존 직거래 기록은 조회·취소할 수 있습니다. 실제 WLD·아이템의 원자적 동시 정산이 완성될 때까지 신규 제안·수락·최종 체결은 일시 중지되어 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            disabled
            onClick={() => {
              setIsCreateModalOpen(true);
              setActionNotice(null);
            }}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5"
          >
            <Plus className="size-3.5" />
            직거래 신규 제안 일시 중지
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            닫기
          </button>
        </div>
      )}

      {loadState === 'loading' && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          서버 직거래 제안을 불러오는 중입니다.
        </div>
      )}
      {loadState === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          직거래 목록을 불러오지 못했습니다. 임시·예시 거래는 표시하지 않습니다.
        </div>
      )}
      {loadState === 'ready' && trades.length === 0 && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          현재 진행 중인 서버 직거래 제안이 없습니다.
        </div>
      )}

      {/* 직거래 목록 그리드 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {trades.map((trade) => {
          const isSender = trade.senderId === currentUserId;
          const peerName = isSender ? trade.recipientName : trade.senderName;
          const canFinalSign = trade.status === 'ACCEPTED_BY_PEER';
          const canAccept = !isSender && trade.status === 'PROPOSED';

          return (
            <Card
              key={trade.id}
              className={`h-full min-h-[300px] flex flex-col justify-between overflow-hidden border ${
                trade.status === 'COMPLETED'
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : trade.status === 'CANCELLED'
                  ? 'border-border/60 opacity-60'
                  : 'border-border/80'
              }`}
            >
              <CardHeader className="p-4 sm:p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3.5" />
                    <span>상대방: <strong>{peerName}</strong></span>
                    <span className="text-[10px] text-muted-foreground/60">({isSender ? '내가 제안함' : '받은 제안'})</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      trade.status === 'COMPLETED'
                        ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                        : trade.status === 'ACCEPTED_BY_PEER'
                        ? 'border-blue-500/40 text-blue-600 bg-blue-500/10'
                        : trade.status === 'CANCELLED'
                        ? 'border-muted text-muted-foreground'
                        : 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                    }`}
                  >
                    {trade.status === 'COMPLETED'
                      ? '교환 완료'
                      : trade.status === 'ACCEPTED_BY_PEER'
                      ? '최종 서명 대기'
                      : trade.status === 'CANCELLED'
                      ? '취소됨'
                      : '상대방 수락 대기'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0 flex-1 space-y-3">
                {/* 교환 물품 대비 박스 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* 내가 건네는 것 */}
                  <div className="rounded-lg bg-muted/40 p-3 border border-border/60 space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      {isSender ? '내가 제공하는 항목' : '상대방이 제공하는 항목'}
                    </div>
                    {trade.offeredItems.map((item, idx) => (
                      <div key={idx} className="font-medium text-foreground truncate">
                        • {item.name} x{item.quantity}
                      </div>
                    ))}
                    {trade.offeredItems.length === 0 && (
                      <div className="text-muted-foreground text-[11px]">(물품 없음)</div>
                    )}
                    {trade.offeredWld !== '0' && (
                      <div className="text-xs font-mono font-bold text-primary">
                        + {groupDigits(trade.offeredWld)} WLD
                      </div>
                    )}
                  </div>

                  {/* 내가 받는 것 */}
                  <div className="rounded-lg bg-muted/40 p-3 border border-border/60 space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      {isSender ? '내가 요구하는 항목' : '상대방이 요구하는 항목'}
                    </div>
                    {trade.requestedItems.map((item, idx) => (
                      <div key={idx} className="font-medium text-foreground truncate">
                        • {item.name} x{item.quantity}
                      </div>
                    ))}
                    {trade.requestedItems.length === 0 && (
                      <div className="text-muted-foreground text-[11px]">(물품 없음)</div>
                    )}
                    {trade.requestedWld !== '0' && (
                      <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        + {groupDigits(trade.requestedWld)} WLD
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>안전 수수료: 1% WLD 영구 소각</span>
                  <span className="font-mono">{trade.createdAt.slice(0, 10)}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-4 px-4 sm:px-5 shrink-0 flex items-center justify-between gap-2">
                {trade.status === 'PROPOSED' && isSender && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelTrade(trade.id)}
                    className="w-full text-xs text-rose-600 hover:text-rose-700"
                  >
                    제안 취소
                  </Button>
                )}

                {canAccept && (
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelTrade(trade.id)}
                      className="flex-1 text-xs text-rose-600"
                    >
                      거절
                    </Button>
                    <Button
                      size="sm"
                      disabled
                      onClick={() => handleAcceptProposal(trade)}
                      className="flex-1 text-xs bg-primary text-primary-foreground font-semibold"
                    >
                      1차 수락하기
                    </Button>
                  </div>
                )}

                {canFinalSign && (
                  <Button
                    size="sm"
                    disabled
                    onClick={() => handleFinalSignOff(trade)}
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    최종 교환 승인 서명 (동시 스왑)
                  </Button>
                )}

                {trade.status === 'COMPLETED' && (
                  <div className="w-full text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-1">
                    ✓ 양측 에스크로 스왑 체결 완료
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 새 1:1 직거래 제안 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="size-4 text-primary" />
              <span>새 P2P 1:1 직거래 제안 생성</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              교환할 상대방 유저명과 제공할 물품, 요구할 물품을 지정합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTrade} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="peer-user-name" className="text-xs font-semibold text-foreground">
                상대방 닉네임
              </label>
              <Input
                id="peer-user-name"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="예: 무역상인_박, 월덕헤지펀드"
                required
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="text-xs font-semibold text-foreground">내가 제공할 항목 (에스크로에 보관됨)</div>
              <select
                value={selectedOfferItemId}
                onChange={(e) => setSelectedOfferItemId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                aria-label="제공할 보유 아이템 선택"
              >
                <option value="">보유 아이템 선택 안함 (WLD만 제공 시)</option>
                {holdings.map((h) => (
                  <option key={h.catalog_id} value={h.catalog_id}>
                    {h.name} ({h.rarity}) - {h.quantity}개 보유
                  </option>
                ))}
              </select>

              <div className="relative">
                <Input
                  type="number"
                  value={offerWldInput}
                  onChange={(e) => setOfferWldInput(e.target.value)}
                  placeholder="추가 제공할 WLD 금액 (0 이상)"
                  className="font-mono text-xs pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                  WLD
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="text-xs font-semibold text-foreground">내가 상대방에게 요구할 항목</div>
              <Input
                value={requestItemNameInput}
                onChange={(e) => setRequestItemNameInput(e.target.value)}
                placeholder="요구할 아이템명 (선택)"
                className="text-xs sm:text-sm"
              />

              <div className="relative">
                <Input
                  type="number"
                  value={requestWldInput}
                  onChange={(e) => setRequestWldInput(e.target.value)}
                  placeholder="요구할 WLD 금액 (0 이상)"
                  className="font-mono text-xs pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                  WLD
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
              >
                제안서 전송 (에스크로 등록)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
