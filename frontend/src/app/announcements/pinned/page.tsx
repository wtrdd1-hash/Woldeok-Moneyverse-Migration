import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/seo';
import { AnnouncementsView } from '../announcements-view';

export const revalidate = 60;
export const metadata: Metadata = {
  title: '고정 공지 | 운영 소식',
  description: '최근 공개된 운영 소식 중 고정된 공지',
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl('/announcements') },
};

export default function PinnedAnnouncementsPage() {
  return <AnnouncementsView pinnedOnly />;
}
