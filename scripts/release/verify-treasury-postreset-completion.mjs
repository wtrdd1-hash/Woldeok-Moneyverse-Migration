#!/usr/bin/env node
/**
 * v1611 — Fail-closed observation matrix. A green CI, a zeroed vault, or a
 * merged PR is NEVER evidence that all financial services are operational.
 * Does not mutate DB or trigger payments. All external E2E proof is separate.
 */
import { execFileSync } from 'node:child_process';
import { realpathSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const ROOT = '/srv/moneyverse-data/releases';
const PROD = 'https://easy-scraping.com/api/version';
const TEST = 'https://test.easy-scraping.com/api/version';

export function assessTreasuryRecovery(e) {
  const errors = [];
  const fail = code => errors.push(code);
  if (!SHA.test(e?.expectedSha ?? '')) fail('INVALID_EXPECTED_SOURCE_SHA');
  if (e?.prodSha !== e?.expectedSha) fail('PUBLIC_PRODUCTION_STALE');
  if (e?.testSha !== e?.expectedSha) fail('PUBLIC_TEST_STALE');

  const backend = e?.runningBackendCwd;
  const frontend = e?.runningFrontendCwd;
  const pointer = e?.activeProductionPointer;
  const expectedBackend = pointer ? path.join(pointer, 'backend') : null;
  const expectedFrontend = pointer ? path.join(pointer, 'frontend') : null;
  if (!pointer || !e?.immutableManifestPresent ||
      backend !== expectedBackend || frontend !== expectedFrontend) {
    fail('ACTIVE_RELEASE_IDENTITY_UNVERIFIED');
  }
  const current = e?.fiscalEpoch;
  // A zeroed old vault and a matching zero journal alone do not certify
  // archive source links, future payouts or minting.
  if (!current || current.count !== 1 || current.vaults !== '0' ||
      current.canonical !== '0' || current.postings !== '0' ||
      current.guardCount !== 3 || current.backupShaMatches !== true) {
    fail('CURRENT_FISCAL_EPOCH_UNVERIFIED');
  }
  if (!e?.legacy || !Number.isSafeInteger(e.legacy.treasuryUnlinked) ||
      !Number.isSafeInteger(e.legacy.dividendsMissingOrDangling) ||
      e.legacy.treasuryUnlinked !== 0 ||
      e.legacy.dividendsMissingOrDangling !== 0) {
    fail('HISTORICAL_TREASURY_SOURCE_UNVERIFIED');
  }
  // Separate business gates; never infer any from 'RECONCILED' current zero.
  if (e?.verifiedTreasuryFunding !== true) fail('AVAILABLE_FUNDS_NOT_CERTIFIED');
  if (e?.mintIssuanceCertified !== true) fail('MINT_ISSUANCE_NOT_CERTIFIED');
  if (e?.centralBankSettlementCertified !== true) fail('CENTRAL_BANK_SETTLEMENT_NOT_CERTIFIED');
  if (e?.soeDividendReceiptCertified !== true) fail('SOE_DIVIDEND_RECEIPT_NOT_CERTIFIED');
  if (e?.soeStatusReceiptCertified !== true) fail('SOE_STATUS_RECEIPT_NOT_CERTIFIED');
  if (e?.authenticatedE2EAndSessionContinuity !== true) fail('AUTHENTICATED_E2E_UNVERIFIED');
  if (e?.zeroDowntimeRollbackCertified !== true) fail('ROLLBACK_GATE_UNVERIFIED');

  return {
    status: errors.length ? 'NOT_RECOVERED' : 'VERIFIED_BY_SUPPLIED_EVIDENCE_ONLY',
    reportedAsOperationallyRecovered: false,
    currentEpochOnlyReconciled: current === undefined || current === null ? null : current.count === 1 &&
      current.vaults === '0' && current.canonical === '0' &&
      current.postings === '0' && current.guardCount === 3 &&
      current.backupShaMatches === true,
    blockingReasons: errors,
  };
}

async function fetchPublicSha(url) {
  const response = await fetch(url, {
    cache: 'no-store', redirect: 'error',
    signal: AbortSignal.timeout(8000),
    headers: { 'cache-control': 'no-cache' },
  });
  if (response.status !== 200) return null;
  const body = await response.json();
  return SHA.test(body?.id ?? '') ? body.id : null;
}

function serviceCwd(service) {
  const pid = execFileSync('systemctl', ['show',service,'--property=MainPID','--value'],
    { encoding:'utf8', timeout:5000 }).trim();
  if (!/^[1-9][0-9]*$/.test(pid)) return null;
  return realpathSync('/proc/'+pid+'/cwd');
}

async function main(args = process.argv.slice(2)) {
  if (args.length !== 2 || args[0] !== '--sha' || !SHA.test(args[1])) {
    throw new Error('usage: node scripts/release/verify-treasury-postreset-completion.mjs --sha <40-char-main-sha>');
  }
  const expectedSha = args[1];
  const [prodSha, testSha] = await Promise.all([fetchPublicSha(PROD),fetchPublicSha(TEST)]);
  const link = path.join(ROOT, 'production-current');
  const pointer = realpathSync(link);
  const runningBackendCwd = serviceCwd('moneyverse-release-v1550-backend.service');
  const runningFrontendCwd = serviceCwd('moneyverse-release-v1550-frontend.service');
  const immutableManifestPresent = existsSync(path.join(pointer, '.moneyverse-release.json'));
  const result = assessTreasuryRecovery({
    expectedSha, prodSha, testSha, runningBackendCwd, runningFrontendCwd,
    activeProductionPointer: pointer, immutableManifestPresent,
    // Financial and authenticated business evidence cannot be inferred from
    // a public version endpoint. Supply none: these gates remain blocked.
  });
  console.log(JSON.stringify({
    observedAt: new Date().toISOString(), expectedSha, prodSha, testSha,
    activeReleasePointer: pointer, runningBackendCwd, runningFrontendCwd,
    immutableManifestPresent, ...result,
  }, null, 2));
  process.exitCode = 2; // This command is an independent preflight, NOT a financial release permit.
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(err => {
    console.error(JSON.stringify({status:'NOT_RECOVERED', reason:err.code || 'EVIDENCE_UNAVAILABLE'}));
    process.exitCode=2;
  });
}
