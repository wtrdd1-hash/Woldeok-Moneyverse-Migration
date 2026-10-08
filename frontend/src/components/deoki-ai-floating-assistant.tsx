'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  X,
  Send,
  HelpCircle,
  Coins,
  RefreshCw,
} from 'lucide-react';

interface AssetSummary {
  cash: number;
  savings: number;
  stocks: number;
  bonds: number;
  total: number;
  stockCount: number;
  topStockSymbol: string | null;
  topStockRatio: number;
}

interface RebalanceSuggestion {
  assetClass: string;
  currentRatio: number;
  targetRatio: number;
  action: 'BUY' | 'SELL' | 'HOLD' | 'DEPOSIT';
  advice: string;
}

interface DeokiDiagnosis {
  id: string;
  userId: string;
  prIndex: number;
  riskLevel: 'VERY_LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  assetSummary: AssetSummary;
  diagnosticNotes: string[];
  rebalanceSuggestions: RebalanceSuggestion[];
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'deoki' | 'user';
  text: string;
  tips?: string[];
}

export function DeokiAiFloatingAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [diagnosis, setDiagnosis] = useState<DeokiDiagnosis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 4초 후 말풍선 툴팁 자동 닫힘 (화면 가림 및 UI 겹침 방지)
  useEffect(() => {
    const timer = setTimeout(() => {
      setTooltipVisible(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const fetchDiagnosis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/advisor/deoki/diagnose');
      const data = await res.json();
      if (data.success && data.diagnosis) {
        setDiagnosis(data.diagnosis);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !diagnosis) {
      fetchDiagnosis();
    }
  }, [isOpen, diagnosis]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setAsking(true);

    try {
      const res = await fetch('/api/advisor/deoki/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText }),
      });
      const data = await res.json();
      if (data.success) {
        const deokiMsg: ChatMessage = {
          id: `d-${Date.now()}`,
          sender: 'deoki',
          text: data.answer,
          tips: data.tips,
        };
        setChatMessages((prev) => [...prev, deokiMsg]);
      } else {
        const errMsg: ChatMessage = {
          id: `d-${Date.now()}`,
          sender: 'deoki',
          text: '꽥! 일시적인 오류로 조언을 전달하지 못했어요. 다시 시도해주세요!',
        };
        setChatMessages((prev) => [...prev, errMsg]);
      }
    } catch {
      const errMsg: ChatMessage = {
        id: `d-${Date.now()}`,
        sender: 'deoki',
        text: '꽥! 통신 중 문제가 발생했습니다.',
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setAsking(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'VERY_LOW':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">안전형 (VERY LOW)</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold">균형형 (MODERATE)</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">주의 필요 (HIGH)</span>;
      case 'CRITICAL':
      default:
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">위험 몰빵 (CRITICAL)</span>;
    }
  };

  // /chat 또는 /admin 등 전용 콘솔 및 1:1 대화 화면에서는 플로팅 위젯 중복 비활성화
  if (pathname === '/chat' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* 화면 우측 하단 플로팅 버튼 및 말풍선 (고객지원 버튼 좌측에 나란히 정렬) */}
      <div className="fixed bottom-20 right-17 sm:bottom-6 sm:right-22 z-40 flex flex-col items-end pointer-events-auto">
        {tooltipVisible && !isOpen && (
          <div className="mb-2 p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 shadow-xl backdrop-blur-md text-xs text-amber-200 flex items-center gap-2 max-w-[210px] animate-bounce duration-1000">
            <span className="text-base">🦆</span>
            <span className="leading-tight text-[11px]">
              <strong>AI 덕이</strong>가 내 자산 PR-Index 진단해 드려요!
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTooltipVisible(false);
              }}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTooltipVisible(false);
          }}
          className="group relative size-12 sm:size-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-xl shadow-amber-500/25 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-amber-300/40"
          aria-label="AI 금융 비서 덕이"
        >
          {/* 오리 캐릭터 SVG */}
          <svg viewBox="0 0 36 36" className="size-7 sm:size-8 fill-current text-zinc-950">
            <path d="M18 4C13.58 4 10 7.58 10 12c0 2.22.9 4.22 2.36 5.67C9.78 19.38 8 22.48 8 26c0 3.31 2.69 6 6 6h8c4.42 0 8-3.58 8-8 0-4.08-2.61-7.55-6.28-8.82C24.87 14.15 25.5 13.12 25.5 12c0-4.42-3.58-8-7.5-8zM15 10c.83 0 1.5.67 1.5 1.5S15.83 13 15 13s-1.5-.67-1.5-1.5S14.17 10 15 10zm11.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            <path d="M22 13c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2s.9-2 2-2h4c1.1 0 2 .9 2 2z" className="text-orange-900 fill-orange-700" />
          </svg>
          <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-zinc-950 flex items-center justify-center">
            <span className="size-1 rounded-full bg-zinc-950 animate-ping" />
          </span>
        </button>
      </div>

      {/* 대화형 금융 진단 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
            {/* 상단 헤더 */}
            <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-amber-950/30 via-zinc-900/50 to-orange-950/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-zinc-950 font-bold shrink-0 shadow-md">
                  <span className="text-xl">🦆</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    AI 전속 금융 비서 덕이 (Deoki)
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      LIVE 진단
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    포트폴리오 리스크 인덱스(PR-Index) & 1:1 맞춤형 자산 리밸런싱
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
              {loading ? (
                <div className="py-16 text-center text-xs text-zinc-500 font-mono">
                  덕이가 주인님의 포트폴리오를 꼼꼼히 점검하고 있어요... 🦆
                </div>
              ) : (
                <>
                  {/* PR-Index 대시보드 카드 */}
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        포트폴리오 안전 지수 (PR-Index)
                      </span>
                      {diagnosis && getRiskBadge(diagnosis.riskLevel)}
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-mono font-extrabold text-amber-400 tabular-nums">
                        {diagnosis?.prIndex || 50}
                      </span>
                      <span className="text-sm font-mono text-zinc-500">/ 100점</span>
                      <span className="text-xs text-zinc-400 ml-auto">
                        총 자산: <strong className="text-white font-mono">{diagnosis?.assetSummary.total.toLocaleString()} WLD</strong>
                      </span>
                    </div>

                    {/* 프로그레스 게이지 */}
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          (diagnosis?.prIndex || 50) >= 80
                            ? 'bg-emerald-500'
                            : (diagnosis?.prIndex || 50) >= 60
                            ? 'bg-cyan-500'
                            : (diagnosis?.prIndex || 50) >= 35
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${diagnosis?.prIndex || 50}%` }}
                      />
                    </div>

                    {/* 자산 비중 요약 */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center text-xs">
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block">현금/예금</span>
                        <span className="font-mono font-bold text-zinc-200">
                          {diagnosis
                            ? `${Math.round(((diagnosis.assetSummary.cash + diagnosis.assetSummary.savings) / diagnosis.assetSummary.total) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block">가상 주식</span>
                        <span className="font-mono font-bold text-amber-400">
                          {diagnosis
                            ? `${Math.round((diagnosis.assetSummary.stocks / diagnosis.assetSummary.total) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block">국가지정 국채</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {diagnosis
                            ? `${Math.round((diagnosis.assetSummary.bonds / diagnosis.assetSummary.total) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 덕이의 실시간 처방전 */}
                  {diagnosis?.diagnosticNotes && diagnosis.diagnosticNotes.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-800/30 space-y-2">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>🦆</span> 덕이의 맞춤형 자산 처방전
                      </h4>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {diagnosis.diagnosticNotes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 덕이와의 1:1 대화 로그 */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      덕이와의 금융 상담 채팅
                    </h4>

                    {chatMessages.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                        <p>
                          꽥! 궁금한 점이 있으신가요? 주식 포트폴리오 진단, 리스크 관리, 절세 팁 등 무엇이든 물어보세요!
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            '내 주식 포트폴리오 분석해줘',
                            '단일 종목 몰빵 리스크 어때?',
                            '고래 카피 트레이딩 어떻게 해?',
                            '거래세 절세 방법 알려줘',
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => handleAsk(chip)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-zinc-700/60 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                                msg.sender === 'user'
                                  ? 'bg-amber-500 text-black font-semibold rounded-tr-none'
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none whitespace-pre-line'
                              }`}
                            >
                              {msg.sender === 'deoki' && <span className="mr-1.5">🦆</span>}
                              {msg.text}
                            </div>
                            {msg.tips && msg.tips.length > 0 && (
                              <div className="mt-1.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-0.5 max-w-[85%]">
                                <strong className="text-amber-400 text-[10px] block">💡 실전 팁:</strong>
                                {msg.tips.map((tip, i) => (
                                  <p key={i}>• {tip}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={chatBottomRef} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 하단 질문 입력창 */}
            <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/50 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk(inputQuestion);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="덕이에게 질문하기 (예: 리스크 줄이는 방법은?)"
                  disabled={asking}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={asking || !inputQuestion.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-lg shadow-amber-500/10"
                >
                  {asking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  전송
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
