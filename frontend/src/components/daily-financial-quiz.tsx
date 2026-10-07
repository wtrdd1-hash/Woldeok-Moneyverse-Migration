'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, BookOpen, Share2, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialShareBar } from '@/components/social-share-bar';
import { TranslatedText as T } from '@/components/translated-text';

interface QuizQuestion {
  readonly id: number;
  readonly question: string;
  readonly options: readonly string[];
  readonly answerIndex: number;
  readonly explanation: string;
  readonly category: string;
}

const QUIZ_POOL: readonly QuizQuestion[] = [
  {
    id: 1,
    question: '복리(Compound Interest)의 마법에서 "72의 법칙"이란 원금이 몇 배가 되는 시간을 계산하는 공식일까요?',
    options: ['1.5배', '2배', '3배', '10배'],
    answerIndex: 1,
    explanation: '72의 법칙은 72를 연이율(%)로 나누면 원금이 정확히 2배가 되는 데 걸리는 햇수를 직관적으로 계산할 수 있는 금융 공식입니다. (예: 연 7.2% 복리면 10년 뒤 2배)',
    category: '복리·저축',
  },
  {
    id: 2,
    question: '주식 투자에서 "DCA(달러 비용 평균법, 분할 매수)"의 가장 핵심적인 이점은 무엇일까요?',
    options: ['항상 최저점에서만 전량 매수할 수 있다', '매입 평균 단가를 안정화하여 변동성 위험을 줄인다', '원금 손실이 100% 법적으로 보장된다', '단기간에 레버리지 수익률을 5배로 증폭한다'],
    answerIndex: 1,
    explanation: '정기적으로 일정 금액을 분할 매수하는 DCA 기법은 주가가 하락할 때 더 많은 수량을 매입하여 평균 단가를 낮추고 시장 타이밍 예측의 리스크를 분산합니다.',
    category: '주식·투자',
  },
  {
    id: 3,
    question: '주가수익비율(PER, Price Earning Ratio)이 업종 평균 대비 낮다는 것은 일반적으로 어떤 의미일까요?',
    options: ['기업의 부채가 지나치게 많다', '기업의 순이익에 비해 주가가 상대적으로 저평가되어 있다', '해당 기업이 곧 상장 폐지된다', '주식 거래량이 완전히 정지되었다'],
    answerIndex: 1,
    explanation: 'PER은 현재 주가를 주당순이익(EPS)으로 나눈 지표로, 수치가 낮을수록 기업이 창출하는 이익에 비해 주가가 상대적으로 저평가되어 있을 가능성이 높습니다.',
    category: '가치평가',
  },
  {
    id: 4,
    question: '지속적인 인플레이션(화폐 가치 하락) 국면에서 실질 자산을 방어하기 위한 가장 현명한 전략은?',
    options: ['현금만 금고에 전액 보관한다', '주식, 우량 채권, 부동산 등 생산적 실물 자산으로 분산한다', '단기 고금리 대출을 최대한 늘린다', '모든 투자를 중단하고 무기한 대기한다'],
    answerIndex: 1,
    explanation: '인플레이션 시기에는 현금의 실질 구매력이 급격히 감소하므로 물가 상승률을 초과하는 배당 주식이나 우량 실물 자산으로 분산 포트폴리오를 구성해야 합니다.',
    category: '자산배분',
  },
  {
    id: 5,
    question: '가상 주식 거래소의 "호가창 10-Depth"란 무엇을 의미할까요?',
    options: ['10초마다 주가가 강제로 변동하는 것', '현재 매매가 기준 매수/매도 각각 10단계의 주문 잔량을 실시간 표출하는 것', '하루에 10번만 주문할 수 있는 제한', '10명 이상의 투자자만 참여 가능한 비밀 방'],
    answerIndex: 1,
    explanation: '호가창 10-Depth는 현재 시장가 위아래로 각각 10개의 최우선 호가 및 대기 수량을 투명하게 제공하여 유동성과 체결 압력을 한눈에 읽을 수 있게 돕는 시스템입니다.',
    category: '거래소',
  },
];

const DEFAULT_QUIZ: QuizQuestion = QUIZ_POOL[0]!;

export function DailyFinancialQuizStation() {
  const [todayStr, setTodayStr] = useState<string>('');
  const [question, setQuestion] = useState<QuizQuestion>(DEFAULT_QUIZ);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(1);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setTodayStr(today);

    // 날짜 기반 결정론적 퀴즈 인덱스 산출
    const dayNum = parseInt(today.replace(/-/g, ''), 10);
    const qIndex = dayNum % QUIZ_POOL.length;
    setQuestion(QUIZ_POOL[qIndex] ?? DEFAULT_QUIZ);

    // 로컬 스토리지 확인
    try {
      const saved = localStorage.getItem(`wdmv_quiz_${today}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedIndex(parsed.selectedIndex);
        setIsAnswered(true);
        setIsCorrect(parsed.isCorrect);
      }
      const streak = parseInt(localStorage.getItem('wdmv_quiz_streak') || '1', 10);
      setStreakDays(streak);
    } catch {
      // 로컬 스토리지 비활성화 환경 방어
    }
  }, []);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedIndex(idx);
    const correct = idx === question.answerIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    try {
      localStorage.setItem(
        `wdmv_quiz_${todayStr}`,
        JSON.stringify({ selectedIndex: idx, isCorrect: correct })
      );
      if (correct) {
        const nextStreak = streakDays + 1;
        setStreakDays(nextStreak);
        localStorage.setItem('wdmv_quiz_streak', nextStreak.toString());
      }
    } catch {
      // ignore
    }
  };

  const shareTitle = isCorrect
    ? `[월덕 머니버스] 오늘의 금융 상식 퀴즈 정답 맞히고 +300 WLD 보상 획득! (${streakDays}일 연속 스트릭 달성 중 🔥)`
    : `[월덕 머니버스] 오늘의 1분 금융 상식 퀴즈 도전! 실시간 가상경제와 금융 지식을 함께 배워보세요.`;

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  <T korean="오늘의 1분 금융 상식 퀴즈" english="Daily 1-Min Financial Quiz" japanese="本日の1分金融クイズ" chinese="每日一分钟金融知识问答" />
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold text-blue-400 border-blue-500/30">
                  {question.category}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                <T korean="매일 정답을 맞히고 300 WLD 보상과 연속 출석 스트릭을 쌓으세요." english="Answer correctly daily to earn 300 WLD and build your knowledge streak." japanese="毎日正解して300 WLD報酬と連続ストリークを蓄積しましょう。" chinese="每日答对赢取300 WLD奖励并累计连胜战绩。" />
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold font-mono">
            <Flame className="size-3.5 fill-amber-500 text-amber-500 animate-bounce" />
            <span>{streakDays}일 연속 도전 중</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* 질문 영역 */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="size-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base font-extrabold text-foreground leading-snug">
              Q. {question.question}
            </p>
          </div>
        </div>

        {/* 4지선다 선택지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isTheAnswer = question.answerIndex === idx;

            let btnVariant: 'outline' | 'default' = 'outline';
            let btnClass = 'justify-start text-left text-xs sm:text-sm font-semibold min-h-[48px] rounded-xl p-3.5 transition-all ';

            if (!isAnswered) {
              btnClass += 'border-border/70 hover:border-blue-500/50 hover:bg-blue-500/5 text-foreground active:scale-[0.99]';
            } else if (isTheAnswer) {
              btnClass += 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold';
            } else if (isSelected && !isCorrect) {
              btnClass += 'border-rose-500 bg-rose-500/15 text-rose-400 font-bold';
            } else {
              btnClass += 'opacity-50 border-border/40 text-muted-foreground';
            }

            return (
              <Button
                key={idx}
                variant={btnVariant}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={btnClass}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] mr-2.5 font-mono">
                  {idx + 1}
                </span>
                <span className="truncate flex-1">{opt}</span>
                {isAnswered && isTheAnswer && <CheckCircle2 className="size-4 text-emerald-400 shrink-0 ml-2" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="size-4 text-rose-400 shrink-0 ml-2" />}
              </Button>
            );
          })}
        </div>

        {/* 정답 및 해설 영역 */}
        {isAnswered && (
          <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 space-y-3 ${
            isCorrect
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    <span className="text-sm font-black text-emerald-400">
                      <T korean="정답입니다! +300 WLD 수령 완료" english="Correct! +300 WLD Claimed" japanese="正解です！+300 WLD受取完了" chinese="回答正确！+300 WLD领取成功" />
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-rose-400" />
                    <span className="text-sm font-black text-rose-400">
                      <T korean="아쉽게도 오답입니다! 정답 해설을 확인하세요." english="Incorrect! Check the official explanation below." japanese="残念ながら不正解です！正解の解説をご確認ください。" chinese="回答错误！请查看下方的官方解析。" />
                    </span>
                  </>
                )}
              </div>
              <Badge className={isCorrect ? 'bg-emerald-500 text-black font-extrabold' : 'bg-rose-500 text-white font-extrabold'}>
                {isCorrect ? 'SUCCESS' : 'TRY TOMORROW'}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pl-1 border-l-2 border-primary/40">
              💡 <b className="text-foreground font-semibold">전문가 해설:</b> {question.explanation}
            </p>

            {/* 정답 인증 소셜 공유 바 */}
            <div className="pt-2 border-t border-border/40">
              <SocialShareBar
                title={shareTitle}
                url="https://easy-scraping.com"
                description={question.explanation}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
