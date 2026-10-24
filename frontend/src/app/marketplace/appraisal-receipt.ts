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

const MONEY = /^\d+(?:\.\d{1,4})?$/;
const HASH = /^0x[0-9a-f]{64}$/i;

export function parseAppraisalCertificate(value: unknown): AppraisalCertificate | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const textFields = ['certId', 'itemId', 'itemName', 'rarity', 'provenanceAuthor', 'craftedAt', 'appraisedAt'] as const;
  if (textFields.some((field) => typeof row[field] !== 'string' || !(row[field] as string).trim())) return null;
  if (!String(row.certId).startsWith('CERT-')) return null;
  if (!HASH.test(String(row.certHash))) return null;
  for (const field of ['appraisedValueWld', 'fairBandP25', 'fairBandP75'] as const) {
    if (typeof row[field] !== 'string' || !MONEY.test(row[field])) return null;
  }
  if (!Number.isFinite(Date.parse(String(row.appraisedAt))) || !Number.isFinite(Date.parse(String(row.craftedAt)))) return null;
  return row as unknown as AppraisalCertificate;
}

export function parseAppraisalList(value: unknown): AppraisalCertificate[] {
  if (!Array.isArray(value)) throw new Error('Appraisal list response is not an array');
  const list = value.map(parseAppraisalCertificate);
  if (list.some((entry) => entry === null)) throw new Error('Appraisal list contains invalid certificate');
  return list as AppraisalCertificate[];
}
