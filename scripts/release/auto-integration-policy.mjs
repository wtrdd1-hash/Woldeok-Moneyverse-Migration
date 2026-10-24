/**
 * Advisory review readiness for independently verified evidence only.
 * No caller may interpret this function as automated merge or deployment authority.
 * The integration workflow never mutates refs or dispatches release workflows.
 */
export function assessReleaseEvidence(evidence) {
  const blockers = [];
  const pr = evidence?.pr ?? {};
  const candidate = evidence?.candidate ?? {};
  const ci = evidence?.ci ?? {};
  const test = evidence?.test ?? {};
  const security = evidence?.security ?? {};
  const sha = pr.headSha;
  const isSha = (value) => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
  const isDigest = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

  if (!isSha(sha)) blockers.push('PR head SHA is missing or invalid');
  if (!isSha(evidence?.currentMainSha) || pr.baseSha !== evidence.currentMainSha) {
    blockers.push('main SHA drift or missing main identity');
  }
  if (pr.draft !== false || pr.hold !== false || pr.approved !== true) {
    blockers.push('PR is Draft/HOLD or lacks approval');
  }
  if (candidate.headSha !== sha || candidate.conclusion !== 'success') {
    blockers.push('candidate SHA or build status is not exact success');
  }
  if (!isDigest(evidence?.expectedMigrationSetHash) ||
      candidate.migrationSetHash !== evidence.expectedMigrationSetHash ||
      test.migrationSetHash !== evidence.expectedMigrationSetHash) {
    blockers.push('migration-set digest is missing or stale');
  }
  if (ci.headSha !== sha || ci.conclusion !== 'success') {
    blockers.push('required CI not successful at exact PR head');
  }
  if (test.headSha !== sha || test.runtimeSha !== sha || test.deploymentState !== 'success') {
    blockers.push('actual Test deployment/runtime SHA not independently successful');
  }
  if (test.backendApiDb !== 'pass') blockers.push('Test backend/API/DB not verified');
  if (test.authenticatedFinanceE2e !== 'pass') blockers.push('authenticated finance E2E not verified');
  if (test.postgresAcl !== 'pass') blockers.push('real PostgreSQL ACL not verified');
  if (test.backupRestore !== 'pass') blockers.push('isolated backup/restore not verified');
  if (test.independentlyVerifiedSignedAttestation !== true) {
    blockers.push('independent signed Test attestation not verified');
  }
  if (security.headSha !== sha || security.audit !== 'pass') {
    blockers.push('full security audit not successful at exact PR head');
  }

  return {
    manualReviewReady: blockers.length === 0,
    automationMayMerge: false,
    automationMayPromote: false,
    blockers,
  };
}
