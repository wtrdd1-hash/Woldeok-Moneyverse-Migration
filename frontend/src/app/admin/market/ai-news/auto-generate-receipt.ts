/**
 * The API returns a stored batch receipt, not the old {success, scenario}
 * client shape. Treat unknown or contradictory evidence as unverified.
 */
type Receipt =
  | { readonly kind: 'skipped'; readonly reason: string }
  | { readonly kind: 'draft'; readonly generated: number; readonly engine: string }
  | { readonly kind: 'published'; readonly generated: number; readonly engine: string; readonly headline: string; readonly eventsPublished: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAutoGenerateReceipt(value: unknown): Receipt | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (row.skipped === true && typeof row.reason === 'string' && row.reason.length > 0) {
    return { kind: 'skipped', reason: row.reason };
  }
  if (row.skipped !== undefined) return null;
  if (!Number.isSafeInteger(row.generated) || (row.generated as number) < 1 || (row.generated as number) > 5) return null;
  if (typeof row.batchId !== 'string' || !UUID.test(row.batchId)) return null;
  if (typeof row.engine !== 'string' || row.engine.length < 1 || row.engine.length > 100) return null;
  if (row.published === false) {
    if (row.eventId !== undefined || row.eventsPublished !== undefined) return null;
    return { kind: 'draft', generated: row.generated as number, engine: row.engine };
  }
  if (row.published !== true) return null;
  if (typeof row.eventId !== 'string' || !UUID.test(row.eventId)) return null;
  if (typeof row.scenarioId !== 'string' || !UUID.test(row.scenarioId)) return null;
  if (!Number.isSafeInteger(row.eventsPublished) || (row.eventsPublished as number) < 1 || (row.eventsPublished as number) > 4) return null;
  if (typeof row.headline !== 'string' || row.headline.trim().length < 2 || row.headline.length > 120) return null;
  return {
    kind: 'published',
    generated: row.generated as number,
    engine: row.engine,
    headline: row.headline,
    eventsPublished: row.eventsPublished as number,
  };
}

export function engineLabel(engine: string): string {
  return engine === 'deterministic-financial-engine' ? '규칙 기반 엔진(생성형 AI 미사용)' : '설정된 AI 모델';
}
