import { describe, expect, it } from 'vitest';
import { ROUTE_MAP, originalRoutes, replacementFor } from './route-map';

const MODULES = new Set([
  'auth',
  'wallet',
  'stock',
  'business',
  'season',
  'shop',
  'board',
  'content',
  'account',
  'privacy',
  'admin',
  'minecraft',
  'discord',
  'health',
  'frontend',
]);

describe('ROUTE_MAP', () => {
  it('covers every application route of the original', () => {
    expect(originalRoutes()).toHaveLength(82);
  });

  it('has no duplicate original routes', () => {
    const seen = originalRoutes();
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('maps no two originals onto the same replacement', () => {
    const replacements = ROUTE_MAP.map((mapping) => mapping.replacement).filter(
      (replacement): replacement is string => replacement !== null,
    );
    expect(new Set(replacements).size).toBe(replacements.length);
  });

  // A route may be dropped, but never silently.
  it('states a reason for every route that has no replacement', () => {
    for (const mapping of ROUTE_MAP.filter((entry) => entry.replacement === null)) {
      expect(mapping.reason, `${mapping.original} was dropped without a reason`).toBeTruthy();
    }
  });

  it('assigns every route to a known module', () => {
    for (const mapping of ROUTE_MAP) {
      expect(MODULES.has(mapping.module), `${mapping.original} has module ${mapping.module}`).toBe(
        true,
      );
    }
  });

  it('writes every original as "METHOD /path"', () => {
    for (const mapping of ROUTE_MAP) {
      expect(mapping.original).toMatch(/^(GET|POST|PUT|PATCH|DELETE) \//);
    }
  });

  it('writes every replacement as "METHOD /path"', () => {
    for (const mapping of ROUTE_MAP) {
      if (mapping.replacement === null) continue;
      expect(mapping.replacement).toMatch(/^(GET|POST|PUT|PATCH|DELETE) \//);
    }
  });

  // The snapshot recorded path parameters as a literal placeholder UUID. The
  // replacement column uses {id}, so a stray UUID means a row was copied
  // without being rewritten.
  it('uses {id} rather than a placeholder UUID in replacements', () => {
    for (const mapping of ROUTE_MAP) {
      expect(mapping.replacement ?? '').not.toContain('00000000-0000-4000-8000-000000000000');
    }
  });

  it('keeps every API replacement under the versioned prefix', () => {
    for (const mapping of ROUTE_MAP) {
      if (mapping.module === 'frontend' || mapping.module === 'health') continue;
      if (mapping.replacement === null) continue;
      const [, path] = mapping.replacement.split(' ');
      expect(path?.startsWith('/api/v1/') || path?.startsWith('/auth/'), mapping.replacement).toBe(
        true,
      );
    }
  });

  it('resolves a known route', () => {
    expect(replacementFor('POST /api/v1/wallet/transfers')).toBe('POST /api/v1/wallet/transfers');
  });

  it('returns null for a route that is not in the map', () => {
    expect(replacementFor('GET /nope')).toBeNull();
  });
});
