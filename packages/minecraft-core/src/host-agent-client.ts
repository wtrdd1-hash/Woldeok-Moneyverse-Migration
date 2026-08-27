/**
 * Client for the deliberately restricted host-only Minecraft agent.
 *
 * It is intentionally not constructed from an implicit default.  A normal
 * Docker container's 127.0.0.1 is the container, not the Minecraft host, so
 * this client is unusable in that deployment unless an independently reviewed
 * host-local bridge (or reviewed host networking design) is in place.  Never
 * publish the agent or such a bridge through the public app, reverse proxy, or
 * tunnel.  Callers must enforce authenticated RBAC, approval, and audit rules
 * before invoking this client.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '[::1]']);

type MinecraftHostAgentOperation = 'status' | 'logs' | 'start' | 'stop' | 'restart';

interface MinecraftHostAgentRoute {
  readonly method: 'GET' | 'POST';
  readonly path: string;
}

const OPERATIONS: Readonly<Record<MinecraftHostAgentOperation, MinecraftHostAgentRoute>> =
  Object.freeze({
    status: Object.freeze({ method: 'GET', path: '/v1/minecraft/status' }),
    logs: Object.freeze({ method: 'GET', path: '/v1/minecraft/logs' }),
    start: Object.freeze({ method: 'POST', path: '/v1/minecraft/start' }),
    stop: Object.freeze({ method: 'POST', path: '/v1/minecraft/stop' }),
    restart: Object.freeze({ method: 'POST', path: '/v1/minecraft/restart' }),
  });

function isHostAgentOperation(value: string): value is MinecraftHostAgentOperation {
  return Object.hasOwn(OPERATIONS, value);
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESPONSE_BYTES = 128 * 1024;
const MAX_RESPONSE_BYTES = 1024 * 1024;

export class MinecraftHostAgentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MinecraftHostAgentConfigurationError';
  }
}

/**
 * This error deliberately contains no network, response, endpoint, or token
 * detail.  It is safe for a caller to map to a generic 503 response.
 */
export class MinecraftHostAgentClientError extends Error {
  constructor() {
    super('Minecraft host agent request failed');
    this.name = 'MinecraftHostAgentClientError';
  }
}

function opaqueError(): MinecraftHostAgentClientError {
  return new MinecraftHostAgentClientError();
}

function requiredToken(token: unknown): string {
  if (
    typeof token !== 'string' ||
    token.trim() !== token ||
    Buffer.byteLength(token, 'utf8') < 32
  ) {
    throw new MinecraftHostAgentConfigurationError(
      'Minecraft host agent token must be a trimmed string of at least 32 bytes',
    );
  }
  return token;
}

function boundedInteger(
  value: unknown,
  {
    name,
    fallback,
    minimum,
    maximum,
  }: {
    readonly name: string;
    readonly fallback: number;
    readonly minimum: number;
    readonly maximum: number;
  },
): number {
  const candidate = value === undefined ? fallback : value;
  if (
    typeof candidate !== 'number' ||
    !Number.isSafeInteger(candidate) ||
    candidate < minimum ||
    candidate > maximum
  ) {
    throw new MinecraftHostAgentConfigurationError(
      `${name} must be an integer between ${minimum} and ${maximum}`,
    );
  }
  return candidate;
}

/**
 * Accept only a literal loopback HTTP origin with an explicit non-default port.
 * `localhost` is deliberately rejected: its name resolution can be changed by
 * a host file or DNS configuration, whereas these two literals cannot resolve
 * to a non-loopback destination.
 */
export function parseMinecraftHostAgentEndpoint(endpoint: unknown): string {
  if (typeof endpoint !== 'string' || endpoint.trim() !== endpoint || endpoint.length === 0) {
    throw new MinecraftHostAgentConfigurationError('Minecraft host agent endpoint is required');
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new MinecraftHostAgentConfigurationError(
      'Minecraft host agent endpoint must be an absolute loopback HTTP URL',
    );
  }

  if (
    url.protocol !== 'http:' ||
    !LOOPBACK_HOSTS.has(url.hostname) ||
    !url.port ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new MinecraftHostAgentConfigurationError(
      'Minecraft host agent endpoint must be a literal loopback HTTP origin with an explicit port',
    );
  }

  return url.origin;
}

function isJsonContentType(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const mediaType = value.split(';', 1)[0] ?? '';
  return mediaType.trim().toLowerCase() === 'application/json';
}

function declaredLength(headers: Headers, maximum: number): void {
  const raw = headers.get('content-length');
  if (raw === null) return;
  if (!/^(?:0|[1-9]\d*)$/.test(raw)) throw opaqueError();
  const length = Number(raw);
  if (!Number.isSafeInteger(length) || length > maximum) throw opaqueError();
}

async function cancelBody(response: { body?: ReadableStream<Uint8Array> | null }): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // A response that has already closed does not need further handling.
  }
}

async function readBoundedBody(response: Response, maximum: number): Promise<Uint8Array> {
  if (!response.body || typeof response.body.getReader !== 'function') throw opaqueError();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) throw opaqueError();
      total += value.byteLength;
      if (total > maximum) {
        await reader.cancel();
        throw opaqueError();
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof MinecraftHostAgentClientError) throw error;
    throw opaqueError();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

interface MinecraftHostAgentResult {
  readonly requestId: string;
  readonly operation: string;
  readonly result: unknown;
}

function parseSuccessPayload(bytes: Uint8Array, operation: string): MinecraftHostAgentResult {
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw opaqueError();
  }

  if (
    !isRecord(payload) ||
    Array.isArray(payload) ||
    payload.ok !== true ||
    payload.operation !== operation ||
    typeof payload.requestId !== 'string' ||
    payload.requestId.length === 0 ||
    !Object.hasOwn(payload, 'result')
  ) {
    throw opaqueError();
  }

  return Object.freeze({
    requestId: payload.requestId,
    operation,
    result: payload.result,
  });
}

type MinecraftAgentFetchImpl = (url: string, init: RequestInit) => Promise<Response>;

type MinecraftHostAgentOperationUrls = Readonly<
  Record<MinecraftHostAgentOperation, MinecraftHostAgentRoute & { readonly url: string }>
>;

function buildOperationUrls(origin: string): MinecraftHostAgentOperationUrls {
  return Object.freeze({
    status: Object.freeze({
      ...OPERATIONS.status,
      url: new URL(OPERATIONS.status.path, origin).toString(),
    }),
    logs: Object.freeze({
      ...OPERATIONS.logs,
      url: new URL(OPERATIONS.logs.path, origin).toString(),
    }),
    start: Object.freeze({
      ...OPERATIONS.start,
      url: new URL(OPERATIONS.start.path, origin).toString(),
    }),
    stop: Object.freeze({
      ...OPERATIONS.stop,
      url: new URL(OPERATIONS.stop.path, origin).toString(),
    }),
    restart: Object.freeze({
      ...OPERATIONS.restart,
      url: new URL(OPERATIONS.restart.path, origin).toString(),
    }),
  });
}

function requireFetchImpl(fetchImpl: unknown): MinecraftAgentFetchImpl {
  if (typeof fetchImpl !== 'function') {
    throw new MinecraftHostAgentConfigurationError('A fetch implementation is required');
  }
  // Invariant: a runtime check can only confirm fetchImpl is callable, not its
  // call signature. The only call sites are this constructor's default
  // (globalThis.fetch, which matches exactly) and this module's own test
  // doubles, which fetch()-shaped code has always relied on being honest.
  return fetchImpl as MinecraftAgentFetchImpl;
}

interface MinecraftHostAgentClientOptions {
  endpoint?: unknown;
  token?: unknown;
  timeoutMs?: unknown;
  maxResponseBytes?: unknown;
  fetchImpl?: unknown;
}

/**
 * A closed client for the five routes exposed by minecraft-agent.  It has no
 * facility for caller-provided URL paths, methods, bodies, headers, or shell
 * commands.
 */
export class MinecraftHostAgentClient {
  readonly fetchImpl: MinecraftAgentFetchImpl;
  readonly token: string;
  readonly timeoutMs: number;
  readonly maxResponseBytes: number;
  readonly operationUrls: MinecraftHostAgentOperationUrls;

  constructor({
    endpoint,
    token,
    timeoutMs,
    maxResponseBytes,
    fetchImpl = globalThis.fetch,
  }: MinecraftHostAgentClientOptions = {}) {
    this.fetchImpl = requireFetchImpl(fetchImpl);

    const origin = parseMinecraftHostAgentEndpoint(endpoint);
    this.token = requiredToken(token);
    this.timeoutMs = boundedInteger(timeoutMs, {
      name: 'Minecraft host agent timeout',
      fallback: DEFAULT_TIMEOUT_MS,
      minimum: 250,
      maximum: 60_000,
    });
    this.maxResponseBytes = boundedInteger(maxResponseBytes, {
      name: 'Minecraft host agent maximum response size',
      fallback: DEFAULT_MAX_RESPONSE_BYTES,
      minimum: 1024,
      maximum: MAX_RESPONSE_BYTES,
    });
    this.operationUrls = buildOperationUrls(origin);
  }

  async execute(operation: unknown): Promise<MinecraftHostAgentResult> {
    if (typeof operation !== 'string' || !isHostAgentOperation(operation)) throw opaqueError();
    const route = this.operationUrls[operation];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(route.url, {
        method: route.method,
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${this.token}`,
        },
        redirect: 'error',
        signal: controller.signal,
      });

      if (
        !response ||
        response.status !== 200 ||
        !response.headers ||
        !isJsonContentType(response.headers.get('content-type'))
      ) {
        await cancelBody(response ?? {});
        throw opaqueError();
      }
      declaredLength(response.headers, this.maxResponseBytes);
      return parseSuccessPayload(await readBoundedBody(response, this.maxResponseBytes), operation);
    } catch (error) {
      if (error instanceof MinecraftHostAgentClientError) throw error;
      throw opaqueError();
    } finally {
      clearTimeout(timer);
    }
  }
}

export const __test__ = { OPERATIONS, isJsonContentType, readBoundedBody };
