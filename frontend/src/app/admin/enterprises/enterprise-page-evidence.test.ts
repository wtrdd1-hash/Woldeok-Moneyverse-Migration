import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const view = readFileSync(new URL('./enterprise-control-tower.tsx', import.meta.url), 'utf8');
const nextRoute = readFileSync(new URL('../../../api/admin/enterprises/status/route.ts', import.meta.url), 'utf8');

describe('enterprise admin fail-closed page', () => {
  it('never passes missing portfolio responses as genuine empty arrays', () => {
    expect(page).toContain('parseEnterpriseEvidence');
    expect(page).not.toContain('soes ?? []');
    expect(page).not.toContain('privateEnterprises ?? []');
    expect(page).not.toContain('dividendLogs ?? []');
  });
  it('does not expose optimistic status changes without a verified DB-owned receipt', () => {
    expect(view).not.toContain('handleToggleStatus');
    expect(view).not.toContain("fetch('/api/admin/enterprises/status'");
    expect(view).toContain('상태 변경은 검증 전까지 중지');
    expect(nextRoute).toContain('503');
    expect(nextRoute).not.toContain("method: 'PUT'");
  });
});
