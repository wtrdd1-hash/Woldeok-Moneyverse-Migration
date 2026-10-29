import { beforeEach, describe, expect, it, vi } from 'vitest';

const { write, read, revalidate } = vi.hoisted(() => ({
  write: vi.fn(), read: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({
  mutate: write,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
  wholeAmount: (value: FormDataEntryValue | null) => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? value : null,
  wholeNumber: (value: FormDataEntryValue | null) => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : null,
}));
vi.mock('@/lib/api', () => ({ api: read }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { createStockAlert, deleteStockAlert } from './actions';

const stockId = '4b2c3f54-12c3-48b1-83a4-1ddc941ddc8d';
const alertId = '37c24a90-1294-41df-9223-7e8171e2b333';
const rule = {
  alert_id: alertId, stock_id: stockId, symbol: 'MV', name: 'Virtual Stock',
  condition_kind: 'price_at_or_above', threshold_amount: '10000', threshold_bps: null,
  cooldown_seconds: 3600,
};
const initial = { status: 'idle' as const };

function createForm() {
  const form = new FormData();
  form.set('stockId', stockId);
  form.set('conditionKind', 'price_at_or_above');
  form.set('threshold', '10000');
  form.set('cooldownMinutes', '60');
  return form;
}
function deleteForm() {
  const form = new FormData();
  form.set('alertId', alertId);
  return form;
}

beforeEach(() => { vi.clearAllMocks(); });

describe('stock alert owner persistence receipts', () => {
  it('rejects an HTTP-success creation without a valid alert ID receipt', async () => {
    write.mockResolvedValue({});
    expect(await createStockAlert(initial, createForm())).toMatchObject({ status: 'error' });
    expect(read).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects creation when the owner list does not contain the returned alert', async () => {
    write.mockResolvedValue({ alertId });
    read.mockResolvedValue({ alerts: [] });
    expect(await createStockAlert(initial, createForm())).toMatchObject({ status: 'error' });
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects creation when the persisted rule contradicts the requested threshold', async () => {
    write.mockResolvedValue({ alertId });
    read.mockResolvedValue({ alerts: [{ ...rule, threshold_amount: '9999' }] });
    expect(await createStockAlert(initial, createForm())).toMatchObject({ status: 'error' });
  });

  it('rejects creation when the readback belongs to another stock', async () => {
    write.mockResolvedValue({ alertId });
    read.mockResolvedValue({ alerts: [{ ...rule, stock_id: 'f97329ac-2b51-423f-aab4-7d2c41b1b180' }] });
    expect(await createStockAlert(initial, createForm())).toMatchObject({ status: 'error' });
  });

  it('rejects creation when a duplicate receipt ID makes the owner list ambiguous', async () => {
    write.mockResolvedValue({ alertId });
    read.mockResolvedValue({ alerts: [rule, rule] });
    expect(await createStockAlert(initial, createForm())).toMatchObject({ status: 'error' });
  });

  it('verifies a basis-point condition without rounding the persisted threshold', async () => {
    const form = createForm();
    form.set('conditionKind', 'day_change_at_or_below');
    form.set('threshold', '-175');
    write.mockResolvedValue({ alertId });
    read.mockResolvedValue({ alerts: [{ ...rule, condition_kind: 'day_change_at_or_below', threshold_amount: null, threshold_bps: -175 }] });
    expect(await createStockAlert(initial, form)).toMatchObject({ status: 'ok' });
  });

  it('reports creation only after matching the exact server receipt to owner readback', async () => {
    write.mockResolvedValue({ alertId });
    read.mockResolvedValue({ alerts: [rule] });
    expect(await createStockAlert(initial, createForm())).toMatchObject({ status: 'ok' });
    expect(read).toHaveBeenCalledWith('/api/v1/stocks/alerts');
    expect(revalidate).toHaveBeenCalledWith('/stocks/alerts');
  });

  it('rejects a deletion when the backend reports deleted=false', async () => {
    write.mockResolvedValue({ deleted: false });
    expect(await deleteStockAlert(initial, deleteForm())).toMatchObject({ status: 'error' });
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects deletion when the target is still in the owner list', async () => {
    write.mockResolvedValue({ deleted: true });
    read.mockResolvedValue({ alerts: [rule] });
    expect(await deleteStockAlert(initial, deleteForm())).toMatchObject({ status: 'error' });
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a malformed readback rather than treating it as an empty list', async () => {
    write.mockResolvedValue({ deleted: true });
    read.mockResolvedValue({ alerts: null });
    expect(await deleteStockAlert(initial, deleteForm())).toMatchObject({ status: 'error' });
  });

  it('reports deletion only after a true receipt and verified absence', async () => {
    write.mockResolvedValue({ deleted: true });
    read.mockResolvedValue({ alerts: [] });
    expect(await deleteStockAlert(initial, deleteForm())).toMatchObject({ status: 'ok' });
    expect(read).toHaveBeenCalledWith('/api/v1/stocks/alerts');
    expect(revalidate).toHaveBeenCalledWith('/stocks/alerts');
  });
});
