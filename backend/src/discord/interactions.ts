import {
  createHash,
  createPublicKey,
  verify as verifySignature,
  type KeyObject,
} from 'node:crypto';

const ED25519_PUBLIC_KEY_HEX = /^[0-9a-f]{64}$/i;
const ED25519_SIGNATURE_HEX = /^[0-9a-f]{128}$/i;
// Discord IDs are decimal snowflakes. Retain the slightly wider range used
// by the OAuth identity boundary so older valid IDs are not silently locked
// out, while rejecting names, handles, and arbitrary string selectors.
const SNOWFLAKE = /^\d{16,22}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const INTERACTION_PING = 1;
const APPLICATION_COMMAND = 2;
const CHAT_INPUT_COMMAND = 1;
const RESPONSE_PONG = 1;
const RESPONSE_CHANNEL_MESSAGE = 4;
const EPHEMERAL = 1 << 6;
const MAX_CONTENT_LENGTH = 2_000;
const MAX_TIMESTAMP_AGE_SECONDS = 10 * 60;
const MAX_FUTURE_SKEW_SECONDS = 2 * 60;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TRANSFER_AMOUNT = 1_000_000_000;
const COMMANDS = new Set(['balance', 'history', 'daily', 'send']);

export class DiscordInteractionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordInteractionConfigError';
  }
}

class DiscordInteractionInputError extends Error {
  constructor() {
    super('invalid Discord interaction');
    this.name = 'DiscordInteractionInputError';
  }
}

class DiscordInteractionAuthorizationError extends Error {
  constructor() {
    super('Discord interaction is not authorized');
    this.name = 'DiscordInteractionAuthorizationError';
  }
}

class DiscordRateLimitError extends Error {
  constructor() {
    super('Discord interaction rate limit exceeded');
    this.name = 'DiscordRateLimitError';
  }
}

/**
 * Strict JSON-object check (exact `Object.prototype`, no arrays). Used only
 * for data that originated from `JSON.parse` — the untrusted Discord
 * interaction payload and the operator-supplied policy/config.
 */
function plainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Lenient object check for reading an optional field off a value that need
 * not be JSON-shaped (a WalletService response, for example). Mirrors what
 * plain `?.` already tolerated: any non-null object, not only a JSON literal.
 */
function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalProperty(value: unknown, key: string): unknown {
  return isObjectLike(value) ? value[key] : undefined;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value);
}

function exactSnowflake(value: unknown): string | null {
  return typeof value === 'string' && SNOWFLAKE.test(value) ? value : null;
}

function exactUuid(value: unknown): string | null {
  return typeof value === 'string' && UUID.test(value) ? value.toLowerCase() : null;
}

function boundedInteger(
  value: unknown,
  name: string,
  { min, max }: { min: number; max: number },
): number {
  if (!isSafeInteger(value) || value < min || value > max) {
    throw new DiscordInteractionConfigError(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function headerValue(headers: unknown, name: string): string | null {
  // Callers pass either a Headers-like object (`.get`) or a plain
  // string-keyed object (Node's `IncomingHttpHeaders`, or a test double).
  // The checks below — not this cast — are what make each branch safe.
  const source = headers as
    ({ get?: (name: string) => unknown } & Record<string, unknown>) | null | undefined;
  if (source?.get instanceof Function) {
    const value = source.get(name);
    return typeof value === 'string' ? value : null;
  }
  if (!source || typeof source !== 'object') return null;
  const lowerName = name.toLowerCase();
  let matched: string | null = null;
  for (const [key, value] of Object.entries(source)) {
    if (key.toLowerCase() !== lowerName || typeof value !== 'string' || matched !== null) continue;
    matched = value;
  }
  // A test double or proxy can retain differently-cased duplicate headers.
  // Do not let an ambiguous signature/timestamp choose an arbitrary value.
  const count = Object.keys(source).filter((key) => key.toLowerCase() === lowerName).length;
  return count === 1 ? matched : null;
}

function rawBuffer(rawBody: unknown): Buffer | null {
  if (Buffer.isBuffer(rawBody)) return rawBody;
  if (rawBody instanceof Uint8Array) return Buffer.from(rawBody);
  return null;
}

function buildPublicKey(publicKey: unknown): KeyObject {
  if (typeof publicKey !== 'string' || !ED25519_PUBLIC_KEY_HEX.test(publicKey)) {
    throw new DiscordInteractionConfigError(
      'Discord interaction public key must be a 32-byte hexadecimal Ed25519 key',
    );
  }
  return createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKey, 'hex')]),
    format: 'der',
    type: 'spki',
  });
}

function nowMilliseconds(clock: () => number): number {
  const value = clock();
  if (!Number.isSafeInteger(value) || value < 0)
    throw new DiscordInteractionConfigError('clock must return a Unix timestamp in milliseconds');
  return value;
}

function timestampIsFresh(
  timestamp: unknown,
  nowMs: number,
  maxAgeSeconds: number,
  maxFutureSkewSeconds: number,
): boolean {
  if (typeof timestamp !== 'string' || !/^\d{1,16}$/.test(timestamp)) return false;
  const timestampSeconds = BigInt(timestamp);
  const nowSeconds = BigInt(Math.floor(nowMs / 1_000));
  const age = nowSeconds - timestampSeconds;
  return age <= BigInt(maxAgeSeconds) && age >= -BigInt(maxFutureSkewSeconds);
}

interface DiscordGuildPolicy {
  roleIds: Set<string>;
  roleMode: 'any' | 'all';
}

function normalizePolicy(policy: unknown): Map<string, DiscordGuildPolicy> {
  if (!plainObject(policy) || !plainObject(policy.guilds)) {
    throw new DiscordInteractionConfigError('Discord policy must contain a guilds object');
  }
  const entries = Object.entries(policy.guilds);
  if (entries.length < 1 || entries.length > 100) {
    throw new DiscordInteractionConfigError('Discord policy must allow between 1 and 100 guilds');
  }

  const guilds = new Map<string, DiscordGuildPolicy>();
  for (const [guildId, descriptor] of entries) {
    if (!exactSnowflake(guildId) || !plainObject(descriptor)) {
      throw new DiscordInteractionConfigError('Discord policy contains an invalid guild');
    }
    const keys = Object.keys(descriptor);
    if (keys.some((key) => key !== 'requiredRoleIds' && key !== 'roleMode')) {
      throw new DiscordInteractionConfigError(
        'Discord guild policy contains an unsupported setting',
      );
    }
    const requiredRoleIds = descriptor.requiredRoleIds;
    if (
      !isUnknownArray(requiredRoleIds) ||
      requiredRoleIds.length < 1 ||
      requiredRoleIds.length > 100
    ) {
      throw new DiscordInteractionConfigError(
        'every allowed Discord guild must require one or more roles',
      );
    }
    const roleIds = new Set<string>();
    for (const roleId of requiredRoleIds) {
      const normalizedRoleId = exactSnowflake(roleId);
      if (!normalizedRoleId || roleIds.has(normalizedRoleId)) {
        throw new DiscordInteractionConfigError('Discord guild policy contains invalid role IDs');
      }
      roleIds.add(normalizedRoleId);
    }
    const roleMode = descriptor.roleMode ?? 'any';
    if (roleMode === 'any' || roleMode === 'all') {
      guilds.set(guildId, { roleIds, roleMode });
    } else {
      throw new DiscordInteractionConfigError('Discord guild role mode must be any or all');
    }
  }
  return guilds;
}

interface RateLimiterLike {
  consume(request: {
    userId: unknown;
    guildId: unknown;
    command: unknown;
  }): boolean | Promise<boolean>;
}

function normalizeRateLimiter(rateLimiter: RateLimiterLike | null | undefined): RateLimiterLike {
  if (!rateLimiter || typeof rateLimiter.consume !== 'function') {
    throw new DiscordInteractionConfigError(
      'a per-user Discord rate limiter with consume() is required',
    );
  }
  return rateLimiter;
}

interface IdentityRepositoryLike {
  userIdForDiscordUser(discordUserId: string): Promise<unknown>;
}

function normalizeIdentityRepository(
  identityRepository: IdentityRepositoryLike | null | undefined,
): IdentityRepositoryLike {
  if (!identityRepository || typeof identityRepository.userIdForDiscordUser !== 'function') {
    throw new DiscordInteractionConfigError(
      'an identity repository with userIdForDiscordUser() is required',
    );
  }
  return identityRepository;
}

interface WalletServiceLike {
  overview(userId: string): Promise<unknown>;
  claimDaily(userId: string, request: { idempotencyKey: string }): Promise<unknown>;
  transfer(
    userId: string,
    request: { recipientUserId: string; amount: number; idempotencyKey: string },
  ): Promise<unknown>;
}

function normalizeWalletService(
  walletService: WalletServiceLike | null | undefined,
): WalletServiceLike {
  const methods = ['overview', 'claimDaily', 'transfer'] as const;
  if (!walletService || !methods.every((method) => typeof walletService[method] === 'function')) {
    throw new DiscordInteractionConfigError('a WalletService-compatible object is required');
  }
  return walletService;
}

export interface DiscordInteractionResponse {
  status: number;
  body: unknown;
}

function invalidInteraction(): DiscordInteractionResponse {
  return { status: 400, body: { error: 'invalid interaction' } };
}

function invalidSignature(): DiscordInteractionResponse {
  return { status: 401, body: { error: 'invalid interaction' } };
}

function ephemeral(content: unknown): DiscordInteractionResponse {
  // Every message in this module is deliberately plain text and bounded. It
  // keeps balances and command outcomes out of public Discord channels.
  const safeContent =
    typeof content === 'string' && content.length <= MAX_CONTENT_LENGTH
      ? content
      : '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  return {
    status: 200,
    body: { type: RESPONSE_CHANNEL_MESSAGE, data: { flags: EPHEMERAL, content: safeContent } },
  };
}

type CommandName = 'balance' | 'history' | 'daily' | 'send';

function isCommandName(value: string): value is CommandName {
  return COMMANDS.has(value);
}

interface SendCommandOptions {
  recipientDiscordUserId: string;
  amount: number;
}

function commandOptions(
  data: Record<string, unknown>,
  command: 'balance' | 'history' | 'daily',
  maxTransferAmount: number,
): Record<string, never>;
function commandOptions(
  data: Record<string, unknown>,
  command: 'send',
  maxTransferAmount: number,
): SendCommandOptions;
function commandOptions(
  data: Record<string, unknown>,
  command: CommandName,
  maxTransferAmount: number,
): Record<string, never> | SendCommandOptions {
  const options = data.options;
  if (options === undefined) {
    if (command === 'send') throw new DiscordInteractionInputError();
    return {};
  }
  if (!isUnknownArray(options) || options.length > 25) throw new DiscordInteractionInputError();
  if (command === 'balance' || command === 'history' || command === 'daily') {
    if (options.length !== 0) throw new DiscordInteractionInputError();
    return {};
  }
  if (options.length !== 2) throw new DiscordInteractionInputError();

  const byName = new Map<string, Record<string, unknown>>();
  for (const option of options) {
    if (
      !plainObject(option) ||
      typeof option.name !== 'string' ||
      option.name.length > 32 ||
      byName.has(option.name)
    ) {
      throw new DiscordInteractionInputError();
    }
    byName.set(option.name, option);
  }
  if (byName.size !== 2 || !byName.has('recipient') || !byName.has('amount')) {
    throw new DiscordInteractionInputError();
  }

  const recipient = byName.get('recipient');
  const amount = byName.get('amount');
  // Invariant: byName.has('recipient') and byName.has('amount') both just
  // returned true, so both lookups succeed.
  if (!recipient || !amount) throw new DiscordInteractionInputError();
  // The Discord command must be registered as
  // /send recipient:USER amount:INTEGER. The value of a USER option is a
  // Discord snowflake, never a display name, email address, or internal UUID.
  const recipientDiscordUserId = exactSnowflake(recipient.value);
  if (recipient.type !== 6 || !recipientDiscordUserId) throw new DiscordInteractionInputError();
  if (
    amount.type !== 4 ||
    !isSafeInteger(amount.value) ||
    amount.value < 1 ||
    amount.value > maxTransferAmount
  ) {
    throw new DiscordInteractionInputError();
  }
  return { recipientDiscordUserId, amount: amount.value };
}

interface DiscordPingPayload {
  type: 1;
}

interface DiscordApplicationCommandPayload {
  type: 2;
  id: unknown;
  guild_id: unknown;
  member: unknown;
  data: unknown;
}

type DiscordInteractionPayload = DiscordPingPayload | DiscordApplicationCommandPayload;

/**
 * The request body stays `unknown` until this returns true; only then does
 * any code get to read a field off it. This is the raw wire-format
 * discriminated union on Discord's own `type` (PING vs APPLICATION_COMMAND),
 * not yet validated beyond having one of those two type codes.
 */
function isDiscordInteractionPayload(value: unknown): value is DiscordInteractionPayload {
  return (
    plainObject(value) && (value.type === INTERACTION_PING || value.type === APPLICATION_COMMAND)
  );
}

interface DiscordPingResult {
  kind: 'ping';
}

interface DiscordBalanceCommand {
  kind: 'command';
  command: 'balance' | 'history' | 'daily';
  interactionId: string;
  guildId: string;
  discordUserId: string;
  memberRoleIds: Set<string>;
  options: Record<string, never>;
}

interface DiscordSendCommand {
  kind: 'command';
  command: 'send';
  interactionId: string;
  guildId: string;
  discordUserId: string;
  memberRoleIds: Set<string>;
  options: SendCommandOptions;
}

type DiscordCommandInteraction = DiscordBalanceCommand | DiscordSendCommand;
type ParsedDiscordInteraction = DiscordPingResult | DiscordCommandInteraction;

function parseInteraction(parsed: unknown, maxTransferAmount: number): ParsedDiscordInteraction {
  if (!isDiscordInteractionPayload(parsed)) throw new DiscordInteractionInputError();
  if (parsed.type === INTERACTION_PING) return { kind: 'ping' };
  if (!plainObject(parsed.data) || parsed.data.type !== CHAT_INPUT_COMMAND) {
    throw new DiscordInteractionInputError();
  }
  const data = parsed.data;

  const interactionId = exactSnowflake(parsed.id);
  const guildId = exactSnowflake(parsed.guild_id);
  const rawCommandName = data.name;
  const commandName =
    typeof rawCommandName === 'string' &&
    rawCommandName.length <= 32 &&
    isCommandName(rawCommandName)
      ? rawCommandName
      : null;
  const userId = exactSnowflake(optionalProperty(optionalProperty(parsed.member, 'user'), 'id'));
  const roleIds = optionalProperty(parsed.member, 'roles');
  if (
    !interactionId ||
    !guildId ||
    !commandName ||
    !userId ||
    !isUnknownArray(roleIds) ||
    roleIds.length > 250
  ) {
    throw new DiscordInteractionInputError();
  }
  const memberRoleIds = new Set<string>();
  for (const roleId of roleIds) {
    const role = exactSnowflake(roleId);
    if (!role) throw new DiscordInteractionInputError();
    memberRoleIds.add(role);
  }

  if (commandName === 'send') {
    return {
      kind: 'command',
      command: commandName,
      interactionId,
      guildId,
      discordUserId: userId,
      memberRoleIds,
      options: commandOptions(data, commandName, maxTransferAmount),
    };
  }
  return {
    kind: 'command',
    command: commandName,
    interactionId,
    guildId,
    discordUserId: userId,
    memberRoleIds,
    options: commandOptions(data, commandName, maxTransferAmount),
  };
}

function hasRequiredRoles(
  memberRoleIds: Set<string>,
  requiredRoles: Set<string>,
  roleMode: 'any' | 'all',
): boolean {
  if (roleMode === 'all') return [...requiredRoles].every((roleId) => memberRoleIds.has(roleId));
  return [...requiredRoles].some((roleId) => memberRoleIds.has(roleId));
}

function authorize(
  command: DiscordCommandInteraction,
  guilds: Map<string, DiscordGuildPolicy>,
): void {
  const guildPolicy = guilds.get(command.guildId);
  if (
    !guildPolicy ||
    !hasRequiredRoles(command.memberRoleIds, guildPolicy.roleIds, guildPolicy.roleMode)
  ) {
    throw new DiscordInteractionAuthorizationError();
  }
}

function receiptKey(interactionId: string, command: string): string {
  // Discord can retry a signed interaction. Deriving a UUID deterministically
  // from its immutable ID makes WalletService writes safe to repeat without
  // storing a second mutable interaction cache.
  const bytes = createHash('sha256')
    .update('woldeok-moneyverse:discord-interaction:v1\0', 'utf8')
    .update(interactionId, 'utf8')
    .update('\0', 'utf8')
    .update(command, 'utf8')
    .digest()
    .subarray(0, 16);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function formatWithCommas(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function isCanonicalAmount(
  value: unknown,
  { positive = false }: { positive?: boolean } = {},
): value is string {
  if (typeof value !== 'string' || !/^\d{1,18}$/.test(value)) return false;
  const amount = BigInt(value);
  return positive ? amount > 0n : amount >= 0n;
}

function amountText(value: unknown, options: { positive?: boolean } = {}): string | null {
  return isCanonicalAmount(value, options) ? formatWithCommas(value) : null;
}

function balanceMessage(overview: unknown): string | null {
  const balances = optionalProperty(overview, 'balances');
  if (!plainObject(balances) || balances.currency !== 'WLD') return null;
  const cashAvailable = optionalProperty(balances.cash, 'availableAmount');
  const bankAvailable = optionalProperty(balances.bank, 'availableAmount');
  const totalAvailable = balances.totalAvailableAmount;
  if (
    !isCanonicalAmount(cashAvailable) ||
    !isCanonicalAmount(bankAvailable) ||
    !isCanonicalAmount(totalAvailable)
  ) {
    return null;
  }
  if (BigInt(cashAvailable) + BigInt(bankAvailable) !== BigInt(totalAvailable)) {
    return null;
  }
  return `현재 보유 WLD: ${formatWithCommas(totalAvailable)}\n현금 ${formatWithCommas(cashAvailable)} WLD · 은행 ${formatWithCommas(bankAvailable)} WLD`;
}

function dailyMessage(receipt: unknown): string | null {
  const amount = amountText(optionalProperty(receipt, 'amount'), { positive: true });
  const replayed = optionalProperty(receipt, 'replayed');
  if (!amount || typeof replayed !== 'boolean') return null;
  return replayed
    ? `오늘의 출석 보상은 이미 확인되었습니다. ${amount} WLD`
    : `오늘의 출석 보상을 받았습니다. +${amount} WLD`;
}

function historyMessage(overview: unknown): string | null {
  const records = optionalProperty(overview, 'recentTransactions');
  if (!isUnknownArray(records)) return null;
  if (records.length === 0) return '최근 지갑 기록이 없습니다.';
  const lines: string[] = [];
  for (const record of records.slice(0, 5)) {
    const rawLabel = optionalProperty(record, 'label');
    const rawNet = optionalProperty(record, 'netAmount');
    const label = typeof rawLabel === 'string' && rawLabel.length <= 80 ? rawLabel : null;
    const net = typeof rawNet === 'string' && /^-?\d{1,18}$/.test(rawNet) ? rawNet : null;
    if (!label || !net) return null;
    const sign = BigInt(net) > 0n ? '+' : BigInt(net) < 0n ? '-' : '';
    lines.push(`${label}: ${sign}${amountText(net.startsWith('-') ? net.slice(1) : net)} WLD`);
  }
  return `최근 지갑 기록\n${lines.join('\n')}`;
}

async function internalUserId(
  identityRepository: IdentityRepositoryLike,
  discordUserId: string,
): Promise<string | null> {
  const userId = await identityRepository.userIdForDiscordUser(discordUserId);
  const normalized = exactUuid(userId);
  return normalized ?? null;
}

async function consumeRateLimit(
  rateLimiter: RateLimiterLike,
  command: DiscordCommandInteraction,
): Promise<void> {
  const allowed = await rateLimiter.consume({
    userId: command.discordUserId,
    guildId: command.guildId,
    command: command.command,
  });
  if (allowed !== true) throw new DiscordRateLimitError();
}

/**
 * Verify a Discord Interaction request against its original byte sequence.
 *
 * `rawBody` must be the exact bytes received over HTTP; never pass a parsed
 * object or a re-serialized string. Returns false for malformed, stale, or
 * incorrectly signed input instead of exposing verification detail.
 */
export function verifyDiscordInteractionSignature({
  publicKey,
  signature,
  timestamp,
  rawBody,
  clock = Date.now,
  maxTimestampAgeSeconds = 300,
  maxFutureSkewSeconds = 30,
}: {
  publicKey: unknown;
  signature: unknown;
  timestamp: unknown;
  rawBody: unknown;
  clock?: () => number;
  maxTimestampAgeSeconds?: number;
  maxFutureSkewSeconds?: number;
}): boolean {
  try {
    const key = buildPublicKey(publicKey);
    const body = rawBuffer(rawBody);
    const now = nowMilliseconds(clock);
    const age = boundedInteger(maxTimestampAgeSeconds, 'maxTimestampAgeSeconds', {
      min: 1,
      max: MAX_TIMESTAMP_AGE_SECONDS,
    });
    const futureSkew = boundedInteger(maxFutureSkewSeconds, 'maxFutureSkewSeconds', {
      min: 0,
      max: MAX_FUTURE_SKEW_SECONDS,
    });
    if (!body || body.length > MAX_BODY_BYTES) return false;
    if (typeof signature !== 'string' || !ED25519_SIGNATURE_HEX.test(signature)) return false;
    if (typeof timestamp !== 'string' || !timestampIsFresh(timestamp, now, age, futureSkew))
      return false;
    return verifySignature(
      null,
      Buffer.concat([Buffer.from(timestamp, 'utf8'), body]),
      key,
      Buffer.from(signature, 'hex'),
    );
  } catch {
    return false;
  }
}

/**
 * Read and cap a Node IncomingMessage without parsing or normalizing it.
 * Pass the returned Buffer unchanged to the interaction handler.
 */
export async function readDiscordInteractionBody(
  request: AsyncIterable<unknown> & { destroy?: () => void },
  { maxBytes = 32 * 1024 }: { maxBytes?: number } = {},
): Promise<Buffer> {
  const limit = boundedInteger(maxBytes, 'maxBytes', { min: 1, max: MAX_BODY_BYTES });
  if (!request || typeof request[Symbol.asyncIterator] !== 'function') {
    throw new TypeError('a readable HTTP request is required');
  }
  let size = 0;
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    if (!Buffer.isBuffer(chunk) && !(chunk instanceof Uint8Array))
      throw new TypeError('request body chunk must be bytes');
    size += chunk.length;
    if (size > limit) {
      // Do not leave an oversized keep-alive request streaming after the
      // caller has decided to reject it. Test doubles need not implement it.
      if (typeof request.destroy === 'function') request.destroy();
      const error: Error & { status: number } = Object.assign(
        new Error('Discord interaction body is too large'),
        { status: 413 },
      );
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Small bounded in-memory limiter for one-process development/testing only.
 * Production must inject a shared, atomic limiter (for example Redis) with
 * the same `consume({ userId, guildId, command }) => Promise<boolean>`
 * contract so multiple application instances enforce one budget per user.
 */
export function createFixedWindowDiscordRateLimiter({
  limit = 5,
  windowMs = 10_000,
  maxEntries = 10_000,
  clock = Date.now,
}: {
  limit?: number;
  windowMs?: number;
  maxEntries?: number;
  clock?: () => number;
} = {}): RateLimiterLike {
  const countLimit = boundedInteger(limit, 'limit', { min: 1, max: 100 });
  const duration = boundedInteger(windowMs, 'windowMs', { min: 1_000, max: 60 * 60 * 1_000 });
  const entryLimit = boundedInteger(maxEntries, 'maxEntries', { min: 1, max: 100_000 });
  if (typeof clock !== 'function')
    throw new DiscordInteractionConfigError('clock must be a function');
  const entries = new Map<string, { windowStart: number; count: number }>();

  const prune = (now: number): void => {
    for (const [key, entry] of entries) {
      if (now - entry.windowStart >= duration) entries.delete(key);
    }
  };

  return Object.freeze({
    consume({
      userId,
      guildId,
      command,
    }: {
      userId: unknown;
      guildId: unknown;
      command: unknown;
    }): boolean {
      const normalizedUserId = exactSnowflake(userId);
      const normalizedGuildId = exactSnowflake(guildId);
      if (
        !normalizedUserId ||
        !normalizedGuildId ||
        typeof command !== 'string' ||
        !COMMANDS.has(command)
      )
        return false;
      const now = nowMilliseconds(clock);
      // A member gets one shared budget in each guild, rather than an
      // independent quota for every command name.
      const key = `${normalizedGuildId}:${normalizedUserId}`;
      let entry = entries.get(key);
      if (!entry || now - entry.windowStart >= duration) {
        prune(now);
        // Refusing a new key at capacity is safer than evicting a live
        // member's budget: account churn must not reset someone else's
        // throttle or turn this bounded map into a memory-pressure tool.
        if (entries.size >= entryLimit) return false;
        entry = { windowStart: now, count: 0 };
      }
      // Keep both the map and every entry bounded under sustained spam.
      entry.count = Math.min(entry.count + 1, countLimit + 1);
      entries.set(key, entry);
      return entry.count <= countLimit;
    },
  });
}

interface DiscordInteractionHandler {
  handle(request: { headers?: unknown; rawBody?: unknown }): Promise<DiscordInteractionResponse>;
}

/**
 * Create a transport-neutral Discord Interaction handler.
 *
 * `handle({ headers, rawBody })` returns `{ status, body }` only; the HTTP
 * boundary is responsible for JSON serialization and must use
 * `readDiscordInteractionBody` (or an equivalent raw, bounded reader).
 * No Bot token, Discord REST call, database SQL, or player-selected sender is
 * accepted by this module.
 */
export function createDiscordInteractionHandler({
  publicKey,
  policy,
  identityRepository,
  walletService,
  rateLimiter,
  clock = Date.now,
  maxBodyBytes = 32 * 1024,
  maxTimestampAgeSeconds = 300,
  maxFutureSkewSeconds = 30,
  maxTransferAmount = 1_000_000,
}: {
  publicKey?: unknown;
  policy?: unknown;
  identityRepository?: IdentityRepositoryLike | null;
  walletService?: WalletServiceLike | null;
  rateLimiter?: RateLimiterLike | null;
  clock?: () => number;
  maxBodyBytes?: number;
  maxTimestampAgeSeconds?: number;
  maxFutureSkewSeconds?: number;
  maxTransferAmount?: number;
} = {}): DiscordInteractionHandler {
  const verificationKey = buildPublicKey(publicKey);
  const guilds = normalizePolicy(policy);
  const identities = normalizeIdentityRepository(identityRepository);
  const wallet = normalizeWalletService(walletService);
  const limiter = normalizeRateLimiter(rateLimiter);
  if (typeof clock !== 'function')
    throw new DiscordInteractionConfigError('clock must be a function');
  const bodyLimit = boundedInteger(maxBodyBytes, 'maxBodyBytes', { min: 1, max: MAX_BODY_BYTES });
  const ageLimit = boundedInteger(maxTimestampAgeSeconds, 'maxTimestampAgeSeconds', {
    min: 1,
    max: MAX_TIMESTAMP_AGE_SECONDS,
  });
  const futureSkew = boundedInteger(maxFutureSkewSeconds, 'maxFutureSkewSeconds', {
    min: 0,
    max: MAX_FUTURE_SKEW_SECONDS,
  });
  const transferLimit = boundedInteger(maxTransferAmount, 'maxTransferAmount', {
    min: 1,
    max: MAX_TRANSFER_AMOUNT,
  });

  const signatureIsValid = ({
    headers,
    rawBody,
  }: {
    headers: unknown;
    rawBody: Buffer;
  }): boolean => {
    const body = rawBuffer(rawBody);
    const signature = headerValue(headers, 'x-signature-ed25519');
    const timestamp = headerValue(headers, 'x-signature-timestamp');
    try {
      if (!body || body.length > bodyLimit) return false;
      if (signature === null || !ED25519_SIGNATURE_HEX.test(signature)) return false;
      if (
        timestamp === null ||
        !timestampIsFresh(timestamp, nowMilliseconds(clock), ageLimit, futureSkew)
      )
        return false;
      return verifySignature(
        null,
        Buffer.concat([Buffer.from(timestamp, 'utf8'), body]),
        verificationKey,
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  };

  return Object.freeze({
    async handle({
      headers,
      rawBody,
    }: { headers?: unknown; rawBody?: unknown } = {}): Promise<DiscordInteractionResponse> {
      const body = rawBuffer(rawBody);
      if (!body || body.length > bodyLimit) {
        return body && body.length > bodyLimit
          ? { status: 413, body: { error: 'request body too large' } }
          : invalidSignature();
      }
      if (!signatureIsValid({ headers, rawBody: body })) return invalidSignature();

      // Only past this point has the Ed25519 signature over the exact raw
      // bytes been verified. Only now is it safe to parse the body as JSON
      // and treat any of its fields as anything but `unknown`.
      let interaction: ParsedDiscordInteraction;
      try {
        interaction = parseInteraction(JSON.parse(body.toString('utf8')), transferLimit);
      } catch {
        return invalidInteraction();
      }
      if (interaction.kind === 'ping') return { status: 200, body: { type: RESPONSE_PONG } };

      try {
        authorize(interaction, guilds);
      } catch (error) {
        if (error instanceof DiscordInteractionAuthorizationError) {
          return ephemeral('이 명령어를 사용할 권한이 없습니다.');
        }
        return ephemeral('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      }

      try {
        await consumeRateLimit(limiter, interaction);
      } catch (error) {
        if (error instanceof DiscordRateLimitError)
          return ephemeral('요청이 많습니다. 잠시 후 다시 시도해 주세요.');
        return ephemeral('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      }

      try {
        const actorUserId = await internalUserId(identities, interaction.discordUserId);
        if (!actorUserId)
          return ephemeral(
            '머니버스 계정 연동 또는 최신 약관 동의가 필요합니다. 웹에서 로그인해 확인해 주세요.',
          );

        if (interaction.command === 'balance') {
          const message = balanceMessage(await wallet.overview(actorUserId));
          return message
            ? ephemeral(message)
            : ephemeral('지갑 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
        }
        if (interaction.command === 'history') {
          const message = historyMessage(await wallet.overview(actorUserId));
          return message
            ? ephemeral(message)
            : ephemeral('지갑 기록을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
        }

        const idempotencyKey = receiptKey(interaction.interactionId, interaction.command);
        if (interaction.command === 'daily') {
          const message = dailyMessage(await wallet.claimDaily(actorUserId, { idempotencyKey }));
          return message
            ? ephemeral(message)
            : ephemeral('출석 보상을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
        }

        // The only remaining possibility per parseInteraction's CommandName
        // union; kept explicit so `interaction.options` narrows to the send
        // shape below instead of relying on unreachable-code elimination.
        if (interaction.command !== 'send') throw new DiscordInteractionInputError();

        if (interaction.options.recipientDiscordUserId === interaction.discordUserId) {
          return ephemeral('자신에게는 송금할 수 없습니다.');
        }
        const recipientUserId = await internalUserId(
          identities,
          interaction.options.recipientDiscordUserId,
        );
        if (!recipientUserId)
          return ephemeral('송금을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
        await wallet.transfer(actorUserId, {
          recipientUserId,
          amount: interaction.options.amount,
          idempotencyKey,
        });
        return ephemeral(
          `${interaction.options.amount.toLocaleString('ko-KR')} WLD 송금 요청을 처리했습니다.`,
        );
      } catch {
        // In particular, do not forward database codes, user IDs, balance
        // values, provider subjects, or WalletService error text into Discord.
        return ephemeral('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      }
    },
  });
}
