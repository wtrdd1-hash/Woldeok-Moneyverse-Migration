#!/usr/bin/env node
/**
 * Read-only evidence gate for PR retention audits. No close/delete/merge calls.
 * A non-ancestor commit is evidence of missing ancestry, not necessarily missing
 * patch-equivalent code. Only independent verification can justify retirement.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function indexedPrs(prs, label) {
  if (!Array.isArray(prs)) throw new TypeError(`${label} must be an array`);
  const byNumber = new Map();
  for (const pr of prs) {
    if (!Number.isSafeInteger(pr?.number) || pr.number <= 0 ||
        typeof pr.headRefName !== 'string' ||
        !/^[a-f0-9]{40}$/i.test(pr.headRefOid ?? '')) {
      throw new TypeError(`${label} contains invalid PR evidence`);
    }
    if (byNumber.has(pr.number)) throw new Error(`${label} contains duplicate PR #${pr.number}`);
    byNumber.set(pr.number, pr);
  }
  return byNumber;
}

export function auditPrRetention({ baseline, current, ancestry = [], mainSha }) {
  if (!/^[a-f0-9]{40}$/i.test(mainSha ?? '')) throw new TypeError('mainSha must be an exact 40-digit SHA');
  const before = indexedPrs(baseline, 'baseline');
  const after = indexedPrs(current, 'current');
  if (before.size === 0) throw new Error('empty baseline cannot authorize cleanup');
  if (!Array.isArray(ancestry)) throw new TypeError('ancestry must be an array');
  const evidence = new Map();
  for (const item of ancestry) {
    if (/^[a-f0-9]{40}$/i.test(item?.sha ?? '') && typeof item.branch === 'string') {
      evidence.set(`${item.branch}\u0000${item.sha}`, item);
    }
  }
  const safe = [];
  const unsafe = [];
  for (const [number, old] of before) {
    const fresh = after.get(number);
    let reason;
    if (!fresh) reason = 'MISSING_PR_SNAPSHOT';
    else if (fresh.headRefName !== old.headRefName || fresh.headRefOid !== old.headRefOid) reason = 'HEAD_CHANGED';
    else if (fresh.mergedAt || String(fresh.state).toUpperCase() === 'MERGED') {
      const proof = evidence.get(`${old.headRefName}\u0000${old.headRefOid}`);
      if (proof?.behind_by === 0) {
        safe.push(number);
        continue;
      }
      reason = 'MERGED_HEAD_NOT_VERIFIED';
    } else if (String(fresh.state).toUpperCase() === 'OPEN') {
      safe.push(number);
      continue;
    } else {
      const proof = evidence.get(`${old.headRefName}\u0000${old.headRefOid}`);
      reason = !proof || !Number.isInteger(proof.behind_by)
        ? 'UNMERGED_CLOSED_UNKNOWN_ANCESTRY'
        : proof.behind_by > 0 ? 'UNMERGED_CLOSED_NONANCESTOR'
          : 'UNMERGED_CLOSED_UNVERIFIED';
    }
    unsafe.push({ number, branch: old.headRefName, sha: old.headRefOid, reason });
  }
  return { status: unsafe.length ? 'BLOCKED' : 'PASS', mainSha,
    baselineCount: before.size, currentCount: after.size, safe, unsafe };
}

function parseArgs(argv) {
  const values = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i]?.startsWith('--') || !argv[i + 1]) throw new Error('Expected --baseline, --current, --ancestry, --main-sha');
    values.set(argv[i], argv[i + 1]);
  }
  for (const required of ['--baseline', '--current', '--ancestry', '--main-sha']) {
    if (!values.has(required)) throw new Error(`Missing ${required}`);
  }
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const read = (flag) => JSON.parse(readFileSync(args.get(flag), 'utf8'));
    const ancestry = read('--ancestry');
    if (ancestry.main && ancestry.main !== args.get('--main-sha')) throw new Error('Ancestry evidence main SHA mismatch');
    const report = auditPrRetention({
      baseline: read('--baseline'), current: read('--current'),
      ancestry: Array.isArray(ancestry) ? ancestry : ancestry.results,
      mainSha: args.get('--main-sha'),
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = report.status === 'PASS' ? 0 : 2;
  } catch (error) {
    process.stderr.write(`BLOCKED: ${error.message}\n`);
    process.exitCode = 2;
  }
}
