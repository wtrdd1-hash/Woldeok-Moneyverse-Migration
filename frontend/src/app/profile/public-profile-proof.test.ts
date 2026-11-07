import { describe, expect, it } from 'vitest';
import { parseMemberProfileResponse } from './public-profile-proof';

const profile = {
  display_name: 'Member', image_url: null, joined_at: '2026-11-01T12:00:00.000Z',
  job_type: 'farmer', job_level: 3, work_completions: '9007199254740993',
  visibility: 'members', featured_title: 'starter',
};

describe('public member profile provenance', () => {
  it('retains exact bigint and only approved fields', () => {
    expect(parseMemberProfileResponse({ profile: { ...profile, email: 'secret@example.com' }, accessToken: 'private' }))
      .toEqual({ profile });
  });
  it.each([
    null, {}, { profile: [] }, { profile: { ...profile, joined_at: 'tomorrow' } },
    { profile: { ...profile, work_completions: Number.MAX_SAFE_INTEGER + 2 } },
    { profile: { ...profile, work_completions: '-1' } },
    { profile: { ...profile, job_level: Infinity } },
    { profile: { ...profile, image_url: 'javascript:alert(1)' } },
    { profile: { ...profile, visibility: 'everyone' } },
    { profile: { ...profile, display_name: { toString: () => 'Member' } } },
    { profile: { ...profile, featured_title: 'evil <script>' } },
    { profile: { ...profile, job_type: 'x'.repeat(100) } },
  ])('refuses malformed source %j', (payload) => {
    expect(parseMemberProfileResponse(payload)).toBeNull();
  });
});
