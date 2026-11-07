import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('./profile-forms', () => ({
  ProfileImageForm: () => <button>Upload profile image</button>,
  ProfileSettingsForm: () => <button>Save profile visibility</button>,
}));

import Page, { metadata } from './page';

const profile = { profile: { display_name: 'Verified owner', image_url: null,
  joined_at: '2026-10-01T00:00:00.000Z', job_type: null, job_level: null,
  work_completions: '0', visibility: 'private', featured_title: null } };
const settings = { settings: { visibility: 'private', display_name: 'Verified owner', image_url: null,
  field_visibility: { imageUrl: 'private' }, featured_title: null } };
const titles = { titles: [] };

async function html(own: unknown = profile, stored: unknown = settings, awarded: unknown = titles): Promise<string> {
  read.mockResolvedValueOnce(own).mockResolvedValueOnce(stored).mockResolvedValueOnce(awarded);
  return renderToStaticMarkup(await Page());
}

beforeEach(() => { vi.clearAllMocks(); });

describe('profile owner source integrity', () => {
  it('renders a valid owner profile and private replacement form from three authenticated reads', async () => {
    const page = await html();
    expect(gate).toHaveBeenCalledOnce();
    expect(read).toHaveBeenCalledWith('/api/v1/profile');
    expect(read).toHaveBeenCalledWith('/api/v1/profile/settings');
    expect(read).toHaveBeenCalledWith('/api/v1/profile/titles');
    expect(page).toContain('Verified owner');
    expect(page).toContain('Save profile visibility');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('blocks replacement writes when field visibility evidence is malformed', async () => {
    const page = await html(profile, { settings: { ...settings.settings, field_visibility: null } });
    expect(page).toContain('지금은 설정 양식을 열 수 없어요.');
    expect(page).not.toContain('Save profile visibility');
    expect(page).toContain('action="/profile"');
    expect(page).toContain('다시 확인');
  });

  it('does not show malformed work-count evidence as a member profile', async () => {
    const page = await html({ profile: { ...profile.profile, work_completions: 'not-a-number' } });
    expect(page).toContain('프로필을 불러오지 못했어요.');
    expect(page).not.toContain('Save profile visibility');
  });

  it('refuses contradictory privacy visibility and malformed title grants', async () => {
    const conflict = await html(profile, { settings: { ...settings.settings, visibility: 'public' } });
    expect(conflict).not.toContain('Save profile visibility');
    const forged = await html(profile, settings, { titles: [{ code: 'INVALID', name: 'Forged', awardedAt: 'today' }] });
    expect(forged).not.toContain('Save profile visibility');
  });
});
