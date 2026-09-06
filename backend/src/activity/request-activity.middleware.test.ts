import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import type { AppConfig } from '../core/config';
import { requestActivityTrail } from './request-activity.middleware';

const config = {
  cookieSecure: true,
  trustProxyForwardedFor: true,
} as AppConfig;

function response(statusCode = 200): Response & EventEmitter {
  const value = new EventEmitter() as Response & EventEmitter;
  Object.defineProperty(value, 'statusCode', { value: statusCode, writable: true });
  return value;
}

describe('requestActivityTrail', () => {
  it('records a safe path and response metadata for an authenticated request', async () => {
    const recordRequest = vi.fn().mockResolvedValue(undefined);
    const sessions = {
      get: vi.fn().mockResolvedValue({ user_id: '00000000-0000-4000-8000-000000000001' }),
    };
    const request = {
      method: 'GET',
      originalUrl: '/api/v1/admin/users?query=secret',
      headers: {
        cookie: '__Host-mv_session=session-secret',
        'cf-connecting-ip': '203.0.113.9',
        'user-agent': 'mobile-test',
        'cf-ipcountry': 'kr',
      },
      socket: {},
    } as unknown as Request;
    const reply = response(200);
    const next = vi.fn();

    requestActivityTrail({
      activity: { recordRequest } as never,
      sessions: sessions as never,
      config,
    })(request, reply, next);
    reply.emit('finish');
    await vi.waitFor(() => expect(recordRequest).toHaveBeenCalledOnce());

    expect(next).toHaveBeenCalledOnce();
    expect(sessions.get).toHaveBeenCalledWith('session-secret');
    expect(recordRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: '00000000-0000-4000-8000-000000000001',
        path: '/api/v1/admin/users',
        method: 'GET',
        status: 200,
        ip: '203.0.113.9',
        userAgent: 'mobile-test',
        country: 'KR',
      }),
    );
    expect(JSON.stringify(recordRequest.mock.calls)).not.toContain('query=secret');
    expect(JSON.stringify(recordRequest.mock.calls)).not.toContain('session-secret');
  });

  it('does not record health probes', () => {
    const recordRequest = vi.fn();
    const next = vi.fn();
    const reply = response();

    requestActivityTrail({
      activity: { recordRequest } as never,
      sessions: null,
      config,
    })(
      { method: 'GET', originalUrl: '/health', headers: {}, socket: {} } as unknown as Request,
      reply,
      next,
    );
    reply.emit('finish');

    expect(next).toHaveBeenCalledOnce();
    expect(recordRequest).not.toHaveBeenCalled();
  });
});
