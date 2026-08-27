import { Injectable } from '@nestjs/common';
import type { WldAmount } from '@moneyverse/contract';
import { isWldAmount } from '@moneyverse/contract';
import { assertReconciliationActorId } from './reconciliation.repository';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER_PATTERN = /^-?(?:0|[1-9][0-9]*)$/;
const NON_NEGATIVE_INTEGER_PATTERN = /^(?:0|[1-9][0-9]*)$/;
const HASH_PATTERN = /^[0-9a-f]{64}$/;

export class EconomyReconciliationReadModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EconomyReconciliationReadModelError';
  }
}

/** Repository dependency this service needs. `PostgresEconomyReconciliationRepository` satisfies this structurally. */
export interface EconomyReconciliationRepositoryLike {
  latestHealth(input: { readonly actorUserId: string }): Promise<unknown>;
}

export interface EconomyReconciliationIntegrity {
  readonly ok: boolean;
  readonly ledgerTransactionCount: string;
  readonly ledgerPostingCount: string;
  readonly unbalancedTransactionCount: string;
  readonly missingBalanceAccountCount: string;
  readonly balanceMismatchAccountCount: string;
  readonly disallowedNegativeBalanceAccountCount: string;
  readonly accountBalanceTotalAmount: WldAmount;
  readonly ledgerBalanceTotalAmount: WldAmount;
  readonly balanceTotalDeltaAmount: WldAmount;
}

export interface EconomyReconciliationSupply {
  readonly m2Amount: WldAmount;
  readonly netMintIssuanceAmount: WldAmount;
  readonly sinkAbsorbedAmount: WldAmount;
  readonly effectiveIssuedLessSinkAmount: WldAmount;
  readonly treasuryBalanceAmount: WldAmount;
}

export interface EconomyReconciliationTreasury24h {
  readonly inflowAmount: WldAmount;
  readonly outflowAmount: WldAmount;
  readonly netFlowAmount: WldAmount;
}

export interface EconomyReconciliationConcentration {
  readonly userWalletOwnerCount: string;
  readonly positiveWalletOwnerCount: string;
  readonly positiveUserBalanceTotalAmount: WldAmount;
  readonly top1UserBalanceAmount: WldAmount;
  readonly top1ShareBasisPoints: number;
  readonly top10UserBalanceAmount: WldAmount;
  readonly top10ShareBasisPoints: number;
}

export interface EconomyReconciliationFlow24h {
  readonly transactionCount: string;
  readonly volumeAmount: WldAmount;
  readonly mintIssuanceAmount: WldAmount;
  readonly sinkAbsorptionAmount: WldAmount;
}

export interface EconomyReconciliationHealthView {
  readonly available: true;
  readonly snapshotId: string;
  readonly metricVersion: 'v1';
  readonly calculatedAt: string;
  readonly integrity: EconomyReconciliationIntegrity;
  readonly supply: EconomyReconciliationSupply;
  readonly treasury24h: EconomyReconciliationTreasury24h;
  readonly concentration: EconomyReconciliationConcentration;
  readonly flow24h: EconomyReconciliationFlow24h;
  readonly integrityHash: string;
}

export type EconomyReconciliationHealth = EconomyReconciliationHealthView | { readonly available: false };

/**
 * Validates a database-sourced integer count (not a money amount) as a
 * canonical integer string. Row types are assertions about the schema, not
 * proofs, so this revalidates from scratch rather than trusting the
 * repository's declared row type.
 */
function integerString(value: unknown, field: string, { nonNegative = false }: { nonNegative?: boolean } = {}): string {
  const normalized = typeof value === 'bigint'
    ? value.toString()
    : typeof value === 'number' && Number.isSafeInteger(value)
      ? String(value)
      : typeof value === 'string' ? value : null;
  const pattern = nonNegative ? NON_NEGATIVE_INTEGER_PATTERN : INTEGER_PATTERN;
  if (!normalized || !pattern.test(normalized)) {
    throw new EconomyReconciliationReadModelError(`${field} must be an integer`);
  }
  return normalized === '-0' ? '0' : normalized;
}

/**
 * Validates a database-sourced integer amount as a canonical `WldAmount`.
 * Unlike `integerString` above, this is for genuinely money-denominated
 * fields (balances, flows, supply), not row/owner counts.
 */
function moneyAmount(value: unknown, field: string, { nonNegative = false }: { nonNegative?: boolean } = {}): WldAmount {
  const normalized = typeof value === 'bigint'
    ? value.toString()
    : typeof value === 'number' && Number.isSafeInteger(value)
      ? String(value)
      : typeof value === 'string' ? value : null;
  const canonical = normalized === '-0' ? '0' : normalized;
  if (canonical === null || !isWldAmount(canonical) || (nonNegative && canonical.startsWith('-'))) {
    throw new EconomyReconciliationReadModelError(`${field} must be an integer`);
  }
  return canonical;
}

function basisPoints(value: unknown, field: string): number {
  const normalized: unknown = typeof value === 'string' && /^[0-9]+$/.test(value) ? Number(value) : value;
  if (typeof normalized !== 'number' || !Number.isSafeInteger(normalized) || normalized < 0 || normalized > 10_000) {
    throw new EconomyReconciliationReadModelError(`${field} must be between 0 and 10000`);
  }
  return normalized;
}

function timestamp(value: unknown): string {
  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
    throw new EconomyReconciliationReadModelError('calculated at must be a valid timestamp');
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new EconomyReconciliationReadModelError('calculated at must be a valid timestamp');
  }
  return date.toISOString();
}

function boolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new EconomyReconciliationReadModelError(`${field} must be a boolean`);
  }
  return value;
}

function requireObject(value: unknown): asserts value is Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new EconomyReconciliationReadModelError('invalid reconciliation read model');
  }
}

function requireSnapshotId(value: unknown): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new EconomyReconciliationReadModelError('snapshot id must be a UUID');
  }
  return value;
}

function requireMetricVersion(value: unknown): 'v1' {
  if (value !== 'v1') {
    throw new EconomyReconciliationReadModelError('unsupported reconciliation metric version');
  }
  return value;
}

function requireHash(value: unknown): string {
  if (typeof value !== 'string' || !HASH_PATTERN.test(value)) {
    throw new EconomyReconciliationReadModelError('integrity hash must be a SHA-256 hex digest');
  }
  return value;
}

function normalizedHealth(row: unknown): EconomyReconciliationHealthView {
  requireObject(row);

  return {
    available: true,
    snapshotId: requireSnapshotId(row.snapshot_id),
    metricVersion: requireMetricVersion(row.metric_version),
    calculatedAt: timestamp(row.calculated_at),
    integrity: {
      ok: boolean(row.integrity_ok, 'integrity ok'),
      ledgerTransactionCount: integerString(row.ledger_transaction_count, 'ledger transaction count', { nonNegative: true }),
      ledgerPostingCount: integerString(row.ledger_posting_count, 'ledger posting count', { nonNegative: true }),
      unbalancedTransactionCount: integerString(row.ledger_unbalanced_transaction_count, 'unbalanced transaction count', { nonNegative: true }),
      missingBalanceAccountCount: integerString(row.missing_balance_account_count, 'missing balance account count', { nonNegative: true }),
      balanceMismatchAccountCount: integerString(row.balance_mismatch_account_count, 'balance mismatch account count', { nonNegative: true }),
      disallowedNegativeBalanceAccountCount: integerString(row.disallowed_negative_balance_account_count, 'disallowed negative balance account count', { nonNegative: true }),
      accountBalanceTotalAmount: moneyAmount(row.account_balance_total_amount, 'account balance total amount'),
      ledgerBalanceTotalAmount: moneyAmount(row.ledger_balance_total_amount, 'ledger balance total amount'),
      balanceTotalDeltaAmount: moneyAmount(row.balance_total_delta_amount, 'balance total delta amount'),
    },
    supply: {
      m2Amount: moneyAmount(row.m2_amount, 'm2 amount'),
      netMintIssuanceAmount: moneyAmount(row.net_mint_issuance_amount, 'net mint issuance amount'),
      sinkAbsorbedAmount: moneyAmount(row.sink_absorbed_amount, 'sink absorbed amount'),
      effectiveIssuedLessSinkAmount: moneyAmount(row.effective_issued_less_sink_amount, 'effective issued less sink amount'),
      treasuryBalanceAmount: moneyAmount(row.treasury_balance_amount, 'treasury balance amount'),
    },
    treasury24h: {
      inflowAmount: moneyAmount(row.treasury_inflow_24h_amount, 'treasury inflow amount', { nonNegative: true }),
      outflowAmount: moneyAmount(row.treasury_outflow_24h_amount, 'treasury outflow amount', { nonNegative: true }),
      netFlowAmount: moneyAmount(row.treasury_net_flow_24h_amount, 'treasury net flow amount'),
    },
    concentration: {
      userWalletOwnerCount: integerString(row.user_wallet_owner_count, 'user wallet owner count', { nonNegative: true }),
      positiveWalletOwnerCount: integerString(row.positive_wallet_owner_count, 'positive wallet owner count', { nonNegative: true }),
      positiveUserBalanceTotalAmount: moneyAmount(row.positive_user_balance_total_amount, 'positive user balance total amount', { nonNegative: true }),
      top1UserBalanceAmount: moneyAmount(row.top_1_user_balance_amount, 'top 1 user balance amount', { nonNegative: true }),
      top1ShareBasisPoints: basisPoints(row.top_1_share_basis_points, 'top 1 share basis points'),
      top10UserBalanceAmount: moneyAmount(row.top_10_user_balance_amount, 'top 10 user balance amount', { nonNegative: true }),
      top10ShareBasisPoints: basisPoints(row.top_10_share_basis_points, 'top 10 share basis points'),
    },
    flow24h: {
      transactionCount: integerString(row.flow_24h_transaction_count, '24h transaction count', { nonNegative: true }),
      volumeAmount: moneyAmount(row.flow_24h_volume_amount, '24h volume amount', { nonNegative: true }),
      mintIssuanceAmount: moneyAmount(row.mint_issuance_24h_amount, '24h mint issuance amount'),
      sinkAbsorptionAmount: moneyAmount(row.sink_absorption_24h_amount, '24h sink absorption amount'),
    },
    integrityHash: requireHash(row.integrity_hash),
  };
}

/**
 * Presentation-only reconciliation service. It cannot ask PostgreSQL to run
 * a snapshot: the dedicated maintenance process is the only writer.
 */
@Injectable()
export class EconomyReconciliationService {
  readonly repository: EconomyReconciliationRepositoryLike;

  constructor({ repository }: { repository: EconomyReconciliationRepositoryLike }) {
    if (!repository || typeof repository.latestHealth !== 'function') {
      throw new Error('economy reconciliation repository is required');
    }
    this.repository = repository;
  }

  async latestHealth(actorUserId: unknown): Promise<EconomyReconciliationHealth> {
    assertReconciliationActorId(actorUserId);
    const row = await this.repository.latestHealth({ actorUserId });
    if (row === null || row === undefined) return { available: false };
    return normalizedHealth(row);
  }
}

export const economyReconciliationReadModel = { normalizedHealth };
