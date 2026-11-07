import { describe, expect, it } from 'vitest';
import { SpaceController } from './space/space.controller';
import type { SpaceService } from './space/space.service';
import { DerivativesController } from './stock/derivatives.controller';
import { VenturesController } from './business/ventures.controller';
import { WarfareController } from './club/warfare.controller';
import { QuantController } from './economy/quant.controller';
import type { RequestWithSession } from './auth/session.context';

describe('15대 전 도메인 신규 REST API 엔드포인트 컨트롤러 검증', () => {
  const mockReq = {
    session: {
      user_id: 'test-user-uuid-1234',
      role: 'USER',
    },
  } as unknown as RequestWithSession;

  it('real-estate API refuses unverified holdings and synthetic financial receipts', async () => {
    const controller = new SpaceController({} as SpaceService);
    for (const read of [
      () => controller.listDistricts(),
      () => controller.listRealEstateLands(),
      () => controller.listMyRealEstateLands(mockReq),
    ]) {
      await expect(read()).rejects.toMatchObject({
        status: 503,
        response: { code: 'REAL_ESTATE_SOURCE_UNVERIFIED' },
      });
    }
    await expect(controller.purchaseRealEstateLand(mockReq, {
      districtId: 'district-gangnam-teheran', landCode: 'LAND-TH-999',
      landTier: 'PRIME_HQ', priceWld: 25000000,
      idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })).rejects.toMatchObject({ status: 503, response: { code: 'REAL_ESTATE_LEDGER_UNAVAILABLE' } });
    await expect(controller.rentRealEstateLand(mockReq, 'land-001', {
      dailyRentWld: 50000, depositWld: 500000,
      idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    })).rejects.toMatchObject({ status: 503, response: { code: 'REAL_ESTATE_LEDGER_UNAVAILABLE' } });
    await expect(controller.settleLandRent(mockReq, 'land-001')).rejects.toMatchObject({
      status: 503, response: { code: 'REAL_ESTATE_LEDGER_UNAVAILABLE' },
    });
  });

  it('derivatives read APIs reject unverified synthetic markets, positions and settlement history', async () => {
    const controller = new DerivativesController();
    for (const read of [() => controller.listMarkets(), () => controller.listMyPositions(), () => controller.getTradeHistory()]) {
      expect(read).toThrow(expect.objectContaining({
        status: 503,
        response: expect.objectContaining({ code: 'DERIVATIVES_DATA_UNVERIFIED' }),
      }));
    }

    // Unbacked leverage actions are deliberately blocked until the ledger is authoritative.
    await expect(controller.openPosition(mockReq, {
      ticker: 'KRX_005930',
      side: 'LONG',
      leverage: 5,
      collateralWld: 100000,
      idempotencyKey: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })).rejects.toMatchObject({ status: 503 });

    await expect(controller.closePosition(mockReq, 'pos-001', {
      idempotencyKey: 'b1b2c3d4-e5f6-7890-abcd-ef1234567891',
    })).rejects.toMatchObject({ status: 503 });

  });

  it('가상 스타트업 VC 엔젤투자 & 크라우드펀딩 엔드포인트 정상 동작', async () => {
    const controller = new VenturesController();
    // Financial read endpoints must not publish fabricated venture market or member balances.
    await expect(controller.listPitches()).rejects.toMatchObject({
      status: 503,
      response: { code: 'VENTURE_EVIDENCE_UNAVAILABLE' },
    });
    await expect(controller.listMyInvestments(mockReq)).rejects.toMatchObject({
      status: 503,
      response: { code: 'VENTURE_EVIDENCE_UNAVAILABLE' },
    });

    // No fake funding, dividends or incorporation receipts.
    await expect(controller.investVenture(mockReq, {
      pitchId: 'pitch-ai-01',
      amountWld: 1000000,
      idempotencyKey: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })).rejects.toMatchObject({ status: 503 });
    await expect(controller.claimDividend(mockReq, {
      investmentId: 'inv-001',
      idempotencyKey: 'c1b2c3d4-e5f6-7890-abcd-ef1234567891',
    })).rejects.toMatchObject({ status: 503 });
    await expect(controller.applyFounderPitch(mockReq, {
      startupName: '테스트 유니콘',
      sector: 'AI 핀테크',
      targetFundingWld: 100000000,
      equitySharePercent: 10,
      description: '혁신적인 핀테크 AI 솔루션 플랫폼',
      idempotencyKey: 'c1b2c3d4-e5f6-7890-abcd-ef1234567892',
    })).rejects.toMatchObject({ status: 503 });
  });

  it('guild warfare refuses invented stronghold, membership and tax receipts', async () => {
    const controller = new WarfareController();
    await expect(controller.listStrongholds()).rejects.toMatchObject({ status: 503 });
    await expect(controller.getWarfareStatus(mockReq)).rejects.toMatchObject({ status: 503 });

    await expect(controller.declareWar(mockReq, {
      strongholdId: 'stronghold-central-bank',
      clubId: 'club-valhalla',
      depositWld: 1000000,
      idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })).rejects.toMatchObject({ status: 503 });
    await expect(controller.attackStronghold(mockReq, 'stronghold-central-bank', {
      attackPowerWld: 50000,
      idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567891',
    })).rejects.toMatchObject({ status: 503 });
    await expect(controller.claimStrongholdTax(mockReq, {
      strongholdId: 'stronghold-central-bank',
      idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567892',
    })).rejects.toMatchObject({ status: 503 });
  });

  it('노코드 퀀트 봇 스튜디오 엔드포인트 정상 동작', async () => {
    const controller = new QuantController();
    await expect(controller.listStrategies(mockReq)).rejects.toMatchObject({ status: 503 });

    await expect(controller.createStrategy(mockReq, {
      name: 'RSI 퀀트 봇',
      targetTicker: 'KRX_005930',
      ruleLogic: { indicator: 'RSI', condition: 'LESS_THAN', value: 30 },
      orderAmountWld: 100000,
      stopLossPercent: -5,
      takeProfitPercent: 10,
      idempotencyKey: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })).rejects.toMatchObject({ status: 503 });

    await expect(controller.runBacktest(mockReq, {
      targetTicker: 'KRX_005930',
      periodDays: 30,
      ruleLogic: { indicator: 'RSI', condition: 'LESS_THAN', value: 30 },
      initialCapitalWld: 10000000,
    })).rejects.toMatchObject({ status: 503 });

    await expect(controller.toggleStrategy(mockReq, 'strat-001')).rejects.toMatchObject({ status: 503 });

    await expect(controller.getStrategyLogs(mockReq, 'strat-001')).rejects.toMatchObject({ status: 503 });
  });
});
