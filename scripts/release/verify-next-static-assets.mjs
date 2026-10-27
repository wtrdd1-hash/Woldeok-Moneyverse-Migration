#!/usr/bin/env node
/** Detect a running Next.js server whose HTML references deleted build assets. */
import { pathToFileURL } from 'node:url';

const NEXT_CSS = /^\/_next\/static\/[^?#]+\.css$/;

function stylesheetPaths(html) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  return [...new Set(links.flatMap((tag) => {
    const rel = /\brel=["']([^"']+)["']/.exec(tag)?.[1] ?? '';
    const href = /\bhref=["']([^"']+)["']/.exec(tag)?.[1] ?? '';
    return rel.split(/\s+/).includes('stylesheet') && NEXT_CSS.test(href) ? [href] : [];
  }))];
}

/** @param {string} pageUrl @param {{fetchImpl?: typeof fetch, host?: string, expectedSelector?: string}} options */
export async function verifyNextStaticAssets(pageUrl, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = options.host ? { host: options.host, 'x-forwarded-proto': 'https' } : {};
  const htmlResponse = await fetchImpl(pageUrl, { headers, cache: 'no-store' });
  if (!htmlResponse.ok) throw new Error(`Page returned HTTP ${htmlResponse.status}`);
  if (!(htmlResponse.headers.get('content-type') ?? '').includes('text/html')) {
    throw new Error('Page did not return HTML');
  }
  const html = await htmlResponse.text();
  const styles = stylesheetPaths(html);
  if (!styles.length) throw new Error('Page references no Next.js stylesheets');
  let hasExpectedSelector = !options.expectedSelector;
  for (const path of styles) {
    const resource = await fetchImpl(new URL(path, pageUrl), { headers, cache: 'no-store' });
    if (!resource.ok) throw new Error(`Missing stylesheet ${path}: HTTP ${resource.status}`);
    if (!(resource.headers.get('content-type') ?? '').toLowerCase().includes('text/css')) {
      throw new Error(`Stylesheet ${path} has unexpected content type`);
    }
    const css = await resource.text();
    if (!css.trim()) throw new Error(`Empty stylesheet ${path}`);
    if (options.expectedSelector && css.includes(options.expectedSelector)) hasExpectedSelector = true;
  }
  if (!hasExpectedSelector) throw new Error(`Required utility not found: ${options.expectedSelector}`);
  return { pageUrl, stylesheetCount: styles.length, paths: styles };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const url = args.find((arg) => arg.startsWith('--url='))?.slice(6);
  const host = args.find((arg) => arg.startsWith('--host='))?.slice(7);
  if (!url) {
    console.error('Usage: node verify-next-static-assets.mjs --url=http://127.0.0.1:PORT/admin [--host=easy-scraping.com]');
    process.exitCode = 2;
  } else {
    verifyNextStaticAssets(url, { host, expectedSelector: '.size-9{' })
      .then((result) => console.log(JSON.stringify({ ok: true, ...result })))
      .catch((error) => { console.error(`STATIC_ASSETS_FAIL ${error.message}`); process.exitCode = 1; });
  }
}
