import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface MintBatchRecord {
  id: string;
  batchNumber: string;
  amountWld: string;
  status: string;
  mintReason?: string;
}

export async function GET() {
  try {
    // These legacy services use process-local state, not the certified economy
    // ledger. Expose this explicitly and never label it an official monetary state.
    const [batches, aggregates, policy, reserve] = await Promise.all([
      api<MintBatchRecord[]>('/api/v1/mint/batches'),
      api('/api/v1/central-bank/monetary-aggregates'),
      api('/api/v1/central-bank/base-rate'),
      api('/api/v1/central-bank/reserve-requirement'),
    ]);

    return NextResponse.json({
      source: 'non_persistent_backend_preview',
      pendingBatches: batches.filter((batch) => batch.status === 'PENDING_CENTRAL_BANK_ACCEPTANCE'),
      aggregates,
      policy,
      reserve,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json(
      { error: error instanceof ApiError ? error.code ?? 'CENTRAL_BANK_SOURCE_UNAVAILABLE' : 'CENTRAL_BANK_SOURCE_UNAVAILABLE' },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
