import { describe, expect, it } from 'vitest';
import { siteApiContract, siteBackendPath } from './site-gateway';

describe('site-gateway', () => {
  it('maps Site v1 public paths to the private v1 API without channel leakage', () => {
    expect(siteBackendPath('/site-api/v1/chat/conversations/abc/messages')).toBe(
      '/api/v1/chat/conversations/abc/messages',
    );
    expect(siteBackendPath('/app-api/v2/stocks')).toBeNull();
  });

  it('publishes a Site-only contract', () => {
    const contract = siteApiContract('https://easy-scraping.com');
    expect(contract.apiVersion).toBe('1');
    expect(contract.baseUrl).toBe('https://easy-scraping.com/site-api/v1');
    expect(JSON.stringify(contract)).not.toContain('INTERNAL_API_TOKEN');
    expect(JSON.stringify(contract)).not.toContain('/app-api/');
  });
});
