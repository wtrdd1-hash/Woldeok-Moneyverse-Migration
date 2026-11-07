import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { PinnedNoticeList, pinnedNotices } from './pinned-notices';

const notices = [
  {
    announcementId: 'a',
    title: 'Pinned',
    body: 'Body',
    imageUrl: null,
    imageAltText: null,
    isPinned: true,
    publishedAt: null,
  },
  {
    announcementId: 'b',
    title: 'Normal',
    body: 'Body',
    imageUrl: null,
    imageAltText: null,
    isPinned: false,
    publishedAt: null,
  },
];

describe('public pinned announcement UI', () => {
  it('provides an accessible pinned-only toggle while defaulting to all published notices', () => {
    const html = renderToStaticMarkup(<PinnedNoticeList announcements={notices} />);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('고정 공지만');
    expect(html).toContain('/announcements/a');
    expect(html).toContain('/announcements/b');
  });
  it('shows only pinned entries and never changes source order', () => {
    expect(pinnedNotices(notices, true).map((notice) => notice.announcementId)).toEqual(['a']);
    expect(pinnedNotices(notices, false)).toEqual(notices);
    expect(pinnedNotices([], true)).toEqual([]);
  });
  it('switches the visible cards without hiding the unfiltered public HTML on first load', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    try {
      await act(async () => {
        root.render(<PinnedNoticeList announcements={notices} />);
      });
      expect(host.querySelectorAll('a[href^="/announcements/"]')).toHaveLength(2);
      const buttons = host.querySelectorAll<HTMLButtonElement>('nav button');
      await act(async () => {
        buttons[1]!.click();
      });
      expect(host.querySelectorAll('a[href^="/announcements/"]')).toHaveLength(1);
      expect(host.querySelector('a[href="/announcements/a"]')).not.toBeNull();
      expect(buttons[1]!.getAttribute('aria-pressed')).toBe('true');
      await act(async () => {
        buttons[0]!.click();
      });
      expect(host.querySelectorAll('a[href^="/announcements/"]')).toHaveLength(2);
    } finally {
      await act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });
});
