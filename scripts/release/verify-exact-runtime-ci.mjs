#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** A successful workflow conclusion is insufficient when runtime-check was skipped. */
export function verifyExactRuntimeCi({ sha, runId, runs, jobs }) {
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) {
    throw new Error('expected SHA must be a lowercase 40-character commit id');
  }
  if (!Number.isSafeInteger(runId) || runId < 1) throw new Error('invalid CI run id');
  if (!Array.isArray(runs?.workflow_runs)) throw new Error('missing CI workflow run evidence');
  if (!Array.isArray(jobs?.jobs) || !Number.isSafeInteger(jobs?.total_count)
    || jobs.total_count !== jobs.jobs.length) {
    throw new Error('incomplete CI runtime job evidence; pagination must not be truncated');
  }

  const exactRuns = runs.workflow_runs.filter((run) =>
    run?.name === 'CI' && run.head_sha === sha && run.head_branch === 'main' && run.event === 'push'
    && Number.isSafeInteger(run.id));
  if (exactRuns.length === 0) throw new Error('no exact main push CI run for candidate SHA');

  // Never prefer a previous green run over a newer failed/incomplete run for this SHA.
  const latest = exactRuns.reduce((left, right) => right.id > left.id ? right : left);
  if (latest.id !== runId || latest.status !== 'completed' || latest.conclusion !== 'success') {
    throw new Error('latest exact main push CI run has not completed SUCCESS');
  }

  const runtimeJob = jobs.jobs.find((job) =>
    job?.name === 'runtime-check' && job.run_id === runId && job.head_sha === sha
    && job.status === 'completed' && job.conclusion === 'success'
    && Number.isSafeInteger(job.id));
  if (!runtimeJob) throw new Error('exact main push CI runtime-check must complete SUCCESS (not skipped)');
  return { sha, runId, jobId: runtimeJob.id };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [sha, runIdText, runsFile, jobsFile] = process.argv.slice(2);
    const result = verifyExactRuntimeCi({
      sha,
      runId: Number(runIdText),
      runs: JSON.parse(readFileSync(runsFile, 'utf8')),
      jobs: JSON.parse(readFileSync(jobsFile, 'utf8')),
    });
    process.stdout.write(`Exact main runtime CI PASS: ${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`BLOCKED: ${error.message}\n`);
    process.exitCode = 1;
  }
}
