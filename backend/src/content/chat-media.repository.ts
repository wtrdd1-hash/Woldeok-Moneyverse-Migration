import { ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

/** The database is the authority for who may see an uploaded chat image. */
export class ChatMediaRepository {
  constructor(private readonly pool: Queryable | null) {}

  async register(actorUserId: string, storageKey: string): Promise<void> {
    if (!this.pool) throw new ServiceUnavailableException('chat media registry unavailable');
    try {
      const row = await queryOne<{ registered: boolean }>(
        this.pool,
        'SELECT public.chat_media_register($1::uuid, $2::text) AS registered',
        [actorUserId, storageKey],
      );
      if (row?.registered !== true) throw new Error('chat media registration refused');
    } catch {
      throw new ServiceUnavailableException('chat media registry unavailable');
    }
  }

  async visibleTo(actorUserId: string, storageKey: string, sessionId?: string): Promise<boolean> {
    if (!this.pool) throw new ServiceUnavailableException('chat media access unavailable');
    try {
      const row = await queryOne<{ visible: boolean }>(
        this.pool,
        'SELECT public.chat_media_visible($1::uuid, $2::text, $3::uuid) AS visible',
        [actorUserId, storageKey, sessionId ?? null],
      );
      return row?.visible === true;
    } catch {
      throw new ServiceUnavailableException('chat media access unavailable');
    }
  }
}
