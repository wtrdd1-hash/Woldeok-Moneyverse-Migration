#!/usr/bin/env node
// Read-only preflight for a proposed host release deletion. Never deletes files.
import fs from 'node:fs';
import path from 'node:path';

export function assessReleaseRetention({ root, candidate, pointers, liveCwds }) {
  const reasons = [];
  const rootPath = path.resolve(root);
  const candidatePath = path.resolve(candidate);
  const inside = path.dirname(candidatePath) === rootPath;
  if (!inside || !path.basename(candidatePath).startsWith('prod-')) {
    reasons.push('OUTSIDE_PRODUCTION_RELEASE_ROOT');
  }
  if (!fs.existsSync(candidatePath) || !fs.lstatSync(candidatePath).isDirectory() || fs.lstatSync(candidatePath).isSymbolicLink()) {
    reasons.push('CANDIDATE_NOT_REAL_DIRECTORY');
  }
  const canonical = fs.realpathSync.native(rootPath);
  if (inside && fs.existsSync(candidatePath) && !fs.lstatSync(candidatePath).isSymbolicLink()) {
    if (path.dirname(fs.realpathSync.native(candidatePath)) !== canonical) reasons.push('CANDIDATE_PATH_ESCAPE');
  }
  for (const [name, pointer] of Object.entries(pointers)) {
    if (!pointer || !fs.existsSync(pointer)) {
      reasons.push('POINTER_UNVERIFIED:' + name);
      continue;
    }
    if (fs.realpathSync.native(pointer) === candidatePath) reasons.push('POINTER_REFERENCES_CANDIDATE:' + name);
  }
  if (!Array.isArray(liveCwds) || liveCwds.length === 0) reasons.push('LIVE_PROCESS_SET_UNVERIFIED');
  for (const cwd of liveCwds || []) {
    if (!cwd || cwd.endsWith(' (deleted)')) {
      reasons.push('LIVE_CWD_UNVERIFIED');
    } else if (cwd === candidatePath || cwd.startsWith(candidatePath + path.sep)) {
      reasons.push('LIVE_PROCESS_REFERENCES_CANDIDATE');
    }
  }
  return { safeToConsiderDeletion: reasons.length === 0, reasons };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const [root, candidate] = process.argv.slice(2);
  if (!root || !candidate) {
    console.error('Usage: check-release-retention.mjs <release-root> <candidate>');
    process.exit(64);
  }
  try {
    const pointers = {
      productionCurrent: path.join(root, 'production-current'),
      productionPrevious: path.join(root, 'production-previous'),
    };
    const units = ['moneyverse-backend', 'moneyverse-frontend'];
    const { execFileSync } = await import('node:child_process');
    const liveCwds = units.map((unit) => {
      const pid = execFileSync('systemctl', ['show', '--property=MainPID', '--value', unit], { encoding: 'utf8' }).trim();
      if (!/^\d+$/.test(pid) || pid === '0') return null;
      try { return fs.readlinkSync('/proc/' + pid + '/cwd'); } catch { return null; }
    });
    const result = assessReleaseRetention({ root, candidate, pointers, liveCwds });
    console.log(JSON.stringify(result));
    if (!result.safeToConsiderDeletion) process.exitCode = 1;
  } catch (error) {
    console.error('RETENTION_PREFLIGHT_UNVERIFIED:', error.message);
    process.exitCode = 1;
  }
}
