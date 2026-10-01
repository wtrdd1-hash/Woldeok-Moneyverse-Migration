import { describe, expect, it } from 'vitest';
import {
  CHANNEL_API_ROUTES,
  matchChannelRoute,
  type ChannelRouteDefinition,
} from './channel-api';

function key(route: ChannelRouteDefinition): string {
  return `${route.channel}:${route.method}:${route.pathTemplate}`;
}

describe('CHANNEL_API_ROUTES', () => {
  it('contains every documented App API endpoint exactly once for App v2', () => {
    const app = CHANNEL_API_ROUTES.filter((route) => route.channel === 'APP');
    expect(app).toHaveLength(179);
    expect(new Set(app.map(key)).size).toBe(app.length);
    expect(app.every((route) => route.pathTemplate.startsWith('/app-api/v2/'))).toBe(true);
  });

  it('uses the Site v1 public prefix for every Site route', () => {
    const site = CHANNEL_API_ROUTES.filter((route) => route.channel === 'SITE');
    expect(site.length).toBeGreaterThan(0);
    expect(site.every((route) => route.pathTemplate.startsWith('/site-api/v1/'))).toBe(true);
  });

  it('has no duplicate channel, method and path template', () => {
    const keys = CHANNEL_API_ROUTES.map(key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('does not expose one literal public route through both channels unless it is shared read-only', () => {
    const byMethodPath = new Map<string, ChannelRouteDefinition[]>();
    for (const route of CHANNEL_API_ROUTES) {
      const literal = `${route.method}:${route.pathTemplate}`;
      byMethodPath.set(literal, [...(byMethodPath.get(literal) ?? []), route]);
    }
    for (const group of byMethodPath.values()) {
      if (group.length < 2) continue;
      expect(group.every((route) => route.sharedReadOnly === true && route.method === 'GET')).toBe(true);
    }
  });

  it('requires idempotency for every non-GET route mapped to an Economy Core command', () => {
    for (const route of CHANNEL_API_ROUTES) {
      if (route.method === 'GET' || route.economyCommand === null) continue;
      expect(route.idempotencyRequired, key(route)).toBe(true);
    }
  });

  it('marks selected high-value App writes for integrity evaluation', () => {
    for (const [method, path] of [
      ['POST', '/app-api/v2/wallet/transfers'],
      ['POST', '/app-api/v2/bank/loans'],
      ['POST', '/app-api/v2/stocks/:id/orders'],
    ] as const) {
      const route = CHANNEL_API_ROUTES.find(
        (entry) => entry.channel === 'APP' && entry.method === method && entry.pathTemplate === path,
      );
      expect(route, `${method} ${path}`).toBeDefined();
      expect(route?.integrityPolicy).not.toBe('NONE');
    }
  });

  it('requires CSRF on every state-changing Site session/admin route', () => {
    for (const route of CHANNEL_API_ROUTES) {
      if (route.channel !== 'SITE' || route.method === 'GET' || route.authMode === 'PUBLIC') continue;
      expect(route.csrfRequired, key(route)).toBe(true);
    }
  });

  it('never classifies an admin route as public', () => {
    for (const route of CHANNEL_API_ROUTES.filter((entry) => entry.pathTemplate.includes('/admin/'))) {
      expect(route.authMode, key(route)).not.toBe('PUBLIC');
    }
  });

  it('matches concrete parameter paths without widening the channel prefix', () => {
    expect(matchChannelRoute('APP', 'POST', '/app-api/v2/bank/loans/loan-1/repayments')?.pathTemplate)
      .toBe('/app-api/v2/bank/loans/:id/repayments');
    expect(matchChannelRoute('SITE', 'POST', '/app-api/v2/bank/loans/loan-1/repayments')).toBeNull();
  });
});
