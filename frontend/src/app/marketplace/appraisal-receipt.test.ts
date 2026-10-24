import { describe, expect, it } from 'vitest';
import { parseAppraisalCertificate, parseAppraisalList } from './appraisal-receipt';

const receipt = {
  certId: 'CERT-2026-0123456789ABCDEF', itemId: 'held-item-1', itemName: 'Verified holding',
  rarity: 'EPIC', appraisedValueWld: '4000.0000', fairBandP25: '3600.0000',
  fairBandP75: '4600.0000', provenanceAuthor: 'User-provided (unverified)',
  craftedAt: '2026-10-24T00:00:00Z', appraisedAt: '2026-10-24T00:00:00Z',
  certHash: `0x${'a'.repeat(64)}`,
};

describe('server-backed marketplace appraisal receipts', () => {
  it('accepts complete server certificates without rounding monetary strings', () => {
    expect(parseAppraisalCertificate(receipt)).toEqual(receipt);
  });
  it('treats an empty server list as empty, never demo certificates', () => {
    expect(parseAppraisalList([])).toEqual([]);
  });
  it('refuses fabricated or incomplete certificates', () => {
    expect(parseAppraisalCertificate({ ...receipt, certHash: '0x1234' })).toBeNull();
    expect(parseAppraisalCertificate({ ...receipt, certId: '' })).toBeNull();
    expect(parseAppraisalCertificate({ ...receipt, fairBandP25: 'not-a-number' })).toBeNull();
    expect(parseAppraisalCertificate({ ...receipt, appraisedAt: 'invalid' })).toBeNull();
  });
  it('refuses malformed list responses instead of treating them as no certificates', () => {
    expect(() => parseAppraisalList({ data: [] })).toThrow();
    expect(() => parseAppraisalList([receipt, { certId: 'fake' }])).toThrow();
  });
});
