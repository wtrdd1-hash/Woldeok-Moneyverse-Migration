import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { contextOf, requestContext } from './request-context';

function stamp(
  headers: Record<string, string>,
  { trustForwardedHeaders }: { trustForwardedHeaders: boolean },
): Request {
  const request = { headers } as unknown as Request;
  requestContext({ trustForwardedHeaders })(request, {} as never, () => {});
  return request;
}

describe('the request context', () => {
  it('gives every request an id even when nothing upstream supplied one', () => {
    const context = contextOf(stamp({}, { trustForwardedHeaders: false }));
    expect(context?.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(context?.traceId).toBe(context?.requestId);
  });

  it('ignores a supplied id where no proxy is trusted to have written it', () => {
    const supplied = randomUUID();
    const context = contextOf(
      stamp({ 'x-request-id': supplied }, { trustForwardedHeaders: false }),
    );
    expect(context?.requestId).not.toBe(supplied);
  });

  it('adopts a supplied id behind a trusted proxy', () => {
    const supplied = randomUUID();
    const trace = randomUUID();
    const context = contextOf(
      stamp(
        { 'x-request-id': supplied, 'x-trace-id': trace },
        { trustForwardedHeaders: true },
      ),
    );
    expect(context?.requestId).toBe(supplied);
    expect(context?.traceId).toBe(trace);
  });

  it('generates its own id when a trusted header carries something that is not one', () => {
    // A malformed value must not become the correlation id: it would fail the
    // uuid check one layer down and take the audit write with it.
    const context = contextOf(
      stamp({ 'x-request-id': 'not-a-uuid' }, { trustForwardedHeaders: true }),
    );
    expect(context?.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
