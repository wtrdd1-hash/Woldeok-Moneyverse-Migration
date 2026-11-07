import { describe, expect, it } from 'vitest';
import { CraftingController } from './crafting.controller';
import { CraftingModule } from './crafting.module';

describe('crafting HTTP privacy before authentication and CSRF guards', () => {
  it('applies no-store/noindex/no-referrer on recipe discovery and settlement failures', () => {
    let middleware: ((req: unknown, res: { setHeader: (key: string, value: string) => void }, next: () => void) => void) | undefined;
    let route: unknown;
    const consumer = { apply: (handler: typeof middleware) => {
      middleware = handler;
      return { forRoutes: (controller: unknown) => { route = controller; } };
    } };
    const craftingModule = new CraftingModule() as CraftingModule & { configure?: (consumer: unknown) => void };
    expect(craftingModule.configure).toBeTypeOf('function');
    craftingModule.configure!(consumer);
    expect(route).toBe(CraftingController);
    expect(middleware).toBeTypeOf('function');
    for (const path of ['/crafting/recipes', '/crafting/execute']) {
      const headers = new Map<string, string>();
      let nextCalled = false;
      middleware!({ url: path }, { setHeader: (key, value) => headers.set(key.toLowerCase(), value) }, () => { nextCalled = true; });
      expect(nextCalled).toBe(true);
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('x-robots-tag')).toBe('noindex');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
