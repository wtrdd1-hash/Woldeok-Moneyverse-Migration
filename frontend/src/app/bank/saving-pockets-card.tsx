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
import { TranslatedText as T } from '@/components/translated-text';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import type { SavingPocket } from './types';
import {
  archivePocketAction,
  createPocketAction,
  transferPocketAction,
} from './actions';

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
};

export function SavingPocketsCard({
  pockets,
  cashBalance,
  bankBalance,
}: SavingPocketsCardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [transferPocket, setTransferPocket] = useState<SavingPocket | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<SavingPocket | null>(null);

  const [createState, handleCreate] = useActionState(createPocketAction, IDLE);
  const [transferState, handleTransfer] = useActionState(transferPocketAction, IDLE);
  const [archiveState, handleArchive] = useActionState(archivePocketAction, IDLE);

  const activePockets = pockets.filter((p) => !p.is_archived);

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PiggyBank className="size-5 text-amber-500" />
            <span><T korean="목적별 저축 포켓" english="Saving Pockets" /></span>
            <Badge variant="outline" className="font-mono text-xs ml-1">
              {activePockets.length}개 운영 중
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            <T
              korean="비상금, 주식 시드머니, 부동산 청약 등 목적별로 자금을 분리 보관하고 목표를 달성하세요."
              english="Segregate your funds into purpose-driven pockets to reach your goals."
            />
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 text-xs font-semibold gap-1.5 h-9"
        >
          <Plus className="size-3.5" />
          <span><T korean="새 포켓 개설" english="New Pocket" /></span>
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
                <T korean="아직 개설된 저축 포켓이 없어요." english="No active saving pockets yet." />
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                <T
                  korean="메인 예금과 별개로 특정 목적에 맞는 목표 금액을 설정하고 저축을 시작해 보세요."
                  english="Set target amounts and build focused savings apart from your main bank account."
                />
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-xs font-medium"
            >
              <Plus className="size-3.5 mr-1" />
              <span><T korean="첫 저축 포켓 만들기" english="Create First Pocket" /></span>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activePockets.map((pocket) => {
              const theme = (COLOR_MAP[pocket.theme_color] ?? COLOR_MAP.sky)!;
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
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-background/80 shadow-xs ${theme.text}`}>
                          <PiggyBank className="size-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground truncate max-w-[130px]">
                            {pocket.name}
                          </h4>
                          {pocket.target_date && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-2.5" />
                              {pocket.target_date} 목표
                            </span>
                          )}
                        </div>
                      </div>
                      {hasTarget && (
                        <Badge variant="outline" className={`font-mono text-[10px] ${theme.text} border-current/30`}>
                          {progressPct}% 달성
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground block">현재 모은 금액</span>
                      <div className="flex items-baseline justify-between">
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
                      <span>입출금</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                      onClick={() => setArchiveTarget(pocket)}
                      title="포켓 해지"
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
              <span><T korean="새 저축 포켓 개설" english="Create Saving Pocket" /></span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              <T
                korean="목적과 목표 금액을 설정하여 맞춤형 저축 통장을 만듭니다."
                english="Create a tailored pocket with target amount and date."
              />
            </DialogDescription>
          </DialogHeader>

          <form action={handleCreate} className="space-y-4 py-2">
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel className="text-xs font-semibold">포켓 이름</FieldLabel>
                <Input
                  name="name"
                  placeholder="예: 유럽 여행 자금, 비상금"
                  required
                  className="h-10 text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold">목표 금액 (WLD, 선택)</FieldLabel>
                <Input
                  name="targetAmount"
                  type="number"
                  min="1"
                  placeholder="예: 10000"
                  className="h-10 text-sm font-mono"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold">목표 달성일 (선택)</FieldLabel>
                <Input
                  name="targetDate"
                  type="date"
                  className="h-10 text-sm font-mono"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold">테마 색상</FieldLabel>
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
                취소
              </Button>
              <SubmitButton className="bg-primary text-primary-foreground font-semibold">
                포켓 개설하기
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
                <span>{transferPocket.name} 자금 이체</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                포켓 잔액: <strong className="font-mono text-foreground">{groupDigits(transferPocket.balance)} WLD</strong> · 메인 은행: <strong className="font-mono text-foreground">{groupDigits(bankBalance)} WLD</strong>
              </DialogDescription>
            </DialogHeader>

            <form action={handleTransfer} className="space-y-4 py-2">
              <input type="hidden" name="pocketId" value={transferPocket.pocket_id} />
              
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel className="text-xs font-semibold">이체 방향</FieldLabel>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border/80 bg-background/60 cursor-pointer font-semibold text-xs hover:border-primary">
                      <input type="radio" name="direction" value="IN" defaultChecked className="accent-primary" />
                      <span>메인 은행 ➔ 포켓 (입금)</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border/80 bg-background/60 cursor-pointer font-semibold text-xs hover:border-primary">
                      <input type="radio" name="direction" value="OUT" className="accent-primary" />
                      <span>포켓 ➔ 메인 은행 (출금)</span>
                    </label>
                  </div>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-semibold">이체 금액 (WLD)</FieldLabel>
                  <Input
                    name="amount"
                    type="number"
                    min="1"
                    placeholder="1 WLD 이상 입력"
                    required
                    className="h-10 text-sm font-mono"
                  />
                </Field>
              </FieldGroup>

              <ActionAlert state={transferState} />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setTransferPocket(null)}>
                  취소
                </Button>
                <SubmitButton className="font-semibold">
                  이체 실행
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
                <span>&apos;{archiveTarget.name}&apos; 저축 포켓 해지</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                포켓을 해지하면 보관 중인 잔액 <strong className="font-mono text-foreground">{groupDigits(archiveTarget.balance)} WLD</strong>가 메인 현금 계좌로 즉시 안전하게 반환됩니다.
              </DialogDescription>
            </DialogHeader>

            <form action={handleArchive} className="space-y-4 py-2">
              <input type="hidden" name="pocketId" value={archiveTarget.pocket_id} />
              
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>해지된 포켓은 복구할 수 없으며 언제든 새 포켓을 개설할 수 있습니다.</span>
              </div>

              <ActionAlert state={archiveState} />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setArchiveTarget(null)}>
                  취소
                </Button>
                <SubmitButton className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                  포켓 해지 및 잔액 회수
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
