#!/usr/bin/env node
// v2026.11.18.16 — read-only semantic QA companion; NOT full-route authenticated QA.
import { fileURLToPath } from 'node:url';

const PROBES = Object.freeze([
  { id: 'SEM-HOME', path: '/', check: 'html' },
  { id: 'SEM-LOGIN', path: '/login', check: 'html' },
  { id: 'SEM-VERSION', path: '/api/version', check: 'spring-version' },
  { id: 'SEM-ADMIN', path: '/admin', check: 'guest-admin' },
  { id: 'SEM-ROBOTS', path: '/robots.txt', check: 'robots' },
  { id: 'SEM-SITEMAP', path: '/sitemap.xml', check: 'sitemap' },
  { id: 'SEM-404', path: '/__qa_semantic_not_found_v20261118_16', check: 'not-found' },
]);

const MAX_BODY_BYTES = 256 * 1024;
const CONTENT_TYPES = {
  html: /(^|\/)html\b/i,
  robots: /^text\/plain\b/i,
  sitemap: /^(application|text)\/(xml|[^;]+\+xml)\b/i,
  json: /^application\/(json|[^;]+\+json)\b/i,
};

function assertBaseUrl(raw) {
  const u = new URL(raw);
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.search || u.hash ||
      (u.protocol === 'http:' && !['localhost', '127.0.0.1', '::1', '[::1]'].includes(u.hostname)) ||
      (u.pathname !== '/' && u.pathname !== '')) {
    throw new Error('BASE_URL_NOT_ALLOWED');
  }
  return u.origin;
}

async function readBounded(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let count = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      count += value.byteLength;
      if (count > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString('utf8');
}

function assess({ status, contentType, body, location }, check, baseUrl) {
  if (check === 'not-found') {
    return status === 404 || status === 410 ? [ 'PASS', 'NOT_FOUND_CONTRACT_OK' ] : [ 'FAIL', 'MISSING_ROUTE_NOT_404' ];
  }
  if (check === 'guest-admin') {
    if (status === 401 || status === 403) return [ 'PASS', 'ANONYMOUS_DENIED' ];
    if ([301, 302, 303, 307, 308].includes(status)) {
      try {
        const dest = new URL(location, baseUrl);
        if (dest.origin === baseUrl && dest.pathname === '/login') return [ 'PASS', 'REDIRECT_TO_LOGIN' ];
      } catch { /* missing/invalid location is FAIL */ }
    }
    return [ 'FAIL', 'ANONYMOUS_ADMIN_NOT_DENIED' ];
  }
  if (status !== 200) return [ 'FAIL', 'HTTP_STATUS_NOT_200' ];
  if (check === 'html') {
    return CONTENT_TYPES.html.test(contentType) && /<!doctype html|<html\b/i.test(body)
      ? [ 'PASS', 'HTML_DOCUMENT_OK' ] : [ 'FAIL', 'HTML_CONTRACT_INVALID' ];
  }
  if (check === 'robots') {
    return CONTENT_TYPES.robots.test(contentType) && /^\s*user-agent\s*:/im.test(body)
      ? [ 'PASS', 'ROBOTS_TEXT_OK' ] : [ 'FAIL', 'ROBOTS_CONTENT_INVALID' ];
  }
  if (check === 'sitemap') {
    return CONTENT_TYPES.sitemap.test(contentType) && /<(urlset|sitemapindex)\b/i.test(body)
      ? [ 'PASS', 'SITEMAP_XML_OK' ] : [ 'FAIL', 'SITEMAP_CONTENT_INVALID' ];
  }
  if (check === 'spring-version') {
    if (!CONTENT_TYPES.json.test(contentType)) return [ 'FAIL', 'VERSION_CONTENT_NOT_JSON' ];
    try {
      const v = JSON.parse(body);
      return v?.success === true && typeof v?.data?.framework === 'string'
        && v.data.framework.includes('Spring Boot') && typeof v.data.version === 'string'
        && v.data.version.trim() && v.data.activeEngine === 'Java Spring Boot'
        ? [ 'PASS', 'SPRING_VERSION_SHAPE_OK' ] : [ 'FAIL', 'VERSION_SCHEMA_INVALID' ];
    } catch { return [ 'FAIL', 'VERSION_JSON_INVALID' ]; }
  }
  return [ 'BLOCKED', 'UNKNOWN_CONTRACT' ];
}

async function getProbe(baseUrl, probe, timeoutMs) {
  const started = performance.now();
  let status = null;
  let contentType = '';
  try {
    const res = await fetch(baseUrl + probe.path, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: '*/*', 'user-agent': 'MoneyverseScheduledSemanticQA/2026.11.18.16' }
    });
    status = res.status;
    contentType = String(res.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const location = String(res.headers.get('location') || '');
    const body = ['html', 'spring-version', 'robots', 'sitemap'].includes(probe.check)
      ? await readBounded(res) : '';
    const [result, reason] = assess({ status, contentType, body, location }, probe.check, baseUrl);
    return { id: probe.id, path: probe.path, status, contentType, result, reason,
      durationMs: Math.round(performance.now() - started) };
  } catch (err) {
    return { id: probe.id, path: probe.path, status, contentType,
      result: err?.message === 'BODY_TOO_LARGE' ? 'FAIL' : 'BLOCKED',
      reason: err?.message === 'BODY_TOO_LARGE' ? 'BODY_TOO_LARGE' : 'TRANSPORT_OR_TIMEOUT',
      durationMs: Math.round(performance.now() - started) };
  }
}

export async function runSemanticQa(rawBaseUrl, {
  timeoutMs = 8000, label = 'test', candidateSha = 'UNATTESTED',
} = {}) {
  const baseUrl = assertBaseUrl(rawBaseUrl);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 15000) throw new Error('INVALID_TIMEOUT');
  const cases = [];
  for (const probe of PROBES) {
    cases.push(await getProbe(baseUrl, probe, timeoutMs));
  }
  const summary = {
    total: cases.length,
    pass: cases.filter(x => x.result === 'PASS').length,
    fail: cases.filter(x => x.result === 'FAIL').length,
    blocked: cases.filter(x => x.result === 'BLOCKED').length,
  };
  return {
    schemaVersion: 1,
    suiteVersion: 'v2026.11.18.16',
    timestamp: new Date().toISOString(),
    environment: label === 'test' ? 'test' : 'candidate',
    baseOrigin: baseUrl,
    candidateSha: /^[0-9a-f]{40}$/i.test(candidateSha) ? candidateSha : 'UNATTESTED',
    cases, summary,
    overall: summary.fail ? 'FAIL' : summary.blocked ? 'BLOCKED' : 'PASS',
    fullFunctionalQa: 'NOT_TESTED',
    authenticatedAdminQa: 'NOT_TESTED',
    financeLedgerQa: 'NOT_TESTED',
    androidQa: 'NOT_TESTED',
    discordVoiceQa: 'NOT_TESTED',
    exactShaRuntimeAttestation: 'NOT_TESTED',
    releaseCertification: 'BLOCKED',
  };
}

async function main(argv) {
  const allowed = new Set(['--base-url', '--label', '--candidate-sha', '--timeout-ms']);
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!allowed.has(key) || !argv[i + 1]) throw new Error('INVALID_ARGUMENTS');
    options[key] = argv[i + 1];
  }
  const baseUrl = options['--base-url'];
  if (!baseUrl) throw new Error('MISSING_BASE_URL');
  const report = await runSemanticQa(baseUrl, {
    label: options['--label'] || 'test',
    candidateSha: options['--candidate-sha'] || 'UNATTESTED',
    timeoutMs: options['--timeout-ms'] ? Number(options['--timeout-ms']) : 8000,
  });
  // Deliberately exclude HTTP bodies, cookies, auth headers and response URLs from journal.
  console.log(JSON.stringify({ event: 'scheduled_semantic_qa', ...report }));
  process.exitCode = report.overall === 'PASS' ? 0 : report.overall === 'BLOCKED' ? 2 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).catch(err => {
    console.error(JSON.stringify({ event: 'scheduled_semantic_qa', overall: 'BLOCKED',
      reason: err?.message?.startsWith('BASE_URL') ? 'BASE_URL_NOT_ALLOWED' : 'INVALID_CONFIGURATION',
      releaseCertification: 'BLOCKED' }));
    process.exitCode = 2;
  });
}
