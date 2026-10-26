import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const mocks = vi.hoisted(() => ({ gate: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.gate }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.api }));
vi.mock('./content-forms', () => ({
  AnnouncementEditor: () => null, PhotoEditor: () => null, PublicationEditor: () => null,
  PhotoReviewQueue: ({ items }: { items: unknown[] }) => <div data-testid="pending">{items.length}건 대기</div>,
  AnnouncementManagementTable: ({ items }: { items: unknown[] }) => <div data-testid="announcements">{items.length}건 공지</div>,
  PhotoManagementGrid: ({ items }: { items: unknown[] }) => <div data-testid="photos">{items.length}건 사진</div>,
}));
import Page from './page';

const photo = {
  photo_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', storage_key: 'private/123.jpg',
  image_url: '/api/photos/123', alt_text: '사진',
  uploaded_by: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  uploader_display_name: '회원', submitted_at: '2026-10-27T08:00:00.000Z',
};
const announcement = {
  announcementId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', title: '공지', body: '내용',
  contentState: 'draft', isPinned: false, publishedAt: null,
  createdAt: '2026-10-27T08:00:00.000Z', updatedAt: '2026-10-27T08:00:00.000Z',
};
const load = async (responses: unknown[]) => {
  mocks.api.mockImplementation((path: string) => {
    const index = ['/api/v1/admin/photos/submissions', '/api/v1/admin/announcements', '/api/v1/admin/photos'].indexOf(path);
    return Promise.resolve(responses[index]);
  });
  return renderToStaticMarkup(await Page());
};

beforeEach(() => { mocks.api.mockReset(); mocks.gate.mockReset(); });
describe('admin content moderation fail-closed evidence', () => {
  it('requires an elevated admin console and shows explicit per-section unavailable states', async () => {
    const html = await load([null, null, null]);
    expect(mocks.gate).toHaveBeenCalledWith('/admin/content');
    expect(html).toContain('사진 검토 대기열을 확인할 수 없습니다');
    expect(html).toContain('공지사항 목록을 확인할 수 없습니다');
    expect(html).toContain('사진 목록을 확인할 수 없습니다');
    expect(html).not.toContain('0건 대기');
    expect(html).not.toContain('0건 공지');
    expect(html).not.toContain('0건 사진');
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/admin/content"');
    expect(html).toContain('min-h-11');
  });
  it('keeps valid unaffected sections usable when one backend read fails', async () => {
    const html = await load([[photo], null, [{ ...photo, content_state: 'draft', published_at: null }]]);
    expect(html).toContain('1건 대기');
    expect(html).toContain('1건 사진');
    expect(html).toContain('공지사항 목록을 확인할 수 없습니다');
    expect(html).not.toContain('0건 공지');
  });
  it('distinguishes a genuine empty response from an outage', async () => {
    const html = await load([[], [], []]);
    expect(html).toContain('0건 대기');
    expect(html).toContain('0건 공지');
    expect(html).toContain('0건 사진');
    expect(html).not.toContain('확인할 수 없습니다');
  });
  it('rejects HTTP-200 malformed evidence and suppresses unverified moderation actions', async () => {
    const html = await load([[{ ...photo, photo_id: 'bad' }], [announcement], []]);
    expect(html).toContain('사진 검토 대기열을 확인할 수 없습니다');
    expect(html).toContain('1건 공지');
    expect(html).not.toContain('1건 대기');
  });
});
