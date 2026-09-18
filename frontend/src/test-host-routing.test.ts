import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const proxySource = readFileSync(
  path.join(process.cwd(), 'src/proxy.ts'),
  'utf8',
);

describe('isolated Test host routing', () => {
  it('requires an explicit Test origin and exact Test hostname', () => {
    expect(proxySource).toContain('process.env.TEST_FRONTEND_ORIGIN');
    expect(proxySource).toContain("requestHost === 'test.easy-scraping.com'");
  });

  it('routes before production HTTPS/auth/locale handling', () => {
    const routeAt = proxySource.indexOf('NextResponse.rewrite');
    const productionAt = proxySource.indexOf("if (process.env.NODE_ENV === 'production')");
    expect(routeAt).toBeGreaterThan(0);
    expect(routeAt).toBeLessThan(productionAt);
  });

  it('matches static assets so Test build chunks use the Test runtime', () => {
    expect(proxySource).toContain("matcher: ['/:path*']");
    expect(proxySource).toContain("pathname.startsWith('/_next/static/')");
  });
});
