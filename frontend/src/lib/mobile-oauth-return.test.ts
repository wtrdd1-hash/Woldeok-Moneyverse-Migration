import { afterEach, describe, expect, it } from 'vitest';
import { mobileOAuthCompletionResponse } from './mobile-oauth-return';

const originalReturnUri = process.env.MOBILE_OAUTH_RETURN_URI;

afterEach(() => {
  if (originalReturnUri === undefined) delete process.env.MOBILE_OAUTH_RETURN_URI;
  else process.env.MOBILE_OAUTH_RETURN_URI = originalReturnUri;
});

describe('mobileOAuthCompletionResponse', () => {
  it('attempts the Android deep link and provides a tap fallback', async () => {
    delete process.env.MOBILE_OAUTH_RETURN_URI;
    const response = mobileOAuthCompletionResponse('handoff-abcdefghijklmnopqrstuvwxyz012345', 'discord');
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(body).toContain('woldeok-moneyverse://oauth/callback?code=handoff-abcdefghijklmnopqrstuvwxyz012345&amp;provider=discord');
    expect(body).toContain('window.location.replace');
    expect(body).toContain('월덕 머니버스 앱 열기');
  });

  it('uses only the server-configured fixed return URI', async () => {
    process.env.MOBILE_OAUTH_RETURN_URI = 'example-app://signed-in/complete?source=oauth';
    const response = mobileOAuthCompletionResponse('abcdefghijklmnopqrstuvwxyz0123456789', 'google');
    const body = await response.text();

    expect(body).toContain('example-app://signed-in/complete?source=oauth&amp;code=abcdefghijklmnopqrstuvwxyz0123456789&amp;provider=google');
  });
});
