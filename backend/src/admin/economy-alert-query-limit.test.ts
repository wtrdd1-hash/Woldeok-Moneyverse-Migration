import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AdminEconomyController } from './economy.controller';
import type { EconomyConsoleRepository } from './economy.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: ACTOR } } as RequestWithSession;

function setup() {
  const alerts = vi.fn().mockResolvedValue([]);
  const controller = new AdminEconomyController({ alerts } as unknown as EconomyConsoleRepository);
  return { controller, alerts };
}

describe('admin economy alerts limit (HTTP wire contract)', () => {
  it.each([
    '',
    ' ',
    '\t',
    '0',
    '-1',
    '201',
    '01',
    '+1',
    '1.0',
    '1e2',
    '0x10',
    'Infinity',
    'NaN',
    '1 ',
    ' 1',
    '1\n',
    '99999999999999999999999',
    ['1', '2'],
    { value: '1' },
    null,
  ])('rejects noncanonical or out-of-range limit %j before DB access', async (limit) => {
    const { controller, alerts } = setup();
    await expect(controller.alerts(request, limit as string)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(alerts).not.toHaveBeenCalled();
  });

  it.each([
    ['1', 1],
    ['30', 30],
    ['200', 200],
  ])('accepts canonical %s as %i', async (limit, parsed) => {
    const { controller, alerts } = setup();
    await expect(controller.alerts(request, limit)).resolves.toEqual({ alerts: [] });
    expect(alerts).toHaveBeenCalledExactlyOnceWith(ACTOR, parsed);
  });

  it('preserves the default limit at the repository boundary', async () => {
    const { controller, alerts } = setup();
    await expect(controller.alerts(request)).resolves.toEqual({ alerts: [] });
    expect(alerts).toHaveBeenCalledExactlyOnceWith(ACTOR, undefined);
  });
});
