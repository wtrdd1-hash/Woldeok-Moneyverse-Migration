'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProfileAvatar({
  name,
  imageUrl,
  className = 'size-16',
}: {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    const initial = [...name.trim()][0] ?? '?';
    return (
      <span
        aria-label={`${name} 아바타`}
        className={`grid ${className} shrink-0 place-items-center rounded-full border border-amber-500/30 bg-amber-500/10 font-bold text-2xl text-amber-500 select-none shadow-sm`}
      >
        {initial}
      </span>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={`${name} 프로필 이미지`}
      width={112}
      height={112}
      sizes="112px"
      unoptimized
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} shrink-0 rounded-full border border-border/80 object-cover shadow-sm`}
    />
  );
}
