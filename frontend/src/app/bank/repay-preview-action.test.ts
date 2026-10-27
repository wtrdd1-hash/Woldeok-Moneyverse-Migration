import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  wholeAmount: (value: FormDataEntryValue | null) => typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? value : null,
  failure: () => ({ status: 'error', message: 'Unable to preview repayment.' }),
}));
import { previewRepayAction } from './actions';

const loanId = 'a0000000-0000-4000-8000-000000000001';
function form(amount: string, id = loanId) {
  const data = new FormData();
  data.set('amount', amount); data.set('loanId', id); return data;
}

describe('repayment preview server action', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('uses CSRF-protected mutation path without idempotent ledger command', async () => {
    mutateMock.mockResolvedValueOnce({ loanId, eligible: true, payableAmount: '100', requestedAmount: '100', nonbinding: true });
    const result = await previewRepayAction(form('100'));
    expect(result.status).toBe('ok');
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/banking/repay-preview', {
      body: { loanId, amount: '100' },
    });
  });
  it('rejects malformed amount and loan before any API call', async () => {
    expect((await previewRepayAction(form('0'))).status).toBe('error');
    expect((await previewRepayAction(form('100', 'not-a-uuid'))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('does not claim a successful preview after upstream rejection', async () => {
    mutateMock.mockRejectedValueOnce(new Error('denied'));
    expect((await previewRepayAction(form('100'))).status).toBe('error');
  });
});
