import { describe, expect, it } from 'vitest';
import { ValidationPipe } from '@nestjs/common';
import { CitizenBudgetVoteDto } from './wallet.controller';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const parse = (body: unknown) => pipe.transform(body, { type: 'body', metatype: CitizenBudgetVoteDto });

describe('citizen budget vote DTO', () => {
  it('preserves the valid quarter and choice through global whitelist validation', async () => {
    await expect(parse({ quarter: '2026-Q4', choice: 'WELFARE' })).resolves.toMatchObject({
      quarter: '2026-Q4', choice: 'WELFARE',
    });
  });
  it.each([
    { quarter: '2026-Q5', choice: 'WELFARE' },
    { quarter: '2026-Q4', choice: 'BUYBACK_BURN' },
    { quarter: '2026-Q4', choice: 'WELFARE', extra: 'untrusted' },
  ])('rejects invalid or unknown properties', async (body) => {
    await expect(parse(body)).rejects.toMatchObject({ status: 400 });
  });
});
