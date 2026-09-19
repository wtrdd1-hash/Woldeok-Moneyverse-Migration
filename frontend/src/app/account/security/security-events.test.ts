import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
const page = readFileSync(resolve(process.cwd(), 'src/app/account/security/page.tsx'), 'utf8');
describe('account security events', () => {
  it('loads and renders privacy-safe recent security activity', () => {
    expect(page).toContain("'/api/v1/account/security/events'");
    expect(page).toContain('최근 보안 활동');
    expect(page).toContain('SECURITY_EVENT_LABEL[event.type]');
    expect(page).not.toContain('event.metadata');
  });
});
