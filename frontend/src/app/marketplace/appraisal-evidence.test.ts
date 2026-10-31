import { describe, expect, it } from 'vitest';
import { formatAppraisalWld, parseAppraisalCertificates } from './appraisal-evidence';

const certificate = {
  certId: 'CERT-2026-ABCDEF0123456789',
  itemId: 'collectible-01',
  itemName: 'Verified database record',
  rarity: 'EPIC',
  appraisedValueWld: '4000.0000',
  fairBandP25: '3600.0000',
  fairBandP75: '4600.0000',
  provenanceAuthor: 'User-supplied origin (unverified)',
  craftedAt: '2026-10-01T00:00:00+00:00',
  appraisedAt: '2026-10-31T12:00:00+00:00',
  certHash: '0x' + 'a'.repeat(64),
};

describe('marketplace appraisal source evidence', () => {
  it('accepts a verified empty server array, never seeded sample certificates', () => {
    expect(parseAppraisalCertificates([])).toEqual([]);
  });
  it('accepts database numeric(20,4) and displays it without false zero', () => {
    expect(parseAppraisalCertificates([certificate])).toEqual([certificate]);
    expect(formatAppraisalWld('4000.0000')).toBe('4,000');
    expect(formatAppraisalWld('4000.1250')).toBe('4,000.125');
  });
  it('rejects missing fields, malformed hashes, negative and unsafe amounts', () => {
    expect(() => parseAppraisalCertificates([{}])).toThrow();
    expect(() => parseAppraisalCertificates([{ ...certificate, certHash: 'fake' }])).toThrow();
    expect(() => parseAppraisalCertificates([{ ...certificate, fairBandP25: '-1' }])).toThrow();
    expect(() => parseAppraisalCertificates([{ ...certificate, appraisedValueWld: '9999999999999999999999' }])).toThrow();
  });
  it('rejects duplicate certificates and success-shaped non-arrays', () => {
    expect(() => parseAppraisalCertificates([certificate, certificate])).toThrow();
    expect(() => parseAppraisalCertificates({ success: true, certificates: [] })).toThrow();
  });
  it('rejects invalid timestamps and reversed estimate ranges', () => {
    expect(() => parseAppraisalCertificates([{ ...certificate, appraisedAt: 'tomorrow' }])).toThrow();
    expect(() => parseAppraisalCertificates([{ ...certificate, fairBandP25: '9000.0000' }])).toThrow();
  });
});
