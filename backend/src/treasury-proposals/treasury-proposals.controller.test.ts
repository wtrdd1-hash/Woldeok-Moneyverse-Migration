import { describe, expect, it } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { TreasuryProposalsController } from './treasury-proposals.controller';

describe('treasury citizen proposals API fail-closed contract', () => {
  const controller = new TreasuryProposalsController();
  it.each(['list', 'propose', 'vote'] as const)('%s cannot invent DB-backed proposal or vote receipts', (method) => {
    expect(() => controller[method]()).toThrow(ServiceUnavailableException);
  });
});
