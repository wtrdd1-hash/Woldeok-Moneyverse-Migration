#!/usr/bin/env node
/**
 * Fail-closed, read-only public edge gate for an isolated Test candidate.
 * Backend SHA alone is not proof of the frontend or public financial disclosure.
 */
import process from 'node:process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const TEST_ORIGIN = 'https://test.easy-scraping.com';

export function verifyIsolatedTestPublicEvidence(snapshot) {
  const failures = [];
  const expected = snapshot?.expectedSha;
  if (!SHA.test(expected ?? '')) failures.push('invalid_expected_sha');
  if (snapshot?.backendStatus !== 200 || snapshot?.backendVersion?.id !== expected) {
    failures.push('backend_version_unverified');
  }
  if (snapshot?.frontendStatus !== 200 || snapshot?.frontendVersion?.id !== expected) {
    failures.push('frontend_version_unverified');
  }
  const treasury = snapshot?.treasuryBody;
  const cache = (snapshot?.treasuryCacheControl ?? '')
    .toLowerCase()
    .split(',')
    .map((part) => part.trim());
  if (
    snapshot?.treasuryStatus !== 503 ||
    !cache.includes('private') ||
    !cache.includes('no-store') ||
    treasury?.ok !== false ||
    treasury?.status !== 'UNVERIFIED' ||
    treasury?.code !== 'PUBLIC_TREASURY_RECONCILIATION_PENDING' ||
    treasury?.overview?.verified !== false ||
    treasury?.overview?.totalBalanceWld !== '—' ||
    !Array.isArray(treasury?.recentLedger) ||
    treasury.recentLedger.length !== 0
  ) {
    failures.push('public_treasury_not_fail_closed');
  }
  if (
    snapshot?.rootStatus !== 200 ||
    !/(?:^|[,\s])noindex(?:$|[,\s])/i.test(snapshot?.rootRobotsTag ?? '')
  ) {
    failures.push('test_root_indexable_or_unavailable');
  }
  return { ok: failures.length === 0, failures };
}

async function collectPublicEvidence(expectedSha) {
  const request = (pathname, method = 'GET') =>
    fetch(new URL(pathname, TEST_ORIGIN), {
      method,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
      headers: { 'cache-control': 'no-cache' },
    });
  const [backend, frontend, treasury, root] = await Promise.all([
    request('/api/version'),
    request('/frontend-version'),
    request('/api/treasury/overview'),
    request('/', 'HEAD'),
  ]);
  const jsonOrNull = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };
  const [backendVersion, frontendVersion, treasuryBody] = await Promise.all([
    jsonOrNull(backend),
    jsonOrNull(frontend),
    jsonOrNull(treasury),
  ]);
  return {
    expectedSha,
    backendStatus: backend.status,
    backendVersion,
    frontendStatus: frontend.status,
    frontendVersion,
    treasuryStatus: treasury.status,
    treasuryCacheControl: treasury.headers.get('cache-control'),
    treasuryBody,
    rootStatus: root.status,
    rootRobotsTag: root.headers.get('x-robots-tag'),
  };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length !== 2 || args[0] !== '--sha' || !SHA.test(args[1])) {
    throw new Error('usage: verify-isolated-test-public.mjs --sha <exact-40-character-source-sha>');
  }
  const verdict = verifyIsolatedTestPublicEvidence(await collectPublicEvidence(args[1]));
  process.stdout.write(
    JSON.stringify({ channel: 'test', expectedSha: args[1], ...verdict }) + '\n',
  );
  if (!verdict.ok) process.exitCode = 1;
  return verdict;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(() => {
    process.stderr.write(
      'Isolated Test public-edge gate BLOCKED: missing or unreachable evidence\n',
    );
    process.exitCode = 1;
  });
}
