import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const BOT_BROADCAST_URL = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';
const MAX_BODY_BYTES = 16 * 1024;
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
} as const;

function reply(payload: Record<string, unknown>, status: number) {
  return NextResponse.json(payload, { status, headers: PRIVATE_HEADERS });
}

function internalCredential(): string | null {
  const candidate = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  // A missing or weak environment secret must never silently become a public credential.
  return candidate && candidate.length >= 32 && candidate.length <= 512 ? candidate : null;
}

function validSecret(provided: string | null, expected: string | null): boolean {
  if (!provided || !expected) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function authorized(req: Request, secret: string | null): Promise<boolean> {
  const supplied = req.headers.get('x-internal-secret') ??
    req.headers.get('x-cron-secret') ??
    req.headers.get('authorization')?.replace(/^Bearer /, '') ?? null;
  if (supplied !== null) return validSecret(supplied, secret);

  const origin = req.headers.get('origin');
  const fetchSite = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin ||
      (fetchSite !== null && fetchSite !== 'same-origin' && fetchSite !== 'none')) return false;
  return isAdministrator(await currentViewer());
}

interface BroadcastField { readonly name: string; readonly value: string; readonly inline?: boolean }
interface BroadcastPayload {
  readonly title: string;
  readonly description?: string;
  readonly fields?: readonly BroadcastField[];
  readonly color?: number;
  readonly type?: string;
  readonly notifyAdminDm?: boolean;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function boundedText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 &&
    value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
}

function parseBroadcast(value: unknown): BroadcastPayload | null {
  if (!record(value) || !boundedText(value.title, 256)) return null;
  if (value.description !== undefined &&
      (typeof value.description !== 'string' || value.description.length > 4096 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value.description))) return null;
  if (value.type !== undefined &&
      (typeof value.type !== 'string' || !/^[A-Za-z0-9_.:-]{1,80}$/.test(value.type))) return null;
  if (value.color !== undefined &&
      (typeof value.color !== 'number' || !Number.isInteger(value.color) ||
        value.color < 0 || value.color > 0xffffff)) return null;
  if (value.notifyAdminDm !== undefined && typeof value.notifyAdminDm !== 'boolean') return null;
  if (value.fields !== undefined &&
      (!Array.isArray(value.fields) || value.fields.length > 25 ||
        !value.fields.every((field: unknown) =>
          record(field) && boundedText(field.name, 256) && boundedText(field.value, 1024) &&
          (field.inline === undefined || typeof field.inline === 'boolean')))) return null;
  return {
    title: value.title,
    ...(value.description !== undefined ? { description: value.description as string } : {}),
    ...(value.type !== undefined ? { type: value.type as string } : {}),
    ...(value.color !== undefined ? { color: value.color as number } : {}),
    ...(value.notifyAdminDm !== undefined ? { notifyAdminDm: value.notifyAdminDm as boolean } : {}),
    ...(value.fields !== undefined ? {
      fields: (value.fields as Record<string, unknown>[]).map((field) => ({
        name: field.name as string, value: field.value as string,
        ...(field.inline !== undefined ? { inline: field.inline as boolean } : {}),
      })),
    } : {}),
  };
}

async function limitedJson(req: Request): Promise<unknown> {
  if (req.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    throw new Error('INVALID_JSON');
  }
  const contentLength = req.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) throw new Error('TOO_LARGE');
  const reader = req.body?.getReader();
  if (!reader) throw new Error('INVALID_JSON');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error('TOO_LARGE');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof Error && error.message === 'TOO_LARGE') throw error;
    throw new Error('INVALID_JSON');
  } finally {
    reader.releaseLock();
  }
}

export async function POST(req: Request) {
  try {
    const secret = internalCredential();
    if (!(await authorized(req, secret))) {
      return reply({ ok: false, deliveredToBot: false, error: 'Broadcast authorization required' }, 403);
    }
    if (!secret) {
      return reply({ ok: false, deliveredToBot: false, error: 'Broadcast transport is not configured' }, 503);
    }

    let input: unknown;
    try {
      input = await limitedJson(req);
    } catch (error) {
      return reply({ ok: false, deliveredToBot: false, error: 'Invalid broadcast request' },
        error instanceof Error && error.message === 'TOO_LARGE' ? 413 : 400);
    }
    const payload = parseBroadcast(input);
    if (!payload) {
      return reply({ ok: false, deliveredToBot: false, error: 'Invalid broadcast payload' }, 400);
    }

    try {
      const botResponse = await fetch(BOT_BROADCAST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500),
        cache: 'no-store',
      });
      const receipt: unknown = await botResponse.json().catch(() => null);
      if (!botResponse.ok || !record(receipt) || receipt.ok !== true ||
          receipt.status !== 'Broadcast sent to Discord') {
        return reply({ ok: false, deliveredToBot: false, error: 'Bot acceptance not verified' }, 502);
      }
      // This proves bot acceptance, not a downstream Discord delivery receipt.
      return reply({ ok: true, deliveredToBot: true, status: 'Bot accepted broadcast' }, 200);
    } catch {
      return reply({ ok: false, deliveredToBot: false, error: 'Broadcast bot unavailable' }, 503);
    }
  } catch {
    return reply({ ok: false, deliveredToBot: false, error: 'Broadcast gateway unavailable' }, 503);
  }
}
