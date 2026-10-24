import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requireDisposableCiDatabase } from './soe-dividend-concurrency.mjs';

const base = {
  GITHUB_ACTIONS: 'true', MONEYVERSE_CI_DISPOSABLE_DB: '1',
  DATABASE_URL: 'postgresql://moneyverse_app:example@localhost:5432/woldeok_moneyverse_dev',
  MIGRATOR_DATABASE_URL: 'postgresql://moneyverse_migrator:example@localhost:5432/woldeok_moneyverse_dev',
};

test('disposable CI identity accepts only approved isolated local PostgreSQL', () => {
  assert.equal(requireDisposableCiDatabase(base), true);
  for (const bad of [
    { GITHUB_ACTIONS: 'false' }, { MONEYVERSE_CI_DISPOSABLE_DB: '' },
    { DATABASE_URL: 'postgresql://moneyverse_app:secret@127.0.0.1:5433/woldeok_moneyverse_dev' },
    { DATABASE_URL: 'postgresql://moneyverse_app:secret@prod.example:5432/woldeok_moneyverse_dev' },
    { DATABASE_URL: 'postgresql://moneyverse_app:secret@localhost:5432/production' },
    { DATABASE_URL: 'postgresql://moneyverse_migrator:secret@localhost:5432/woldeok_moneyverse_dev' },
    { MIGRATOR_DATABASE_URL: '' },
  ]) assert.throws(() => requireDisposableCiDatabase({ ...base, ...bad }), /BLOCKED/);
});
