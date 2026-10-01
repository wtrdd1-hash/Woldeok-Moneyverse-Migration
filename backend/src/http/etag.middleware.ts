import type { NextFunction, Request, Response } from 'express';
import { createHash } from 'crypto';

/**
 * Dynamic ETag & HTTP 304 Not Modified Caching Middleware.
 * Generates weak ETags for GET/HEAD requests and responds with 304 when If-None-Match matches.
 */
export function dynamicEtag() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // ETags apply primarily to GET and HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const originalSend = res.send.bind(res);

    res.send = (body?: unknown): Response => {
      res.send = originalSend;

      if (!body || res.statusCode !== 200) {
        return originalSend(body);
      }

      // If ETag is already explicitly set, skip
      if (res.getHeader('ETag')) {
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

      // Generate weak ETag: W/"<len>-<sha1_hash_prefix>"
      const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 16);
      const etag = `W/"${buffer.length.toString(16)}-${hash}"`;

      res.setHeader('ETag', etag);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch) {
        const clientEtags = ifNoneMatch.split(',').map((e) => e.trim());
        if (clientEtags.includes(etag) || clientEtags.includes('*')) {
          res.status(304);
          res.removeHeader('Content-Type');
          res.removeHeader('Content-Length');
          return res.end();
        }
      }

      return originalSend(body);
    };

    next();
  };
}
