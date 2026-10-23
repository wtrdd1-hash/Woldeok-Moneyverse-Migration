'use server';

import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { requireAdminConsole } from '@/lib/session';

const PATH = '/admin/treasury';
const DIGITS = /^(0|[1-9]\d*)$/;

function amount(value: unknown): value is string {
  return typeof value === 'string' && DIGITS.test(value);
}

function verifiedAmounts(receipt: Record<string, unknown>, keys: readonly string[]) {
  if (!keys.every((key) => amount(receipt[key]))) {
    throw new Error('Treasury operation returned no verifiable financial receipt');
  }
}

export interface SwfGovernanceInput {
  is_enabled: boolean;
  reinvestment_ratio_pct: number;
  max_investment_ratio_pct: number;
  safe_reserve_wld: string;
  max_single_investment_wld: string;
}

export interface SwfStatus {
  config: Record<string, unknown> | null;
  portfolios: Record<string, unknown>[];
  events: Record<string, unknown>[];
}

export async function getSwfStatus(): Promise<SwfStatus> {
  await requireAdminConsole(PATH);
  const status = await api<SwfStatus>('/api/v1/admin/treasury/swf');
  if (!status || !Array.isArray(status.portfolios) || !Array.isArray(status.events)
      || (status.config !== null && (typeof status.config !== 'object' || Array.isArray(status.config)))) {
    throw new Error('Treasury status could not be verified');
  }
  return status;
}

export async function saveSwfGovernanceConfig(input: SwfGovernanceInput): Promise<{ ok: true }> {
  await requireAdminConsole(PATH);
  if (typeof input.is_enabled !== 'boolean'
    || !Number.isInteger(input.reinvestment_ratio_pct) || input.reinvestment_ratio_pct < 0
    || input.reinvestment_ratio_pct > 100
    || !Number.isInteger(input.max_investment_ratio_pct) || input.max_investment_ratio_pct < 0
    || input.max_investment_ratio_pct > 100
    || input.reinvestment_ratio_pct > input.max_investment_ratio_pct
    || !amount(input.safe_reserve_wld) || !amount(input.max_single_investment_wld)) {
    throw new Error('Invalid treasury governance parameters');
  }

  const persisted = await mutate<Partial<SwfGovernanceInput>>('/api/v1/admin/treasury/swf/config', {
    method: 'PUT', body: input,
  });
  if (!persisted || Object.entries(input).some(([key, value]) => persisted[key as keyof SwfGovernanceInput] !== value)) {
    throw new Error('Treasury governance update was not confirmed by the backend');
  }
  return { ok: true };
}

export interface SwfRebalanceReceipt {
  executed: boolean;
  reason?: string;
  totalAumWld?: string;
  taxCollectedWld?: string;
  harvestedWld?: string;
  reinvestedWld?: string;
}

export async function triggerSwfRebalance(): Promise<SwfRebalanceReceipt> {
  await requireAdminConsole(PATH);
  const receipt = await mutate<SwfRebalanceReceipt>('/api/v1/admin/treasury/swf/rebalance', {
    method: 'POST',
  });
  if (!receipt || typeof receipt.executed !== 'boolean') {
    throw new Error('Treasury rebalance outcome was not verified');
  }
  if (receipt.executed) {
    verifiedAmounts(receipt as unknown as Record<string, unknown>,
      ['totalAumWld', 'taxCollectedWld', 'harvestedWld', 'reinvestedWld']);
  }
  return receipt;
}

export interface SwfLiquidationReceipt {
  success: true;
  liquidatedWld: string;
  vaultCashAfter: string;
  portfolioAfter: string;
  totalAum: string;
}

export async function liquidateSwfToTreasury(targetPortfolioAumWld: string): Promise<SwfLiquidationReceipt> {
  await requireAdminConsole(PATH);
  if (!amount(targetPortfolioAumWld)) throw new Error('Invalid treasury liquidation target');
  const receipt = await mutate<SwfLiquidationReceipt>('/api/v1/admin/treasury/swf/liquidate', {
    method: 'POST', body: { targetPortfolioAumWld },
  });
  if (!receipt || receipt.success !== true) throw new Error('Treasury liquidation was not confirmed');
  verifiedAmounts(receipt as unknown as Record<string, unknown>,
    ['liquidatedWld', 'vaultCashAfter', 'portfolioAfter', 'totalAum']);
  if (BigInt(receipt.vaultCashAfter) + BigInt(receipt.portfolioAfter) !== BigInt(receipt.totalAum)) {
    throw new Error('Treasury liquidation receipt is inconsistent');
  }
  return receipt;
}
