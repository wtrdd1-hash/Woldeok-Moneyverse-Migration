#!/usr/bin/env node
/**
 * Fail-closed, read-only public edge gate for an isolated Test candidate.
 * Backend SHA alone is not proof of the frontend or public financial disclosure.
 */
import process from 'node:process';
import { safeTreasuryEdgeResponse } from './certified-treasury-edge-evidence.mjs';
import path from 'node:path';
import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const TEST_ORIGIN = 'https://test.easy-scraping.com';

const EVIDENCE_PATHS = new Set(['/api/version','/frontend-version','/api/treasury/overview','/']);

export function createTestPublicRequester(operatorAuthorization, fetchImpl = fetch) {
  if (operatorAuthorization !== undefined &&
      (typeof operatorAuthorization !== 'string' || !/^Basic [A-Za-z0-9+/]+=*$/.test(operatorAuthorization))) {
    throw new Error('Invalid scoped Test authorization');
  }
  return (pathname, method = 'GET') => {
    if (!EVIDENCE_PATHS.has(pathname) || !['GET','HEAD'].includes(method)) {
      throw new Error('Only fixed read-only Test evidence probes are allowed');
    }
    const headers = {'cache-control':'no-cache'};
    if (operatorAuthorization !== undefined) headers.authorization = operatorAuthorization;
    return fetchImpl(new URL(pathname, TEST_ORIGIN), {
      method, redirect:'error', cache:'no-store', signal:AbortSignal.timeout(7000), headers,
    });
  };
}

export async function loadTestOperatorAuthorization(filename) {
  if (!path.isAbsolute(filename) || !fsConstants.O_NOFOLLOW || typeof process.getuid !== 'function') {
    throw new Error('Scoped operator evidence requires a private absolute Unix file');
  }
  const file = await fs.open(filename, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    const stat = await file.stat();
    if (!stat.isFile() || (stat.mode & 0o077) !== 0 || stat.size > 4096 ||
        (stat.uid !== process.getuid() && process.getuid() !== 0)) {
      throw new Error('Operator credential file is not private');
    }
    const data = JSON.parse(await file.readFile('utf8'));
    if (data.purpose !== 'native-test-operator' || data.origin !== TEST_ORIGIN ||
        data.username !== 'native-qa' || typeof data.password !== 'string' ||
        !/^[A-Za-z0-9_-]{32,128}$/.test(data.password)) {
      throw new Error('Operator credential scope is invalid');
    }
    return 'Basic ' + Buffer.from(data.username + ':' + data.password).toString('base64');
  } finally {
    await file.close();
  }
}

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
  if (!safeTreasuryEdgeResponse(snapshot?.treasuryStatus, snapshot?.treasuryCacheControl, snapshot?.treasuryBody)) {
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

async function collectPublicEvidence(expectedSha, operatorAuthorization) {
  const request = createTestPublicRequester(operatorAuthorization);
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
  if (![2,4].includes(args.length) || args[0] !== '--sha' || !SHA.test(args[1]) ||
      (args.length === 4 && args[2] !== '--operator-auth-file')) {
    throw new Error('usage: verify-isolated-test-public.mjs --sha <exact-40-character-source-sha> [--operator-auth-file /private/scoped.json]');
  }
  const authorization = args.length === 4 ? await loadTestOperatorAuthorization(args[3]) : undefined;
  const verdict = verifyIsolatedTestPublicEvidence(await collectPublicEvidence(args[1], authorization));
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
