import { describe, expect, it } from 'vitest';
import { parseClubJoinMode, verifiedClubJoinModeResult } from './club-join-mode';

describe('club directory filter contract', () => {
  it('accepts only canonical join modes and defaults to all', () => {
    expect(parseClubJoinMode(undefined)).toBe('all');
    expect(parseClubJoinMode('public')).toBe('public');
    expect(parseClubJoinMode('invite')).toBe('invite');
    expect(parseClubJoinMode('request')).toBe('request');
    for (const value of ['', 'PUBLIC', 'unknown', ['public', 'invite'], {}]) expect(parseClubJoinMode(value)).toBeNull();
  });
  it('rejects fabricated successful Android rows', () => {
    expect(verifiedClubJoinModeResult({ clubs: [{ id: '11111111-2222-4333-8444-555555555555', join_mode: 'public', name: 'Test Club', tag: 'TEST', owner_name: 'Owner', description: '', status: 'active', is_my_club: false, member_count: 1, level: 1, experience: '0' }] }, 'invite')).toBe(false);
    expect(verifiedClubJoinModeResult({ clubs: [{ id: '11111111-2222-4333-8444-555555555555', join_mode: 'invite', name: 'Test Club', tag: 'TEST', owner_name: 'Owner', description: '', status: 'active', is_my_club: false, member_count: 1, level: 1, experience: '0' }] }, 'invite')).toBe(true);
    expect(verifiedClubJoinModeResult({ clubs: [] }, 'public')).toBe(true);
    expect(verifiedClubJoinModeResult({ clubs: 'not-array' }, 'public')).toBe(false);
    expect(verifiedClubJoinModeResult({ clubs: Array.from({ length: 101 }, () => ({ id: '11111111-2222-4333-8444-555555555555', join_mode: 'public', name: 'Test Club', tag: 'TEST', owner_name: 'Owner', description: '', status: 'active', is_my_club: false, member_count: 1, level: 1, experience: '0' })) }, 'public')).toBe(false);
  });
});
