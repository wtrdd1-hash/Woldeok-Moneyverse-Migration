import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const view = readFileSync(new URL('./enterprise-control-tower.tsx', import.meta.url), 'utf8');
const nextRoute = readFileSync(
  new URL('../../api/admin/enterprises/status/route.ts', import.meta.url),
  'utf8',
);

describe('enterprise admin fail-closed page', () => {
  it('never passes missing portfolio responses as genuine empty arrays', () => {
    expect(page).toContain('parseEnterpriseEvidence');
    expect(page).not.toContain('soes ?? []');
    expect(page).not.toContain('privateEnterprises ?? []');
    expect(page).not.toContain('dividendLogs ?? []');
  });
  it('submits status only through the audited gateway without optimistic toggles', () => {
    expect(view).not.toContain('handleToggleStatus');
    expect(view).toContain("fetch('/api/admin/enterprises/status'");
    expect(view).toContain('공기업 운영 상태는 승인 관리자만 변경');
    expect(nextRoute).toContain('SOE_STATUS_RECEIPT_UNVERIFIED');
    expect(nextRoute).toContain("method: 'PUT'");
  });
});
