import { describe, expect, it, vi } from 'vitest';
import { MintEvidenceReadService } from './mint-evidence-read.service';
import { MintController } from './mint.controller';
import { MintService } from './mint.service';

const empty = {
  status: 'VERIFIED_EMPTY', mintRecordCount: '0', retirementRecordCount: '0',
  mintRecords: [], retirementRecords: [], monetaryIssuanceCertified: false,
  reason: 'Legacy certificates have no independent canonical ledger transaction link',
};

describe('v1741 authoritative mint read-only evidence', () => {
  it('reads only the bounded database owner function and never uses fabricated service memory', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ evidence: empty }] });
    const evidence = new MintEvidenceReadService({ query } as never);
    const controller = new MintController(new MintService(), evidence);
    const first = await controller.getBatches();
    const second = await controller.getAuditCertificates();
    expect(first).toEqual(empty);
    expect(second).toEqual(empty);
    expect(query).toHaveBeenCalledWith('SELECT public.mint_evidence_read_v1741($1::integer) AS evidence', [50]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('does not conflate a verified empty record set with certified currency supply', async () => {
    const evidence = new MintEvidenceReadService({ query: vi.fn().mockResolvedValue({ rows: [{ evidence: empty }] }) } as never);
    expect(await evidence.read()).toMatchObject({ status: 'VERIFIED_EMPTY', monetaryIssuanceCertified: false });
  });

  it('fails closed for malformed, ambiguous or forged evidence', async () => {
    for (const forged of [
      { ...empty, status: 'RECONCILED' },
      { ...empty, mintRecordCount: '1' },
      { ...empty, monetaryIssuanceCertified: true },
      { ...empty, mintRecords: [{ id: 'not-a-uuid', amountWld: '999', evidenceStatus: 'UNCERTIFIED', createdAt: '2026-01-01' }] },
      { ...empty, mintRecords: [{ id: '00000000-0000-4000-8000-000000000001', amountWld: '1e9', evidenceStatus: 'UNCERTIFIED', createdAt: '2026-01-01' }] },
      undefined,
    ]) {
      const read = new MintEvidenceReadService({ query: vi.fn().mockResolvedValue({ rows: [{ evidence: forged }] }) } as never);
      await expect(read.read()).rejects.toMatchObject({ status: 503 });
    }
  });

  it('requires an actual DB and never falls back to in-memory MintService', async () => {
    await expect(new MintEvidenceReadService(null).read()).rejects.toMatchObject({ status: 503 });
  });

  it('does not expose issuance write functions in the GET reader', () => {
    expect(typeof new MintEvidenceReadService(null).read).toBe('function');
    const service = new MintService();
    expect(service).toBeDefined();
  });
});
