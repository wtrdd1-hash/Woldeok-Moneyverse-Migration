import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { ProfileController } from './profile.controller';

describe('profile private API response contract', () => {
  it.each(['mine', 'titles', 'settings', 'member'] as const)(
    '%s never permits cached profile fields or owner settings', (method) => {
      const headers = Reflect.getMetadata(HEADERS_METADATA, ProfileController.prototype[method]) as
        | { name: string; value: string }[] | undefined;
      expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
    },
  );
});
