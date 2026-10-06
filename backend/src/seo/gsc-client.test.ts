import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  chooseGscProperty,
  createServiceAccountAssertion,
  fetchGscAnalyticsSnapshot,
  parseGscServiceAccount,
  submitGscSitemap,
} from './gsc-client';

function testCredentialJson(): string {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
  return JSON.stringify({
    type: 'service_account',
    project_id: 'moneyverse-gsc-test',
    client_email: 'seo-test@moneyverse-gsc-test.iam.gserviceaccount.com',
    private_key: pem,
  });
}

describe('Google Search Console client', () => {
  it('parses a service account and signs the OAuth assertion with the required claims', () => {
    const credential = parseGscServiceAccount(testCredentialJson());
    const assertion = createServiceAccountAssertion(credential, 1_800_000_000);
    const parts = assertion.split('.');

    expect(parts).toHaveLength(3);
    const header = JSON.parse(Buffer.from(parts[0]!, 'base64url').toString('utf8'));
    const claims = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8'));

    expect(header).toMatchObject({ alg: 'RS256', typ: 'JWT' });
    expect(claims).toMatchObject({
      iss: credential.clientEmail,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: 1_800_000_000,
      exp: 1_800_003_600,
    });
    expect(parts[2]).not.toHaveLength(0);
  });

  it('prefers the matching Search Console domain property', () => {
    expect(
      chooseGscProperty(
        [
          { siteUrl: 'https://other.example/' },
          { siteUrl: 'sc-domain:easy-scraping.com', permissionLevel: 'siteFullUser' },
        ],
        'https://easy-scraping.com',
      ),
    ).toBe('sc-domain:easy-scraping.com');
  });

  it('exchanges a token, discovers the property, and maps actual Search Analytics rows', async () => {
    const credential = parseGscServiceAccount(testCredentialJson());
    const today = new Date().toISOString().slice(0, 10);

    const fetcher = vi.fn(async (url: string | URL, init?: RequestInit): Promise<Response> => {
      const target = String(url);
      if (target === 'https://oauth2.googleapis.com/token') {
        expect(init?.method).toBe('POST');
        expect(String(init?.body)).toContain('grant_type=');
        return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
      }

      if (target === 'https://www.googleapis.com/webmasters/v3/sites') {
        expect((init?.headers as Record<string, string>).authorization).toBe('Bearer access-token');
        return new Response(
          JSON.stringify({
            siteEntry: [
              {
                siteUrl: 'sc-domain:easy-scraping.com',
                permissionLevel: 'siteFullUser',
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (target.includes('/searchAnalytics/query')) {
        const body = JSON.parse(String(init?.body)) as { dimensions?: string[] };
        if (!body.dimensions) {
          return new Response(
            JSON.stringify({
              rows: [{ clicks: 21, impressions: 300, ctr: 0.07, position: 4.2 }],
            }),
            { status: 200 },
          );
        }
        if (body.dimensions[0] === 'date') {
          return new Response(
            JSON.stringify({
              rows: [
                {
                  keys: [today],
                  clicks: 5,
                  impressions: 50,
                  ctr: 0.1,
                  position: 3.1,
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({
            rows: [
              {
                keys: ['월덕 머니버스'],
                clicks: 9,
                impressions: 90,
                ctr: 0.1,
                position: 2.2,
              },
            ],
          }),
          { status: 200 },
        );
      }

      throw new Error(`unexpected URL: ${target}`);
    });

    const snapshot = await fetchGscAnalyticsSnapshot(
      credential,
      'https://easy-scraping.com',
      null,
      fetcher,
    );

    expect(snapshot).toMatchObject({
      propertyUrl: 'sc-domain:easy-scraping.com',
      totalClicks30d: 21,
      totalImpressions30d: 300,
      avgCtr30d: 7,
      avgPosition30d: 4.2,
    });
    expect(snapshot.timeSeries).toHaveLength(30);
    expect(snapshot.timeSeries.at(-1)).toMatchObject({
      date: today,
      clicks: 5,
      impressions: 50,
      ctr: 10,
      position: 3.1,
    });
    expect(snapshot.topQueries).toEqual([
      {
        query: '월덕 머니버스',
        clicks: 9,
        impressions: 90,
        ctr: 10,
        position: 2.2,
      },
    ]);
    expect(fetcher).toHaveBeenCalledTimes(5);
  });

  it('submits the production sitemap with write scope and returns Search Console status', async () => {
    const credential = parseGscServiceAccount(testCredentialJson());
    const propertyUrl = 'sc-domain:easy-scraping.com';
    const sitemapUrl = 'https://easy-scraping.com/sitemap.xml';
    const sitemapEndpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

    const fetcher = vi.fn(async (url: string | URL, init?: RequestInit): Promise<Response> => {
      const target = String(url);
      if (target === 'https://oauth2.googleapis.com/token') {
        const params = new URLSearchParams(String(init?.body));
        const assertion = params.get('assertion');
        expect(assertion).toBeTruthy();
        const claims = JSON.parse(Buffer.from(assertion!.split('.')[1]!, 'base64url').toString('utf8'));
        expect(claims.scope).toBe('https://www.googleapis.com/auth/webmasters');
        return new Response(JSON.stringify({ access_token: 'write-token' }), { status: 200 });
      }

      if (target === 'https://www.googleapis.com/webmasters/v3/sites') {
        return new Response(JSON.stringify({ siteEntry: [{ siteUrl: propertyUrl, permissionLevel: 'siteFullUser' }] }), { status: 200 });
      }

      if (target === sitemapEndpoint && init?.method === 'PUT') {
        expect((init.headers as Record<string, string>).authorization).toBe('Bearer write-token');
        expect(init.body).toBeUndefined();
        return new Response(null, { status: 204 });
      }

      if (target === sitemapEndpoint && (init?.method === undefined || init.method === 'GET')) {
        return new Response(JSON.stringify({
          path: sitemapUrl,
          lastSubmitted: '2026-10-07T00:05:00.000Z',
          lastDownloaded: '2026-10-07T00:06:00.000Z',
          isPending: false,
          warnings: '1',
          errors: '0',
          contents: [{ type: 'web', submitted: '642' }],
        }), { status: 200 });
      }

      throw new Error(`unexpected URL: ${target}`);
    });

    const result = await submitGscSitemap(
      credential,
      'https://easy-scraping.com',
      null,
      sitemapUrl,
      fetcher,
    );

    expect(result).toEqual({
      propertyUrl,
      sitemapUrl,
      lastSubmitted: '2026-10-07T00:05:00.000Z',
      lastDownloaded: '2026-10-07T00:06:00.000Z',
      isPending: false,
      warnings: 1,
      errors: 0,
      submittedUrlCount: 642,
    });
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('rejects non-service-account JSON', () => {
    expect(() => parseGscServiceAccount(JSON.stringify({ type: 'authorized_user' }))).toThrow(
      'Google service account JSON is required',
    );
  });
});
