import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AiNewsController } from './ai-news.controller';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const SCENARIO = '22222222-2222-4222-8222-222222222222';

function pgFailure(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

async function rejectedPublication(error: Error): Promise<BadRequestException> {
  const service = { publish: vi.fn().mockRejectedValue(error) };
  const controller = new AiNewsController(service as never);
  try {
    await controller.publish(
      { session: { user_id: ACTOR } } as never,
      SCENARIO,
      { hours: 6, headline: 'Market update', effects: [{ direction: 'up', strength: 1 }] } as never,
    );
  } catch (caught: unknown) {
    if (caught instanceof BadRequestException) return caught;
    throw caught;
  }
  throw new Error('expected publication to be refused');
}

describe('AI news database error privacy boundary', () => {
  it('does not serialize raw PostgreSQL messages or secret-bearing details for expected command failures', async () => {
    const secret = 'postgres://admin:secret@private-db.example/users';
    const error = await rejectedPublication(pgFailure('P0001', `invalid command: ${secret}`));
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toMatchObject({
      code: 'ai_news_refused',
      message: 'this scenario cannot be published',
    });
    expect(JSON.stringify(error.getResponse())).not.toContain(secret);
    expect(error.getResponse()).not.toHaveProperty('detail');
  });

  it('keeps the known six-hour reversal UX with only a fixed safe reason token', async () => {
    const error = await rejectedPublication(pgFailure(
      '22023',
      'a strong reversal cannot follow the opposite news within six hours',
    ));
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toMatchObject({ code: 'ai_news_refused', detail: 'reversal' });
  });

  it('keeps the known already-decided scenario UX with only a fixed safe reason token', async () => {
    const error = await rejectedPublication(pgFailure('22023', 'scenario is no longer open'));
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toMatchObject({ code: 'ai_news_refused', detail: 'no longer open' });
  });

  it('does not treat an arbitrary database message containing reversal as a safe reason', async () => {
    const secret = 'reversal: user_id=private-user; sql=SELECT * FROM identities';
    const error = await rejectedPublication(pgFailure('22023', secret));
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).not.toHaveProperty('detail');
    expect(JSON.stringify(error.getResponse())).not.toContain(secret);
  });

  it('does not downgrade unexpected database failures to client errors', async () => {
    const original = pgFailure('08006', 'database connection lost');
    const service = { publish: vi.fn().mockRejectedValue(original) };
    const controller = new AiNewsController(service as never);
    await expect(controller.publish(
      { session: { user_id: ACTOR } } as never,
      SCENARIO,
      { hours: 6, headline: 'Market update', effects: [{ direction: 'up', strength: 1 }] } as never,
    )).rejects.toBe(original);
  });
});
