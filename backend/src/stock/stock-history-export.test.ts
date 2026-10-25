import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { StockController } from './stock.controller';
import type { StockService } from './stock.service';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
function controller() {
  const history = vi.fn().mockResolvedValue([]);
  const controller = new StockController({ history } as unknown as StockService);
  const request = { session: { user_id: actor } } as unknown as RequestWithSession;
  return { controller, request, history };
}

describe('stock history export API bounds', () => {
  it('defaults to 50 owner-only rows', async () => {
    const { controller: subject, request, history } = controller();
    await expect(subject.history(request)).resolves.toEqual({ trades: [] });
    expect(history).toHaveBeenCalledWith(actor, 50);
  });
  it('accepts 100 recent rows for a member export', async () => {
    const { controller: subject, request, history } = controller();
    await subject.history(request, '100');
    expect(history).toHaveBeenCalledWith(actor, 100);
  });
  it.each(['0', '101', '1.5', '-1', 'NaN', '', ' 10 ', '1e2'])('rejects invalid bound %j', async (value) => {
    const { controller: subject, request, history } = controller();
    await expect(subject.history(request, value)).rejects.toThrow(BadRequestException);
    expect(history).not.toHaveBeenCalled();
  });
});
