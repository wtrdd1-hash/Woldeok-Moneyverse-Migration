import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { BadRequestException, ConflictException, GoneException, ServiceUnavailableException } from '@nestjs/common';
import { NOTIFICATION_CATEGORIES } from './notification.dto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_WINDOW_MS = 90 * 86_400_000;
const TTL_MS = 600_000;

export interface NotificationSearchInput {
  readonly query: string;
  readonly category?: string;
  readonly unreadOnly?: boolean;
  readonly fromUtc: string;
  readonly toUtc: string;
  readonly limit?: number;
  readonly cursor?: string;
}
export interface NormalizedNotificationSearch {
  readonly query: string;
  readonly category: string | null;
  readonly unreadOnly: boolean;
  readonly fromUtc: string;
  readonly toUtc: string;
  readonly limit: number;
}
interface CursorPayload {
  readonly v: 1;
  readonly owner: string;
  readonly session: string;
  readonly filter: string;
  readonly asOf: string;
  readonly afterAt: string;
  readonly afterId: string;
  readonly issuedAt: number;
}

function timestamp(value: unknown): number {
  if (typeof value !== 'string' || !UTC.test(value)) throw new BadRequestException('Invalid UTC notification search date');
  const ms = Date.parse(value);
  if (!Number.isFinite(ms) || new Date(ms).toISOString() !== value) throw new BadRequestException('Invalid UTC notification search date');
  return ms;
}

export function validateNotificationSearch(input: NotificationSearchInput, now = new Date()): NormalizedNotificationSearch {
  if (!input || typeof input.query !== 'string') throw new BadRequestException('Invalid notification search query');
  const query = input.query.normalize('NFC').trim();
  if ([...query].length < 2 || [...query].length > 80 || /[\u0000-\u001f\u007f]/.test(query)) {
    throw new BadRequestException('Notification search query must contain 2 to 80 characters');
  }
  const from = timestamp(input.fromUtc);
  const to = timestamp(input.toUtc);
  if (from >= to || to - from > MAX_WINDOW_MS || to > now.getTime() + 86_400_000) {
    throw new BadRequestException('Notification search window is invalid');
  }
  if (input.category !== undefined && !NOTIFICATION_CATEGORIES.includes(input.category as (typeof NOTIFICATION_CATEGORIES)[number])) {
    throw new BadRequestException('Invalid notification category');
  }
  if (input.unreadOnly !== undefined && typeof input.unreadOnly !== 'boolean') throw new BadRequestException('Invalid unread filter');
  const limit = input.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new BadRequestException('Invalid notification search page size');
  if (input.cursor !== undefined && (typeof input.cursor !== 'string' || input.cursor.length > 2048)) {
    throw new BadRequestException('Invalid notification search cursor');
  }
  return { query, category: input.category ?? null, unreadOnly: input.unreadOnly === true, fromUtc: input.fromUtc, toUtc: input.toUtc, limit };
}

function signingKey(): string {
  const key = process.env.SESSION_CURRENT_KEY ?? process.env.SESSION_SIGNING_KEY;
  if (!key || key.length < 32) throw new ServiceUnavailableException('Notification search signing unavailable');
  return key;
}
function filterHash(filter: NormalizedNotificationSearch): string {
  return createHash('sha256').update(JSON.stringify(filter)).digest('hex');
}
function mac(body: string): Buffer {
  return createHmac('sha256', signingKey()).update(`notification-search-v1:${body}`).digest();
}
export function createNotificationSearchCursor(owner: string, session: string, filter: NormalizedNotificationSearch, asOf: string, afterAt: string, afterId: string, now = new Date()): string {
  const payload: CursorPayload = { v: 1, owner, session, filter: filterHash(filter), asOf, afterAt, afterId, issuedAt: Math.min(now.getTime(), Date.parse(asOf)) };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${mac(body).toString('base64url')}`;
}
export function parseNotificationSearchCursor(token: string, owner: string, session: string, filter: NormalizedNotificationSearch, now = new Date()): { asOf: string; afterAt: string; afterId: string } {
  if (typeof token !== 'string' || token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new BadRequestException('Invalid notification search cursor');
  }
  const [body, signature] = token.split('.');
  const actual = Buffer.from(signature!, 'base64url');
  const expected = mac(body!);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new BadRequestException('Invalid notification search cursor');
  let payload: CursorPayload;
  try { payload = JSON.parse(Buffer.from(body!, 'base64url').toString('utf8')) as CursorPayload; }
  catch { throw new BadRequestException('Invalid notification search cursor'); }
  if (payload.v !== 1 || payload.owner !== owner || payload.session !== session || payload.filter !== filterHash(filter)) {
    throw new ConflictException('Notification search cursor does not match the active session and filters');
  }
  if (!Number.isSafeInteger(payload.issuedAt) || now.getTime() < payload.issuedAt || now.getTime() - payload.issuedAt > TTL_MS) {
    throw new GoneException('Notification search cursor expired; restart the search');
  }
  const asOf = timestamp(payload.asOf);
  const after = timestamp(payload.afterAt);
  if (asOf > now.getTime() + 5000 || after > asOf || !UUID.test(payload.afterId)) {
    throw new BadRequestException('Invalid notification search cursor position');
  }
  return { asOf: payload.asOf, afterAt: payload.afterAt, afterId: payload.afterId };
}
