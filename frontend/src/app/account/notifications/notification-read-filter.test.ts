import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(
  join(process.cwd(), 'src/app/account/notifications/notification-tabs-bar.tsx'),
  'utf8',
);
describe('accessible notification read-state controls', () => {
  it('exposes a read-only filter and forwards it through the existing paginated owner feed', () => {
    expect(source).toContain('읽은 알림만 보기');
    expect(source).toContain("params.set('readOnly', 'true')");
    expect(source).toContain('aria-pressed={readOnly}');
    expect(source).toContain('setUnreadOnly(false)');
    expect(source).toContain('setReadOnly(false)');
  });
});
