'use client';

import React from 'react';
import { Award, CheckCircle2, Download, Landmark, Share2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import type { SavingPocket } from './types';
import { INTL_LOCALE } from './copy';
import { useBankCopy } from './use-bank-copy';

interface SavingGoalCertificateDialogProps {
  readonly pocket: SavingPocket | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly userName?: string;
}

export function SavingGoalCertificateDialog({
  pocket,
  open,
  onOpenChange,
  userName,
}: SavingGoalCertificateDialogProps) {
  const { c, locale } = useBankCopy();
  if (!pocket) return null;

  const targetAmount = pocket.target_amount ? BigInt(pocket.target_amount) : 0n;
  const currentBalance = BigInt(pocket.balance || '0');
  const isCompleted = targetAmount > 0n && currentBalance >= targetAmount;
  const certNumber = `WLD-CERT-${pocket.pocket_id.slice(0, 8).toUpperCase()}`;
  const issueDate = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-amber-500/40 bg-card sm:rounded-2xl shadow-2xl">
        {/* 상단 골드 장식 띠 */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 ring-4 ring-amber-500/10 mb-1">
              <Award className="size-8" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                Official Digital Achievement Certificate
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {c('certTitle')}
              </h3>
            </div>
            <p className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
              {certNumber}
            </p>
          </div>

          {/* 인증서 본문 프레임 */}
          <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-5 sm:p-6 space-y-4 text-center">
            {/* 배경 워터마크 SVG 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Landmark className="size-48 text-foreground" />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {c('certBody')}
            </p>

            <div className="py-2 border-y border-amber-500/20 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[11px] text-muted-foreground block">{c('certPocket')}</span>
                <span className="font-bold text-sm text-foreground truncate block">{pocket.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{c('certRecipient')}</span>
                <span className="font-bold text-sm text-foreground truncate block">{userName ?? c('certDefaultUser')}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{c('certAmount')}</span>
                <span className="font-mono font-extrabold text-sm text-primary">
                  {groupDigits(pocket.balance)} WLD
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{c('certIssued')}</span>
                <span className="font-medium text-xs text-muted-foreground block">{issueDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground font-medium">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>{c('certVerified')}</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 font-medium"
              onClick={() => onOpenChange(false)}
            >
              {c('close')}
            </Button>
            <Button
              size="sm"
              className="text-xs h-9 font-semibold bg-amber-500 hover:bg-amber-600 text-amber-950 gap-1.5 shadow-sm"
              onClick={() => {
                alert(c('certSavedAlert'));
                onOpenChange(false);
              }}
            >
              <CheckCircle2 className="size-4" />
              <span>{c('certSave')}</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
