#!/usr/bin/env node
/**
 * Read-only host release gate. Rejects a public version that is inconsistent with
 * the release actually used by both systemd services. This is an identity gate,
 * not a substitute for database, finance, session, UI or rollback acceptance.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readlinkSync, realpathSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;

const CHANNELS = Object.freeze({
  test: {
    releaseRoot: '/srv/moneyverse-data/releases/test-current',
    backendService: 'test-main-backend.service',
    frontendService: 'test-main-frontend.service',
    versionUrl: 'https://test.easy-scraping.com/api/version',
  },
  prod: {
    releaseRoot: '/srv/moneyverse-data/releases/production-current',
    versionUrl: 'https://easy-scraping.com/api/version',
  },
});

export function parseBuildId(text) {
  const matches = text.split(/\r?\n/).filter((line) => /^\s*(?:export\s+)?BUILD_ID=/.test(line));
  if (matches.length !== 1) return null;
  const value = matches[0].replace(/^\s*(?:export\s+)?BUILD_ID=/, '').trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

/** The public version must belong to the immutable manifest's active service generation. */
export function serviceForRelease(channel, manifest, role) {
  if (!['backend', 'frontend'].includes(role)) throw new Error('invalid service role');
  if (channel === 'test') return CHANNELS.test[role + 'Service'];
  if (channel !== 'prod') throw new Error('invalid release channel');
  const match = /^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.([0-9]{1,4})$/.exec(manifest?.version ?? '');
  if (!match) throw new Error('production manifest missing a valid immutable release version');
  return `moneyverse-release-v${match[1]}-${role}.service`;
}

/** Parses systemctl's effective unit EnvironmentFiles without reading secret values into logs. */
export function parseEnvironmentFileLocations(raw) {
  return Array.from(raw.matchAll(/(\/[^\s]+)\s+\(ignore_errors=(yes|no)\)/g), (match) => ({
    file: match[1], optional: match[2] === 'yes',
  }));
}

/** systemd environment files override earlier BUILD_IDs; duplicate keys per file fail closed. */
export function mergeServiceBuildIds(texts) {
  let result = null;
  for (const text of texts) {
    const count = text.split(/\r?\n/).filter((line) => /^\s*(?:export\s+)?BUILD_ID=/.test(line)).length;
    if (count > 1) throw new Error('ambiguous duplicate BUILD_ID within environment file');
    if (count === 1) result = parseBuildId(text);
  }
  if (!SHA.test(result ?? '')) throw new Error('missing or invalid effective release BUILD_ID');
  return result;
}

function activeServiceBuildId(service) {
  const raw = execFileSync('systemctl', ['show', service, '--property=EnvironmentFiles', '--value'], {
    encoding: 'utf8', timeout: 5000,
  });
  const files = parseEnvironmentFileLocations(raw);
  if (!files.length) throw new Error('no environment files for active systemd service: ' + service);
  const contents = [];
  for (const entry of files) {
    try {
      contents.push(readFileSync(entry.file, 'utf8'));
    } catch (error) {
      if (entry.optional && error?.code === 'ENOENT') continue;
      throw error;
    }
  }
  return mergeServiceBuildIds(contents);
}

export function verifyHostRuntimeIdentity(snapshot) {
  const failures = [];
  const fail = (code) => failures.push(code);
  const expected = snapshot?.expectedSha;
  const channel = snapshot?.channel;

  if (!SHA.test(expected ?? '')) fail('invalid_expected_sha');
  if (!['test', 'prod'].includes(channel)) fail('invalid_channel');

  const manifest = snapshot?.manifest;
  if (!manifest || manifest.schemaVersion !== 1 || manifest.channel !== channel ||
      manifest.mutableGitCheckout !== false) {
    fail('missing_or_invalid_release_manifest');
  }

  for (const [field, code] of [
    ['applicationSourceSha', 'manifest_sha_mismatch'],
  ]) {
    if (manifest?.[field] !== expected) fail(code);
  }

  for (const [field, code] of [
    ['backendReleaseSha', 'backend_env_sha_mismatch'],
    ['frontendReleaseSha', 'frontend_env_sha_mismatch'],
    ['frontendBuildSha', 'frontend_artifact_sha_mismatch'],
    ['publicVersionSha', 'public_version_sha_mismatch'],
  ]) {
    if (snapshot?.[field] !== expected) fail(code);
  }

  const root = snapshot?.releasePath;
  if (!root || snapshot?.backendCwd !== path.join(root, 'backend')) fail('backend_process_directory_mismatch');
  if (!root || snapshot?.frontendCwd !== path.join(root, 'frontend')) fail('frontend_process_directory_mismatch');

  return { ok: failures.length === 0, failures };
}

function systemdProcessDirectory(service) {
  const raw = execFileSync('systemctl', ['show', service, '--property=MainPID', '--value'], {
    encoding: 'utf8',
    timeout: 5000,
  }).trim();
  const pid = Number(raw);
  if (!Number.isSafeInteger(pid) || pid <= 1) {
    throw new Error('inactive systemd service: ' + service);
  }
  return realpathSync(readlinkSync('/proc/' + pid + '/cwd'));
}

async function collectSnapshot(channel, expectedSha) {
  const cfg = CHANNELS[channel];
  const releasePath = realpathSync(cfg.releaseRoot);
  const manifest = JSON.parse(readFileSync(path.join(releasePath, '.moneyverse-release.json'), 'utf8'));
  const backendService = serviceForRelease(channel, manifest, 'backend');
  const frontendService = serviceForRelease(channel, manifest, 'frontend');

  const response = await fetch(cfg.versionUrl, {
    redirect: 'error',
    cache: 'no-store',
    signal: AbortSignal.timeout(7000),
    headers: { 'cache-control': 'no-cache' },
  });
  if (response.status !== 200) throw new Error('public version request failed: HTTP ' + response.status);
  const version = await response.json();

  return {
    channel,
    expectedSha,
    releasePath,
    manifest,
    backendReleaseSha: activeServiceBuildId(backendService),
    frontendReleaseSha: activeServiceBuildId(frontendService),
    frontendBuildSha: readFileSync(path.join(releasePath, 'frontend/.next/BUILD_ID'), 'utf8').trim(),
    publicVersionSha: version?.id,
    backendCwd: systemdProcessDirectory(backendService),
    frontendCwd: systemdProcessDirectory(frontendService),
  };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length !== 4 || args[0] !== '--channel' || args[2] !== '--sha') {
    throw new Error('usage: node scripts/release/verify-host-runtime-identity.mjs --channel test|prod --sha <40-char-source-sha>');
  }
  const channel = args[1];
  const expectedSha = args[3];
  if (!CHANNELS[channel] || !SHA.test(expectedSha)) {
    throw new Error('channel or expected source SHA invalid');
  }
  const snapshot = await collectSnapshot(channel, expectedSha);
  const verdict = verifyHostRuntimeIdentity(snapshot);
  // No secrets or full environment content are printed.
  process.stdout.write(JSON.stringify({
    channel,
    expectedSha,
    publicVersionSha: snapshot.publicVersionSha,
    releaseManifestSha: snapshot.manifest.applicationSourceSha,
    backendReleaseSha: snapshot.backendReleaseSha,
    frontendReleaseSha: snapshot.frontendReleaseSha,
    frontendBuildSha: snapshot.frontendBuildSha,
    ok: verdict.ok,
    failures: verdict.failures,
  }, null, 2) + '\n');
  if (!verdict.ok) process.exitCode = 1;
  return verdict;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    process.stderr.write('Host release identity gate BLOCKED: ' + error.message + '\n');
    process.exitCode = 1;
  });
}
