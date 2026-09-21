'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { injectTreasuryFunds, absorbTreasuryFunds } from '../actions';
import { StepUpField } from '../step-up-field';
import type { AdminTreasuryVault } from '../types';

interface Props {
  readonly vaults: readonly AdminTreasuryVault[];
}

export function TreasuryOperationsDialog({ vaults }: Props) {
  const [mode, setMode] = useState<'inject' | 'absorb'>('inject');
  const [selectedVault, setSelectedVault] = useState<string>(vaults[0]?.code ?? 'VAULT_MAIN');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [message, setMessage] = useState<{ status: 'ok' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('vaultCode', selectedVault);
    formData.set('amountWld', amount);
    formData.set('reason', reason);

    try {
      const res =
        mode === 'inject'
          ? await injectTreasuryFunds({ status: 'idle' }, formData)
          : await absorbTreasuryFunds({ status: 'idle' }, formData);

      if (res.status === 'ok') {
        setMessage({ status: 'ok', text: res.message ?? '국고 자금 처리가 완료되었습니다.' });
        setAmount('');
        setReason('');
      } else {
        setMessage({ status: 'error', text: res.message ?? '오류가 발생했습니다.' });
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : '작업 처리 중 오류가 발생했습니다.';
      setMessage({ status: 'error', text: errText });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">국고 자금 긴급 제어 (Step-Up Safe Guard)</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              국고 자금의 주입 및 소각은 회계 감사 기록에 영구 보존되며 2단계 인증이 요구됩니다.
            </CardDescription>
          </div>
          <div className="inline-flex rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setMode('inject')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'inject'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              자금 긴급 주입 (Injection)
            </button>
            <button
              type="button"
              onClick={() => setMode('absorb')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'absorb'
                  ? 'bg-destructive text-destructive-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              잉여 자금 소각 (Sink)
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="vaultSelect" className="block text-xs font-medium mb-1">
                대상 금고 (Vault)
              </label>
              <select
                id="vaultSelect"
                value={selectedVault}
                onChange={(e) => setSelectedVault(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
              >
                {vaults.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.name} ({v.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amountInput" className="block text-xs font-medium mb-1">
                처리 금액 (정수 WLD)
              </label>
              <input
                id="amountInput"
                type="text"
                pattern="[0-9]*"
                placeholder="예: 1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reasonInput" className="block text-xs font-medium mb-1">
              국고 회계 감사 사유 (최소 10자 이상 구체적 기술)
            </label>
            <textarea
              id="reasonInput"
              rows={2}
              placeholder="예: 통화량 안정화를 위한 중앙 비상 완충 자금 긴급 확충 조치"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={10}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="border-t pt-3">
            <StepUpField id="treasury-operation" undo="국고 반대 거래(주입 시 소각, 소각 시 주입)를 역분개로 실행" />
          </div>

          {message && (
            <div
              className={`rounded-lg p-3 text-xs font-medium ${
                message.status === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-destructive/15 text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending || amount.length === 0 || reason.trim().length < 10}
              variant={mode === 'inject' ? 'default' : 'destructive'}
              className="min-h-10 px-4 text-xs font-medium"
            >
              {isPending
                ? '처리 중...'
                : mode === 'inject'
                ? '국고 자금 긴급 주입 실행'
                : '국고 잉여 자금 영구 소각 실행'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
