import { createHash, randomBytes } from 'node:crypto';

export type OAuthProvider = 'discord' | 'google';

const base64url = (value: Buffer): string => value.toString('base64url');

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export const randomToken = (): string => base64url(randomBytes(32));

export const pkceChallenge = (verifier: string): string =>
  createHash('sha256').update(verifier).digest('base64url');

export interface OAuthChallenge {
  readonly provider: OAuthProvider;
  readonly state: string;
  readonly stateHash: string;
  readonly codeVerifier: string;
  readonly codeChallenge: string;
  readonly nonce: string;
  readonly nonceHash: string;
  readonly redirectUri: string;
}

/**
 * State and nonce are returned in the clear for this request only; the
 * database stores their hashes. The code verifier is the secret half of PKCE
 * and never leaves the server — only `codeChallenge` travels to the provider.
 */
export function createOAuthChallenge(provider: OAuthProvider, redirectUri: string): OAuthChallenge {
  const state = randomToken();
  const verifier = randomToken();
  const nonce = randomToken();
  return {
    provider,
    state,
    stateHash: sha256(state),
    codeVerifier: verifier,
    codeChallenge: pkceChallenge(verifier),
    nonce,
    nonceHash: sha256(nonce),
    redirectUri,
  };
}

export function authorizationUrl(
  provider: OAuthProvider,
  challenge: OAuthChallenge,
  clientId: string,
): string {
  const endpoint =
    provider === 'discord'
      ? 'https://discord.com/oauth2/authorize'
      : 'https://accounts.google.com/o/oauth2/v2/auth';
  const scope = provider === 'discord' ? 'identify' : 'openid profile';
  const url = new URL(endpoint);
  const parameters = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: challenge.redirectUri,
    scope,
    state: challenge.state,
    code_challenge: challenge.codeChallenge,
    code_challenge_method: 'S256',
  };
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  if (provider === 'google') url.searchParams.set('nonce', challenge.nonce);
  return url.toString();
}
