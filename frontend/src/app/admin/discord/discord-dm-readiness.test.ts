import { describe, expect, it } from 'vitest';
import { getAdminDmReadiness } from './discord-dm-readiness';

describe('administrator Discord DM UI readiness', () => {
  it('does not fabricate a recipient or readiness when API evidence is missing', () => {
    expect(getAdminDmReadiness(undefined)).toEqual({ configured: false, adminUserId: null });
    expect(getAdminDmReadiness({ configured: true })).toEqual({ configured: false, adminUserId: null });
    expect(getAdminDmReadiness({ configured: false, adminUserId: '123456789012345678' })).toEqual({ configured: false, adminUserId: null });
  });

  it('rejects malformed or mismatched response data', () => {
    expect(getAdminDmReadiness({ configured: true, adminUserId: 'invalid' })).toEqual({ configured: false, adminUserId: null });
    expect(getAdminDmReadiness({ configured: 'true', adminUserId: '123456789012345678' })).toEqual({ configured: false, adminUserId: null });
  });

  it('accepts a strictly configured Discord snowflake without claiming a delivered message', () => {
    expect(getAdminDmReadiness({ configured: true, adminUserId: '123456789012345678' })).toEqual({ configured: true, adminUserId: '123456789012345678' });
  });
});
