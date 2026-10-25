import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateBuildPreflight, requiresDataMount } from './build-preflight.mjs';

const GiB = 1024 ** 3;
const healthy = () => ({
  separateDisks: true,
  root: { deviceId: 1, percentUsed: 60, freeBytes: 12 * GiB },
  data: { deviceId: 2, percentUsed: 45, freeBytes: 45 * GiB },
});

test('permits healthy builds only on the separate data volume', () => {
  const result = evaluateBuildPreflight(healthy(), 2);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'READY_FOR_BUILD');
  assert.deepEqual(result.blockers, []);
});

test('blocks critical root occupancy at 90 percent, without deleting anything', () => {
  const layout = healthy();
  layout.root.percentUsed = 90;
  const result = evaluateBuildPreflight(layout, 2);
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('root_critical_occupancy'));
});

test('blocks low usable root bytes even below 90 percent', () => {
  const layout = healthy();
  layout.root.percentUsed = 88;
  layout.root.freeBytes = GiB;
  assert.ok(evaluateBuildPreflight(layout, 2).blockers.includes('root_insufficient_free_bytes'));
});

test('blocks builds from root worktrees, even if the root has room', () => {
  assert.ok(evaluateBuildPreflight(healthy(), 1).blockers.includes('build_workspace_not_on_data_volume'));
});

test('blocks shared root/data mount and data volume under minimum free budget', () => {
  const same = healthy();
  same.separateDisks = false;
  same.data.deviceId = 1;
  assert.ok(evaluateBuildPreflight(same, 1).blockers.includes('data_volume_not_separate'));
  const full = healthy();
  full.data.freeBytes = 7 * GiB;
  assert.ok(evaluateBuildPreflight(full, 2).blockers.includes('data_insufficient_free_bytes'));
});

test('missing or invalid measurements fail closed', () => {
  assert.equal(evaluateBuildPreflight(null, undefined).ok, false);
  const layout = healthy();
  delete layout.root.freeBytes;
  assert.ok(evaluateBuildPreflight(layout, 2).blockers.includes('unverified_disk_measurements'));
});

test('top-level build command invokes host capacity preflight before expensive work', () => {
  const { scripts } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.match(scripts.build, /^node ops\/storage\/build-preflight\.mjs && /);
});

test('miniPC hostname cannot bypass missing data mount; unrelated CI runner may skip', () => {
  assert.equal(requiresDataMount('debian13', false), true);
  assert.equal(requiresDataMount('github-runner', false), false);
  assert.equal(requiresDataMount('github-runner', true), true);
});
