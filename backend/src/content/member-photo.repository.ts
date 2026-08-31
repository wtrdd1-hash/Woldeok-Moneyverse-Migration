import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** The shape `PrivateImageStorage` generates, and the only shape 098 accepts. */
const STORAGE_KEY = /^[0-9a-f-]{32,36}\.(png|jpg|webp)$/;

export class MemberPhotoInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemberPhotoInputError';
  }
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new MemberPhotoInputError(`${field} must be a UUID`);
  }
}

/**
 * One row of `member_my_photo_submissions` (098).
 *
 * `published` is what the member is waiting on. `published_at` is null until
 * an operator says otherwise, and the two are reported separately rather than
 * inferred from each other, because "reviewed and rejected" is a state this
 * schema does not have yet and a null date must not be read as one.
 */
export interface MemberPhotoRow {
  photo_id: string;
  image_url: string | null;
  alt_text: string;
  published: boolean;
  submitted_at: Date;
  published_at: Date | null;
}

export interface MemberPhotoReceiptRow {
  photo_id: string;
  submitted_at: Date;
  replayed: boolean;
}

/**
 * A photo a member sends to the gallery, and the review it waits behind.
 *
 * Its own repository rather than three more methods on `ContentService`: that
 * service is the operator's editorial surface and carries a structural
 * interface every one of its callers has to satisfy, while this is a member
 * writing one row through one function. Keeping them apart is also what makes
 * the guard stacks obviously different — an operator route proves a role, a
 * member route proves a session.
 */
export class MemberPhotoRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * Records a submission. The caller's key is the row's primary key, so the
   * receipt and the row are the same object — 098 returns the original for a
   * repeat rather than writing a second draft.
   */
  submit(
    actor: unknown,
    key: unknown,
    storageKey: unknown,
    altText: unknown,
  ): Promise<MemberPhotoReceiptRow | null> {
    assertUuid(actor, 'actor');
    assertUuid(key, 'idempotency key');
    if (typeof storageKey !== 'string' || !STORAGE_KEY.test(storageKey)) {
      throw new MemberPhotoInputError('storage key must be one this server generated');
    }
    if (typeof altText !== 'string' || altText.trim() === '' || altText.length > 300) {
      throw new MemberPhotoInputError('a caption of 1 to 300 characters is required');
    }
    return queryOne<MemberPhotoReceiptRow>(
      this.pool,
      `SELECT submission.photo_id::text, submission.submitted_at, submission.replayed
       FROM public.member_submit_photo($1, $2, $3, $4) AS submission`,
      [actor, key, storageKey, altText],
    );
  }

  mine(actor: unknown): Promise<MemberPhotoRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<MemberPhotoRow>(
      this.pool,
      `SELECT item.photo_id::text, item.image_url, item.alt_text, item.published,
              item.submitted_at, item.published_at
       FROM public.member_my_photo_submissions($1) AS item`,
      [actor],
    );
  }

  /**
   * May this viewer be served these bytes? Published, or their own.
   *
   * A malformed key is answered false rather than raised: this decides a 404
   * on a public route, and a caller must not be able to tell a bad key from a
   * key that exists and is not theirs.
   */
  async visibleTo(viewer: unknown, storageKey: unknown): Promise<boolean> {
    if (typeof storageKey !== 'string' || !STORAGE_KEY.test(storageKey)) return false;
    const owner = typeof viewer === 'string' && UUID.test(viewer) ? viewer : null;
    const row = await queryOne<{ visible: boolean }>(
      this.pool,
      'SELECT public.content_storage_key_visible($1, $2) AS visible',
      [owner, storageKey],
    );
    return row?.visible === true;
  }
}
