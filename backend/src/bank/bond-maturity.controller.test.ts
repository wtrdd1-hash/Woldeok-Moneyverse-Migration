import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { BankController } from './bank.controller';
import type { BankRepository } from './bank.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const request = {session: {user_id: actor}} as unknown as RequestWithSession;

describe('bond maturity endpoint', () => {
  it('uses authenticated actor only and bank standing SECURITY DEFINER read', async () => {
    const getStanding = vi.fn().mockResolvedValue({bonds: []});
    const controller = new BankController({getStanding} as unknown as BankRepository);
    expect(await controller.bondMaturityOverview(request)).toMatchObject({holdingCount: 0, totalPrincipalWld: '0'});
    expect(getStanding).toHaveBeenCalledExactlyOnceWith(actor);
    expect((Reflect.getMetadata(GUARDS_METADATA, BankController) as unknown[]).length).toBeGreaterThanOrEqual(3);
  });
  it('fails closed when standing is missing', async () => {
    const controller = new BankController({getStanding: vi.fn().mockResolvedValue(null)} as unknown as BankRepository);
    await expect(controller.bondMaturityOverview(request)).rejects.toMatchObject({status: 503});
  });
});
