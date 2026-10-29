import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuditLogsView } from './audit-logs-view';
import { auditCsvCell, auditCsvDocument } from './audit-export-csv';

describe('admin audit CSV export', () => {
  it.each([
    '=HYPERLINK("https://bad.invalid","click")',
    '+SUM(1,2)',
    '-1+2',
    '@SUM(A1:A2)',
    '\t=1+1',
    '\r\n=2+2',
    '  =3+3',
    '\uFEFF=4+4',
  ])('neutralizes spreadsheet formula prefix %j', (value) => {
    expect(auditCsvCell(value)).toBe(`"'${value.replace(/"/g, '""')}"`);
  });
  it('preserves ordinary text, quotes, commas and newlines without altering evidence', () => {
    expect(auditCsvCell('hello, "audit"\nworld')).toBe('"hello, ""audit""\nworld"');
    expect(auditCsvCell(null)).toBe('""');
    expect(auditCsvCell(200)).toBe('"200"');
  });
  it('exports exactly the supplied current-page rows with an explicit scope marker', () => {
    expect(
      auditCsvDocument(
        ['action', 'actor'],
        [
          ['login', '=cmd'],
          ['logout', 'safe'],
        ],
      ),
    ).toBe('"action","actor"\r\n"login","\'=cmd"\r\n"logout","safe"');
  });
});

describe('admin audit export controls', () => {
  it('states that CSV and JSON exports include only the loaded page for screen readers', () => {
    const html = renderToStaticMarkup(<AuditLogsView events={[]} />);
    expect(html).toContain('현재 페이지 감사 로그 CSV 내보내기');
    expect(html).toContain('현재 페이지 감사 로그 JSON 내보내기');
    expect(html).toContain('다른 페이지는 포함하지 않습니다');
    expect(html).toContain('aria-live="polite"');
  });
});
