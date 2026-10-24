import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('login mobile touch targets', () => {
  const view = readFileSync(join(__dirname, 'login-providers-view.tsx'), 'utf8');

  it('keeps local credential inputs and actions at least 44px tall', () => {
    expect(view.match(/className="min-h-11"/g)?.length).toBeGreaterThanOrEqual(2);
    const classLists = [...view.matchAll(/className="([^"]+)"/g)].map((match) =>
      match[1].split(/\s+/),
    );
    expect(
      classLists.some((classes) =>
        ['min-h-11', 'w-full', 'sm:w-fit'].every((token) => classes.includes(token)),
      ),
    ).toBe(true);
  });
});
