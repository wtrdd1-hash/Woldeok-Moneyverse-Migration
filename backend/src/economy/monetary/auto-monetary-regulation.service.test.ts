import { describe, expect, it, vi } from 'vitest';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import type { CentralBankService } from './central-bank.service';
import type { Queryable } from '../../core/db';

describe('AutoMonetaryRegulationService', () => {
  const mockConfig = {
    id: 1,
    is_enabled: true,
    target_faucet_sink_ratio: 1.0,
    tolerance_band_pct: 5.0,
    max_step_pct: 5.0,
    evaluation_interval_seconds: 3600,
    circuit_breaker_freeze_pct: 15.0,
    last_evaluated_at: null,
    last_action_taken: 'NONE',
    updated_at: new Date().toISOString(),
  };

  const createMockPool = (overrides?: {
    config?: typeof mockConfig;
    faucet24h?: string;
    sink24h?: string;
  }) => {
    const cfg = overrides?.config ?? { ...mockConfig };
    const faucet = overrides?.faucet24h ?? '500000';
    const sink = overrides?.sink24h ?? '500000';

    return {
      query: vi.fn().mockImplementation((queryText: string, params?: unknown[]) => {
        if (queryText.includes('FROM public.monetary_auto_regulation_configs')) {
          return Promise.resolve({ rows: [cfg] });
        }
        if (queryText.includes('FROM public.ledger_entries')) {
          return Promise.resolve({
            rows: [{ faucet_24h: faucet, sink_24h: sink }],
          });
        }
        if (queryText.includes('INSERT INTO public.monetary_regulation_events')) {
          return Promise.resolve({
            rows: [
              {
                id: 'evt-test-1',
                faucet_24h_wld: (params?.[0] as string) ?? faucet,
                sink_24h_wld: (params?.[1] as string) ?? sink,
                current_ratio: (params?.[2] as number) ?? Number(faucet) / Number(sink),
                action_type: (params?.[3] as string) ?? 'TEST_ACTION',
                adjustment_amount_wld: (params?.[4] as string) ?? '25000',
                policy_order_id: (params?.[5] as string) ?? 'order-test-1',
                reason: (params?.[6] as string) ?? 'test reason',
                created_at: new Date().toISOString(),
              },
            ],
          });
        }
        if (queryText.includes('UPDATE public.monetary_auto_regulation_configs')) {
          return Promise.resolve({ rows: [cfg] });
        }
        return Promise.resolve({ rows: [] });
      }),
    } as unknown as Queryable;
  };

  const createMockCentralBank = () => {
    return {
      proposePolicyOrder: vi.fn().mockResolvedValue({ id: 'mock-order-1' }),
      approvePolicyOrder: vi.fn().mockResolvedValue({ id: 'mock-order-1', status: 'APPROVED' }),
      freezeIssuance: vi.fn().mockResolvedValue({ is_issuance_frozen: true }),
    } as unknown as CentralBankService;
  };

  it('기본 설정을 정상적으로 조회한다', async () => {
    const pool = createMockPool();
    const centralBank = createMockCentralBank();
    const service = new AutoMonetaryRegulationService(pool, centralBank);

    const config = await service.getConfig();
    expect(config.is_enabled).toBe(true);
    expect(config.target_faucet_sink_ratio).toBe(1.0);
    expect(config.tolerance_band_pct).toBe(5.0);
  });

  it('비율이 허용 오차 내(1.00)일 때 중립 균형(NEUTRAL_BALANCED)을 유지한다', async () => {
    const pool = createMockPool({ faucet24h: '500000', sink24h: '500000' });
    const centralBank = createMockCentralBank();
    const service = new AutoMonetaryRegulationService(pool, centralBank);

    const event = await service.evaluateAndExecute('test-admin');
    expect(event).toBeDefined();
    expect(event?.action_type).toBe('NEUTRAL_BALANCED');
    expect(centralBank.proposePolicyOrder).not.toHaveBeenCalled();
    expect(centralBank.freezeIssuance).not.toHaveBeenCalled();
  });

  it('발행이 소각을 5% 이상 초과하면 테이퍼링 긴축(TAPER_CONTRACTION) 명령을 자동 발의하고 승인한다', async () => {
    // 600,000 / 500,000 = 1.20 (20% 초과)
    const pool = createMockPool({ faucet24h: '600000', sink24h: '500000' });
    const centralBank = createMockCentralBank();
    const service = new AutoMonetaryRegulationService(pool, centralBank);

    const event = await service.evaluateAndExecute('test-admin');
    expect(event).toBeDefined();
    expect(event?.action_type).toBe('TAPER_CONTRACTION');
    expect(centralBank.proposePolicyOrder).toHaveBeenCalledWith(
      'test-admin',
      'RETIRE',
      'HARD_SINK_PURGE',
      expect.any(String),
      expect.stringContaining('[자동 테이퍼링 긴축]'),
      24,
    );
    expect(centralBank.approvePolicyOrder).toHaveBeenCalled();
  });

  it('소각이 발행을 5% 이상 초과하면 유동성 완화(QE_EXPANSION) 명령을 자동 발의하고 승인한다', async () => {
    // 400,000 / 500,000 = 0.80 (20% 소각 우세)
    const pool = createMockPool({ faucet24h: '400000', sink24h: '500000' });
    const centralBank = createMockCentralBank();
    const service = new AutoMonetaryRegulationService(pool, centralBank);

    const event = await service.evaluateAndExecute('test-admin');
    expect(event).toBeDefined();
    expect(event?.action_type).toBe('QE_EXPANSION');
    expect(centralBank.proposePolicyOrder).toHaveBeenCalledWith(
      'test-admin',
      'MINT',
      'WORK_REWARD',
      expect.any(String),
      expect.stringContaining('[자동 유동성 완화]'),
      24,
    );
    expect(centralBank.approvePolicyOrder).toHaveBeenCalled();
  });

  it('비정상 급격 인플레이션(발행 200만 WLD, 비율 2.0배) 발생 시 서킷브레이커 동결을 즉각 발동한다', async () => {
    // 2,000,000 / 500,000 = 4.0배 (위험 임계치 1.15배 초과)
    const pool = createMockPool({ faucet24h: '2000000', sink24h: '500000' });
    const centralBank = createMockCentralBank();
    const service = new AutoMonetaryRegulationService(pool, centralBank);

    const event = await service.evaluateAndExecute('test-admin');
    expect(event).toBeDefined();
    expect(event?.action_type).toBe('CIRCUIT_BREAKER_FREEZE');
    expect(centralBank.freezeIssuance).toHaveBeenCalledWith(
      'test-admin',
      expect.stringContaining('[서킷브레이커]'),
    );
  });
});
