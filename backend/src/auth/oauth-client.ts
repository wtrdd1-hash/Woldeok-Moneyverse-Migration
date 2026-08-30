import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { OAuthProviderConfig } from '../core/config';
import { sha256 } from './crypto';

const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

/** The credentialed half of OAuthProviderConfig — the only half OAuthClient ever receives. */
type EnabledOAuthProviderConfig = Extract<OAuthProviderConfig, { readonly enabled: true }>;

export class OAuthProviderError extends Error {
  constructor(message = 'OAuth provider authentication failed') {
    super(message);
    this.name = 'OAuthProviderError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function displayName(value: unknown): string {
  const normalized = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.slice(0, 120) || '사용자';
}

interface RequiredStringOptions {
  readonly pattern?: RegExp;
  readonly maxLength?: number;
}

function requiredString(
  value: unknown,
  name: string,
  { pattern, maxLength = 255 }: RequiredStringOptions = {},
): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > maxLength ||
    (pattern && !pattern.test(value))
  ) {
    throw new OAuthProviderError(`OAuth provider returned an invalid ${name}`);
  }
  return value;
}

/**
 * A provider's HTTP JSON response is untrusted until proven otherwise — this
 * only guarantees the body parsed as JSON, not that it is an object with any
 * particular shape.
 */
async function json(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new OAuthProviderError();
  }
}

/** The token-endpoint response fields this client actually reads and validates. */
interface OAuthTokenResponse {
  readonly access_token: string;
  readonly id_token?: string;
}

export interface OAuthIdentity {
  readonly provider: 'discord' | 'google';
  readonly subject: string;
  readonly displayName: string;
}

export interface AuthenticateInput {
  readonly provider: string;
  readonly code: string;
  readonly codeVerifier: string;
  readonly nonceHash: string;
  readonly providerConfig: EnabledOAuthProviderConfig;
  readonly redirectUri: string;
}

export interface OAuthClientOptions {
  readonly fetchImpl?: typeof globalThis.fetch;
  readonly googleJwks?: typeof GOOGLE_JWKS;
  readonly timeoutMs?: number;
}

export class OAuthClient {
  readonly fetch: typeof globalThis.fetch;
  readonly googleJwks: typeof GOOGLE_JWKS;
  readonly timeoutMs: number;

  constructor({
    fetchImpl = globalThis.fetch,
    googleJwks = GOOGLE_JWKS,
    timeoutMs = 10_000,
  }: OAuthClientOptions = {}) {
    if (typeof fetchImpl !== 'function') throw new Error('fetch is required for OAuth');
    this.fetch = fetchImpl;
    this.googleJwks = googleJwks;
    this.timeoutMs = timeoutMs;
  }

  async authenticate({
    provider,
    code,
    codeVerifier,
    nonceHash,
    providerConfig,
    redirectUri,
  }: AuthenticateInput): Promise<OAuthIdentity> {
    const token = await this.#exchangeCode({
      provider,
      code,
      codeVerifier,
      providerConfig,
      redirectUri,
    });
    if (provider === 'discord') return this.#discordIdentity(token);
    if (provider === 'google')
      return this.#googleIdentity(token, nonceHash, providerConfig.clientId);
    throw new OAuthProviderError('Unsupported OAuth provider');
  }

  async #exchangeCode({
    provider,
    code,
    codeVerifier,
    providerConfig,
    redirectUri,
  }: {
    readonly provider: string;
    readonly code: string;
    readonly codeVerifier: string;
    readonly providerConfig: EnabledOAuthProviderConfig;
    readonly redirectUri: string;
  }): Promise<OAuthTokenResponse> {
    const tokenEndpoint =
      provider === 'discord'
        ? 'https://discord.com/api/v10/oauth2/token'
        : 'https://oauth2.googleapis.com/token';
    let response: Response;
    try {
      response = await this.fetch(tokenEndpoint, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
        body: new URLSearchParams({
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          grant_type: 'authorization_code',
          code,
          // The URI the provider itself saw at the authorize step, read back
          // from the stored challenge. RFC 6749 requires the exchange to
          // repeat it exactly, so a deployment answering on two origins must
          // send the one this round trip started on -- not the canonical one.
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });
    } catch {
      throw new OAuthProviderError();
    }
    if (!response.ok) throw new OAuthProviderError();
    const body = await json(response);
    if (!isRecord(body) || typeof body.access_token !== 'string' || body.access_token.length === 0)
      throw new OAuthProviderError();
    const idToken = typeof body.id_token === 'string' ? body.id_token : undefined;
    return idToken === undefined
      ? { access_token: body.access_token }
      : { access_token: body.access_token, id_token: idToken };
  }

  async #discordIdentity(token: OAuthTokenResponse): Promise<OAuthIdentity> {
    let response: Response;
    try {
      response = await this.fetch('https://discord.com/api/v10/users/@me', {
        redirect: 'error',
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: { authorization: `Bearer ${token.access_token}`, accept: 'application/json' },
      });
    } catch {
      throw new OAuthProviderError();
    }
    if (!response.ok) throw new OAuthProviderError();
    const identity = await json(response);
    if (!isRecord(identity)) throw new OAuthProviderError();
    return {
      provider: 'discord',
      subject: requiredString(identity.id, 'subject', { pattern: /^\d{16,22}$/ }),
      displayName: displayName(identity.global_name ?? identity.username),
    };
  }

  async #googleIdentity(
    token: OAuthTokenResponse,
    nonceHash: string,
    clientId: string,
  ): Promise<OAuthIdentity> {
    if (typeof token.id_token !== 'string' || token.id_token.length === 0)
      throw new OAuthProviderError();
    let payload;
    try {
      ({ payload } = await jwtVerify(token.id_token, this.googleJwks, {
        issuer: GOOGLE_ISSUERS,
        audience: clientId,
      }));
    } catch {
      throw new OAuthProviderError();
    }
    if (typeof payload.nonce !== 'string' || sha256(payload.nonce) !== nonceHash)
      throw new OAuthProviderError();
    if (Array.isArray(payload.aud) && payload.azp !== clientId) throw new OAuthProviderError();
    return {
      provider: 'google',
      subject: requiredString(payload.sub, 'subject'),
      displayName: displayName(payload.name ?? payload.given_name),
    };
  }
}
