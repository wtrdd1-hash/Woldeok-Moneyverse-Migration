'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  PieChart,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Coins,
  Building2,
  Landmark,
  Wallet,
  MessageSquare,
  Zap,
  Check,
  Receipt,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface RebalanceTradeItem {
  readonly asset: string;
  readonly code: string;
  readonly action: 'BUY' | 'SELL' | 'HOLD';
  readonly amountWld: number;
  readonly quantity: number;
  readonly unitPriceWld: number;
  readonly feeWld: number;
  readonly status: 'FILLED' | 'ALLOCATED';
}

interface RebalanceExecutionReceipt {
  readonly executionId: string;
  readonly executedAt: string;
  readonly totalRebalancedWld: number;
  readonly feeDiscountWld: number;
  readonly netCashBalanceWld: number;
  readonly prIndexBefore: number;
  readonly prIndexAfter: number;
  readonly trades: readonly RebalanceTradeItem[];
  readonly adviceSummary: string;
}

interface AllocationItem {
  category: string;
  code: string;
  ratio: number;
  amountWld: number;
  color: string;
  barBg: string;
}

interface DiagnosisData {
  ok: boolean;
  score: number;
  statusLabel: string;
  totalAssetWld: number;
  sharpeRatio: number;
  maxDrawdownRate: number;
  annualExpectedYield: number;
  allocation: AllocationItem[];
  strengths: string[];
  risks: string[];
  rebalancingAction: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'deoki';
  text: string;
  timestamp: string;
}

export function AdvisorClient() {
  const [data, setData] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'deoki',
      text: '안녕하세요! 월덕 머니버스 전속 AI 금융 어드바이저 "덕이"입니다. 회원님의 보유 주식, 국채, 부동산 지분, 예금 잔고를 실시간 종합 분석하여 리스크와 최적의 리밸런싱 전략을 안내해 드립니다. 무엇이든 편하게 물어보세요!',
      timestamp: '방금 전',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [rebalanceReceipt, setRebalanceReceipt] = useState<RebalanceExecutionReceipt | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleExecuteRebalance = async () => {
    setIsRebalancing(true);
    try {
      const res = await fetch('/api/advisor/deoki/rebalance/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStocksRatio: 55,
          targetBondsRatio: 20,
          targetCashRatio: 25,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success && resData.receipt) {
        setRebalanceReceipt(resData.receipt);
        setReceiptModalOpen(true);
        toast.success('포트폴리오 리밸런싱 주문이 시장가로 즉시 체결되었습니다!', {
          description: `체결 번호: ${resData.receipt.executionId}`,
        });
        fetchDiagnosis();
      } else {
        toast.error('리밸런싱 주문 실패', {
          description: resData.error || '주문 처리 중 문제가 발생했습니다.',
        });
      }
    } catch {
      toast.error('네트워크 통신 오류가 발생했습니다.');
    } finally {
      setIsRebalancing(false);
    }
  };

  const fetchDiagnosis = async () => {
    try {
      const res = await fetch('/api/advisor/deoki/diagnose');
      const json = await res.json();
      if (json && (json.ok || json.score)) {
        setData(json);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || inputQuestion).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputQuestion('');
    setIsSending(true);

    try {
      const res = await fetch('/api/advisor/deoki/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });
      const resData = await res.json();

      const deokiMsg: ChatMessage = {
        id: `deoki-${Date.now()}`,
        sender: 'deoki',
        text: resData.answer || resData.text || '회원님의 포트폴리오를 진단 중입니다. 잠시 후 다시 질문해 주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, deokiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `deoki-${Date.now()}`,
          sender: 'deoki',
          text: '일시적인 네트워크 지연이 발생했습니다. 질문을 다시 한번 전송해 주세요.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    '내 포트폴리오 위험도는 어느 정도야?',
    '이번 주 가장 추천하는 리밸런싱은?',
    '부동산 월세 배당을 더 늘리려면?',
    '국채와 주식의 황금비율이 뭐야?',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Core Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>총 운용 자산 (AUM)</span>
              <Coins className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight tabular-nums text-foreground">
              {data?.totalAssetWld ? `${(data.totalAssetWld / 10000).toLocaleString()}만 WLD` : '1,245만 WLD'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            전체 4개 자산군 통합 평가액
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>덕이 건전성 점수</span>
              <ShieldCheck className="size-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
              {data?.score ?? 88} <span className="text-sm font-sans font-bold">/ 100점</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {data?.statusLabel ?? '우수 (Balanced Growth)'}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>포트폴리오 샤프 지수</span>
              <TrendingUp className="size-4 text-sky-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight tabular-nums text-sky-500">
              {data?.sharpeRatio ?? 1.84}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            변동성 대비 초과 수익률 상위 15%
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>예상 연간 배당률</span>
              <Sparkles className="size-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight tabular-nums text-indigo-500">
              연 {data?.annualExpectedYield ?? 14.2}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            국채 이자 + 부동산 월세 합산
          </CardContent>
        </Card>
      </div>

      {/* 2. Asset Allocation & Diagnosis Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4-Quadrant Allocation (7 cols) */}
        <Card className="lg:col-span-7 border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="size-4 text-indigo-500" />
                <CardTitle className="text-base font-bold text-foreground">
                  자산 배분 4분면 포트폴리오
                </CardTitle>
              </div>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-500 text-xs font-mono">
                자산 분산도 88%
              </Badge>
            </div>
            <CardDescription className="text-xs">
              안전자산(국채·예금 30%)과 성장·수익자산(주식·부동산 70%)의 황금 비율
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Multi-segment Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                <div style={{ width: '42%' }} className="bg-indigo-500 transition-all duration-500" />
                <div style={{ width: '28%' }} className="bg-emerald-500 transition-all duration-500" />
                <div style={{ width: '18%' }} className="bg-sky-500 transition-all duration-500" />
                <div style={{ width: '12%' }} className="bg-amber-500 transition-all duration-500" />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
                <span>주식 42%</span>
                <span>부동산 28%</span>
                <span>국채 18%</span>
                <span>현금 12%</span>
              </div>
            </div>

            {/* Asset Detail Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500">
                  <TrendingUp className="size-3.5" />
                  <span>가상 주식</span>
                </div>
                <div className="text-sm font-black font-mono tabular-nums text-foreground">
                  42% <span className="text-[10px] text-muted-foreground font-normal">522만</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <Building2 className="size-3.5" />
                  <span>랜드마크</span>
                </div>
                <div className="text-sm font-black font-mono tabular-nums text-foreground">
                  28% <span className="text-[10px] text-muted-foreground font-normal">348만</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-sky-500/20 bg-sky-500/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-500">
                  <Landmark className="size-3.5" />
                  <span>국가 국채</span>
                </div>
                <div className="text-sm font-black font-mono tabular-nums text-foreground">
                  18% <span className="text-[10px] text-muted-foreground font-normal">224만</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <Wallet className="size-3.5" />
                  <span>현금·예금</span>
                </div>
                <div className="text-sm font-black font-mono tabular-nums text-foreground">
                  12% <span className="text-[10px] text-muted-foreground font-normal">149만</span>
                </div>
              </div>
            </div>

            {/* Rebalancing Suggestion Box */}
            <div className="p-3.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                  <RefreshCw className="size-3.5" />
                  <span>덕이의 원클릭 리밸런싱 권장안</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-mono">
                  수수료 50% 우대
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data?.rebalancingAction ??
                  '테크 성장주 비중 8%를 차익 실현한 후, 연 14.8% 배당의 강남 프라임 타워 지분 또는 5년물 국채로 리밸런싱을 권장합니다.'}
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={handleExecuteRebalance}
                disabled={isRebalancing}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs h-8 shadow-sm cursor-pointer"
              >
                {isRebalancing ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="size-3 animate-spin" /> 시장가 분할 주문 체결 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Zap className="size-3.5" /> ⚡ 1클릭 시장가 자동 리밸런싱 주문 체결
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Diagnosis Insights (5 cols) */}
        <Card className="lg:col-span-5 border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>포트폴리오 정밀 진단 요약</span>
            </CardTitle>
            <CardDescription className="text-xs">
              머니버스 리스크 통제 센터 종합 소견
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                <span>핵심 강점</span>
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {(data?.strengths ?? [
                  '국채(KTB) 및 부동산 지분 기반 방어적 고정 현금흐름이 견고합니다.',
                  '시장 급락 시 12%의 현금 예금 비축금으로 저가 매수 여력이 확보되어 있습니다.',
                ]).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold shrink-0">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-border/40" />

            {/* Risks */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <AlertTriangle className="size-3.5" />
                <span>유의 및 보완점</span>
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {(data?.risks ?? [
                  '특정 성장주(TECH) 종목에 주식 비중의 38%가 집중되어 있습니다.',
                  '청년도약계좌 및 ISA 비과세 혜택 금융 상품을 아직 최대 한도까지 활용하지 않았습니다.',
                ]).map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Realtime Interactive Chatbot with Deoki */}
      <Card className="border-border/60 bg-card/90">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <span>AI 금융 비서 덕이와의 1:1 상담실</span>
                  <Badge variant="secondary" className="h-4 text-[10px] bg-emerald-500/10 text-emerald-500 font-mono">
                    LIVE
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  금융 공학 룰베이스 기반 실시간 맞춤형 조언
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Chat Messages Log */}
          <div className="h-[280px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'deoki' && (
                  <div className="size-7 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="size-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-br-xs'
                      : 'bg-muted/60 border border-border/50 text-foreground rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="block text-[9px] text-muted-foreground/80 mt-1 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2.5 justify-start">
                <div className="size-7 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="size-3.5" />
                </div>
                <div className="bg-muted/60 border border-border/50 rounded-xl px-3.5 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="animate-pulse">덕이가 포트폴리오를 분석 중입니다...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickPrompts.map((prompt, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                disabled={isSending}
                onClick={() => handleSend(prompt)}
                className="text-[11px] h-6 px-2.5 rounded-full border-border/60 hover:border-indigo-500/40 hover:bg-indigo-500/10 text-muted-foreground hover:text-foreground"
              >
                {prompt}
              </Button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 pt-1"
          >
            <Input
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="포트폴리오, 주식 매수 타이밍, 배당 극대화 등에 대해 물어보세요..."
              className="text-xs h-9 bg-background/60"
              disabled={isSending}
            />
            <Button
              type="submit"
              disabled={isSending || !inputQuestion.trim()}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
            >
              <Send className="size-3.5 mr-1.5" />
              전송
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Rebalance Execution Receipt Dialog */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg border-border/80 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Receipt className="size-5 text-indigo-500" />
              <span>덕이 AI 포트폴리오 리밸런싱 체결 영수증</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              주문 체결 번호: {rebalanceReceipt?.executionId}
            </DialogDescription>
          </DialogHeader>

          {rebalanceReceipt && (
            <div className="space-y-4 pt-2">
              {/* Score Shift Banner */}
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground">포트폴리오 안전 지수(PR-Index) 개선</div>
                  <div className="text-base font-extrabold text-emerald-400 font-mono flex items-center gap-1.5">
                    <span>{rebalanceReceipt.prIndexBefore}점</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                    <span>{rebalanceReceipt.prIndexAfter}점 (+{rebalanceReceipt.prIndexAfter - rebalanceReceipt.prIndexBefore}점 상향)</span>
                  </div>
                </div>
                <Badge variant="default" className="bg-emerald-600 text-white font-bold text-xs">
                  위험 완화 완료
                </Badge>
              </div>

              {/* Trade execution list */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground">시장가 분할 주문 체결 내역</span>
                <div className="divide-y divide-border/60 rounded-md border border-border/60 overflow-hidden bg-muted/20">
                  {rebalanceReceipt.trades.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 font-bold ${
                              item.action === 'BUY'
                                ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                                : item.action === 'SELL'
                                ? 'border-sky-500/40 text-sky-400 bg-sky-500/10'
                                : 'border-zinc-500/40 text-zinc-400 bg-zinc-500/10'
                            }`}
                          >
                            {item.action === 'BUY' ? '매수' : item.action === 'SELL' ? '매도' : '유지'}
                          </Badge>
                          <span>{item.asset}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {item.quantity.toLocaleString()}주 @ {item.unitPriceWld.toLocaleString()} WLD
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-foreground">
                          {item.amountWld.toLocaleString()} WLD
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          체결 완료 (수수료 {item.feeWld} WLD)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
                  <span className="text-muted-foreground block text-[11px]">총 리밸런싱 실행액</span>
                  <span className="font-mono font-extrabold text-foreground text-sm">
                    {rebalanceReceipt.totalRebalancedWld.toLocaleString()} WLD
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
                  <span className="text-muted-foreground block text-[11px]">우대 수수료 절감액</span>
                  <span className="font-mono font-extrabold text-indigo-400 text-sm">
                    +{rebalanceReceipt.feeDiscountWld.toLocaleString()} WLD
                  </span>
                </div>
              </div>

              {/* Advice */}
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-2">
                💡 {rebalanceReceipt.adviceSummary}
              </p>

              <Button
                variant="default"
                size="sm"
                onClick={() => setReceiptModalOpen(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9"
              >
                확인 및 닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
