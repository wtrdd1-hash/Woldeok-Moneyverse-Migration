import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAnnouncementImageFilter } from './announcement-image-filter';

describe('public announcements image-only discovery', () => {
  it('accepts only the explicit image-only flag', () => {
    expect(parseAnnouncementImageFilter(undefined)).toEqual({ imageOnly: false, invalid: false });
    expect(parseAnnouncementImageFilter('1')).toEqual({ imageOnly: true, invalid: false });
    for (const value of ['0', 'true', '', ['1', '1']]) expect(parseAnnouncementImageFilter(value).invalid).toBe(true);
  });
  it('renders a labelled GET filter, bounded scope, noindex filtered metadata and explicit errors', () => {
    const page = readFileSync('src/app/announcements/page.tsx', 'utf8');
    expect(page).toContain('name="withImage"');
    expect(page).toContain('최근 공개 공지 20건');
    expect(page).toContain('role="search"');
    expect(page).toContain('robots: { index: !hasFilter');
    expect(page).toContain('imageFilter.invalid');
  });
});
