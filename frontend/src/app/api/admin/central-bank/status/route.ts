import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface MonetaryTelemetry {
  m_total: string;
  m_circulating: string;
  m_treasury: string;
  m_bank_liquidity: string | null;
  m_locked: string | null;
  verified_invariant: boolean;
  is_issuance_frozen: boolean;
  active_policy_orders_count: number;
  total_mint_certificates_count: number;
  total_retirement_certificates_count: number;
}
interface PersistentPolicy { source: 'persistent_monetary_policy' }

export async function GET() {
  try {
    const [monetary, policy, reserve] = await Promise.all([
      api<MonetaryTelemetry>('/api/v1/admin/economy/monetary/telemetry'),
      api<PersistentPolicy>('/api/v1/central-bank/base-rate'),
      api<PersistentPolicy>('/api/v1/central-bank/reserve-requirement'),
    ]);
    if (policy.source !== 'persistent_monetary_policy' ||
        reserve.source !== 'persistent_monetary_policy' ||
        monetary.verified_invariant !== false) {
      // The independent M_total telemetry does not certify every bank/escrow liability.
      // A missing/incorrect provenance is not an excuse to show a fabricated official total.
      return NextResponse.json({ error: 'MONETARY_SOURCE_UNVERIFIED' }, { status: 503 });
    }
    return NextResponse.json({
      source: 'ledger_partial_and_persistent_policy',
      monetary,
      policy,
      reserve,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof ApiError ? error.code ?? 'CENTRAL_BANK_SOURCE_UNAVAILABLE' : 'CENTRAL_BANK_SOURCE_UNAVAILABLE' },
      { status: error instanceof ApiError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
