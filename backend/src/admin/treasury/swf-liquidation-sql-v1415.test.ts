import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('v1415 SWF audit SQL parameter typing regression', () => {
  it('uses one consistent explicit type for each audit parameter', () => {
    const source = readFileSync(new URL('./auto-swf.service.ts', import.meta.url), 'utf8');
    const query = source.slice(source.indexOf("'PORTFOLIO_LIQUIDATED_TO_VAULT', $1"));
    expect(query).toContain("'PORTFOLIO_LIQUIDATED_TO_VAULT', $1::numeric");
    expect(query).toContain("|| $1::text ||");
    expect(query).toContain("|| $2::text ||");
    expect(query).toContain("|| $3::text ||");
    expect(query).toContain('$4::jsonb');
  });
});
