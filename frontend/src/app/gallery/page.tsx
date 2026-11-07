import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { TranslatedText as T } from '@/components/translated-text';
import { canonicalUrl } from '@/lib/seo';
import { parseGalleryMonth, isVerifiedGalleryMonthResponse } from '@/lib/gallery-month';

// Publication changes must be visible immediately. The public API query still
// remains cheap and bounded; caching this page hid freshly approved photos for
// up to five minutes and made a successful review look like a failure.
export const dynamic = 'force-dynamic';

const galleryMetadata: Metadata = {
  title: '사진 | Gallery',
  description: '월덕 머니버스 커뮤니티 사진 | Woldeok Moneyverse Community Gallery',
  alternates: { canonical: canonicalUrl('/gallery') },
};

type GalleryParams = { readonly searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: GalleryParams): Promise<Metadata> {
  const params = await searchParams;
  const hasMonth = params.month !== undefined;
  return { ...galleryMetadata, robots: { index: !hasMonth, follow: true } };
}

interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export default async function GalleryPage({ searchParams }: GalleryParams) {
  const params = await searchParams;
  const month = parseGalleryMonth(params.month);
  const selectedMonth = month === 'INVALID' ? null : month;
  const rawData = month === 'INVALID'
    ? null
    : await publicApi<{ photos: Photo[]; month?: string }>(
        selectedMonth ? `/api/v1/photos?month=${encodeURIComponent(selectedMonth)}` : '/api/v1/photos', 0,
      );
  const data = selectedMonth && rawData && !isVerifiedGalleryMonthResponse(rawData, selectedMonth)
    ? null : rawData;
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

      <form role="search" action="/gallery" method="get" className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <label htmlFor="gallery-month" className="grid min-w-0 flex-1 gap-1 text-sm font-semibold">
          공개된 사진 게시월 (한국 시간)
          <input
            id="gallery-month"
            name="month"
            type="month"
            min="2000-01"
            max="2099-12"
            defaultValue={selectedMonth ?? ''}
            className="min-h-11 rounded-md border border-input bg-background px-3"
            aria-describedby="gallery-month-scope"
          />
        </label>
        <button type="submit" className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">
          월별 검색
        </button>
        <Link href="/gallery" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">
          검색 초기화
        </Link>
        <p id="gallery-month-scope" className="w-full text-xs text-muted-foreground">
          최근 공개 사진 24건 안에서만 게시월을 검색합니다. 전체 과거 사진 검색이 아닙니다.
        </p>
        {month === 'INVALID' ? (
          <p role="alert" className="w-full text-sm text-destructive">
            게시월은 YYYY-MM 형식으로 하나만 선택해 주세요 (2000~2099년).
          </p>
        ) : null}
      </form>

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

        {month === 'INVALID' ? (
          <EmptyState title="게시월을 다시 확인해 주세요." />
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
            title={selectedMonth
              ? `${selectedMonth}에 해당하는 최근 공개 사진이 없어요.`
              : <T korean="아직 공개된 사진이 없어요." english="No published photos yet." />}
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
