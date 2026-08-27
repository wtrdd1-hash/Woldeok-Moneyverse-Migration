import assert from 'node:assert/strict';
import { test } from 'vitest';
import { loadConfig, MINECRAFT_EXECUTOR_ROLE } from './config';

const token = 'a'.repeat(48);

function env(overrides = {}) {
  return {
    MINECRAFT_EXECUTOR_DATABASE_URL: 'postgresql://moneyverse_minecraft_executor_login:secret@127.0.0.1:5432/woldeok',
    MINECRAFT_AGENT_ENDPOINT: 'http://127.0.0.1:18080',
    MINECRAFT_AGENT_TOKEN: token,
    ...overrides,
  };
}

test('loads only a dedicated DB login plus a literal-loopback agent endpoint', () => {
  const config = loadConfig(env());
  assert.equal(config.databaseRole, MINECRAFT_EXECUTOR_ROLE);
  assert.equal(config.leaseSeconds, 60);
  assert.equal(config.agentTimeoutMs, 25000);
  assert.equal(config.pollIntervalMs, 3000);
  assert.equal(config.agentEndpoint, 'http://127.0.0.1:18080');
});

test('rejects app, migrator, postgres, and the NOLOGIN group role as DB users', () => {
  for (const username of [
    'moneyverse_app',
    'moneyverse_migrator',
    'moneyverse_minecraft_executor',
    'postgres',
  ]) {
    assert.throws(() => loadConfig(env({
      MINECRAFT_EXECUTOR_DATABASE_URL: `postgresql://${username}:secret@127.0.0.1:5432/woldeok`,
    })), /dedicated non-privileged LOGIN role/);
  }
});

test('rejects arbitrary role changes, non-loopback agent endpoints, short tokens, and unsafe timing', () => {
  assert.throws(() => loadConfig(env({ MINECRAFT_EXECUTOR_DB_ROLE: 'postgres' })), /DB_ROLE/);
  assert.throws(() => loadConfig(env({ MINECRAFT_AGENT_ENDPOINT: 'http://localhost:18080' })), /loopback/i);
  assert.throws(() => loadConfig(env({ MINECRAFT_AGENT_TOKEN: 'short' })), /32 bytes/);
  assert.throws(() => loadConfig(env({
    MINECRAFT_EXECUTOR_LEASE_SECONDS: '30',
    MINECRAFT_EXECUTOR_AGENT_TIMEOUT_MS: '26000',
  })), /leave at least 5 seconds/);
});
