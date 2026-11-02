import { createHash, timingSafeEqual } from 'node:crypto';

const MAX_BODY_BYTES = 16 * 1024;
const PRIVATE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex',
};

export function validBroadcastSecret(secret) {
  return typeof secret === 'string' && Buffer.byteLength(secret, 'utf8') >= 32
    && Buffer.byteLength(secret, 'utf8') <= 512 && !/[\r\n]/.test(secret);
}

function authorized(presented, expected) {
  if (!validBroadcastSecret(expected) || typeof presented !== 'string'
      || Buffer.byteLength(presented, 'utf8') > 512) return false;
  // Hash before comparing: timingSafeEqual must never be fed attacker-chosen lengths.
  const actualHash = createHash('sha256').update(presented).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

function hasForbiddenControl(text, allowWhitespace = false) {
  for (const character of text) {
    const code = character.charCodeAt(0);
    if (code === 127 || (code < 32 && !(allowWhitespace && [9, 10, 13].includes(code)))) return true;
  }
  return false;
}

function parsePayload(body) {
  const value = JSON.parse(body);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('invalid broadcast body');
  const { title, description = '', fields = [], color = 0x10b981, notifyAdminDm = false } = value;
  if (typeof title !== 'string' || title.trim().length < 1 || title.length > 256
      || hasForbiddenControl(title)
      || typeof description !== 'string' || description.length > 4096
      || hasForbiddenControl(description, true)
      || !Array.isArray(fields) || fields.length > 25
      || !Number.isInteger(color) || color < 0 || color > 0xffffff
      || typeof notifyAdminDm !== 'boolean') throw Error('invalid broadcast fields');
  if (!fields.every(f => f && typeof f === 'object' && !Array.isArray(f)
      && typeof f.name === 'string' && f.name.trim().length > 0 && f.name.length <= 256
      && !hasForbiddenControl(f.name)
      && typeof f.value === 'string' && f.value.trim().length > 0 && f.value.length <= 1024
      && !hasForbiddenControl(f.value, true)
      && (f.inline === undefined || typeof f.inline === 'boolean'))) {
    throw Error('invalid broadcast field');
  }
  const totalEmbedText = title.length + description.length
    + fields.reduce((total, field) => total + field.name.length + field.value.length, 0);
  if (totalEmbedText > 6000) throw Error('Discord embed exceeds total character limit');
  return { title, description, fields: fields.map(f => ({
    name: f.name, value: f.value, inline: f.inline ?? true,
  })), color, notifyAdminDm };
}

function respond(res, status, body) {
  res.writeHead(status, PRIVATE_HEADERS);
  res.end(JSON.stringify(body));
}

/**
 * Loopback is not an authorization boundary. This handler is safe to run with
 * an unavailable secret: it refuses every broadcast before reading the body.
 * A successful response certifies channel.send() resolution only, not recipient delivery.
 */
export function createBroadcastWebhookHandler({ secret, sendChannel, sendAdminDm = async () => false }) {
  return async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/broadcast') {
      respond(res, 404, { ok: false, error: 'Not found' });
      return;
    }
    if (!validBroadcastSecret(secret)) {
      respond(res, 503, { ok: false, error: 'Broadcast authentication unavailable' });
      return;
    }
    if (!authorized(req.headers['x-internal-secret'], secret)) {
      respond(res, 403, { ok: false, error: 'Forbidden' });
      return;
    }
    const declaredLength = Number(req.headers['content-length']);
    if (req.headers['content-length'] && (!Number.isSafeInteger(declaredLength) || declaredLength > MAX_BODY_BYTES)) {
      respond(res, 413, { ok: false, error: 'Broadcast body too large' });
      return;
    }
    const chunks = [];
    let bytes = 0;
    let tooLarge = false;
    try {
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) { tooLarge = true; continue; }
        chunks.push(chunk);
      }
    } catch {
      if (!res.headersSent) respond(res, 400, { ok: false, error: 'Invalid request body' });
      return;
    }
    if (tooLarge) {
      respond(res, 413, { ok: false, error: 'Broadcast body too large' });
      return;
    }
    let payload;
    try { payload = parsePayload(Buffer.concat(chunks).toString('utf8')); }
    catch {
      respond(res, 400, { ok: false, error: 'Invalid broadcast payload' });
      return;
    }
    try {
      const accepted = await sendChannel(payload);
      if (accepted !== true) {
        respond(res, 503, { ok: false, error: 'Discord channel delivery unverified' });
        return;
      }
      let adminDmSent = null;
      if (payload.notifyAdminDm) {
        try { adminDmSent = (await sendAdminDm(payload)) === true; }
        catch { adminDmSent = false; }
      }
      respond(res, 200, { ok: true, status: 'Broadcast sent to Discord', acceptedByDiscord: true, adminDmSent });
    } catch {
      respond(res, 503, { ok: false, error: 'Discord channel delivery unverified' });
    }
  };
}
