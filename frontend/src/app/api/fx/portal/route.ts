import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'cache-control': 'public, no-store' };

type RatePoint = {
  id: string;
  rate: number;
  changePct: number;
  volumeUsd: number;
  interventionType: string;
  createdAt: string;
};

type Portal = {
  success: true;
  data: {
    reserves: {
      currency: string;
      currentRate: number;
      totalReservesUsd: number;
      isHalted: boolean;
      updatedAt: string;
    };
    history: RatePoint[];
  };
};

function finite(value: unknown, min = 0): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min;
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isPortal(value: unknown): value is Portal {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Record<string, unknown>;
  if (envelope.success !== true || !envelope.data || typeof envelope.data !== 'object') return false;
  const data = envelope.data as Record<string, unknown>;
  if (!data.reserves || typeof data.reserves !== 'object' || !Array.isArray(data.history)) return false;
  const reserves = data.reserves as Record<string, unknown>;
  return reserves.currency === 'USD' && finite(reserves.currentRate, 0.0001) &&
    finite(reserves.totalReservesUsd) && typeof reserves.isHalted === 'boolean' &&
    validDate(reserves.updatedAt) && data.history.length <= 100 &&
    data.history.every((entry: unknown) => {
      if (!entry || typeof entry !== 'object') return false;
      const point = entry as Record<string, unknown>;
      return typeof point.id === 'string' && finite(point.rate, 0.0001) &&
        finite(point.changePct, -100000) && finite(point.volumeUsd) &&
        typeof point.interventionType === 'string' && validDate(point.createdAt);
    });
}

export async function GET(): Promise<NextResponse> {
  // Do not manufacture an exchange rate if the real PostgreSQL-backed API is unavailable.
  const result = await publicApi<unknown>('/api/v1/fx/portal', 0);
  if (!isPortal(result)) {
    return NextResponse.json({ success: false, detail: 'FX market data unavailable' }, { status: 503, headers });
  }
  return NextResponse.json(result, { headers });
}
