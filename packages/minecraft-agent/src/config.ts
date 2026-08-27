const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1']);
const SERVICE_NAME = /^[A-Za-z0-9][A-Za-z0-9@_.-]{0,127}\.service$/;

export interface MinecraftAgentConfig {
  readonly host: string;
  readonly port: number;
  readonly token: string;
  readonly service: string;
  readonly allowedServices: readonly string[];
  readonly maxBodyBytes: number;
  readonly rateLimitMax: number;
  readonly rateLimitWindowMs: number;
  readonly mutationCooldownMs: number;
  readonly commandTimeoutMs: number;
  readonly logTimeoutMs: number;
  readonly logLines: number;
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

function integer(env: NodeJS.ProcessEnv, key: string, fallback: number, minimum: number, maximum: number): number {
  const raw = env[key] ?? String(fallback);
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${key} must be an integer`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${key} must be between ${minimum} and ${maximum}`);
  }
  return value;
}

function serviceList(raw: string): string[] {
  const entries = raw.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (entries.length === 0 || entries.some((entry) => !SERVICE_NAME.test(entry))) {
    throw new Error('MINECRAFT_ALLOWED_SYSTEMD_SERVICES contains an invalid service name');
  }
  return [...new Set(entries)];
}

/**
 * Loads only server-side configuration. No HTTP request can change the target
 * service, command, filesystem path, timeout, or log selector.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): MinecraftAgentConfig {
  const host = env.MINECRAFT_AGENT_HOST ?? '127.0.0.1';
  if (!LOOPBACK_HOSTS.has(host)) {
    throw new Error('MINECRAFT_AGENT_HOST must be a loopback address: exactly 127.0.0.1 or ::1');
  }

  const token = requiredString(env, 'MINECRAFT_AGENT_TOKEN');
  if (Buffer.byteLength(token, 'utf8') < 32) {
    throw new Error('MINECRAFT_AGENT_TOKEN must be at least 32 bytes');
  }

  const service = requiredString(env, 'MINECRAFT_SYSTEMD_SERVICE');
  if (!SERVICE_NAME.test(service)) {
    throw new Error('MINECRAFT_SYSTEMD_SERVICE must be a simple .service unit name');
  }

  const allowedServices = serviceList(requiredString(env, 'MINECRAFT_ALLOWED_SYSTEMD_SERVICES'));
  if (!allowedServices.includes(service)) {
    throw new Error('MINECRAFT_SYSTEMD_SERVICE must be present in MINECRAFT_ALLOWED_SYSTEMD_SERVICES');
  }

  return Object.freeze({
    host,
    port: integer(env, 'MINECRAFT_AGENT_PORT', 18080, 1, 65535),
    token,
    service,
    allowedServices: Object.freeze(allowedServices),
    maxBodyBytes: 1024,
    rateLimitMax: integer(env, 'MINECRAFT_AGENT_RATE_LIMIT_MAX', 30, 1, 300),
    rateLimitWindowMs: integer(env, 'MINECRAFT_AGENT_RATE_LIMIT_WINDOW_MS', 60000, 1000, 3600000),
    mutationCooldownMs: integer(env, 'MINECRAFT_AGENT_MUTATION_COOLDOWN_MS', 3000, 0, 60000),
    commandTimeoutMs: integer(env, 'MINECRAFT_AGENT_COMMAND_TIMEOUT_MS', 20000, 1000, 60000),
    logTimeoutMs: integer(env, 'MINECRAFT_AGENT_LOG_TIMEOUT_MS', 10000, 1000, 60000),
    logLines: integer(env, 'MINECRAFT_AGENT_LOG_LINES', 200, 1, 500)
  });
}

export const __test__ = { SERVICE_NAME, serviceList };
