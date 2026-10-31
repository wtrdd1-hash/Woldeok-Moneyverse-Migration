import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { ProfilePrivateResponseMiddleware } from './profile.module';

describe('ProfilePrivateResponseMiddleware', () => {
  it('overrides a public cache policy before the next handler runs', () => {
    const headers = new Map<string, string>([['Cache-Control', 'public, max-age=86400']]);
    const response = {
      setHeader: vi.fn((name: string, value: string) => { headers.set(name, value); }),
    } as unknown as Response;
    const next = vi.fn(() => {
      expect(headers.get('Cache-Control')).toBe('private, no-store');
      expect(headers.get('X-Robots-Tag')).toBe('noindex');
      expect(headers.get('Referrer-Policy')).toBe('no-referrer');
    });
    new ProfilePrivateResponseMiddleware().use({} as Request, response, next as NextFunction);
    expect(next).toHaveBeenCalledOnce();
  });
});
