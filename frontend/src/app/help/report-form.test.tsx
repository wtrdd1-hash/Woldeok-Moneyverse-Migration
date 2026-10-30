import { describe, expect, it, vi } from 'vitest';
vi.mock('./report-action', () => ({ reportVerifiedHelp: vi.fn() }));
import { renderToStaticMarkup } from 'react-dom/server';
import { HelpReportForm } from './report-form';

describe('accessible private verified help issue report', () => {
  it('renders labelled reason and details, 320px-friendly controls and revision-bound hidden fields', () => {
    const html = renderToStaticMarkup(<HelpReportForm locale="ko" slug="wallet-guide" publishedRevisionId="aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" idempotencyKey="11111111-aaaa-4bbb-8ccc-222222222222" />);
    expect(html).toContain('for="help-report-reason"');
    expect(html).toContain('help-report-reason');
    expect(html).toContain('help-report-details');
    expect(html).toContain('min-h-11');
    expect(html).toContain('name="publishedRevisionId"');
    expect(html).toContain('name="idempotencyKey"');
    expect(html).not.toContain('value="admin"');
  });
});
