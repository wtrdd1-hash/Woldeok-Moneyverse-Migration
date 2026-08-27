import { createServer, type Server } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { OperationError } from './operations';
import type { MinecraftAgentConfig } from './config';

type MinecraftOperationKey = 'status' | 'logs' | 'start' | 'stop' | 'restart';

const ROUTES = Object.freeze({
  GET: Object.freeze({
    '/v1/minecraft/status': 'status',
    '/v1/minecraft/logs': 'logs'
  }),
  POST: Object.freeze({
    '/v1/minecraft/start': 'start',
    '/v1/minecraft/stop': 'stop',
    '/v1/minecraft/restart': 'restart'
  })
} satisfies Record<string, Record<string, MinecraftOperationKey>>);

type ResponseHeaderMap = Record<string, string>;

class RequestError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly headers: ResponseHeaderMap;

  constructor(statusCode: number, code: string, message: string, headers: ResponseHeaderMap = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.headers = headers;
  }
}

interface RateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  readonly max: number;
  readonly windowMs: number;
  readonly entries: Map<string, RateLimitEntry>;

  constructor({ max, windowMs }: { max: number; windowMs: number }) {
    this.max = max;
    this.windowMs = windowMs;
    this.entries = new Map();
  }

  take(key: string, now: number = Date.now()): RateLimitDecision {
    if (this.entries.size > 2048) {
      for (const [candidate, value] of this.entries) {
        if (value.resetAt <= now) this.entries.delete(candidate);
      }
    }
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.count >= this.max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
      };
    }
    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

class MutationCooldown {
  readonly cooldownMs: number;
  nextAllowedAt: number;

  constructor(cooldownMs: number) {
    this.cooldownMs = cooldownMs;
    this.nextAllowedAt = 0;
  }

  take(now: number = Date.now()): RateLimitDecision {
    if (now < this.nextAllowedAt) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((this.nextAllowedAt - now) / 1000))
      };
    }
    this.nextAllowedAt = now + this.cooldownMs;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

function responseHeaders(extra: ResponseHeaderMap = {}): ResponseHeaderMap {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    ...extra
  };
}

export interface AgentResponse {
  writeHead(statusCode: number, headers: ResponseHeaderMap): unknown;
  end(body: string): unknown;
}

function sendJson(response: AgentResponse, statusCode: number, payload: unknown, headers: ResponseHeaderMap = {}): void {
  response.writeHead(statusCode, responseHeaders(headers));
  response.end(JSON.stringify(payload));
}

export interface AgentRequest {
  readonly method?: string | undefined;
  readonly url?: string | undefined;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly socket: { readonly remoteAddress?: string | undefined };
}

function callerAddress(request: AgentRequest): string {
  const address = request.socket.remoteAddress ?? 'unknown';
  return address.startsWith('::ffff:') ? address.slice(7) : address;
}

function hasValidBearerToken(request: AgentRequest, expectedToken: string): boolean {
  const header = request.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const received = Buffer.from(header.slice('Bearer '.length), 'utf8');
  const expected = Buffer.from(expectedToken, 'utf8');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function operationFor(method: string, pathname: string): MinecraftOperationKey | null {
  const routes: Partial<Record<string, Record<string, MinecraftOperationKey>>> = ROUTES;
  return routes[method]?.[pathname] ?? null;
}

function methodExistsFor(pathname: string): boolean {
  return Object.values(ROUTES).some((routes) => Object.hasOwn(routes, pathname));
}

function rejectRequestBody(request: AgentRequest, maxBodyBytes: number): void {
  const lengthHeader = request.headers['content-length'];
  const transferEncoding = request.headers['transfer-encoding'];
  if (transferEncoding) {
    throw new RequestError(413, 'payload_too_large', 'Request bodies are not accepted');
  }
  if (lengthHeader === undefined) return;
  if (typeof lengthHeader !== 'string' || !/^\d+$/.test(lengthHeader)) {
    throw new RequestError(400, 'invalid_content_length', 'Invalid Content-Length header');
  }
  const length = Number(lengthHeader);
  if (length > maxBodyBytes) {
    throw new RequestError(413, 'payload_too_large', 'Request body is too large');
  }
  if (length > 0) {
    throw new RequestError(400, 'request_body_not_allowed', 'Request bodies are not accepted');
  }
}

interface AuditEvent {
  readonly event: string;
  readonly at: string;
  readonly requestId: string;
  readonly clientIp: string;
  readonly method?: string | undefined;
  readonly operation: MinecraftOperationKey | null;
  readonly service?: string | undefined;
  readonly statusCode: number;
  readonly outcome: string;
  readonly durationMs: number;
}

type AuditLog = (event: AuditEvent) => void;

function defaultAuditLog(event: AuditEvent): void {
  process.stdout.write(`${JSON.stringify(event)}\n`);
}

export interface MinecraftOperationsLike {
  execute(operation: string): Promise<unknown>;
}

export interface CreateRequestHandlerOptions {
  config: MinecraftAgentConfig;
  operations: MinecraftOperationsLike;
  auditLog?: AuditLog;
}

export type RequestHandler = (request: AgentRequest, response: AgentResponse) => Promise<void>;

/**
 * Creates the loopback-only HTTP service. The caller must bind it with the
 * validated config host; this module deliberately does not honor proxy headers.
 */
export function createRequestHandler({ config, operations, auditLog = defaultAuditLog }: CreateRequestHandlerOptions): RequestHandler {
  const limiter = new RateLimiter({ max: config.rateLimitMax, windowMs: config.rateLimitWindowMs });
  const mutations = new MutationCooldown(config.mutationCooldownMs);

  return async function handleRequest(request: AgentRequest, response: AgentResponse): Promise<void> {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const clientIp = callerAddress(request);
    let operation: MinecraftOperationKey | null = null;
    let statusCode = 500;
    let outcome = 'error';

    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      if (url.search || url.hash) {
        throw new RequestError(404, 'not_found', 'Unknown endpoint');
      }
      operation = operationFor(request.method ?? '', url.pathname);
      if (!operation) {
        if (methodExistsFor(url.pathname)) {
          throw new RequestError(405, 'method_not_allowed', 'Method is not allowed', { allow: 'GET, POST' });
        }
        throw new RequestError(404, 'not_found', 'Unknown endpoint');
      }
      if (!hasValidBearerToken(request, config.token)) {
        throw new RequestError(401, 'unauthorized', 'Authorization is required', { 'www-authenticate': 'Bearer' });
      }

      rejectRequestBody(request, config.maxBodyBytes);
      const rate = limiter.take(clientIp);
      if (!rate.allowed) {
        throw new RequestError(429, 'rate_limited', 'Too many requests', { 'retry-after': String(rate.retryAfterSeconds) });
      }
      if (['start', 'stop', 'restart'].includes(operation)) {
        const cooldown = mutations.take();
        if (!cooldown.allowed) {
          throw new RequestError(429, 'operation_cooldown', 'A control operation is already in its cooldown period', {
            'retry-after': String(cooldown.retryAfterSeconds)
          });
        }
      }

      const result = await operations.execute(operation);
      statusCode = 200;
      outcome = 'ok';
      sendJson(response, statusCode, {
        requestId,
        ok: true,
        operation,
        result
      });
    } catch (error) {
      const normalized = error instanceof RequestError
        ? error
        : error instanceof OperationError
          ? new RequestError(error.statusCode, error.code, error.message)
          : new RequestError(500, 'internal_error', 'Internal agent error');
      statusCode = normalized.statusCode;
      outcome = normalized.code;
      sendJson(response, statusCode, {
        requestId,
        ok: false,
        error: { code: normalized.code, message: normalized.message }
      }, normalized.headers);
    } finally {
      try {
        auditLog({
          event: 'minecraft_agent_request',
          at: new Date().toISOString(),
          requestId,
          clientIp,
          method: request.method,
          operation,
          service: operation ? config.service : undefined,
          statusCode,
          outcome,
          durationMs: Date.now() - startedAt
        });
      } catch (error) {
        // An audit sink failure must not turn a completed host response into an
        // unhandled rejection. The default sink is stdout, not a network call.
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Minecraft agent audit write failed: ${message}\n`);
      }
    }
  };
}

export function createMinecraftAgent(options: CreateRequestHandlerOptions): Server {
  const config = options.config;
  const server = createServer(createRequestHandler(options));

  server.requestTimeout = Math.max(config.commandTimeoutMs, config.logTimeoutMs) + 5000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  return server;
}

export const __test__ = { hasValidBearerToken, operationFor, rejectRequestBody };
