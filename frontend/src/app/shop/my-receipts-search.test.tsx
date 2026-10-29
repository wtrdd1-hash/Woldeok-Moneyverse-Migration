import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/use-viewer', () => ({ useViewer: () => ({ signedIn: true }) }));
import { MyReceipts } from './my-receipts';

describe('shop receipt search accessibility', () => {
  it('renders a labelled 80-character search field and honest recent-history boundary', () => {
    const html = renderToStaticMarkup(<MyReceipts />);
    expect(html).toContain('name="receiptSearch"');
    expect(html).toContain('maxLength="80"');
    expect(html).toContain('최근 100건');
  });
});
