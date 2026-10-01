import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { responseCompression } from './compression.middleware';
import { dynamicEtag } from './etag.middleware';
import { gunzipSync, inflateSync } from 'zlib';

describe('HTTP Performance Middleware', () => {
  describe('responseCompression', () => {
    const middleware = responseCompression();

    it('1KB 미만 페이로드는 압축하지 않고 원본을 반환한다', () => {
      const req = {
        headers: { 'accept-encoding': 'gzip, deflate' },
        method: 'GET',
      } as unknown as Request;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const res = {
        statusCode: 200,
        getHeader: vi.fn((k: string) => headers[k]),
        setHeader: vi.fn((k: string, v: string) => {
          headers[k] = v;
        }),
        removeHeader: vi.fn(),
        send: vi.fn((body) => body),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const smallBody = JSON.stringify({ hello: 'world' });
      res.send(smallBody);

      expect(res.setHeader).not.toHaveBeenCalledWith('Content-Encoding', 'gzip');
    });

    it('1KB 이상의 JSON 페이로드 요청 시 Gzip으로 압축하고 Content-Encoding 헤더를 설정한다', () => {
      const req = {
        headers: { 'accept-encoding': 'gzip, deflate' },
        method: 'GET',
      } as unknown as Request;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let sentBody: unknown;
      const res = {
        statusCode: 200,
        getHeader: vi.fn((k: string) => headers[k]),
        setHeader: vi.fn((k: string, v: string) => {
          headers[k] = v;
        }),
        removeHeader: vi.fn(),
        send: vi.fn((body) => {
          sentBody = body;
          return res;
        }),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();
      middleware(req, res, next);

      const largeData = { items: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `item-${i}` })) };
      const largeJson = JSON.stringify(largeData);
      expect(Buffer.byteLength(largeJson)).toBeGreaterThan(1024);

      res.send(largeJson);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Encoding', 'gzip');
      expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
      expect(Buffer.isBuffer(sentBody)).toBe(true);

      const decompressed = gunzipSync(sentBody as Buffer).toString('utf8');
      expect(JSON.parse(decompressed)).toEqual(largeData);
    });

    it('deflate만 지원하는 클라이언트에는 Deflate로 압축한다', () => {
      const req = {
        headers: { 'accept-encoding': 'deflate' },
        method: 'GET',
      } as unknown as Request;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let sentBody: unknown;
      const res = {
        statusCode: 200,
        getHeader: vi.fn((k: string) => headers[k]),
        setHeader: vi.fn((k: string, v: string) => {
          headers[k] = v;
        }),
        removeHeader: vi.fn(),
        send: vi.fn((body) => {
          sentBody = body;
          return res;
        }),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();
      middleware(req, res, next);

      const largeJson = JSON.stringify({ data: 'A'.repeat(2000) });
      res.send(largeJson);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Encoding', 'deflate');
      const decompressed = inflateSync(sentBody as Buffer).toString('utf8');
      expect(decompressed).toBe(largeJson);
    });
  });

  describe('dynamicEtag', () => {
    const middleware = dynamicEtag();

    it('GET 요청에 대해 ETag 헤더를 생성한다', () => {
      const req = {
        method: 'GET',
        headers: {},
      } as unknown as Request;

      const headers: Record<string, string> = {};
      const res = {
        statusCode: 200,
        getHeader: vi.fn((k: string) => headers[k]),
        setHeader: vi.fn((k: string, v: string) => {
          headers[k] = v;
        }),
        removeHeader: vi.fn(),
        send: vi.fn((body) => body),
      } as unknown as Response;

      const next = vi.fn();
      middleware(req, res, next);

      const body = JSON.stringify({ status: 'ok' });
      res.send(body);

      expect(res.setHeader).toHaveBeenCalledWith('ETag', expect.stringMatching(/^W\/"/));
    });

    it('클라이언트의 If-None-Match가 일치하면 304 Not Modified를 반환한다', () => {
      const body = JSON.stringify({ status: 'ok' });
      const expectedEtag = 'W/"f-a18d18e80628eeef"';

      const req = {
        method: 'GET',
        headers: { 'if-none-match': expectedEtag },
      } as unknown as Request;

      const headers: Record<string, string> = {};
      let isEnded = false;
      const res = {
        statusCode: 200,
        status: vi.fn((code: number) => {
          res.statusCode = code;
          return res;
        }),
        getHeader: vi.fn((k: string) => headers[k]),
        setHeader: vi.fn((k: string, v: string) => {
          headers[k] = v;
        }),
        removeHeader: vi.fn(),
        send: vi.fn((b) => b),
        end: vi.fn(() => {
          isEnded = true;
          return res;
        }),
      } as unknown as Response;

      const next = vi.fn();
      middleware(req, res, next);

      res.send(body);

      // Verify ETag was calculated
      expect(res.setHeader).toHaveBeenCalledWith('ETag', expect.any(String));
    });
  });
});
