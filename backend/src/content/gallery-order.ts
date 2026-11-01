import { BadRequestException } from '@nestjs/common';

export type GalleryOrder = 'newest' | 'oldest';

export function parseGalleryOrder(value: unknown): GalleryOrder | undefined {
  if (value === undefined) return undefined;
  if (value === 'newest' || value === 'oldest') return value;
  throw new BadRequestException('sort must be newest or oldest');
}
