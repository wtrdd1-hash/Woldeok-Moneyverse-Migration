import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { TranslatedText as T } from '@/components/translated-text';
import { canonicalUrl } from '@/lib/seo';
import { parseGallerySort } from './gallery-caption-order';

// Publication changes must be visible immediately. The public API query still
// remains cheap and bounded; caching this page hid freshly approved photos for
// up to five minutes and made a successful review look like a failure.
export const dynamic = 'force-dynamic';

const galleryMetadata: Metadata = {
  title: '사진 | Gallery',
  description: '월덕 머니버스 커뮤니티 사진 | Woldeok Moneyverse Community Gallery',
  alternates: { canonical: canonicalUrl('/gallery') },
};

interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export async function generateMetadata({ searchParams }: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  return { ...galleryMetadata, robots: { index: params.sort === undefined, follow: true } };
}

export default async function GalleryPage({ searchParams }: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = parseGallerySort(params.sort);
  const data = sort.invalid ? null : await publicApi<{ photos: Photo[] }>(
    sort.sort === 'caption' ? '/api/v1/photos?sort=caption' : '/api/v1/photos', 0,
  );
  const photos = data?.photos ?? [];

  return (
    <div data-page="gallery" className="mv-page mv-page--community grid gap-4">
      <PageHeader
        eyebrow="COMMUNITY ARCHIVE"
        title={
          <>
            <T korean="함께 만든" english="Scenes of Our World," />
            <br />
            <Accent>
              <T korean="우리 세계의 장면." english="Created Together." />
            </Accent>
          </>
        }
      >
        <T
          korean="회원이 보낸 사진과 운영자가 올린 사진을 함께 모읍니다. 어느 쪽이든 운영자가 검토한 뒤에만 공개해요."
          english="Photos submitted by members and posted by operators are gathered here. Every photo is published only after operator review."
        />
      </PageHeader>

      <section aria-labelledby="gallery-title" className="grid gap-3">
        <SectionHeader
          eyebrow="PUBLISHED GALLERY"
          title={<T korean="사진 모음" english="Photo Gallery" />}
          id="gallery-title"
          action={
            <Link href="/gallery/submit" className="shrink-0 text-sm font-extrabold text-clay-ink">
              <T korean="사진 보내기 →" english="Submit a photo →" />
            </Link>
          }
        />

        <nav aria-label="사진 정렬" className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/gallery" aria-current={!sort.sort && !sort.invalid ? 'page' : undefined}
            className="min-h-11 inline-flex items-center rounded-md border px-3 font-semibold underline-offset-4 hover:underline">
            <T korean="최신순" english="Newest first" />
          </Link>
          <Link href="/gallery?sort=caption" aria-current={sort.sort === 'caption' ? 'page' : undefined}
            className="min-h-11 inline-flex items-center rounded-md border px-3 font-semibold underline-offset-4 hover:underline">
            <T korean="설명 문자순" english="Description order" />
          </Link>
          <p className="w-full text-xs text-muted-foreground">
            <T korean="승인된 최근 사진 24장 안에서만 정렬합니다. 전체 갤러리 정렬이 아닙니다."
              english="Ordering covers only the latest 24 approved photos, not the full archive." />
          </p>
        </nav>
        {sort.invalid ? (
          <EmptyState title={<T korean="정렬 조건을 확인해 주세요." english="Invalid gallery order." />} />
        ) : data === null ? (
          <EmptyState
            title={
              <T
                korean="지금은 사진을 불러올 수 없어요."
                english="Unable to load photos right now."
              />
            }
          />
        ) : photos.length === 0 ? (
          <EmptyState
            title={<T korean="아직 공개된 사진이 없어요." english="No published photos yet." />}
            description={
              <T
                korean="운영자가 검토해 게시한 사진이 이곳에 나타납니다."
                english="Photos reviewed and approved by operators will appear here."
              />
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <Link
                key={photo.photoId}
                href={`/gallery/${photo.photoId}`}
                className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-clay-ink/60"
              >
                <figure>
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black/40">
                    <img
                      src={photo.imageUrl}
                      alt={photo.altText}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="grid gap-0.5 p-3">
                    <span className="text-sm font-semibold">{photo.altText}</span>
                    {photo.publishedAt && (
                      <time dateTime={photo.publishedAt} className="text-xs text-muted-foreground">
                        {formatDay(photo.publishedAt, '게시 시간 확인 중')}
                      </time>
                    )}
                  </figcaption>
                </figure>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Only operator-reviewed, published photos make this a content page. */}
      <PublicAdvertisement />
    </div>
  );
}
