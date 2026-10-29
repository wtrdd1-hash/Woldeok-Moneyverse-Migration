import { NextResponse } from 'next/server';
import { api, apiOrNull, ApiError } from '@/lib/api';

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
    const [batches, aggregates, policy, reserve] = await Promise.all([
      apiOrNull<MintBatchRecord[]>('/api/v1/mint/batches'),
      api('/api/v1/central-bank/monetary-aggregates'),
      api('/api/v1/central-bank/base-rate'),
      api('/api/v1/central-bank/reserve-requirement'),
    ]);

    const safeBatches = Array.isArray(batches) ? batches : [];

    return NextResponse.json({
      source: 'certified_economy_ledger',
      pendingBatches: safeBatches.filter((batch) => batch.status === 'PENDING_CENTRAL_BANK_ACCEPTANCE'),
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
