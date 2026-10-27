import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { StockController } from './stock.controller';
import type { StockService } from './stock.service';

const STOCK = '00000000-0000-4000-8000-000000000001';

function controller() {
  const service = {
    sparkSeries: vi.fn(async () => []),
    priceHistory: vi.fn(async () => []),
    candles: vi.fn(async () => []),
    priceRange: vi.fn(async () => null),
  };
  return { subject: new StockController(service as unknown as StockService), service };
}

describe('public stock price query contract', () => {
  const malformed: unknown[] = [
    '', ' ', '0', '-1', '01', '1.0', '1e2', '0x10', '20junk',
    'Infinity', '9007199254740993', ['10'], ['10', '20'], {}, null,
  ];

  it.each(malformed)('rejects malformed sparkline limit %j before service access', async (value) => {
    const { subject, service } = controller();
    await expect(subject.sparklines(value as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.sparkSeries).not.toHaveBeenCalled();
  });

  it.each(malformed)('rejects malformed price-history limit %j before service access', async (value) => {
    const { subject, service } = controller();
    await expect(subject.prices(STOCK, value as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.priceHistory).not.toHaveBeenCalled();
  });

  it.each(malformed)('rejects malformed candle limit %j before service access', async (value) => {
    const { subject, service } = controller();
    await expect(subject.candles(STOCK, '300', value as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.candles).not.toHaveBeenCalled();
    expect(service.priceRange).not.toHaveBeenCalled();
  });

  it.each(['', ' ', '0300', '3e2', '0x12c', '300.0', ['300'], '300junk'])(
    'rejects noncanonical candle interval %j before service access',
    async (value) => {
      const { subject, service } = controller();
      await expect(subject.candles(STOCK, value as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.candles).not.toHaveBeenCalled();
      expect(service.priceRange).not.toHaveBeenCalled();
    },
  );

  it('rejects values above the per-series SQL bounds', async () => {
    const { subject, service } = controller();
    await expect(subject.sparklines('241')).rejects.toBeInstanceOf(BadRequestException);
    await expect(subject.prices(STOCK, '241')).rejects.toBeInstanceOf(BadRequestException);
    await expect(subject.candles(STOCK, '300', '401')).rejects.toBeInstanceOf(BadRequestException);
    expect(service.sparkSeries).not.toHaveBeenCalled();
    expect(service.priceHistory).not.toHaveBeenCalled();
    expect(service.candles).not.toHaveBeenCalled();
  });

  it('preserves default and explicit canonical query semantics', async () => {
    const { subject, service } = controller();
    await subject.sparklines(undefined);
    await subject.prices(STOCK, undefined);
    await subject.candles(STOCK, undefined, undefined);
    await subject.sparklines('240');
    await subject.prices(STOCK, '240');
    await subject.candles(STOCK, '300', '400');
    expect(service.sparkSeries).toHaveBeenNthCalledWith(1, undefined);
    expect(service.priceHistory).toHaveBeenNthCalledWith(1, STOCK, undefined);
    expect(service.candles).toHaveBeenNthCalledWith(1, STOCK, 86400, undefined);
    expect(service.sparkSeries).toHaveBeenNthCalledWith(2, 240);
    expect(service.priceHistory).toHaveBeenNthCalledWith(2, STOCK, 240);
    expect(service.candles).toHaveBeenNthCalledWith(2, STOCK, 300, 400);
  });
});
