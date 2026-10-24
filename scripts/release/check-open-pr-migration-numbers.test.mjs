import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrationNumber, findMigrationCollisions } from './check-open-pr-migration-numbers.mjs';

const add = (filename) => ({ filename, status: 'added' });

test('recognizes only added numbered SQL migrations, not modified or docs files', () => {
  assert.equal(migrationNumber(add('packages/database/migrations/280-shop-member-wishlist.sql')), 280);
  assert.equal(migrationNumber({ filename: 'packages/database/migrations/280-old.sql', status: 'modified' }), null);
  assert.equal(migrationNumber(add('docs/migrations/280-note.sql')), null);
  assert.equal(migrationNumber(add('packages/database/migrations/abc-invalid.sql')), null);
  assert.equal(migrationNumber(add('packages/database/migrations/280-not-sql.md')), null);
});

test('blocks concurrent migration 280 from separate open PRs', () => {
  const candidate = [add('packages/database/migrations/280-work-task-favorites.sql')];
  const others = [
    { number: 1139, files: candidate },
    { number: 1143, files: [add('packages/database/migrations/280-shop-member-wishlist.sql')] },
  ];
  assert.deepEqual(findMigrationCollisions(1139, candidate, others), [{
    number: 280,
    currentFile: 'packages/database/migrations/280-work-task-favorites.sql',
    otherPr: 1143,
    otherFile: 'packages/database/migrations/280-shop-member-wishlist.sql',
  }]);
});

test('does not flag independent versions, deleted files, or the current PR', () => {
  const candidate = [add('packages/database/migrations/281-new-feature.sql')];
  assert.deepEqual(findMigrationCollisions(100, candidate, [
    { number: 100, files: candidate },
    { number: 101, files: [add('packages/database/migrations/280-other.sql')] },
    { number: 102, files: [{ filename: 'packages/database/migrations/281-old.sql', status: 'removed' }] },
  ]), []);
});

test('does not require GitHub PR scans for non-migration candidates', () => {
  assert.deepEqual(findMigrationCollisions(101, [add('frontend/src/app/page.tsx')], [
    { number: 102, files: [add('packages/database/migrations/280-other.sql')] },
  ]), []);
});

test('CI policy and automatic integration both enforce the migration guard', async () => {
  const { readFile } = await import('node:fs/promises');
  const ci = await readFile(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const integration = await readFile(new URL('../../.github/workflows/auto-integrate-promote.yml', import.meta.url), 'utf8');
  assert.match(ci, /pull-requests: read/);
  assert.match(ci, /run: node scripts\/release\/check-open-pr-migration-numbers\.mjs/);
  assert.match(integration, /git show HEAD:scripts\/release\/check-open-pr-migration-numbers\.mjs/);
  assert.match(integration, /PR_NUMBER="\$pr" node "\$guard_script"/);
  assert.ok(integration.indexOf('PR_NUMBER="$pr" node "$guard_script"') < integration.indexOf('gh pr merge "$pr"'));
});