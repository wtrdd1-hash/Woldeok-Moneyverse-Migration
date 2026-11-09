/**
 * Public edge release gate: confirmed current fiscal zero is compatible with
 * fail-closed historical monetary holds. No other financial 200 response is
 * accepted by this narrow gate.
 */
/** Positive CURRENT-epoch cash may pass ONLY with independently read PostgreSQL proof.
 * This does not certify historic payments, legacy SWF valuation or issuance.
 * Without that proof the established public 503/verified-zero gate is unchanged.
 */
export function safeTreasuryEdgeResponse(status, cacheControl, body, trustedFiscalProof = null) {
  const cache = (cacheControl ?? '').toLowerCase().split(',').map((part) => part.trim());
  if (!cache.includes('private') || !cache.includes('no-store')
    || !body || typeof body !== 'object' || Array.isArray(body)
    || !Array.isArray(body.recentLedger) || body.recentLedger.length !== 0) return false;

  if (status === 503) {
    return body.ok === false
      && body.status === 'UNVERIFIED'
      && body.code === 'PUBLIC_TREASURY_RECONCILIATION_PENDING'
      && body.overview?.verified === false
      && body.overview?.totalBalanceWld === '—';
  }
  if (status !== 200 || body.ok !== true || body.status !== 'RECONCILED') return false;
  const o = body.overview;
  const u = body.userEligibility;
  // Until independently settled historical payments are certified, the ONLY
  // authenticated public amount is the exact zero current fiscal epoch.
  const certifiedCurrentZero = o?.totalBalanceWld === '0';
  const positive = o && /^[1-9][0-9]*$/.test(o.totalBalanceWld ?? '');
  const certifiedCurrentPositive = positive && trustedFiscalProof?.source === 'direct-postgres-read-only'
    && trustedFiscalProof.integrityStatus === 'CLEAN'
    && /^[1-9][0-9]*$/.test(trustedFiscalProof.epochOpenedAt ?? '')
    && trustedFiscalProof.invalidNewSources === '0'
    && trustedFiscalProof.vaultTotal === o.totalBalanceWld
    && trustedFiscalProof.canonicalTotal === o.totalBalanceWld
    && trustedFiscalProof.journalTotal === o.totalBalanceWld;
  if (o?.verified !== true || !(certifiedCurrentZero || certifiedCurrentPositive)
    || o.availableBalanceWld !== o.totalBalanceWld || o.safeReserveWld !== '0'
    || o.totalCumulativeDisbursedWld !== '—' || o.totalBurnedWld !== '—'
    || o.beneficiaryCount !== null || o.activeProgramsCount !== 0
    || o.lastDisbursedAt !== '') return false;
  if (!u || typeof u !== 'object' || typeof u.isLoggedIn !== 'boolean'
    || u.citizenDividendEligible !== false || u.emergencyReliefEligible !== false
    || u.bondBoosterEligible !== false || u.activeGrantApplied !== false
    || u.userCashBalance !== '—') return false;
  return true;
}
