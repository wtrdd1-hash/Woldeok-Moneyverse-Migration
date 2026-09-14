import { describe, expect, it } from 'vitest';
import { ownProfileContract } from './profile.controller';
import type { ProfileViewRow } from './profile.repository';

const profile = (overrides: Partial<ProfileViewRow> = {}): ProfileViewRow => ({
  display_name: '월덕',
  image_url: null,
  joined_at: new Date('2026-09-14T03:00:00.000Z'),
  job_type: null,
  job_level: null,
  work_completions: '0',
  visibility: 'members',
  featured_title: null,
  ...overrides,
});

describe('ownProfileContract', () => {
  it('keeps the legacy database-shaped fields and adds the app camelCase contract', () => {
    const response = ownProfileContract(profile(), 'member@example.test');
    expect(response.displayName).toBe('월덕');
    expect(response.joinedAt).toBe('2026-09-14T03:00:00.000Z');
    expect(response.jobLevel).toBe(0);
    expect(response.workCompletions).toBe('0');
    expect(response.email).toBe('member@example.test');
    expect(response.profile.display_name).toBe('월덕');
    expect(response.profile.displayName).toBe('월덕');
    expect(response.profile.joinedAt).toBe('2026-09-14T03:00:00.000Z');
  });

  it('preserves meaningful nullable fields instead of inventing identity data', () => {
    const response = ownProfileContract(profile({ featured_title: null }), null);
    expect(response.featuredTitle).toBeNull();
    expect(response.email).toBeNull();
    expect(response.jobLevel).toBe(0);
  });
});
