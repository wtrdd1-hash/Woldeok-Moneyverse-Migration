import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const middlewareSource = readFileSync(
  path.join(process.cwd(), 'src/middleware.ts'),
  'utf8',
);

describe('isolated Test host routing', () => {
  it('requires an explicit Test origin and exact Test hostname', () => {
    expect(middlewareSource).toContain('process.env.TEST_FRONTEND_ORIGIN');
    expect(middlewareSource).toContain("requestHost === 'test.easy-scraping.com'");
  });

  it('routes before production HTTPS/auth/locale handling', () => {
    const routeAt = middlewareSource.indexOf('NextResponse.rewrite');
    const productionAt = middlewareSource.indexOf("if (process.env.NODE_ENV === 'production')");
    expect(routeAt).toBeGreaterThan(0);
    expect(routeAt).toBeLessThan(productionAt);
  });

  it('matches static assets so Test build chunks use the Test runtime', () => {
    expect(middlewareSource).toContain("matcher: ['/:path*']");
    expect(middlewareSource).toContain("pathname.startsWith('/_next/static/')");
  });
});
