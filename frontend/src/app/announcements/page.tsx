import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/seo';
import { AnnouncementsView } from './announcements-view';

export const revalidate = 60;
export const metadata: Metadata = {
  title: '운영 소식',
  description: '월덕 머니버스의 공개된 운영 공지',
  alternates: { canonical: canonicalUrl('/announcements') },
};

export default function AnnouncementsPage() {
  return <AnnouncementsView />;
}
