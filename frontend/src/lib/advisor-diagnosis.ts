// A successful HTTP status is not evidence that financial values are internally consistent.
// Keep the read-only owner view narrow; never project a trade receipt from diagnosis data.
export interface AdvisorDiagnosisView {
  readonly prIndex: number;
  readonly riskLevel: 'VERY_LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  readonly createdAt: string;
  readonly assetSummary: {
    readonly cash: number;
    readonly savings: number;
    readonly stocks: number;
    readonly bonds: number;
    readonly total: number;
    readonly stockCount: number;
    readonly topStockSymbol: string | null;
    readonly topStockRatio: number;
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function amount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parseAdvisorDiagnosis(value: unknown): AdvisorDiagnosisView | null {
  const source = record(value);
  if (!source || typeof source.id !== 'string' || typeof source.userId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(source.id) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(source.userId) ||
      !Number.isInteger(source.prIndex) || (source.prIndex as number) < 0 || (source.prIndex as number) > 100 ||
      !['VERY_LOW', 'MODERATE', 'HIGH', 'CRITICAL'].includes(String(source.riskLevel)) ||
      typeof source.createdAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(source.createdAt) ||
      !Number.isFinite(Date.parse(source.createdAt))) return null;

  const assets = record(source.assetSummary);
  if (!assets || !amount(assets.cash) || !amount(assets.savings) ||
      !amount(assets.stocks) || !amount(assets.bonds) || !amount(assets.total) ||
      !amount(assets.stockCount) || assets.stockCount > 1000000 ||
      !Number.isInteger(assets.topStockRatio) || (assets.topStockRatio as number) < 0 ||
      (assets.topStockRatio as number) > 100 ||
      !(assets.topStockSymbol === null || (typeof assets.topStockSymbol === 'string' &&
        /^[A-Za-z0-9._-]{1,32}$/.test(assets.topStockSymbol))) ||
      BigInt(assets.cash) + BigInt(assets.savings) + BigInt(assets.stocks) + BigInt(assets.bonds) !== BigInt(assets.total) ||
      (assets.stockCount === 0 && (assets.stocks !== 0 || assets.topStockSymbol !== null || assets.topStockRatio !== 0)) ||
      (assets.stockCount > 0 && assets.topStockSymbol === null)) return null;

  return {
    prIndex: source.prIndex as number,
    riskLevel: source.riskLevel as AdvisorDiagnosisView['riskLevel'],
    createdAt: source.createdAt,
    assetSummary: assets as unknown as AdvisorDiagnosisView['assetSummary'],
  };
}

export function parseVerifiedAdvisorResponse(value: unknown): AdvisorDiagnosisView | null {
  const response = record(value);
  if (response?.sourceStatus !== 'VERIFIED') return null;
  // The server already removed the private actor and receipt identifiers.
  const diagnosis = record(response.diagnosis);
  if (!diagnosis) return null;
  return parseAdvisorDiagnosis({ ...diagnosis,
    id: '00000000-0000-4000-8000-000000000000',
    userId: '00000000-0000-4000-8000-000000000000',
  });
}
