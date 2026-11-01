/**
 * Public edge release gate: confirmed current fiscal zero is compatible with
 * fail-closed historical monetary holds. No other financial 200 response is
 * accepted by this narrow gate.
 */
export function safeTreasuryEdgeResponse(status, cacheControl, body) {
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
  if (o?.verified !== true || o.totalBalanceWld !== '0'
    || o.availableBalanceWld !== '0' || o.safeReserveWld !== '0'
    || o.totalCumulativeDisbursedWld !== '—' || o.totalBurnedWld !== '—'
    || o.beneficiaryCount !== null || o.activeProgramsCount !== 0
    || o.lastDisbursedAt !== '') return false;
  if (!u || typeof u !== 'object' || typeof u.isLoggedIn !== 'boolean'
    || u.citizenDividendEligible !== false || u.emergencyReliefEligible !== false
    || u.bondBoosterEligible !== false || u.activeGrantApplied !== false
    || u.userCashBalance !== '—') return false;
  return true;
}
