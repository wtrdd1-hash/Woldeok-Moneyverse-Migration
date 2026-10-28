import { describe, expect, it } from 'vitest';
import { supportTranscriptCsv } from './csv';

describe('private support transcript CSV', () => {
  it('uses a fixed header and UTF-8 BOM for spreadsheet compatibility', () => {
    const csv = supportTranscriptCsv([{ message_id: 'm1', sender_kind: 'admin', body: '안녕하세요', created_at: '2026-10-28T00:00:00Z' }]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('message_id,sender,created_at,message');
    expect(csv).toContain('안녕하세요');
  });

  it.each(['=HYPERLINK("evil")', '+cmd', '-3+4', '@SUM(1)', '  =evil', '\t@evil'])('neutralizes spreadsheet formulas in messages', (body) => {
    const csv = supportTranscriptCsv([{ message_id: 'm1', sender_kind: 'user', body, created_at: '2026-10-28T00:00:00Z' }]);
    expect(csv).toContain("'" + body.replace(/[\r\n\t]/g, ' ').replace(/"/g, '""'));
    expect(csv).not.toContain(`,"${body.replace(/[\r\n\t]/g, ' ')}"`);
  });

  it('quotes commas and double quotes and normalizes embedded line breaks', () => {
    const csv = supportTranscriptCsv([{ message_id: 'm1', sender_kind: 'user', body: 'a, "b"\r\nc', created_at: '2026-10-28T00:00:00Z' }]);
    expect(csv).toContain('"a, ""b""  c"');
  });
});

describe('bounded export honesty', () => {
  it('marks the 500-message cap in the exported file when truncation is possible', () => {
    const csv = supportTranscriptCsv([], true);
    expect(csv).toContain('오래된 순으로 최대 500개 메시지만 포함됩니다.');
    expect(csv).toContain('이후 기록이 더 있을 수 있습니다.');
  });
});
