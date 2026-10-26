import type { NextFunction, Request, Response } from 'express';
import { gzipSync, deflateSync } from 'zlib';

const MIN_COMPRESSION_SIZE = 1024; // 1KB threshold

const COMPRESSIBLE_TYPES = [
  'application/json',
  'text/html',
  'text/plain',
  'text/css',
  'application/javascript',
  'application/xml',
  'image/svg+xml',
];


// Explicit q=0 refusals take precedence over wildcard preferences. A substring
// check would compress for clients that explicitly cannot decode the result.
function acceptedQuality(header: string, coding: string): number {
  let explicit: number | undefined;
  let wildcard: number | undefined;
  for (const entry of header.split(',')) {
    const [rawName, ...parameters] = entry.trim().split(';');
    const name = rawName?.trim().toLowerCase();
    if (name !== coding && name !== '*') continue;

    let quality = 1;
    for (const parameter of parameters) {
      const match = /^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i.exec(parameter.trim());
      if (!match) { quality = 0; break; }
      quality = Number(match[1]);
    }
    // Conflicting duplicate entries fail toward the least permissive value.
    if (name === coding) explicit = Math.min(explicit ?? 1, quality);
    else wildcard = Math.min(wildcard ?? 1, quality);
  }
  return explicit ?? wildcard ?? 0;
}

function varyOnEncoding(response: Response): void {
  const existing = response.getHeader('Vary');
  const current = Array.isArray(existing) ? existing.join(', ') : String(existing ?? '');
  const tokens = current.split(',').map((token) => token.trim());
  if (tokens.some((token) => token === '*' || token.toLowerCase() === 'accept-encoding')) return;
  response.setHeader('Vary', current ? `${current}, Accept-Encoding` : 'Accept-Encoding');
}

/**
 * High-performance, zero-external-dependency HTTP Response Compression Middleware.
 * Compresses JSON, text, and SVG payloads > 1KB using Node.js standard zlib.
 */
export function responseCompression() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding || typeof acceptEncoding !== 'string') {
      return next();
    }

    const gzipQuality = acceptedQuality(acceptEncoding, 'gzip');
    const deflateQuality = acceptedQuality(acceptEncoding, 'deflate');

    if (gzipQuality <= 0 && deflateQuality <= 0) {
      return next();
    }

    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    // Override res.send to compress buffer/string payloads
    res.send = (body?: unknown): Response => {
      // Restore methods to avoid recursion
      res.send = originalSend;
      res.json = originalJson;

      if (!body || req.method === 'HEAD' || res.statusCode === 204 || res.statusCode === 304) {
        return originalSend(body);
      }

      // Check if already encoded
      if (res.getHeader('Content-Encoding')) {
        return originalSend(body);
      }

      let buffer: Buffer;
      if (Buffer.isBuffer(body)) {
        buffer = body;
      } else if (typeof body === 'string') {
        buffer = Buffer.from(body, 'utf8');
      } else {
        return originalSend(body);
      }

      if (buffer.length < MIN_COMPRESSION_SIZE) {
        return originalSend(body);
      }

      const contentType = String(res.getHeader('Content-Type') || '');
      const isCompressible = COMPRESSIBLE_TYPES.some((type) => contentType.includes(type)) || !contentType;

      if (!isCompressible) {
        return originalSend(body);
      }

      try {
        if (gzipQuality > 0 && gzipQuality >= deflateQuality) {
          const compressed = gzipSync(buffer, { level: 6 });
          res.setHeader('Content-Encoding', 'gzip');
          varyOnEncoding(res);
          res.removeHeader('Content-Length');
          return originalSend(compressed);
        } else if (deflateQuality > 0) {
          const compressed = deflateSync(buffer, { level: 6 });
          res.setHeader('Content-Encoding', 'deflate');
          varyOnEncoding(res);
          res.removeHeader('Content-Length');
          return originalSend(compressed);
        }
      } catch {
        // Fallback to uncompressed on compression failure
        return originalSend(body);
      }

      return originalSend(body);
    };

    // Override res.json to route through res.send with application/json
    res.json = (body?: unknown): Response => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.send(JSON.stringify(body));
    };

    next();
  };
}
