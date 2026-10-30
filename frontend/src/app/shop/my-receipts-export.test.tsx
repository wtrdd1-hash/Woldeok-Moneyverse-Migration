import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MyReceipts } from './my-receipts';

vi.mock('@/lib/use-viewer', () => ({
  useViewer: () => ({ signedIn: true }),
}));

describe('member purchase CSV entry point', () => {
  it('exposes an accessible, same-origin download limited to recent receipts', () => {
    const html = renderToStaticMarkup(<MyReceipts />);
    expect(html).toContain('/api/shop/purchases/export');
    expect(html).toContain('aria-label="최근 최대 100건의 내 구매 기록 CSV 다운로드"');
    expect(html).toContain('최근 100건');
  });
});
