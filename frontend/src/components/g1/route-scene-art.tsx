'use client';

import { usePathname } from 'next/navigation';
import { G1Scene } from '@/components/g1/scene';
import { sceneForPath } from '@/components/g1/route-scene';

/** Decorative scene for the current route; client-side because PageHeader callers do not pass a path. */
export function RouteSceneArt({ className }: { readonly className?: string }) {
  const pathname = usePathname() ?? '/';
  return <G1Scene kind={sceneForPath(pathname)} className={className} />;
}
