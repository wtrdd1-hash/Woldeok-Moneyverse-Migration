import { beforeEach, describe, expect, it, vi } from 'vitest';

const { write, readback, invalidate } = vi.hoisted(() => ({
  write: vi.fn(), readback: vi.fn(), invalidate: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({
  mutate: write,
  wholeAmount: (value: unknown) => typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? value : null,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
  idempotencyKey: () => 'test-key',
}));
vi.mock('@/lib/api', () => ({ apiOrNull: readback }));
vi.mock('next/cache', () => ({ revalidatePath: invalidate }));
vi.mock('../step-up', () => ({ STEP_UP_CODE: /^[0-9]{6}$/, spendSecondFactorCode: vi.fn() }));

import { createSeasonEvent, setBusinessActive, setSeasonEventActive } from '../actions';

const BUSINESS_ID = '11111111-1111-4111-8111-111111111111';
const EVENT_ID = '22222222-2222-4222-8222-222222222222';
const business = {
  id: BUSINESS_ID, symbol: 'CAFE', name: 'Cafe', purchase_cost: '100',
  daily_revenue: '10', daily_operating_cost: '2', active: false,
};
const event = {
  id: EVENT_ID, season_name: '2026', title: 'Festival', cost_wld: '100',
  points_per_entry: 5, active: false, ends_at: '2026-11-30T00:00:00.000Z',
};
const previous = { status: 'idle' as const, message: '' };

function businessForm(id = BUSINESS_ID, active = 'false') {
  const form = new FormData(); form.set('businessId', id); form.set('active', active); return form;
}
function eventForm(id = EVENT_ID, active = 'false') {
  const form = new FormData(); form.set('eventId', id); form.set('active', active); return form;
}
function createForm() {
  const form = new FormData();
  form.set('title', 'Festival'); form.set('costWld', '100'); form.set('pointsPerEntry', '5');
  return form;
}

beforeEach(() => { vi.clearAllMocks(); });

describe('admin catalog mutation receipts backed by authoritative read models', () => {
  it('does not claim business status changed when SQL reports changed:false', async () => {
    write.mockResolvedValue({ changed: false });
    const result = await setBusinessActive(previous, businessForm());
    expect(result.status).toBe('error');
    expect(readback).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('rejects malformed business write receipts and IDs before success', async () => {
    write.mockResolvedValue({ changed: 'true' });
    expect((await setBusinessActive(previous, businessForm())).status).toBe('error');
    expect((await setBusinessActive(previous, businessForm('not-a-uuid'))).status).toBe('error');
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('withholds success if business mutation succeeded but readback is missing or stale', async () => {
    write.mockResolvedValue({ changed: true });
    readback.mockResolvedValueOnce(null).mockResolvedValueOnce({ businessTypes: [{ ...business, active: true }] });
    expect((await setBusinessActive(previous, businessForm())).status).toBe('error');
    expect((await setBusinessActive(previous, businessForm())).status).toBe('error');
    expect(invalidate).toHaveBeenCalledWith('/admin/catalog');
  });

  it('acknowledges business changes only after a matching readback', async () => {
    write.mockResolvedValue({ changed: true });
    readback.mockResolvedValue({ businessTypes: [business] });
    const result = await setBusinessActive(previous, businessForm());
    expect(result.status).toBe('ok');
    expect(readback).toHaveBeenCalledWith('/api/v1/admin/business-types');
    expect(invalidate).toHaveBeenCalledWith('/admin/catalog');
  });

  it('rejects a season toggle that SQL did not apply', async () => {
    write.mockResolvedValue({ changed: false });
    expect((await setSeasonEventActive(previous, eventForm())).status).toBe('error');
    expect(readback).not.toHaveBeenCalled();
  });

  it('confirms season toggle state from the same authorized API before success', async () => {
    write.mockResolvedValue({ changed: true });
    readback.mockResolvedValueOnce({ events: [{ ...event, active: true }] })
      .mockResolvedValueOnce({ events: [event] });
    expect((await setSeasonEventActive(previous, eventForm())).status).toBe('error');
    expect((await setSeasonEventActive(previous, eventForm())).status).toBe('ok');
    expect(readback).toHaveBeenCalledWith('/api/v1/admin/season-events');
  });

  it('does not claim a new event exists when the API did not return a valid persisted ID', async () => {
    write.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'not-uuid' });
    expect((await createSeasonEvent(previous, createForm())).status).toBe('error');
    expect((await createSeasonEvent(previous, createForm())).status).toBe('error');
    expect(readback).not.toHaveBeenCalled();
  });

  it('withholds creation success when readback cannot verify the persisted event', async () => {
    write.mockResolvedValue({ id: EVENT_ID });
    readback.mockResolvedValue({ events: [] });
    const result = await createSeasonEvent(previous, createForm());
    expect(result.status).toBe('error');
    expect(invalidate).toHaveBeenCalledWith('/admin/catalog');
  });

  it('confirms a newly created event only with matching title, cost and points', async () => {
    write.mockResolvedValue({ id: EVENT_ID });
    readback.mockResolvedValue({ events: [event] });
    const result = await createSeasonEvent(previous, createForm());
    expect(result.status).toBe('ok');
    expect(readback).toHaveBeenCalledWith('/api/v1/admin/season-events');
    expect(invalidate).toHaveBeenCalledWith('/admin/catalog');
  });
});
