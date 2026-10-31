export interface AppraisalCertificate {
  readonly certId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly rarity: string;
  readonly appraisedValueWld: string;
  readonly fairBandP25: string;
  readonly fairBandP75: string;
  readonly provenanceAuthor: string;
  readonly craftedAt: string;
  readonly appraisedAt: string;
  readonly certHash: string;
}

const amountPattern = /^(?:0|[1-9][0-9]{0,15})(?:\.[0-9]{1,4})?$/;
const fields = ['certId', 'itemId', 'itemName', 'rarity', 'appraisedValueWld',
  'fairBandP25', 'fairBandP75', 'provenanceAuthor', 'craftedAt', 'appraisedAt', 'certHash'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAmount(value: string): boolean {
  return amountPattern.test(value);
}

function amountUnits(value: string): bigint {
  const [integer = '0', fraction = ''] = value.split('.');
  return BigInt(integer) * 10000n + BigInt(fraction.padEnd(4, '0') || '0');
}

function parseCertificate(value: unknown): AppraisalCertificate {
  if (!isRecord(value) || !fields.every((field) => typeof value[field] === 'string')) {
    throw new Error('unverified appraisal response');
  }
  const cert = value as unknown as AppraisalCertificate;
  if (!/^[A-Za-z0-9_-]{6,96}$/.test(cert.certId)
    || !/^0x[0-9a-fA-F]{32,64}$/.test(cert.certHash)
    || !cert.itemId.trim() || cert.itemId.length > 128
    || !cert.itemName.trim() || cert.itemName.length > 200
    || !cert.rarity.trim() || cert.rarity.length > 40
    || !cert.provenanceAuthor.trim() || cert.provenanceAuthor.length > 200
    || !isAmount(cert.appraisedValueWld)
    || !isAmount(cert.fairBandP25) || !isAmount(cert.fairBandP75)
    || !Number.isFinite(Date.parse(cert.craftedAt))
    || !Number.isFinite(Date.parse(cert.appraisedAt))
    || amountUnits(cert.fairBandP25) > amountUnits(cert.appraisedValueWld)
    || amountUnits(cert.appraisedValueWld) > amountUnits(cert.fairBandP75)) {
    throw new Error('unverified appraisal response');
  }
  return cert;
}

export function parseAppraisalCertificates(value: unknown): AppraisalCertificate[] {
  if (!Array.isArray(value) || value.length > 500) {
    throw new Error('unverified appraisal list');
  }
  const certificates = value.map(parseCertificate);
  if (new Set(certificates.map((cert) => cert.certId)).size !== certificates.length) {
    throw new Error('duplicate appraisal certificate');
  }
  return certificates;
}

export function formatAppraisalWld(value: string): string {
  if (!isAmount(value)) return '—';
  const [integer = '0', fraction = ''] = value.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimals = fraction.replace(/0+$/, '');
  return decimals ? `${grouped}.${decimals}` : grouped;
}
