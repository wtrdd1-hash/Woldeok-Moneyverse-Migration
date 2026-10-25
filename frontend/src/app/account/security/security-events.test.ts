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

describe('bounded account security event export CTA', () => {
  it('exposes a member-only, accessible recent-50 CSV link without claiming full history', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    expect(source).toContain('<a href="/api/account/security/events/export">');
    expect(source).toContain('최대 50건');
    expect(source).toContain('eventData !== null && events.length > 0');
  });
});
