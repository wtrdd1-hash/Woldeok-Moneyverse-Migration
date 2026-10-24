// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
const page = readFileSync('src/app/advisor/page.tsx', 'utf8');
const client = readFileSync('src/app/advisor/advisor-client.tsx', 'utf8');
const diagnosis = readFileSync('src/app/api/advisor/deoki/diagnose/route.ts', 'utf8');
const consultation = readFileSync('src/app/api/advisor/deoki/ask/route.ts', 'utf8');
describe('Advisor source truth', () => {
  it('requires a member and prevents indexing', () => {
    expect(page).toContain('await requireMember()');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
  it('shows only the backend diagnosis and never invented portfolio figures', () => {
    expect(client).toContain('body.diagnosis');
    expect(client).toContain('diagnosis.assetSummary');
    expect(client).not.toContain('12450000');
    expect(client).not.toContain('시장가 자동 리밸런싱 주문 체결');
  });
  it('preserves a11y and no-store API failure semantics', () => {
    expect(client).toContain('aria-live="polite"');
    expect(client).toContain('min-h-11');
    expect(diagnosis).toContain('private, no-store');
    expect(consultation).toContain('status: 503');
  });
});
