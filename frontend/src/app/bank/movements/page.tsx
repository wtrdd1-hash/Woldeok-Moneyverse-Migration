import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Verified bank movements', robots: { index: false, follow: false } };

type Movement = {
  transactionId: string;
  type: 'BANK_DEPOSIT' | 'BANK_WITHDRAW';
  occurredAt: string;
  amountWld: string;
  cashDeltaWld: string;
  bankDeltaWld: string;
  verification: 'LEDGER_VERIFIED';
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const integer = /^-?(?:0|[1-9][0-9]*)$/;

function isMovement(value: unknown): value is Movement {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  if (typeof row.transactionId !== 'string' || !uuid.test(row.transactionId) ||
      (row.type !== 'BANK_DEPOSIT' && row.type !== 'BANK_WITHDRAW') ||
      row.verification !== 'LEDGER_VERIFIED' ||
      typeof row.occurredAt !== 'string' || !Number.isFinite(Date.parse(row.occurredAt)) ||
      typeof row.amountWld !== 'string' || !/^[1-9][0-9]*$/.test(row.amountWld) ||
      typeof row.cashDeltaWld !== 'string' || !integer.test(row.cashDeltaWld) ||
      typeof row.bankDeltaWld !== 'string' || !integer.test(row.bankDeltaWld)) return false;
  const cash = BigInt(row.cashDeltaWld);
  const bank = BigInt(row.bankDeltaWld);
  return cash + bank === 0n &&
    (bank < 0n ? -bank : bank).toString() === row.amountWld &&
    (row.type === 'BANK_DEPOSIT' ? cash < 0n && bank > 0n : cash > 0n && bank < 0n);
}

export default async function BankMovementsPage() {
  await requireMember();
  const locale = await getServerLocale();
  const en = locale === 'en';
  let movements: Movement[] | null = null;
  try {
    const response = await api<{ movements: unknown }>('/api/v1/banking/movements?limit=50');
    if (!response || !Array.isArray(response.movements) || response.movements.length > 50 ||
        !response.movements.every(isMovement)) throw new Error('invalid bank ledger response');
    movements = response.movements;
  } catch {
    // A failed ledger read must never masquerade as an empty bank account.
  }

  return (
    <main data-page="bank-movements" className="mv-page mv-page--finance space-y-5">
      <Link href="/bank" className="inline-flex min-h-11 items-center gap-2 underline"><ArrowLeft aria-hidden="true" size={18} />{en ? 'Back to bank' : '은행으로 돌아가기'}</Link>
      <h1 className="text-2xl font-bold">{en ? 'Verified bank movements' : '검증된 은행 입출금 기록'}</h1>
      <p className="text-sm text-muted-foreground">{en ? 'Up to 50 recent bank transfers verified against your own double-entry WLD ledger. This is not the complete account history.' : '본인의 WLD 이중기입 원장으로 검증된 최근 은행 입출금 최대 50건입니다. 전체 거래 내역은 아닙니다.'}</p>
      {movements === null ? (
        <p role="alert">{en ? 'Verified bank movements are unavailable. Please try again.' : '검증된 은행 기록을 불러올 수 없습니다. 다시 시도해 주세요.'}</p>
      ) : movements.length === 0 ? (
        <p>{en ? 'No verified bank deposits or withdrawals in the recent records.' : '최근 검증된 은행 입출금 기록이 없습니다.'}</p>
      ) : (
        <ol className="space-y-3">
          {movements.map((movement) => (
            <li key={movement.transactionId} className="rounded-xl border p-4 space-y-1 break-words">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{movement.type === 'BANK_DEPOSIT' ? (en ? 'Deposit' : '입금') : (en ? 'Withdrawal' : '출금')}</strong>
                <span className="inline-flex items-center gap-1 text-xs"><ShieldCheck size={14} aria-hidden="true" />{en ? 'Ledger verified' : '원장 검증 완료'}</span>
              </div>
              <p className="font-semibold tabular-nums">{groupDigits(movement.amountWld)} WLD</p>
              <p className="text-sm tabular-nums">{en ? 'Cash' : '현금'} {groupDigits(movement.cashDeltaWld)} · {en ? 'Bank' : '은행'} {groupDigits(movement.bankDeltaWld)}</p>
              <p className="text-xs text-muted-foreground">{movement.occurredAt} · {movement.transactionId}</p>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
