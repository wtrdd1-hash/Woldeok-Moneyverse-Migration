import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // The API is internal. Nothing here should ever construct a browser-facing
  // URL to it, so its address is read only in server code.
  poweredByHeader: false,
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
      "frame-src 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' ${socket}`,
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
