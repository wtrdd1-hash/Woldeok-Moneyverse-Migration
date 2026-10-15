import { describe, it, expect, vi } from 'vitest';
import { MintBureauService } from './mint-bureau.service';
import { ForbiddenException } from '@nestjs/common';

describe('retirement policy status enforcement', () => {
  it('rejects a cancelled order instead of issuing a certificate', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const bureau = new MintBureauService({ query } as any);
    await expect(bureau.retireAuthorizedAmount('actor', '11111111-1111-4111-8111-111111111111', '100', 'SINK', 'synthetic source detected', 'v653-policy')).rejects.toThrow(ForbiddenException);
  });
});
