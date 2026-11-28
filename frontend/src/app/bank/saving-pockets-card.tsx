'use client';

import React, { useActionState, useState } from 'react';
import {
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Archive,
  Target,
  Sparkles,
  TrendingUp,
  FolderLock,
  Calendar,
  AlertCircle,
  Palette,
  Wallet,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Amount } from '@/components/amount';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import type { SavingPocket } from './types';
import {
  archivePocketAction,
  createPocketAction,
  transferPocketAction,
} from './actions';
import { SavingGoalCertificateDialog } from './saving-goal-certificate-dialog';
import { SavingPocketCustomizeDialog } from './saving-pocket-customize-dialog';
import { useBankCopy } from './use-bank-copy';

interface SavingPocketsCardProps {
  readonly pockets: readonly SavingPocket[];
  readonly cashBalance: string;
  readonly bankBalance: string;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-600 dark:text-sky-400', bar: 'bg-sky-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-600 dark:text-violet-400', bar: 'bg-violet-500' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-600 dark:text-slate-400', bar: 'bg-slate-500' },
};

function getPocketIcon(iconCode?: string) {
  switch (iconCode) {
    case 'wallet': return Wallet;
    case 'sparkles': return Sparkles;
    case 'trending-up': return TrendingUp;
    case 'shield-check': return ShieldCheck;
    case 'heart': return Heart;
    default: return PiggyBank;
  }
}


export function SavingPocketsCard({
  pockets,
  cashBalance,
  bankBalance,
}: SavingPocketsCardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [transferPocket, setTransferPocket] = useState<SavingPocket | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<SavingPocket | null>(null);
  const [certPocket, setCertPocket] = useState<SavingPocket | null>(null);
  const [customizePocket, setCustomizePocket] = useState<SavingPocket | null>(null);

  const [createState, handleCreate] = useActionState(createPocketAction, IDLE);
  const [transferState, handleTransfer] = useActionState(transferPocketAction, IDLE);
  const [archiveState, handleArchive] = useActionState(archivePocketAction, IDLE);

  const activePockets = pockets.filter((p) => !p.is_archived);
  const { c } = useBankCopy();

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PiggyBank className="size-5 text-amber-500" />
            <span>{c('pocketsTitle')}</span>
            <Badge variant="outline" className="font-mono text-xs ml-1">
              {c('pocketsActiveCount', { count: `${activePockets.length}` })}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            {c('pocketsDescription')}
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 text-xs font-semibold gap-1.5 h-9"
        >
          <Plus className="size-3.5" />
          <span>{c('pocketsNew')}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {activePockets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-muted/40 mx-auto flex items-center justify-center text-muted-foreground">
              <FolderLock className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {c('pocketsEmptyTitle')}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {c('pocketsEmptyBody')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-xs font-medium"
            >
              <Plus className="size-3.5 mr-1" />
              <span>{c('pocketsCreateFirst')}</span>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activePockets.map((pocket) => {
              const theme = (COLOR_MAP[pocket.theme_color] ?? COLOR_MAP.sky)!;
              const IconComponent = getPocketIcon(pocket.icon_code);
              const hasTarget = Boolean(pocket.target_amount && BigInt(pocket.target_amount) > 0n);
              const balanceBig = BigInt(pocket.balance || '0');
              const targetBig = hasTarget ? BigInt(pocket.target_amount!) : 1n;
              const progressPct = hasTarget
                ? Math.min(100, Math.floor(Number((balanceBig * 100n) / targetBig)))
                : 0;

              return (
                <div
                  key={pocket.pocket_id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all duration-150 ${theme.bg} ${theme.border}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`p-2 rounded-lg bg-background/80 shadow-xs ${theme.text} shrink-0`}>
                          <IconComponent className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {pocket.name}
                          </h4>
                          {pocket.target_date && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-2.5 shrink-0" />
                              <span className="truncate">{c('pocketsTargetDate', { date: pocket.target_date })}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {hasTarget && (
                        <div className="flex items-center gap-1 shrink-0">
                          {progressPct >= 100 ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setCertPocket(pocket)}
                              className="h-6 px-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 rounded-md gap-1"
                            >
                              <Sparkles className="size-3 text-amber-500" />
                              <span>{c('pocketsCertificate')}</span>
                            </Button>
                          ) : (
                            <Badge variant="outline" className={`font-mono text-[10px] ${theme.text} border-current/30`}>
                              {c('pocketsProgress', { pct: `${progressPct}` })}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground block">{c('pocketsSaved')}</span>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="text-lg font-extrabold font-mono text-foreground">
                          {groupDigits(pocket.balance)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">WLD</span>
                        </span>
                        {hasTarget && (
                          <span className="text-xs font-mono text-muted-foreground">
                            / {groupDigits(pocket.target_amount!)} WLD
                          </span>
                        )}
                      </div>
                      {hasTarget && (
                        <div className="h-1.5 w-full rounded-full bg-background/60 overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-border/40 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs font-semibold bg-background/80 hover:bg-background"
                      onClick={() => setTransferPocket(pocket)}
                    >
                      <ArrowRightLeft className="size-3 mr-1" />
                      <span>{c('pocketsTransfer')}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs font-semibold bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                      onClick={() => setCustomizePocket(pocket)}
                      title={c('pocketsThemeTitle')}
                    >
                      <Palette className="size-3 mr-1 text-primary" />
                      <span>{c('pocketsTheme')}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                      onClick={() => setArchiveTarget(pocket)}
                      title={c('pocketsArchiveTitle')}
                    >
                      <Archive className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* 새 포켓 개설 다이얼로그 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="size-5 text-amber-500" />
              <span>{c('pocketsCreateTitle')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {c('pocketsCreateDescription')}
            </DialogDescription>
          </DialogHeader>

          <form action={handleCreate} className="space-y-4 py-2">
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel className="text-xs font-semibold">{c('pocketsName')}</FieldLabel>
                <Input
                  name="name"
                  placeholder={c('pocketsNamePlaceholder')}
                  required
                  className="h-10 text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold">{c('pocketsTargetAmount')}</FieldLabel>
                <Input
                  name="targetAmount"
                  type="number"
                  min="1"
                  placeholder={c('pocketsTargetAmountPlaceholder')}
                  className="h-10 text-sm font-mono"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold">{c('pocketsTargetDateLabel')}</FieldLabel>
                <Input
                  name="targetDate"
                  type="date"
                  className="h-10 text-sm font-mono"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold">{c('themeColor')}</FieldLabel>
                <div className="flex items-center gap-3 pt-1">
                  {(['sky', 'emerald', 'amber', 'violet', 'rose'] as const).map((color) => (
                    <label key={color} className="flex items-center gap-1.5 cursor-pointer text-xs capitalize">
                      <input
                        type="radio"
                        name="themeColor"
                        value={color}
                        defaultChecked={color === 'sky'}
                        className="accent-primary"
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </FieldGroup>

            <ActionAlert state={createState} />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                {c('cancel')}
              </Button>
              <SubmitButton className="bg-primary text-primary-foreground font-semibold">
                {c('pocketsCreateSubmit')}
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 포켓 자금 입출금 다이얼로그 */}
      {transferPocket && (
        <Dialog open={Boolean(transferPocket)} onOpenChange={() => setTransferPocket(null)}>
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="size-5 text-primary" />
                <span>{c('pocketsTransferTitle', { name: transferPocket.name })}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {c('pocketsTransferBalance')}<strong className="font-mono text-foreground">{groupDigits(transferPocket.balance)} WLD</strong>{c('pocketsTransferBank')}<strong className="font-mono text-foreground">{groupDigits(bankBalance)} WLD</strong>
              </DialogDescription>
            </DialogHeader>

            <form action={handleTransfer} className="space-y-4 py-2">
              <input type="hidden" name="pocketId" value={transferPocket.pocket_id} />
              
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel className="text-xs font-semibold">{c('pocketsDirection')}</FieldLabel>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border/80 bg-background/60 cursor-pointer font-semibold text-xs hover:border-primary">
                      <input type="radio" name="direction" value="IN" defaultChecked className="accent-primary" />
                      <span>{c('pocketsDirectionIn')}</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border/80 bg-background/60 cursor-pointer font-semibold text-xs hover:border-primary">
                      <input type="radio" name="direction" value="OUT" className="accent-primary" />
                      <span>{c('pocketsDirectionOut')}</span>
                    </label>
                  </div>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-semibold">{c('pocketsTransferAmount')}</FieldLabel>
                  <Input
                    name="amount"
                    type="number"
                    min="1"
                    placeholder={c('pocketsTransferPlaceholder')}
                    required
                    className="h-10 text-sm font-mono"
                  />
                </Field>
              </FieldGroup>

              <ActionAlert state={transferState} />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setTransferPocket(null)}>
                  {c('cancel')}
                </Button>
                <SubmitButton className="font-semibold">
                  {c('pocketsTransferSubmit')}
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 포켓 해지 다이얼로그 */}
      {archiveTarget && (
        <Dialog open={Boolean(archiveTarget)} onOpenChange={() => setArchiveTarget(null)}>
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Archive className="size-5" />
                <span>{c('pocketsArchiveDialogTitle', { name: archiveTarget.name })}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {c('pocketsArchiveBefore')}<strong className="font-mono text-foreground">{groupDigits(archiveTarget.balance)} WLD</strong>{c('pocketsArchiveAfter')}
              </DialogDescription>
            </DialogHeader>

            <form action={handleArchive} className="space-y-4 py-2">
              <input type="hidden" name="pocketId" value={archiveTarget.pocket_id} />
              
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{c('pocketsArchiveWarning')}</span>
              </div>

              <ActionAlert state={archiveState} />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setArchiveTarget(null)}>
                  {c('cancel')}
                </Button>
                <SubmitButton className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                  {c('pocketsArchiveSubmit')}
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 목표 달성 명예 증서 다이얼로그 */}
      <SavingGoalCertificateDialog
        pocket={certPocket}
        open={Boolean(certPocket)}
        onOpenChange={(open) => {
          if (!open) setCertPocket(null);
        }}
      />

      {/* 포켓 테마 및 아이콘 커스텀 다이얼로그 */}
      <SavingPocketCustomizeDialog
        pocket={customizePocket}
        cashBalance={cashBalance}
        open={Boolean(customizePocket)}
        onOpenChange={(open) => {
          if (!open) setCustomizePocket(null);
        }}
      />
    </Card>
  );
}
