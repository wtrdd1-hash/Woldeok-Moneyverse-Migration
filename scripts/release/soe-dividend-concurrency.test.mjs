import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requireDisposableCiDatabase } from './soe-dividend-concurrency.mjs';

function fixtureUrl(user, host = 'localhost', port = '5432', database = 'woldeok_moneyverse_dev') {
  const url = new URL(`postgresql://${host}:${port}/${database}`);
  url.username = user;
  url.password = 'test-only-placeholder';
  return url.href;
}

const base = {
  GITHUB_ACTIONS: 'true', MONEYVERSE_CI_DISPOSABLE_DB: '1',
  DATABASE_URL: fixtureUrl('moneyverse_app'),
  MIGRATOR_DATABASE_URL: fixtureUrl('moneyverse_migrator'),
};

test('disposable CI identity accepts only approved isolated local PostgreSQL', () => {
  assert.equal(requireDisposableCiDatabase(base), true);
  for (const bad of [
    { GITHUB_ACTIONS: 'false' }, { MONEYVERSE_CI_DISPOSABLE_DB: '' },
    { DATABASE_URL: fixtureUrl('moneyverse_app', '127.0.0.1', '5433') },
    { DATABASE_URL: fixtureUrl('moneyverse_app', 'prod.example') },
    { DATABASE_URL: fixtureUrl('moneyverse_app', 'localhost', '5432', 'production') },
    { DATABASE_URL: fixtureUrl('moneyverse_migrator') },
    { MIGRATOR_DATABASE_URL: '' },
  ]) assert.throws(() => requireDisposableCiDatabase({ ...base, ...bad }), /BLOCKED/);
});
