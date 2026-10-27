import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ChatUploadController } from './chat-upload.controller';
import type { ChatImageStorage } from './chat-image-storage';

function controllerFor(read: ChatImageStorage['read']) {
  const storage = { read } as ChatImageStorage;
  const controller = new ChatUploadController(storage);
  const res = { setHeader: vi.fn(), end: vi.fn() } as unknown as Response;
  return { controller, res };
}

describe('chat image privacy containment', () => {
  it('requires an authenticated session before serving image bytes', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ChatUploadController.prototype.getChatMedia,
    ) as unknown[];
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard]);
  });

  it('disables browser and shared caching on successful image responses', async () => {
    const { controller, res } = controllerFor(
      vi.fn().mockResolvedValue({
        buffer: Buffer.from([1, 2, 3]),
        mimeType: 'image/png',
      }),
    );
    await controller.getChatMedia('chat_123.png', res);
    expect(res.setHeader).toHaveBeenCalledWith('cache-control', 'private, no-store');
    expect(res.end).toHaveBeenCalledWith(Buffer.from([1, 2, 3]));
  });

  it('sets no-store before returning a missing-image error', async () => {
    const { controller, res } = controllerFor(vi.fn().mockResolvedValue(null));
    await expect(controller.getChatMedia('missing.png', res)).rejects.toThrow(NotFoundException);
    expect(res.setHeader).toHaveBeenCalledWith('cache-control', 'private, no-store');
  });
});
