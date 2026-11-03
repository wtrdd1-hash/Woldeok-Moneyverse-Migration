import { describe, expect, it } from 'vitest';
import { isSameOriginFinanceMutation } from './finance-mutation-origin';

const validPublic = 'https://easy-scraping.com';
function request(url: string, headers: Record<string,string>): Request {
  return new Request(url, { method: 'POST', headers, body: '{}' });
}
describe('v1629 strict owner-backed financial POST origin handling', () => {
  it.each([
    ['production', 'http://127.0.0.1:4225/api/treasury/donate', 'easy-scraping.com'],
    ['test', 'http://127.0.0.1:3101/api/treasury/donate', 'test.easy-scraping.com'],
  ])('accepts %s public HTTPS proxy address only when Host and Origin match', (_label, url, host) => {
    expect(isSameOriginFinanceMutation(request(url, { host, origin: 'https://' + host,
      'sec-fetch-site': 'same-origin' }))).toBe(true);
  });
  it('keeps direct-origin requests valid for pre-existing API tests', () => {
    expect(isSameOriginFinanceMutation(request('https://example.test/api/treasury/donate', {
      origin: 'https://example.test', 'sec-fetch-site': 'same-origin',
    }))).toBe(true);
  });
  it.each([
    {host:'evil.example',origin: validPublic,site:'same-origin'},
    {host:'easy-scraping.com.evil.example',origin: validPublic,site:'same-origin'},
    {host:'test.easy-scraping.com',origin: validPublic,site:'same-origin'},
    {host:'easy-scraping.com:444',origin: validPublic,site:'same-origin'},
    {host:'easy-scraping.com',origin:'https://evil.example',site:'same-origin'},
    {host:'easy-scraping.com',origin:validPublic,site:'cross-site'},
    {host:'easy-scraping.com',origin:'http://easy-scraping.com',site:'same-origin'},
    {host:'easy-scraping.com',origin:'https://easy-scraping.com:444',site:'same-origin'},
    {host:'easy-scraping.com',origin:'https://easy-scraping.com/path',site:'same-origin'},
    {host:'easy-scraping.com',origin:'null',site:'same-origin'},
  ])('rejects nonmatching or hostile request %#', (args) => {
    expect(isSameOriginFinanceMutation(request('http://127.0.0.1:4225/api/treasury/donate', {
      host:args.host, origin:args.origin, 'sec-fetch-site':args.site
    }))).toBe(false);
  });
  it('does not permit a forged X-Forwarded-Host to override an untrusted Host', () => {
    expect(isSameOriginFinanceMutation(request('http://127.0.0.1:4225/api/treasury/donate', {
      host:'127.0.0.1:4225', 'x-forwarded-host':'easy-scraping.com',
      origin: validPublic,'sec-fetch-site':'same-origin',
    }))).toBe(false);
  });
  it('does not accept requests from arbitrary nonlocal upstream URLs by a forged public Host', () => {
    expect(isSameOriginFinanceMutation(request('http://attacker.example:4225/api/treasury/donate', {
      host:'easy-scraping.com',origin:validPublic,'sec-fetch-site':'same-origin',
    }))).toBe(false);
  });
});
