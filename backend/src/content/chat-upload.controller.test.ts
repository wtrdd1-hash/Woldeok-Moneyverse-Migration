import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA, INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { Response } from 'express';
import { ChatUploadController } from './chat-upload.controller';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';

describe('ChatUploadController P0 owner-authorization containment', () => {
  const controller = new ChatUploadController();

  it('returns a real 503 for image uploads rather than fabricating an attachment receipt', async () => {
    await expect(controller.uploadChatImage()).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining('temporarily unavailable'),
    });
  });

  it('rejects uploads before multipart buffering and retains existing auth, consent and CSRF guards', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller.uploadChatImage) as unknown[];
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]);
    const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, controller.uploadChatImage) as unknown[] | undefined;
    expect(interceptors ?? []).toEqual([]);
  });

  it('denies legacy media without reading bytes or allowing shared caching', async () => {
    const res = { setHeader: vi.fn(), end: vi.fn() } as unknown as Response;
    await expect(controller.getChatMedia(res)).rejects.toBeInstanceOf(NotFoundException);
    expect(res.setHeader).toHaveBeenCalledWith('cache-control', 'private, no-store');
    expect(res.setHeader).toHaveBeenCalledWith('x-content-type-options', 'nosniff');
    expect(res.end).not.toHaveBeenCalled();
  });

  it('does not leak media existence or ownership through a key-specific response', async () => {
    const first = { setHeader: vi.fn(), end: vi.fn() } as unknown as Response;
    const second = { setHeader: vi.fn(), end: vi.fn() } as unknown as Response;
    const result = await Promise.allSettled([controller.getChatMedia(first), controller.getChatMedia(second)]);
    expect(result.every((entry) => entry.status === 'rejected' && entry.reason instanceof NotFoundException)).toBe(true);
    expect(result.map((entry) => entry.status === 'rejected' ? entry.reason.message : '')).toEqual(['not found', 'not found']);
    expect(first.end).not.toHaveBeenCalled();
    expect(second.end).not.toHaveBeenCalled();
  });

  it('returns explicit HTTP statuses for client error handling', async () => {
    const res = { setHeader: vi.fn(), end: vi.fn() } as unknown as Response;
    await expect(controller.uploadChatImage()).rejects.toBeInstanceOf(ServiceUnavailableException);
    try {
      await controller.getChatMedia(res);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).getStatus()).toBe(404);
    }
  });
});
