import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { TranslatedText as T } from '@/components/translated-text';
import { canonicalUrl } from '@/lib/seo';
import { isVerifiedGalleryDayResponse, parseGalleryDay } from './gallery-day';

// Publication changes must be visible immediately. The public API query still
// remains cheap and bounded; caching this page hid freshly approved photos for
// up to five minutes and made a successful review look like a failure.
export const dynamic = 'force-dynamic';

type GallerySearchParams = { readonly day?: string | string[] };

export async function generateMetadata({ searchParams }: { searchParams?: Promise<GallerySearchParams> }): Promise<Metadata> {
  const filtered = (await searchParams)?.day !== undefined;
  return {
    title: '사진 | Gallery',
    description: '월덕 머니버스 커뮤니티 사진 | Woldeok Moneyverse Community Gallery',
    alternates: { canonical: canonicalUrl('/gallery') },
    ...(filtered ? { robots: { index: false, follow: false } } : {}),
  };
}

interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export default async function GalleryPage({ searchParams }: { searchParams?: Promise<GallerySearchParams> }) {
  const rawDay = (await searchParams)?.day;
  const dayRequested = rawDay !== undefined;
  const day = dayRequested ? parseGalleryDay(rawDay) : null;
  const invalidDay = dayRequested && day === null;
  const fetched = invalidDay ? null : await publicApi<{ photos: Photo[] }>(
    day ? `/api/v1/photos?day=${encodeURIComponent(day)}` : '/api/v1/photos', 0,
  );
  // A successful but unfiltered response must not look like a verified empty day.
  const data = day && fetched && !isVerifiedGalleryDayResponse(fetched, day) ? null : fetched;
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

        <form action="/gallery" method="get" className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
          <div className="grid min-w-[11rem] flex-1 gap-1">
            <label htmlFor="gallery-publication-day" className="text-sm font-semibold">
              <T korean="게시일 (한국시간)" english="Publication day (Seoul time)" />
            </label>
            <input id="gallery-publication-day" type="date" name="day" required
              defaultValue={day ?? ''} aria-describedby="gallery-day-scope"
              className="min-h-11 rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="min-h-11 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <T korean="날짜 검색" english="Search day" />
          </button>
          {dayRequested && <Link href="/gallery" className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-semibold">
            <T korean="검색 초기화" english="Clear search" />
          </Link>}
        </form>
        <p id="gallery-day-scope" className="text-xs text-muted-foreground">
          <T korean="최근 공개·승인된 사진 최대 24장 안에서만 게시일을 검색합니다. 전체 과거 사진 검색은 아닙니다."
            english="Search publication days only within the latest 24 approved public photos, not the full archive." />
        </p>
        {invalidDay ? (
          <EmptyState title={<T korean="올바른 날짜를 선택해 주세요." english="Choose a valid calendar date." />} />
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
            title={day
              ? <T korean="선택한 날짜에 해당하는 최근 사진이 없어요." english="No recent photos matched that day." />
              : <T korean="아직 공개된 사진이 없어요." english="No published photos yet." />}
            description={day
              ? <T korean="최근 승인 사진 24장 범위의 결과입니다. 다른 날짜를 선택하거나 검색을 초기화해 주세요."
                  english="This only covers the latest 24 approved photos. Try another day or clear the search." />
              : <T korean="운영자가 검토해 게시한 사진이 이곳에 나타납니다."
                  english="Photos reviewed and approved by operators will appear here." />}
          />
        ) : (
          <div className="grid gap-3">
            {day && <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
              <T korean={`최근 24장 중 ${photos.length}장 검색됨`} english={`${photos.length} of the latest 24 photos matched`} />
            </p>}
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
          </div>
        )}
      </section>

      {/* Only operator-reviewed, published photos make this a content page. */}
      <PublicAdvertisement />
    </div>
  );
}
