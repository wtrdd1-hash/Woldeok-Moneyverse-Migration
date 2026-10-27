#!/usr/bin/env node
/**
 * v2026.10.27.1317
 * Clean only completed, old, QA-owned scratch runs. Never touch other files.
 * English canonical; Korean operator notes in docs.
 */
import {
  existsSync, lstatSync, mkdirSync, readdirSync, readFileSync,
  rmSync, statfsSync, statSync, writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const QA_SCRATCH = '/tmp/moneyverse-qa-disposable';
const ROOT_MARKER = '.moneyverse-qa-disposable-v1';
const DONE_MARKER = '.qa-complete';
const SIGNATURE = 'moneyverse-qa-disposable-v1\n';
const RUN_RE = /^run-[0-9]{8}T[0-9]{6}Z-[a-z0-9-]{1,48}$/;
const RETENTION_MS = 72 * 60 * 60 * 1000;
const MAX_RUNS = 20;
const MAX_BYTES = 2 * 1024 ** 3;

function inspectTree(path, cutoff, state) {
  const st = lstatSync(path);
  if (st.isSymbolicLink() || st.uid !== process.getuid() || st.mtimeMs > cutoff) return false;
  state.bytes += st.isFile() ? st.size : 0;
  if (state.bytes > MAX_BYTES) return false;
  if (st.isDirectory()) {
    for (const item of readdirSync(path)) {
      if (!inspectTree(join(path, item), cutoff, state)) return false;
    }
  } else if (!st.isFile()) return false;
  return true;
}

export function cleanupQaScratch(root = QA_SCRATCH, opts = {}) {
  const base = resolve(root);
  const dryRun = Boolean(opts.dryRun);
  const now = opts.now ?? Date.now();
  const cutoff = now - (opts.retentionMs ?? RETENTION_MS);
  if (!existsSync(base)) {
    if (dryRun) return { status: 'missing', deleted: 0, bytes: 0, candidates: 0 };
    mkdirSync(base, { mode: 0o700 });
    writeFileSync(join(base, ROOT_MARKER), SIGNATURE, { flag: 'wx', mode: 0o600 });
  }
  const rootStat = lstatSync(base);
  const markerPath = join(base, ROOT_MARKER);
  const markerStat = existsSync(markerPath) ? lstatSync(markerPath) : null;
  if (!markerStat || !markerStat.isFile() || markerStat.isSymbolicLink()
      || markerStat.uid !== process.getuid() || markerStat.size > 64
      || !rootStat.isDirectory() || rootStat.isSymbolicLink()
      || rootStat.uid !== process.getuid() || (rootStat.mode & 0o077) !== 0
      || readFileSync(join(base, ROOT_MARKER), 'utf8') !== SIGNATURE) {
    throw new Error('QA scratch root is not isolated/owned/marked');
  }
  let deleted = 0;
  let bytes = 0;
  let candidates = 0;
  const skipped = [];
  for (const name of readdirSync(base).sort()) {
    if (name === ROOT_MARKER || !RUN_RE.test(name)) continue;
    const candidate = join(base, name);
    const marker = join(candidate, DONE_MARKER);
    const st = lstatSync(candidate);
    if (!st.isDirectory() || st.isSymbolicLink() || !existsSync(marker)) continue;
    const mark = lstatSync(marker);
    if (!mark.isFile() || mark.isSymbolicLink() || mark.uid !== process.getuid()
        || mark.mtimeMs > cutoff || readFileSync(marker, 'utf8') !== 'complete\n') continue;
    const state = { bytes: 0 };
    if (!inspectTree(candidate, cutoff, state) || bytes + state.bytes > MAX_BYTES) {
      skipped.push(name);
      continue;
    }
    candidates++;
    if (!dryRun && deleted < MAX_RUNS) {
      rmSync(candidate, { recursive: true, force: false });
      deleted++;
      bytes += state.bytes;
    }
  }
  return { status: 'ok', dryRun, deleted, bytes, candidates, skipped };
}

function disk(path) {
  const v = statfsSync(path);
  return { usedPct: Math.ceil(100 * (v.blocks - v.bfree) / (v.blocks - v.bfree + v.bavail)),
    availableGiB: Number((v.bavail * v.bsize / 1024 ** 3).toFixed(2)) };
}

function main() {
  const args = process.argv.slice(2);
  if (args.some((a) => a !== '--dry-run')) throw new Error('Only --dry-run is supported');
  const before = { root: disk('/'), data: disk('/srv/moneyverse-data') };
  const cleanup = cleanupQaScratch(QA_SCRATCH, { dryRun: args.includes('--dry-run') });
  const after = { root: disk('/'), data: disk('/srv/moneyverse-data') };
  console.log(JSON.stringify({ event: 'scheduled_qa_disk_hygiene', before, cleanup, after }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) { console.error('[QA_DISK_CLEANUP_FAIL]', err.message); process.exitCode = 2; }
}
