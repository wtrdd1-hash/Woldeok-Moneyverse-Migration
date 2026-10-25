import { describe, expect, it, vi } from 'vitest';
import { StockAlertController } from './stock-alert.controller';
import type { StockAlertRepository } from './stock-alert.repository';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('private stock alert event export snapshot', () => {
  it('uses the authenticated session actor, requests the real 100-row database limit and labels scope', async () => {
    const events = vi.fn(async () => [{ event_id: 'e1', trigger_price: '9007199254740993' }]);
    const controller = new StockAlertController({ events } as unknown as StockAlertRepository);
    await expect(controller.eventsSnapshot(request)).resolves.toEqual({
      scope: 'recent_100_max', events: [{ event_id: 'e1', trigger_price: '9007199254740993' }],
    });
    expect(events).toHaveBeenCalledExactlyOnceWith(ACTOR, 100);
  });

  it('fails closed if the database returns more than 100 rows or invalid data', async () => {
    const events = vi.fn(async () => Array.from({ length: 101 }, () => ({})));
    const controller = new StockAlertController({ events } as unknown as StockAlertRepository);
    await expect(controller.eventsSnapshot(request)).rejects.toMatchObject({ status: 503 });
    events.mockResolvedValueOnce(null as never);
    await expect(controller.eventsSnapshot(request)).rejects.toMatchObject({ status: 503 });
  });

  it('never converts database failure into a successful empty export', async () => {
    const controller = new StockAlertController({ events: vi.fn(async () => { throw new Error('DB unavailable'); }) } as unknown as StockAlertRepository);
    await expect(controller.eventsSnapshot(request)).rejects.toMatchObject({ status: 503 });
  });
});
