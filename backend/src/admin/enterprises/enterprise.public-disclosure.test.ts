import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { EnterpriseRepository } from './enterprise.repository';
import { EnterpriseService } from './enterprise.service';
import { PublicEnterpriseController } from './enterprise.controller';

const publicSnapshot = {
  overview: { holding_code: 'WSHC_SOE_HOLDING', total_soe_assets_wld: '0' },
  soes: [],
  privateEnterprises: [],
  financial_data_status: 'PROJECTION_ONLY_UNVERIFIED',
  ledger_confirmed: false,
};

describe('P0 public enterprise disclosure least-privilege contract', () => {
  it('queries one SECURITY DEFINER read function, never underlying enterprise tables', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ disclosure: publicSnapshot }] });
    const repository = new EnterpriseRepository({ query } as never);
    const result = await repository.getPublicDisclosure();
    expect(result).toEqual(publicSnapshot);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toMatch(
      /SELECT\s+public\.enterprise_public_disclosure\(\)\s+AS\s+disclosure/i,
    );
    expect(query.mock.calls[0]?.[0]).not.toMatch(
      /FROM\s+public\.(state_enterprises|private_enterprises)/i,
    );
  });

  it.each(['42883', '42501'])('fails closed with HTTP 503 for PostgreSQL %s', async (code) => {
    const query = vi.fn().mockRejectedValue({ code });
    const repository = new EnterpriseRepository({ query } as never);
    await expect(repository.getPublicDisclosure()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('converts connection failures into 503 without leaking internal SQL details', async () => {
    const query = vi.fn().mockRejectedValue(new Error('private internal db host'));
    const repository = new EnterpriseRepository({ query } as never);
    await expect(repository.getPublicDisclosure()).rejects.toThrow(
      'Public enterprise disclosure unavailable',
    );
    await expect(repository.getPublicDisclosure()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('fails closed if the read function returns no snapshot', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new EnterpriseRepository({ query } as never);
    await expect(repository.getPublicDisclosure()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('routes the public endpoint through the dedicated disclosure service, not admin reads', async () => {
    const getPublicDisclosure = vi.fn().mockResolvedValue(publicSnapshot);
    const service = new EnterpriseService({ getPublicDisclosure } as never);
    const controller = new PublicEnterpriseController(service);
    const result = await controller.getPublicEnterprises();
    expect(getPublicDisclosure).toHaveBeenCalledOnce();
    expect(result).toMatchObject(publicSnapshot);
    expect(result.source).toBe('DATABASE_SNAPSHOT');
    expect(result.settlementStatus).toBe('NOT_VERIFIED');
    expect(result.disclosed_at).toEqual(expect.any(String));
  });

  it('defines a bounded, public-only SECURITY DEFINER function with no PUBLIC execution grant', () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        '../packages/database/migrations/281-enterprise-public-disclosure.sql',
      ),
      'utf8',
    );
    expect(migration).toMatch(/SECURITY DEFINER/i);
    expect(migration).toMatch(/SET search_path = pg_catalog, pg_temp/i);
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.enterprise_public_disclosure\(\) FROM PUBLIC/i,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.enterprise_public_disclosure\(\) TO moneyverse_app/i,
    );
    expect(migration).toMatch(/LIMIT 20/i);
    expect(migration).toMatch(/floor\(coalesce\(sum\(net_profit_hourly_wld/i);
    expect(migration).toMatch(/PROJECTION_ONLY_UNVERIFIED/);
    expect(migration).not.toMatch(
      /GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)\s+ON\s+(?:TABLE\s+)?public\./i,
    );
  });
});
