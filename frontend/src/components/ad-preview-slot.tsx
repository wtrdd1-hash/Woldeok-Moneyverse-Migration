'use client';

import { usePathname } from 'next/navigation';
import { isEligiblePublicAdPath, publicAdDisclosure } from '@/lib/ad-placement-policy';

/**
 * Where an ad will sit, shown only when advertising is off and the build opts
 * into previews (NEXT_PUBLIC_AD_PREVIEW=true, used for the Test site). It
 * obeys the same route policy as real AdSense — public content pages only,
 * never wallets, banking, accounts, admin or chat — and reserves the same
 * height so turning real ads on causes no layout shift. It draws no creative:
 * a preview must never look like a filled advertisement.
 */
export function AdPreviewSlot({ variant, className }: { readonly variant: 'display' | 'in-article' | 'multiplex'; readonly className?: string | undefined }) {
  const pathname = usePathname();
  if (!isEligiblePublicAdPath(pathname)) return null;
  const label = publicAdDisclosure(pathname);
  const height = variant === 'multiplex' ? 'min-h-[250px]' : variant === 'in-article' ? 'min-h-[120px]' : 'min-h-[100px]';
  return (
    <aside
      aria-label={`${label} (preview)`}
      data-testid="ad-preview-slot"
      className={`flex flex-col gap-2 border border-dashed border-[var(--g1-line)] px-4 py-3 ${className ?? ''}`}
    >
      <span className="text-xs text-[var(--g1-muted)]">{label} (Sponsored)</span>
      <span className={`flex ${height} items-center justify-center text-xs text-[var(--g1-faint)]`}>
        광고 영역 미리보기: {variant === 'multiplex' ? '추천 콘텐츠형' : variant === 'in-article' ? '본문 삽입형' : '배너형'}
      </span>
    </aside>
  );
}
