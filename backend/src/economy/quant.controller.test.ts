import { describe, expect, it } from 'vitest';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import type { RequestWithSession } from '../auth/session.context';
import { QuantController } from './quant.controller';

const request = { session: { user_id: 'b0c2e86b-05e1-455c-9650-beb7c2ed1289', role: 'USER' } } as unknown as RequestWithSession;

const backtest = {
  targetTicker: 'KRX_005930',
  periodDays: 30,
  ruleLogic: { indicator: 'RSI', condition: 'LESS_THAN', value: 30 },
  initialCapitalWld: 10_000_000,
};

async function expectUnavailable(action: Promise<unknown>) {
  await expect(action).rejects.toMatchObject({
    status: 503,
    response: expect.objectContaining({ code: 'QUANT_EVIDENCE_UNAVAILABLE' }),
  });
}

describe('quant API must not invent financial evidence', () => {
  const controller = new QuantController();

  it('does not assign synthetic active strategies to the authenticated member', async () => {
    await expectUnavailable(controller.listStrategies(request));
  });

  it('does not report fixed backtest returns as verified trades', async () => {
    await expectUnavailable(controller.runBacktest(request, backtest));
    await expectUnavailable(controller.runBacktest(request, { ...backtest, initialCapitalWld: 1 }));
  });

  it('does not generate execution logs for an arbitrary strategy identifier', async () => {
    await expectUnavailable(controller.getStrategyLogs(request, 'arbitrary-strategy'));
  });

  it('marks unverified responses as non-cacheable', () => {
    for (const method of [controller.listStrategies, controller.runBacktest, controller.getStrategyLogs]) {
      const headers = Reflect.getMetadata(HEADERS_METADATA, method) as { name: string; value: string }[] | undefined;
      expect(headers).toEqual(expect.arrayContaining([{ name: 'Cache-Control', value: 'no-store' }]));
    }
  });

  it('continues to block unjournaled bot deployment and activation', async () => {
    await expect(controller.createStrategy(request, {} as never)).rejects.toMatchObject({ status: 503 });
    await expect(controller.toggleStrategy(request, 'arbitrary-strategy')).rejects.toMatchObject({ status: 503 });
  });
});
