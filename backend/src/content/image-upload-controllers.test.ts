import { BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import type { RequestWithSession } from '../auth/session.context';
import { ProfileController } from '../profile/profile.controller';
import type { ProfileRepository } from '../profile/profile.repository';
import { ImageUploadError } from './image-upload-validation';
import { MemberPhotoController } from './member-photo.controller';
import { PhotoUploadController } from './photo-upload.controller';
import type { PrivateImageStorage } from './private-image-storage';

const invalidStorage = {
  save: async () => {
    throw new ImageUploadError('invalid image');
  },
} as unknown as PrivateImageStorage;

describe('operator photo upload security boundary', () => {
  it('requires an admin session, CSRF, and recent reauthentication', () => {
    const guards =
      (Reflect.getMetadata(GUARDS_METADATA, PhotoUploadController) as unknown[]) ?? [];
    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });
});

describe('image upload error responses', () => {
  it('answers an invalid operator upload as a bad request', async () => {
    const controller = new PhotoUploadController(invalidStorage);
    const request = { adminRoles: ['operator'] } as RequestWithSession;

    await expect(controller.upload(request, Buffer.alloc(12))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('answers an invalid gallery upload as a bad request', async () => {
    const controller = new MemberPhotoController(null, invalidStorage);

    await expect(controller.upload(Buffer.alloc(12))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('answers an invalid profile upload as a bad request', async () => {
    const controller = new ProfileController({} as ProfileRepository, invalidStorage);
    const request = {
      session: { user_id: '11111111-2222-4333-8444-555555555555' },
    } as RequestWithSession;

    await expect(controller.uploadImage(request, Buffer.alloc(12))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
