vi.mock('./monetary-execution-gate', () => ({ requireLedgerCertifiedMintExecution: vi.fn() }));
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { MintBureauService } from './mint-bureau.service';
import { ForbiddenException } from '@nestjs/common';

describe('retirement policy status enforcement', () => {
  beforeAll(() => {
    process.env.MONEYVERSE_MINT_EXECUTION_ENABLED = 'true';
    process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED = 'true';
  });
  afterAll(() => {
    delete process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
    delete process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
  });

  it('rejects a cancelled order instead of issuing a certificate', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const bureau = new MintBureauService({ query } as any);
    await expect(
      bureau.retireAuthorizedAmount(
        'actor',
        '11111111-1111-4111-8111-111111111111',
        '100',
        'SINK',
        'synthetic source detected',
        'v653-policy',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
