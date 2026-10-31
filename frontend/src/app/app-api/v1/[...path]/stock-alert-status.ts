/** Android gateway must not treat an ignored status filter as a successful owner result. */
export type StockAlertStatus = 'all' | 'met' | 'watching';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^(0|[1-9][0-9]*)$/;
export function stockAlertStatusQuery(query: URLSearchParams): StockAlertStatus | null {
  if ([...query.keys()].some(key => key !== 'status')) return null;
  const values = query.getAll('status');
  if (values.length === 0) return 'all';
  if (values.length !== 1) return null;
  const value = values[0];
  return value === 'all' || value === 'met' || value === 'watching' ? value : null;
}
export function isVerifiedStockAlertStatusList(payload: unknown, status: StockAlertStatus): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  // A filtered empty array is ambiguous without an explicit backend proof.
  if (status !== 'all' && (payload as Record<string, unknown>).filterApplied !== status) return false;
  const rows = (payload as Record<string, unknown>).alerts;
  if (!Array.isArray(rows)) return false;
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (typeof item.alert_id !== 'string' || !UUID.test(item.alert_id) || seen.has(item.alert_id) ||
        typeof item.stock_id !== 'string' || !UUID.test(item.stock_id) ||
        typeof item.symbol !== 'string' || item.symbol.length === 0 ||
        typeof item.condition_met !== 'boolean' ||
        typeof item.current_price !== 'string' || !INTEGER.test(item.current_price)) return false;
    seen.add(item.alert_id);
    if (status === 'met' && !item.condition_met) return false;
    if (status === 'watching' && item.condition_met) return false;
  }
  return true;
}
