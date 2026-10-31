// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnnouncementTitleSearch } from './announcement-title-search';
const notices = [
  { announcementId: '11111111-1111-4111-8111-111111111111', title: '공지 안내', body: '첫 공지', isPinned: true, publishedAt: '2026-10-31T00:00:00.000Z', imageUrl: null, imageAltText: null },
  { announcementId: '22222222-2222-4222-8222-222222222222', title: 'Service Notice', body: 'Second', isPinned: false, publishedAt: '2026-10-30T00:00:00.000Z', imageUrl: null, imageAltText: null },
];
describe('published announcement title search', () => {
  it('has a labelled input and only filters titles within the last 50', () => {
    render(<AnnouncementTitleSearch announcements={notices} />);
    const input = screen.getByRole('searchbox', { name: '공지 제목 검색' });
    expect(screen.getByText(/최근 공개 공지 최대 50개/)).toBeTruthy();
    fireEvent.change(input, { target: { value: 'notice' } });
    expect(screen.queryByText('공지 안내')).toBeNull();
    expect(screen.getByText('Service Notice')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/1개/);
    fireEvent.change(input, { target: { value: '없는 공지' } });
    expect(screen.getByText(/일치하는 공지가 없습니다/)).toBeTruthy();
  });
});
