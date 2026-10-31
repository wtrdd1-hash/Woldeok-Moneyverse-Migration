import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { TranslatedText as T } from '@/components/translated-text';
import { canonicalUrl } from '@/lib/seo';
import { normalizeGalleryCaptionQuery, parseGalleryCaptionSearch } from '@/lib/gallery-caption-search';

// Publication changes must be visible immediately. The public API query still
// remains cheap and bounded; caching this page hid freshly approved photos for
// up to five minutes and made a successful review look like a failure.
export const dynamic = 'force-dynamic';

const galleryMetadata: Metadata = {
  title: '사진 | Gallery',
  description: '월덕 머니버스 커뮤니티 사진 | Woldeok Moneyverse Community Gallery',
  alternates: { canonical: canonicalUrl('/gallery') },
};

type GallerySearchParams = { readonly q?: string | string[] };
export async function generateMetadata({ searchParams }: { searchParams: Promise<GallerySearchParams> }): Promise<Metadata> {
  return (await searchParams).q === undefined ? galleryMetadata : { ...galleryMetadata, robots: { index: false, follow: false } };
}
interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<GallerySearchParams> }) {
  const params = await searchParams;
  let query: string | null = null;
  let queryError = false;
  try { query = normalizeGalleryCaptionQuery(params.q); } catch { queryError = true; }
  const data = queryError ? null : await publicApi<unknown>(query === null ? '/api/v1/photos' : `/api/v1/photos?q=${encodeURIComponent(query)}`, 0);
  const verified = query !== null ? parseGalleryCaptionSearch(data, query) : null;
  const unavailable = !queryError && (data === null || (query !== null && verified === null));
  const photos: Photo[] = query !== null ? verified ?? [] : data && typeof data === 'object' && 'photos' in data && Array.isArray(data.photos) ? data.photos as Photo[] : [];

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

        <form action="/gallery" method="get" role="search" className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
          <label htmlFor="gallery-caption-q" className="grid min-w-0 flex-1 gap-1 text-sm font-medium">
            사진 설명 검색 (최근 게시된 24장)
            <input id="gallery-caption-q" name="q" type="search" minLength={2} maxLength={40}
              defaultValue={typeof params.q === 'string' ? params.q : ''} placeholder="예: 제주 바다"
              className="min-h-11 w-full rounded-md border bg-background px-3" />
          </label>
          <button type="submit" className="min-h-11 rounded-md bg-primary px-4 text-primary-foreground">검색</button>
          <Link href="/gallery" className="flex min-h-11 items-center rounded-md border px-4">초기화</Link>
        </form>
        {query !== null && <p role="status" className="text-sm text-muted-foreground">최근 게시된 사진 24장 중 {photos.length}장 검색됨 · 전체 사진 검색이 아닙니다.</p>}
        {queryError ? <EmptyState title="검색어는 2~40자이며 한 번만 입력할 수 있어요." /> : unavailable ? (
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
            title={<T korean={query !== null ? "검색된 사진이 없어요." : "아직 공개된 사진이 없어요."} english={query !== null ? "No matching photos in the latest 24." : "No published photos yet."} />}
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
