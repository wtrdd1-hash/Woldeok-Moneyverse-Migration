import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('./actions', () => ({ createStockAlert: vi.fn(), deleteStockAlert: vi.fn() }));
import { AlertManager } from './alert-manager';

describe('active rule download accessibility', () => {
  it('provides a keyboard-accessible private export CTA and truthful scope', () => {
    const html = renderToStaticMarkup(<AlertManager stocks={[]} alerts={[]} events={[]} isEn />);
    expect(html).toContain('href="/stocks/alerts/rules.csv"');
    expect(html).toContain('Download active rules (CSV)');
    expect(html).toContain('above 100');
    expect(html).toContain('focus-visible');
  });
});
