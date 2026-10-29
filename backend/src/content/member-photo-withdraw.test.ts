import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { RequestWithSession } from '../auth/session.context';
import { MemberPhotoController } from './member-photo.controller';
import { MemberPhotoRepository } from './member-photo.repository';

const actor = randomUUID();
const photoId = randomUUID();
const requestKey = randomUUID();

describe('owner pending photo withdrawal', () => {
  it('calls only the owner-scoped SQL command with UUIDs', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ photo_id: photoId, replayed: false, withdrawn_at: new Date() }],
    });
    const repository = new MemberPhotoRepository({ query });
    const receipt = await repository.withdraw(actor, photoId, requestKey);
    expect(receipt?.photo_id).toBe(photoId);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toContain('public.member_withdraw_pending_photo');
    expect(query.mock.calls[0]?.[1]).toEqual([actor, photoId, requestKey]);
  });

  it('keeps authenticated session, consent and CSRF guards on withdrawal', async () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, MemberPhotoController) as unknown[]) ?? [];
    expect(guards).toContain(SessionGuard);
    expect(guards).toContain(AuthenticatedGuard);
    expect(guards).toContain(ConsentGuard);
    expect(guards).toContain(CsrfGuard);
    const withdraw = vi.fn().mockResolvedValue({ photo_id: photoId, replayed: false });
    const controller = new MemberPhotoController({ withdraw } as unknown as MemberPhotoRepository, null);
    const request = { session: { user_id: actor } } as RequestWithSession;
    await expect(controller.withdraw(request, { photoId, idempotencyKey: requestKey })).resolves.toMatchObject({
      photo_id: photoId,
    });
    expect(withdraw).toHaveBeenCalledWith(actor, photoId, requestKey);
  });

  it('rejects invalid identities before querying', async () => {
    const query = vi.fn();
    const repository = new MemberPhotoRepository({ query });
    expect(() => repository.withdraw(actor, 'bad-photo', requestKey)).toThrow('photo');
    expect(() => repository.withdraw(actor, photoId, 'bad-key')).toThrow('idempotency');
    expect(query).not.toHaveBeenCalled();
  });
});
