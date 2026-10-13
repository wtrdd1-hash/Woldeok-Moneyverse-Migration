'use client';

import React from 'react';
import {
  Sparkles,
  Rocket,
  HeartHandshake,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TreasuryProgramMeta, UserEligibilityStatus } from './treasury.types';

interface TreasuryProgramCardProps {
  readonly program: TreasuryProgramMeta;
  readonly eligibility: UserEligibilityStatus;
  readonly onClaim: (programId: string) => void;
  readonly onOpenGrantModal: () => void;
  readonly isEn?: boolean | undefined;
}

export function TreasuryProgramCard({
  program,
  eligibility,
  onClaim,
  onOpenGrantModal,
  isEn = false,
}: TreasuryProgramCardProps) {
  const getProgramIcon = () => {
    switch (program.id) {
      case 'CITIZEN_DIVIDEND':
        return <Sparkles className="size-5 text-purple-400" />;
      case 'STARTUP_GRANT':
        return <Rocket className="size-5 text-sky-400" />;
      case 'EMERGENCY_RELIEF':
        return <HeartHandshake className="size-5 text-emerald-400" />;
      case 'BUYBACK_BURN':
        return <Flame className="size-5 text-rose-400" />;
      case 'BOND_YIELD_BOOSTER':
        return <TrendingUp className="size-5 text-amber-400" />;
      default:
        return <Sparkles className="size-5 text-primary" />;
    }
  };

  const isClaimable = () => {
    if (!eligibility.isLoggedIn) return false;
    if (program.id === 'CITIZEN_DIVIDEND') return eligibility.citizenDividendEligible;
    if (program.id === 'EMERGENCY_RELIEF') return eligibility.emergencyReliefEligible;
    if (program.id === 'BOND_YIELD_BOOSTER') return eligibility.bondBoosterEligible;
    return false;
  };

  return (
    <Card className="moneyverse-card border-border/70 bg-card/60 shadow-sm hover:border-primary/50 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="p-2 rounded-xl bg-muted/60 border border-border/60">
            {getProgramIcon()}
          </div>
          <Badge variant="outline" className={`font-mono text-[11px] ${program.badgeColor}`}>
            {program.badgeText}
          </Badge>
        </div>

        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-foreground">
            {isEn ? program.titleEn : program.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {program.subtitle}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
        <p className="text-xs text-muted-foreground/90 leading-relaxed">
          {program.description}
        </p>

        {/* 혜택 및 조건 스펙 */}
        <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{isEn ? 'Max Benefit' : '지원 한도/혜택'}:</span>
            <span className="font-bold text-primary tabular-nums">{program.maxBenefitText}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {isEn ? 'Cooldown' : '주기/쿨다운'}:
            </span>
            <span className="text-foreground">{program.cooldownDesc}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">{isEn ? 'Requirement' : '지원 요건'}:</span>
            <span className="text-muted-foreground truncate max-w-[160px]" title={program.requirementDesc}>
              {program.requirementDesc}
            </span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="pt-1">
          {program.id === 'BUYBACK_BURN' ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              disabled
            >
              <Flame className="size-3.5 mr-1" />
              {isEn ? 'Automated Macro Engine' : '거시경제 알고리즘 자동 집행 중'}
            </Button>
          ) : program.id === 'STARTUP_GRANT' ? (
            <Button
              size="sm"
              onClick={onOpenGrantModal}
              className="w-full text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs"
            >
              <Rocket className="size-3.5 mr-1" />
              {isEn ? 'Apply for Startup Grant' : '창업 그랜트 지원서 작성하기'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onClaim(program.id)}
              disabled={!isClaimable()}
              className={`w-full text-xs font-bold shadow-xs ${
                isClaimable()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isClaimable() ? (
                <>
                  <CheckCircle2 className="size-3.5 mr-1" />
                  {isEn ? 'Claim Benefit Instantly' : '지금 즉시 국고 혜택 수령하기'}
                </>
              ) : !eligibility.isLoggedIn ? (
                <>
                  <Lock className="size-3.5 mr-1" />
                  {isEn ? 'Login Required to Claim' : '로그인 후 수령 가능'}
                </>
              ) : (
                <>
                  <Clock className="size-3.5 mr-1" />
                  {isEn ? 'Cooldown in progress' : '수령 쿨다운 진행 중'}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
