import dns from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import type { LookupFunction } from 'node:net';
import { Agent } from 'undici';

export class SsrffSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SsrffSecurityError';
  }
}

/**
 * Checks if an IPv4 address falls into private, loopback, link-local, or reserved ranges.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format treated as unsafe
  }

  const [a, b] = parts;
  if (a === undefined || b === undefined) return true;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-Local & Cloud IMDS 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (Private 172.16.0.0 ~ 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 100.64.0.0/10 (CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 224.0.0.0/4 (Multicast 224.0.0.0 ~ 239.255.255.255)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (Reserved / Future use & Broadcast 255.255.255.255)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address falls into loopback, unique local, link-local, or IPv4-mapped private ranges.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // ::1 / :: (Loopback / Unspecified)
  if (normalized === '::1' || normalized === '::' || normalized === '0:0:0:0:0:0:0:1' || normalized === '0:0:0:0:0:0:0:0') {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (normalized.startsWith('::ffff:')) {
    const ipv4Part = normalized.slice(7);
    if (isIP(ipv4Part) === 4) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  // fc00::/7 (Unique Local Address)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  // fe80::/10 (Link-Local)
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }

  // ff00::/8 (Multicast)
  if (normalized.startsWith('ff')) {
    return true;
  }

  return false;
}

const mappedIpv4Range = new BlockList();
mappedIpv4Range.addSubnet('::ffff:0:0', 96, 'ipv6');
// IPv4-compatible addresses are deprecated and can be interpreted inconsistently.
mappedIpv4Range.addSubnet('::', 96, 'ipv6');

/**
 * Validates if an IP address (v4 or v6) is private or reserved.
 */
export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // Non-IP string treated as unsafe by default
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'instance-data',
  '169.254.169.254',
  '0.0.0.0',
  '127.0.0.1',
  '::1',
]);

/**
 * Validates that an outbound URL does not target localhost, private subnets, or cloud metadata endpoints.
 * Resolves DNS to prevent Anti-DNS Rebinding attacks.
 *
 * @throws SsrffSecurityError if the URL is unsafe or points to a private network.
 */
type SafeDestination = { url: URL; addresses: Array<{ address: string; family: 4 | 6 }> };

async function resolveSafeDestination(urlInput: string | URL): Promise<SafeDestination> {
  let parsed: URL;
  try {
    parsed = typeof urlInput === 'string' ? new URL(urlInput) : urlInput;
  } catch {
    throw new SsrffSecurityError('Malformed or invalid URL provided for outbound request');
  }

  // URL userinfo is implicitly interpreted as authentication by HTTP clients.
  // Never allow credentials to travel inside a URL or its redirect target.
  if (parsed.username || parsed.password) {
    throw new SsrffSecurityError('Outbound URL must not contain embedded credentials');
  }

  // 1. Enforce strict protocol whitelist
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SsrffSecurityError(`Forbidden outbound protocol: ${parsed.protocol}. Only http: and https: are allowed.`);
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // 2. Reject blocked hostnames and localhost aliases
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new SsrffSecurityError(`Blocked outbound destination: ${hostname} targets internal network or metadata service.`);
  }

  // 3. If hostname is a direct IP address, inspect it immediately
  const ipLiteral = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
  const ipFamily = isIP(ipLiteral);
  if (ipFamily) {
    if (isPrivateIp(ipLiteral) || (ipFamily === 6 && mappedIpv4Range.check(ipLiteral, 'ipv6'))) {
      throw new SsrffSecurityError(`Blocked outbound destination: IP ${hostname} belongs to a private/reserved address space.`);
    }
    return { url: parsed, addresses: [{ address: ipLiteral, family: ipFamily as 4 | 6 }] };
  }

  // 4. Perform Anti-DNS Rebinding verification: resolve all A & AAAA records
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new SsrffSecurityError(`DNS resolution returned no records for host: ${hostname}`);
    }

    for (const record of addresses) {
      if (isPrivateIp(record.address) || (record.family === 6 && mappedIpv4Range.check(record.address, 'ipv6'))) {
        throw new SsrffSecurityError(
          `SSRF Security Violation: Host ${hostname} resolved to private/internal IP ${record.address}`,
        );
      }
    }
    return { url: parsed, addresses: addresses.map((record) => ({ address: record.address, family: record.family as 4 | 6 })) };
  } catch (error) {
    if (error instanceof SsrffSecurityError) throw error;
    throw new SsrffSecurityError(`DNS resolution failure for host ${hostname}: ${(error as Error).message}`);
  }
}

export async function assertSafeOutboundUrl(urlInput: string | URL): Promise<URL> {
  return (await resolveSafeDestination(urlInput)).url;
}

// The HTTP connector must not perform a second DNS resolution after validation.
function pinnedAgent(destination: SafeDestination): Agent {
  const expectedHost = destination.url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const pinned = destination.addresses;
  const lookup: LookupFunction = (hostname, options, callback) => {
    if (hostname.toLowerCase() !== expectedHost) {
      callback(new Error('SSRF socket hostname differs from validated hostname'), '');
      return;
    }
    const eligible = pinned.filter((entry) => !options.family || options.family === entry.family);
    if (eligible.length === 0) {
      callback(new Error('No validated DNS address matches the requested address family'), '');
      return;
    }
    if (options.all) {
      callback(null, eligible);
    } else {
      callback(null, eligible[0]!.address, eligible[0]!.family);
    }
  };
  return new Agent({ connect: { lookup }, connections: 1, pipelining: 1 });
}

const MAX_REDIRECTS = 3;

// A redirected request must not disclose an API key, session, or request body
// to an origin that the caller did not authorize. Headers accepts all Fetch
// HeadersInit shapes and compares names case-insensitively.
const SENSITIVE_REDIRECT_HEADERS = [
  'authorization', 'proxy-authorization', 'cookie', 'x-api-key',
  'api-key', 'x-auth-token', 'x-access-token', 'x-api-token', 'x-client-secret',
] as const;

function carriesSensitiveOutboundState(init?: RequestInit): boolean {
  const headers = new Headers(init?.headers);
  return SENSITIVE_REDIRECT_HEADERS.some((name) => headers.has(name))
    || init?.body != null
    || (init?.credentials !== undefined && init.credentials !== 'omit');
}

/**
 * Drop-in safe fetch wrapper with strict SSRF validation and default 10s timeout.
 * Inspects all 3xx redirect locations to prevent DNS rebinding or redirect-based SSRF bypass.
 */
export async function safeFetch(urlInput: string | URL, init?: RequestInit): Promise<Response> {
  let destination = await resolveSafeDestination(urlInput);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    let redirectsFollowed = 0;
    while (true) {
      const agent = pinnedAgent(destination);
      let response: Response;
      try {
        response = await fetch(destination.url.toString(), {
          ...init,
          redirect: 'manual',
          signal: init?.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal,
          dispatcher: agent,
        } as unknown as RequestInit);
      } finally {
        // close() waits for the returned Response body to finish without aborting it.
        void agent.close().catch(() => undefined);
      }

      // 3xx Redirect 감지 시 수동 추적 및 전 홉 검증
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectsFollowed += 1;
        if (redirectsFollowed > MAX_REDIRECTS) {
          await response.body?.cancel();
          throw new SsrffSecurityError(`Maximum redirect limit (${MAX_REDIRECTS}) exceeded during outbound request`);
        }

        const location = response.headers.get('location');
        if (!location) {
          return response; // Location 헤더가 없으면 그대로 반환
        }

        await response.body?.cancel();
        // 상대 경로 및 절대 경로 모두 처리
        const nextUrl = new URL(location, destination.url);
        // Never forward bearer keys, cookies, or request bodies to a new origin.
        // Public, credential-free GET redirects remain supported.
        if (nextUrl.origin !== destination.url.origin && carriesSensitiveOutboundState(init)) {
          throw new SsrffSecurityError(
            'Cross-origin redirect refused for credentialed or body-bearing outbound request',
          );
        }
        // Revalidate the destination of every redirect, including URL userinfo.
        destination = await resolveSafeDestination(nextUrl);
        continue;
      }

      return response;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
