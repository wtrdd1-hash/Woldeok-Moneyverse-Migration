import { describe, expect, it, vi } from 'vitest';
vi.mock('../../discord/discord-alert.service', () => ({ DiscordAlertService: class {} }));
import { AdminKdicController } from './kdic.controller';
import { KdicService } from './kdic.service';
import { KdicRepository } from './kdic.repository';

async function expectHold(promise: Promise<unknown>): Promise<void> {
  await expect(promise).rejects.toMatchObject({
    status: 503,
    response: expect.objectContaining({ code: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED' }),
  });
}

describe('KDIC legacy financial mutation containment', () => {
  it('rejects all three admin POST routes without reaching the financial service', async () => {
    const service = {
      assessQuarterlyPremiums: vi.fn(),
      injectEmergencyLiquidity: vi.fn(),
      executeDepositPayout: vi.fn(),
      getFundOverview: vi.fn().mockResolvedValue({ fund: { id: 'KDIC_MAIN_FUND' } }),
    };
    const controller = new AdminKdicController(service as unknown as KdicService);
    await expectHold(controller.assessPremiums());
    await expectHold(controller.injectLiquidity());
    await expectHold(controller.executePayout());
    expect(service.assessQuarterlyPremiums).not.toHaveBeenCalled();
    expect(service.injectEmergencyLiquidity).not.toHaveBeenCalled();
    expect(service.executeDepositPayout).not.toHaveBeenCalled();
    expect(await controller.getOverview()).toEqual({ success: true, data: { fund: { id: 'KDIC_MAIN_FUND' } } });
  });

  it('rejects direct repository calls before opening any DB connection', async () => {
    const pool = { connect: vi.fn(), query: vi.fn() };
    const repository = new KdicRepository(pool as never);
    await expectHold(repository.assessQuarterlyPremiums('actor'));
    await expectHold(repository.injectEmergencyLiquidity('BANK_COMMERCIAL', 1_000_000, 'actor'));
    await expectHold(repository.executeDepositPayout('BANK_COMMERCIAL', 'member', 'actor'));
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('rejects direct service invocations before repository writes or Discord messages', async () => {
    const repo = {
      assessQuarterlyPremiums: vi.fn(),
      injectEmergencyLiquidity: vi.fn(),
      executeDepositPayout: vi.fn(),
    };
    const service = new KdicService(repo as never);
    await expectHold(service.assessQuarterlyPremiums('actor'));
    await expectHold(service.injectEmergencyLiquidity('BANK_COMMERCIAL', 1_000_000, 'actor'));
    await expectHold(service.executeDepositPayout('BANK_COMMERCIAL', 'member', 'actor'));
    expect(repo.assessQuarterlyPremiums).not.toHaveBeenCalled();
    expect(repo.injectEmergencyLiquidity).not.toHaveBeenCalled();
    expect(repo.executeDepositPayout).not.toHaveBeenCalled();
  });
});
