import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { MintBureauService } from './mint-bureau.service';

describe('v722 P0 mint and retirement containment until ledger-certified settlement', () => {
  const initialMint = process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
  const initialLedger = process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
  beforeEach(() => {
    delete process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
    delete process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
  });
  afterEach(() => {
    if (initialMint === undefined) delete process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
    else process.env.MONEYVERSE_MINT_EXECUTION_ENABLED = initialMint;
    if (initialLedger === undefined) delete process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
    else process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED = initialLedger;
  });

  it('blocks mint certificate creation before any database statement by default', async () => {
    const query = vi.fn();
    const bureau = new MintBureauService({ query } as any);
    await expect(
      bureau.executeAuthorizedMint('actor', 'order', '100', null, 'idemp'),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('blocks retirement claims before any database statement by default', async () => {
    const query = vi.fn();
    const bureau = new MintBureauService({ query } as any);
    await expect(
      bureau.retireAuthorizedAmount(
        'actor',
        null,
        '100',
        'SINK',
        'synthetic sink receipt',
        'idemp',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('does not unfreeze mint with execution-only opt-in', async () => {
    process.env.MONEYVERSE_MINT_EXECUTION_ENABLED = 'true';
    const query = vi.fn();
    const bureau = new MintBureauService({ query } as any);
    await expect(
      bureau.executeAuthorizedMint('actor', 'order', '100', null, 'idemp'),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('does not unfreeze retirement with ledger-certification-only opt-in', async () => {
    process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED = 'true';
    const query = vi.fn();
    const bureau = new MintBureauService({ query } as any);
    await expect(
      bureau.retireAuthorizedAmount(
        'actor',
        null,
        '100',
        'SINK',
        'synthetic sink receipt',
        'idemp',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });
});
