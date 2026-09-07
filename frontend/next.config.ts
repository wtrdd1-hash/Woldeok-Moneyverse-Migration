import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Cloudflare Web Analytics. The beacon is served from one origin and reports
 * to another, so both are named: `script-src` for the file and `connect-src`
 * for the measurement it posts back.
 */
const BEACON_SCRIPT = 'https://static.cloudflareinsights.com';
const BEACON_REPORT = 'https://cloudflareinsights.com';
const ADSENSE_SCRIPT = 'https://pagead2.googlesyndication.com';
const ADSENSE_FRAME = 'https://googleads.g.doubleclick.net https://tpc.googlesyndication.com';
const ADSENSE_CONNECT =
  'https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adtrafficquality.google https://*.adtrafficquality.google';

/**
 * One value that changes on every build, readable on both sides.
 *
 * A tab left open across a deploy holds server-action ids from a build that
 * no longer exists. Next answers those with a 404 and the click does nothing
 * -- no error, no message, the button simply stops working. The page needs to
 * be able to notice, and to notice it needs to know which build it came from
 * and which build the server is serving.
 *
 * `env` is inlined at build time into both bundles, so the browser has the id
 * of the build it was served by and `/api/build` has the id of the build
 * answering now. When they differ, the tab is stale.
 */
const BUILD_ID = process.env.BUILD_ID ?? String(Date.now());

const config: NextConfig = {
  generateBuildId: () => BUILD_ID,
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  reactStrictMode: true,
  // The API is internal. Nothing here should ever construct a browser-facing
  // URL to it, so its address is read only in server code.
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Absolute, because Next resolves this against the process's working
  // directory and warns when handed a relative path. It points at the
  // workspace root so tracing follows the contract package's real files
  // through the pnpm store rather than stopping at a symlink.
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),
  // Standalone puts the server and only the files it traced into .next, which
  // is what the container copies.
  output: 'standalone',
  experimental: {
    // The contract package ships CommonJS from a workspace path.
    externalDir: true,
  },

  /**
   * Browser security headers, and the indexing gate.
   *
   * Set here rather than at the edge so they are versioned with the code that
   * depends on them: a page that starts loading a font from somewhere new
   * and a CSP that forbids it should fail in the same commit, not in two.
   *
   * On `script-src 'unsafe-inline'`. The spec asks for a nonce-based policy.
   * A nonce has to be minted per request and written into the HTML, which in
   * Next means the page can no longer be prerendered — and the prerendered
   * HTML is the reason this application is on Next at all. The compensating
   * position: React escapes every interpolation, the only
   * `dangerouslySetInnerHTML` on the site is JSON-LD this code builds itself,
   * and the directives that actually bound the damage of an injection —
   * `base-uri`, `object-src`, `form-action`, `frame-ancestors`, `connect-src`
   * — are all strict. Revisit if a page ever renders HTML it did not author.
   *
   * On the two Cloudflare origins. Every deployed environment sits behind
   * Cloudflare, and Cloudflare injects its Web Analytics beacon into the
   * response on the way out. A policy that then refuses the script does not
   * prevent anything — the proxy terminates TLS for this site and can already
   * rewrite the document it is serving — it only writes a violation to the
   * console on every page load. Naming the origins is therefore an admission
   * of what already runs, not a new grant. Turning Web Analytics off in the
   * Cloudflare dashboard makes both names removable again.
   *
   * `img-src` admits any HTTPS origin because a gallery photo's URL is
   * whatever host an operator was allowed to register, and that allowlist
   * lives in PostgreSQL where this build cannot read it. An image is not a
   * script; the exposure is a hotlink, not an execution.
   *
   * On the indexing gate: robots.txt alone is not enough. Cloudflare prepends
   * its own managed block, which opens with `User-agent: * / Allow: /`, and a
   * crawler merging that group with ours sees an Allow and a Disallow for the
   * same path — the permissive one can win. `X-Robots-Tag` is not a hint that
   * has to be reconciled with anything.
   */
  async headers() {
    // Tests and the standalone runtime load this config more than once with
    // different deployment settings, so read the switch here rather than at
    // module evaluation time.
    const adsEnabled = (process.env.NEXT_PUBLIC_ADS_ENABLED || process.env.ADS_ENABLED || 'true') === 'true';
    const base = process.env.APP_BASE_URL ?? 'http://127.0.0.1:3000';
    // The lobby's socket shares this origin. `connect-src 'self'` has never
    // reliably covered ws:/wss: across browsers, so the socket origin is
    // named outright.
    const socket = base.replace(/^http/, 'ws').replace(/\/$/, '');

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      adsEnabled ? `frame-src ${ADSENSE_FRAME}` : "frame-src 'none'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline' ${BEACON_SCRIPT}${adsEnabled ? ` ${ADSENSE_SCRIPT}` : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' ${socket} ${BEACON_REPORT}${adsEnabled ? ` ${ADSENSE_CONNECT}` : ''}`,
      "manifest-src 'self'",
      'upgrade-insecure-requests',
    ].join('; ');

    const security = [
      { key: 'content-security-policy', value: csp },
      // Browsers ignore HSTS over plain HTTP, so this is inert locally and
      // makes a downgrade fail closed for a year in front of the tunnel.
      { key: 'strict-transport-security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'referrer-policy', value: 'strict-origin-when-cross-origin' },
      { key: 'permissions-policy', value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()' },
      { key: 'x-content-type-options', value: 'nosniff' },
      // Redundant beside frame-ancestors, and kept for browsers that honour
      // only the older header.
      { key: 'x-frame-options', value: 'DENY' },
      { key: 'cross-origin-opener-policy', value: 'same-origin' },
    ];

    if (process.env.SEO_INDEXING_ENABLED !== 'true') {
      security.push({ key: 'x-robots-tag', value: 'noindex, nofollow' });
    }

    return [{ source: '/:path*', headers: security }];
  },
};

export default config;
