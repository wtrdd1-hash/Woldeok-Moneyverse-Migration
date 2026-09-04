'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import { activateLicenseAction, applyBoostAction, purchaseBusiness, settleBusiness, settleBusinessV2 } from './actions';

export function PurchaseButton({
  businessTypeId,
  lockedReason,
}: {
  readonly businessTypeId: string;
  readonly lockedReason: string | null;
}) {
  const [state, action] = useActionState(purchaseBusiness, IDLE);
  const locked = lockedReason !== null;
  return (
    <div className="grid gap-2 w-full">
      <form action={action} className="w-full">
        <input type="hidden" name="businessTypeId" value={businessTypeId} />
        <SubmitButton disabled={locked} className="w-full">
          {locked ? '아직 살 수 없어요' : '사업권 구입'}
        </SubmitButton>
      </form>
      {locked ? (
        <p className="text-xs text-muted-foreground">{lockedReason}</p>
      ) : (
        <ActionAlert state={state} />
      )}
    </div>
  );
}

export function SettleButton({ ownershipId }: { readonly ownershipId: string }) {
  const [state, action] = useActionState(settleBusiness, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="ownershipId" value={ownershipId} />
        <SubmitButton variant="outline">오늘 정산하기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function SettleV2Button({
  ownershipId,
  isSettledToday,
}: {
  readonly ownershipId: string;
  readonly isSettledToday: boolean;
}) {
  const [state, action] = useActionState(settleBusinessV2, IDLE);

  if (isSettledToday) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1.5 font-semibold text-xs">
          ✓ 오늘 정산 완료 (내일 00시 갱신)
        </Badge>
      </div>
    );
  }

  return (
    <div className="grid gap-2 w-full">
      <form action={action} className="w-full">
        <input type="hidden" name="ownershipId" value={ownershipId} />
        <SubmitButton className="w-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
          ⚡ 일일 정산 수령 (WLD 입금)
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function ActivateLicenseButton({
  catalogCode,
  businessName,
  quantity,
}: {
  readonly catalogCode: string;
  readonly businessName: string;
  readonly quantity: number;
}) {
  const [state, action] = useActionState(activateLicenseAction, IDLE);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="catalogCode" value={catalogCode} />
        <SubmitButton className="w-full font-semibold">
          {businessName} 설립하기 (보유: {quantity}개)
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function ApplyBoostModalButton({
  ownershipId,
  businessName,
  boostItems,
  activeBoost,
}: {
  readonly ownershipId: string;
  readonly businessName: string;
  readonly boostItems: readonly { code: string; name: string; quantity: number }[];
  readonly activeBoost: Record<string, unknown> | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action] = useActionState(applyBoostAction, IDLE);

  const hasBoost = activeBoost && activeBoost.name;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs h-8 gap-1.5"
      >
        <span>⚡</span>
        <span>{hasBoost ? '부스트 관리' : '부스트 장착'}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-border/80 bg-background/95 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">부스트 관리</Badge>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {businessName}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2">사업체 부스트 소모품 장착</CardTitle>
              <CardDescription className="text-xs">
                인벤토리에 보유한 부스트 소모품을 장착하여 일일 매출을 증폭하거나 운영비를 대폭 절감하세요.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {hasBoost ? (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
                  <span className="text-xs font-semibold text-primary block">현재 활성 부스트</span>
                  <p className="font-bold mt-1 text-foreground">{String(activeBoost.name)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    만료일: {String(activeBoost.expires_at).slice(0, 10)}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  현재 장착된 부스트가 없습니다. 아래 보유 부스트를 장착할 수 있습니다.
                </div>
              )}

              <div className="grid gap-2">
                <span className="text-xs font-semibold text-muted-foreground">장착 가능한 보유 부스트 아이템</span>
                {boostItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 text-center bg-muted/40 rounded-lg">
                    인벤토리에 보유 중인 사업체 부스트 아이템이 없습니다. 상점 2.0에서 구매하실 수 있습니다.
                  </p>
                ) : (
                  boostItems.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30"
                    >
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">보유 수량: {item.quantity}개</p>
                      </div>
                      <form action={action}>
                        <input type="hidden" name="ownershipId" value={ownershipId} />
                        <input type="hidden" name="boostCode" value={item.code} />
                        <SubmitButton size="sm" className="text-xs font-medium">
                          장착
                        </SubmitButton>
                      </form>
                    </div>
                  ))
                )}
              </div>

              <ActionAlert state={state} />

              <div className="flex justify-end mt-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  닫기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
