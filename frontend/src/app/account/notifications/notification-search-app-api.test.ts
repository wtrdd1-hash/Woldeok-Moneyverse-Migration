import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appGatewayPath } from '@/lib/app-gateway';

describe('Android and private web notification search contract', () => {
  it('maps Android search to the same owner-bound NestJS API', () => {
    expect(appGatewayPath(['notifications', 'search'])).toBe('/api/v1/notifications/search');
  });
  it('never caches or indexes native notification responses', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/app-api/v1/[...path]/route.ts'), 'utf8');
    expect(source).toContain("parts[0] === 'notifications'");
    expect(source).toContain("headers.set('cache-control', 'private, no-store')");
    expect(source).toContain("headers.set('x-robots-tag', 'noindex')");
  });
  it('keeps member search disabled until the server-side release flag is explicitly enabled', () => {
    const page = readFileSync(join(process.cwd(), 'src/app/account/notifications/page.tsx'), 'utf8');
    expect(page).toContain("process.env.NOTIFICATION_SEARCH_ENABLED === 'true'");
    expect(page).toContain('<NotificationTabsBar />');
  });
});
