import { parseMinecraftHostAgentEndpoint } from '@moneyverse/minecraft-core';

export const MINECRAFT_EXECUTOR_ROLE = 'moneyverse_minecraft_executor';

const RESERVED_DATABASE_USERS = new Set([
  'moneyverse_app',
  'moneyverse_migrator',
  MINECRAFT_EXECUTOR_ROLE,
  'postgres',
]);

export interface MinecraftExecutorConfig {
  readonly databaseUrl: string;
  readonly databaseRole: string;
  readonly agentEndpoint: string;
  readonly agentToken: string;
  readonly leaseSeconds: number;
  readonly agentTimeoutMs: number;
  readonly pollIntervalMs: number;
  readonly agentMaxResponseBytes: number;
}

function requiredString(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${key} is required`);
  }
  if (value.trim() !== value) {
    throw new Error(`${key} must not begin or end with whitespace`);
  }
  return value;
}

function boundedInteger(env: NodeJS.ProcessEnv, key: string, fallback: number, minimum: number, maximum: number): number {
  const raw = env[key] ?? String(fallback);
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    throw new Error(`${key} must be an integer`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${key} must be between ${minimum} and ${maximum}`);
  }
  return value;
}

function databaseUrl(env: NodeJS.ProcessEnv): string {
  const raw = requiredString(env, 'MINECRAFT_EXECUTOR_DATABASE_URL');
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('MINECRAFT_EXECUTOR_DATABASE_URL must be a PostgreSQL connection URL');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)
    || !parsed.hostname
    || !parsed.username
    || !parsed.pathname
    || parsed.pathname === '/'
    || parsed.hash) {
    throw new Error('MINECRAFT_EXECUTOR_DATABASE_URL must be a complete PostgreSQL connection URL');
  }

  let username: string;
  try {
    username = decodeURIComponent(parsed.username).toLowerCase();
  } catch {
    throw new Error('MINECRAFT_EXECUTOR_DATABASE_URL contains an invalid database user');
  }
  if (RESERVED_DATABASE_USERS.has(username)) {
    throw new Error('MINECRAFT_EXECUTOR_DATABASE_URL must use a dedicated non-privileged LOGIN role');
  }
  return raw;
}

/**
 * Loads only host-controlled worker configuration. The role name is fixed so
 * an environment typo cannot turn SET ROLE into an arbitrary privilege hop.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): MinecraftExecutorConfig {
  const configuredRole = env.MINECRAFT_EXECUTOR_DB_ROLE ?? MINECRAFT_EXECUTOR_ROLE;
  if (configuredRole !== MINECRAFT_EXECUTOR_ROLE) {
    throw new Error(`MINECRAFT_EXECUTOR_DB_ROLE must be ${MINECRAFT_EXECUTOR_ROLE}`);
  }

  const leaseSeconds = boundedInteger(env, 'MINECRAFT_EXECUTOR_LEASE_SECONDS', 60, 5, 120);
  const agentTimeoutMs = boundedInteger(env, 'MINECRAFT_EXECUTOR_AGENT_TIMEOUT_MS', 25000, 250, 60000);
  // The durable queue intentionally has no lease extension. Keep a fixed
  // reserve for recording the terminal receipt after the host request.
  if (agentTimeoutMs > (leaseSeconds * 1000) - 5000) {
    throw new Error('MINECRAFT_EXECUTOR_AGENT_TIMEOUT_MS must leave at least 5 seconds to record completion');
  }

  const agentEndpoint = requiredString(env, 'MINECRAFT_AGENT_ENDPOINT');
  // Reuse the agent client's literal-loopback parser rather than maintaining
  // a second, possibly divergent endpoint allow-list here.
  parseMinecraftHostAgentEndpoint(agentEndpoint);

  const agentToken = requiredString(env, 'MINECRAFT_AGENT_TOKEN');
  if (Buffer.byteLength(agentToken, 'utf8') < 32) {
    throw new Error('MINECRAFT_AGENT_TOKEN must be at least 32 bytes');
  }

  return Object.freeze({
    databaseUrl: databaseUrl(env),
    databaseRole: MINECRAFT_EXECUTOR_ROLE,
    agentEndpoint,
    agentToken,
    leaseSeconds,
    agentTimeoutMs,
    pollIntervalMs: boundedInteger(env, 'MINECRAFT_EXECUTOR_POLL_INTERVAL_MS', 3000, 250, 60000),
    agentMaxResponseBytes: boundedInteger(
      env,
      'MINECRAFT_EXECUTOR_AGENT_MAX_RESPONSE_BYTES',
      128 * 1024,
      1024,
      1024 * 1024,
    ),
  });
}

export const __test__ = { RESERVED_DATABASE_USERS, databaseUrl };
