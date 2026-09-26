'use client';

import React, { useState } from 'react';
import {
  Building,
  Trees,
  Landmark,
  Crown,
  HeartHandshake,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Users,
  Coins,
  ShieldAlert,
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
import { Input } from '@/components/ui/input';
import { groupDigits } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { CityProject } from './spaces-view';

// 기획서 §10 명세에 따른 4대 초기 도시 프로젝트 정본 카탈로그
export const DEFAULT_CITY_PROJECTS: readonly CityProject[] = [
  {
    id: 'proj_garden',
    code: 'CITY_GARDEN_01',
    title: '강변 공공 정원 복원 프로젝트',
    description: '머니버스 강변 수변 생태계를 복원하고 시민 휴식 공원을 조성합니다. 시민 기여로 공공 녹지가 영구 확장됩니다.',
    target_wld: '250000',
    current_wld: '187500',
    status: 'funding',
    stage: 1,
    progress_percent: 75,
  },
  {
    id: 'proj_plaza',
    code: 'CITY_PLAZA_01',
    title: '중앙 문화 광장 대확장',
    description: '공공 미술 조형물, 원형 야외 공연장 및 인터랙티브 분수대를 건설하여 도시 시민 광장을 완성합니다.',
    target_wld: '1000000',
    current_wld: '420000',
    status: 'funding',
    stage: 2,
    progress_percent: 42,
  },
  {
    id: 'proj_museum',
    code: 'CITY_MUSEUM_01',
    title: 'Moneyverse 역사 박물관 건립',
    description: '머니버스의 창립 역사와 주요 경제 사건, 상장사들의 기록을 영구 전시하는 시립 아카이브 박물관입니다.',
    target_wld: '3000000',
    current_wld: '1050000',
    status: 'funding',
    stage: 1,
    progress_percent: 35,
  },
  {
    id: 'proj_patronage',
    code: 'CITY_PATRONAGE',
    title: '도시 레거시 영구 후원 기금',
    description: '총액 상한이 없는 오픈형 도시 공공 후원 기금입니다. 기여금은 100% 소각되며 영구 명예 후원자 벽에 각인됩니다.',
    target_wld: '10000000',
    current_wld: '6450000',
    status: 'active',
    stage: 5,
    progress_percent: 64,
  },
];

// 기획서 §12 명예 점수 산출 함수: floor(100 * ln(1 + 누적기여 / 1000))
export function calculateHonorScore(contributedWld: number): number {
  if (contributedWld <= 0) return 0;
  return Math.floor(100 * Math.log(1 + contributedWld / 1000));
}

// 명예 후원자 아카이브 목업 데이터
interface PatronHonor {
  readonly rank: number;
  readonly name: string;
  readonly contributedWld: number;
  readonly honorScore: number;
  readonly badge: string;
}

const TOP_PATRONS: readonly PatronHonor[] = [
  { rank: 1, name: '월덕파운더', contributedWld: 1250000, honorScore: calculateHonorScore(1250000), badge: '도시 건립자' },
  { rank: 2, name: '사이버타이쿤', contributedWld: 850000, honorScore: calculateHonorScore(850000), badge: '대도시 후원자' },
  { rank: 3, name: '메트로스튜어드', contributedWld: 500000, honorScore: calculateHonorScore(500000), badge: '명예 시민' },
  { rank: 4, name: '골든엔젤', contributedWld: 320000, honorScore: calculateHonorScore(320000), badge: '공공 기여자' },
  { rank: 5, name: '시티가디언', contributedWld: 180000, honorScore: calculateHonorScore(180000), badge: '녹색 수호자' },
];

export function CityProjectsView({
  projects,
}: {
  readonly projects?: readonly CityProject[];
}) {
  const activeProjects = (projects && projects.length > 0) ? projects : DEFAULT_CITY_PROJECTS;
  const [selectedProj, setSelectedProj] = useState<CityProject | null>(null);
  const [contributeAmount, setContributeAmount] = useState<number>(5000);
  const [customAmountText, setCustomAmountText] = useState<string>('5000');
  const [myTotalContributed, setMyTotalContributed] = useState<number>(15000);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const myHonorScore = calculateHonorScore(myTotalContributed);

  const handleSelectPreset = (amount: number) => {
    setContributeAmount(amount);
    setCustomAmountText(amount.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountText(val);
    const num = Number(val) || 0;
    setContributeAmount(num);
  };

  const handleConfirmContribute = () => {
    if (!selectedProj || contributeAmount <= 0) return;
    const addedScore = calculateHonorScore(myTotalContributed + contributeAmount) - myHonorScore;
    setMyTotalContributed((prev) => prev + contributeAmount);
    setSuccessMessage(`${selectedProj.title}에 ${groupDigits(contributeAmount)} WLD를 기여하여 ${addedScore} 명예 점수를 획득했습니다! (전액 영구 소각 완료)`);
    setIsSuccess(true);
    setSelectedProj(null);
  };

  const getProjectIcon = (code: string) => {
    if (code.includes('GARDEN')) return Trees;
    if (code.includes('PLAZA')) return Building;
    if (code.includes('MUSEUM')) return Landmark;
    return Crown;
  };

  return (
    <div className="space-y-8">
      {/* 상단 기여 철학 및 내 명예 지표 배너 */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <HeartHandshake className="size-5" />
              </span>
              <h3 className="font-extrabold text-lg text-foreground">
                머니버스 공공 도시 프로젝트 크라우드펀딩
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              도시 인프라는 모든 시민의 자발적 기여로 세워집니다. 기여된 WLD는 금융 이자나 수익을 발생시키지 않고
              <strong className="text-rose-500 font-semibold mx-1">100% 영구 소각(Hard Sink)</strong>되어
              도시 통화량을 안정화하며, 기여자는 영구적인 명예 점수와 공공 명패를 받습니다.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card/80 border border-border/80 backdrop-blur-xs rounded-xl p-3.5 shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-bold text-muted-foreground">내 누적 소각 기여</div>
              <div className="font-mono text-base font-black text-rose-500 flex items-center justify-end gap-1">
                <Flame className="size-4" />
                <span>{groupDigits(myTotalContributed)} WLD</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-left">
              <div className="text-[11px] font-bold text-muted-foreground">명예 점수</div>
              <div className="font-mono text-base font-black text-amber-500 flex items-center gap-1">
                <Award className="size-4" />
                <span>{myHonorScore} pt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 기여 완료 토스트 피드백 */}
      {isSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSuccess(false)}
            className="text-xs h-7 px-2 hover:bg-emerald-500/20 text-emerald-500"
          >
            닫기
          </Button>
        </div>
      )}

      {/* 도시 프로젝트 카드 그리드 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Building className="size-4 text-primary" />
            <span>도시 프로젝트 모금 현황</span>
          </h4>
          <span className="text-xs text-muted-foreground font-mono">
            {activeProjects.length}개 공공 프로젝트 가동 중
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeProjects.map((p) => {
            const current = Number(p.current_wld);
            const target = Number(p.target_wld);
            const isCompleted = p.status === 'completed' || p.progress_percent >= 100;
            const Icon = getProjectIcon(p.code);

            return (
              <Card
                key={p.id}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border transition-all shadow-xs',
                  isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/80 bg-card hover:border-border'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={cn('p-2 rounded-xl', isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary')}>
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {p.code}
                        </span>
                        <CardTitle className="text-base font-bold mt-1 text-foreground">
                          {p.title}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-bold shrink-0',
                        isCompleted
                          ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                          : 'border-primary/40 text-primary bg-primary/10'
                      )}
                    >
                      {isCompleted ? '건립 완공' : `${p.stage}단계 모금 중`}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                    {p.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 py-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">시민 모금 달성률</span>
                      <span className="font-mono font-bold text-foreground">
                        {p.progress_percent}%
                      </span>
                    </div>
                    <Progress value={Math.min(100, p.progress_percent)} className="h-2 rounded-full" />
                    <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
                      <span>{groupDigits(current)} WLD 소각됨</span>
                      <span>목표: {groupDigits(target)} WLD</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t">
                  <Button
                    onClick={() => {
                      setSelectedProj(p);
                      setContributeAmount(5000);
                      setCustomAmountText('5000');
                    }}
                    className={cn(
                      'w-full h-10 min-h-[40px] text-xs font-bold transition-all shadow-xs',
                      isCompleted
                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                  >
                    <Flame className="size-3.5 mr-1 text-rose-400" />
                    <span>{isCompleted ? '추가 명예 후원하기 (소각)' : 'WLD 기여 펀딩하기 (소각)'}</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 기여 펀딩 모달 다이얼로그 */}
      <Dialog open={selectedProj !== null} onOpenChange={(open) => !open && setSelectedProj(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Flame className="size-5 text-rose-500" />
              <span>도시 프로젝트 WLD 기여</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              선택된 프로젝트: <strong className="text-foreground">{selectedProj?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <span>
                <strong>영구 소각 안내:</strong> 본 기여금은 도시 공공 프로젝트 완성을 위해 영구 소각(Hard Sink)되며 반환되거나 금융 이익이 발생하지 않습니다.
              </span>
            </div>

            {/* 프리셋 버튼 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">빠른 기여 금액 선택</label>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 50000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={contributeAmount === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs font-mono font-bold h-9"
                  >
                    +{groupDigits(preset)}
                  </Button>
                ))}
              </div>
            </div>

            {/* 직접 입력 */}
            <div className="space-y-1.5">
              <label htmlFor="custom-contribute-amount" className="text-xs font-bold text-muted-foreground">기여할 WLD 직접 입력</label>
              <div className="relative">
                <Input
                  id="custom-contribute-amount"
                  type="text"
                  value={customAmountText}
                  onChange={handleCustomChange}
                  className="font-mono text-sm font-bold pr-12"
                  placeholder="금액 입력"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  WLD
                </span>
              </div>
            </div>

            {/* 예상 명예 점수 획득 미리보기 */}
            <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>현재 명예 점수:</span>
                <span className="font-mono font-bold">{myHonorScore} pt</span>
              </div>
              <div className="flex justify-between text-foreground font-semibold">
                <span>기여 후 예상 명예 점수:</span>
                <span className="font-mono font-bold text-amber-500">
                  {calculateHonorScore(myTotalContributed + contributeAmount)} pt
                  <span className="text-[10px] text-emerald-500 ml-1">
                    (+{calculateHonorScore(myTotalContributed + contributeAmount) - myHonorScore} pt)
                  </span>
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSelectedProj(null)} className="h-10 text-xs font-bold">
              취소
            </Button>
            <Button
              onClick={handleConfirmContribute}
              disabled={contributeAmount <= 0}
              size="sm"
              className="h-10 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {groupDigits(contributeAmount)} WLD 영구 소각 기여하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 영구 명예 후원자 벽 (Hall of Patrons) */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="size-5 text-amber-500" />
              <CardTitle className="text-base font-bold">영구 명예 후원자 벽 (Hall of Patrons)</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-bold border-amber-500/30 text-amber-500 bg-amber-500/10">
              Top Contributors
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            도시 인프라를 위해 자발적으로 WLD를 소각하고 공공 발전에 기여한 시민 명예의 전당입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/40">
            {TOP_PATRONS.map((patron) => (
              <div key={patron.rank} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'size-6 rounded-full flex items-center justify-center font-bold text-xs',
                    patron.rank === 1 && 'bg-amber-500/20 text-amber-500 border border-amber-500/40',
                    patron.rank === 2 && 'bg-slate-400/20 text-slate-300 border border-slate-400/40',
                    patron.rank === 3 && 'bg-amber-700/20 text-amber-600 border border-amber-700/40',
                    patron.rank > 3 && 'bg-muted text-muted-foreground font-mono'
                  )}>
                    {patron.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{patron.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                      {patron.badge}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-rose-500">
                    {groupDigits(patron.contributedWld)} WLD
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-500 flex items-center gap-0.5">
                    <Sparkles className="size-3" />
                    {patron.honorScore} pt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
