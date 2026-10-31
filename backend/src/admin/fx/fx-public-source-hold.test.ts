import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { FxRepository } from './fx.repository';
import { PublicFxController } from './fx.controller';
import type { FxService } from './fx.service';

const observation = (updatedAt: string) => ({
  id: '00000000-0000-4000-8000-000000000001',
  reserveName: 'reference',
  currency: 'USD',
  totalReservesUsd: 1000000,
  targetAnchorRate: 1350,
  currentRate: 1352.5,
  isHalted: false,
  totalInterventionsCount: 0,
  totalIntervenedUsd: 0,
  updatedAt,
});

describe('FX reference source fail-closed contract', () => {
  it('rejects a stale seeded reserve instead of publishing it as live', async () => {
    const repo = new FxRepository({ query: vi.fn().mockResolvedValue({ rows: [observation('2026-10-07T06:04:59.131Z')] }) } as never);
    await expect(repo.getReserveStatus()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rejects absent reserve rather than fabricating a 1350 spot rate', async () => {
    const repo = new FxRepository({ query: vi.fn().mockResolvedValue({ rows: [] }) } as never);
    await expect(repo.getLatestRate()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('does not reveal PostgreSQL table names when app-role SELECT is denied', async () => {
    const query = vi.fn().mockRejectedValue(Object.assign(new Error('permission denied for table foreign_exchange_reserves'), { code: '42501' }));
    const repo = new FxRepository({ query } as never);
    await expect(repo.getReserveStatus()).rejects.toMatchObject({ status: 503 });
    try { await repo.getReserveStatus(); } catch (error) {
      expect(JSON.stringify(error)).not.toContain('foreign_exchange_reserves');
    }
  });

  it('rejects invalid, future or non-finite source observations', async () => {
    const now = new Date();
    const samples = [
      observation('not-a-date'),
      observation(new Date(now.getTime() + 60 * 60 * 1000).toISOString()),
      { ...observation(now.toISOString()), currentRate: Number.NaN },
    ];
    for (const row of samples) {
      const repo = new FxRepository({ query: vi.fn().mockResolvedValue({ rows: [row] }) } as never);
      await expect(repo.getReserveStatus()).rejects.toBeInstanceOf(ServiceUnavailableException);
    }
  });

  it('preserves a recent finite reference observation for non-public internal consumers', async () => {
    const row = observation(new Date().toISOString());
    const repo = new FxRepository({ query: vi.fn().mockResolvedValue({ rows: [row] }) } as never);
    expect(await repo.getReserveStatus()).toEqual(row);
  });

  it('never returns an unverified public portal payload, even when a mocked service claims success', async () => {
    const service = { getReserveStatus: vi.fn().mockResolvedValue(observation(new Date().toISOString())) };
    const controller = new PublicFxController(service as unknown as FxService);
    await expect(controller.getPublicPortalData()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(service.getReserveStatus).not.toHaveBeenCalled();
  });

  it('never advertises synthetic theoretical forward quotes as tradable public rates', async () => {
    const service = { getForwardRates: vi.fn().mockResolvedValue({ spotRate: 1352.5 }) };
    const controller = new PublicFxController(service as unknown as FxService);
    await expect(controller.getForwardRates()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(service.getForwardRates).not.toHaveBeenCalled();
  });
});
