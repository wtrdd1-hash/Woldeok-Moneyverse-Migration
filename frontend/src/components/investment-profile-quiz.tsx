'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, PieChart, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SocialShareBar } from '@/components/social-share-bar';
import { TranslatedText as T } from '@/components/translated-text';

interface PersonaResult {
  readonly title: string;
  readonly emoji: string;
  readonly badge: string;
  readonly description: string;
  readonly allocation: {
    readonly stocks: number;
    readonly savings: number;
    readonly realEstate: number;
    readonly cash: number;
  };
  readonly recommendedAssets: readonly string[];
}

const PERSONAS: Record<string, PersonaResult> = {
  aggressive: {
    title: '공격투자형 불사조',
    emoji: '🔥',
    badge: 'High Risk, High Return',
    description: '단기 변동성을 두려워하지 않고 고수익 가상 주식과 테마주에 적극적으로 베팅하는 공격적인 승부사입니다.',
    allocation: { stocks: 70, savings: 10, realEstate: 10, cash: 10 },
    recommendedAssets: ['월덕게임즈 (WDG)', '월덱테크 (WDT)', '치무테크 (CHIMU)'],
  },
  growth: {
    title: '성장추구형 황소',
    emoji: '🐂',
    badge: 'Growth Focused',
    description: '우량 가상 주식의 성장 잠재력과 복리 예적금을 결합하여 꾸준하고 탄탄한 자산 증식을 지향합니다.',
    allocation: { stocks: 50, savings: 25, realEstate: 15, cash: 10 },
    recommendedAssets: ['월덱테크 (WDT)', '신화바이오 (SHIN)', '중앙은행 30일 복리'],
  },
  balanced: {
    title: '밸런스형 사자',
    emoji: '🦁',
    badge: 'Balanced Portfolio',
    description: '주식과 복리 예금, 가상 부동산 임대 수익을 황금 비율로 배분하여 시장 하락장에도 굳건한 방어력을 갖춥니다.',
    allocation: { stocks: 35, savings: 35, realEstate: 20, cash: 10 },
    recommendedAssets: ['덕이엔터 (DUCK)', '중앙은행 90일 정기예금', '성수 스튜디오 임대'],
  },
  conservative: {
    title: '안정추구형 거북이',
    emoji: '🐢',
    badge: 'Capital Preservation',
    description: '원금 보존과 확정 복리 이자를 최우선으로 여기며, 리스크가 높은 주식보다 확실한 이자 파밍에 집중합니다.',
    allocation: { stocks: 15, savings: 55, realEstate: 20, cash: 10 },
    recommendedAssets: ['중앙은행 스마트 복리 포켓', '가상 국채 만기채권', '여의도 오피스 랜드'],
  },
};

export function InvestmentProfileQuiz() {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<PersonaResult | null>(null);

  const questions = [
    {
      q: '나의 목표 투자 기간과 선호하는 회전율은?',
      opts: [
        { label: '단기 1주~1개월 (빠른 시세 차익 추구)', score: 3 },
        { label: '중기 1~6개월 (성장 테마 스윙 투자)', score: 2 },
        { label: '장기 1년 이상 (복리 예금 및 장기 배당)', score: 1 },
      ],
    },
    {
      q: '보유 주식이 -15% 급락했을 때 나의 반응은?',
      opts: [
        { label: '기회다! DCA 물타기로 평단가를 대폭 낮춘다', score: 3 },
        { label: '기업 펀더멘털을 점검하고 관망한다', score: 2 },
        { label: '마음이 불안해서 즉시 손절하거나 예금으로 옮긴다', score: 1 },
      ],
    },
    {
      q: '가장 매력적으로 느껴지는 가상 자산은?',
      opts: [
        { label: '하루에도 +20%씩 치솟는 가상 AI/게임 주식', score: 3 },
        { label: '매일 따박따박 이자가 쌓이는 중앙은행 복리 금고', score: 1 },
        { label: '매월 안정적으로 월세가 나오는 메가시티 부동산', score: 2 },
      ],
    },
  ];

  const handleSelect = (score: number) => {
    const nextAnswers = [...answers, score];
    setAnswers(nextAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // 결과 산출
      const totalScore = nextAnswers.reduce((a, b) => a + b, 0);
      if (totalScore >= 8) {
        setResult(PERSONAS.aggressive!);
      } else if (totalScore >= 6) {
        setResult(PERSONAS.growth!);
      } else if (totalScore >= 4) {
        setResult(PERSONAS.balanced!);
      } else {
        setResult(PERSONAS.conservative!);
      }
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Target className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                <T korean="30초 AI 투자 성향 & 자산 배분 진단기" english="30-Sec AI Risk Profile & Asset Allocation" japanese="30秒AI投資タイプ＆資産配分診断" chinese="30秒AI投资偏好与资产配置诊断" />
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                <T korean="나에게 꼭 맞는 가상 자산 황금 배분 비율과 추천 포트폴리오를 찾아보세요." english="Find your personalized asset allocation and recommended portfolio mix." japanese="あなたに最適な仮想資産黄金比と推奨ポートフォリオを見つけましょう。" chinese="量身定制属于您的虚拟资产黄金配比与推荐投资组合。" />
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30">
            30 SECONDS
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {!result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>질문 {step + 1} / {questions.length}</span>
              <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
            </div>
            <Progress value={((step + 1) / questions.length) * 100} className="h-1.5" />

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 mt-3">
              <p className="text-sm sm:text-base font-extrabold text-foreground">
                Q{step + 1}. {questions[step]!.q}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {questions[step]!.opts.map((opt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleSelect(opt.score)}
                  className="justify-start text-left text-xs sm:text-sm font-semibold min-h-[48px] rounded-xl p-3.5 border-border/70 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-foreground active:scale-[0.99]"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] mr-2.5 font-mono">
                    {idx + 1}
                  </span>
                  <span className="truncate flex-1">{opt.label}</span>
                  <ArrowRight className="size-4 opacity-50 shrink-0 ml-2" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* 결과 헤더 카드 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-card to-background border border-emerald-500/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl">{result.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-foreground">
                      {result.title}
                    </h3>
                    <Badge className="bg-emerald-500 text-black text-[10px] font-extrabold">
                      {result.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                    {result.description}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs font-bold shrink-0 rounded-xl"
              >
                <RotateCcw className="size-3.5 mr-1" />
                다시 진단하기
              </Button>
            </div>

            {/* 추천 포트폴리오 비중 바 */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <PieChart className="size-4 text-emerald-400" />
                추천 자산 배분 비중 (Recommended Allocation)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="p-2.5 rounded-lg bg-card border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground block">📈 가상 주식</span>
                  <span className="text-base font-black text-emerald-400">{result.allocation.stocks}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground block">🏦 복리 예금</span>
                  <span className="text-base font-black text-blue-400">{result.allocation.savings}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground block">🏢 부동산 랜드</span>
                  <span className="text-base font-black text-amber-400">{result.allocation.realEstate}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground block">💵 현금 버퍼</span>
                  <span className="text-base font-black text-purple-400">{result.allocation.cash}%</span>
                </div>
              </div>

              {/* 추천 맞춤 종목 */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-muted-foreground mr-1">💡 추천 자산:</span>
                {result.recommendedAssets.map((asset, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px] font-semibold">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 바이럴 공유 바 */}
            <div className="pt-2 border-t border-border/50">
              <SocialShareBar
                title={`[월덕 머니버스] 나의 30초 AI 투자 성향은 "${result.emoji} ${result.title}"! 당신의 최적 포트폴리오를 진단해보세요.`}
                url="https://easy-scraping.com"
                description={result.description}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
