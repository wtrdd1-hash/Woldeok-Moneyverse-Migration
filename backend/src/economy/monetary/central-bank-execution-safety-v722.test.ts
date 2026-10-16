import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { CentralBankService } from './central-bank.service';

describe('v722 central bank monetary mutations remain held absent reviewed ledger settlement', () => {
  const priorExecution = process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
  const priorLedger = process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
  beforeEach(() => {
    delete process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
    delete process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
  });
  afterEach(() => {
    if (priorExecution === undefined) delete process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
    else process.env.MONEYVERSE_MINT_EXECUTION_ENABLED = priorExecution;
    if (priorLedger === undefined) delete process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
    else process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED = priorLedger;
  });

  it('rejects policy proposal without issuing SQL mutations', async () => {
    const query = vi.fn();
    const service = new CentralBankService({ query } as any);
    await expect(
      service.proposePolicyOrder(
        'actor',
        'MINT',
        'WORK_REWARD',
        '1000',
        'Sufficient test policy reason',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects policy approval without issuing SQL mutations', async () => {
    const query = vi.fn();
    const service = new CentralBankService({ query } as any);
    await expect(service.approvePolicyOrder('actor', 'order')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves emergency freeze capability independently of mint certificate authorisation', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new CentralBankService({ query } as any);
    const result = await service.freezeIssuance(
      'actor',
      'Emergency monetary supply containment confirmed',
    );
    expect(result.is_issuance_frozen).toBe(true);
    expect(query).toHaveBeenCalledOnce();
  });
});
