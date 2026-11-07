import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkReceiptRewardFilter } from './work-receipt-filter';

describe('owner reward receipt source state', () => {
  it('distinguishes a verified empty unfiltered history from a filtered zero-match', () => {
    const base = { invalid: false, unavailable: false, verifiedEmpty: true, isEn: true };
    const unfiltered = renderToStaticMarkup(<WorkReceiptRewardFilter {...base} filtered={false} />);
    const filtered = renderToStaticMarkup(<WorkReceiptRewardFilter {...base} filtered selected="10" />);
    expect(unfiltered).toContain('No recent reward receipts.');
    expect(filtered).toContain('No matching receipts among your latest 20.');
  });
  it('keeps an accessible retry and exact filter after source failure', () => {
    const html = renderToStaticMarkup(<WorkReceiptRewardFilter
      selected="9007199254740993" filtered invalid={false} unavailable verifiedEmpty={false} isEn />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/work?receiptMinReward=9007199254740993"');
    expect(html).toContain('min-h-11');
    expect(html).toContain('Retry');
  });
});
