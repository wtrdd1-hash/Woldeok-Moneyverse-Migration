import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('frontend release candidate build', () => {
  it('uses the verified Webpack compiler for bundled Google fonts in the Docker image', () => {
    const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
    expect(dockerfile).toContain(
      'RUN pnpm --filter @moneyverse/contract build && pnpm --filter @moneyverse/frontend exec next build --webpack',
    );
  });
});
