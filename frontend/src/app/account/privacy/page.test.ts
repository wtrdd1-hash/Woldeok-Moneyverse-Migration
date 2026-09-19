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
    expect(page).toContain('<PrivacyRequestForm />');
    expect(page).toContain('privacyData.requests.map');
  });

  it('exposes the privacy center from account settings and refreshes it after writes', () => {
    expect(account).toContain('href="/account/privacy"');
    expect(actions).toContain("revalidatePath('/account/privacy');");
  });
});
