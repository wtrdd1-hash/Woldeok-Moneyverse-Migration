'use client';

import { PublicAdvertisement } from '@/components/public-advertisement';
import { useViewer } from '@/lib/use-viewer';
import { isAdministrator } from '@/lib/viewer-state';

/** Desktop-only inventory is outside the 1440px page; never cover the content. */
export function DesktopStickyAdRails() {
  const viewer = useViewer();
  if (viewer === null || isAdministrator(viewer)) return null;

  return (
    <>
      {(['left', 'right'] as const).map((side) => (
        <aside
          key={side}
          aria-label={side === 'left' ? '광고 / Advertisement — left rail' : '광고 / Advertisement — right rail'}
          className={`hidden min-[2200px]:block fixed top-36 ${side === 'left' ? 'left-5' : 'right-5'} w-[300px] z-10`}
        >
          <PublicAdvertisement variant="display" />
        </aside>
      ))}
    </>
  );
}
