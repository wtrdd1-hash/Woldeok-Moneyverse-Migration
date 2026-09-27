'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, ArrowLeft, RotateCcw, Sparkles, Briefcase, Award, Coins, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const PROFESSIONS = [
  { id: 'developer', name: '개발자 (Developer)', baseReward: 1200, icon: '💻', desc: '코드 커밋 및 버그 해결 업무' },
  { id: 'trader', name: '트레이더 (Trader)', baseReward: 1400, icon: '📈', desc: '시장 유동성 공급 및 호가 분석' },
  { id: 'miner', name: '광부 (Miner)', baseReward: 1000, icon: '⛏️', desc: '원자재 채굴 및 광석 정제' },
  { id: 'chef', name: '요리사 (Chef)', baseReward: 1100, icon: '🍳', desc: '체력 회복 요리 및 버프 물약 조리' },
  { id: 'sheriff', name: '보안관 (Sheriff)', baseReward: 1300, icon: '🛡️', desc: '치안 순찰 및 사기 거래 단속' },
];

export default function FarmingCalculatorPage() {
  const [selectedProfession, setSelectedProfession] = useState<string>('developer');
  const [masteryLevel, setMasteryLevel] = useState<number>(5);
  const [dailyTasksCount, setDailyTasksCount] = useState<number>(5);
  const [dailyQuestsClaimed, setDailyQuestsClaimed] = useState<boolean>(true);
  const [bankCompoundActive, setBankCompoundActive] = useState<boolean>(true);

  const selectedProfData = PROFESSIONS.find((p) => p.id === selectedProfession) || PROFESSIONS[0]!;

  const calculation = useMemo(() => {
    const base = selectedProfData.baseReward;
    const levelMultiplier = 1 + (masteryLevel - 1) * 0.15; // 15% increase per level
    const taskReward = Math.round(base * levelMultiplier);
    const dailyWorkIncome = taskReward * dailyTasksCount;

    // Daily quests bonus (approx 3,000 WLD)
    const dailyQuestBonus = dailyQuestsClaimed ? 3500 : 0;
    const totalDailyIncome = dailyWorkIncome + dailyQuestBonus;

    // 30-Day Monthly calculation (with simple sum vs bank compound)
    const monthlyRawIncome = totalDailyIncome * 30;
    const yearlyRawIncome = totalDailyIncome * 365;

    // If deposited into 10% APY compounding bank
    const dailyRate = 0.10 / 365;
    let bankCompoundMonthly = 0;
    for (let day = 1; day <= 30; day++) {
      bankCompoundMonthly = (bankCompoundMonthly + totalDailyIncome) * (1 + (bankCompoundActive ? dailyRate : 0));
    }

    let bankCompoundYearly = 0;
    for (let day = 1; day <= 365; day++) {
      bankCompoundYearly = (bankCompoundYearly + totalDailyIncome) * (1 + (bankCompoundActive ? dailyRate : 0));
    }

    return {
      taskReward,
      dailyWorkIncome,
      dailyQuestBonus,
      totalDailyIncome,
      monthlyRawIncome,
      yearlyRawIncome,
      bankCompoundMonthly: Math.round(bankCompoundMonthly),
      bankCompoundYearly: Math.round(bankCompoundYearly),
    };
  }, [selectedProfData, masteryLevel, dailyTasksCount, dailyQuestsClaimed, bankCompoundActive]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '직업 숙련도 레벨은 어떻게 올리나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '일일 업무를 완수할 때마다 직업 숙련도 경험치(EXP)가 누적되며, 레벨업 시 1회당 수령하는 WLD 보상이 영구적으로 15%씩 증가합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '일일 파밍 수입을 극대화하는 최적의 루틴은 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '매일 직업 업무 5회 완료 + 일일 퀘스트 상자 수령 + 획득한 WLD를 가상 중앙은행 일복리 계좌에 즉시 예치하는 루틴이 1년 누적 자산을 최대 1.3배 이상 증폭시킵니다.',
        },
      },
    ],
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>도구 허브로 돌아가기</span>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">
          <Sparkles className="size-3.5" />
          <span>직업 파밍 시뮬레이터</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Calculator className="size-7 text-blue-500" />
          <span>직업별 일일 파밍 수익 최적화 계산기</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          5대 직업과 숙련도 레벨별 업무 보상, 일일 퀘스트 보너스 및 중앙은행 복리 결합 기대 자산을 시뮬레이션하세요.
        </p>

        {/* 롱테일 파밍 공략 프리셋 링크 */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">인기 파밍 루틴:</span>
          <Link
            href="/tools/farming-calculator/intern-vs-executive"
            className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors font-medium"
          >
            인턴 vs 임원 17배 수익 비교
          </Link>
          <Link
            href="/tools/farming-calculator/daily-100k-farming-route"
            className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors font-medium"
          >
            하루 10만 WLD 4시간 파밍 루트
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Controls */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="size-4 text-blue-500" />
                <span>1. 직업 선택</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROFESSIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProfession(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedProfession === p.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-sm'
                      : 'border-border/70 bg-card/60 text-muted-foreground hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <span>{p.icon}</span>
                    <span>{p.name.split(' ')[0]}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">{p.desc}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="size-4 text-blue-500" />
                <span>2. 숙련도 및 일일 활동량 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label className="font-bold">직업 숙련도 레벨</Label>
                  <span className="font-mono font-bold text-blue-500">Lv. {masteryLevel} (+{(masteryLevel - 1) * 15}% 보너스)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={masteryLevel}
                  onChange={(e) => setMasteryLevel(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label className="font-bold">일일 업무 완수 횟수</Label>
                  <span className="font-mono font-bold text-foreground">{dailyTasksCount}회 / 일</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={dailyTasksCount}
                  onChange={(e) => setDailyTasksCount(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyQuestsClaimed}
                    onChange={(e) => setDailyQuestsClaimed(e.target.checked)}
                    className="size-4 rounded border-border text-blue-500"
                  />
                  <span>일일 퀘스트 및 출석 체크 상자 수령 (+3,500 WLD)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankCompoundActive}
                    onChange={(e) => setBankCompoundActive(e.target.checked)}
                    className="size-4 rounded border-border text-blue-500"
                  />
                  <span>수익금 가상 중앙은행 복리 예치 (연 10% APY)</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-blue-500/40 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                <span>일일 총 파밍 수입</span>
                <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {selectedProfData.name.split(' ')[0]} Lv.{masteryLevel}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <div className="font-mono text-3xl sm:text-4xl font-black text-blue-500 tracking-tight">
                  {calculation.totalDailyIncome.toLocaleString()} <span className="text-lg font-bold text-foreground">WLD / 일</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1회 업무당 {calculation.taskReward.toLocaleString()} WLD + 일일 퀘스트 보너스 합산
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="block text-[11px] text-muted-foreground font-semibold">30일 누적 자산</span>
                  <span className="block font-mono text-base font-bold text-foreground mt-0.5">
                    {calculation.bankCompoundMonthly.toLocaleString()} WLD
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <span className="block text-[11px] text-blue-500 font-semibold">1년 누적 자산 (복리 적용)</span>
                  <span className="block font-mono text-base font-bold text-blue-500 mt-0.5">
                    {calculation.bankCompoundYearly.toLocaleString()} WLD
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
