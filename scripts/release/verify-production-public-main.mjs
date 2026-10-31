#!/usr/bin/env node
/**
 * Read-only public Production provenance monitor.
 * Public versions agreeing with each other are not proof of a merged release:
 * both must match the canonical main SHA obtained independently from GitHub.
 * This monitor is not a substitute for GitOps approval, live artifact proof,
 * isolated Test, finance/DB verification or independent recovery.
 */
const SHA = /^[0-9a-f]{40}$/;
const PUBLIC_ORIGIN = 'https://easy-scraping.com';

export function verifyProductionPublicMain(snapshot) {
  const failures = [];
  const mainSha = snapshot?.mainSha ?? null;
  const rawBackend = snapshot?.backend?.id;
  const rawFrontend = snapshot?.frontend?.id;
  const validMain = typeof mainSha === 'string' && SHA.test(mainSha);
  const validBackend = typeof rawBackend === 'string' && SHA.test(rawBackend);
  const validFrontend = typeof rawFrontend === 'string' && SHA.test(rawFrontend);
  // Do not print unexpected public response content into CI logs.
  const backendSha = validBackend ? rawBackend : null;
  const frontendSha = validFrontend ? rawFrontend : null;

  if (!validMain) failures.push('invalid_main_sha');
  if (snapshot?.backend?.status !== 200) failures.push('backend_http_unverified');
  if (snapshot?.frontend?.status !== 200) failures.push('frontend_http_unverified');
  if (!validBackend) failures.push('invalid_backend_sha');
  if (!validFrontend) failures.push('invalid_frontend_sha');
  if (validMain && validBackend && backendSha !== mainSha) failures.push('backend_not_main');
  if (validMain && validFrontend && frontendSha !== mainSha) failures.push('frontend_not_main');
  if (validBackend && validFrontend && backendSha !== frontendSha) failures.push('public_versions_disagree');

  return { ok: failures.length === 0, mainSha, backendSha, frontendSha, failures };
}

async function publicVersion(pathname) {
  try {
    const response = await fetch(new URL(pathname, PUBLIC_ORIGIN), {
      method: 'GET',
      redirect: 'error',
      cache: 'no-store',
      headers: { accept: 'application/json', 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status !== 200) return { status: response.status, id: null };
    const payload = await response.json();
    return { status: response.status, id: payload?.id ?? null };
  } catch {
    // Fail closed without printing response bodies, cookies, or internal errors.
    return { status: null, id: null };
  }
}

export async function main(args = process.argv.slice(2)) {
  if (args.length !== 2 || args[0] !== '--main-sha' || !SHA.test(args[1])) {
    throw new Error('usage: verify-production-public-main.mjs --main-sha <40-char-GitHub-main-SHA>');
  }
  const [backend, frontend] = await Promise.all([
    publicVersion('/api/version'), publicVersion('/frontend-version'),
  ]);
  const verdict = verifyProductionPublicMain({ mainSha: args[1], backend, frontend });
  process.stdout.write(JSON.stringify(verdict) + '\n');
  if (!verdict.ok) process.exitCode = 1;
  return verdict;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(error.message + '\n');
    process.exitCode = 2;
  });
}
