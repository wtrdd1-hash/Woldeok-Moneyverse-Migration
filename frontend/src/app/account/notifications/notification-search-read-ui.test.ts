import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const source = readFileSync(join(process.cwd(), 'src/app/account/notifications/notification-search-panel.tsx'), 'utf8');
describe('read-only notification search accessible UI', () => {
  it('offers read-only selection and sends the state with the private search request', () => {
    expect(source).toContain('읽은 알림만');
    expect(source).toContain('readOnly');
    expect(source).toContain('setUnreadOnly(false)');
  });
});
