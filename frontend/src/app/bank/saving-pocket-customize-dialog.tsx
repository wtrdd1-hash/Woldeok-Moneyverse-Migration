'use client';

import React, { useActionState, useState } from 'react';
import {
  Palette,
  PiggyBank,
  Wallet,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Heart,
  Coins,
  Check,
} from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import type { SavingPocket } from './types';
import { customizePocketAction } from './actions';
import { useBankCopy } from './use-bank-copy';

interface SavingPocketCustomizeDialogProps {
  readonly pocket: SavingPocket | null;
  readonly cashBalance: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const THEME_COLORS = [
  { id: 'sky', label: 'themeSky', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-600 dark:text-sky-400', bar: 'bg-sky-500', hex: '#0284c7' },
  { id: 'emerald', label: 'themeEmerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', hex: '#10b981' },
  { id: 'amber', label: 'themeAmber', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', hex: '#f59e0b' },
  { id: 'violet', label: 'themeViolet', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-600 dark:text-violet-400', bar: 'bg-violet-500', hex: '#8b5cf6' },
  { id: 'rose', label: 'themeRose', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500', hex: '#f43f5e' },
  { id: 'slate', label: 'themeSlate', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-600 dark:text-slate-400', bar: 'bg-slate-500', hex: '#64748b' },
] as const;

const ICON_PACKS = [
  { id: 'piggy-bank', label: 'iconPiggy', icon: PiggyBank },
  { id: 'wallet', label: 'iconWallet', icon: Wallet },
  { id: 'sparkles', label: 'iconSparkles', icon: Sparkles },
  { id: 'trending-up', label: 'iconTrending', icon: TrendingUp },
  { id: 'shield-check', label: 'iconShield', icon: ShieldCheck },
  { id: 'heart', label: 'iconHeart', icon: Heart },
] as const;

export function SavingPocketCustomizeDialog({
  pocket,
  cashBalance,
  open,
  onOpenChange,
}: SavingPocketCustomizeDialogProps) {
  const [selectedColor, setSelectedColor] = useState<string>(pocket?.theme_color || 'sky');
  const [selectedIcon, setSelectedIcon] = useState<string>(pocket?.icon_code || 'piggy-bank');
  const [intentKey, setIntentKey] = useState('');
  const [state, formAction, pending] = useActionState(customizePocketAction, IDLE);
  const { c } = useBankCopy();

  // 다이얼로그 열릴 때 초기화
  React.useEffect(() => {
    if (pocket) {
      setSelectedColor(pocket.theme_color || 'sky');
      setSelectedIcon(pocket.icon_code || 'piggy-bank');
    }
  }, [pocket]);

  const pocketId = pocket?.pocket_id ?? null;
  React.useEffect(() => {
    // A different pocket or a newly opened dialog is a different paid intent.
    setIntentKey(open && pocketId ? globalThis.crypto.randomUUID() : '');
  }, [open, pocketId]);

  const currentColor = pocket?.theme_color || 'sky';
  const currentIcon = pocket?.icon_code || 'piggy-bank';

  // 변경 여부에 따른 WLD 비용 계산 (색상 변경 100 WLD, 아이콘 변경 300 WLD)
  const isColorChanged = selectedColor !== currentColor;
  const isIconChanged = selectedIcon !== currentIcon;
  const totalCost = (isColorChanged ? 100 : 0) + (isIconChanged ? 300 : 0);

  const cashNum = Number.parseInt(cashBalance.replaceAll(',', '') || '0', 10);
  const isInsufficient = cashNum < totalCost;

  const activeThemeObj = THEME_COLORS.find((c) => c.id === selectedColor) || THEME_COLORS[0];
  const ActiveIconObj = ICON_PACKS.find((i) => i.id === selectedIcon)?.icon || PiggyBank;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            <span>{c('customTitle', { name: pocket?.name ?? '' })}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {c('customDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* 1. 실시간 미리보기 카드 */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {c('customPreview')}
          </span>
          <div
            className={`rounded-xl border p-4 transition-all duration-200 ${activeThemeObj.bg} ${activeThemeObj.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-lg bg-background/90 shadow-sm ${activeThemeObj.text}`}>
                  <ActiveIconObj className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{pocket?.name}</h4>
                  <span className="text-xs font-mono text-muted-foreground">
                    {groupDigits(pocket?.balance || '0')} WLD
                  </span>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${activeThemeObj.text} border-current/30`}>
                {c(activeThemeObj.label)}
              </Badge>
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="pocketId" value={pocket?.pocket_id || ''} />
          <input type="hidden" name="idempotencyKey" value={intentKey} />
          <input type="hidden" name="themeColor" value={selectedColor} />
          <input type="hidden" name="iconCode" value={selectedIcon} />

          {/* 2. 테마 색상 선택 (100 WLD) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{c('themeColor')}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{c('customColorFee')}</span>
              </label>
              {isColorChanged && (
                <Badge variant="secondary" className="text-[10px] font-mono text-primary font-bold">
                  +100 WLD
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {THEME_COLORS.map((color) => {
                const isSelected = selectedColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      if (selectedColor !== color.id) {
                        setSelectedColor(color.id);
                        setIntentKey(globalThis.crypto.randomUUID());
                      }
                    }}
                    disabled={pending}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-sm scale-105'
                        : 'border-border/80 hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: `${color.hex}20` }}
                    title={c(color.label)}
                  >
                    <div
                      className="size-4 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 아이콘 팩 선택 (300 WLD) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{c('customIconPack')}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{c('customIconFee')}</span>
              </label>
              {isIconChanged && (
                <Badge variant="secondary" className="text-[10px] font-mono text-primary font-bold">
                  +300 WLD
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ICON_PACKS.map((item) => {
                const isSelected = selectedIcon === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (selectedIcon !== item.id) {
                        setSelectedIcon(item.id);
                        setIntentKey(globalThis.crypto.randomUUID());
                      }
                    }}
                    disabled={pending}
                    className={`h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30 text-primary font-bold shadow-sm'
                        : 'border-border/80 bg-background/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="size-5" />
                    <span className="text-[10px]">{c(item.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. 결제 금액 및 보유 현금 안내 */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{c('cashBalance')}</span>
              <span className="font-mono font-bold text-foreground">{groupDigits(cashBalance)} WLD</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Coins className="size-3.5 text-amber-500" />
                <span>{c('customTotalFee')}</span>
              </span>
              <span className={`font-mono font-bold ${isInsufficient ? 'text-destructive' : 'text-primary'}`}>
                {groupDigits(totalCost.toString())} WLD
              </span>
            </div>
            {isInsufficient && totalCost > 0 && (
              <p className="text-[11px] text-destructive pt-0.5">
                {c('customInsufficient')}
              </p>
            )}
          </div>

          <ActionAlert state={state} />

          <DialogFooter className="gap-2 sm:gap-0 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {c('close')}
            </Button>
            <SubmitButton
              disabled={pending || !intentKey || isInsufficient || (!isColorChanged && !isIconChanged)}
              size="sm"
              className="bg-primary text-primary-foreground font-semibold"
            >
              {totalCost > 0 ? c('customApply', { amount: groupDigits(totalCost.toString()) }) : c('customNoChange')}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
