import { describe, expect, it } from 'vitest';
import { parseControlsOverview } from './controls-evidence';

const empty = { featureSwitches: [], policies: [], roles: [] };
const role = { user_id: '00000000-0000-4000-8000-000000000001', display_name: 'Operator', role: 'operator', granted_at: '2026-11-03T00:00:00Z' };

describe('admin role visibility evidence', () => {
  it('accepts an authorized verified-empty result', () => {
    expect(parseControlsOverview({ ...empty, rolesEvidence: 'VERIFIED' })).toMatchObject({ roles: [], rolesEvidence: 'VERIFIED' });
  });
  it.each(['RESTRICTED', 'UNAVAILABLE'])('does not turn %s into a verified-empty list', (status) => {
    expect(parseControlsOverview({ ...empty, rolesEvidence: status })?.rolesEvidence).toBe(status);
    expect(parseControlsOverview({ ...empty, rolesEvidence: status, roles: [role] })).toBeNull();
  });
  it('rejects absent, invented or contradictory visibility claims', () => {
    expect(parseControlsOverview(empty)).toBeNull();
    expect(parseControlsOverview({ ...empty, rolesEvidence: 'VERIFIED', roles: [role] })?.roles).toEqual([role]);
    expect(parseControlsOverview({ ...empty, rolesEvidence: 'ALL_ACCESS' })).toBeNull();
  });
});
