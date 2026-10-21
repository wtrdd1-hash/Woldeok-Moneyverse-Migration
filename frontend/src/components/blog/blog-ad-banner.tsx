'use client';

import { PublicAdvertisement } from '@/components/public-advertisement';

type BlogAdPosition = 'top' | 'in-feed' | 'bottom';

export function BlogAdBanner({
  position,
  className = '',
}: {
  readonly position: BlogAdPosition;
  readonly className?: string;
}) {
  const variant = position === 'top' ? 'display' : position === 'bottom' ? 'multiplex' : 'in-article';
  return (
    <aside aria-label="광고 / Advertisement" className={className}>
      <PublicAdvertisement variant={variant} />
    </aside>
  );
}
