import { describe, expect, it } from 'vitest';
import { supportTranscriptCsv } from './support-transcript-csv';

const id = '11111111-1111-4111-8111-111111111111';
const entry = { message_id: id, sender_kind: 'user', body: 'hello', created_at: '2026-10-25T00:00:00.000Z' };

describe('private support transcript CSV', () => {
  it('escapes spreadsheet formulas and quotes without a live Excel formula', () => {
    const csv = supportTranscriptCsv({ limit: 500, truncated: false, messages: [
      { ...entry, body: '  =HYPERLINK("bad","click")\r\n' },
      { ...entry, sender_kind: 'admin', body: '@evil, "quoted"' },
    ] });
    expect(csv).toContain('"\'=HYPERLINK(""bad"",""click"")"');
    expect(csv).toContain('"\'@evil, ""quoted"""');
    expect(csv).toMatch(/^\uFEFF/);
  });

  it('marks the first 500 cap as unverified instead of claiming a complete archive', () => {
    const csv = supportTranscriptCsv({ limit: 500, truncated: true, messages: [entry] });
    expect(csv).toContain('MAX_500_UNVERIFIED');
  });

  it('fails closed on invalid response data, sender, timestamp, or oversized arrays', () => {
    expect(() => supportTranscriptCsv({ limit: 500, truncated: false, messages: [{ ...entry, sender_kind: 'system' }] })).toThrow();
    expect(() => supportTranscriptCsv({ limit: 500, truncated: false, messages: [{ ...entry, created_at: 'yesterday' }] })).toThrow();
    expect(() => supportTranscriptCsv({ limit: 500, truncated: false, messages: Array.from({ length: 501 }, () => entry) })).toThrow();
  });
});
