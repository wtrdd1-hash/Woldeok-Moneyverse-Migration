'use client';

import { useActionState } from 'react';
import { Award, CheckCircle2, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { certifyQualificationAction } from './actions';
import type {
  ActiveJobProgress,
  JobQualificationItem,
  QualificationCatalogItem,
} from './work';

interface Props {
  readonly activeJob: ActiveJobProgress | null | undefined;
  readonly catalog: readonly QualificationCatalogItem[];
  readonly acquired: readonly JobQualificationItem[];
  readonly isEn: boolean;
}

const INITIAL_ACTION_STATE = { status: 'idle' as const };

function CertifyButton({
  jobType,
  code,
  disabled,
  fee,
}: {
  readonly jobType: string;
  readonly code: string;
  readonly disabled: boolean;
  readonly fee: string;
}) {
  const [state, formAction, isPending] = useActionState(
    certifyQualificationAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="jobType" value={jobType} />
      <input type="hidden" name="qualificationCode" value={code} />
      <Button
        type="submit"
        disabled={disabled || isPending}
        size="sm"
        className="w-full font-semibold text-xs h-9 bg-primary hover:bg-primary/90 transition-all shadow-sm"
      >
        {isPending ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            심사 진행 중...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            자격심사 응시 ({groupDigits(fee)} WLD)
          </span>
        )}
      </Button>
      {state.status === 'error' && (
        <p className="mt-1.5 text-[11px] text-destructive text-center">{state.message}</p>
      )}
      {state.status === 'ok' && (
        <p className="mt-1.5 text-[11px] text-emerald-600 font-medium text-center">{state.message}</p>
      )}
    </form>
  );
}

export function CareerQualificationsCard({
  activeJob,
  catalog,
  acquired,
  isEn,
}: Props) {
  const currentJobType = activeJob?.job_type ?? null;
  const currentLevel = activeJob?.level ?? 1;

  const acquiredSet = new Map(
    acquired
      .filter((q) => q.job_type === currentJobType)
      .map((q) => [q.qualification_code, q]),
  );

  if (!currentJobType) {
    return null;
  }

  return (
    <section aria-labelledby="qualifications-title" className="grid w-full max-w-full min-w-0 gap-3 sm:gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 id="qualifications-title" className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="size-4" />
            </div>
            {isEn ? 'Professional Qualifications & Certification Center' : '전문 자격시험 및 자격증 센터'}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {isEn ? `Active Career: ${currentJobType.toUpperCase()}` : `현재 활성 직업: ${currentJobType.toUpperCase()}`}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {isEn
            ? 'Acquire official licenses and master portfolio honors to unlock higher identities. Examination fees are permanently deposited to the Central Treasury as HARD_SINK.'
            : '직무 자격증과 마스터 포트폴리오를 취득하여 상위 정체성과 권한을 획득하세요. 응시료는 중앙 국고에 영구 귀속(HARD_SINK)됩니다 (기획서 §7 준용).'}
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
        {catalog.map((spec) => {
          const isAcquired = acquiredSet.has(spec.code);
          const acquiredItem = acquiredSet.get(spec.code);
          const isEligible = currentLevel >= spec.min_level;

          return (
            <Card
              key={spec.code}
              className={`border transition-all flex flex-col justify-between ${
                isAcquired
                  ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
                  : isEligible
                    ? 'border-primary/30 hover:border-primary/60 shadow-sm'
                    : 'border-border/60 opacity-80 bg-muted/10'
              }`}
            >
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold mb-1 ${
                        isAcquired
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      {spec.tier_ko} (Lv.{spec.min_level}+)
                    </Badge>
                    <CardTitle className="text-base font-bold text-foreground">
                      {isEn ? spec.title : spec.title_ko}
                    </CardTitle>
                  </div>
                  {isAcquired ? (
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 shrink-0">
                      <CheckCircle2 className="size-4" />
                    </div>
                  ) : isEligible ? (
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <ShieldCheck className="size-4" />
                    </div>
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
                      <Lock className="size-3.5" />
                    </div>
                  )}
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {spec.description_ko}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0">
                <div className="rounded-lg border bg-background/80 p-2.5 my-2 text-xs grid gap-1">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>국고 심사 수수료:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {groupDigits(spec.fee_wld)} WLD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>필요 레벨:</span>
                    <span className={`font-mono font-semibold ${isEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
                      Lv.{spec.min_level} (현재 Lv.{currentLevel})
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 sm:p-5 pt-0">
                {isAcquired ? (
                  <div className="w-full text-center py-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5" />
                    자격 취득 완료 ({new Date(acquiredItem!.acquired_at).toLocaleDateString('ko-KR')})
                  </div>
                ) : isEligible ? (
                  <CertifyButton
                    jobType={currentJobType}
                    code={spec.code}
                    disabled={false}
                    fee={spec.fee_wld}
                  />
                ) : (
                  <Button
                    disabled
                    size="sm"
                    variant="outline"
                    className="w-full text-xs text-muted-foreground h-9"
                  >
                    Lv.{spec.min_level} 달성 시 응시 가능
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
