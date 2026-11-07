import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { TranslatedText as T } from '@/components/translated-text';
import { canonicalUrl } from '@/lib/seo';
import { parseGallerySort } from './gallery-sort';

// Publication changes must be visible immediately. The public API query still
// remains cheap and bounded; caching this page hid freshly approved photos for
// up to five minutes and made a successful review look like a failure.
export const dynamic = 'force-dynamic';

const galleryMetadata: Metadata = {
  title: '사진 | Gallery',
  description: '월덕 머니버스 커뮤니티 사진 | Woldeok Moneyverse Community Gallery',
  alternates: { canonical: canonicalUrl('/gallery') },
};

export async function generateMetadata({ searchParams }: {
  readonly searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  return { ...galleryMetadata, robots: { index: params?.sort === undefined, follow: true } };
}

interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export default async function GalleryPage({ searchParams }: {
  readonly searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const order = parseGallerySort(params?.sort);
  const endpoint = order.filtered ? `/api/v1/photos?sort=${order.sort}` : '/api/v1/photos';
  const data = order.invalid ? null : await publicApi<{ photos: Photo[] }>(endpoint, 0);
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

        <form method="get" action="/gallery" role="search" className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
          <div className="grid gap-1">
            <label htmlFor="gallery-sort" className="text-sm font-semibold">
              <T korean="게시 순서" english="Publication order" />
            </label>
            <select id="gallery-sort" name="sort" defaultValue={order.sort} className="min-h-11 rounded-md border bg-background px-3 text-sm">
              <option value="newest">최신순 / Newest first</option>
              <option value="oldest">오래된순 / Oldest first</option>
            </select>
          </div>
          <button type="submit" className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">
            <T korean="정렬" english="Sort" />
          </button>
          {order.filtered && <Link href="/gallery" className="py-3 text-sm underline"><T korean="초기화" english="Clear" /></Link>}
        </form>
        <p className="text-xs text-muted-foreground">
          <T korean="최근 승인·공개 사진 최대 24장 내에서만 순서를 바꿉니다. 전체 과거 사진의 오래된순 검색은 아닙니다." english="Sort only the latest 24 approved public photos, not the entire historical gallery." />
        </p>
        {order.invalid ? (
          <p role="alert" className="rounded-lg border border-destructive p-3 text-sm">
            <T korean="정렬 조건이 올바르지 않습니다. 최신순 또는 오래된순을 선택해 주세요." english="Invalid sort order. Select newest or oldest." />
          </p>
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
