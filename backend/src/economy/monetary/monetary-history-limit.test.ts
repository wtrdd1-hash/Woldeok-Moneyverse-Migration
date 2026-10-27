import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { MonetaryController } from './monetary.controller';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';

const invalidQueryLimits: unknown[] = [
  '', '0', '-1', '51', '1e2', '2.5', '2junk', ' 2', '+2',
  '9007199254740993', ['1', '2'], { limit: '2' },
];

function makeController() {
  const central = { listPolicyOrders: vi.fn().mockResolvedValue([]) };
  const mint = {
    listMintCertificates: vi.fn().mockResolvedValue([]),
    listRetirementCertificates: vi.fn().mockResolvedValue([]),
  };
  const auto = { getRecentEvents: vi.fn().mockResolvedValue([]) };
  return {
    controller: new MonetaryController(
      central as unknown as CentralBankService,
      mint as unknown as MintBureauService,
      auto as unknown as AutoMonetaryRegulationService,
    ),
    central, mint, auto,
  };
}

describe('admin monetary history pagination boundary', () => {
  const routes = [
    ['getAutoRegulationEvents', 'auto', 'getRecentEvents'],
    ['listOrders', 'central', 'listPolicyOrders'],
    ['listPolicyOrdersAlias', 'central', 'listPolicyOrders'],
    ['listMints', 'mint', 'listMintCertificates'],
    ['listMintCertificatesAlias', 'mint', 'listMintCertificates'],
    ['listRetirements', 'mint', 'listRetirementCertificates'],
  ] as const;

  for (const [route, service, method] of routes) {
    it.each(invalidQueryLimits)(`${route} rejects invalid limit %j before any query`, async (raw) => {
      const target = makeController();
      await expect(target.controller[route](raw as never)).rejects.toMatchObject({ status: 400 });
      expect(target[service][method]).not.toHaveBeenCalled();
    });

    it(`${route} defaults to 20 and accepts 1..50`, async () => {
      const target = makeController();
      await target.controller[route]();
      await target.controller[route]('1' as never);
      await target.controller[route]('50' as never);
      expect(target[service][method]).toHaveBeenNthCalledWith(1, 20);
      expect(target[service][method]).toHaveBeenNthCalledWith(2, 1);
      expect(target[service][method]).toHaveBeenNthCalledWith(3, 50);
    });
  }
});

describe('admin monetary history service SQL boundary', () => {
  const cases = [
    ['central bank policy orders', (db: Queryable, limit: number) => new CentralBankService(db).listPolicyOrders(limit)],
    ['mint certificates', (db: Queryable, limit: number) => new MintBureauService(db).listMintCertificates(limit)],
    ['retirement certificates', (db: Queryable, limit: number) => new MintBureauService(db).listRetirementCertificates(limit)],
    ['auto-regulation events', (db: Queryable, limit: number) =>
      new AutoMonetaryRegulationService(db, {} as CentralBankService).getRecentEvents(limit)],
  ] as const;

  for (const [label, call] of cases) {
    it.each([0, -1, 51, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
      `${label} rejects direct invalid limit %j without SQL`, async (limit) => {
        const query = vi.fn().mockResolvedValue({ rows: [] });
        await expect(call({ query } as unknown as Queryable, limit)).rejects.toMatchObject({ status: 400 });
        expect(query).not.toHaveBeenCalled();
      },
    );
    it(`${label} uses a bounded parameter for a valid query`, async () => {
      const query = vi.fn().mockResolvedValue({ rows: [] });
      await call({ query } as unknown as Queryable, 50);
      expect(query).toHaveBeenCalledOnce();
      expect(query.mock.calls[0]?.[1]).toEqual([50]);
    });
  }
});
