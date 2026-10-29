import { describe, expect, it } from 'vitest';
import { HEADERS_METADATA, GUARDS_METADATA } from '@nestjs/common/constants';
import { QuantController } from './quant.controller';
import type { RequestWithSession } from '../auth/session.context';

const req = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as unknown as RequestWithSession;
const unavailable = { status: 503, response: { code: 'QUANT_EVIDENCE_UNAVAILABLE' } };

describe('quant evidence must not be fabricated', () => {
  const controller = new QuantController();
  it('rejects fabricated member-owned bots instead of assigning sample bots to the caller', async () => {
    await expect(controller.listStrategies(req)).rejects.toMatchObject(unavailable);
  });
  it('rejects invented trade executions for arbitrary strategy IDs', async () => {
    await expect(controller.getStrategyLogs(req, 'not-owned-or-not-real')).rejects.toMatchObject(unavailable);
  });
  it('rejects a fixed successful backtest without authoritative market ticks', async () => {
    await expect(controller.runBacktest(req, {
      targetTicker: 'UNKNOWN', periodDays: 30, ruleLogic: { rule: 'rsi' }, initialCapitalWld: 10000000,
    })).rejects.toMatchObject(unavailable);
  });
  it('prevents caching and retains session, authentication, and consent guards on financial reads', () => {
    for (const handler of [QuantController.prototype.listStrategies, QuantController.prototype.getStrategyLogs, QuantController.prototype.runBacktest]) {
      expect(Reflect.getMetadata(HEADERS_METADATA, handler)).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'Cache-Control', value: 'no-store' }),
      ]));
    }
    expect(Reflect.getMetadata(GUARDS_METADATA, QuantController)).toHaveLength(3);
  });
});
