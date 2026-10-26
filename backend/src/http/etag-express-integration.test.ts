import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { registerDynamicEtag } from './etag.middleware';

let server: Server | undefined;
afterEach(async () => {
  if (server) await new Promise<void>((resolve, reject) => server?.close((error) => error ? reject(error) : resolve()));
  server = undefined;
});

describe('real Express conditional HTTP behavior', () => {
  it('never returns a bodyless 304 for no-store responses', async () => {
    const app = express();
    registerDynamicEtag(app);
    app.get('/private', (_request, response) => response.set('Cache-Control', 'no-store').send('private payload'));
    server = createServer(app);
    await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('expected TCP listener');
    const response = await fetch(`http://127.0.0.1:${address.port}/private`, {
      headers: { 'If-None-Match': '*' },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('private payload');
    expect(response.headers.get('etag')).toBeNull();
  });

  it('preserves public 304 while refusing private cookie validators', async () => {
    const app = express();
    registerDynamicEtag(app);
    app.get('/public', (_request, response) => response.send('public payload'));
    app.get('/session', (_request, response) => response.cookie('session', 'rotated').send('private payload'));
    server = createServer(app);
    await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('expected TCP listener');
    const origin = `http://127.0.0.1:${address.port}`;
    const publicResponse = await fetch(`${origin}/public`, { headers: { 'If-None-Match': '*' } });
    expect(publicResponse.status).toBe(304);
    expect(publicResponse.headers.get('etag')).toMatch(/^W\//);
    const privateResponse = await fetch(`${origin}/session`, { headers: { 'If-None-Match': '*' } });
    expect(privateResponse.status).toBe(200);
    expect(privateResponse.headers.get('etag')).toBeNull();
    expect(await privateResponse.text()).toBe('private payload');
  });
});
