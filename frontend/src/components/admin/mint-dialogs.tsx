'use client';

import { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Flame, Coins, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PolicyOrderSummary {
  id: string;
  order_type: string;
  target_envelope: string;
  max_amount_wld: string;
  executed_amount_wld: string;
  status: string;
  reason: string;
  expires_at: string;
}

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeOrders: PolicyOrderSummary[];
  initialOrderId?: string | null;
}

export function MintExecutionDialog({
  isOpen,
  onClose,
  onSuccess,
  activeOrders,
  initialOrderId,
}: MintModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderId || activeOrders[0]?.id || '',
  );
  const [amountWld, setAmountWld] = useState<string>('100000');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedOrder = activeOrders.find((o) => o.id === selectedOrderId);
  const remainingWld = selectedOrder
    ? BigInt(selectedOrder.max_amount_wld) - BigInt(selectedOrder.executed_amount_wld)
    : BigInt(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      setErrorMsg('발행할 승인 정책 명령서를 선택해 주세요.');
      return;
    }
    const amount = BigInt(amountWld || '0');
    if (amount <= BigInt(0)) {
      setErrorMsg('발행 수량은 1 WLD 이상의 정수여야 합니다.');
      return;
    }
    if (amount > remainingWld) {
      setErrorMsg(`해당 명령서의 남은 발행 가능액(${remainingWld.toLocaleString('ko-KR')} WLD)을 초과할 수 없습니다.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const idempotencyKey = `mint-exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const res = await fetch('/api/admin/mint/execute-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_order_id: selectedOrderId,
          amount_wld: amountWld,
          recipient_user_id: null, // 국고 중앙 금고(VAULT_MAIN) 자동 입고
          idempotency_key: idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '화폐 발행 실행에 실패했습니다.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mint-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="size-5" />
              </div>
              <div>
                <h3 id="mint-dialog-title" className="text-lg font-bold text-foreground">
                  신규 통화(M0) 정식 주조
                </h3>
                <p className="text-xs text-muted-foreground">
                  승인된 통화정책 명령서 한도 내에서 M0 신규 본원통화를 발행합니다.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMsg && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                승인된 정책 명령서 (APPROVED Order)
              </label>
              {activeOrders.length === 0 ? (
                <p className="text-xs text-destructive p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  현재 즉시 발행 가능한 APPROVED 상태의 정책 명령서가 없습니다.
                </p>
              ) : (
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {activeOrders.map((order) => {
                    const rem = BigInt(order.max_amount_wld) - BigInt(order.executed_amount_wld);
                    return (
                      <option key={order.id} value={order.id}>
                        [{order.target_envelope}] 잔여: {rem.toLocaleString('ko-KR')} WLD (최대 {BigInt(order.max_amount_wld).toLocaleString('ko-KR')} WLD)
                      </option>
                    );
                  })}
                </select>
              )}
              {selectedOrder && (
                <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>정책 사유:</span>
                    <span className="font-medium text-foreground">{selectedOrder.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>남은 발행 한도:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {remainingWld.toLocaleString('ko-KR')} WLD
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                주조 수량 (WLD)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={amountWld}
                  onChange={(e) => setAmountWld(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="예: 100000"
                  disabled={loading}
                  className="font-mono text-base font-semibold tracking-wide pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  WLD
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {['50000', '100000', '250000'].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="text-xs h-7 px-2.5 rounded-lg border-border/80"
                    onClick={() => setAmountWld(preset)}
                  >
                    +{Number(preset).toLocaleString('ko-KR')}
                  </Button>
                ))}
                {remainingWld > BigInt(0) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="text-xs h-7 px-2.5 rounded-lg border-emerald-500/30 text-emerald-400"
                    onClick={() => setAmountWld(remainingWld.toString())}
                  >
                    최대 전액
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                주조된 신규 화폐는 <strong>중앙 국고 금고(VAULT_MAIN)</strong>로 자동 전표 입고되며 조폐국 발행 인증서(UUID)가 영구 원장에 기록됩니다.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="rounded-xl px-4"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading || activeOrders.length === 0}
                className="rounded-xl px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-4 animate-spin" />
                    주조 실행 중...
                  </span>
                ) : (
                  '정식 주조 집행'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface RetireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RetireExecutionDialog({ isOpen, onClose, onSuccess }: RetireModalProps) {
  const [amountWld, setAmountWld] = useState<string>('50000');
  const [reason, setReason] = useState<string>('정기 통화량 조절 및 유통 잉여분 영구 소각');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = BigInt(amountWld || '0');
    if (amount <= BigInt(0)) {
      setErrorMsg('소각 수량은 1 WLD 이상의 정수여야 합니다.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setErrorMsg('소각 감사 사유는 최소 5자 이상 입력해야 합니다.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const idempotencyKey = `retire-exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const res = await fetch('/api/admin/mint/execute-retire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_order_id: null,
          amount_wld: amountWld,
          source_type: 'TREASURY_VAULT',
          reason: reason.trim(),
          idempotency_key: idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '통화 소각 실행에 실패했습니다.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="retire-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="size-5" />
              </div>
              <div>
                <h3 id="retire-dialog-title" className="text-lg font-bold text-foreground">
                  통화 영구 소각 (Burn & Retire)
                </h3>
                <p className="text-xs text-muted-foreground">
                  중앙 국고 금고에서 화폐를 영구 폐기하여 총 통화량을 영구 감축합니다.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMsg && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                소각 수량 (WLD)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={amountWld}
                  onChange={(e) => setAmountWld(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="예: 50000"
                  disabled={loading}
                  className="font-mono text-base font-semibold tracking-wide pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  WLD
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {['10000', '50000', '100000', '500000'].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="text-xs h-7 px-2.5 rounded-lg border-border/80"
                    onClick={() => setAmountWld(preset)}
                  >
                    {Number(preset).toLocaleString('ko-KR')}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                소각 감사 사유 (Audit Reason, 5자 이상)
              </label>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="영구 소각 사유를 구체적으로 입력하세요"
                disabled={loading}
                className="text-sm"
              />
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-300 flex items-start gap-2">
              <Flame className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                소각된 통화는 <strong>되돌릴 수 없으며(Irreversible)</strong>, 국고 잔액과 총 유통량이 즉시 차감되고 공인 소각 인증서가 영구 발행됩니다.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="rounded-xl px-4"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl px-5 bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-4 animate-spin" />
                    소각 집행 중...
                  </span>
                ) : (
                  '영구 소각 집행'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
