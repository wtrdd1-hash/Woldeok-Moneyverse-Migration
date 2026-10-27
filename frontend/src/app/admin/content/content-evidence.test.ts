import { describe, expect, it } from 'vitest';
import { parseAdminAnnouncements, parseAdminPhotos, parsePendingPhotos } from './content-evidence';

const photo = {
  photo_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  storage_key: 'private/123.jpg',
  image_url: '/api/photos/123',
  alt_text: '제출 사진',
  uploaded_by: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  uploader_display_name: '회원',
  submitted_at: '2026-10-27T08:00:00.000Z',
};
const announcement = {
  announcementId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  title: '공지', body: '본문', contentState: 'published', isPinned: false,
  publishedAt: '2026-10-27T08:00:00.000Z',
  createdAt: '2026-10-27T07:00:00.000Z', updatedAt: '2026-10-27T08:00:00.000Z',
};

describe('authenticated admin content evidence', () => {
  it('preserves genuine empty arrays rather than treating them as an outage', () => {
    expect(parsePendingPhotos([])).toEqual([]);
    expect(parseAdminPhotos([])).toEqual([]);
    expect(parseAdminAnnouncements([])).toEqual([]);
  });
  it('accepts actual backend list contracts and both announcement response shapes', () => {
    expect(parsePendingPhotos([photo])).toEqual([photo]);
    expect(parseAdminPhotos([{ ...photo, content_state: 'draft', published_at: null }])).toHaveLength(1);
    expect(parseAdminAnnouncements([announcement])).toEqual([announcement]);
    expect(parseAdminAnnouncements({ announcements: [announcement] })).toEqual([announcement]);
  });
  it('accepts PostgreSQL timestamptz text returned by the existing photo read functions', () => {
    const dbPhoto = { ...photo, submitted_at: '2026-10-27 08:00:00.000+00' };
    expect(parsePendingPhotos([dbPhoto])).toEqual([dbPhoto]);
    expect(parseAdminPhotos([{ ...dbPhoto, content_state: 'published', published_at: '2026-10-27 08:30:00+00' }])).toHaveLength(1);
  });
  it('rejects null, non-arrays, partial objects and malformed IDs rather than inventing empty lists', () => {
    expect(parsePendingPhotos(null)).toBeNull();
    expect(parsePendingPhotos({ photos: [] })).toBeNull();
    expect(parsePendingPhotos([{ ...photo, photo_id: 'not-a-uuid' }])).toBeNull();
    expect(parseAdminPhotos([{ ...photo, content_state: 'published' }])).toBeNull();
    expect(parseAdminAnnouncements({ announcements: null })).toBeNull();
    expect(parseAdminAnnouncements([{ ...announcement, isPinned: 'yes' }])).toBeNull();
  });
  it('rejects duplicate IDs, malformed timestamps and impossible publication states', () => {
    expect(parsePendingPhotos([photo, photo])).toBeNull();
    expect(parseAdminPhotos([{ ...photo, content_state: 'invalid', published_at: null }])).toBeNull();
    expect(parseAdminPhotos([{ ...photo, content_state: 'published', published_at: 'yesterday' }])).toBeNull();
    expect(parseAdminAnnouncements([{ ...announcement, updatedAt: 'not-a-date' }])).toBeNull();
    expect(parseAdminAnnouncements([announcement, announcement])).toBeNull();
  });
  it('rejects prototype-like values and unsafe non-string photo URLs', () => {
    expect(parsePendingPhotos([null])).toBeNull();
    expect(parsePendingPhotos([{ ...photo, image_url: 'javascript:alert(1)' }])).toBeNull();
    expect(parseAdminAnnouncements([{}])).toBeNull();
  });
});
