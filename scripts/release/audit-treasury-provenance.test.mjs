import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  evaluateTreasuryProvenance,
  readTreasuryProvenanceSnapshot,
} from './audit-treasury-provenance.mjs';

const baseline = {
  identity: { database: 'woldeok_moneyverse_dev', role: 'moneyverse_app' },
  summary: {
    legacy_total: 552, legacy_unlinked: 552, legacy_linked: 0, invalid_wld: 0,
    canonical_transactions: 891, canonical_postings: 1829,
  },
  types: [
    { type: 'FEE_RECIRCULATION', count: 502 },
    { type: 'MARKET_STIMULUS', count: 26 },
    { type: 'ABSORPTION_SINK', count: 9 },
    { type: 'OTHER', count: 15 },
  ],
  correlation: {
    no_candidate: 551, one_candidate: 1, multiple_candidates: 0,
  },
  sourceDividends: {
    enterprise_dividend_total: 744,
    unlinked: 738,
    dangling_canonical_id: 6,
    linked_to_canonical: 0,
  },
};
test('all 552 legacy events remain held; coincidental matching cannot certify transfer', () => {
  const out = evaluateTreasuryProvenance(baseline);
  assert.equal(out.monetaryReleaseAuthorized, false);
  assert.equal(out.status, 'BLOCKED_LEGACY_TREASURY_PROVENANCE');
  assert.equal(out.legacyUnlinkedCount, 552);
  assert.equal(out.coincidenceOnly.oneCandidate, 1);
  assert.equal(out.enterpriseDividendProvenance.unlinked, 738);
  assert.equal(out.enterpriseDividendProvenance.danglingCanonicalId, 6);
  assert.match(out.warning, /not evidence/i);
  assert(!JSON.stringify(out).includes('127.0.0.1'));
});
test('even all direct links do not authorize payments without independent certification', () => {
  const out = evaluateTreasuryProvenance({
    ...baseline, summary: { ...baseline.summary, legacy_unlinked: 0, legacy_linked: 552 },
    correlation: { no_candidate: 0, one_candidate: 0, multiple_candidates: 0 },
    sourceDividends: { enterprise_dividend_total: 0, unlinked: 0, dangling_canonical_id: 0, linked_to_canonical: 0 },
  });
  assert.equal(out.monetaryReleaseAuthorized, false);
  assert.equal(out.status, 'INDEPENDENT_RECONCILIATION_CERTIFICATION_REQUIRED');
});
test('fails closed for forged identity, wrong role, missing or contradictory counts', () => {
  for (const x of [
    null,
    { ...baseline, identity: { database: 'test', role: 'moneyverse_app' } },
    { ...baseline, identity: { database: 'woldeok_moneyverse_dev', role: 'moneyverse_migrator' } },
    { ...baseline, summary: { ...baseline.summary, legacy_unlinked: 553 } },
    { ...baseline, correlation: { ...baseline.correlation, no_candidate: 550 } },
    { ...baseline, types: [{ type: 'FEE_RECIRCULATION', count: 501 }] },
    { ...baseline, summary: { ...baseline.summary, canonical_transactions: NaN } },
    { ...baseline, summary: { ...baseline.summary, invalid_wld: 1 } },
    { ...baseline, types: [{ type: 'INJECTION', count: -1 }] },
    { ...baseline, types: [{ type: 'BAD DATA', count: 552 }] },
    { ...baseline, sourceDividends: { ...baseline.sourceDividends, dangling_canonical_id: 7 } },
    { ...baseline, sourceDividends: null },
  ]) {
    const out = evaluateTreasuryProvenance(x);
    assert.equal(out.status, 'BLOCKED_UNVERIFIED_AUDIT_INPUT');
    assert.equal(out.monetaryReleaseAuthorized, false);
  }
});
test('no legacy records but unlinked enterprise dividends still deny payouts', () => {
  const out = evaluateTreasuryProvenance({
    ...baseline,
    summary: { ...baseline.summary, legacy_total: 0, legacy_unlinked: 0, legacy_linked: 0 },
    types: [], correlation: { no_candidate: 0, one_candidate: 0, multiple_candidates: 0 },
  });
  assert.equal(out.monetaryReleaseAuthorized, false);
  assert.equal(out.status, 'BLOCKED_SOURCE_DIVIDEND_PROVENANCE');
});
test('reads consistent snapshot read-only and rolls back even on query failure', async () => {
  const calls = [];
  const client = { async query(sql) {
    calls.push(sql);
    if (sql.includes('current_database()')) return { rows: [baseline.identity] };
    if (sql.includes('legacy_total')) return { rows: [baseline.summary] };
    if (sql.includes('GROUP BY tx_type')) return { rows: baseline.types.map(({ type, count }) => ({ type, count })) };
    if (sql.includes('no_candidate')) return { rows: [baseline.correlation] };
    if (sql.includes('enterprise_dividend_total')) return { rows: [baseline.sourceDividends] };
    return { rows: [] };
  } };
  assert.deepEqual(await readTreasuryProvenanceSnapshot(client), baseline);
  assert.equal(calls[0], 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(calls.at(-1), 'ROLLBACK');
  assert(calls.some(x => String(x).includes('statement_timeout')));
  assert(!calls.some(x => /^\s*(UPDATE|INSERT|DELETE|GRANT|TRUNCATE)\b/i.test(String(x))));
  const errors = [];
  const failingClient = { async query(sql) { errors.push(sql); if (String(sql).includes('legacy_total')) throw new Error('missing evidence'); return { rows: [baseline.identity] }; } };
  await assert.rejects(readTreasuryProvenanceSnapshot(failingClient), /missing evidence/);
  assert.equal(errors.at(-1), 'ROLLBACK');
});
