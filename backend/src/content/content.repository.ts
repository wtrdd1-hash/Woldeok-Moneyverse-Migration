import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const IMAGE_URL_PATTERN =
  /^https:\/\/([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)\/[A-Za-z0-9._~%/@:+,;=!-]*$/;

export class ContentInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentInputError';
  }
}

export function requireContentUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new ContentInputError(`${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function optionalContentUuid(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  return requireContentUuid(value, field);
}

export function requireContentLimit(value: unknown, field = 'limit'): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new ContentInputError(`${field} must be an integer between 1 and 100`);
  }
  return value;
}

export function normalizeContentText(
  value: unknown,
  field: string,
  maxLength: number,
  { multiline = false }: { multiline?: boolean } = {},
): string {
  if (typeof value !== 'string') throw new ContentInputError(`${field} must be text`);
  let text = value.replace(/\r\n?/g, '\n');
  if (multiline) {
    text = text
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n');
  } else {
    text = text.replace(/\s+/g, ' ');
  }
  text = text.trim();
  if (
    text.length === 0 ||
    text.length > maxLength ||
    /[<>]/.test(text) ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text.replace(/\n/g, ''))
  ) {
    throw new ContentInputError(`${field} must be safe plain text`);
  }
  return text;
}

export function requireContentStorageKey(value: unknown): string {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    value.length < 1 ||
    value.length > 255 ||
    !STORAGE_KEY_PATTERN.test(value) ||
    /(^|\/)(\.|\.\.)(\/|$)/.test(value) ||
    value.includes('//')
  ) {
    throw new ContentInputError('storage key must be an opaque relative key');
  }
  return value;
}

/**
 * This is deliberately structural validation only. The authoritative exact
 * hostname allowlist lives in PostgreSQL and is maintained outside the web
 * application role. Query strings/fragments/credentials are rejected so a
 * content row never becomes a signed-URL or tracking-token container.
 */
export function requireExternalImageUrl(value: unknown): string {
  const match = typeof value === 'string' ? value.match(IMAGE_URL_PATTERN) : null;
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    value.length < 12 ||
    value.length > 2048 ||
    !match ||
    // Invariant: `!match` above already returned when match is null, so
    // match[1] is the hostname capture group IMAGE_URL_PATTERN's single
    // top-level group always produces on a successful match.
    (match[1] as string).split('.').every((label) => /^\d+$/.test(label)) ||
    /%(?![0-9A-Fa-f]{2})/.test(value)
  ) {
    throw new ContentInputError('external image URL must be a strict HTTPS URL');
  }
  return value;
}

function optionalRequestId(value: unknown): string | null {
  return optionalContentUuid(value, 'request id');
}

/** public.content_list_published_announcements RETURNS TABLE: packages/database/migrations/013-content-and-status.sql */
export interface ContentAnnouncementRow {
  readonly announcement_id: string;
  readonly title: string;
  readonly body: string;
  readonly published_at: unknown;
}

/** public.content_list_published_photos RETURNS TABLE: packages/database/migrations/013-content-and-status.sql */
export interface ContentPhotoRow {
  readonly photo_id: string;
  readonly image_url: string;
  readonly alt_text: string;
  readonly published_at: unknown;
}

/** public.content_public_status RETURNS TABLE: packages/database/migrations/013-content-and-status.sql */
export interface ContentStatusRow {
  readonly source_key: string;
  readonly display_name: string;
  readonly state: string;
  readonly detail: string | null;
  readonly observed_at: unknown;
}

// content-service.js re-validates every receipt field, so these stay
// `unknown` to match that defensive intent rather than asserting the
// database is already trusted.
export interface ContentAnnouncementReceiptRow {
  readonly announcement_id?: unknown;
  readonly published_at?: unknown;
  readonly replayed?: unknown;
}

export interface ContentPhotoReceiptRow {
  readonly photo_id?: unknown;
  readonly published_at?: unknown;
  readonly replayed?: unknown;
}

export interface ContentSaveAnnouncementInput {
  readonly actorUserId: unknown;
  readonly announcementId?: unknown;
  readonly title: unknown;
  readonly body: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSetAnnouncementPublicationInput {
  readonly actorUserId: unknown;
  readonly announcementId: unknown;
  readonly publish: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSavePhotoInput {
  readonly actorUserId: unknown;
  readonly photoId?: unknown;
  readonly storageKey: unknown;
  readonly imageUrl: unknown;
  readonly altText: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSetPhotoPublicationInput {
  readonly actorUserId: unknown;
  readonly photoId: unknown;
  readonly publish: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

/**
 * Database gateway for publication content.  It intentionally has no table
 * SQL and no status-writer method: public reads and editorial changes use
 * SECURITY DEFINER functions, while status ingestion stays outside the web
 * application's database role.
 */
@Injectable()
export class PostgresContentRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async publishedAnnouncements({ limit = 20 }: { limit?: number } = {}): Promise<
    ContentAnnouncementRow[]
  > {
    const contentLimit = requireContentLimit(limit, 'announcement limit');
    const { rows } = await this.pool.query<ContentAnnouncementRow>(
      `SELECT announcement_id::text AS announcement_id, title, body, published_at
       FROM public.content_list_published_announcements($1)`,
      [contentLimit],
    );
    return rows;
  }

  async publishedPhotos({ limit = 24 }: { limit?: number } = {}): Promise<ContentPhotoRow[]> {
    const contentLimit = requireContentLimit(limit, 'photo limit');
    const { rows } = await this.pool.query<ContentPhotoRow>(
      `SELECT photo_id::text AS photo_id, image_url, alt_text, published_at
       FROM public.content_list_published_photos($1)`,
      [contentLimit],
    );
    return rows;
  }

  async isPublicStorageKey(storageKey: unknown): Promise<boolean> {
    const key = requireContentStorageKey(storageKey);
    const {
      rows: [row],
    } = await this.pool.query<{ is_public: unknown }>(
      'SELECT public.content_is_public_storage_key($1) AS is_public',
      [key],
    );
    return row?.is_public === true;
  }

  async publicStatus(): Promise<ContentStatusRow[]> {
    const { rows } = await this.pool.query<ContentStatusRow>(
      `SELECT source_key, display_name, state, detail, observed_at
       FROM public.content_public_status()`,
    );
    return rows;
  }

  async saveAnnouncement({
    actorUserId,
    announcementId = null,
    title,
    body,
    idempotencyKey,
    requestId = null,
  }: ContentSaveAnnouncementInput): Promise<ContentAnnouncementReceiptRow> {
    const actor = requireContentUuid(actorUserId, 'authenticated operator id');
    const id = optionalContentUuid(announcementId, 'announcement id');
    const commandTitle = normalizeContentText(title, 'title', 160);
    const commandBody = normalizeContentText(body, 'body', 12_000, { multiline: true });
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalRequestId(requestId);
    const {
      rows: [row],
    } = await this.pool.query<ContentAnnouncementReceiptRow>(
      `SELECT announcement_id::text AS announcement_id, published_at, replayed
       FROM public.content_save_announcement($1, $2, $3, $4, $5, $6)`,
      [actor, id, commandTitle, commandBody, key, correlationId],
    );
    if (!row?.announcement_id || typeof row.replayed !== 'boolean') {
      throw new Error('database did not return an announcement receipt');
    }
    return row;
  }

  async setAnnouncementPublication({
    actorUserId,
    announcementId,
    publish,
    idempotencyKey,
    requestId = null,
  }: ContentSetAnnouncementPublicationInput): Promise<ContentAnnouncementReceiptRow> {
    const actor = requireContentUuid(actorUserId, 'authenticated operator id');
    const id = requireContentUuid(announcementId, 'announcement id');
    if (typeof publish !== 'boolean') throw new ContentInputError('publish must be boolean');
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalRequestId(requestId);
    const {
      rows: [row],
    } = await this.pool.query<ContentAnnouncementReceiptRow>(
      `SELECT announcement_id::text AS announcement_id, published_at, replayed
       FROM public.content_set_announcement_publication($1, $2, $3, $4, $5)`,
      [actor, id, publish, key, correlationId],
    );
    if (!row?.announcement_id || typeof row.replayed !== 'boolean') {
      throw new Error('database did not return an announcement publication receipt');
    }
    return row;
  }

  async savePhoto({
    actorUserId,
    photoId = null,
    storageKey,
    imageUrl,
    altText,
    idempotencyKey,
    requestId = null,
  }: ContentSavePhotoInput): Promise<ContentPhotoReceiptRow> {
    const actor = requireContentUuid(actorUserId, 'authenticated operator id');
    const id = optionalContentUuid(photoId, 'photo id');
    const key = requireContentStorageKey(storageKey);
    const url = requireExternalImageUrl(imageUrl);
    const alt = normalizeContentText(altText, 'alt text', 300);
    const commandKey = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalRequestId(requestId);
    const {
      rows: [row],
    } = await this.pool.query<ContentPhotoReceiptRow>(
      `SELECT photo_id::text AS photo_id, published_at, replayed
       FROM public.content_save_photo($1, $2, $3, $4, $5, $6, $7)`,
      [actor, id, key, url, alt, commandKey, correlationId],
    );
    if (!row?.photo_id || typeof row.replayed !== 'boolean') {
      throw new Error('database did not return a photo receipt');
    }
    return row;
  }

  async setPhotoPublication({
    actorUserId,
    photoId,
    publish,
    idempotencyKey,
    requestId = null,
  }: ContentSetPhotoPublicationInput): Promise<ContentPhotoReceiptRow> {
    const actor = requireContentUuid(actorUserId, 'authenticated operator id');
    const id = requireContentUuid(photoId, 'photo id');
    if (typeof publish !== 'boolean') throw new ContentInputError('publish must be boolean');
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalRequestId(requestId);
    const {
      rows: [row],
    } = await this.pool.query<ContentPhotoReceiptRow>(
      `SELECT photo_id::text AS photo_id, published_at, replayed
       FROM public.content_set_photo_publication($1, $2, $3, $4, $5)`,
      [actor, id, publish, key, correlationId],
    );
    if (!row?.photo_id || typeof row.replayed !== 'boolean') {
      throw new Error('database did not return a photo publication receipt');
    }
    return row;
  }
}
