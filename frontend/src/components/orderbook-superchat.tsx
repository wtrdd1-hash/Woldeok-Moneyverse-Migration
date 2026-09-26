'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Volume2, Flame, Crown, MessageSquare, X } from 'lucide-react';

export interface SuperchatMessage {
  id: string;
  sender: string;
  amount: number;
  message: string;
  symbol?: string;
  timestamp: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

interface OrderbookSuperchatProps {
  currentSymbol?: string;
  onSendSuperchat?: (superchat: Omit<SuperchatMessage, 'id' | 'timestamp'>) => void;
  initialMessages?: SuperchatMessage[];
}

const DEFAULT_SUPERCHATS: SuperchatMessage[] = [
  {
    id: 'sc-1',
    sender: '월가고래',
    amount: 100000,
    message: '🚀 NVDA 오늘 목표가 180 돌파 가즈아! 전원 탑승 완료!',
    symbol: 'NVDA',
    timestamp: '방금 전',
    tier: 'diamond',
  },
  {
    id: 'sc-2',
    sender: '다이아핸즈',
    amount: 50000,
    message: '💎 삼성전자 반등 시그널 포착! 8만 전자 간다',
    symbol: '005930',
    timestamp: '1분 전',
    tier: 'gold',
  },
  {
    id: 'sc-3',
    sender: '도파민러너',
    amount: 10000,
    message: '🔥 비트코인 10만불 예측마켓 YES 풀매수 걸었습니다!',
    symbol: 'BTC',
    timestamp: '3분 전',
    tier: 'silver',
  },
];

export function OrderbookSuperchat({
  currentSymbol = 'ALL',
  onSendSuperchat,
  initialMessages = DEFAULT_SUPERCHATS,
}: OrderbookSuperchatProps) {
  const [messages, setMessages] = useState<SuperchatMessage[]>(initialMessages);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [amount, setAmount] = useState<number>(10000);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);
  const [showFirework, setShowFirework] = useState<boolean>(false);

  // Rotate ticker messages
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const getTier = (val: number): 'bronze' | 'silver' | 'gold' | 'diamond' => {
    if (val >= 100000) return 'diamond';
    if (val >= 50000) return 'gold';
    if (val >= 10000) return 'silver';
    return 'bronze';
  };

  const handleSend = () => {
    if (!messageText.trim()) return;
    const tier = getTier(amount);
    const newMsg: SuperchatMessage = {
      id: `sc-${Date.now()}`,
      sender: '나 (You)',
      amount,
      message: messageText,
      symbol: currentSymbol,
      timestamp: '방금 전',
      tier,
    };

    setMessages((prev) => [newMsg, ...prev]);
    setShowFirework(true);
    setTimeout(() => setShowFirework(false), 3000);

    if (onSendSuperchat) {
      onSendSuperchat({
        sender: '나 (You)',
        amount,
        message: messageText,
        symbol: currentSymbol,
        tier,
      });
    }

    setMessageText('');
    setIsModalOpen(false);
  };

  const currentMsg = messages[activeMessageIndex] || messages[0];

  return (
    <div className="w-full space-y-2">
      {/* Gold Fireworks Animation Overlay */}
      {showFirework && (
        <div
          data-testid="gold-firework-overlay"
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-amber-500/10 backdrop-blur-[1px] animate-pulse"
        >
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-amber-400 bg-slate-950/90 px-8 py-6 text-center shadow-2xl shadow-amber-500/50 animate-bounce">
            <Sparkles className="h-10 w-10 text-amber-300 animate-spin" />
            <div className="text-xl font-black text-amber-300">🎆 전 서버 골드 슈퍼챗 발송 완료! 🎆</div>
            <p className="text-xs text-amber-200">모든 트레이더의 호가창 상단에 방송되었습니다.</p>
          </div>
        </div>
      )}

      {/* Rolling Gold Firework Ticker */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/70 p-2.5 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="font-mono font-bold text-amber-400">
                [{currentMsg?.amount?.toLocaleString()} WLD]
              </span>
              <span className="font-semibold text-slate-200">{currentMsg?.sender}:</span>
              <span className="truncate text-slate-300">{currentMsg?.message}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-slate-950 shadow hover:from-amber-400 hover:to-amber-500 active:scale-95"
          >
            📣 슈퍼챗 쏘기
          </button>
        </div>
      </div>

      {/* Superchat Send Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="superchat-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900/95 p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 id="superchat-modal-title" className="text-base font-bold text-white">
                  호가창 실시간 골드 슈퍼챗
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="닫기"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300">슈퍼챗 후원 금액 (WLD)</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[5000, 10000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`rounded-lg border py-2 text-center text-xs font-bold transition-all ${
                        amount === val
                          ? 'border-amber-500 bg-amber-500 text-slate-950 shadow'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {val >= 10000 ? `${val / 10000}만` : `${val / 1000}천`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="superchat-input" className="block text-xs font-semibold text-slate-300">
                  전 서버 방송 메시지 (최대 50자)
                </label>
                <div className="relative mt-2">
                  <input
                    id="superchat-input"
                    type="text"
                    maxLength={50}
                    placeholder="모든 트레이더에게 전할 메시지를 입력하세요"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-500">
                    {messageText.length}/50
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="text-[11px] font-medium text-amber-300">전광판 미리보기</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-amber-400">
                    [{amount.toLocaleString()} WLD]
                  </span>
                  <span className="font-semibold text-white">나 (You):</span>
                  <span className="truncate text-slate-300">
                    {messageText || '메시지를 입력해주세요'}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!messageText.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-slate-950 shadow hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {amount.toLocaleString()} WLD 슈퍼챗 발송하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
