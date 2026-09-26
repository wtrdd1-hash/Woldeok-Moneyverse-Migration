'use client';

import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  GraduationCap,
  Flame,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import { cn } from '@/lib/cn';

// 7대 직급 단계 정의 (기획서 §6)
export interface MasteryRank {
  readonly rankName: string;
  readonly minLevel: number;
  readonly maxLevel: number;
  readonly title: string;
  readonly badgeColor: string;
}

export const MASTERY_RANKS: readonly MasteryRank[] = [
  { rankName: '견습 (Apprentice)', minLevel: 1, maxLevel: 5, title: '루키 실습생', badgeColor: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  { rankName: '숙련 (Junior)', minLevel: 6, maxLevel: 15, title: '공인 주니어', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { rankName: '프로 (Senior)', minLevel: 16, maxLevel: 30, title: '시니어 프로', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { rankName: '전문가 (Specialist)', minLevel: 31, maxLevel: 50, title: '분야 전문가', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { rankName: '엑스퍼트 (Lead)', minLevel: 51, maxLevel: 70, title: '테크니컬 리드', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { rankName: '마스터 (Master)', minLevel: 71, maxLevel: 90, title: '수석 마스터', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { rankName: '레거시 (Legend)', minLevel: 91, maxLevel: 999, title: '도시 전설의 명장', badgeColor: 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 border-amber-500/50' },
];

// 레벨당 필요 XP 계산식 (기획서 §6: round(250 * level^1.35))
export function getRequiredXpForLevel(level: number): number {
  return Math.round(250 * Math.pow(level, 1.35));
}

const DEFAULT_RANK: MasteryRank = {
  rankName: '견습 (Apprentice)',
  minLevel: 1,
  maxLevel: 5,
  title: '루키 실습생',
  badgeColor: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

// 직급 찾기 함수
export function getMasteryRank(level: number): MasteryRank {
  return MASTERY_RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) ?? DEFAULT_RANK;
}

// 직업별 자격시험 3문항 퀴즈 데이터
interface ExamQuestion {
  readonly id: number;
  readonly question: string;
  readonly options: readonly string[];
  readonly answer: number; // 0-based
}

const CAREER_EXAM_QUESTIONS: readonly ExamQuestion[] = [
  {
    id: 1,
    question: '머니버스 직업 업무 정산 시 한계 보상(Marginal Reward) 곡선이 적용되는 이유는 무엇입니까?',
    options: [
      '단일 저난도 반복 행위의 무한 복리 WLD 인플레이션을 방지하고 다양한 경제 활동을 장려하기 위해',
      '유저의 일일 접속 시간을 10분 이내로 제한하기 위해',
      '국고 세금을 강제로 90% 징수하기 위해',
      '모든 직업의 보상을 동일한 0 WLD로 맞추기 위해',
    ],
    answer: 0,
  },
  {
    id: 2,
    question: '직업 숙련도(Mastery XP)가 누적되어 상위 직급으로 승급했을 때 주어지는 혜택이 아닌 것은 무엇입니까?',
    options: [
      '상위 직급 전용 영구 칭호 및 프로필 엠블럼 해금',
      '고급 전문 과제 및 자격증 취득 권한 부여',
      '절대적인 무위험 100배 확정 주식 수익률 보장 (P2W 배율)',
      '도시 프로젝트 및 사업체 연계 커리어 아카이브 기록',
    ],
    answer: 2,
  },
  {
    id: 3,
    question: '전문 자격시험 응시료로 지불된 WLD는 시스템 내에서 어떻게 처리됩니까?',
    options: [
      '다른 유저의 지갑으로 무작위 배분된다',
      '전액 100% 영구 소각(HARD_SINK)되어 통화량 안정에 기여한다',
      '카지노 잭팟 상금 풀로 이전된다',
      '다음 날 2배로 자동 환급된다',
    ],
    answer: 1,
  },
];

export function CareerMasteryCard({
  jobTitle = '소매 운영원 (Retail Manager)',
  currentLevel = 12,
  currentXp = 3800,
}: {
  readonly jobTitle?: string;
  readonly currentLevel?: number;
  readonly currentXp?: number;
}) {
  const [level, setLevel] = useState<number>(currentLevel);
  const [xp, setXp] = useState<number>(currentXp);
  const [hasCert, setHasCert] = useState<boolean>(false);
  const [isExamOpen, setIsExamOpen] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentRank = getMasteryRank(level);
  const reqXp = getRequiredXpForLevel(level);
  const progressPercent = Math.min(100, Math.floor((xp / reqXp) * 100));

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    let correctCount = 0;
    for (const q of CAREER_EXAM_QUESTIONS) {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      }
    }
    const passed = correctCount >= 2;
    setExamResult({ passed, score: correctCount });

    if (passed) {
      setHasCert(true);
      setLevel((prev) => prev + 3); // 자격 취득 보너스 3레벨 승급
      setToastMessage(`축하합니다! 3문항 중 ${correctCount}문항을 맞춰 전문 자격증을 취득하고 상위 직급으로 승급했습니다!`);
    } else {
      setToastMessage(`아쉽습니다. 3문항 중 ${correctCount}문항 정답으로 기준(2문항 이상)에 미달했습니다. (응시료 소각 완료, 재응시 가능)`);
    }
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setExamResult(null);
  };

  return (
    <div className="space-y-4">
      {/* 토스트 피드백 */}
      {toastMessage && (
        <div className={cn(
          'p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs',
          examResult?.passed
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
            : 'border-rose-500/40 bg-rose-500/10 text-rose-500'
        )}>
          <div className="flex items-center gap-2">
            {examResult?.passed ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
            <span>{toastMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToastMessage(null)}
            className="text-xs h-7 px-2 hover:bg-muted"
          >
            확인
          </Button>
        </div>
      )}

      <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-primary/10 text-primary">
                  <GraduationCap className="size-4" />
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">PROFESSION MASTERY</span>
                <Badge variant="outline" className={cn('text-xs font-bold', currentRank.badgeColor)}>
                  {currentRank.rankName}
                </Badge>
              </div>
              <CardTitle className="text-xl font-black text-foreground">
                {jobTitle} 숙련도 & 커리어 마스터리
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                장기적인 업무 수행과 전문 자격시험 통과를 통해 상위 직급과 공인 자격증을 획득합니다.
              </CardDescription>
            </div>

            {/* 자격증 시험 응시 버튼 */}
            <div className="shrink-0">
              <Button
                onClick={() => {
                  handleResetExam();
                  setIsExamOpen(true);
                }}
                className="h-10 px-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-xs flex items-center gap-2"
              >
                <FileCheck2 className="size-4" />
                <span>{hasCert ? '상위 전문 자격 재응시' : '전문 자격증 시험 응시 (750 WLD)'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-0 space-y-4">
          {/* 숙련도 XP 바 */}
          <div className="space-y-2 bg-muted/40 p-4 rounded-xl border border-border/50">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary font-black text-sm">Lv.{level}</span>
                <span className="text-foreground">{currentRank.title}</span>
                {hasCert && (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px]">
                    공인 자격 보유
                  </Badge>
                )}
              </div>
              <span className="font-mono text-muted-foreground text-xs">
                {groupDigits(xp)} / {groupDigits(reqXp)} XP ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-2.5 rounded-full" />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>현재 직급 혜택: 업무 기본 숙련도 100% 반영</span>
              <span>다음 레벨까지: {groupDigits(Math.max(0, reqXp - xp))} XP 필요</span>
            </div>
          </div>

          {/* 7대 직급 단계 로드맵 미리보기 */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Award className="size-3.5 text-primary" />
              <span>7대 직급 커리어 단계</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {MASTERY_RANKS.map((r) => {
                const isCurrent = level >= r.minLevel && level <= r.maxLevel;
                const isPassed = level > r.maxLevel;

                return (
                  <div
                    key={r.rankName}
                    className={cn(
                      'p-2.5 rounded-xl border text-center space-y-1 transition-all',
                      isCurrent && 'border-primary bg-primary/10 ring-1 ring-primary/40 font-bold',
                      isPassed && 'border-border/60 bg-muted/30 opacity-70',
                      !isCurrent && !isPassed && 'border-border/40 bg-card/40 opacity-50'
                    )}
                  >
                    <div className="text-[10px] font-mono text-muted-foreground">Lv.{r.minLevel}~{r.maxLevel === 999 ? 'MAX' : r.maxLevel}</div>
                    <div className="text-xs font-bold truncate text-foreground">{r.rankName.split(' ')[0]}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전문 자격시험 3문항 퀴즈 모달 */}
      <Dialog open={isExamOpen} onOpenChange={(open) => !open && setIsExamOpen(false)}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <GraduationCap className="size-5 text-primary" />
              <span>전문 직업 자격시험 (자격증 검정)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              총 3문항 중 <strong className="text-foreground">2문항 이상 정답</strong> 시 합격 처리되며 자격증 획득 및 3단계 레벨 보너스가 지급됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <Flame className="size-4 shrink-0 text-rose-500 mt-0.5" />
              <span>
                <strong>응시료 영구 소각 안내:</strong> 응시료 <strong>750 WLD</strong>는 자격 심사 원장 등록을 위해 100% 영구 소각(SINK_PROFESSION_CERTIFICATION)됩니다.
              </span>
            </div>

            {/* 3문항 퀴즈 목록 */}
            <div className="space-y-5">
              {CAREER_EXAM_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="space-y-2 bg-muted/30 p-3.5 rounded-xl border border-border/50">
                  <div className="font-bold text-xs sm:text-sm text-foreground">
                    Q{idx + 1}. {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={cn(
                            'w-full text-left p-2.5 rounded-lg text-xs transition-all border flex items-center justify-between',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                              : 'border-border/60 bg-card hover:bg-muted/50 text-muted-foreground'
                          )}
                        >
                          <span>{optIdx + 1}) {opt}</span>
                          {isSelected && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsExamOpen(false)} className="h-10 text-xs font-bold">
              취소
            </Button>
            <Button
              onClick={() => {
                handleSubmitExam();
                setIsExamOpen(false);
              }}
              disabled={Object.keys(userAnswers).length < 3}
              size="sm"
              className="h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              답안 제출 및 채점하기 (750 WLD 소각)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
