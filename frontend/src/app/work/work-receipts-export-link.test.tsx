import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkReceiptsExportLink } from './work-receipts-export-link';

afterEach(cleanup);
describe('Work receipt CSV accessibility and scope', () => {
  it('exposes a keyboard-focusable, labelled 44px target and truthful recent-20 scope in Korean', () => {
    render(<WorkReceiptsExportLink isEn={false} />);
    const link = screen.getByRole('link', { name: '최근 보상 영수증 CSV 다운로드' });
    expect(link.getAttribute('href')).toBe('/work/receipts/export.csv');
    expect(link.className).toContain('min-h-11');
    expect(link.className).toContain('focus-visible');
    expect(screen.getByText(/최근 보상 영수증 최대 20건/)).toBeDefined();
  });
  it('provides an English alternative and disclaims settlement proof', () => {
    render(<WorkReceiptsExportLink isEn />);
    expect(screen.getByRole('link', { name: 'Download recent receipts CSV' })).toBeDefined();
    expect(screen.getByText(/not lifetime earnings or settlement proof/)).toBeDefined();
  });
});
