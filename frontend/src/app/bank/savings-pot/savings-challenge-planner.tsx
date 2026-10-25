'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Landmark, ShieldCheck, Calculator, ArrowRight } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { calculateSavingsPlan } from './savings-challenge-math';

interface SavingsChallengePlannerProps {
  readonly bankBalance: string;
  readonly cashBalance: string;
}

/**
 * A member-only planning aid. No group fund, fictional co-saver, WLD movement,
 * interest bonus, or deposit receipt is created by this component.
 */
export function SavingsChallengePlanner({ bankBalance, cashBalance }: SavingsChallengePlannerProps) {
  const [target, setTarget] = useState('400000');
  const [days, setDays] = useState<7 | 30>(7);
  const estimate = calculateSavingsPlan(bankBalance, target, days);

  return (
    <main data-page="savings-challenge" className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" aria-hidden="true" /> 회원 전용 · 읽기 전용
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">가상 저축 목표 계획기</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          서버에서 조회한 내 가상 은행 잔액을 기준으로 7일 또는 30일 저축 목표를 계산합니다.
          이 화면은 공동 저축 팟이나 실제 입금 기능이 아닙니다. 친구, 보너스 금리, 소각 및 거래 완료 기록을 생성하지 않습니다.
        </p>
      </header>

      <section aria-labelledby="verified-balance-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 id="verified-balance-heading" className="mb-4 flex items-center gap-2 text-base font-bold">
          <Landmark className="size-5" aria-hidden="true" /> 서버 조회 잔액
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-4">
            <dt className="text-xs text-muted-foreground">현재 가상 은행 잔액</dt>
            <dd className="mt-2 break-all font-mono text-xl font-bold">{groupDigits(bankBalance)} WLD</dd>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <dt className="text-xs text-muted-foreground">현재 가상 현금 잔액</dt>
            <dd className="mt-2 break-all font-mono text-xl font-bold">{groupDigits(cashBalance)} WLD</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          조회 시점의 회원별 잔액입니다. 이 계산기는 은행 잔액을 목표에 활용한다고 가정하지만
          실제 저축 목표에 자동 배정하거나 계좌에서 차감하지 않습니다.
        </p>
      </section>

      <section aria-labelledby="savings-plan-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 id="savings-plan-heading" className="mb-4 flex items-center gap-2 text-base font-bold">
          <Calculator className="size-5" aria-hidden="true" /> 목표별 필요 저축액
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="savings-target" className="mb-2 block text-sm font-semibold">가상 저축 목표 (WLD)</label>
            <input
              id="savings-target"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              aria-invalid={estimate === null}
              aria-describedby="savings-target-help"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            <p id="savings-target-help" className="mt-1 text-xs text-muted-foreground">0 이상 정수 WLD만 입력하세요.</p>
          </div>
          <div>
            <label htmlFor="savings-days" className="mb-2 block text-sm font-semibold">계획 기간</label>
            <select
              id="savings-days"
              value={days}
              onChange={(event) => setDays(event.target.value === '30' ? 30 : 7)}
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="7">7일</option>
              <option value="30">30일</option>
            </select>
          </div>
        </div>
        {estimate ? (
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-5 space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-sm text-muted-foreground">가정에 따른 추가 필요 금액: <strong className="break-all text-foreground">{groupDigits(estimate.remaining)} WLD</strong></p>
            <p className="text-sm text-muted-foreground">하루에 필요한 추가 저축: <strong className="break-all text-lg text-foreground">{groupDigits(estimate.dailyNeeded)} WLD</strong></p>
            <p className="text-xs text-muted-foreground">계획용 추정치입니다. 실제 거래, 이자, 보상 지급 또는 저축 완료를 뜻하지 않습니다.</p>
          </div>
        ) : (
          <p role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
            유효한 WLD 목표를 입력해 주세요. 음수, 소수, 쉼표 및 지나치게 큰 수는 허용하지 않습니다.
          </p>
        )}
        <Link
          href="/bank"
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
        >
          실제 은행에서 입출금하기 <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
      <p className="text-xs text-muted-foreground">WLD는 서비스 내 가상 데이터이며 현금·실제 예금·투자상품이 아닙니다.</p>
    </main>
  );
}
