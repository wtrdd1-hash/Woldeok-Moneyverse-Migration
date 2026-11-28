'use client';

import { Landmark, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { memberBankEvidence } from './member-bank-evidence';
import { useBankCopy } from './use-bank-copy';

interface BankLiquidityCardProps {
  readonly bankBalance: string;
  readonly loanDebt: string;
  readonly creditLimit: string;
}

export function BankLiquidityCard({ bankBalance, loanDebt, creditLimit }: BankLiquidityCardProps) {
  const { c } = useBankCopy();
  const evidence = memberBankEvidence({ bankBalance, loanDebt, creditLimit });

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/60 shadow-sm">
      <CardHeader className="space-y-2 border-b border-border/60 bg-muted/15 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Landmark aria-hidden="true" className="size-5 text-primary" />
          {c('liqTitle')}
        </CardTitle>
        <CardDescription>
          {c('liqDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        {evidence ? (
          <>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [c('liqDeposits'), evidence.deposit],
                [c('liqOutstanding'), evidence.outstanding],
                [c('liqCreditLimit'), evidence.creditLimit],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-lg border border-border/70 p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-all font-mono text-base font-semibold tabular-nums">
                    {groupDigits(value)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2 rounded-lg border border-border/70 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold">{c('liqRatio')}</span>
                <span className="font-mono font-bold tabular-nums">
                  {evidence.debtToLimit ?? c('liqNotAvailable')}
                </span>
              </div>
              {evidence.debtToLimitBar === null ? (
                <p className="text-xs text-muted-foreground">
                  {c('liqZeroLimit')}
                </p>
              ) : (
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${evidence.debtToLimitBar}%` }} />
                </div>
              )}
            </div>
          </>
        ) : (
          <p role="status" className="rounded-lg border border-amber-500/40 p-3 text-sm">
            {c('liqUnverified')}
          </p>
        )}
        <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {c('liqDisclaimer')}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
