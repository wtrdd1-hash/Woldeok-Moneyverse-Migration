import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CitizenBudgetVoteDto } from './wallet.dto';

describe('budget vote HTTP DTO', () => {
  it('accepts canonical DB values and a valid quarter', () => {
    for (const choice of ['WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION']) {
      expect(validateSync(plainToInstance(CitizenBudgetVoteDto, { quarter: '2026-Q4', choice }))).toHaveLength(0);
    }
  });
  it('rejects retired choices, missing quarter and unrecognized quarter formats', () => {
    for (const input of [{ quarter: '2026-Q4', choice: 'EMERGENCY' }, { quarter: '2026-Q5', choice: 'WELFARE' }, { choice: 'WELFARE' }]) {
      expect(validateSync(plainToInstance(CitizenBudgetVoteDto, input)).length).toBeGreaterThan(0);
    }
  });
});
