import test from 'node:test';
import assert from 'node:assert/strict';
import { assessTreasuryRecovery } from './verify-treasury-postreset-completion.mjs';

const sha = 'a'.repeat(40);
const oldProd = 'b'.repeat(40);
const oldTest = 'c'.repeat(40);
const release = '/srv/moneyverse-data/releases/prod-v2026.11.01.1611-aaaaaaaaaaaa';
const full = () => ({
  expectedSha:sha,prodSha:sha,testSha:sha,
  runningBackendCwd:release+'/backend',runningFrontendCwd:release+'/frontend',
  activeProductionPointer:release,immutableManifestPresent:true,
  fiscalEpoch:{count:1,vaults:'0',canonical:'0',postings:'0',guardCount:3,backupShaMatches:true},
  legacy:{treasuryUnlinked:0,dividendsMissingOrDangling:0},
  verifiedTreasuryFunding:true,mintIssuanceCertified:true,
  centralBankSettlementCertified:true,soeDividendReceiptCertified:true,
  soeStatusReceiptCertified:true,authenticatedE2EAndSessionContinuity:true,
  zeroDowntimeRollbackCertified:true,
});

test('a zero-based fiscal epoch with preserved but unlinked old sources never means recovered', () => {
  const e=full();e.legacy={treasuryUnlinked:552,dividendsMissingOrDangling:744};
  e.verifiedTreasuryFunding=false;e.soeDividendReceiptCertified=false;e.mintIssuanceCertified=false;
  const r=assessTreasuryRecovery(e);
  assert.equal(r.currentEpochOnlyReconciled,true);
  assert.equal(r.status,'NOT_RECOVERED');
  assert.equal(r.reportedAsOperationallyRecovered,false);
  assert.ok(r.blockingReasons.includes('HISTORICAL_TREASURY_SOURCE_UNVERIFIED'));
  assert.ok(r.blockingReasons.includes('AVAILABLE_FUNDS_NOT_CERTIFIED'));
});
test('source merged/CI green cannot override stale real Test and Production executables', () => {
  const e=full();e.prodSha=oldProd;e.testSha=oldTest;
  e.runningBackendCwd='/old/backend';e.immutableManifestPresent=false;
  const r=assessTreasuryRecovery(e);
  assert.equal(r.status,'NOT_RECOVERED');
  assert.ok(r.blockingReasons.includes('PUBLIC_PRODUCTION_STALE'));
  assert.ok(r.blockingReasons.includes('PUBLIC_TEST_STALE'));
  assert.ok(r.blockingReasons.includes('ACTIVE_RELEASE_IDENTITY_UNVERIFIED'));
});
test('resetting totals to zero does not itself certify fiscal epoch without three active guards and backup', () => {
  const e=full();e.fiscalEpoch.guardCount=0;e.fiscalEpoch.backupShaMatches=false;
  const r=assessTreasuryRecovery(e);
  assert.equal(r.currentEpochOnlyReconciled,false);
  assert.ok(r.blockingReasons.includes('CURRENT_FISCAL_EPOCH_UNVERIFIED'));
});
test('missing independent bank, mint, dividend and SOE status receipts are separate blockers', () => {
  const e=full();
  e.mintIssuanceCertified=false;e.centralBankSettlementCertified=false;
  e.soeDividendReceiptCertified=false;e.soeStatusReceiptCertified=false;
  const r=assessTreasuryRecovery(e);
  for (const reason of ['MINT_ISSUANCE_NOT_CERTIFIED','CENTRAL_BANK_SETTLEMENT_NOT_CERTIFIED',
    'SOE_DIVIDEND_RECEIPT_NOT_CERTIFIED','SOE_STATUS_RECEIPT_NOT_CERTIFIED']) {
    assert.ok(r.blockingReasons.includes(reason));
  }
});
test('even a manually supplied full-green object is not a certificate of deployed operation', () => {
  const r=assessTreasuryRecovery(full());
  assert.equal(r.status,'VERIFIED_BY_SUPPLIED_EVIDENCE_ONLY');
  assert.equal(r.reportedAsOperationallyRecovered,false);
  assert.deepEqual(r.blockingReasons,[]);
});
test('missing/invalid observations fail closed without treating null as zero', () => {
  const r=assessTreasuryRecovery({expectedSha:'x',prodSha:null,fiscalEpoch:{vaults:'0'}});
  assert.equal(r.status,'NOT_RECOVERED');
  assert.equal(r.currentEpochOnlyReconciled,false);
  assert.ok(r.blockingReasons.length>5);
});
