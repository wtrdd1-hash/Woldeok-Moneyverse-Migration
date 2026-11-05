import { describe, expect, it, vi } from 'vitest';
import { EnterpriseRepository } from './enterprise.repository';
import { EnterpriseService } from './enterprise.service';

const actor = '11111111-1111-4111-8111-111111111111';
const key = '22222222-2222-4222-8222-222222222222';
const receipt = {
  receipt_id: key, code: 'SOE_POWER', old_status: 'ACTIVE',
  new_status: 'PAUSED', dividend_rate_bps: 3000,
  applied: true, settled: false,
};

describe('v1613 SOE DB-owned governance receipt', () => {
  it('does not perform any direct application-role table DML', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ receipt }] });
    const repo = new EnterpriseRepository({ query } as any);
    await expect(repo.updateSoeStatus('SOE_POWER', 'PAUSED', undefined, actor,
      'Operator governance decision', key)).resolves.toEqual(receipt);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('public.admin_soe_update_status');
    expect(sql).not.toMatch(/UPDATE\s+public\.state_enterprises/i);
    expect(params).toEqual([actor,'SOE_POWER','PAUSED',null,'Operator governance decision',key]);
  });
  it('fails closed when receipt is absent or contradictory', async () => {
    const repo = new EnterpriseRepository({ query: vi.fn().mockResolvedValue({
      rows: [{ receipt: { ...receipt, settled: true } }],
    }) } as any);
    await expect(repo.updateSoeStatus('SOE_POWER','PAUSED',undefined,actor,
      'Operator governance decision',key)).rejects.toMatchObject({ status: 503 });
  });
  it('rejects invalid identities, unauthorized shapes, absurd rates before SQL', async () => {
    const query = vi.fn();
    const repo = new EnterpriseRepository({ query } as any);
    await expect(repo.updateSoeStatus('SOE_POWER','ACTIVE',11000,actor,
      'Operator governance decision',key)).rejects.toMatchObject({ status: 400 });
    await expect(repo.updateSoeStatus('SOE_POWER','ACTIVE',1000,'fake',
      'Operator governance decision',key)).rejects.toMatchObject({ status: 400 });
    await expect(repo.updateSoeStatus('SOE_POWER','ACTIVE',1000,actor,
      'short',key)).rejects.toMatchObject({ status: 400 });
    expect(query).not.toHaveBeenCalled();
  });
  it('service rejects unknown statuses and delegates canonical dividend harvest', async () => {
    const repo = { updateSoeStatus: vi.fn(), distributeSoeDividends: vi.fn().mockResolvedValue({ total_dividends_collected: '108000' }) } as any;
    const service = new EnterpriseService(repo);
    await expect(service.updateSoeStatus('SOE_POWER','BROKEN',undefined,actor,
      'Operator governance decision',key)).rejects.toThrow();
    expect(repo.updateSoeStatus).not.toHaveBeenCalled();
    await service.harvestSoeDividends(actor);
    expect(repo.distributeSoeDividends).toHaveBeenCalledWith(actor);
  });
});
