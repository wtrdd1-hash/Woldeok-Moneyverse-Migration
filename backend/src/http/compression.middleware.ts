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

    const acceptsGzip = acceptEncoding.includes('gzip');
    const acceptsDeflate = acceptEncoding.includes('deflate');

    if (!acceptsGzip && !acceptsDeflate) {
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
        if (acceptsGzip) {
          const compressed = gzipSync(buffer, { level: 6 });
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
          res.removeHeader('Content-Length');
          return originalSend(compressed);
        } else if (acceptsDeflate) {
          const compressed = deflateSync(buffer, { level: 6 });
          res.setHeader('Content-Encoding', 'deflate');
          res.setHeader('Vary', 'Accept-Encoding');
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
