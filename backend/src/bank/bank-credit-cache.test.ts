import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { BankController } from './bank.controller';

describe('private bank standing and credit evidence', () => {
  it.each(['standing', 'creditRating'] as const)('%s forbids HTTP caching of member financial facts', (method) => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, BankController.prototype[method]) as
      | Array<{ name: string; value: string }>
      | undefined;
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
  });
});
