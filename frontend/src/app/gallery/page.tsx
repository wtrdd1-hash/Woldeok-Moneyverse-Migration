import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '사진',
  description: '월덕 머니버스 커뮤니티 사진',
  alternates: { canonical: '/gallery' },
};

interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export default async function GalleryPage() {
  const data = await publicApi<{ photos: Photo[] }>('/api/v1/photos', 300);
  const photos = data?.photos ?? [];

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="COMMUNITY ARCHIVE"
        title={
          <>
            함께 만든
            <br />
            <Accent>우리 세계의 장면.</Accent>
          </>
        }
      >
        사진은 운영자가 검토한 뒤에만 공개합니다. 이미지 제공 주소도 운영 환경에서 사전에
        허용한 곳만 사용해요.
      </PageHeader>

      <section aria-labelledby="gallery-title" className="grid gap-3">
        <SectionHeader
          eyebrow="PUBLISHED GALLERY"
          title="사진 모음"
          id="gallery-title"
          action={
            <Link href="/announcements" className="shrink-0 text-sm font-extrabold text-clay-ink">
              운영 소식 →
            </Link>
          }
        />

        {data === null ? (
          <EmptyState title="지금은 사진을 불러올 수 없어요." />
        ) : photos.length === 0 ? (
          <EmptyState
            title="아직 공개된 사진이 없어요."
            description="운영자가 검토해 게시한 사진이 이곳에 나타납니다."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {photos.map((photo) => (
              <figure key={photo.photoId} className="overflow-hidden rounded-lg border bg-card">
                {/*
                  A plain <img>, not next/image. These files are served by the
                  API from a private store behind an authorisation check, and
                  the optimiser would need to fetch and cache them itself —
                  which would put an unreviewed photo into a public cache the
                  moment its publication was revoked.
                */}
                <img
                  src={photo.imageUrl}
                  alt={photo.altText}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="aspect-video w-full object-cover"
                />
                <figcaption className="grid gap-0.5 p-3">
                  <span className="text-sm">{photo.altText}</span>
                  {photo.publishedAt && (
                    <time dateTime={photo.publishedAt} className="text-xs text-muted-foreground">
                      {formatDay(photo.publishedAt, '게시 시간 확인 중')}
                    </time>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
