import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminTreasuryController } from './treasury.controller';
import type { TreasuryService } from './treasury.service';

const controllerWith = (result: unknown) => {
  const getUserMoneyFlows = vi.fn().mockImplementation(() => result);
  return { controller: new AdminTreasuryController({ getUserMoneyFlows } as unknown as TreasuryService), getUserMoneyFlows };
};

describe('administrator money-flow PostgreSQL failure boundary', () => {
  it('maps revoked profile-table reads to 503 without leaking SQL', async () => {
    const sql = Object.assign(new Error('permission denied for table member_profiles'), { code: '42501' });
    const { controller } = controllerWith(Promise.reject(sql));
    await expect(controller.getUserMoneyFlows(50)).rejects.toMatchObject({
      status: 503,
      response: { message: 'ADMIN_MONEY_FLOW_SOURCE_UNAVAILABLE' },
    });
  });
  it('does not mask invalid filter errors as a source outage', async () => {
    const invalid = new BadRequestException('invalid cursor');
    const { controller } = controllerWith(Promise.reject(invalid));
    await expect(controller.getUserMoneyFlows(50)).rejects.toBe(invalid);
  });
  it('preserves a verified backend response', async () => {
    const payload = { items: [], summary: { total_volume_24h: '0' }, next_cursor: null };
    const { controller } = controllerWith(Promise.resolve(payload));
    await expect(controller.getUserMoneyFlows(50)).resolves.toBe(payload);
  });
});
