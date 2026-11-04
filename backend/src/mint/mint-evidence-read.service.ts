import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../core/pool.provider';

export type MintEvidenceRecord = {
  id: string; amountWld: string; createdAt: string; evidenceStatus: 'UNCERTIFIED';
};
export type MintEvidenceSnapshot = {
  status: 'VERIFIED_EMPTY' | 'UNVERIFIED';
  mintRecordCount: string;
  retirementRecordCount: string;
  mintRecords: MintEvidenceRecord[];
  retirementRecords: MintEvidenceRecord[];
  monetaryIssuanceCertified: false;
  reason: string;
};

const canonical = (x: unknown): x is string => typeof x === 'string' && /^(?:0|[1-9][0-9]{0,79})$/.test(x);

/** Admin-controller-only, bounded DB snapshot. No memory or issuance state. */
@Injectable()
export class MintEvidenceReadService {
  constructor(@Inject(PG_POOL) private readonly pool: Pick<Pool, 'query'> | null) {}

  async read(): Promise<MintEvidenceSnapshot> {
    if (!this.pool) throw new ServiceUnavailableException({ code: 'MINT_EVIDENCE_UNAVAILABLE' });
    let result;
    try { result = await this.pool.query('SELECT public.mint_evidence_read_v1741($1::integer) AS evidence', [50]); }
    catch { throw new ServiceUnavailableException({ code: 'MINT_EVIDENCE_UNAVAILABLE' }); }
    const value: unknown = result.rows[0]?.evidence;
    if (!value || typeof value !== 'object') throw new ServiceUnavailableException({ code: 'MINT_EVIDENCE_INVALID' });
    const row = value as Record<string, unknown>;
    const validRecords = (data: unknown): data is MintEvidenceRecord[] => Array.isArray(data)
      && data.length <= 50 && data.every((x: unknown) => {
        if (!x || typeof x !== 'object') return false;
        const r = x as Record<string, unknown>;
        return typeof r.id === 'string' && /^[0-9a-f-]{36}$/i.test(r.id)
          && canonical(r.amountWld) && typeof r.createdAt === 'string'
          && Number.isFinite(Date.parse(r.createdAt)) && r.evidenceStatus === 'UNCERTIFIED';
      });
    if (!['VERIFIED_EMPTY','UNVERIFIED'].includes(String(row.status))
      || !canonical(row.mintRecordCount) || !canonical(row.retirementRecordCount)
      || !validRecords(row.mintRecords) || !validRecords(row.retirementRecords)
      || row.monetaryIssuanceCertified !== false || typeof row.reason !== 'string'
      || (row.status === 'VERIFIED_EMPTY' && (
        row.mintRecordCount !== '0' || row.retirementRecordCount !== '0'
        || row.mintRecords.length !== 0 || row.retirementRecords.length !== 0))) {
      throw new ServiceUnavailableException({ code: 'MINT_EVIDENCE_INVALID' });
    }
    return row as MintEvidenceSnapshot;
  }
}
