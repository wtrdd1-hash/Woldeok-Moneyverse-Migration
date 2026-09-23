'use client';

import React, { useState } from 'react';
import { Hammer, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';
import { P0_CRAFTING_RECIPES, type CraftingRecipe } from './crafting-recipes';
import type { MarketplaceHolding } from './marketplace';
import { executeCraftingAction } from './crafting-actions';

interface CraftingPanelProps {
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly onCraftSuccess?: (recipe: CraftingRecipe) => void;
}

export function CraftingPanel({ holdings, userBalanceWld, onCraftSuccess }: CraftingPanelProps) {
  const [activeRecipe, setActiveRecipe] = useState<CraftingRecipe | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftResult, setCraftResult] = useState<CraftingRecipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to check user holding quantity of a material
  const getHeldQuantity = (code: string): number => {
    return holdings
      .filter((h) => h.code === code)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const checkCanCraft = (recipe: CraftingRecipe) => {
    const hasEnoughBalance = BigInt(userBalanceWld || '0') >= BigInt(recipe.feeWld);
    const hasAllMaterials = recipe.materials.every((mat) => getHeldQuantity(mat.code) >= mat.requiredQuantity);
    return {
      canCraft: hasEnoughBalance && hasAllMaterials,
      hasEnoughBalance,
      hasAllMaterials,
    };
  };

  const handleStartCrafting = (recipe: CraftingRecipe) => {
    setActiveRecipe(recipe);
    setCraftResult(null);
    setErrorMessage(null);
  };

  const handleExecuteCraft = async () => {
    if (!activeRecipe) return;
    setIsCrafting(true);
    setErrorMessage(null);

    try {
      const res = await executeCraftingAction(activeRecipe.id);
      if (res.status === 'ok') {
        setCraftResult(activeRecipe);
        if (onCraftSuccess) {
          onCraftSuccess(activeRecipe);
        }
      } else {
        setErrorMessage(res.message ?? '제작 요청에 실패했습니다.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : '제작 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsCrafting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Hammer className="size-5 text-amber-500" />
          <h2 className="text-xl font-bold tracking-tight">제작 작업대 (P0 Crafting Bench)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          보유한 재료와 WLD 제작 수수료(HARD_SINK)를 투입하여 한정판 외형 치장, 복원 수집품, 사업체 부스트 모듈을 조합 제작합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        {P0_CRAFTING_RECIPES.map((recipe) => {
          const { canCraft, hasEnoughBalance } = checkCanCraft(recipe);
          return (
            <Card
              key={recipe.id}
              className={`flex flex-col justify-between border transition-all duration-200 ${
                canCraft
                  ? 'border-emerald-500/40 bg-emerald-500/5 hover:shadow-md'
                  : 'border-border/60 bg-card/60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={
                      recipe.resultItem.rarity === 'legendary'
                        ? 'default'
                        : recipe.resultItem.rarity === 'epic'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="capitalize font-mono text-[11px]"
                  >
                    {recipe.kind} · {recipe.resultItem.rarity}
                  </Badge>
                  {canCraft ? (                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="size-3.5" /> 제작 가능
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">재료 부족</span>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{recipe.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {recipe.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-3 text-xs">
                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-2">
                  <span className="font-semibold text-muted-foreground block text-[11px]">필요 재료</span>
                  <div className="space-y-1.5">
                    {recipe.materials.map((mat) => {
                      const held = getHeldQuantity(mat.code);
                      const isSatisfied = held >= mat.requiredQuantity;
                      return (
                        <div key={mat.code} className="flex items-center justify-between">
                          <span className="text-foreground">{mat.name}</span>
                          <span
                            className={`font-mono font-medium ${
                              isSatisfied ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            }`}
                          >
                            {held} / {mat.requiredQuantity}개
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t text-xs">
                  <span className="text-muted-foreground">제작 수수료 (소각)</span>
                  <span className="font-bold font-mono text-foreground">
                    {groupDigits(recipe.feeWld)} WLD
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  onClick={() => handleStartCrafting(recipe)}
                  disabled={!canCraft}
                  className="w-full"
                  variant={canCraft ? 'default' : 'outline'}
                >
                  <Hammer className="mr-2 size-4" />
                  {canCraft
                    ? '제작하기'
                    : !hasEnoughBalance
                      ? '수수료 WLD 부족'
                      : '필요 재료 부족'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Crafting Confirmation & Result Modal */}
      <Dialog
        open={Boolean(activeRecipe)}
        onOpenChange={(open) => {
          if (!open && !isCrafting) {
            setActiveRecipe(null);
            setCraftResult(null);
            setErrorMessage(null);
          }
        }}
      >
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hammer className="size-5 text-amber-500" />
              {craftResult ? '제작 완료!' : '아이템 제작 확인'}
            </DialogTitle>
            <DialogDescription>
              {craftResult
                ? '새로운 아이템이 인벤토리에 안전하게 지급되었습니다.'
                : '아래 재료와 수수료를 투입하여 제작을 진행합니다.'}
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {craftResult ? (
            <div className="grid gap-4 py-4">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center space-y-2">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-lg text-foreground">{craftResult.resultItem.name}</h3>
                <p className="text-xs text-muted-foreground">{craftResult.resultItem.description}</p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
                    인벤토리 보관 완료
                  </Badge>
                </div>
              </div>
            </div>
          ) : activeRecipe ? (
            <div className="grid gap-4 py-3 text-sm">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{activeRecipe.resultItem.name}</span>
                  <Badge variant="secondary" className="capitalize text-xs font-mono">
                    {activeRecipe.resultItem.rarity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activeRecipe.resultItem.description}</p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-muted-foreground block">소모 예정 재료 및 수수료</span>
                <ul className="divide-y rounded-lg border bg-background/50 px-3">
                  {activeRecipe.materials.map((mat) => (
                    <li key={mat.code} className="flex items-center justify-between py-2">
                      <span>{mat.name}</span>
                      <span className="font-mono font-bold text-foreground">-{mat.requiredQuantity}개</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between py-2 text-rose-500 font-semibold">
                    <span>제작 수수료 (WLD 소각)</span>
                    <span className="font-mono">-{groupDigits(activeRecipe.feeWld)} WLD</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 p-3 text-xs text-sky-700 dark:text-sky-300 border border-sky-500/20">
                <AlertCircle className="size-4 shrink-0" />
                <span>제작된 결과물은 마켓플레이스에 고정가격으로 판매 등록하거나 인벤토리에서 장착할 수 있습니다.</span>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            {craftResult ? (
              <Button onClick={() => setActiveRecipe(null)} className="w-full">
                확인
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActiveRecipe(null)}
                  disabled={isCrafting}
                >
                  취소
                </Button>
                <Button
                  onClick={handleExecuteCraft}
                  disabled={isCrafting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isCrafting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> 제작 처리 중...
                    </>
                  ) : (
                    <>
                      제작 승인 및 실행 <ArrowRight className="ml-1 size-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
