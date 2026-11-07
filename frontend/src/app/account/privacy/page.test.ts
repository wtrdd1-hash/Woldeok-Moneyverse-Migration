import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(join(process.cwd(), 'src/app/account/privacy/page.tsx'), 'utf8');
const account = readFileSync(join(process.cwd(), 'src/app/account/page.tsx'), 'utf8');
const actions = readFileSync(join(process.cwd(), 'src/app/account/actions.ts'), 'utf8');

describe('account privacy center', () => {
  it('keeps the center member-only and non-indexable', () => {
    expect(page).toContain('await requireMember();');
    expect(page).toContain("robots: { index: false, follow: false }");
  });

  it('binds request history and the existing authoritative request form', () => {
    expect(page).toContain("apiOrNull<{ requests: PrivacyRequest[] }>('/api/v1/privacy/requests')");
    expect(page).toContain("export const fetchCache = 'force-no-store'");
    expect(page).toContain('<PrivacyRequestForm />');
    expect(page).toContain('parsePrivacyRequestHistory(privacyData, selectedType)');
    expect(page).toContain('privacyHistory.map');
  });

  it('exposes the privacy center from account settings and refreshes it after writes', () => {
    expect(account).toContain('href="/account/privacy"');
    expect(actions).toContain("revalidatePath('/account/privacy');");
  });
});

describe('privacy request type filter', () => {
  it('uses allowlisted request types and never interpolates an arbitrary query into the backend URL', () => {
    expect(page).toContain('searchParams');
    expect(page).toContain('REQUEST_TYPE_NAME');
    expect(page).toContain('Object.hasOwn(REQUEST_TYPE_NAME');
    expect(page).toContain('`/api/v1/privacy/requests?type=${selectedType}`');
  });

  it('provides keyboard-accessible recent-history filter links and a bounded result explanation', () => {
    expect(page).toContain('aria-label="개인정보 요청 종류 필터"');
    expect(page).toContain('aria-current={selectedType === value ?');
    expect(page).toContain('최근 100건');
    expect(page).toContain('href="/account/privacy"');
  });
});
