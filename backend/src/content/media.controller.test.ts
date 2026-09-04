import { describe, expect, it, vi } from 'vitest';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { Response } from 'express';
import type { AppConfig } from '../core/config';
import type { RequestWithSession } from '../auth/session.context';
import type { ContentService } from './content.service';
import type { MemberPhotoRepository } from './member-photo.repository';
import type { PrivateImageStorage } from './private-image-storage';
import type { SessionRepository } from '../auth/session.repository';
import { HOST_PREFIXED_AUTH_COOKIE } from '../auth/cookies';
import { MediaController } from './media.controller';

const CONFIG: AppConfig = {
  cookieSecure: true,
} as AppConfig;

function mockResponse() {
  const headers: Record<string, any> = {};
  let body: any = null;
  const res = {
    setHeader: vi.fn((k: string, v: any) => {
      headers[k.toLowerCase()] = v;
      return res;
    }),
    end: vi.fn((b: any) => {
      body = b;
      return res;
    }),
    _headers: headers,
    _getBody: () => body,
  } as unknown as Response & { _headers: Record<string, any>; _getBody: () => any };
  return res;
}

describe('MediaController', () => {
  const fakeBytes = Buffer.from('fake-image-bytes');

  it('throws 503 if content service or storage is missing', async () => {
    const controller = new MediaController(null, null, null, null, CONFIG);
    const req = { headers: {} } as RequestWithSession;
    const res = mockResponse();

    await expect(controller.media(req, 'test.png', res)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('serves a published photo anonymously with public cache-control', async () => {
    const content = {
      isPublicStorageKey: vi.fn().mockResolvedValue(true),
    } as unknown as ContentService;
    const storage = {
      read: vi.fn().mockResolvedValue(fakeBytes),
    } as unknown as PrivateImageStorage;
    const submissions = {
      visibleTo: vi.fn(),
    } as unknown as MemberPhotoRepository;

    const controller = new MediaController(content, storage, submissions, null, CONFIG);
    const req = { headers: {} } as RequestWithSession;
    const res = mockResponse();

    await controller.media(req, 'photo-uuid.png', res);

    expect(content.isPublicStorageKey).toHaveBeenCalledWith('photo-uuid.png');
    expect(submissions.visibleTo).not.toHaveBeenCalled();
    expect(res._headers['content-type']).toBe('image/png');
    expect(res._headers['content-length']).toBe(fakeBytes.length);
    expect(res._headers['cache-control']).toBe('public, max-age=86400, immutable');
    expect(res._headers['x-content-type-options']).toBe('nosniff');
    expect(res._getBody()).toEqual(fakeBytes);
  });

  it('throws 404 for an unpublished photo when request has no session', async () => {
    const content = {
      isPublicStorageKey: vi.fn().mockResolvedValue(false),
    } as unknown as ContentService;
    const storage = {
      read: vi.fn().mockResolvedValue(fakeBytes),
    } as unknown as PrivateImageStorage;
    const submissions = {
      visibleTo: vi.fn().mockResolvedValue(false),
    } as unknown as MemberPhotoRepository;

    const controller = new MediaController(content, storage, submissions, null, CONFIG);
    const req = { headers: {} } as RequestWithSession;
    const res = mockResponse();

    await expect(controller.media(req, 'draft-uuid.png', res)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(submissions.visibleTo).toHaveBeenCalledWith(null, 'draft-uuid.png');
  });

  it('throws 404 for an unpublished photo when viewer is not the uploader', async () => {
    const content = {
      isPublicStorageKey: vi.fn().mockResolvedValue(false),
    } as unknown as ContentService;
    const storage = {
      read: vi.fn().mockResolvedValue(fakeBytes),
    } as unknown as PrivateImageStorage;
    const submissions = {
      visibleTo: vi.fn().mockResolvedValue(false),
    } as unknown as MemberPhotoRepository;
    const sessions = {
      get: vi.fn().mockResolvedValue({ user_id: 'other-user-uuid' }),
    } as unknown as SessionRepository;

    const controller = new MediaController(content, storage, submissions, sessions, CONFIG);
    const req = {
      headers: { cookie: `${HOST_PREFIXED_AUTH_COOKIE}=valid-session-token` },
    } as unknown as RequestWithSession;
    const res = mockResponse();

    await expect(controller.media(req, 'draft-uuid.png', res)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(sessions.get).toHaveBeenCalledWith('valid-session-token');
    expect(submissions.visibleTo).toHaveBeenCalledWith('other-user-uuid', 'draft-uuid.png');
  });

  it('serves an unpublished photo to its owner when restored from session cookie', async () => {
    const content = {
      isPublicStorageKey: vi.fn().mockResolvedValue(false),
    } as unknown as ContentService;
    const storage = {
      read: vi.fn().mockResolvedValue(fakeBytes),
    } as unknown as PrivateImageStorage;
    const submissions = {
      visibleTo: vi.fn().mockResolvedValue(true),
    } as unknown as MemberPhotoRepository;
    const sessions = {
      get: vi.fn().mockResolvedValue({ user_id: 'uploader-user-uuid' }),
    } as unknown as SessionRepository;

    const controller = new MediaController(content, storage, submissions, sessions, CONFIG);
    const req = {
      headers: { cookie: `${HOST_PREFIXED_AUTH_COOKIE}=uploader-token` },
    } as unknown as RequestWithSession;
    const res = mockResponse();

    await controller.media(req, 'my-draft.webp', res);

    expect(sessions.get).toHaveBeenCalledWith('uploader-token');
    expect(submissions.visibleTo).toHaveBeenCalledWith('uploader-user-uuid', 'my-draft.webp');
    expect(res._headers['content-type']).toBe('image/webp');
    expect(res._headers['cache-control']).toBe('private, no-store');
    expect(res._getBody()).toEqual(fakeBytes);
  });

  it('throws 404 if storage cannot find bytes on disk', async () => {
    const content = {
      isPublicStorageKey: vi.fn().mockResolvedValue(true),
    } as unknown as ContentService;
    const storage = {
      read: vi.fn().mockResolvedValue(null),
    } as unknown as PrivateImageStorage;

    const controller = new MediaController(content, storage, null, null, CONFIG);
    const req = { headers: {} } as RequestWithSession;
    const res = mockResponse();

    await expect(controller.media(req, 'missing.jpg', res)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws 404 for unknown extension', async () => {
    const content = {
      isPublicStorageKey: vi.fn().mockResolvedValue(true),
    } as unknown as ContentService;
    const storage = {
      read: vi.fn().mockResolvedValue(fakeBytes),
    } as unknown as PrivateImageStorage;

    const controller = new MediaController(content, storage, null, null, CONFIG);
    const req = { headers: {} } as RequestWithSession;
    const res = mockResponse();

    await expect(controller.media(req, 'file.bmp', res)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
