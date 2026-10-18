/**
 * Full functional acceptance is not the same as receiving an HTTP response.
 * This helper never accepts a bare route crawl (including repeated crawls)
 * as evidence for signed-in actions, browser layout or financial settlement.
 */
const REQUIRED = Object.freeze([
  'httpRoutes',
  'authenticatedUiActions',
  'realViewportMeasurements',
  'localizedContentChecks',
  'ledgerReconciledTransactions',
  'adminAuthorizationFlows',
  'sessionContinuity',
]);

export function assessFullSiteAcceptance(evidence = {}) {
  const missing = REQUIRED.filter((key) => evidence[key] !== true);
  return {
    ok: missing.length === 0,
    status: missing.length === 0 ? 'ACCEPTANCE_EVIDENCE_COMPLETE' : 'BLOCKED_E2E_EVIDENCE_REQUIRED',
    missing,
  };
}
