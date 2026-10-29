import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotificationQueryDto } from './notification.dto';

describe('notification filter validation', () => {
  it('preserves explicit false and rejects invented categories and oversized offsets', async () => {
    const valid = plainToInstance(NotificationQueryDto, { unreadOnly: 'false', category: 'TRANSACTIONAL', offset: '20' });
    expect(valid.unreadOnly).toBe(false);
    expect(await validate(valid)).toHaveLength(0);
    const bad = plainToInstance(NotificationQueryDto, { unreadOnly: 'nonsense', category: 'ANY', offset: '5001' });
    expect((await validate(bad)).length).toBeGreaterThanOrEqual(3);
  });
});
