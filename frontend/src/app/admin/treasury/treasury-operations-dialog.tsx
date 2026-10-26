'use client';

import { useRef, useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Coins,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { injectTreasuryFunds, absorbTreasuryFunds } from '../actions';
import { StepUpField } from '../step-up-field';
import type { AdminTreasuryVault } from '../types';
import { groupDigits } from '@/lib/money';
import { addTreasuryPreset, isValidTreasuryAmount } from './treasury-amount';

interface Props {
  readonly vaults: readonly AdminTreasuryVault[];
}

const REASON_CODES: readonly {
  readonly code: string;
  readonly label: string;
  readonly defaultDetail: string;
}[] = [
  {
    code: 'MARKET_INTERVENTION',
    label: '시장 유동성 개입 (Market Intervention)',
    defaultDetail: '가상 시장 통화량 급변에 대응한 중앙 유동성 조절 및 시장 안정화 조치',
  },
  {
    code: 'TAX_REVENUE',
    label: '세금 징수액 입고 (Tax Revenue)',
    defaultDetail: '시스템 거래세 및 자산 수수료 누적 징수액 공식 국고 귀속 처리',
  },
  {
    code: 'SUBSIDY',
    label: '정책 보조금 집행 (Policy Subsidy)',
    defaultDetail: '직업 활동 장려금 및 시스템 신규 지원 정책 보조금 긴급 집행',
  },
  {
    code: 'OPERATIONAL_RESERVE',
    label: '중앙 비축금 조정 (Reserve Rebalance)',
    defaultDetail: '국고 금고 간 분산 비축 및 중앙 은행 지급 준비금 비율 재조정',
  },
  {
    code: 'SYSTEM_CORRECTION',
    label: '장부 정합성 수동 보정 (Ledger Correction)',
    defaultDetail: '감사 결과 식별된 데이터 정합성 오차 해소를 위한 공식 장부 수동 보정',
  },
];

export function TreasuryOperationsDialog({ vaults }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'inject' | 'absorb'>('inject');
  const [selectedVault, setSelectedVault] = useState<string>(vaults[0]?.code ?? 'VAULT_MAIN');
  const [amount, setAmount] = useState<string>('');
  const [reasonCode, setReasonCode] = useState<string>(REASON_CODES[0]!.code);
  const [detailReason, setDetailReason] = useState<string>(REASON_CODES[0]!.defaultDetail);
  // The treasury API has no idempotency-key contract. Never imply one exists.
  const [requiresLedgerReview, setRequiresLedgerReview] = useState(false);
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [message, setMessage] = useState<{ status: 'ok' | 'error'; text: string } | null>(null);

  const handleReasonCodeChange = (newCode: string) => {
    setReasonCode(newCode);
    const found = REASON_CODES.find((r) => r.code === newCode);
    if (found) {
      setDetailReason(found.defaultDetail);
    }
  };

  const handleQuickAdd = (add: string) => {
    const next = addTreasuryPreset(amount, add);
    if (next === null) {
      setMessage({ status: 'error', text: '금액을 확인해 주세요. 1~30자리의 정확한 양의 정수 WLD만 처리할 수 있습니다.' });
      return;
    }
    setMessage(null);
    setAmount(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pendingRef.current || requiresLedgerReview) return;
    if (!isValidTreasuryAmount(amount) || !vaults.some((v) => v.code === selectedVault)) {
      setMessage({ status: 'error', text: '대상 금고와 1~30자리 양의 정수 WLD를 확인해 주세요.' });
      return;
    }
    pendingRef.current = true;
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('vaultCode', selectedVault);
    formData.set('amountWld', amount);

    // [사유코드] 상세 사유 형태로 조합하여 백엔드 감사 로그 및 10자 이상 조건 충족
    const fullReason = `[${reasonCode}] ${detailReason.trim()}`;
    formData.set('reason', fullReason);

    try {
      const res =
        mode === 'inject'
          ? await injectTreasuryFunds({ status: 'idle' }, formData)
          : await absorbTreasuryFunds({ status: 'idle' }, formData);

      if (res.status === 'ok') {
        setMessage({ status: 'ok', text: res.message ?? '국고 자금 처리가 완료되었습니다.' });
        setAmount('');
        setRequiresLedgerReview(false);
      } else {
        setRequiresLedgerReview(true);
        setMessage({ status: 'error', text: `${res.message ?? '오류가 발생했습니다.'} 재실행 전에 국고 거래 내역을 확인하세요.` });
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : '작업 처리 중 오류가 발생했습니다.';
      setRequiresLedgerReview(true);
      setMessage({ status: 'error', text: `${errText} 요청 처리 여부가 불확실할 수 있습니다. 재실행 전에 국고 거래 내역을 확인하세요.` });
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="gap-1.5 text-xs min-h-11 bg-amber-600 hover:bg-amber-700 text-white"
        onClick={() => setIsOpen(true)}
      >
        <KeyRound className="h-3.5 w-3.5" />
        국고 자금 관리
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="treasury-op-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="treasury-op-title" className="text-lg font-bold">
                    국고 자금 관리 · 관리자 권한 확인
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    국고 변경은 관리자 세션·서버 권한 검증을 거칩니다. 별도의 TOTP 및 서버 멱등 처리 기능은 제공되지 않습니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground text-sm font-semibold p-2"
                aria-label="국고 자금 관리 창 닫기"
                disabled={isPending}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className="inline-flex rounded-xl border border-border/80 bg-muted/60 p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setMode('inject')}
                  className={`rounded-lg min-h-11 px-4 py-2 text-xs font-bold transition-all ${
                    mode === 'inject'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  자금 긴급 주입 (Injection)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('absorb')}
                  className={`rounded-lg min-h-11 px-4 py-2 text-xs font-bold transition-all ${
                    mode === 'absorb'
                      ? 'bg-destructive text-destructive-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  잉여 자금 영구 소각 (Sink)
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-5">

              {/* 1. 금고 및 금액 설정 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="vaultSelect" className="block text-xs font-bold text-foreground mb-1.5">
                    대상 국고 금고 (Vault)
                  </label>
                  <select
                    id="vaultSelect"
                    value={selectedVault}
                    onChange={(e) => setSelectedVault(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium shadow-xs focus:ring-1 focus:ring-ring"
                  >
                    {vaults.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.name} ({v.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="amountInput" className="block text-xs font-bold text-foreground">
                      처리 금액 (WLD)
                    </label>
                    {amount && (
                      <span className="font-mono text-xs font-bold text-primary">
                        {groupDigits(amount)} WLD
                      </span>
                    )}
                  </div>
                  <input
                    id="amountInput"
                    type="text"
                    pattern="[0-9]*"
                    placeholder="예: 1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="numeric"
                    maxLength={30}
                    aria-invalid={amount !== '' && !isValidTreasuryAmount(amount)}
                    aria-describedby="treasury-amount-help"
                    required
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono font-bold shadow-xs focus:ring-1 focus:ring-ring"
                  />

                  <p id="treasury-amount-help" className="mt-1 text-xs text-muted-foreground">정수 WLD만 입력하세요. 0 및 앞자리 0은 허용되지 않습니다.</p>
                  {/* 금액 퀵 프리셋 버튼 */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd('1000000')}
                      className="min-h-11 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                    >
                      +100만
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd('5000000')}
                      className="min-h-11 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                    >
                      +500만
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd('10000000')}
                      className="min-h-11 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                    >
                      +1,000만
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="min-h-11 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. 회계 감사 사유 코드 및 상세 사유 */}
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-4">
                <div>
                  <label htmlFor="reasonCodeSelect" className="block text-xs font-bold text-foreground mb-1.5">
                    공식 회계 보정 사유 코드 (Audit Category)
                  </label>
                  <select
                    id="reasonCodeSelect"
                    value={reasonCode}
                    onChange={(e) => handleReasonCodeChange(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm font-medium shadow-xs focus:ring-1 focus:ring-ring"
                  >
                    {REASON_CODES.map((r) => (
                      <option key={r.code} value={r.code}>
                        [{r.code}] {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reasonDetailInput" className="block text-xs font-bold text-foreground mb-1.5">
                    상세 감사 소명 사유 (최소 10자 이상 구체적 기술 필수)
                  </label>
                  <textarea
                    id="reasonDetailInput"
                    rows={2}
                    placeholder="감사 기록에 영구 보존될 구체적인 사유를 기술하세요."
                    value={detailReason}
                    onChange={(e) => setDetailReason(e.target.value)}
                    minLength={10}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm shadow-xs focus:ring-1 focus:ring-ring leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>중복 실행 방지 키 미지원 · 오류 시 원장 조회 후 재시도</span>
                  <span className={detailReason.trim().length >= 10 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {detailReason.trim().length}/10자 충족
                  </span>
                </div>
              </div>

              {/* 3. Actual authorization boundary: admin session, CSRF, role and database permissions. */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="size-4" />
                  <span>관리자 권한·감사 사유 확인</span>
                </div>
                <StepUpField id="treasury-operation" undo="국고 반대 거래(주입 시 소각, 소각 시 주입)를 역분개로 실행" />
              </div>

              {requiresLedgerReview && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                  <p>이전 요청의 처리 여부를 국고 거래 내역에서 확인하기 전에는 재실행할 수 없습니다.</p>
                  <Button type="button" variant="outline" className="mt-2 min-h-11" onClick={() => { setRequiresLedgerReview(false); setMessage(null); }}>
                    거래 내역 확인 완료 · 다시 입력
                  </Button>
                </div>
              )}
              {message && (
                <div
                  role={message.status === 'error' ? 'alert' : 'status'}
                  className={`rounded-xl p-3.5 text-xs font-medium ${
                    message.status === 'ok'
                      ? 'border border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'border border-destructive/40 bg-destructive/15 text-destructive'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="min-h-11"
                >
                  취소
                </Button>

                <Button
                  type="submit"
                  disabled={isPending || requiresLedgerReview || !isValidTreasuryAmount(amount) || !vaults.some((v) => v.code === selectedVault) || detailReason.trim().length < 10}
                  variant={mode === 'inject' ? 'default' : 'destructive'}
                  className="min-h-11 px-6 text-xs sm:text-sm font-bold rounded-xl shadow-md gap-2"
                >
                  {isPending ? (
                    <>
                      <RotateCw className="size-4 animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : mode === 'inject' ? (
                    <>
                      <Coins className="size-4" />
                      <span>국고 자금 긴급 주입 실행</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="size-4" />
                      <span>국고 잉여 자금 영구 소각 실행</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
