const DISCORD_API_ORIGIN = 'https://discord.com';
const DISCORD_API_PREFIX = '/api/v10';
const SNOWFLAKE = /^\d{16,22}$/;
const BOT_TOKEN = /^[\x21-\x7e]{20,512}$/;
const COMMAND_NAMES = Object.freeze(['balance', 'history', 'daily', 'send']);
const MAX_SEND_AMOUNT = 1_000_000;
const REGISTRATION_TIMEOUT_MS = 15_000;

export class DiscordCommandRegistrationConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordCommandRegistrationConfigError';
  }
}

export class DiscordCommandRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordCommandRegistrationError';
  }
}

function freeze<T extends object>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

// This is the complete, intentionally small command surface. Do not add
// generic command dispatch, user-provided options, or context-menu commands
// here: the Interaction handler has matching allowlisted parsers only.
const COMMAND_DEFINITIONS = freeze([
  {
    type: 1,
    name: 'balance',
    description: '내 WLD 잔액을 확인합니다.',
    integration_types: [0],
    contexts: [0],
  },
  {
    type: 1,
    name: 'history',
    description: '최근 WLD 지갑 기록을 확인합니다.',
    integration_types: [0],
    contexts: [0],
  },
  {
    type: 1,
    name: 'daily',
    description: '오늘의 출석 보상을 받습니다.',
    integration_types: [0],
    contexts: [0],
  },
  {
    type: 1,
    name: 'send',
    description: 'WLD를 송금합니다.',
    integration_types: [0],
    contexts: [0],
    options: [
      {
        type: 6,
        name: 'recipient',
        description: '받는 Discord 사용자',
        required: true,
      },
      {
        type: 4,
        name: 'amount',
        description: '송금할 WLD 수량',
        required: true,
        min_value: 1,
        max_value: MAX_SEND_AMOUNT,
      },
    ],
  },
]);

function safeSnowflake(value: unknown, name: string): string {
  if (typeof value !== 'string' || !SNOWFLAKE.test(value)) {
    throw new DiscordCommandRegistrationConfigError(`${name} must be an exact Discord snowflake`);
  }
  return value;
}

function safeBotToken(value: unknown): string {
  if (typeof value !== 'string' || !BOT_TOKEN.test(value)) {
    // Do not echo an invalid secret, even in local CLI errors.
    throw new DiscordCommandRegistrationConfigError(
      'DISCORD_BOT_TOKEN must be a non-empty Discord bot token',
    );
  }
  return value;
}

function responseNamesAreExact(response: unknown): boolean {
  if (!Array.isArray(response) || response.length !== COMMAND_NAMES.length) return false;
  const names = new Set<string>();
  for (const command of response) {
    if (!command || typeof command !== 'object') return false;
    // Narrowed from `unknown` to read the two fields checked below; both are
    // re-validated on the next line before being trusted or stored.
    const { type, name } = command as { type?: unknown; name?: unknown };
    if (
      type !== 1 ||
      typeof name !== 'string' ||
      !COMMAND_NAMES.includes(name) ||
      names.has(name)
    ) {
      return false;
    }
    names.add(name);
  }
  return names.size === COMMAND_NAMES.length;
}

/**
 * A new JSON value on every call prevents a caller from mutating the static,
 * audited definition set before it is sent to Discord.
 */
export function discordCommandDefinitions() {
  return JSON.parse(JSON.stringify(COMMAND_DEFINITIONS));
}

/**
 * Read only the three credentials used by the registrar. The production CLI
 * passes process.env; an injected object exists solely for testability.
 */
export function discordCommandRegistrationConfig(
  environment: Record<string, unknown> = process.env,
) {
  if (!environment || typeof environment !== 'object') {
    throw new DiscordCommandRegistrationConfigError('environment variables are required');
  }
  return Object.freeze({
    applicationId: safeSnowflake(environment.DISCORD_APPLICATION_ID, 'DISCORD_APPLICATION_ID'),
    guildId: safeSnowflake(environment.DISCORD_GUILD_ID, 'DISCORD_GUILD_ID'),
    botToken: safeBotToken(environment.DISCORD_BOT_TOKEN),
  });
}

/**
 * There is exactly one supported API target: guild-scoped bulk overwrite for
 * this app. It deliberately replaces the guild command set with the three
 * definitions above; no global, delete, GET, POST, PATCH, or arbitrary URL
 * path is reachable through this module.
 */
export function discordGuildCommandRegistrationUrl({
  applicationId,
  guildId,
}: {
  applicationId: unknown;
  guildId: unknown;
}): URL {
  const app = safeSnowflake(applicationId, 'DISCORD_APPLICATION_ID');
  const guild = safeSnowflake(guildId, 'DISCORD_GUILD_ID');
  const url = new URL(
    `${DISCORD_API_PREFIX}/applications/${app}/guilds/${guild}/commands`,
    DISCORD_API_ORIGIN,
  );
  if (
    url.origin !== DISCORD_API_ORIGIN ||
    url.pathname !== `${DISCORD_API_PREFIX}/applications/${app}/guilds/${guild}/commands` ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    throw new DiscordCommandRegistrationConfigError(
      'Discord command registration endpoint is not allowlisted',
    );
  }
  return url;
}

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function safeStatus(response: { status?: unknown } | undefined): number | null {
  const status = response?.status;
  return isInteger(status) ? status : null;
}

/** The subset of the global `fetch` signature this registrar actually calls. */
type FetchLike = (
  url: URL,
  init: RequestInit,
) => Promise<{ status: number; json: () => Promise<unknown> }>;

/**
 * Perform the one explicitly allowlisted API call. Calling this function is
 * the only state-changing action in the module; importing it never sends a
 * request. The CLI additionally requires `--apply` before it calls here.
 */
export async function registerDiscordGuildCommands({
  environment = process.env,
  fetchImpl = globalThis.fetch,
}: { environment?: Record<string, unknown>; fetchImpl?: FetchLike } = {}) {
  // Validation intentionally precedes looking up/calling fetch. Missing or
  // malformed environment settings must be a no-network failure.
  const config = discordCommandRegistrationConfig(environment);
  if (typeof fetchImpl !== 'function') {
    throw new DiscordCommandRegistrationConfigError(
      'a Fetch-compatible implementation is required',
    );
  }
  const url = discordGuildCommandRegistrationUrl(config);
  const commands = discordCommandDefinitions();

  let response;
  try {
    response = await fetchImpl(url, {
      method: 'PUT',
      headers: {
        authorization: `Bot ${config.botToken}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(commands),
      // A command registrar should fail, rather than waiting forever, when a
      // network path is unhealthy. Node 20+ provides this static helper.
      signal: AbortSignal.timeout(REGISTRATION_TIMEOUT_MS),
    });
  } catch {
    // Do not carry a transport error as `cause`: logs sometimes serialize it
    // and an implementation may include request headers in that object.
    throw new DiscordCommandRegistrationError('Discord command registration request failed');
  }

  // Discord documents 200 for the guild bulk-overwrite endpoint. Treat every
  // other status as failure, without echoing Discord's response body.
  if (safeStatus(response) !== 200) {
    throw new DiscordCommandRegistrationError('Discord command registration was rejected');
  }

  let registered;
  try {
    registered = await response.json();
  } catch {
    throw new DiscordCommandRegistrationError(
      'Discord command registration returned an invalid response',
    );
  }
  if (!responseNamesAreExact(registered)) {
    throw new DiscordCommandRegistrationError(
      'Discord command registration returned an unexpected command set',
    );
  }
  return Object.freeze({
    applicationId: config.applicationId,
    guildId: config.guildId,
    commands: [...COMMAND_NAMES],
  });
}

/**
 * CLI argument parser with no positional IDs, URLs, tokens, command names,
 * or method flags. `--apply` is the sole state-changing opt-in.
 */
export function parseDiscordCommandRegistrationArgs(
  args: string[] = [],
): { mode: 'dry-run' } | { mode: 'apply' } | { mode: 'help' } {
  if (!Array.isArray(args) || !args.every((arg) => typeof arg === 'string')) {
    throw new DiscordCommandRegistrationConfigError('invalid command registration arguments');
  }
  if (args.length === 0 || (args.length === 1 && args[0] === '--dry-run'))
    return { mode: 'dry-run' };
  if (args.length === 1 && args[0] === '--apply') return { mode: 'apply' };
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) return { mode: 'help' };
  throw new DiscordCommandRegistrationConfigError('use only --dry-run, --apply, or --help');
}
