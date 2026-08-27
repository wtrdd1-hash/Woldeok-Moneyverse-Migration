import assert from 'node:assert/strict';

/**
 * `Headers.get()` is typed `string | null`. Tests that assert a header's
 * *value* (via `assert.match`, or build a `URL` from it) need the non-null
 * case; a genuinely missing header is exactly the failure such a test wants
 * to catch, so this asserts presence loudly rather than silencing it with
 * `!`. Tests that only check for absence keep calling `.get()` directly,
 * since `assert.equal(response.headers.get(x), null)` needs no narrowing.
 */
export function header(response: Response, name: string): string {
  const value = response.headers.get(name);
  assert.ok(value !== null, `expected response header '${name}' to be present`);
  return value;
}

/**
 * `RequestInit.headers` is typed `HeadersInit | undefined` — a `Headers`
 * instance, a `[string, string][]`, a plain record, or absent. Every fetch
 * double in this suite is called by production code that always constructs
 * this field as a plain object literal (grep the call sites before trusting
 * this for a new one), so this narrows to that case and asserts the header
 * key is actually present rather than returning `undefined` silently.
 */
export function requestHeader(init: RequestInit, name: string): string {
  const headers = init.headers;
  assert.ok(
    headers && typeof headers === 'object' && !Array.isArray(headers) && !(headers instanceof Headers),
    `expected RequestInit.headers to be a plain object carrying '${name}'`,
  );
  const value = (headers as Record<string, string>)[name];
  assert.ok(value !== undefined, `expected request header '${name}' to be present`);
  return value;
}
