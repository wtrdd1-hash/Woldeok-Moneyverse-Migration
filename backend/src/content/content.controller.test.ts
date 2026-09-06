import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ContentController } from './content.controller';

const ACTOR = '64fd119b-f4d4-466f-bd37-5ee296a1474b';
const PHOTO = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad';

describe('member photo approval', () => {
  it('builds the approval command on the server', async () => {
    const setPhotoPublication = vi.fn().mockResolvedValue({
      photoId: PHOTO,
      publishedAt: '2026-09-07T00:00:00.000Z',
      replayed: false,
    });
    const controller = new ContentController({ setPhotoPublication } as never);
    const request = { session: { user_id: ACTOR } } as RequestWithSession;

    await expect(controller.approveMemberPhoto(request, PHOTO)).resolves.toMatchObject({
      photoId: PHOTO,
    });
    expect(setPhotoPublication).toHaveBeenCalledWith(
      ACTOR,
      expect.objectContaining({
        photoId: PHOTO,
        publish: true,
        idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/),
      }),
    );
  });
});
