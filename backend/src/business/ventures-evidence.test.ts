import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { VenturesController } from './ventures.controller';

const memberRequest = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as never;

describe('venture financial evidence boundary', () => {
  it('does not publish synthetic pitches or funding totals as a live market', async () => {
    const controller = new VenturesController();
    await expect(controller.listPitches()).rejects.toMatchObject({
      status: 503,
      response: { code: 'VENTURE_EVIDENCE_UNAVAILABLE' },
    });
    expect(Reflect.getMetadata(HEADERS_METADATA, controller.listPitches))
      .toContainEqual({ name: 'Cache-Control', value: 'no-store' });
  });

  it('does not fabricate member holdings, payouts or claimable WLD', async () => {
    const controller = new VenturesController();
    await expect(controller.listMyInvestments(memberRequest)).rejects.toMatchObject({
      status: 503,
      response: { code: 'VENTURE_EVIDENCE_UNAVAILABLE' },
    });
    expect(Reflect.getMetadata(HEADERS_METADATA, controller.listMyInvestments))
      .toContainEqual({ name: 'Cache-Control', value: 'no-store' });
  });
});
