import { Injectable } from '@nestjs/common';
import type {
  ContentAnnouncementReceiptRow,
  ContentAnnouncementRow,
  ContentPhotoReceiptRow,
  ContentPhotoRow,
  ContentSaveAnnouncementInput,
  ContentSavePhotoInput,
  ContentSetAnnouncementImageInput,
  ContentSetAnnouncementPublicationInput,
  ContentSetPhotoPublicationInput,
  ContentStatusRow,
  PendingPhotoRow,
  AdminAnnouncementRow,
} from './content.repository';
import {
  ContentInputError,
  PostgresContentRepository,
  normalizeContentText,
  optionalContentUuid,
  requireContentLimit,
  requireContentStorageKey,
  requireContentUuid,
  requireExternalImageUrl,
} from './content.repository';

const STATUS_STATES = new Set(['operational', 'degraded', 'outage', 'maintenance', 'unknown']);
const SOURCE_KEY_PATTERN = /^[a-z][a-z0-9_-]{2,63}$/;

function timestamp(
  value: unknown,
  field: string,
  { nullable = false }: { nullable?: boolean } = {},
): string | null {
  if (nullable && (value === null || value === undefined)) return null;
  // Invariant: this reproduces the exact runtime coercion `new Date(value)`
  // always had in the pre-conversion JavaScript. The Number.isNaN check
  // immediately below rejects anything Date can't interpret, so widening
  // the parameter type here does not let bad data reach a caller unchecked.
  const parsed = value instanceof Date ? value : new Date(value as string | number | Date);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`database returned an invalid ${field}`);
  return parsed.toISOString();
}

function databasePlainText(
  value: unknown,
  field: string,
  maxLength: number,
  options: { multiline?: boolean } = {},
): string {
  let normalized: string;
  try {
    normalized = normalizeContentText(value, field, maxLength, options);
  } catch {
    throw new Error(`database returned unsafe ${field}`);
  }
  if (normalized !== value) throw new Error(`database returned noncanonical ${field}`);
  return normalized;
}

function receiptId<K extends string>(row: { readonly [P in K]?: unknown }, field: K): string {
  return requireContentUuid(row[field], `database ${field.replace(/_/g, ' ')}`);
}

export interface ContentAnnouncement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly isPinned: boolean;
  readonly publishedAt: string | null;
}

function normalizeAnnouncement(row: ContentAnnouncementRow): ContentAnnouncement {
  return {
    announcementId: receiptId(row, 'announcement_id'),
    title: databasePlainText(row?.title, 'announcement title', 160),
    body: databasePlainText(row?.body, 'announcement body', 12_000, { multiline: true }),
    imageUrl:
      row?.image_url === null
        ? null
        : String(row.image_url).startsWith('/media/')
          ? String(row.image_url)
          : (() => {
              throw new Error('database returned an unsafe announcement image URL');
            })(),
    imageAltText:
      row?.image_alt_text === null
        ? null
        : databasePlainText(row.image_alt_text, 'announcement image alt text', 300),
    isPinned: Boolean(row?.is_pinned),
    publishedAt: timestamp(row?.published_at, 'announcement published timestamp'),
  };
}

export interface ContentPhoto {
  readonly photoId: string;
  readonly imageUrl: string;
  readonly altText: string;
  readonly publishedAt: string | null;
}

function normalizePhoto(row: ContentPhotoRow): ContentPhoto {
  let imageUrl: string;
  if (
    typeof row?.image_url === 'string' &&
    /^\/media\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(row.image_url)
  ) {
    imageUrl = row.image_url;
  } else {
    try {
      imageUrl = requireExternalImageUrl(row?.image_url);
    } catch {
      throw new Error('database returned an unsafe photo image URL');
    }
  }
  return {
    photoId: receiptId(row, 'photo_id'),
    imageUrl,
    altText: databasePlainText(row?.alt_text, 'photo alt text', 300),
    publishedAt: timestamp(row?.published_at, 'photo published timestamp'),
  };
}

export interface ContentStatus {
  readonly sourceKey: string;
  readonly displayName: string;
  readonly state: string;
  readonly detail: string | null;
  readonly observedAt: string | null;
}

function normalizeStatus(row: ContentStatusRow): ContentStatus {
  const sourceKey = String(row?.source_key ?? '');
  if (!SOURCE_KEY_PATTERN.test(sourceKey))
    throw new Error('database returned an invalid status source');
  const state = String(row?.state ?? '');
  if (!STATUS_STATES.has(state)) throw new Error('database returned an invalid status state');
  const detail =
    row?.detail === null || row?.detail === undefined
      ? null
      : databasePlainText(row.detail, 'status detail', 280);
  const observedAt = timestamp(row?.observed_at, 'status observed timestamp', { nullable: true });
  if ((state === 'unknown') !== (observedAt === null)) {
    throw new Error('database returned an inconsistent status snapshot');
  }
  return {
    sourceKey,
    displayName: databasePlainText(row?.display_name, 'status display name', 80),
    state,
    detail,
    observedAt,
  };
}

export interface ContentAnnouncementReceipt {
  readonly announcementId: string;
  readonly publishedAt: string | null;
  readonly replayed: boolean;
}

function normalizeAnnouncementReceipt(
  row: ContentAnnouncementReceiptRow,
): ContentAnnouncementReceipt {
  if (typeof row?.replayed !== 'boolean')
    throw new Error('database returned an invalid announcement receipt');
  return {
    announcementId: receiptId(row, 'announcement_id'),
    publishedAt: timestamp(row?.published_at, 'announcement published timestamp', {
      nullable: true,
    }),
    replayed: row.replayed,
  };
}

export interface ContentPhotoReceipt {
  readonly photoId: string;
  readonly publishedAt: string | null;
  readonly replayed: boolean;
}

function normalizePhotoReceipt(row: ContentPhotoReceiptRow): ContentPhotoReceipt {
  if (typeof row?.replayed !== 'boolean')
    throw new Error('database returned an invalid photo receipt');
  return {
    photoId: receiptId(row, 'photo_id'),
    publishedAt: timestamp(row?.published_at, 'photo published timestamp', { nullable: true }),
    replayed: row.replayed,
  };
}

/**
 * The subset of the repository the service depends on. `PostgresContentRepository`
 * satisfies this structurally; the constructor also accepts any object shaped
 * like it (see the runtime duck-typing check below, kept for callers outside
 * this module's static type checking).
 */
export interface ContentRepositoryLike {
  publishedAnnouncements(options?: { limit?: number }): Promise<ContentAnnouncementRow[]>;
  publishedPhotos(options?: { limit?: number }): Promise<ContentPhotoRow[]>;
  isPublicStorageKey(storageKey: unknown): Promise<boolean>;
  publicStatus(): Promise<ContentStatusRow[]>;
  saveAnnouncement(input: ContentSaveAnnouncementInput): Promise<ContentAnnouncementReceiptRow>;
  setAnnouncementImage(
    input: ContentSetAnnouncementImageInput,
  ): Promise<ContentAnnouncementReceiptRow>;
  setAnnouncementPublication(
    input: ContentSetAnnouncementPublicationInput,
  ): Promise<ContentAnnouncementReceiptRow>;
  savePhoto(input: ContentSavePhotoInput): Promise<ContentPhotoReceiptRow>;
  setPhotoPublication(input: ContentSetPhotoPublicationInput): Promise<ContentPhotoReceiptRow>;
  adminListPendingPhotos(actorUserId: unknown, limit?: number): Promise<readonly PendingPhotoRow[]>;
  adminListAllPhotos(
    actorUserId: unknown,
  ): Promise<readonly import('./content.repository').AdminPhotoRow[]>;
  adminDeletePhoto(actorUserId: unknown, photoId: unknown): Promise<string | null>;
  adminRejectPhoto(actorUserId: unknown, photoId: unknown, reason?: unknown): Promise<boolean>;
  adminListAllAnnouncements(actorUserId: unknown): Promise<readonly AdminAnnouncementRow[]>;
  adminDeleteAnnouncement(actorUserId: unknown, announcementId: unknown): Promise<boolean>;
  adminUpdateAnnouncement(input: {
    actorUserId: unknown;
    announcementId: unknown;
    title: unknown;
    body: unknown;
    isPinned?: unknown;
    contentState?: unknown;
  }): Promise<AdminAnnouncementRow>;
}

export interface ContentSaveAnnouncementDto {
  readonly announcementId?: unknown;
  readonly title: unknown;
  readonly body: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSetAnnouncementImageDto {
  readonly announcementId: unknown;
  readonly storageKey: unknown;
  readonly altText: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSetAnnouncementPublicationDto {
  readonly announcementId: unknown;
  readonly publish: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSavePhotoDto {
  readonly photoId?: unknown;
  readonly storageKey: unknown;
  readonly imageUrl: unknown;
  readonly altText: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

export interface ContentSetPhotoPublicationDto {
  readonly photoId: unknown;
  readonly publish: unknown;
  readonly idempotencyKey: unknown;
  readonly requestId?: unknown;
}

/**
 * Content use cases. Public methods expose no drafts, storage keys, uploader
 * identities, host allowlist, or status write operation. Administrative
 * methods receive their actor only as a separate authenticated-session
 * argument, never from a request DTO.
 */
@Injectable()
export class ContentService {
  readonly repository: ContentRepositoryLike;

  constructor(repository: ContentRepositoryLike) {
    const methods: readonly (keyof ContentRepositoryLike)[] = [
      'publishedAnnouncements',
      'publishedPhotos',
      'publicStatus',
      'saveAnnouncement',
      'setAnnouncementImage',
      'setAnnouncementPublication',
      'savePhoto',
      'setPhotoPublication',
      'adminListPendingPhotos',
      'adminListAllPhotos',
      'adminDeletePhoto',
      'adminRejectPhoto',
      'adminListAllAnnouncements',
      'adminDeleteAnnouncement',
    ];
    if (
      !(repository instanceof PostgresContentRepository) &&
      (!repository || !methods.every((method) => typeof repository[method] === 'function'))
    ) {
      throw new TypeError('a content repository is required');
    }
    this.repository = repository;
  }

  async publicAnnouncements({ limit = 20 }: { limit?: number } = {}): Promise<
    ContentAnnouncement[]
  > {
    const contentLimit = requireContentLimit(limit, 'announcement limit');
    return (await this.repository.publishedAnnouncements({ limit: contentLimit })).map(
      normalizeAnnouncement,
    );
  }

  async publicPhotos({ limit = 24 }: { limit?: number } = {}): Promise<ContentPhoto[]> {
    const contentLimit = requireContentLimit(limit, 'photo limit');
    return (await this.repository.publishedPhotos({ limit: contentLimit })).map(normalizePhoto);
  }

  async isPublicStorageKey(storageKey: unknown): Promise<boolean> {
    return this.repository.isPublicStorageKey(storageKey);
  }

  async serviceStatus(): Promise<ContentStatus[]> {
    return (await this.repository.publicStatus()).map(normalizeStatus);
  }

  async publicPage({
    announcementLimit = 20,
    photoLimit = 24,
  }: { announcementLimit?: number; photoLimit?: number } = {}): Promise<{
    announcements: ContentAnnouncement[];
    photos: ContentPhoto[];
    status: ContentStatus[];
  }> {
    const announcementsLimit = requireContentLimit(announcementLimit, 'announcement limit');
    const photosLimit = requireContentLimit(photoLimit, 'photo limit');
    const [announcements, photos, status] = await Promise.all([
      this.publicAnnouncements({ limit: announcementsLimit }),
      this.publicPhotos({ limit: photosLimit }),
      this.serviceStatus(),
    ]);
    return { announcements, photos, status };
  }

  async saveAnnouncement(
    authenticatedOperatorId: unknown,
    {
      announcementId = null,
      title,
      body,
      idempotencyKey,
      requestId = null,
    }: ContentSaveAnnouncementDto,
  ): Promise<ContentAnnouncementReceipt> {
    const actorUserId = requireContentUuid(authenticatedOperatorId, 'authenticated operator id');
    const id = optionalContentUuid(announcementId, 'announcement id');
    const normalizedTitle = normalizeContentText(title, 'title', 160);
    const normalizedBody = normalizeContentText(body, 'body', 12_000, { multiline: true });
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalContentUuid(requestId, 'request id');
    return normalizeAnnouncementReceipt(
      await this.repository.saveAnnouncement({
        actorUserId,
        announcementId: id,
        title: normalizedTitle,
        body: normalizedBody,
        idempotencyKey: key,
        requestId: correlationId,
      }),
    );
  }

  async setAnnouncementImage(
    authenticatedOperatorId: unknown,
    {
      announcementId,
      storageKey,
      altText,
      idempotencyKey,
      requestId = null,
    }: ContentSetAnnouncementImageDto,
  ): Promise<ContentAnnouncementReceipt> {
    const actorUserId = requireContentUuid(authenticatedOperatorId, 'authenticated operator id');
    return normalizeAnnouncementReceipt(
      await this.repository.setAnnouncementImage({
        actorUserId,
        announcementId: requireContentUuid(announcementId, 'announcement id'),
        storageKey: requireContentStorageKey(storageKey),
        altText: normalizeContentText(altText, 'alt text', 300),
        idempotencyKey: requireContentUuid(idempotencyKey, 'idempotency key'),
        requestId: optionalContentUuid(requestId, 'request id'),
      }),
    );
  }

  async setAnnouncementPublication(
    authenticatedOperatorId: unknown,
    {
      announcementId,
      publish,
      idempotencyKey,
      requestId = null,
    }: ContentSetAnnouncementPublicationDto,
  ): Promise<ContentAnnouncementReceipt> {
    const actorUserId = requireContentUuid(authenticatedOperatorId, 'authenticated operator id');
    const id = requireContentUuid(announcementId, 'announcement id');
    if (typeof publish !== 'boolean') throw new ContentInputError('publish must be boolean');
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalContentUuid(requestId, 'request id');
    return normalizeAnnouncementReceipt(
      await this.repository.setAnnouncementPublication({
        actorUserId,
        announcementId: id,
        publish,
        idempotencyKey: key,
        requestId: correlationId,
      }),
    );
  }

  async savePhoto(
    authenticatedOperatorId: unknown,
    {
      photoId = null,
      storageKey,
      imageUrl,
      altText,
      idempotencyKey,
      requestId = null,
    }: ContentSavePhotoDto,
  ): Promise<ContentPhotoReceipt> {
    const actorUserId = requireContentUuid(authenticatedOperatorId, 'authenticated operator id');
    const id = optionalContentUuid(photoId, 'photo id');
    const safeStorageKey = requireContentStorageKey(storageKey);
    const safeImageUrl = requireExternalImageUrl(imageUrl);
    const safeAltText = normalizeContentText(altText, 'alt text', 300);
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalContentUuid(requestId, 'request id');
    return normalizePhotoReceipt(
      await this.repository.savePhoto({
        actorUserId,
        photoId: id,
        storageKey: safeStorageKey,
        imageUrl: safeImageUrl,
        altText: safeAltText,
        idempotencyKey: key,
        requestId: correlationId,
      }),
    );
  }

  async setPhotoPublication(
    authenticatedOperatorId: unknown,
    { photoId, publish, idempotencyKey, requestId = null }: ContentSetPhotoPublicationDto,
  ): Promise<ContentPhotoReceipt> {
    const actorUserId = requireContentUuid(authenticatedOperatorId, 'authenticated operator id');
    const id = requireContentUuid(photoId, 'photo id');
    if (typeof publish !== 'boolean') throw new ContentInputError('publish must be boolean');
    const key = requireContentUuid(idempotencyKey, 'idempotency key');
    const correlationId = optionalContentUuid(requestId, 'request id');
    return normalizePhotoReceipt(
      await this.repository.setPhotoPublication({
        actorUserId,
        photoId: id,
        publish,
        idempotencyKey: key,
        requestId: correlationId,
      }),
    );
  }

  async listPendingPhotos(
    authenticatedOperatorId: unknown,
    limit = 50,
  ): Promise<readonly PendingPhotoRow[]> {
    return this.repository.adminListPendingPhotos(authenticatedOperatorId, limit);
  }

  async listAllPhotos(authenticatedOperatorId: unknown) {
    return this.repository.adminListAllPhotos(authenticatedOperatorId);
  }

  async deletePhoto(authenticatedOperatorId: unknown, photoId: unknown) {
    return { storageKey: await this.repository.adminDeletePhoto(authenticatedOperatorId, photoId) };
  }

  async adminListAllAnnouncements(authenticatedOperatorId: unknown) {
    const rows = await this.repository.adminListAllAnnouncements(authenticatedOperatorId);
    return rows.map((r) => ({
      announcementId: r.announcement_id,
      title: r.title,
      body: r.body,
      contentState: r.content_state,
      isPinned: Boolean(r.is_pinned),
      publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  }

  async adminUpdateAnnouncement(
    authenticatedOperatorId: unknown,
    announcementId: unknown,
    {
      title,
      body,
      isPinned,
      contentState,
    }: { title: unknown; body: unknown; isPinned?: unknown; contentState?: unknown },
  ) {
    const actorUserId = requireContentUuid(authenticatedOperatorId, 'authenticated operator id');
    const id = requireContentUuid(announcementId, 'announcement id');
    const row = await this.repository.adminUpdateAnnouncement({
      actorUserId,
      announcementId: id,
      title,
      body,
      isPinned,
      contentState,
    });
    return {
      announcementId: row.announcement_id,
      title: row.title,
      body: row.body,
      contentState: row.content_state,
      isPinned: Boolean(row.is_pinned),
      publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async adminDeleteAnnouncement(
    authenticatedOperatorId: unknown,
    announcementId: unknown,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.repository.adminDeleteAnnouncement(
      authenticatedOperatorId,
      announcementId,
    );
    return { deleted };
  }

  async rejectPhoto(
    authenticatedOperatorId: unknown,
    photoId: unknown,
    reason?: unknown,
  ): Promise<{ rejected: boolean }> {
    const rejected = await this.repository.adminRejectPhoto(
      authenticatedOperatorId,
      photoId,
      reason,
    );
    return { rejected };
  }
}

export { ContentInputError };
