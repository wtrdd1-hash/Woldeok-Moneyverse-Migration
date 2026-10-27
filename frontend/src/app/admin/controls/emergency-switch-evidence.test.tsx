import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmergencyKillSwitchCard } from './emergency-kill-switch-card';
import { parseControlsOverview, parsePublishedPolicy } from './controls-evidence';

const overview = {
  featureSwitches: [
    {
      feature_key: 'casino', state: 'paused', title: '카지노',
      activation_preconditions: [], reason: '점검 중', updated_by: null,
      updated_at: '2026-10-27T03:00:00.000Z',
    },
  ],
  policies: [],
  roles: [],
};

describe('verified emergency operator controls', () => {
  it('rejects malformed or contradictory backend control evidence', () => {
    expect(parseControlsOverview(null)).toBeNull();
    expect(parseControlsOverview({ ...overview, featureSwitches: null })).toBeNull();
    expect(parseControlsOverview({ ...overview, featureSwitches: [{ ...overview.featureSwitches[0], state: 'frozen' }] })).toBeNull();
    expect(parseControlsOverview({ ...overview, featureSwitches: [...overview.featureSwitches, ...overview.featureSwitches] })).toBeNull();
    expect(parseControlsOverview({ ...overview, policies: null })).toBeNull();
  });

  it('rejects malformed policies, role assignments and duplicate active policies', () => {
    const policy = { policy_id: 'policy-1', version: 'v1', status: 'active', effective_at: '2026-10-27T00:00:00Z', activated_at: null, superseded_at: null, superseded_by: null, reason: '', created_by: null, created_at: '2026-10-27T00:00:00Z', payload: {} };
    expect(parseControlsOverview({ ...overview, policies: [{ ...policy, status: 'not-real' }] })).toBeNull();
    expect(parseControlsOverview({ ...overview, policies: [policy, { ...policy, policy_id: 'policy-2' }] })).toBeNull();
    expect(parseControlsOverview({ ...overview, roles: [{ user_id: 'a', role: 'superadmin', display_name: 'Admin', granted_at: 'not-a-date' }] })).toBeNull();
  });

  it('does not invent a published policy version', () => {
    expect(parsePublishedPolicy(null)).toBeNull();
    expect(parsePublishedPolicy({ termsVersion: '', privacyVersion: 'v1' })).toBeNull();
    expect(parsePublishedPolicy({ termsVersion: 'v2', privacyVersion: 'v3' })).toEqual({ termsVersion: 'v2', privacyVersion: 'v3' });
  });

  it('guards privileged controls and never assumes superadmin from page code', () => {
    const page = readFileSync(resolve(process.cwd(), 'src/app/admin/controls/page.tsx'), 'utf8');
    expect(page).toContain('parseControlsOverview(rawOverview)');
    expect(page).toContain("admin.roles.includes('superadmin')");
    expect(page).toContain('isSuperadmin && overview !== null');
    expect(page).not.toContain('isSuperadmin={true}');
    expect(page).not.toContain("?? '2026-09-02'");
  });

  it('accepts valid real API feature switches without inventing emergency statuses', () => {
    expect(parseControlsOverview(overview)?.featureSwitches[0]?.state).toBe('paused');
    render(<EmergencyKillSwitchCard featureSwitches={parseControlsOverview(overview)?.featureSwitches ?? null} />);
    expect(screen.getByText('카지노')).toBeTruthy();
    expect(screen.getByText('일시 중지')).toBeTruthy();
    expect(screen.getByRole('link', { name: /실제 기능 스위치로 이동/ }).getAttribute('href')).toBe('#feature-switches');
    expect(screen.queryByText(/OPERATIONAL|FROZEN|긴급 동결 실행|실시간 비상 관제 감사 증적/)).toBeNull();
  });

  it('fails closed when evidence is unavailable and never offers a fake freeze button', () => {
    render(<EmergencyKillSwitchCard featureSwitches={null} />);
    expect(screen.getByRole('alert').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.queryByRole('button', { name: /동결|복구/ })).toBeNull();
  });
});
