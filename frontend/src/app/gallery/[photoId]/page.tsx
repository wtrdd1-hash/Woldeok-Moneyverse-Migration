import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { formatMoment } from '@/lib/money';

export const dynamic = 'force-dynamic';

interface Photo {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

export const metadata: Metadata = {
  title: '사진 상세 | Gallery',
  description: '월덕 머니버스 커뮤니티 갤러리의 공개 사진 상세 페이지입니다.',
};

export default async function GalleryPhotoPage({
  params,
}: {
  readonly params: Promise<{ readonly photoId: string }>;
}) {
  const { photoId } = await params;
  const data = await publicApi<{ photos: Photo[] }>('/api/v1/photos', 0);
  const photo = data?.photos.find((item) => item.photoId === photoId);
  if (!photo) notFound();

  return (
    <div className="grid gap-5">
      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/gallery">
          <ArrowLeft />
          사진 목록으로
        </Link>
      </Button>

      <article className="overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-[min(78vh,900px)] min-h-[45vh] bg-black/50 p-3 sm:p-6">
          <Image
            src={photo.imageUrl}
            alt={photo.altText}
            fill
            sizes="100vw"
            unoptimized={photo.imageUrl.startsWith('https://')}
            className="object-contain p-3 sm:p-6"
            priority
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="grid gap-2 border-t p-4 sm:p-5">
          <h1 className="text-xl font-extrabold sm:text-2xl">{photo.altText}</h1>
          {photo.publishedAt && (
            <time dateTime={photo.publishedAt} className="text-sm text-muted-foreground">
              {formatMoment(photo.publishedAt, '게시 시간 확인 중')}
            </time>
          )}
        </div>
      </article>
    </div>
  );
}
