import { describe, expect, it } from 'vitest';
import { SpaceController } from './space/space.controller';
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

  it('가상 부동산 & 메타버스 랜드 엔드포인트 정상 동작', async () => {
    const spaceServiceMock = {
      listUserSpaces: async () => [],
      listCityProjects: async () => [],
      listDelinquencies: async () => [],
      purchaseSpace: async () => ({}),
      contributeCityProject: async () => ({}),
      getSpaceTaxStatus: async () => ({}),
      payPropertyTax: async () => ({}),
      getSpaceById: async () => ({}),
      updateSpaceLayout: async () => true,
    } as any;

    const controller = new SpaceController(spaceServiceMock);
    const districts = await controller.listDistricts();
    expect(districts.districts.length).toBeGreaterThan(0);
    expect(districts.districts[0].id).toBe('district-gangnam-teheran');

    const lands = await controller.listRealEstateLands();
    expect(lands.lands.length).toBeGreaterThan(0);

    const myLands = await controller.listMyRealEstateLands(mockReq);
    expect(myLands.lands.length).toBeGreaterThan(0);

    const purchaseRes = await controller.purchaseRealEstateLand(mockReq, {
      districtId: 'district-gangnam-teheran',
      landCode: 'LAND-TH-999',
      landTier: 'PRIME_HQ',
      priceWld: 25000000,
      idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(purchaseRes.success).toBe(true);
    expect(purchaseRes.receipt.code).toBe('LAND-TH-999');

    const rentRes = await controller.rentRealEstateLand(mockReq, 'land-001', {
      dailyRentWld: 50000,
      depositWld: 500000,
      idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    });
    expect(rentRes.success).toBe(true);

    const settleRes = await controller.settleLandRent(mockReq, 'land-001');
    expect(settleRes.success).toBe(true);
    expect(settleRes.settledAmountWld).toBe(144000);
  });

  it('가상 파생상품 & 10x 레버리지 선물 엔드포인트 정상 동작', async () => {
    const controller = new DerivativesController();
    const markets = await controller.listMarkets();
    expect(markets.markets.length).toBeGreaterThan(0);

    const positions = await controller.listMyPositions(mockReq);
    expect(positions.positions.length).toBeGreaterThan(0);

    const openRes = await controller.openPosition(mockReq, {
      ticker: 'KRX_005930',
      side: 'LONG',
      leverage: 5,
      collateralWld: 100000,
      idempotencyKey: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(openRes.success).toBe(true);
    expect(openRes.position.leverage).toBe(5);

    const closeRes = await controller.closePosition(mockReq, 'pos-001', {
      idempotencyKey: 'b1b2c3d4-e5f6-7890-abcd-ef1234567891',
    });
    expect(closeRes.success).toBe(true);
    expect(closeRes.settledPnlWld).toBe(82236);

    const history = await controller.getTradeHistory(mockReq);
    expect(history.history.length).toBeGreaterThan(0);
  });

  it('가상 스타트업 VC 엔젤투자 & 크라우드펀딩 엔드포인트 정상 동작', async () => {
    const controller = new VenturesController();
    const pitches = await controller.listPitches();
    expect(pitches.pitches.length).toBeGreaterThan(0);

    const investments = await controller.listMyInvestments(mockReq);
    expect(investments.investments.length).toBeGreaterThan(0);

    const investRes = await controller.investVenture(mockReq, {
      pitchId: 'pitch-ai-01',
      amountWld: 1000000,
      idempotencyKey: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(investRes.success).toBe(true);
    expect(investRes.receipt.investedAmountWld).toBe(1000000);

    const claimRes = await controller.claimDividend(mockReq, {
      investmentId: 'inv-001',
      idempotencyKey: 'c1b2c3d4-e5f6-7890-abcd-ef1234567891',
    });
    expect(claimRes.success).toBe(true);
    expect(claimRes.claimedAmountWld).toBe(48500);

    const applyRes = await controller.applyFounderPitch(mockReq, {
      startupName: '테스트 유니콘',
      sector: 'AI 핀테크',
      targetFundingWld: 100000000,
      equitySharePercent: 10,
      description: '혁신적인 핀테크 AI 솔루션 플랫폼',
      idempotencyKey: 'c1b2c3d4-e5f6-7890-abcd-ef1234567892',
    });
    expect(applyRes.success).toBe(true);
    expect(applyRes.pitch.name).toBe('테스트 유니콘');
  });

  it('디스코드 클럽 & 길드 공성전 엔드포인트 정상 동작', async () => {
    const controller = new WarfareController();
    const strongholds = await controller.listStrongholds();
    expect(strongholds.strongholds.length).toBeGreaterThan(0);

    const status = await controller.getWarfareStatus(mockReq);
    expect(status.myClub.name).toBe('발할라 파이낸스 길드');

    const declareRes = await controller.declareWar(mockReq, {
      strongholdId: 'stronghold-central-bank',
      clubId: 'club-valhalla',
      depositWld: 1000000,
      idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(declareRes.success).toBe(true);

    const attackRes = await controller.attackStronghold(mockReq, 'stronghold-central-bank', {
      attackPowerWld: 50000,
      idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567891',
    });
    expect(attackRes.success).toBe(true);
    expect(attackRes.damageDealt).toBe(75000);

    const claimTaxRes = await controller.claimStrongholdTax(mockReq, {
      strongholdId: 'stronghold-central-bank',
      idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567892',
    });
    expect(claimTaxRes.success).toBe(true);
    expect(claimTaxRes.claimedTaxWld).toBe(1250000);
  });

  it('노코드 퀀트 봇 스튜디오 엔드포인트 정상 동작', async () => {
    const controller = new QuantController();
    const strategies = await controller.listStrategies(mockReq);
    expect(strategies.strategies.length).toBeGreaterThan(0);

    const createRes = await controller.createStrategy(mockReq, {
      name: 'RSI 퀀트 봇',
      targetTicker: 'KRX_005930',
      ruleLogic: { indicator: 'RSI', condition: 'LESS_THAN', value: 30 },
      orderAmountWld: 100000,
      stopLossPercent: -5,
      takeProfitPercent: 10,
      idempotencyKey: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(createRes.success).toBe(true);
    expect(createRes.strategy.name).toBe('RSI 퀀트 봇');

    const backtestRes = await controller.runBacktest(mockReq, {
      targetTicker: 'KRX_005930',
      periodDays: 30,
      ruleLogic: { indicator: 'RSI', condition: 'LESS_THAN', value: 30 },
      initialCapitalWld: 10000000,
    });
    expect(backtestRes.success).toBe(true);
    expect(backtestRes.result.winRatePercent).toBe(68.5);

    const toggleRes = await controller.toggleStrategy(mockReq, 'strat-001');
    expect(toggleRes.success).toBe(true);

    const logs = await controller.getStrategyLogs(mockReq, 'strat-001');
    expect(logs.logs.length).toBeGreaterThan(0);
  });
});
