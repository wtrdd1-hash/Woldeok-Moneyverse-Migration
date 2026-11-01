import { describe, expect, it } from 'vitest';
import { parseOwnProfile, parseOwnSettings, parseOwnTitles, canEditOwnProfile } from './profile-source-proof';

const profile = {
  profile: { display_name: 'Member', image_url: null, joined_at: '2026-10-01T00:00:00.000Z',
    job_type: 'farmer', job_level: 2, work_completions: '9007199254740993',
    visibility: 'private', featured_title: 'helper' },
};
const settings = {
  settings: { visibility: 'private', display_name: 'Member', image_url: null,
    field_visibility: { imageUrl: 'private', workCompletions: 'private' }, featured_title: 'helper' },
};
const titles = { titles: [{ code: 'helper', name: 'Helper', awardedAt: '2026-10-01T00:00:00.000Z' }] };

describe('owner profile runtime proof', () => {
  it('preserves exact bigint text and private field choices from authenticated APIs', () => {
    expect(parseOwnProfile(profile)?.work_completions).toBe('9007199254740993');
    expect(parseOwnSettings(settings)?.field_visibility).toEqual({ imageUrl: 'private', workCompletions: 'private' });
    expect(parseOwnTitles(titles)).toEqual(titles.titles);
    expect(canEditOwnProfile(parseOwnProfile(profile), parseOwnSettings(settings), parseOwnTitles(titles))).toBe(true);
  });

  it.each([null, {}, { profile: [] }, { profile: { ...profile.profile, work_completions: 100 } },
    { profile: { ...profile.profile, work_completions: '1e6' } },
    { profile: { ...profile.profile, job_level: '2' } },
    { profile: { ...profile.profile, joined_at: 'yesterday' } },
    { profile: { ...profile.profile, visibility: 'anyone' } },
    { profile: { ...profile.profile, image_url: 'javascript:alert(1)' } },
    { profile: { ...profile.profile, featured_title: 1 } },
  ])('rejects malformed owner profile %j', (input) => {
    expect(parseOwnProfile(input)).toBeNull();
  });

  it.each([null, {}, { settings: [] },
    { settings: { ...settings.settings, field_visibility: null } },
    { settings: { ...settings.settings, field_visibility: [] } },
    { settings: { ...settings.settings, field_visibility: { imageUrl: 'inherit' } } },
    { settings: { ...settings.settings, field_visibility: { imageUrl: 'public', unknown: 'private' } } },
    { settings: { ...settings.settings, field_visibility: { imageUrl: null } } },
    { settings: { ...settings.settings, visibility: 'friends' } },
    { settings: { ...settings.settings, display_name: 12 } },
  ])('rejects malformed replacement settings %j', (input) => {
    expect(parseOwnSettings(input)).toBeNull();
  });

  it.each([null, {}, { titles: null }, { titles: [{}] },
    { titles: [{ ...titles.titles[0], code: 'BAD' }] },
    { titles: [{ ...titles.titles[0], awardedAt: 'invalid' }] },
    { titles: [titles.titles[0], titles.titles[0]] },
    { titles: Array.from({ length: 201 }, (_, i) => ({ ...titles.titles[0], code: `title_${i}` })) },
  ])('rejects malformed title grants %j', (input) => {
    expect(parseOwnTitles(input)).toBeNull();
  });

  it('rejects contradictory profile/settings visibility and missing evidence before replacement writes', () => {
    const view = parseOwnProfile(profile);
    const stored = parseOwnSettings(settings);
    const awarded = parseOwnTitles(titles);
    expect(canEditOwnProfile(view, { ...stored!, visibility: 'public' }, awarded)).toBe(false);
    expect(canEditOwnProfile(view, stored, null)).toBe(false);
    expect(canEditOwnProfile(null, stored, awarded)).toBe(false);
  });
});
