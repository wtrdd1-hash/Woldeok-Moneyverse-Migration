'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Gift,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  Crown,
  Flame,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { groupDigits } from '@/lib/money';
import { cn } from '@/lib/cn';

export interface MilestoneReward {
  readonly level: number;
  readonly rewardType: 'title' | 'wld' | 'collectible' | 'token' | 'trophy';
  readonly name: string;
  readonly description: string;
  readonly wldAmount?: number;
  readonly isMajor: boolean;
}

export const SEASON_1_MILESTONES: readonly MilestoneReward[] = [
  { level: 1, rewardType: 'title', name: '시즌 1 개척자 마커', description: '프로필에 표기되는 시즌 1 공식 참가자 엠블럼', isMajor: false },
  { level: 5, rewardType: 'wld', name: '300 WLD 지원금 + 스티커', description: '시즌 1 입문자를 위한 경제 정착 자금', wldAmount: 300, isMajor: false },
  { level: 10, rewardType: 'collectible', name: '창립 원장 기념 장식', description: '개인 공간에 배치 가능한 한정 소장품', isMajor: true },
  { level: 15, rewardType: 'token', name: '프로필 포인트 500 pt', description: '프로필 테두리 및 뱃지 꾸미기 포인트', isMajor: false },
  { level: 20, rewardType: 'token', name: '시즌 1 골든 토큰', description: '시즌 전용 교환 상점에서 사용 가능한 토큰', isMajor: true },
  { level: 25, rewardType: 'title', name: '칭호 조각: [개척가]', description: '시즌 칭호 조합을 위한 핵심 조각', isMajor: false },
  { level: 30, rewardType: 'collectible', name: '사업체 앰비언트 조명', description: '소유 사업체에 적용 가능한 네온 테마', isMajor: true },
  { level: 35, rewardType: 'collectible', name: '도시 지도 풀세트', description: '머니버스 대도시 역사 지도 소장품', isMajor: false },
  { level: 40, rewardType: 'title', name: '칭호: [First Capital Pioneer]', description: '시즌 1 상위 10% 시민에게 주어지는 영구 칭호', isMajor: true },
  { level: 45, rewardType: 'token', name: '오라 프로필 이펙트', description: '프로필 사진 주변을 감싸는 황금빛 오라', isMajor: false },
  { level: 50, rewardType: 'trophy', name: '시즌 1 완료 황금 트로피', description: '시즌 1을 마스터한 시민에게 수여되는 영구 명예 트로피 & 프레임', isMajor: true },
];

export function SeasonPassTrack({
  userXp = 18500,
  initialClaimedLevels = [1, 5, 10, 15],
}: {
  readonly userXp?: number;
  readonly initialClaimedLevels?: readonly number[];
}) {
  const [claimedLevels, setClaimedLevels] = useState<number[]>([...initialClaimedLevels]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1레벨당 1,000 XP
  const currentLevel = Math.min(50, Math.max(1, Math.floor(userXp / 1000) + 1));
  const currentLevelProgressXp = userXp % 1000;
  const progressPercent = Math.min(100, Math.floor((currentLevelProgressXp / 1000) * 100));

  // 수령 가능한 미수령 레벨 목록
  const claimableLevels = SEASON_1_MILESTONES.filter(
    (m) => m.level <= currentLevel && !claimedLevels.includes(m.level)
  ).map((m) => m.level);

  // 개별 수령
  const handleClaimSingle = (level: number) => {
    if (claimedLevels.includes(level) || level > currentLevel) return;
    const milestone = SEASON_1_MILESTONES.find((m) => m.level === level);
    setClaimedLevels((prev) => [...prev, level]);
    setToastMessage(`[Lv.${level}] ${milestone?.name ?? '보상'}을 성공적으로 수령했습니다!`);
  };

  // 전체 일괄 수령 (Claim All)
  const handleClaimAll = () => {
    if (claimableLevels.length === 0) return;
    setClaimedLevels((prev) => [...prev, ...claimableLevels]);
    setToastMessage(`총 ${claimableLevels.length}개의 마일스톤 달성 보상을 한 번에 모두 수령했습니다!`);
  };

  return (
    <div className="space-y-6">
      {/* 시즌 패스 헤더 & 현재 진행도 대시보드 */}
      <Card className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                  SEASON 1: FIRST CAPITAL
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">50개 티어 로드맵</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                시즌 1 패스 & 마일스톤 로드맵
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                일일·주간 퀘스트와 경제 활동으로 시즌 XP를 획득하고, 50단계 영구 명예 보상을 잠금 해제하세요.
              </CardDescription>
            </div>

            {/* 전체 일괄 수령 버튼 */}
            <div className="shrink-0">
              <Button
                onClick={handleClaimAll}
                disabled={claimableLevels.length === 0}
                className={cn(
                  'h-11 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2',
                  claimableLevels.length > 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Gift className="size-4" />
                <span>
                  {claimableLevels.length > 0
                    ? `수령 가능 보상 전체 받기 (${claimableLevels.length}건)`
                    : '모든 보상 수령 완료'}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground font-mono font-black text-xs">
                {currentLevel}
              </span>
              <span className="text-foreground">현재 티어: Level {currentLevel}</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {currentLevelProgressXp} / 1,000 XP (누적 {groupDigits(userXp)} XP)
            </span>
          </div>

          <div className="w-full bg-muted/60 rounded-full h-3 overflow-hidden p-0.5 border border-border/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 수령 결과 피드백 토스트 */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToastMessage(null)}
            className="text-xs h-7 px-2 hover:bg-emerald-500/20 text-emerald-500"
          >
            확인
          </Button>
        </div>
      )}

      {/* 50레벨 마일스톤 가로 스크롤 카드 레일 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>주요 마일스톤 보상 트랙</span>
          </h4>
          <span className="text-xs text-muted-foreground">
            수령 완료: {claimedLevels.length} / {SEASON_1_MILESTONES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SEASON_1_MILESTONES.map((m) => {
            const isUnlocked = m.level <= currentLevel;
            const isClaimed = claimedLevels.includes(m.level);
            const canClaim = isUnlocked && !isClaimed;

            return (
              <Card
                key={m.level}
                className={cn(
                  'rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs',
                  isClaimed && 'border-border/60 bg-muted/20 opacity-80',
                  canClaim && 'border-primary ring-1 ring-primary/40 bg-primary/5 shadow-md',
                  !isUnlocked && 'border-border/60 bg-card/60'
                )}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'font-mono text-xs font-black px-2 py-0.5 rounded-md',
                      m.isMajor ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-muted text-muted-foreground'
                    )}>
                      Lv.{m.level}
                    </span>
                    {isClaimed ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border bg-muted/50">
                        수령 완료
                      </Badge>
                    ) : canClaim ? (
                      <Badge className="text-[10px] bg-emerald-500 text-white animate-pulse">
                        수령 가능!
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1 border-border">
                        <Lock className="size-2.5" /> 잠김
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm font-bold mt-2 text-foreground flex items-center gap-1.5">
                    {m.rewardType === 'trophy' ? (
                      <Crown className="size-4 text-amber-500 shrink-0" />
                    ) : m.rewardType === 'collectible' ? (
                      <Trophy className="size-4 text-primary shrink-0" />
                    ) : (
                      <Gift className="size-4 text-emerald-500 shrink-0" />
                    )}
                    <span className="truncate">{m.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
                    {m.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="p-4 pt-2">
                  <Button
                    size="sm"
                    disabled={!canClaim}
                    onClick={() => handleClaimSingle(m.level)}
                    className={cn(
                      'w-full h-9 text-xs font-bold transition-all shadow-xs',
                      isClaimed && 'bg-muted text-muted-foreground border border-border cursor-not-allowed',
                      canClaim && 'bg-primary hover:bg-primary/90 text-primary-foreground',
                      !isUnlocked && 'bg-muted/50 text-muted-foreground/60 cursor-not-allowed'
                    )}
                  >
                    {isClaimed ? '수령 완료' : canClaim ? '보상 받기' : `Lv.${m.level} 달성 필요`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
